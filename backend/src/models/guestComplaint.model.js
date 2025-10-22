const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const GuestComplaint = sequelize.define('GuestComplaint', {
  complaint_id: {
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
  complaint_type: {
    type: DataTypes.ENUM('room_condition', 'service', 'noise', 'cleanliness', 'staff_behavior', 'amenities', 'billing', 'other'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('minor', 'moderate', 'serious', 'critical'),
    defaultValue: 'moderate'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('reported', 'investigating', 'resolved', 'escalated', 'closed'),
    defaultValue: 'reported'
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'staff user_id handling complaint',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  compensation_offered: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  compensation_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  reported_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  guest_satisfied: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  follow_up_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  follow_up_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'guest_complaints',
  timestamps: false
});

module.exports = GuestComplaint;
