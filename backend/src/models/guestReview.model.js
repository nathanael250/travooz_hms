const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const GuestReview = sequelize.define('GuestReview', {
  review_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'booking_id'
    }
  },
  guest_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'guest_profiles',
      key: 'guest_id'
    }
  },
  homestay_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'homestays',
      key: 'homestay_id'
    }
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  overall_rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  cleanliness_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  service_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  location_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  value_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  amenities_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pros: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cons: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  would_recommend: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stay_type: {
    type: DataTypes.ENUM('business', 'leisure', 'family', 'couple', 'solo', 'group'),
    allowNull: true
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array of image URLs'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'flagged'),
    defaultValue: 'pending'
  },
  verified_stay: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  admin_response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  response_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'guest_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = GuestReview;
