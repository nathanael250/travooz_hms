const express = require('express');
const { RoomInventory, Room } = require('../models');

const router = express.Router();

// Get inventory items
router.get('/', async (req, res) => {
  try {
    const { roomId, itemType, condition, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = { isActive: true };
    if (roomId) where.roomId = roomId;
    if (itemType) where.itemType = itemType;
    if (condition) where.condition = condition;

    const { count, rows: items } = await RoomInventory.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Room, as: 'room', attributes: ['id', 'roomNumber', 'roomType'] }
      ],
      order: [['itemName', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
});

// Add inventory item
router.post('/', async (req, res) => {
  try {
    const item = await RoomInventory.create(req.body);

    const fullItem = await RoomInventory.findByPk(item.id, {
      include: [
        { model: Room, as: 'room', attributes: ['id', 'roomNumber', 'roomType'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: { item: fullItem }
    });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add inventory item',
      error: error.message
    });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await RoomInventory.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await item.update(req.body);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: { item }
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
});

module.exports = router;