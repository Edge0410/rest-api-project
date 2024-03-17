// models/index.js
const User = require("./user");
const Booking = require("./booking");
const Car = require("./car");
const BookedCar = require("./booked_cars");

User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Booking.belongsToMany(Car, { through: BookedCar, foreignKey: "booking_id" });
Car.belongsToMany(Booking, { through: BookedCar, foreignKey: "car_id" });

Booking.hasMany(BookedCar, { foreignKey: "booking_id" });
Car.hasMany(BookedCar, { foreignKey: "car_id" });

BookedCar.belongsTo(Booking, { foreignKey: "booking_id" });
BookedCar.belongsTo(Car, { foreignKey: "car_id" });

module.exports = { User, Booking, Car, BookedCar };
