const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RoomRate = sequelize.define('RoomRate', {
  rate_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'rate_id'
  },
  room_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'room_types',
      key: 'room_type_id'
    }
  },
  rate_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  rate_type: {
    type: DataTypes.ENUM('base', 'seasonal', 'weekend', 'holiday', 'promotional', 'last_minute'),
    defaultValue: 'base'
  },
  price_per_night: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  min_nights: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  max_nights: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  days_of_week: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Comma-separated days: MON,TUE,WED,THU,FRI,SAT,SUN'
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Higher priority rates override lower priority ones'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'room_rates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = RoomRate;