const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Op } = require('sequelize');
const BookingGuest = require('../models/bookingGuest.model');
const Booking = require('../models/booking.model');
const GuestProfile = require('../models/guestProfile.model');
const RoomBooking = require('../models/roomBooking.model');
const Room = require('../models/room.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all booking guests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      booking_id,
      guest_name,
      guest_email,
      check_in_date,
      check_out_date,
      is_primary,
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};
    const guestWhereClause = {};
    const roomBookingWhereClause = {};

    if (booking_id) whereClause.booking_id = booking_id;
    if (is_primary !== undefined) whereClause.is_primary = is_primary === 'true';

    if (guest_name) {
      guestWhereClause[Op.or] = [
        { first_name: { [Op.like]: `%${guest_name}%` } },
        { last_name: { [Op.like]: `%${guest_name}%` } }
      ];
    }

    if (guest_email) {
      guestWhereClause.email = { [Op.like]: `%${guest_email}%` };
    }

    if (check_in_date && check_out_date) {
      roomBookingWhereClause.check_in_date = {
        [Op.between]: [check_in_date, check_out_date]
      };
    }

    const bookingGuests = await BookingGuest.findAll({
      where: whereClause,
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          where: Object.keys(guestWhereClause).length > 0 ? guestWhereClause : undefined,
          required: Object.keys(guestWhereClause).length > 0
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'guest_name', 'status', 'payment_status'],
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              where: Object.keys(roomBookingWhereClause).length > 0 ? roomBookingWhereClause : undefined,
              required: Object.keys(roomBookingWhereClause).length > 0,
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
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: bookingGuests,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total_count: await BookingGuest.count({ where: whereClause })
      }
    });
  } catch (error) {
    console.error('Error fetching booking guests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking guests',
      error: error.message
    });
  }
});

// Get booking guest by ID
router.get('/:booking_guest_id', authMiddleware, [
  param('booking_guest_id').isInt({ min: 1 }).withMessage('Valid booking guest ID is required')
], async (req, res) => {
  try {
    const { booking_guest_id } = req.params;

    const bookingGuest = await BookingGuest.findByPk(booking_guest_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest'
        },
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

    if (!bookingGuest) {
      return res.status(404).json({
        success: false,
        message: 'Booking guest not found'
      });
    }

    res.json({
      success: true,
      data: bookingGuest
    });
  } catch (error) {
    console.error('Error fetching booking guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking guest',
      error: error.message
    });
  }
});

// Add guest to booking
router.post('/', authMiddleware, [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
  body('guest_id').isInt({ min: 1 }).withMessage('Valid guest ID is required'),
  body('is_primary').optional().isBoolean().withMessage('is_primary must be a boolean value'),
  body('room_assignment').optional().isString().withMessage('room_assignment must be a string')
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

    const { booking_id, guest_id, is_primary = false, room_assignment } = req.body;

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if guest exists
    const guest = await GuestProfile.findByPk(guest_id);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Check if guest is already added to this booking
    const existingBookingGuest = await BookingGuest.findOne({
      where: { booking_id, guest_id }
    });

    if (existingBookingGuest) {
      return res.status(400).json({
        success: false,
        message: 'Guest is already added to this booking'
      });
    }

    // If setting as primary, ensure no other guest is primary for this booking
    if (is_primary) {
      await BookingGuest.update(
        { is_primary: false },
        { where: { booking_id } }
      );
    }

    // Create booking guest
    const createData = {
      booking_id,
      guest_id,
      is_primary
    };
    
    if (room_assignment) {
      createData.room_assignment = room_assignment;
    }

    const bookingGuest = await BookingGuest.create(createData);

    // Fetch complete booking guest data
    const completeBookingGuest = await BookingGuest.findByPk(bookingGuest.booking_guest_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest'
        },
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
      message: 'Guest added to booking successfully',
      data: completeBookingGuest
    });
  } catch (error) {
    console.error('Error adding guest to booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add guest to booking',
      error: error.message
    });
  }
});

// Update booking guest
router.put('/:booking_guest_id', authMiddleware, [
  param('booking_guest_id').isInt({ min: 1 }).withMessage('Valid booking guest ID is required'),
  body('is_primary').optional().isBoolean().withMessage('is_primary must be a boolean value'),
  body('room_assignment').optional().isString().withMessage('room_assignment must be a string')
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

    const { booking_guest_id } = req.params;
    const { is_primary, room_assignment } = req.body;

    const bookingGuest = await BookingGuest.findByPk(booking_guest_id);
    if (!bookingGuest) {
      return res.status(404).json({
        success: false,
        message: 'Booking guest not found'
      });
    }

    // If setting as primary, ensure no other guest is primary for this booking
    if (is_primary === true) {
      await BookingGuest.update(
        { is_primary: false },
        { 
          where: { 
            booking_id: bookingGuest.booking_id,
            booking_guest_id: { [Op.ne]: booking_guest_id }
          } 
        }
      );
    }

    // Prepare update data
    const updateData = {};
    if (is_primary !== undefined) updateData.is_primary = is_primary;
    if (room_assignment !== undefined) updateData.room_assignment = room_assignment;

    await bookingGuest.update(updateData);

    const updatedBookingGuest = await BookingGuest.findByPk(booking_guest_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest'
        },
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
      message: 'Booking guest updated successfully',
      data: updatedBookingGuest
    });
  } catch (error) {
    console.error('Error updating booking guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking guest',
      error: error.message
    });
  }
});

