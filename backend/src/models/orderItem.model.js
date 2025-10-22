const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'restaurant_orders',
      key: 'order_id'
    }
  },
  menu_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'menu_items',
      key: 'item_id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'cancelled'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'hotel_order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OrderItem;
