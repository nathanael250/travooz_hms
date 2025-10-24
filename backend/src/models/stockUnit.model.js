const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StockUnit = sequelize.define('StockUnit', {
  unit_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  unit_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  unit_symbol: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  unit_type: {
    type: DataTypes.ENUM('weight', 'volume', 'length', 'area', 'count', 'time'),
    allowNull: false
  },
  base_unit_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'stock_units',
      key: 'unit_id'
    }
  },
  conversion_factor: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 1.0000
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'stock_units',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = StockUnit;
