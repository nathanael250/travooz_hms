const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RoomBooking = sequelize.define('RoomBooking', {
  booking_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'bookings',
      key: 'booking_id'
    }
  },
  room_type_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'room_types',
      key: 'room_type_id'
    },
    comment: 'Type of room booked (e.g., Deluxe, Suite)'
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    },
    comment: 'Specific room unit assigned (NULL if not yet assigned)'
  },
  check_in_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_out_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  nights: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  room_price_per_night: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_room_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  homestay_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  guest_name: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  guest_email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  guest_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  guest_id_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  guest_id_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  number_of_adults: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  number_of_children: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  early_checkin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  late_checkout: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  early_checkin_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  late_checkout_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  extra_bed_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  extra_bed_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  service_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  final_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  deposit_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  internal_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  multi_room_booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'multi_room_bookings',
      key: 'multi_room_booking_id'
    }
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
  tableName: 'room_bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = RoomBooking;