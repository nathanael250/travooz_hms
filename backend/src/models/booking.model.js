// models/booking.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Booking = sequelize.define('Booking', {
  booking_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service_type: {
    type: DataTypes.ENUM('homestay', 'restaurant_table', 'tour_package', 'food_order', 'room', 'car_rental', 'activity'),
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  order_status: {
    type: DataTypes.ENUM('received', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'),
    allowNull: true
  },
  booking_reference: {
    type: DataTypes.STRING(50),
    comment: 'Unique booking reference code'
  },
  booking_source: {
    type: DataTypes.ENUM('website', 'mobile_app', 'phone', 'email', 'walk_in', 'agent', 'ota'),
    defaultValue: 'website'
  },
  special_requests: {
    type: DataTypes.TEXT
  },
  cancellation_reason: {
    type: DataTypes.TEXT
  },
  cancelled_at: {
    type: DataTypes.DATE
  },
  cancelled_by: {
    type: DataTypes.INTEGER,
    comment: 'user_id who cancelled'
  },
  confirmed_at: {
    type: DataTypes.DATE
  },
  completed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Booking;