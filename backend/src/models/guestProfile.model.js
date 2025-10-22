// models/guestProfile.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const GuestProfile = sequelize.define('GuestProfile', {
  guest_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Link to users table if registered',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  country: {
    type: DataTypes.STRING(100)
  },
  city: {
    type: DataTypes.STRING(100)
  },
  address: {
    type: DataTypes.TEXT
  },
  date_of_birth: {
    type: DataTypes.DATEONLY
  },
  nationality: {
    type: DataTypes.STRING(100)
  },
  id_type: {
    type: DataTypes.STRING(50)
  },
  id_number: {
    type: DataTypes.STRING(100)
  },
  id_expiry_date: {
    type: DataTypes.DATEONLY
  },
  passport_number: {
    type: DataTypes.STRING(50)
  },
  passport_expiry_date: {
    type: DataTypes.DATEONLY
  },
  preferences: {
    type: DataTypes.TEXT,
    comment: 'JSON: room preferences, dietary, etc.'
  },
  vip_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  loyalty_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_bookings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_spent: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  last_stay_date: {
    type: DataTypes.DATEONLY
  },
  notes: {
    type: DataTypes.TEXT
  },
  blacklisted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blacklist_reason: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'guest_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = GuestProfile;