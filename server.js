// server.js
require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const sequelize = require("./config/database"); // Import Sequelize instance
const { User, Booking, Car, BookedCar } = require("./models"); // Import Sequelize models

const app = express();

// Swagger setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rent-a-car API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          in: "header",
        },
      },
    },
    security: [],
  },
  apis: ["./routes/*.js"],
};
const specs = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Middleware
app.use(bodyParser.json());

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 3001;
sequelize
  .sync() // Synchronize models with the database
  .then(() => {
    console.log("Database synchronized");
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database synchronization failed:", error);
  });
