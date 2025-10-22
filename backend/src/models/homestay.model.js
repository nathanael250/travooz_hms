// models/homestay.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Homestay = sequelize.define('Homestay', {
  homestay_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  star_rating: {
    type: DataTypes.TINYINT,
    defaultValue: 3
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'locations',
      key: 'location_id'
    }
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  check_in_time: {
    type: DataTypes.TIME,
    defaultValue: '14:00:00'
  },
  check_out_time: {
    type: DataTypes.TIME,
    defaultValue: '11:00:00'
  },
  cancellation_policy: {
    type: DataTypes.TEXT
  },
  child_policy: {
    type: DataTypes.TEXT
  },
  pet_policy: {
    type: DataTypes.TEXT
  },
  total_rooms: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  // Amenities
  free_wifi: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parking_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pet_friendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  swimming_pool: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  spa: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fitness_center: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  restaurant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bar_lounge: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  air_conditioning: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  room_service: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  laundry_service: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  airport_shuttle: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  family_rooms: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  non_smoking_rooms: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  breakfast_included: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  kitchen_facilities: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  balcony: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ocean_view: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  garden_view: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  wheelchair_accessible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  meeting_rooms: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  conference_facilities: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  security_24h: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fresh_discoveries: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'homestays',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Homestay;