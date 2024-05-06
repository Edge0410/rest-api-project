const { Sequelize } = require('sequelize');

// Initialize Sequelize with database connection details using mysql dialect
const sequelize = new Sequelize({
  dialect: 'mysql', 
  host: 'localhost',
  port: 3306, 
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: 'rent_a_car',
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

testConnection(); 

module.exports = sequelize;
