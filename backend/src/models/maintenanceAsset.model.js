const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MaintenanceAsset = sequelize.define('MaintenanceAsset', {
  asset_id: {
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
  asset_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  asset_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'e.g., AC Unit, Water Heater, Elevator'
  },
  asset_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Internal tracking code'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Where the asset is located'
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'If asset is in a specific room',
    references: {
      model: 'room_inventory',
      key: 'inventory_id'
    }
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  purchase_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  warranty_expiry: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  supplier: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  last_maintenance_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  next_maintenance_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  maintenance_frequency: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g., monthly, quarterly, yearly'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'retired', 'under_maintenance'),
    defaultValue: 'active'
  },
  condition_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Rating 1-5',
    validate: {
      min: 1,
      max: 5
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'maintenance_assets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MaintenanceAsset;
