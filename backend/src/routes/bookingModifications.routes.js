const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Op } = require('sequelize');
const BookingModification = require('../models/bookingModification.model');
const Booking = require('../models/booking.model');
const RoomBooking = require('../models/roomBooking.model');
const Room = require('../models/room.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all booking modifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      booking_id,
      modification_type,
      status,
      date_from,
      date_to,
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};

    if (booking_id) whereClause.booking_id = booking_id;
    if (modification_type) whereClause.modification_type = modification_type;
    if (status) whereClause.status = status;

    if (date_from && date_to) {
      whereClause.requested_at = {
        [Op.between]: [date_from, date_to]
      };
    }

    const modifications = await BookingModification.findAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'guest_name', 'status'],
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room',
                  attributes: ['inventory_id', 'unit_number', 'floor', 'status']
                }
              ]
            }
          ]
        }
      ],
      order: [['requested_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: modifications,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total_count: await BookingModification.count({ where: whereClause })
      }
    });
  } catch (error) {
    console.error('Error fetching booking modifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking modifications',
      error: error.message
    });
  }
});

// Get booking modification by ID
router.get('/:modification_id', authMiddleware, [
  param('modification_id').isInt({ min: 1 }).withMessage('Valid modification ID is required')
], async (req, res) => {
  try {
    const { modification_id } = req.params;

    const modification = await BookingModification.findByPk(modification_id, {
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

    if (!modification) {
      return res.status(404).json({
        success: false,
        message: 'Booking modification not found'
      });
    }

    res.json({
      success: true,
      data: modification
    });
  } catch (error) {
    console.error('Error fetching booking modification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking modification',
      error: error.message
    });
  }
});

// Create new booking modification request
router.post('/', authMiddleware, [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
  body('modification_type').isIn(['date_change', 'room_change', 'guest_change', 'cancellation', 'upgrade', 'downgrade', 'other'])
    .withMessage('Valid modification type is required'),
  body('requested_changes').notEmpty().withMessage('Requested changes description is required'),
  body('original_values').optional().isObject().withMessage('Original values must be an object'),
  body('new_values').optional().isObject().withMessage('New values must be an object')
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
      booking_id,
      modification_type,
      requested_changes,
      original_values,
      new_values,
      reason,
      financial_impact
    } = req.body;

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id, {
      include: [{
        model: RoomBooking,
        as: 'roomBooking'
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create modification request
    const modification = await BookingModification.create({
      booking_id,
      modification_type,
      requested_changes,
      original_values: original_values || (booking.roomBooking ? {
        check_in_date: booking.roomBooking.check_in_date,
        check_out_date: booking.roomBooking.check_out_date,
        room_id: booking.roomBooking.room_id,
        adults: booking.roomBooking.adults,
        children: booking.roomBooking.children,
        room_rate: booking.roomBooking.room_rate,
        final_amount: booking.roomBooking.final_amount
      } : {}),
      new_values: new_values || {},
      reason,
      financial_impact: financial_impact || 0,
      status: 'pending',
      requested_by: req.user.user_id,
      requested_at: new Date()
    });

    // Fetch complete modification data
    const completeModification = await BookingModification.findByPk(modification.modification_id, {
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

    res.status(201).json({
      success: true,
      message: 'Booking modification request created successfully',
      data: completeModification
    });
  } catch (error) {
    console.error('Error creating booking modification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking modification',
      error: error.message
    });
  }
});

// Approve booking modification
router.put('/:modification_id/approve', authMiddleware, [
  param('modification_id').isInt({ min: 1 }).withMessage('Valid modification ID is required'),
  body('approval_notes').optional().isString().withMessage('Approval notes must be a string')
], async (req, res) => {
  try {
    const { modification_id } = req.params;
    const { approval_notes } = req.body;

    const modification = await BookingModification.findByPk(modification_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking'
            }
          ]
        }
      ]
    });

    if (!modification) {
      return res.status(404).json({
        success: false,
        message: 'Booking modification not found'
      });
    }

    if (modification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending modifications can be approved'
      });
    }

    // Apply the modifications based on type
    const newValues = modification.new_values || {};
    
    if (modification.modification_type === 'date_change' && modification.booking.roomBooking) {
      // Check room availability for new dates
      if (newValues.check_in_date && newValues.check_out_date) {
        const conflictingBooking = await RoomBooking.findOne({
          where: {
            room_id: modification.booking.roomBooking.room_id,
            room_booking_id: { [Op.ne]: modification.booking.roomBooking.room_booking_id },
            [Op.or]: [
              {
                check_in_date: {
                  [Op.lt]: newValues.check_out_date
                },
                check_out_date: {
                  [Op.gt]: newValues.check_in_date
                }
              }
            ]
          },
          include: [{
            model: Booking,
            as: 'booking',
            where: { status: ['confirmed', 'checked_in'] }
          }]
        });

        if (conflictingBooking) {
          return res.status(400).json({
            success: false,
            message: 'Room is not available for the new dates'
          });
        }

        // Update room booking dates
        const checkIn = new Date(newValues.check_in_date);
        const checkOut = new Date(newValues.check_out_date);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const newFinalAmount = modification.booking.roomBooking.room_rate * nights - 
          (modification.booking.roomBooking.discount_amount || 0) + 
          (modification.booking.roomBooking.tax_amount || 0);

        await modification.booking.roomBooking.update({
          check_in_date: newValues.check_in_date,
          check_out_date: newValues.check_out_date,
          nights,
          final_amount: newFinalAmount
        });

        await modification.booking.update({
          total_amount: newFinalAmount
        });
      }
    }

    if (modification.modification_type === 'room_change' && modification.booking.roomBooking) {
      if (newValues.room_id) {
        // Check new room availability
        const conflictingBooking = await RoomBooking.findOne({
          where: {
            room_id: newValues.room_id,
            [Op.or]: [
              {
                check_in_date: {
                  [Op.lt]: modification.booking.roomBooking.check_out_date
                },
                check_out_date: {
                  [Op.gt]: modification.booking.roomBooking.check_in_date
                }
              }
            ]
          },
          include: [{
            model: Booking,
            as: 'booking',
            where: { status: ['confirmed', 'checked_in'] }
          }]
        });

        if (conflictingBooking) {
          return res.status(400).json({
            success: false,
            message: 'New room is not available for the booking dates'
          });
        }

        await modification.booking.roomBooking.update({
          room_id: newValues.room_id
        });
      }
    }

    if (modification.modification_type === 'guest_change' && newValues.adults) {
      await modification.booking.roomBooking.update({
        adults: newValues.adults,
        children: newValues.children || modification.booking.roomBooking.children
      });
    }

    // Update modification status
    await modification.update({
      status: 'approved',
      approved_by: req.user.user_id,
      approved_at: new Date(),
      approval_notes
    });

    // Fetch updated modification
    const updatedModification = await BookingModification.findByPk(modification_id, {
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
      message: 'Booking modification approved and applied successfully',
      data: updatedModification
    });
  } catch (error) {
    console.error('Error approving booking modification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve booking modification',
      error: error.message
    });
  }
});

