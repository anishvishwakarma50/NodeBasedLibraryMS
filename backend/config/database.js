const { Sequelize } = require('sequelize');
require('dotenv').config();

// For development, we'll use SQLite instead of MySQL for easier setup
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: './database.sqlite',
//   logging: process.env.NODE_ENV === 'development' ? console.log : false,
//   define: {
//     timestamps: true,
//     underscored: true,
//   },
// });

// Uncomment below for MySQL configuration when ready

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    }
  }
);


module.exports = { sequelize };

