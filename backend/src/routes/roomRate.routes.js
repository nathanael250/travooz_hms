const express = require('express');
const { RoomRate } = require('../models');
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

// Get all room rates with room type and homestay information
router.get('/', async (req, res) => {
  try {
    const { homestay_id, room_type_id, rate_type, is_active } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    
    if (homestay_id) {
      whereClause += ' AND rt.homestay_id = ?';
      queryParams.push(homestay_id);
    }
    
    if (room_type_id) {
      whereClause += ' AND rr.room_type_id = ?';
      queryParams.push(room_type_id);
    }
    
    if (rate_type) {
      whereClause += ' AND rr.rate_type = ?';
      queryParams.push(rate_type);
    }
    
    if (is_active !== undefined) {
      whereClause += ' AND rr.is_active = ?';
      queryParams.push(is_active === 'true' ? 1 : 0);
    }

    const query = `
      SELECT 
        rr.*,
        rt.name as room_type_name,
        rt.price as base_price,
        rt.homestay_id,
        h.name as homestay_name
      FROM room_rates rr
      LEFT JOIN room_types rt ON rr.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      ${whereClause}
      ORDER BY rr.priority DESC, rr.created_at DESC
    `;
    
    const results = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: { room_rates: results }
    });
  } catch (error) {
    console.error('Fetch room rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room rates',
      error: error.message
    });
  }
});

// Get room rate by ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT 
        rr.*,
        rt.name as room_type_name,
        rt.price as base_price,
        rt.homestay_id,
        h.name as homestay_name
      FROM room_rates rr
      LEFT JOIN room_types rt ON rr.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      WHERE rr.rate_id = ?
    `;

    const rates = await sequelize.query(query, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });
    
    const rate = rates[0];

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Room rate not found'
      });
    }

    res.json({
      success: true,
      data: { room_rate: rate }
    });
  } catch (error) {
    console.error('Fetch room rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room rate',
      error: error.message
    });
  }
});

// Create room rate
router.post('/', [
  body('room_type_id').isInt().withMessage('Room type ID is required'),
  body('rate_name').notEmpty().withMessage('Rate name is required'),
  body('rate_type').isIn(['base', 'seasonal', 'weekend', 'holiday', 'promotional', 'last_minute']).withMessage('Invalid rate type'),
  body('price_per_night').isFloat({ min: 0 }).withMessage('Price per night must be a positive number'),
  body('start_date').optional().isDate().withMessage('Start date must be a valid date'),
  body('end_date').optional().isDate().withMessage('End date must be a valid date'),
  body('min_nights').optional().isInt({ min: 1 }).withMessage('Minimum nights must be at least 1'),
  body('max_nights').optional().isInt({ min: 1 }).withMessage('Maximum nights must be at least 1'),
  body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100'),
  body('priority').optional().isInt().withMessage('Priority must be an integer')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      room_type_id,
      rate_name,
      rate_type,
      price_per_night,
      start_date,
      end_date,
      min_nights,
      max_nights,
      days_of_week,
      discount_percentage,
      is_active,
      priority
    } = req.body;

    // Verify room type exists
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

    // Validate date range
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check for overlapping rates of same type
    if (start_date && end_date) {
      const overlappingRates = await sequelize.query(
        `SELECT rate_id FROM room_rates 
         WHERE room_type_id = ? AND rate_type = ? AND is_active = 1
         AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))`,
        {
          replacements: [room_type_id, rate_type, start_date, start_date, end_date, end_date],
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (overlappingRates.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Rate period overlaps with existing active rate'
        });
      }
    }

    const roomRate = await RoomRate.create({
      room_type_id,
      rate_name,
      rate_type,
      price_per_night,
      start_date: start_date || null,
      end_date: end_date || null,
      min_nights: min_nights || 1,
      max_nights: max_nights || null,
      days_of_week: days_of_week || null,
      discount_percentage: discount_percentage || 0,
      is_active: is_active !== false,
      priority: priority || 0
    });

    res.status(201).json({
      success: true,
      message: 'Room rate created successfully',
      data: { room_rate: roomRate }
    });
  } catch (error) {
    console.error('Create room rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room rate',
      error: error.message
    });
  }
});

// Update room rate
router.put('/:id', [
  body('rate_name').optional().notEmpty().withMessage('Rate name cannot be empty'),
  body('rate_type').optional().isIn(['base', 'seasonal', 'weekend', 'holiday', 'promotional', 'last_minute']).withMessage('Invalid rate type'),
  body('price_per_night').optional().isFloat({ min: 0 }).withMessage('Price per night must be a positive number'),
  body('start_date').optional().isDate().withMessage('Start date must be a valid date'),
  body('end_date').optional().isDate().withMessage('End date must be a valid date'),
  body('min_nights').optional().isInt({ min: 1 }).withMessage('Minimum nights must be at least 1'),
  body('max_nights').optional().isInt({ min: 1 }).withMessage('Maximum nights must be at least 1'),
  body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100'),
  body('priority').optional().isInt().withMessage('Priority must be an integer')
], handleValidationErrors, async (req, res) => {
  try {
    const roomRate = await RoomRate.findByPk(req.params.id);
    
    if (!roomRate) {
      return res.status(404).json({
        success: false,
        message: 'Room rate not found'
      });
    }

    const updateData = {};
    const allowedFields = [
      'rate_name', 'rate_type', 'price_per_night', 'start_date', 'end_date',
      'min_nights', 'max_nights', 'days_of_week', 'discount_percentage',
      'is_active', 'priority'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await roomRate.update(updateData);

    res.json({
      success: true,
      message: 'Room rate updated successfully',
      data: { room_rate: roomRate }
    });
  } catch (error) {
    console.error('Update room rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room rate',
      error: error.message
    });
  }
});

// Toggle room rate active status
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const roomRate = await RoomRate.findByPk(req.params.id);
    
    if (!roomRate) {
      return res.status(404).json({
        success: false,
        message: 'Room rate not found'
      });
    }

    await roomRate.update({ 
      is_active: !roomRate.is_active
    });

    res.json({
      success: true,
      message: `Room rate ${roomRate.is_active ? 'activated' : 'deactivated'} successfully`,
      data: { room_rate: roomRate }
    });
  } catch (error) {
    console.error('Toggle room rate status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle room rate status',
      error: error.message
    });
  }
});

// Delete room rate
router.delete('/:id', async (req, res) => {
  try {
    const roomRate = await RoomRate.findByPk(req.params.id);
    
    if (!roomRate) {
      return res.status(404).json({
        success: false,
        message: 'Room rate not found'
      });
    }

    await roomRate.destroy();

    res.json({
      success: true,
      message: 'Room rate deleted successfully'
    });
  } catch (error) {
    console.error('Delete room rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room rate',
      error: error.message
    });
  }
});

module.exports = router;