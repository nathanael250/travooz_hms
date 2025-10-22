const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RestaurantImage = sequelize.define('RestaurantImage', {
  image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  restaurant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hotel_restaurants',
      key: 'restaurant_id'
    }
  },
  image_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  image_type: {
    type: DataTypes.ENUM('main', 'gallery'),
    defaultValue: 'gallery'
  },
  image_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'hotel_restaurant_images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RestaurantImage;