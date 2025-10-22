const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MenuItem = sequelize.define('MenuItem', {
  menu_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'menu_id'
  },
  item_id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('menu_id');
    }
  },
  restaurant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'eating_out',
      key: 'eating_out_id'
    }
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_available: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('available');
    }
  }
}, {
  tableName: 'hotel_menu',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MenuItem;
