const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HousekeepingTask = sequelize.define('HousekeepingTask', {
  task_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Room/unit being serviced',
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  task_type: {
    type: DataTypes.ENUM(
      'cleaning',
      'deep_cleaning',
      'inspection',
      'maintenance',
      'turndown_service',
      'laundry',
      'minibar_restock'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled', 'on_hold'),
    defaultValue: 'pending'
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Staff user_id',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  scheduled_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimated_duration: {
    type: DataTypes.INTEGER,
    comment: 'Estimated duration in minutes',
    allowNull: true
  },
  actual_duration: {
    type: DataTypes.INTEGER,
    comment: 'Actual duration in minutes',
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Task instructions or special requirements'
  },
  issues_found: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Any issues or maintenance needs discovered'
  },
  supplies_used: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Supplies/materials used for the task'
  },
  quality_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Quality rating 1-5',
    validate: {
      min: 1,
      max: 5
    }
  },
  inspected_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Supervisor who inspected completion',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  inspection_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Inspection notes from supervisor'
  }
}, {
  tableName: 'housekeeping_tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HousekeepingTask;
