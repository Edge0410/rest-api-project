// models/BookedCar.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookedCar = sequelize.define('BookedCar', {
  booked_cars_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
});

module.exports = BookedCar;
