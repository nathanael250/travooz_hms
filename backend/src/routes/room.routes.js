const express = require('express');
const { Room } = require('../models');
const { sequelize } = require('../../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all room types with availability counts (public)
router.get('/', async (req, res) => {
  try {
    const { homestay_id, status, room_type_id } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    
    // Build base WHERE clause
    let whereClause = '';
    
    if (homestay_id) {
      whereConditions.push('rt.homestay_id = ?');
      queryParams.push(homestay_id);
    }
    
    if (status) {
      whereConditions.push('ri.status = ?');
      queryParams.push(status);
    }
    
    if (room_type_id) {
      whereConditions.push('rt.room_type_id = ?');
      queryParams.push(room_type_id);
    }

    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }

    const query = `
      SELECT 
        rt.room_type_id,
        rt.name as room_type,
        rt.description,
        rt.price as base_price,
        rt.max_people as max_occupancy,
        rt.size_sqm,
        'RWF' as currency,
        rt.homestay_id,
        h.name as homestay_name,
        COUNT(ri.inventory_id) as total_items,
        COUNT(CASE WHEN ri.status = 'available' THEN 1 END) as available_count,
        COUNT(CASE WHEN ri.status = 'occupied' THEN 1 END) as occupied_count,
        COUNT(CASE WHEN ri.status = 'reserved' THEN 1 END) as reserved_count,
        COUNT(CASE WHEN ri.status = 'maintenance' THEN 1 END) as maintenance_count,
        COUNT(CASE WHEN ri.status = 'out_of_order' THEN 1 END) as out_of_order_count,
        COUNT(CASE WHEN ri.status = 'cleaning' THEN 1 END) as cleaning_count
      FROM room_types rt
      LEFT JOIN room_inventory ri ON rt.room_type_id = ri.room_type_id
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      ${whereClause}
      GROUP BY rt.room_type_id, rt.name, rt.description, rt.price, rt.max_people, 
               rt.size_sqm, rt.homestay_id, h.name
      ORDER BY h.name, rt.name
    `;
    
    const results = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    // Get images for each room type
    const roomTypesWithImages = await Promise.all(
      results.map(async (roomType) => {
        const images = await sequelize.query(
          "SELECT * FROM room_images WHERE room_type_id = ? ORDER BY image_order",
          {
            replacements: [roomType.room_type_id],
            type: sequelize.QueryTypes.SELECT,
          }
        );
        
        return {
          ...roomType,
          images: images
        };
      })
    );

    res.json({
      success: true,
      data: { room_types: roomTypesWithImages }
    });
  } catch (error) {
    console.error('Fetch room types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room types',
      error: error.message
    });
  }
});

// Get room by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        ri.inventory_id as room_id,
        ri.room_type_id,
        ri.unit_number as room_number,
        ri.floor as floor_number,
        ri.status,
        ri.last_cleaned,
        ri.last_maintenance,
        ri.notes,
        ri.created_at,
        ri.updated_at,
        rt.name as room_type_name,
        rt.description as room_type_description,
        rt.price as price_per_night,
        rt.max_people,
        rt.size_sqm,
        'RWF' as currency,
        rt.homestay_id,
        h.name as homestay_name
      FROM room_inventory ri
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      WHERE ri.inventory_id = ?
    `;

    const rooms = await sequelize.query(query, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });
    
    const room = rooms[0];

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Get images for the room type
    const images = await sequelize.query(
      "SELECT * FROM room_images WHERE room_type_id = ? ORDER BY image_order",
      {
        replacements: [room.room_type_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      data: { 
        room: {
          ...room,
          images: images
        }
      }
    });
  } catch (error) {
    console.error('Fetch room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
      error: error.message
    });
  }
});

// Create room (protected)
const authMiddleware = require('../middlewares/auth.middleware');
router.post('/', authMiddleware, [
  body('room_type_id').isInt().withMessage('Room type ID is required'),
  body('room_number').notEmpty().withMessage('Room number is required'),
  body('floor_number').optional().isString().withMessage('Floor number must be a string'),
  body('status').optional().isIn(['available', 'occupied', 'reserved', 'maintenance', 'out_of_order', 'cleaning']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], handleValidationErrors, async (req, res) => {
  try {
    const { room_type_id, room_number, floor_number, status, notes } = req.body;

    // First verify that the room type exists
    const [roomType] = await sequelize.query(
      'SELECT room_type_id FROM room_types WHERE room_type_id = ?',
      {
        replacements: [room_type_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!roomType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room type ID'
      });
    }

    // Check if room number already exists for this room type
    const [existingRoom] = await sequelize.query(
      `SELECT ri.inventory_id 
       FROM room_inventory ri 
       JOIN room_types rt ON ri.room_type_id = rt.room_type_id 
       WHERE ri.unit_number = ? AND rt.homestay_id = (
         SELECT homestay_id FROM room_types WHERE room_type_id = ?
       )`,
      {
        replacements: [room_number, room_type_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists in this homestay'
      });
    }

    const room = await Room.create({
      room_type_id,
      unit_number: room_number,
      floor: floor_number || null,
      status: status || 'available',
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message
    });
  }
});

// Update room (protected)
router.put('/:id', authMiddleware, [
  body('room_type_id').optional().isInt().withMessage('Room type ID must be an integer'),
  body('room_number').optional().notEmpty().withMessage('Room number cannot be empty'),
  body('floor_number').optional().isString().withMessage('Floor number must be a string'),
  body('status').optional().isIn(['available', 'occupied', 'reserved', 'maintenance', 'out_of_order', 'cleaning']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], handleValidationErrors, async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const { room_type_id, room_number, floor_number, status, notes } = req.body;
    const updateData = {};

    if (room_type_id !== undefined) updateData.room_type_id = room_type_id;
    if (room_number !== undefined) updateData.unit_number = room_number;
    if (floor_number !== undefined) updateData.floor = floor_number;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await room.update(updateData);

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: error.message
    });
  }
});

// Update room status (protected)
router.patch('/:id/status', authMiddleware, [
  body('status').isIn(['available', 'occupied', 'reserved', 'maintenance', 'out_of_order', 'cleaning'])
    .withMessage('Invalid status')
], handleValidationErrors, async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const updateData = { 
      status: req.body.status
    };

    // Update last_cleaned when status is set to cleaning
    if (req.body.status === 'cleaning') {
      updateData.last_cleaned = new Date();
    }

    await room.update(updateData);

    res.json({
      success: true,
      message: 'Room status updated successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Update room status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room status',
      error: error.message
    });
  }
});

// Delete room (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is currently occupied or reserved
    if (room.status === 'occupied' || room.status === 'reserved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room that is currently occupied or reserved'
      });
    }

    await room.destroy();

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message
    });
  }
});

module.exports = router;