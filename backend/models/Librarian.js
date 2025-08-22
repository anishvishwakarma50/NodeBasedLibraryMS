const { DataTypes } = require('sequelize');
const sequelize = require("../config/database").sequelize;
const bcrypt = require('bcryptjs');

const Librarian = sequelize.define('Librarian', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  employee_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  role: {
    type: DataTypes.ENUM('librarian', 'admin'),
    defaultValue: 'librarian'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'librarians',
  timestamps: true,
  hooks: {
    beforeCreate: async (librarian) => {
      if (librarian.password) {
        librarian.password = await bcrypt.hash(librarian.password, 12);
      }
    },
    beforeUpdate: async (librarian) => {
      if (librarian.changed('password')) {
        librarian.password = await bcrypt.hash(librarian.password, 12);
      }
    }
  }
});

// Instance method to check password
Librarian.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Librarian;

