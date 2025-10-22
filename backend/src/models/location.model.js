// models/location.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Location = sequelize.define('Location', {
  location_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  location_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'locations',
  timestamps: false
});

module.exports = Location;
