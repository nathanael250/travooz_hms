const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UserFavorite = sequelize.define('UserFavorite', {
  favorite_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  guest_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'guest_profiles',
      key: 'guest_id'
    }
  },
  favorite_type: {
    type: DataTypes.ENUM('homestay', 'room', 'menu_item', 'service', 'activity'),
    allowNull: false
  },
  reference_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the favorited item (homestay_id, inventory_id, etc.)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_favorites',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['guest_id', 'favorite_type', 'reference_id'],
      name: 'unique_favorite'
    }
  ]
});

module.exports = UserFavorite;
