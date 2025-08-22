const { DataTypes } = require('sequelize');
const sequelize = require("../config/database").sequelize;

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration_years: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'courses',
  timestamps: true
});

module.exports = Course;

