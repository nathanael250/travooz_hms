const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ExternalBooking = sequelize.define('ExternalBooking', {
  external_booking_record_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  platform: {
    type: DataTypes.ENUM('booking.com', 'airbnb', 'expedia', 'agoda', 'hotels.com', 'trivago', 'priceline', 'kayak', 'other'),
    allowNull: false
  },
  external_booking_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  external_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Raw booking data from OTA platform'
  },
  external_guest_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  external_status: {
    type: DataTypes.ENUM('confirmed', 'pending', 'cancelled', 'completed'),
    defaultValue: 'confirmed'
  },
  internal_booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'booking_id'
    }
  },
  sync_status: {
    type: DataTypes.ENUM('pending', 'synced', 'failed'),
    defaultValue: 'pending'
  },
  synced_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  synced_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  commission_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'OTA commission percentage'
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'OTA commission amount'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'external_bookings',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ExternalBooking;