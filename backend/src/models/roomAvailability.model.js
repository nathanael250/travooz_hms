const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RoomAvailability = sequelize.define('RoomAvailability', {
  availability_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'availability_id'
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  available_units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  min_stay: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  max_stay: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  closed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true
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
  tableName: 'room_availability',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['inventory_id', 'date']
    }
  ]
});

module.exports = RoomAvailability;