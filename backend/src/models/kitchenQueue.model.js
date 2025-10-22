const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const KitchenQueue = sequelize.define('KitchenQueue', {
  queue_id: {
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
  order_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'order_items',
      key: 'order_item_id'
    }
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Higher number = higher priority'
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served'),
    defaultValue: 'pending'
  },
  assigned_chef: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completion_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimated_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated time in minutes'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'hotel_kitchen_queue',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = KitchenQueue;
