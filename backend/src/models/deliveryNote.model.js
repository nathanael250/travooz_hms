const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DeliveryNote = sequelize.define('DeliveryNote', {
  delivery_note_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  delivery_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_orders',
      key: 'order_id'
    }
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_suppliers',
      key: 'supplier_id'
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
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  received_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  delivery_status: {
    type: DataTypes.ENUM('partial', 'complete', 'damaged', 'rejected'),
    defaultValue: 'complete'
  },
  total_items_received: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_items_expected: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  delivery_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  condition_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'delivery_notes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DeliveryNote;
