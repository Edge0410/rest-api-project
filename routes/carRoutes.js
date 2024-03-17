const express = require("express");
const router = express.Router();
const { Car, BookedCar, Booking } = require("../models");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");
const isValidCar = require("../middleware/isValidCar");
const isValidDateFormat = require("../middleware/isValidDateFormat");
const { Op } = require("sequelize");

/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car management endpoints
 */

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Create a new car
 *     security:
 *       - BearerAuth: []
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               engine_capacity:
 *                 type: number
 *               engine_type:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created
 *       '500':
 *         description: Failed to create car
 */

router.post("/", isAuthenticated, isAdmin, isValidCar, async (req, res) => {
  try {
    const { brand, model, engine_capacity, engine_type } = req.body;
    const car = await Car.create({
      brand,
      model,
      engine_capacity,
      engine_type,
    });
    res.status(201).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create car" });
  }
});

/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     responses:
 *       '200':
 *         description: Success
 *       '500':
 *         description: Failed to fetch cars
 */
router.get("/", async (req, res) => {
  try {
    const cars = await Car.findAll();
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

/**
 * @swagger
 * /api/cars/available:
 *   get:
 *     summary: Get all cars available for a check-in and check-out date
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: checkin_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Check-in date
 *       - in: query
 *         name: checkout_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Check-out date
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       '500':
 *         description: Failed to fetch available cars
 */

router.get("/available", isValidDateFormat, async (req, res) => {
  try {
    const { checkin_date, checkout_date } = req.query;

    // Query for cars available for the specified date range
    const availableCars = await Car.findAll({
      include: [
        {
          model: BookedCar,
          include: {
            model: Booking,
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
          required: false, // Use 'false' to perform LEFT JOIN
        },
      ],
      where: {
        "$BookedCars.booked_cars_id$": null, // Filter out cars with booked dates
      },
    });

    res.json(availableCars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch available cars" });
  }
});

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Get a car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the car to get
 *     responses:
 *       '200':
 *         description: Success
 *       '404':
 *         description: Car not found
 *       '500':
 *         description: Failed to fetch car
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findByPk(id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch car" });
  }
});

/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Update a car by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the car to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               engine_capacity:
 *                 type: number
 *               engine_type:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Success
 *       '404':
 *         description: Car not found
 *       '500':
 *         description: Failed to update car
 */

router.put("/:id", isAuthenticated, isAdmin, isValidCar, async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, engine_capacity, engine_type } = req.body;
    console.log(req.params);
    console.log(req.body);

    const car = await Car.findByPk(id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    car.brand = brand;
    car.model = model;
    car.engine_capacity = engine_capacity;
    car.engine_type = engine_type;

    await car.save();
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update car" });
  }
});

/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the car to delete
 *     responses:
 *       '204':
 *         description: No content
 *       '404':
 *         description: Car not found
 *       '500':
 *         description: Failed to delete car
 */
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findByPk(id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    await car.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete car" });
  }
});

module.exports = router;
