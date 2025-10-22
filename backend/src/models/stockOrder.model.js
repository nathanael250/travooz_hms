const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StockOrder = sequelize.define('StockOrder', {
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
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_suppliers',
      key: 'supplier_id'
    }
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expected_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  actual_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'draft'
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  notes: {
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
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  received_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
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
  tableName: 'stock_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StockOrder;
