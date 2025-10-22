const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const BookingModification = sequelize.define('BookingModification', {
  modification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'modification_id'
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'booking_id'
    }
  },
  modified_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    },
    comment: 'user_id or staff_id'
  },
  modification_type: {
    type: DataTypes.ENUM('date_change', 'room_change', 'guest_change', 'cancellation', 'amount_change', 'status_change', 'other'),
    allowNull: false
  },
  old_value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON of old values'
  },
  new_value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON of new values'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  additional_charges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'booking_modifications',
  timestamps: false,
  underscored: true
});

module.exports = BookingModification;