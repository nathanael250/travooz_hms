const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { Op } = require('sequelize');
const Booking = require('../models/booking.model');
const RoomBooking = require('../models/roomBooking.model');
const BookingGuest = require('../models/bookingGuest.model');
const BookingCharge = require('../models/bookingCharge.model');
const BookingModification = require('../models/bookingModification.model');
const ExternalBooking = require('../models/externalBooking.model');
const MultiRoomBooking = require('../models/multiRoomBooking.model');
const Room = require('../models/room.model');
const GuestProfile = require('../models/guestProfile.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all bookings with comprehensive filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      date_from,
      date_to,
      guest_name,
      guest_id,
      booking_status,
      payment_status,
      booking_reference,
      booking_source,
      service_type = 'room',
      limit = 50,
      offset = 0
    } = req.query;

    const whereClause = { service_type };
    const roomBookingWhere = {};

    // Date filtering
    if (date_from && date_to) {
      roomBookingWhere.check_in_date = { 
        [Op.between]: [date_from, date_to] 
      };
    }

    // Status filtering
    if (booking_status) whereClause.status = booking_status;
    if (payment_status) whereClause.payment_status = payment_status;

    // Search filters
    if (booking_reference) {
      whereClause.booking_reference = { [Op.like]: `%${booking_reference}%` };
    }
    if (booking_source) whereClause.booking_source = booking_source;

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          where: Object.keys(roomBookingWhere).length > 0 ? roomBookingWhere : undefined,
          required: service_type === 'room',
          include: [
            {
              model: Room,
              as: 'room',
              attributes: ['inventory_id', 'unit_number', 'floor', 'status'],
              required: false
            }
          ]
        },
        {
          model: BookingGuest,
          as: 'guests',
          include: [
            {
              model: GuestProfile,
              as: 'guest',
              attributes: ['guest_id', 'first_name', 'last_name', 'email', 'phone'],
              where: guest_name ? {
                [Op.or]: [
                  { first_name: { [Op.like]: `%${guest_name}%` } },
                  { last_name: { [Op.like]: `%${guest_name}%` } }
                ]
              } : (guest_id ? { guest_id: parseInt(guest_id) } : undefined),
              required: !!(guest_name || guest_id)
            }
          ]
        },
        {
          model: BookingCharge,
          as: 'charges',
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate total charges for each booking
    const bookingsWithTotals = bookings.map(booking => {
      const bookingData = booking.toJSON();
      const totalCharges = bookingData.charges?.reduce((sum, charge) => sum + parseFloat(charge.total_amount), 0) || 0;
      const baseAmount = parseFloat(bookingData.roomBooking?.final_amount || bookingData.total_amount || 0);
      
      return {
        ...bookingData,
        base_amount: baseAmount,
        additional_charges: totalCharges,
        final_total: baseAmount + totalCharges
      };
    });

    res.json({
      success: true,
      data: bookingsWithTotals,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Booking.count({ where: whereClause })
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Get booking details by ID
router.get('/:booking_id', authMiddleware, [
  param('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required')
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

    const { booking_id } = req.params;

    const booking = await Booking.findByPk(booking_id, {
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
        },
        {
          model: BookingGuest,
          as: 'guests',
          include: [
            {
              model: GuestProfile,
              as: 'guest'
            }
          ]
        },
        {
          model: BookingCharge,
          as: 'charges',
          order: [['charged_at', 'DESC']]
        },
        {
          model: BookingModification,
          as: 'modifications',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Calculate totals
    const bookingData = booking.toJSON();
    const totalCharges = bookingData.charges?.reduce((sum, charge) => sum + parseFloat(charge.total_amount), 0) || 0;
    const baseAmount = parseFloat(bookingData.roomBooking?.final_amount || bookingData.total_amount || 0);

    res.json({
      success: true,
      data: {
        ...bookingData,
        base_amount: baseAmount,
        additional_charges: totalCharges,
        final_total: baseAmount + totalCharges
      }
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message
    });
  }
});

// Get booking statistics
router.get('/dashboard/statistics', authMiddleware, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    const dateFilter = {};
    if (date_from && date_to) {
      dateFilter.created_at = {
        [Op.between]: [date_from, date_to]
      };
    }

    // Booking status distribution
    const statusStats = await Booking.findAll({
      attributes: [
        'status',
        [Booking.sequelize.fn('COUNT', Booking.sequelize.col('booking_id')), 'count']
      ],
      where: { service_type: 'room', ...dateFilter },
      group: ['status'],
      raw: true
    });

    // Payment status distribution
    const paymentStats = await Booking.findAll({
      attributes: [
        'payment_status',
        [Booking.sequelize.fn('COUNT', Booking.sequelize.col('booking_id')), 'count']
      ],
      where: { service_type: 'room', ...dateFilter },
      group: ['payment_status'],
      raw: true
    });

    // Booking source distribution
    const sourceStats = await Booking.findAll({
      attributes: [
        'booking_source',
        [Booking.sequelize.fn('COUNT', Booking.sequelize.col('booking_id')), 'count']
      ],
      where: { service_type: 'room', ...dateFilter },
      group: ['booking_source'],
      raw: true
    });

    // Revenue statistics
    const revenueStats = await RoomBooking.findAll({
      attributes: [
        [RoomBooking.sequelize.fn('SUM', RoomBooking.sequelize.col('final_amount')), 'total_revenue'],
        [RoomBooking.sequelize.fn('AVG', RoomBooking.sequelize.col('final_amount')), 'avg_booking_value'],
        [RoomBooking.sequelize.fn('COUNT', RoomBooking.sequelize.col('booking_id')), 'total_bookings']
      ],
      include: [{
        model: Booking,
        as: 'booking',
        where: { service_type: 'room', ...dateFilter },
        attributes: []
      }],
      raw: true
    });

    res.json({
      success: true,
      data: {
        status_distribution: statusStats,
        payment_distribution: paymentStats,
        source_distribution: sourceStats,
        revenue_stats: revenueStats[0] || { total_revenue: 0, avg_booking_value: 0, total_bookings: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
});

module.exports = router;