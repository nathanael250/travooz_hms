const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const HousekeepingTask = sequelize.define('HousekeepingTask', {
  task_id: {
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
  inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Room/unit being serviced',
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  task_type: {
    type: DataTypes.ENUM(
      'cleaning',
      'deep_clean',
      'linen_change',
      'maintenance',
      'inspection',
      'setup',
      'turndown_service',
      'laundry',
      'restocking'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
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
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Manager/system user_id',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  assignment_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  scheduled_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completion_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimated_duration: {
    type: DataTypes.INTEGER,
    comment: 'Estimated duration in minutes',
    defaultValue: 30
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
  completion_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes added upon completion'
  },
  issues_found: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Any issues or maintenance needs discovered'
  },
  quality_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Quality rating 1-5',
    validate: {
      min: 1,
      max: 5
    }
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Supervisor who verified completion',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  verification_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Related booking if task triggered by check-out',
    references: {
      model: 'bookings',
      key: 'booking_id'
    }
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurrence_pattern: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'daily, weekly, monthly, etc.'
  },
  parent_task_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'For recurring tasks, reference to parent'
  }
}, {
  tableName: 'housekeeping_tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = HousekeepingTask;
