const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HMSUser = sequelize.define('HMSUser', {
  hms_user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('manager', 'receptionist', 'housekeeping', 'maintenance', 'restaurant', 'inventory', 'accountant'),
    allowNull: false
  },
  assigned_hotel_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },


}, {
  tableName: 'hms_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HMSUser;