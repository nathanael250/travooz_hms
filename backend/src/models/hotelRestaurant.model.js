const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HotelRestaurant = sequelize.define('HotelRestaurant', {
  restaurant_id: {
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
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cuisine_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'hotel_restaurants',
  timestamps: false
});

module.exports = HotelRestaurant;
