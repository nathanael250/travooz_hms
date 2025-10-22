const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Op } = require('sequelize');
const ExternalBooking = require('../models/externalBooking.model');
const Booking = require('../models/booking.model');
const RoomBooking = require('../models/roomBooking.model');
const Room = require('../models/room.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all external bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      platform,
      external_booking_id,
      external_status,
      sync_status,
      date_from,
      date_to,
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};

    if (platform) whereClause.platform = platform;
    if (external_booking_id) whereClause.external_booking_id = { [Op.like]: `%${external_booking_id}%` };
    if (external_status) whereClause.external_status = external_status;
    if (sync_status) whereClause.sync_status = sync_status;

    if (date_from && date_to) {
      whereClause.created_at = {
        [Op.between]: [date_from, date_to]
      };
    }

    const externalBookings = await ExternalBooking.findAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          required: false,
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room',
                  attributes: ['inventory_id', 'unit_number', 'floor', 'room_type']
                }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: externalBookings,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total_count: await ExternalBooking.count({ where: whereClause })
      }
    });
  } catch (error) {
    console.error('Error fetching external bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch external bookings',
      error: error.message
    });
  }
});

// Get external booking by ID
router.get('/:external_booking_record_id', authMiddleware, [
  param('external_booking_record_id').isInt({ min: 1 }).withMessage('Valid external booking record ID is required')
], async (req, res) => {
  try {
    const { external_booking_record_id } = req.params;

    const externalBooking = await ExternalBooking.findByPk(external_booking_record_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!externalBooking) {
      return res.status(404).json({
        success: false,
        message: 'External booking not found'
      });
    }

    res.json({
      success: true,
      data: externalBooking
    });
  } catch (error) {
    console.error('Error fetching external booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch external booking',
      error: error.message
    });
  }
});

// Create/Import external booking
router.post('/', authMiddleware, [
  body('platform').isIn(['booking.com', 'airbnb', 'expedia', 'agoda', 'hotels.com', 'trivago', 'priceline', 'kayak', 'other'])
    .withMessage('Valid platform is required'),
  body('external_booking_id').notEmpty().withMessage('External booking ID is required'),
  body('external_data').isObject().withMessage('External booking data is required'),
  body('external_guest_name').notEmpty().withMessage('External guest name is required'),
  body('external_status').optional().isIn(['confirmed', 'pending', 'cancelled', 'completed'])
    .withMessage('Valid external status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      platform,
      external_booking_id,
      external_data,
      external_guest_name,
      external_status = 'confirmed',
      commission_percentage,
      commission_amount,
      notes
    } = req.body;

    // Check if external booking already exists
    const existingExternalBooking = await ExternalBooking.findOne({
      where: {
        platform,
        external_booking_id
      }
    });

    if (existingExternalBooking) {
      return res.status(400).json({
        success: false,
        message: 'External booking already exists in the system'
      });
    }

    // Create external booking record
    const externalBooking = await ExternalBooking.create({
      platform,
      external_booking_id,
      external_data,
      external_guest_name,
      external_status,
      commission_percentage: commission_percentage || 0,
      commission_amount: commission_amount || 0,
      sync_status: 'pending',
      notes,
      created_by: req.user.user_id
    });

    res.status(201).json({
      success: true,
      message: 'External booking imported successfully',
      data: externalBooking
    });
  } catch (error) {
    console.error('Error creating external booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create external booking',
      error: error.message
    });
  }
});

// Sync external booking to internal booking
router.post('/:external_booking_record_id/sync', authMiddleware, [
  param('external_booking_record_id').isInt({ min: 1 }).withMessage('Valid external booking record ID is required'),
  body('inventory_id').isInt({ min: 1 }).withMessage('Valid room inventory ID is required'),
  body('check_in_date').isISO8601().withMessage('Valid check-in date is required'),
  body('check_out_date').isISO8601().withMessage('Valid check-out date is required'),
  body('adults').isInt({ min: 1 }).withMessage('Number of adults must be at least 1'),
  body('children').optional().isInt({ min: 0 }).withMessage('Number of children must be 0 or more'),
  body('room_rate').isDecimal().withMessage('Valid room rate is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { external_booking_record_id } = req.params;
    const {
      inventory_id,
      check_in_date,
      check_out_date,
      adults,
      children = 0,
      room_rate,
      discount_amount = 0,
      tax_amount = 0
    } = req.body;

    const externalBooking = await ExternalBooking.findByPk(external_booking_record_id);
    if (!externalBooking) {
      return res.status(404).json({
        success: false,
        message: 'External booking not found'
      });
    }

    if (externalBooking.sync_status === 'synced') {
      return res.status(400).json({
        success: false,
        message: 'External booking is already synced'
      });
    }

    // Check room availability
    const existingBooking = await RoomBooking.findOne({
      where: {
        inventory_id,
        [Op.or]: [
          {
            check_in_date: {
              [Op.lt]: check_out_date
            },
            check_out_date: {
              [Op.gt]: check_in_date
            }
          }
        ]
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: {
          status: ['confirmed', 'checked_in']
        }
      }]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Calculate nights and final amount
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const subtotal = room_rate * nights;
    const final_amount = subtotal - discount_amount + tax_amount;

    // Create internal booking
    const booking = await Booking.create({
      booking_reference: `EXT-${externalBooking.platform.toUpperCase()}-${externalBooking.external_booking_id}`,
      guest_name: externalBooking.external_guest_name,
      service_type: 'room',
      status: 'confirmed',
      payment_status: 'pending',
      booking_source: externalBooking.platform,
      total_amount: final_amount,
      created_by: req.user.user_id
    });

    // Create room booking
    const roomBooking = await RoomBooking.create({
      booking_id: booking.booking_id,
      inventory_id,
      check_in_date,
      check_out_date,
      number_of_adults: adults,
      number_of_children: children,
      nights,
      room_price_per_night: room_rate,
      discount_amount,
      tax_amount,
      total_room_amount: subtotal,
      final_amount
    });

    // Update external booking sync status
    await externalBooking.update({
      internal_booking_id: booking.booking_id,
      sync_status: 'synced',
      synced_at: new Date(),
      synced_by: req.user.user_id
    });

    // Fetch complete synchronized booking
    const completeExternalBooking = await ExternalBooking.findByPk(external_booking_record_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room'
                }
              ]
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'External booking synchronized successfully',
      data: completeExternalBooking
    });
  } catch (error) {
    console.error('Error syncing external booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync external booking',
      error: error.message
    });
  }
});

