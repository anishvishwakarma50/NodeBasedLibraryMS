const { DataTypes } = require('sequelize');
const sequelize = require("../config/database").sequelize;

const FineConfig = sequelize.define('FineConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fine_rate_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 5.00
  },
  grace_period_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  max_fine_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'librarians',
      key: 'id'
    }
  }
}, {
  tableName: 'fine_configs',
  timestamps: true
});

module.exports = FineConfig;