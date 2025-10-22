const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StockSupplier = sequelize.define('StockSupplier', {
  supplier_id: {
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
  contact_info: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferred_items: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of item IDs this supplier provides'
  },
  payment_terms: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'stock_suppliers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StockSupplier;
