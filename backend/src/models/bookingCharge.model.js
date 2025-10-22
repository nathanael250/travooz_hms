const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const BookingCharge = sequelize.define('BookingCharge', {
  charge_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'charge_id'
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'booking_id'
    }
  },
  charge_type: {
    type: DataTypes.ENUM('room', 'minibar', 'room_service', 'laundry', 'phone', 'parking', 'extra_bed', 'early_checkin', 'late_checkout', 'damage', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  charged_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'charged_at'
  },
  charged_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    },
    comment: 'staff user_id'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'booking_charges',
  timestamps: false,
  underscored: true
});

module.exports = BookingCharge;