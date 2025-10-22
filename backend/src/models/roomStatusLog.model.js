const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RoomStatusLog = sequelize.define('RoomStatusLog', {
  log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'log_id'
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  previous_status: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  new_status: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    },
    comment: 'user_id'
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'room_status_log',
  timestamps: false, // Only created_at, no updated_at
  underscored: true
});

module.exports = RoomStatusLog;