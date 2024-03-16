// models/Car.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Car = sequelize.define('Car', {
  carId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  engine_capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  engine_type: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Car;
