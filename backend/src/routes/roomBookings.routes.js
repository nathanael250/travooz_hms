const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Op } = require('sequelize');
const RoomBooking = require('../models/roomBooking.model');
const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const BookingGuest = require('../models/bookingGuest.model');
const GuestProfile = require('../models/guestProfile.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all room bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      check_in_date,
      check_out_date,
      room_id,
      booking_status,
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};
    
    if (check_in_date && check_out_date) {
      whereClause[Op.or] = [
        {
          check_in_date: {
            [Op.between]: [check_in_date, check_out_date]
          }
        },
        {
          check_out_date: {
            [Op.between]: [check_in_date, check_out_date]
          }
        }
      ];
    }

    if (room_id) whereClause.room_id = room_id;

    const roomBookings = await RoomBooking.findAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          where: booking_status ? { status: booking_status } : {},
          include: [
            {
              model: BookingGuest,
              as: 'guests',
              include: [
                {
                  model: GuestProfile,
                  as: 'guest',
                  attributes: ['guest_id', 'first_name', 'last_name', 'email', 'phone']
                }
              ]
            }
          ]
        },
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'floor', 'room_type']
        }
      ],
      order: [['check_in_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: roomBookings,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total_count: await RoomBooking.count({ where: whereClause })
      }
    });
  } catch (error) {
    console.error('Error fetching room bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room bookings',
      error: error.message
    });
  }
});

// Create new room booking
router.post('/', authMiddleware, [
  body('room_id').isInt({ min: 1 }).withMessage('Valid room ID is required'),
  body('check_in_date').isISO8601().withMessage('Valid check-in date is required'),
  body('check_out_date').isISO8601().withMessage('Valid check-out date is required'),
  body('adults').isInt({ min: 1 }).withMessage('Number of adults must be at least 1'),
  body('children').optional().isInt({ min: 0 }).withMessage('Number of children must be 0 or more'),
  body('room_rate').isDecimal().withMessage('Valid room rate is required'),
  body('booking_data.booking_reference').notEmpty().withMessage('Booking reference is required'),
  body('booking_data.guest_name').notEmpty().withMessage('Guest name is required'),
  body('guests').isArray({ min: 1 }).withMessage('At least one guest is required')
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
      room_id,
      check_in_date,
      check_out_date,
      adults,
      children = 0,
      room_rate,
      discount_amount = 0,
      tax_amount = 0,
      booking_data,
      guests
    } = req.body;

    // Check room availability
    const existingBooking = await RoomBooking.findOne({
      where: {
        room_id,
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

    // Create main booking
    const booking = await Booking.create({
      booking_reference: booking_data.booking_reference,
      guest_name: booking_data.guest_name,
      service_type: 'room',
      status: 'confirmed',
      payment_status: 'pending',
      booking_source: booking_data.booking_source || 'direct',
      total_amount: final_amount,
      created_by: req.user.user_id
    });

    // Create room booking
    const roomBooking = await RoomBooking.create({
      booking_id: booking.booking_id,
      room_id,
      check_in_date,
      check_out_date,
      adults,
      children,
      nights,
      room_rate,
      discount_amount,
      tax_amount,
      final_amount
    });

    // Create booking guests
    const guestCreationPromises = guests.map(guest => 
      BookingGuest.create({
        booking_id: booking.booking_id,
        guest_id: guest.guest_id,
        is_primary: guest.is_primary || false
      })
    );

    await Promise.all(guestCreationPromises);

    // Fetch complete booking data
    const completeBooking = await RoomBooking.findByPk(roomBooking.room_booking_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: BookingGuest,
              as: 'guests',
              include: [
                {
                  model: GuestProfile,
                  as: 'guest'
                }
              ]
            }
          ]
        },
        {
          model: Room,
          as: 'room'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Room booking created successfully',
      data: completeBooking
    });
  } catch (error) {
    console.error('Error creating room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room booking',
      error: error.message
    });
  }
});

// Update room booking
router.put('/:room_booking_id', authMiddleware, [
  param('room_booking_id').isInt({ min: 1 }).withMessage('Valid room booking ID is required'),
  body('check_in_date').optional().isISO8601().withMessage('Valid check-in date is required'),
  body('check_out_date').optional().isISO8601().withMessage('Valid check-out date is required'),
  body('adults').optional().isInt({ min: 1 }).withMessage('Number of adults must be at least 1'),
  body('children').optional().isInt({ min: 0 }).withMessage('Number of children must be 0 or more'),
  body('room_rate').optional().isDecimal().withMessage('Valid room rate is required')
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

    const { room_booking_id } = req.params;
    const updateData = req.body;

    const roomBooking = await RoomBooking.findByPk(room_booking_id);
    if (!roomBooking) {
      return res.status(404).json({
        success: false,
        message: 'Room booking not found'
      });
    }

    // If dates are being updated, check availability
    if (updateData.check_in_date || updateData.check_out_date) {
      const checkInDate = updateData.check_in_date || roomBooking.check_in_date;
      const checkOutDate = updateData.check_out_date || roomBooking.check_out_date;

      const conflictingBooking = await RoomBooking.findOne({
        where: {
          room_id: roomBooking.room_id,
          room_booking_id: { [Op.ne]: room_booking_id },
          [Op.or]: [
            {
              check_in_date: {
                [Op.lt]: checkOutDate
              },
              check_out_date: {
                [Op.gt]: checkInDate
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

      if (conflictingBooking) {
        return res.status(400).json({
          success: false,
          message: 'Room is not available for the selected dates'
        });
      }

      // Recalculate nights and amount if dates changed
      if (updateData.check_in_date || updateData.check_out_date) {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const rate = updateData.room_rate || roomBooking.room_rate;
        const subtotal = rate * nights;
        const finalAmount = subtotal - (roomBooking.discount_amount || 0) + (roomBooking.tax_amount || 0);

        updateData.nights = nights;
        updateData.final_amount = finalAmount;
      }
    }

    await roomBooking.update(updateData);

    // Update main booking total if final amount changed
    if (updateData.final_amount) {
      await Booking.update(
        { total_amount: updateData.final_amount },
        { where: { booking_id: roomBooking.booking_id } }
      );
    }

    const updatedRoomBooking = await RoomBooking.findByPk(room_booking_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: BookingGuest,
              as: 'guests',
              include: [
                {
                  model: GuestProfile,
                  as: 'guest'
                }
              ]
            }
          ]
        },
        {
          model: Room,
          as: 'room'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Room booking updated successfully',
      data: updatedRoomBooking
    });
  } catch (error) {
    console.error('Error updating room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room booking',
      error: error.message
    });
  }
});

// Cancel room booking
router.delete('/:room_booking_id', authMiddleware, [
  param('room_booking_id').isInt({ min: 1 }).withMessage('Valid room booking ID is required')
], async (req, res) => {
  try {
    const { room_booking_id } = req.params;

    const roomBooking = await RoomBooking.findByPk(room_booking_id, {
      include: [{
        model: Booking,
        as: 'booking'
      }]
    });

    if (!roomBooking) {
      return res.status(404).json({
        success: false,
        message: 'Room booking not found'
      });
    }

    // Update booking status to cancelled
    await Booking.update(
      { status: 'cancelled' },
      { where: { booking_id: roomBooking.booking_id } }
    );

    res.json({
      success: true,
      message: 'Room booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel room booking',
      error: error.message
    });
  }
});

module.exports = router;