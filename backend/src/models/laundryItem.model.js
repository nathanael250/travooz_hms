const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const LaundryItem = sequelize.define('LaundryItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  laundry_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'laundry_requests',
      key: 'request_id'
    }
  },
  item_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  service_type: {
    type: DataTypes.ENUM('wash', 'dry_clean', 'iron', 'wash_iron', 'dry_clean_iron'),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'damaged'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'laundry_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LaundryItem;
