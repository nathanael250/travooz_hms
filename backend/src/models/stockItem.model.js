const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StockItem = sequelize.define('StockItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  homestay_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'homestays',
      key: 'homestay_id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'e.g., pieces, liters, kg'
  },
  current_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  reorder_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
    allowNull: true,
    defaultValue: 'active'
  }
}, {
  tableName: 'stock_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StockItem;
