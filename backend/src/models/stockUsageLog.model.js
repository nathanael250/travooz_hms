const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StockUsageLog = sequelize.define('StockUsageLog', {
  usage_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_items',
      key: 'item_id'
    }
  },
  homestay_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'homestays',
      key: 'homestay_id'
    }
  },
  used_for: {
    type: DataTypes.ENUM('room', 'restaurant', 'maintenance', 'housekeeping', 'laundry', 'general'),
    allowNull: false
  },
  reference_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID from the related module (booking_id, order_id, etc.)'
  },
  linked_service_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Link to booking, order, or maintenance request'
  },
  department: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Department that used the item'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  used_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  usage_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stock_usage_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = StockUsageLog;
