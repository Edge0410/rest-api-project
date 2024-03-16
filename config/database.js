const { Sequelize } = require('sequelize');

// Initialize Sequelize with your database connection details
const sequelize = new Sequelize({
  dialect: 'mysql', // or any other dialect
  host: 'localhost', // your database host
  port: 3306, // your database port
  username: 'root', // your database username
  password: '12345678', // your database password
  database: 'rent_a_car', // your database name
});

// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection(); // You can remove this line if you want to disable the connection test

module.exports = sequelize;
