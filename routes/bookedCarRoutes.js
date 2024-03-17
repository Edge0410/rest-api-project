const express = require("express");
const router = express.Router();
const { BookedCar } = require("../models");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");

/**
 * @swagger
 * tags:
 *   name: Booked Cars
 *   description: Booked car management endpoints
 */

/**
 * @swagger
 * /api/booked-cars:
 *   post:
 *     summary: Book a car
 *     tags: [Booked Cars]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               booking_id:
 *                 type: integer
 *               car_id:
 *                 type: integer
 *     responses:
 *       '201':
 *         description: Created
 *       '500':
 *         description: Failed to book car
 */
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { booking_id, car_id } = req.body;
    const bookedCar = await BookedCar.create({ booking_id, car_id });
    res.status(201).json(bookedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to book car" });
  }
});

/**
 * @swagger
 * /api/booked-cars:
 *   get:
 *     summary: Get all booked cars
 *     security:
 *       - BearerAuth: []
 *     tags: [Booked Cars]
 *     responses:
 *       '200':
 *         description: Success
 *       '500':
 *         description: Failed to fetch booked cars
 */
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const bookedCars = await BookedCar.findAll();
    res.json(bookedCars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch booked cars" });
  }
});

/**
 * @swagger
 * /api/booked-cars/{id}:
 *   get:
 *     summary: Get a booked car by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Booked Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the booked car to get
 *     responses:
 *       '200':
 *         description: Success
 *       '404':
 *         description: Booked car not found
 *       '500':
 *         description: Failed to fetch booked car
 */
router.get("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const bookedCar = await BookedCar.findByPk(id);
    if (!bookedCar) {
      return res.status(404).json({ error: "Booked car not found" });
    }
    res.json(bookedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch booked car" });
  }
});

/**
 * @swagger
 * /api/booked-cars/{id}:
 *   put:
 *     summary: Update a booked car by ID
 *     tags: [Booked Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the booked car to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               booking_id:
 *                 type: integer
 *               car_id:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Success
 *       '404':
 *         description: Booked car not found
 *       '500':
 *         description: Failed to update booked car
 */
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_id, car_id } = req.body;
    const bookedCar = await BookedCar.findByPk(id);
    if (!bookedCar) {
      return res.status(404).json({ error: "Booked car not found" });
    }
    bookedCar.booking_id = booking_id;
    bookedCar.car_id = car_id;
    await bookedCar.save();
    res.json(bookedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update booked car" });
  }
});

/**
 * @swagger
 * /api/booked-cars/{id}:
 *   delete:
 *     summary: Delete a booked car by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Booked Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the booked car to delete
 *     responses:
 *       '204':
 *         description: No content
 *       '404':
 *         description: Booked car not found
 *       '500':
 *         description: Failed to delete booked car
 */
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const bookedCar = await BookedCar.findByPk(id);
    if (!bookedCar) {
      return res.status(404).json({ error: "Booked car not found" });
    }
    await bookedCar.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete booked car" });
  }
});

module.exports = router;
