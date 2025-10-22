// models/guestRequest.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const GuestRequest = sequelize.define('GuestRequest', {
  request_id: {
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
  guest_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'guest_profiles',
      key: 'guest_id'
    }
  },
  request_type: {
    type: DataTypes.ENUM('room_service', 'housekeeping', 'maintenance', 'amenity', 'wake_up_call', 'transportation', 'concierge', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    comment: 'staff user_id',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  requested_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  scheduled_time: {
    type: DataTypes.DATE
  },
  completed_time: {
    type: DataTypes.DATE
  },
  additional_charges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT
  },
  staff_notes: {
    type: DataTypes.TEXT
  },
  rating: {
    type: DataTypes.INTEGER,
    comment: '1-5 rating'
  },
  feedback: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'guest_requests',
  timestamps: false
});

module.exports = GuestRequest;