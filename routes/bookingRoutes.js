const express = require("express");
const router = express.Router();
const { Booking, User, BookedCar } = require("../models");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");
const isValidDateFormatBody = require("../middleware/isValidDateFormatBody");

const { Op } = require("sequelize");

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     security:
 *       - BearerAuth: []
 *     tags: [Bookings]
 *     responses:
 *       '200':
 *         description: Success
 *       '500':
 *         description: Failed to fetch bookings
 */
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/**
 * @swagger
 * /api/bookings/{userId}/bookings:
 *   get:
 *     summary: Get all bookings for a user
 *     security:
 *       - BearerAuth: []
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to get bookings for
 *     responses:
 *       '200':
 *         description: Success
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Failed to fetch bookings
 */
router.get("/:userId/bookings", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.userId != userId && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized: User is not an admin" });
    }
    // Assuming you have a User model with a bookings association
    const user = await User.findByPk(userId, { include: Booking });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.Bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               cars:
 *                 type: array
 *                 items:
 *                   type: integer
 *               checkin_date:
 *                 type: string
 *                 format: date
 *               checkout_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Some cars are already booked for the specified date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 unavailableCars:
 *                   type: array
 *                   items:
 *                     type: integer
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Failed to create booking
 */

router.post("/", isAuthenticated, isValidDateFormatBody, async (req, res) => {
  try {
    const { user_id, cars, checkin_date, checkout_date } = req.body;

    if(req.user.userId != user_id && req.user.role !== 'Admin'){
      return res.status(403).json({ error: "Unauthorized: User is not an admin" });
    }

    // Step 1: Validate user ID
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 2: Check if each car is available for booking
    const unavailableCars = [];
    for (const carId of cars) {
      const existingBooking = await BookedCar.findOne({
        include: [
          {
            model: Booking,
            attributes: ["checkin_date", "checkout_date"],
            where: {
              [Op.or]: [
                {
                  checkin_date: {
                    [Op.between]: [checkin_date, checkout_date],
                  },
                },
                {
                  checkout_date: {
                    [Op.between]: [checkin_date, checkout_date],
                  },
                },
                {
                  [Op.and]: [
                    { checkin_date: { [Op.lte]: checkin_date } },
                    { checkout_date: { [Op.gte]: checkout_date } },
                  ],
                },
              ],
            },
          },
        ],
        where: { car_id: carId },
      });

      if (existingBooking) {
        unavailableCars.push(carId);
      }
    }

    if (unavailableCars.length > 0) {
      return res.status(400).json({
        error: "Some cars are already booked for the specified date range",
        unavailableCars,
      });
    }

    // Step 3: Create the booking and associate the cars
    const booking = await Booking.create({
      user_id,
      checkin_date,
      checkout_date,
      price: 150,
    });

    await Promise.all(
      cars.map((carId) =>
        BookedCar.create({ booking_id: booking.booking_id, car_id: carId })
      )
    );

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the booking to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               checkin_date:
 *                 type: string
 *                 format: date
 *               checkout_date:
 *                 type: string
 *                 format: date
 *               price:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Success
 *       '404':
 *         description: Booking not found
 *       '500':
 *         description: Failed to update booking
 */
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, checkin_date, checkout_date, price } = req.body;
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    booking.user_id = user_id;
    booking.checkin_date = checkin_date;
    booking.checkout_date = checkout_date;
    booking.price = price;
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the booking to delete
 *     responses:
 *       '204':
 *         description: No content
 *       '404':
 *         description: Booking not found
 *       '500':
 *         description: Failed to delete booking
 */
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    await booking.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

module.exports = router;
