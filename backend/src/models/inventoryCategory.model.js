const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const InventoryCategory = sequelize.define('InventoryCategory', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parent_category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inventory_categories',
      key: 'category_id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'inventory_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InventoryCategory;
