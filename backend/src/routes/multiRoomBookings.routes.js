const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Op } = require('sequelize');
const MultiRoomBooking = require('../models/multiRoomBooking.model');
const Booking = require('../models/booking.model');
const RoomBooking = require('../models/roomBooking.model');
const Room = require('../models/room.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all multi-room bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      group_name,
      booking_id,
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};

    if (group_name) {
      whereClause.group_name = { [Op.like]: `%${group_name}%` };
    }
    if (booking_id) {
      whereClause.booking_id = booking_id;
    }

    const multiRoomBookings = await MultiRoomBooking.findAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'guest_name', 'status', 'total_amount']
        },
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
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: multiRoomBookings,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total_count: await MultiRoomBooking.count({ where: whereClause })
      }
    });
  } catch (error) {
    console.error('Error fetching multi-room bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch multi-room bookings',
      error: error.message
    });
  }
});

// Get multi-room booking by ID
router.get('/:group_booking_id', authMiddleware, [
  param('group_booking_id').isInt({ min: 1 }).withMessage('Valid group booking ID is required')
], async (req, res) => {
  try {
    const { group_booking_id } = req.params;

    const multiRoomBooking = await MultiRoomBooking.findByPk(group_booking_id, {
      include: [
        {
          model: Booking,
          as: 'booking'
        },
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
    });

    if (!multiRoomBooking) {
      return res.status(404).json({
        success: false,
        message: 'Multi-room booking not found'
      });
    }

    res.json({
      success: true,
      data: multiRoomBooking
    });
  } catch (error) {
    console.error('Error fetching multi-room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch multi-room booking',
      error: error.message
    });
  }
});

// Get all rooms in a group booking
router.get('/group/:booking_id', authMiddleware, [
  param('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required')
], async (req, res) => {
  try {
    const { booking_id } = req.params;

    const groupBookings = await MultiRoomBooking.findAll({
      where: { booking_id },
      include: [
        {
          model: Booking,
          as: 'booking'
        },
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
      ],
      order: [['is_master_booking', 'DESC'], ['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: groupBookings
    });
  } catch (error) {
    console.error('Error fetching group bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group bookings',
      error: error.message
    });
  }
});

// Create multi-room booking
router.post('/', authMiddleware, [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
  body('room_booking_id').isInt({ min: 1 }).withMessage('Valid room booking ID is required'),
  body('group_name').optional().isString().withMessage('Group name must be a string'),
  body('is_master_booking').optional().isBoolean().withMessage('is_master_booking must be a boolean')
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

    const { booking_id, room_booking_id, group_name, is_master_booking = false } = req.body;

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if room booking exists
    const roomBooking = await RoomBooking.findByPk(room_booking_id);
    if (!roomBooking) {
      return res.status(404).json({
        success: false,
        message: 'Room booking not found'
      });
    }

    // Check if this room booking is already part of a multi-room booking
    const existingMultiRoom = await MultiRoomBooking.findOne({
      where: { room_booking_id }
    });

    if (existingMultiRoom) {
      return res.status(400).json({
        success: false,
        message: 'This room booking is already part of a multi-room booking'
      });
    }

    // If setting as master, ensure no other booking is master for this group
    if (is_master_booking) {
      await MultiRoomBooking.update(
        { is_master_booking: false },
        { where: { booking_id } }
      );
    }

    // Create multi-room booking
    const multiRoomBooking = await MultiRoomBooking.create({
      booking_id,
      room_booking_id,
      group_name,
      is_master_booking
    });

    // Fetch complete data
    const completeMultiRoomBooking = await MultiRoomBooking.findByPk(multiRoomBooking.group_booking_id, {
      include: [
        {
          model: Booking,
          as: 'booking'
        },
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
    });

    res.status(201).json({
      success: true,
      message: 'Multi-room booking created successfully',
      data: completeMultiRoomBooking
    });
  } catch (error) {
    console.error('Error creating multi-room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create multi-room booking',
      error: error.message
    });
  }
});

// Update multi-room booking
router.put('/:group_booking_id', authMiddleware, [
  param('group_booking_id').isInt({ min: 1 }).withMessage('Valid group booking ID is required'),
  body('group_name').optional().isString().withMessage('Group name must be a string'),
  body('is_master_booking').optional().isBoolean().withMessage('is_master_booking must be a boolean')
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

    const { group_booking_id } = req.params;
    const { group_name, is_master_booking } = req.body;

    const multiRoomBooking = await MultiRoomBooking.findByPk(group_booking_id);
    if (!multiRoomBooking) {
      return res.status(404).json({
        success: false,
        message: 'Multi-room booking not found'
      });
    }

    // If setting as master, ensure no other booking is master for this group
    if (is_master_booking === true) {
      await MultiRoomBooking.update(
        { is_master_booking: false },
        { 
          where: { 
            booking_id: multiRoomBooking.booking_id,
            group_booking_id: { [Op.ne]: group_booking_id }
          } 
        }
      );
    }

    // Prepare update data
    const updateData = {};
    if (group_name !== undefined) updateData.group_name = group_name;
    if (is_master_booking !== undefined) updateData.is_master_booking = is_master_booking;

    await multiRoomBooking.update(updateData);

    const updatedMultiRoomBooking = await MultiRoomBooking.findByPk(group_booking_id, {
      include: [
        {
          model: Booking,
          as: 'booking'
        },
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
    });

    res.json({
      success: true,
      message: 'Multi-room booking updated successfully',
      data: updatedMultiRoomBooking
    });
  } catch (error) {
    console.error('Error updating multi-room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update multi-room booking',
      error: error.message
    });
  }
});

// Delete multi-room booking
router.delete('/:group_booking_id', authMiddleware, [
  param('group_booking_id').isInt({ min: 1 }).withMessage('Valid group booking ID is required')
], async (req, res) => {
  try {
    const { group_booking_id } = req.params;

    const multiRoomBooking = await MultiRoomBooking.findByPk(group_booking_id);
    if (!multiRoomBooking) {
      return res.status(404).json({
        success: false,
        message: 'Multi-room booking not found'
      });
    }

    await multiRoomBooking.destroy();

    res.json({
      success: true,
      message: 'Multi-room booking removed successfully'
    });
  } catch (error) {
    console.error('Error deleting multi-room booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete multi-room booking',
      error: error.message
    });
  }
});

module.exports = router;