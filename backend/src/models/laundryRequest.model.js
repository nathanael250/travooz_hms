const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const LaundryRequest = sequelize.define('LaundryRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  homestay_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'homestays',
      key: 'homestay_id'
    }
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'inventory_id from room_inventory',
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  request_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  pickup_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivery_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'picked_up',
      'washing',
      'drying',
      'ironing',
      'ready',
      'delivered',
      'cancelled'
    ),
    defaultValue: 'pending'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  picked_up_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Staff user_id',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  delivered_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Staff user_id',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'billed_to_room'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'laundry_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LaundryRequest;
