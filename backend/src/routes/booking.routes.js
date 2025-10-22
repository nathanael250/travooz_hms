const express = require('express');
const { Booking, Guest, Hotel, Payment, User, RoomBooking } = require('../models');
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

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { status, service_type, payment_status, booking_source, homestay_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');

    let where = {};
    if (status) where.status = status;

    // Handle multiple service types (comma-separated)
    if (service_type) {
      const serviceTypes = service_type.split(',').map(s => s.trim());
      if (serviceTypes.length > 1) {
        where.service_type = { [Op.in]: serviceTypes };
      } else {
        where.service_type = serviceTypes[0];
      }
    }

    if (payment_status) where.payment_status = payment_status;
    if (booking_source) where.booking_source = booking_source;

    // Build include array - always include RoomBooking for room/homestay bookings
    const includeArray = [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email', 'phone']
      },
      {
        model: RoomBooking,
        as: 'roomBooking',
        required: homestay_id ? true : false, // INNER JOIN if filtering, LEFT JOIN otherwise
        ...(homestay_id && { where: { homestay_id: parseInt(homestay_id) } })
      }
    ];

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: includeArray,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Fetch booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// Create booking
router.post('/', [
  body('service_type').notEmpty().withMessage('Service type is required'),
  body('user_id').isInt().withMessage('User ID is required'),
  body('total_amount').isDecimal().withMessage('Total amount must be a valid decimal')
], handleValidationErrors, async (req, res) => {
  try {
    // Generate booking reference if not provided
    if (!req.body.booking_reference) {
      req.body.booking_reference = 'BK' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
    }

    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Update booking
router.patch('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.update(req.body);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
});

// Check-in
router.patch('/:id/checkin', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be confirmed before check-in'
      });
    }

    await booking.update({
      status: 'completed',
      confirmed_at: new Date()
    });

    res.json({
      success: true,
      message: 'Check-in successful',
      data: { booking }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-in failed',
      error: error.message
    });
  }
});

// Check-out
router.patch('/:id/checkout', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be confirmed or completed before check-out'
      });
    }

    await booking.update({
      status: 'completed',
      completed_at: new Date()
    });

    res.json({
      success: true,
      message: 'Check-out successful',
      data: { booking }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-out failed',
      error: error.message
    });
  }
});

module.exports = router;