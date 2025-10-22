const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MenuItemIngredient = sequelize.define('MenuItemIngredient', {
  ingredient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hotel_menu',
      key: 'menu_id'
    }
  },
  stock_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_items',
      key: 'item_id'
    }
  },
  quantity_required: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Quantity of stock item needed for one serving'
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Unit of measurement for this ingredient'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'menu_item_ingredients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MenuItemIngredient;
