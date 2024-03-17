// models/BookedCar.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Booking = require("./booking");
const Car = require("./car");

const BookedCar = sequelize.define("BookedCar", {
  booked_cars_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Booking, // 'Movies' would also work
    },
  },
  car_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Car, // 'Actors' would also work
    },
  },
});

module.exports = BookedCar;
