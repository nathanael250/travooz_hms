const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const LaundryPricing = sequelize.define('LaundryPricing', {
  pricing_id: {
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
  item_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g., shirt, pants, bedsheet, towel'
  },
  service_type: {
    type: DataTypes.ENUM('wash', 'dry_clean', 'iron', 'wash_iron', 'dry_clean_iron'),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'laundry_pricing',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LaundryPricing;
