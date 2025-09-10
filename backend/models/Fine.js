const { DataTypes } = require('sequelize');
const sequelize = require("../config/database").sequelize;

const Fine = sequelize.define('Fine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  issued_book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'issued_books',
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  days_overdue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  fine_rate_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 5.00 // ₹5 per day default fine rate
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'waived'),
    defaultValue: 'pending'
  },
  paid_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'fines',
  timestamps: true
});

module.exports = Fine;