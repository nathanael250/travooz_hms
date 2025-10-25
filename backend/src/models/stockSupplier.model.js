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
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tin: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tax Identification Number'
  },
  contact_person: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Primary contact person name'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'blacklisted'),
    allowNull: true,
    defaultValue: 'active'
  }
}, {
  tableName: 'stock_suppliers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StockSupplier;
