const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RestaurantOrder = sequelize.define('RestaurantOrder', {
  order_id: {
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
    allowNull: true
  },
  table_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'restaurant_tables',
      key: 'table_id'
    }
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Room number for room service',
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  order_type: {
    type: DataTypes.ENUM('dine_in', 'room_service', 'takeaway'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  delivery_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  special_instructions: {
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
  }
}, {
  tableName: 'hotel_restaurant_orders',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = RestaurantOrder;
