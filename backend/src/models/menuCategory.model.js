const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MenuCategory = sequelize.define('MenuCategory', {
  category_id: {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'menu_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MenuCategory;