// Update external booking
router.put('/:external_booking_record_id', authMiddleware, [
  param('external_booking_record_id').isInt({ min: 1 }).withMessage('Valid external booking record ID is required'),
  body('external_status').optional().isIn(['confirmed', 'pending', 'cancelled', 'completed'])
    .withMessage('Valid external status is required'),
  body('commission_percentage').optional().isDecimal().withMessage('Valid commission percentage is required'),
  body('commission_amount').optional().isDecimal().withMessage('Valid commission amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { external_booking_record_id } = req.params;
    const updateData = req.body;

    const externalBooking = await ExternalBooking.findByPk(external_booking_record_id);
    if (!externalBooking) {
      return res.status(404).json({
        success: false,
        message: 'External booking not found'
      });
    }

    await externalBooking.update(updateData);

    // If external booking is cancelled and was synced, update internal booking
    if (updateData.external_status === 'cancelled' && externalBooking.sync_status === 'synced') {
      await Booking.update(
        { status: 'cancelled' },
        { where: { booking_id: externalBooking.internal_booking_id } }
      );
    }

    const updatedExternalBooking = await ExternalBooking.findByPk(external_booking_record_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room'
                }
              ]
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'External booking updated successfully',
      data: updatedExternalBooking
    });
  } catch (error) {
    console.error('Error updating external booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update external booking',
      error: error.message
    });
  }
});

// Delete external booking
router.delete('/:external_booking_record_id', authMiddleware, [
  param('external_booking_record_id').isInt({ min: 1 }).withMessage('Valid external booking record ID is required')
], async (req, res) => {
  try {
    const { external_booking_record_id } = req.params;

    const externalBooking = await ExternalBooking.findByPk(external_booking_record_id);
    if (!externalBooking) {
      return res.status(404).json({
        success: false,
        message: 'External booking not found'
      });
    }

    // If synced, also cancel the internal booking
    if (externalBooking.sync_status === 'synced' && externalBooking.internal_booking_id) {
      await Booking.update(
        { status: 'cancelled' },
        { where: { booking_id: externalBooking.internal_booking_id } }
      );
    }

    await externalBooking.destroy();

    res.json({
      success: true,
      message: 'External booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting external booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete external booking',
      error: error.message
    });
  }
});

// Get external booking statistics
router.get('/statistics/dashboard', authMiddleware, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateFilter = {};
    if (date_from && date_to) {
      dateFilter = {
        created_at: {
          [Op.between]: [date_from, date_to]
        }
      };
    }

    // Platform distribution
    const platformStats = await ExternalBooking.findAll({
      attributes: [
        'platform',
        [ExternalBooking.sequelize.fn('COUNT', ExternalBooking.sequelize.col('external_booking_record_id')), 'count'],
        [ExternalBooking.sequelize.fn('SUM', ExternalBooking.sequelize.col('commission_amount')), 'total_commission']
      ],
      where: dateFilter,
      group: ['platform'],
      raw: true
    });

    // Sync status distribution
    const syncStats = await ExternalBooking.findAll({
      attributes: [
        'sync_status',
        [ExternalBooking.sequelize.fn('COUNT', ExternalBooking.sequelize.col('external_booking_record_id')), 'count']
      ],
      where: dateFilter,
      group: ['sync_status'],
      raw: true
    });

    // External status distribution
    const statusStats = await ExternalBooking.findAll({
      attributes: [
        'external_status',
        [ExternalBooking.sequelize.fn('COUNT', ExternalBooking.sequelize.col('external_booking_record_id')), 'count']
      ],
      where: dateFilter,
      group: ['external_status'],
      raw: true
    });

    // Overall statistics
    const overallStats = await ExternalBooking.findAll({
      attributes: [
        [ExternalBooking.sequelize.fn('COUNT', ExternalBooking.sequelize.col('external_booking_record_id')), 'total_external_bookings'],
        [ExternalBooking.sequelize.fn('SUM', ExternalBooking.sequelize.col('commission_amount')), 'total_commissions'],
        [ExternalBooking.sequelize.fn('AVG', ExternalBooking.sequelize.col('commission_percentage')), 'avg_commission_rate']
      ],
      where: dateFilter,
      raw: true
    });

    res.json({
      success: true,
      data: {
        platform_distribution: platformStats,
        sync_status_distribution: syncStats,
        external_status_distribution: statusStats,
        overall_statistics: overallStats[0] || { total_external_bookings: 0, total_commissions: 0, avg_commission_rate: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching external booking statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch external booking statistics',
      error: error.message
    });
  }
});

module.exports = router;