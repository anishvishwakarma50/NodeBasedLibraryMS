const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;
const bcrypt = require('bcryptjs');

const Student = sequelize.define('Student', {
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
  student_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  semester: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  enrollment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  max_books_allowed: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  }
}, {
  tableName: 'students',
  timestamps: true,
  hooks: {
    beforeCreate: async (student) => {
      if (student.password) {
        student.password = await bcrypt.hash(student.password, 12);
      }
    },
    beforeUpdate: async (student) => {
      if (student.changed('password')) {
        student.password = await bcrypt.hash(student.password, 12);
      }
    }
  }
});

// Instance method to check password
Student.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Student;

