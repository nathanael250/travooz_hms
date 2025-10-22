// models/roomAssignment.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RoomAssignment = sequelize.define('RoomAssignment', {
  assignment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'booking_id'
    }
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    },
    comment: 'Specific room unit assigned'
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'staff user_id who assigned (NULL for automatic assignment)'
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  check_out_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_checkout_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  key_card_issued: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('assigned', 'checked_in', 'checked_out', 'cancelled', 'reassigned'),
    defaultValue: 'assigned'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'room_assignments',
  timestamps: false
});

module.exports = RoomAssignment;