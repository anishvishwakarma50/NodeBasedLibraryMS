const { DataTypes } = require('sequelize');
const sequelize = require("../config/database").sequelize;

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    allowNull: true,
    unique: true
  },
  edition: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  publisher: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  publication_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  total_copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  available_copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  digital_copy_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cover_image_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'books',
  timestamps: true
});

module.exports = Book;

