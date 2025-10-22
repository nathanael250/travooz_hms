const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const LaundryStatusLog = sequelize.define('LaundryStatusLog', {
  log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  laundry_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'laundry_requests',
      key: 'request_id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'picked_up',
      'washing',
      'drying',
      'ironing',
      'ready',
      'delivered',
      'cancelled'
    ),
    allowNull: false
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Staff user_id who changed status',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  changed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'laundry_status_log',
  timestamps: false
});

module.exports = LaundryStatusLog;
