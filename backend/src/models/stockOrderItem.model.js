const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StockOrderItem = sequelize.define('StockOrderItem', {
  order_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_orders',
      key: 'order_id'
    }
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_items',
      key: 'item_id'
    }
  },
  quantity_ordered: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity_received: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Calculated as quantity_ordered * unit_price'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'stock_order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = StockOrderItem;
