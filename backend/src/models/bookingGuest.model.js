const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const BookingGuest = sequelize.define('BookingGuest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
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
    allowNull: false,
    references: {
      model: 'guest_profiles',
      key: 'guest_id'
    }
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Primary guest for the booking'
  },
  room_assignment: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Which room unit'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'booking_guests',
  timestamps: false, // Only created_at
  underscored: true
});

module.exports = BookingGuest;