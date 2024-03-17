// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created
 *       '500':
 *         description: Failed to create user
 */

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(password);
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "User",
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     responses:
 *       '200':
 *         description: Success
 *       '500':
 *         description: Failed to fetch users
 */

// Get all users
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to get
 *     responses:
 *       '200':
 *         description: Success
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Failed to fetch user
 */

// Get a user by ID
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    if(req.user.userId != id && req.user.role !== 'Admin'){
      return res.status(403).json({ error: "Unauthorized: User is not an admin" });
    }
    const user = await User.findByPk(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Success
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Failed to update user
 */

// Update a user
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    if(req.user.userId != id && req.user.role !== 'Admin'){
      return res.status(403).json({ error: "Unauthorized: User is not an admin" });
    }
    const { username, email, password, role } = req.body;

    const user = await User.findByPk(id);
    if (user) {
      // Update user attributes
      user.username = username;
      user.email = email;
      user.role = role;

      // Hash the new password if provided
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();

      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       '204':
 *         description: No content
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Failed to delete user
 */

// Delete a user
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    if(req.user.userId != id && req.user.role !== 'Admin'){
      return res.status(403).json({ error: "Unauthorized: User is not an admin" });
    }
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
