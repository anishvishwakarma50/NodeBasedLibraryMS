const { DataTypes } = require('sequelize');
const sequelize = require("../config/database").sequelize;

const IssuedBook = sequelize.define('IssuedBook', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  },
  librarian_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'librarians',
      key: 'id'
    }
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fine_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('issued', 'returned', 'overdue', 'lost'),
    defaultValue: 'issued'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'issued_books',
  timestamps: true
});

module.exports = IssuedBook;

