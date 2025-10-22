const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const OrderDeliveryInfo = sequelize.define('OrderDeliveryInfo', {
  delivery_info_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'delivery_info_id'
  },
  delivery_id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('delivery_info_id');
    }
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'restaurant_orders',
      key: 'order_id'
    }
  },
  order_type: {
    type: DataTypes.ENUM('dine_in', 'room_service', 'takeaway', 'delivery', 'pickup'),
    allowNull: false,
    field: 'order_type'
  },
  delivery_type: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('order_type');
    }
  },
  room_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  table_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  delivery_status: {
    type: DataTypes.ENUM('pending', 'in_transit', 'delivered', 'failed'),
    defaultValue: 'pending'
  },
  delivered_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivery_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'hotel_order_delivery_info',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OrderDeliveryInfo;
