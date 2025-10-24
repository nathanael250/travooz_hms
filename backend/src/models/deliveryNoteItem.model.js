const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DeliveryNoteItem = sequelize.define('DeliveryNoteItem', {
  delivery_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  delivery_note_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'delivery_notes',
      key: 'delivery_note_id'
    }
  },
  order_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_order_items',
      key: 'order_item_id'
    }
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stock_items',
      key: 'item_id'
    }
  },
  quantity_expected: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity_received: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity_damaged: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  quantity_missing: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  condition_status: {
    type: DataTypes.ENUM('good', 'damaged', 'defective', 'expired'),
    defaultValue: 'good'
  },
  condition_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'delivery_note_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = DeliveryNoteItem;
