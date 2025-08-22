const { DataTypes } = require('sequelize');
const sequelize = require("../config/database").sequelize;

const SuggestedBook = sequelize.define('SuggestedBook', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  publisher: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'librarians',
      key: 'id'
    }
  },
  review_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'suggested_books',
  timestamps: true
});

module.exports = SuggestedBook;