// Reject booking modification
router.put('/:modification_id/reject', authMiddleware, [
  param('modification_id').isInt({ min: 1 }).withMessage('Valid modification ID is required'),
  body('rejection_reason').notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const { modification_id } = req.params;
    const { rejection_reason, rejection_notes } = req.body;

    const modification = await BookingModification.findByPk(modification_id);
    if (!modification) {
      return res.status(404).json({
        success: false,
        message: 'Booking modification not found'
      });
    }

    if (modification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending modifications can be rejected'
      });
    }

    await modification.update({
      status: 'rejected',
      rejection_reason,
      rejection_notes,
      rejected_by: req.user.user_id,
      rejected_at: new Date()
    });

    const updatedModification = await BookingModification.findByPk(modification_id, {
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
      message: 'Booking modification rejected successfully',
      data: updatedModification
    });
  } catch (error) {
    console.error('Error rejecting booking modification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking modification',
      error: error.message
    });
  }
});

// Get modification statistics
router.get('/statistics/dashboard', authMiddleware, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateFilter = {};
    if (date_from && date_to) {
      dateFilter = {
        requested_at: {
          [Op.between]: [date_from, date_to]
        }
      };
    }

    // Status distribution
    const statusStats = await BookingModification.findAll({
      attributes: [
        'status',
        [BookingModification.sequelize.fn('COUNT', BookingModification.sequelize.col('modification_id')), 'count']
      ],
      where: dateFilter,
      group: ['status'],
      raw: true
    });

    // Type distribution
    const typeStats = await BookingModification.findAll({
      attributes: [
        'modification_type',
        [BookingModification.sequelize.fn('COUNT', BookingModification.sequelize.col('modification_id')), 'count']
      ],
      where: dateFilter,
      group: ['modification_type'],
      raw: true
    });

    // Financial impact
    const financialImpact = await BookingModification.findAll({
      attributes: [
        [BookingModification.sequelize.fn('SUM', BookingModification.sequelize.col('financial_impact')), 'total_impact'],
        [BookingModification.sequelize.fn('AVG', BookingModification.sequelize.col('financial_impact')), 'avg_impact']
      ],
      where: { ...dateFilter, status: 'approved' },
      raw: true
    });

    res.json({
      success: true,
      data: {
        status_distribution: statusStats,
        type_distribution: typeStats,
        financial_impact: financialImpact[0] || { total_impact: 0, avg_impact: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching modification statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch modification statistics',
      error: error.message
    });
  }
});

module.exports = router;