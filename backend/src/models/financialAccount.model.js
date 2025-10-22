const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const FinancialAccount = sequelize.define('FinancialAccount', {
  account_id: {
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
  account_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  account_type: {
    type: DataTypes.ENUM('bank', 'cash', 'mobile_money'),
    allowNull: false
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'RWF'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'financial_accounts',
  timestamps: false
});

module.exports = FinancialAccount;
