const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RestaurantTable = sequelize.define('RestaurantTable', {
  table_id: {
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
  table_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'e.g., Indoor, Outdoor, Patio, VIP'
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance'),
    defaultValue: 'available'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'hotel_restaurant_tables',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RestaurantTable;
