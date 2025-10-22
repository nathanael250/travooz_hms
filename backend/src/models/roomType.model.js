const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RoomType = sequelize.define('RoomType', {
  room_type_id: {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  max_people: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  included: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  size_sqm: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Amenities
  minibar: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tea_coffee_facilities: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  wardrobe_hangers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  luggage_rack: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  safe: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  air_conditioner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  heater: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  wifi: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tv: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  speaker: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usb_charging_points: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  power_adapters: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  desk_workspace: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  iron_ironing_board: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hairdryer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  towels: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bathrobes: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  slippers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  toiletries: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  teeth_shaving_kits: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  table_lamps: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bedside_lamps: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  alarm_clock: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  laundry_bag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'room_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = RoomType;