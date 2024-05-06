// server.js
require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const bodyParser = require("body-parser");
const sequelize = require("./config/database"); // Import Sequelize instance

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
const carRoutes = require("./routes/carRoutes");
app.use("/api/cars", carRoutes);
const bookedCarRoutes = require("./routes/bookedCarRoutes");
app.use("/api/booked-cars", bookedCarRoutes);
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

// Start server
const PORT = 3001;
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