// Remove guest from booking
router.delete('/:booking_guest_id', authMiddleware, [
  param('booking_guest_id').isInt({ min: 1 }).withMessage('Valid booking guest ID is required')
], async (req, res) => {
  try {
    const { booking_guest_id } = req.params;

    const bookingGuest = await BookingGuest.findByPk(booking_guest_id);
    if (!bookingGuest) {
      return res.status(404).json({
        success: false,
        message: 'Booking guest not found'
      });
    }

    // Check if this is the only guest in the booking
    const guestCount = await BookingGuest.count({
      where: { booking_id: bookingGuest.booking_id }
    });

    if (guestCount === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the only guest from a booking. At least one guest is required.'
      });
    }

    // If removing primary guest, make another guest primary
    if (bookingGuest.is_primary) {
      const otherGuest = await BookingGuest.findOne({
        where: { 
          booking_id: bookingGuest.booking_id,
          booking_guest_id: { [Op.ne]: booking_guest_id }
        }
      });

      if (otherGuest) {
        await otherGuest.update({ is_primary: true });
      }
    }

    await bookingGuest.destroy();

    res.json({
      success: true,
      message: 'Guest removed from booking successfully'
    });
  } catch (error) {
    console.error('Error removing guest from booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove guest from booking',
      error: error.message
    });
  }
});

// Get all guest profiles (for dropdown selection)
router.get('/guest-profiles', authMiddleware, async (req, res) => {
  try {
    const guestProfiles = await GuestProfile.findAll({
      attributes: ['guest_id', 'first_name', 'last_name', 'email', 'phone', 'nationality'],
      order: [['first_name', 'ASC'], ['last_name', 'ASC']]
    });

    res.json({
      success: true,
      data: guestProfiles
    });
  } catch (error) {
    console.error('Error fetching guest profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest profiles',
      error: error.message
    });
  }
});

// Get guests by booking ID
router.get('/booking/:booking_id', authMiddleware, [
  param('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required')
], async (req, res) => {
  try {
    const { booking_id } = req.params;

    const bookingGuests = await BookingGuest.findAll({
      where: { booking_id },
      include: [
        {
          model: GuestProfile,
          as: 'guest'
        }
      ],
      order: [['is_primary', 'DESC'], ['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: bookingGuests
    });
  } catch (error) {
    console.error('Error fetching guests by booking ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guests for booking',
      error: error.message
    });
  }
});

// Get guest statistics
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

    // Total guests in bookings
    const totalGuests = await BookingGuest.count({
      where: dateFilter,
      include: [{
        model: Booking,
        as: 'booking',
        where: { status: ['confirmed', 'checked_in', 'checked_out'] },
        required: true
      }]
    });

    // Primary vs secondary guests
    const primaryGuestCount = await BookingGuest.count({
      where: { ...dateFilter, is_primary: true },
      include: [{
        model: Booking,
        as: 'booking',
        where: { status: ['confirmed', 'checked_in', 'checked_out'] },
        required: true
      }]
    });

    // Repeat guests (guests with multiple bookings)
    const repeatGuests = await BookingGuest.findAll({
      attributes: [
        'guest_id',
        [BookingGuest.sequelize.fn('COUNT', BookingGuest.sequelize.col('booking_guest_id')), 'booking_count']
      ],
      where: dateFilter,
      include: [{
        model: Booking,
        as: 'booking',
        where: { status: ['confirmed', 'checked_in', 'checked_out'] },
        attributes: [],
        required: true
      }],
      group: ['guest_id'],
      having: BookingGuest.sequelize.where(
        BookingGuest.sequelize.fn('COUNT', BookingGuest.sequelize.col('booking_guest_id')),
        Op.gt,
        1
      ),
      raw: true
    });

    // Guest nationality distribution (if available in guest profile)
    const nationalityStats = await BookingGuest.findAll({
      attributes: [
        [BookingGuest.sequelize.col('guest.nationality'), 'nationality'],
        [BookingGuest.sequelize.fn('COUNT', BookingGuest.sequelize.col('booking_guest_id')), 'count']
      ],
      where: dateFilter,
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: [],
          where: { nationality: { [Op.ne]: null } },
          required: true
        },
        {
          model: Booking,
          as: 'booking',
          where: { status: ['confirmed', 'checked_in', 'checked_out'] },
          attributes: [],
          required: true
        }
      ],
      group: ['guest.nationality'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_guests: totalGuests,
        primary_guests: primaryGuestCount,
        secondary_guests: totalGuests - primaryGuestCount,
        repeat_guests: repeatGuests.length,
        nationality_distribution: nationalityStats
      }
    });
  } catch (error) {
    console.error('Error fetching guest statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest statistics',
      error: error.message
    });
  }
});

module.exports = router;