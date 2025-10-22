const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MultiRoomBooking = sequelize.define('MultiRoomBooking', {
  group_booking_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'group_booking_id'
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'booking_id'
    },
    comment: 'Main booking ID'
  },
  room_booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'room_bookings',
      key: 'booking_id'
    },
    comment: 'Individual room booking'
  },
  group_name: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  is_master_booking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'multi_room_bookings',
  timestamps: false,
  underscored: true
});

module.exports = MultiRoomBooking;