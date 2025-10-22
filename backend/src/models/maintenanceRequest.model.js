const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  request_id: {
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
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Room/unit requiring maintenance (inventory_id)',
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'plumbing',
      'electrical',
      'hvac',
      'furniture',
      'appliance',
      'structural',
      'safety',
      'other'
    ),
    allowNull: false,
    defaultValue: 'other'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold'),
    defaultValue: 'pending'
  },
  reported_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User who reported the issue',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Staff assigned to fix',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  reported_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  started_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  actual_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completion_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of attachment URLs'
  }
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MaintenanceRequest;
