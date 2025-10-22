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
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  current_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Calculated from movements'
  },
  reorder_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  default_supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'stock_suppliers',
      key: 'supplier_id'
    }
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'financial_accounts',
      key: 'account_id'
    }
  }
}, {
  tableName: 'stock_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StockItem;
