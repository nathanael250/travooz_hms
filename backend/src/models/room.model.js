const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Room = sequelize.define('Room', {
  inventory_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'inventory_id'
  },
  room_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'room_types',
      key: 'room_type_id'
    }
  },
  unit_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g., 101, 102, A1, B2'
  },
  floor: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance', 'out_of_order', 'cleaning'),
    defaultValue: 'available'
  },
  last_cleaned: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_maintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
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
  tableName: 'room_inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = Room;