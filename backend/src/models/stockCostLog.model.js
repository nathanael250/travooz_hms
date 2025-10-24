const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StockCostLog = sequelize.define('StockCostLog', {
  cost_log_id: {
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
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'stock_suppliers',
      key: 'supplier_id'
    }
  },
  old_unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  new_unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cost_change_reason: {
    type: DataTypes.ENUM('supplier_price_change', 'market_adjustment', 'bulk_discount', 'contract_renewal', 'manual_update'),
    allowNull: false
  },
  effective_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  }
}, {
  tableName: 'stock_cost_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = StockCostLog;
