const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StockMovement = sequelize.define('StockMovement', {
  movement_id: {
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
  movement_type: {
    type: DataTypes.ENUM('purchase', 'usage', 'adjustment', 'transfer', 'return'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  total_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'financial_accounts',
      key: 'account_id'
    }
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
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
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Reference number or document'
  },
  movement_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'stock_movements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = StockMovement;
