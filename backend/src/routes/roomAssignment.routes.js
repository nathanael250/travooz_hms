const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { Op } = require('sequelize');
const Booking = require('../models/booking.model');
const RoomBooking = require('../models/roomBooking.model');
const BookingGuest = require('../models/bookingGuest.model');
const Room = require('../models/room.model');
const RoomType = require('../models/roomType.model');
const RoomAvailability = require('../models/roomAvailability.model');
const RoomAssignment = require('../models/roomAssignment.model');
const User = require('../models/user.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all room bookings with assignment details
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      status, 
      check_in_date, 
      check_out_date, 
      unassigned_only,
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};
    const bookingWhereClause = {};

    if (status) bookingWhereClause.status = status;
    if (check_in_date && check_out_date) {
      whereClause.check_in_date = { [Op.between]: [check_in_date, check_out_date] };
    }

    // For unassigned bookings, we need to find bookings without room assignments
    if (unassigned_only === 'true') {
      whereClause.inventory_id = { [Op.is]: null };
    }

    // Show all bookings (both assigned and unassigned) unless filtered
    const roomBookings = await RoomBooking.findAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          where: {
            service_type: 'room',
            ...bookingWhereClause
          },
          attributes: ['booking_id', 'booking_reference', 'status', 'payment_status', 'user_id']
        },
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'floor', 'status'],
          required: false
        },
        {
          model: RoomType,
          as: 'roomType',
          attributes: ['room_type_id', 'name', 'price', 'max_people'],
          required: false
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
        total: await RoomBooking.count({ 
          where: whereClause,
          include: [{
            model: Booking,
            as: 'booking',
            where: { service_type: 'room', ...bookingWhereClause }
          }]
        })
      }
    });
  } catch (error) {
    console.error('Error fetching room assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room assignments',
      error: error.message
    });
  }
});

// Get available rooms for assignment
router.get('/available-rooms', authMiddleware, [
  query('check_in_date').isISO8601().withMessage('Valid check-in date is required'),
  query('check_out_date').isISO8601().withMessage('Valid check-out date is required'),
  query('guests').optional().isInt({ min: 1 }).withMessage('Guests must be a positive integer')
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

    const { check_in_date, check_out_date, guests = 1, room_type_id } = req.query;

    // Get occupied rooms during the date range
    const occupiedRooms = await RoomBooking.findAll({
      attributes: ['inventory_id'],
      where: {
        inventory_id: { [Op.not]: null }, // Only get bookings with assigned rooms
        [Op.or]: [
          {
            check_in_date: { [Op.between]: [check_in_date, check_out_date] }
          },
          {
            check_out_date: { [Op.between]: [check_in_date, check_out_date] }
          },
          {
            [Op.and]: [
              { check_in_date: { [Op.lte]: check_in_date } },
              { check_out_date: { [Op.gte]: check_out_date } }
            ]
          }
        ]
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: { status: { [Op.in]: ['confirmed', 'pending'] } }
      }]
    });

    // Filter out null values and get unique room IDs
    const occupiedRoomIds = occupiedRooms
      .map(rb => rb.inventory_id)
      .filter(id => id !== null);

    // Get available rooms (exclude rooms that are out of service or under maintenance)
    const whereClause = {
      status: { [Op.notIn]: ['out_of_service', 'maintenance'] }
    };

    // Only add the notIn clause if there are actually occupied rooms
    if (occupiedRoomIds.length > 0) {
      whereClause.inventory_id = { [Op.notIn]: occupiedRoomIds };
    }

    if (room_type_id) whereClause.room_type_id = room_type_id;

    const availableRooms = await Room.findAll({
      where: whereClause,
      include: [
        {
          model: RoomAvailability,
          as: 'availability',
          where: {
            date: { [Op.between]: [check_in_date, check_out_date] },
            closed: false
          },
          required: false
        },
        {
          model: RoomType,
          as: 'roomType',
          attributes: ['room_type_id', 'name', 'description', 'max_people', 'price']
        }
      ],
      order: [['unit_number', 'ASC']]
    });

    console.log('Available rooms query result:', {
      count: availableRooms.length,
      whereClause,
      occupiedRoomIds,
      rooms: availableRooms.map(r => ({ id: r.inventory_id, unit: r.unit_number, type_id: r.room_type_id }))
    });

    res.json({
      success: true,
      data: availableRooms,
      filters: {
        check_in_date,
        check_out_date,
        guests,
        room_type_id
      }
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error.message
    });
  }
});

// Assign room to booking (Manual Assignment)
router.post('/assign', authMiddleware, [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
  body('inventory_id').isInt({ min: 1 }).withMessage('Valid room inventory ID is required'),
  body('assignment_type').isIn(['manual', 'auto']).withMessage('Valid assignment type is required')
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

    const { booking_id, inventory_id, assignment_type, notes } = req.body;

    // Check if booking exists and is for room service
    const booking = await Booking.findOne({
      where: {
        booking_id,
        service_type: 'room',
        status: { [Op.in]: ['pending', 'confirmed'] }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Room booking not found or cannot be assigned'
      });
    }

    // Check if room exists and is not out of service
    const room = await Room.findOne({
      where: {
        inventory_id,
        status: { [Op.notIn]: ['out_of_service', 'maintenance'] }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or is out of service'
      });
    }

    // Get room booking details
    const roomBooking = await RoomBooking.findOne({
      where: { booking_id }
    });

    if (!roomBooking) {
      return res.status(404).json({
        success: false,
        message: 'Room booking details not found'
      });
    }

    // Check room availability for the booking dates
    const conflictingBookings = await RoomBooking.findAll({
      where: {
        inventory_id,
        booking_id: { [Op.ne]: booking_id },
        [Op.or]: [
          {
            check_in_date: { 
              [Op.between]: [roomBooking.check_in_date, roomBooking.check_out_date] 
            }
          },
          {
            check_out_date: { 
              [Op.between]: [roomBooking.check_in_date, roomBooking.check_out_date] 
            }
          },
          {
            [Op.and]: [
              { check_in_date: { [Op.lte]: roomBooking.check_in_date } },
              { check_out_date: { [Op.gte]: roomBooking.check_out_date } }
            ]
          }
        ]
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: { status: { [Op.in]: ['confirmed', 'pending'] } }
      }]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Start transaction
    const transaction = await RoomBooking.sequelize.transaction();

    try {
      // Check if room assignment already exists
      const existingAssignment = await RoomAssignment.findOne({
        where: {
          booking_id,
          status: { [Op.in]: ['assigned', 'checked_in'] }
        },
        transaction
      });

      if (existingAssignment) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Room already assigned to this booking. Please unassign first.'
        });
      }

      // Create room assignment record
      await RoomAssignment.create({
        booking_id,
        inventory_id,
        assigned_by: req.user.user_id,
        status: 'assigned',
        notes: notes || `Room assigned ${assignment_type}ally`
      }, { transaction });

      // Update room booking with room assignment
      await roomBooking.update({
        inventory_id,
        internal_notes: notes ? `${roomBooking.internal_notes || ''}\nRoom assigned ${assignment_type}ally: ${notes}`.trim() : roomBooking.internal_notes
      }, { transaction });

      // NOTE: Room status is NOT updated here. Room status should only change during check-in/check-out.
      // Room availability is determined by checking for conflicting bookings, not by room status.
      // This allows the same room to be assigned to multiple bookings for different date ranges.

      // Update booking guests with room assignment
      await BookingGuest.update({
        room_assignment: room.unit_number
      }, {
        where: { booking_id },
        transaction
      });

      await transaction.commit();

      // Fetch updated room booking with relations
      const updatedRoomBooking = await RoomBooking.findOne({
        where: { booking_id },
        include: [
          {
            model: Booking,
            as: 'booking',
            attributes: ['booking_id', 'booking_reference', 'status', 'payment_status']
          },
          {
            model: Room,
            as: 'room',
            attributes: ['inventory_id', 'unit_number', 'floor', 'status']
          }
        ]
      });

      res.json({
        success: true,
        message: `Room ${assignment_type}ally assigned successfully`,
        data: updatedRoomBooking
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error assigning room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign room',
      error: error.message
    });
  }
});

// Auto-assign rooms based on availability and preferences
router.post('/auto-assign', authMiddleware, [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
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

    const { booking_id, preferences = {} } = req.body;
    const { room_type_id, floor_preference, proximity_to } = preferences;

    // Get booking and room booking details
    const roomBooking = await RoomBooking.findOne({
      where: { booking_id },
      include: [{
        model: Booking,
        as: 'booking',
        where: {
          service_type: 'room',
          status: { [Op.in]: ['pending', 'confirmed'] }
        }
      }]
    });

    if (!roomBooking) {
      return res.status(404).json({
        success: false,
        message: 'Room booking not found'
      });
    }

    // Get occupied rooms during the date range
    const occupiedRooms = await RoomBooking.findAll({
      attributes: ['inventory_id'],
      where: {
        booking_id: { [Op.ne]: booking_id },
        [Op.or]: [
          {
            check_in_date: { 
              [Op.between]: [roomBooking.check_in_date, roomBooking.check_out_date] 
            }
          },
          {
            check_out_date: { 
              [Op.between]: [roomBooking.check_in_date, roomBooking.check_out_date] 
            }
          },
          {
            [Op.and]: [
              { check_in_date: { [Op.lte]: roomBooking.check_in_date } },
              { check_out_date: { [Op.gte]: roomBooking.check_out_date } }
            ]
          }
        ]
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: { status: { [Op.in]: ['confirmed', 'pending'] } }
      }]
    });

    const occupiedRoomIds = occupiedRooms.map(rb => rb.inventory_id);

    // Build where clause for available rooms
    const whereClause = {
      status: 'available',
      inventory_id: { [Op.notIn]: occupiedRoomIds }
    };

    if (room_type_id) whereClause.room_type_id = room_type_id;
    if (floor_preference) whereClause.floor = floor_preference;

    // Get available rooms sorted by preference
    const availableRooms = await Room.findAll({
      where: whereClause,
      order: [
        ['unit_number', 'ASC'] // Default sorting, can be enhanced with more sophisticated logic
      ]
    });

    if (availableRooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No available rooms found for auto-assignment'
      });
    }

    // Select the best room (first available based on criteria)
    const selectedRoom = availableRooms[0];

    // Assign the room using the same logic as manual assignment
    const transaction = await RoomBooking.sequelize.transaction();

    try {
      // Check if room assignment already exists
      const existingAssignment = await RoomAssignment.findOne({
        where: {
          booking_id,
          status: { [Op.in]: ['assigned', 'checked_in'] }
        },
        transaction
      });

      if (existingAssignment) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Room already assigned to this booking. Please unassign first.'
        });
      }

      // Create room assignment record
      await RoomAssignment.create({
        booking_id,
        inventory_id: selectedRoom.inventory_id,
        assigned_by: req.user.user_id,
        status: 'assigned',
        notes: 'Room assigned automatically based on availability and preferences'
      }, { transaction });

      // Update room booking with room assignment
      await roomBooking.update({
        inventory_id: selectedRoom.inventory_id,
        internal_notes: `${roomBooking.internal_notes || ''}\nRoom assigned automatically based on availability and preferences`.trim()
      }, { transaction });

      // Update room status to reserved if booking is confirmed
      if (roomBooking.booking.status === 'confirmed') {
        await selectedRoom.update({
          status: 'reserved'
        }, { transaction });
      }

      // Update booking guests with room assignment
      await BookingGuest.update({
        room_assignment: selectedRoom.unit_number
      }, {
        where: { booking_id },
        transaction
      });

      await transaction.commit();

      const assignmentResult = {
        booking_id,
        inventory_id: selectedRoom.inventory_id,
        room: selectedRoom
      };

      res.json({
        success: true,
        message: 'Room auto-assigned successfully',
        data: {
          ...assignmentResult,
          total_available_rooms: availableRooms.length,
          assignment_criteria: preferences
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error auto-assigning room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-assign room',
      error: error.message
    });
  }
});

// Unassign room from booking
router.post('/unassign', authMiddleware, [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
  body('reason').optional().isLength({ max: 255 }).withMessage('Reason must not exceed 255 characters')
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

    const { booking_id, reason } = req.body;

    const roomBooking = await RoomBooking.findOne({
      where: { booking_id },
      include: [
        {
          model: Booking,
          as: 'booking'
        },
        {
          model: Room,
          as: 'room'
        }
      ]
    });

    if (!roomBooking || !roomBooking.inventory_id) {
      return res.status(404).json({
        success: false,
        message: 'Room assignment not found'
      });
    }

    const transaction = await RoomBooking.sequelize.transaction();

    try {
      const previousRoomId = roomBooking.inventory_id;
      
      // Cancel room assignment record
      await RoomAssignment.update({
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
      }, {
        where: {
          booking_id,
          status: { [Op.in]: ['assigned', 'checked_in'] }
        },
        transaction
      });

      // Remove room assignment
      await roomBooking.update({
        inventory_id: null,
        internal_notes: reason ? `${roomBooking.internal_notes || ''}\nRoom unassigned: ${reason}`.trim() : roomBooking.internal_notes
      }, { transaction });

      // Update room status back to available if it was reserved
      if (roomBooking.room && roomBooking.room.status === 'reserved') {
        await roomBooking.room.update({
          status: 'available'
        }, { transaction });
      }

      // Remove room assignment from booking guests
      await BookingGuest.update({
        room_assignment: null
      }, {
        where: { booking_id },
        transaction
      });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Room unassigned successfully',
        data: {
          booking_id,
          previous_room_id: previousRoomId,
          reason
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error unassigning room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign room',
      error: error.message
    });
  }
});

// Get assignment statistics
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const whereClause = {};
    if (start_date && end_date) {
      whereClause.check_in_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Get assignment statistics
    // Only count bookings with service_type 'room'
    const totalBookings = await RoomBooking.count({
      where: {
        ...whereClause
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: { service_type: 'room' }
      }]
    });

    // Only count as assigned if inventory_id is not null
    const assignedBookings = await RoomBooking.count({
      where: {
        ...whereClause,
        inventory_id: { [Op.not]: null }
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: { service_type: 'room' }
      }]
    });

    // Only count as unassigned if inventory_id is null
    const unassignedBookings = await RoomBooking.count({
      where: {
        ...whereClause,
        inventory_id: { [Op.is]: null }
      },
      include: [{
        model: Booking,
        as: 'booking',
        where: { service_type: 'room' }
      }]
    });

    // Room occupancy by status
    const roomStatusCount = await Room.findAll({
      attributes: [
        'status',
        [Room.sequelize.fn('COUNT', Room.sequelize.col('inventory_id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Most popular rooms
    const popularRooms = await RoomBooking.findAll({
      attributes: [
        'inventory_id',
        [RoomBooking.sequelize.fn('COUNT', RoomBooking.sequelize.col('booking_id')), 'booking_count']
      ],
      where: {
        ...whereClause,
        inventory_id: { [Op.not]: null }
      },
      include: [{
        model: Room,
        as: 'room',
        attributes: ['unit_number', 'floor']
      }],
      group: ['inventory_id'],
      order: [[RoomBooking.sequelize.literal('booking_count'), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        assignment_summary: {
          total_bookings: totalBookings,
          assigned_bookings: assignedBookings,
          unassigned_bookings: unassignedBookings,
          assignment_rate: totalBookings > 0 ? ((assignedBookings / totalBookings) * 100).toFixed(2) : 0
        },
        room_status_distribution: roomStatusCount,
        popular_rooms: popularRooms,
        period: { start_date, end_date }
      }
    });
  } catch (error) {
    console.error('Error fetching assignment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment statistics',
      error: error.message
    });
  }
});

// Search for guests and their bookings
router.get('/search-guest', authMiddleware, [
  query('search').notEmpty().withMessage('Search term is required')
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

    const { search } = req.query;

    // Search for bookings using OR condition at the top level
    const bookings = await Booking.findAll({
      where: {
        service_type: 'room',
        status: { [Op.in]: ['confirmed', 'pending'] }
      },
      include: [
        {
          model: User,
          as: 'user',
          required: false,
          attributes: ['user_id', 'name', 'email', 'phone']
        },
        {
          model: RoomBooking,
          as: 'roomBooking',
          required: false,
          include: [
            {
              model: Room,
              as: 'room',
              required: false,
              attributes: ['inventory_id', 'unit_number', 'floor', 'status']
            }
          ]
        },
        {
          model: RoomAssignment,
          as: 'roomAssignments',
          required: false,
          include: [
            {
              model: Room,
              as: 'room',
              attributes: ['inventory_id', 'unit_number', 'floor', 'status']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Filter results in JavaScript for more flexibility
    const filteredBookings = bookings.filter(booking => {
      // Check booking reference
      if (booking.booking_reference && booking.booking_reference.toLowerCase().includes(search.toLowerCase())) {
        return true;
      }

      // Check user name, email, phone
      if (booking.user) {
        if (booking.user.name && booking.user.name.toLowerCase().includes(search.toLowerCase())) return true;
        if (booking.user.email && booking.user.email.toLowerCase().includes(search.toLowerCase())) return true;
        if (booking.user.phone && booking.user.phone.toLowerCase().includes(search.toLowerCase())) return true;
      }

      // Check room booking guest name and email
      if (booking.roomBooking) {
        if (booking.roomBooking.guest_name && booking.roomBooking.guest_name.toLowerCase().includes(search.toLowerCase())) return true;
        if (booking.roomBooking.guest_email && booking.roomBooking.guest_email.toLowerCase().includes(search.toLowerCase())) return true;
      }

      return false;
    });

    res.json({
      success: true,
      data: filteredBookings.slice(0, 20),
      search_term: search
    });
  } catch (error) {
    console.error('Error searching for guests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search for guests',
      error: error.message
    });
  }
});

// Create a room assignment (when guest arrives and room is assigned)
router.post('/create-assignment', authMiddleware, [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
  body('inventory_id').isInt({ min: 1 }).withMessage('Valid room inventory ID is required')
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

    const { booking_id, inventory_id, notes } = req.body;
    const assigned_by = req.user.user_id;

    // Check if booking exists and is valid
    const booking = await Booking.findOne({
      where: {
        booking_id,
        service_type: 'room',
        status: { [Op.in]: ['confirmed', 'pending'] }
      },
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          required: true
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or cannot be assigned'
      });
    }

    // Check if room exists and is available
    const room = await Room.findOne({
      where: {
        inventory_id,
        status: { [Op.in]: ['available', 'reserved'] }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or not available'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await RoomAssignment.findOne({
      where: {
        booking_id,
        status: { [Op.in]: ['assigned', 'checked_in'] }
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Room already assigned for this booking'
      });
    }

    // Create the room assignment
    const assignment = await RoomAssignment.create({
      booking_id,
      inventory_id,
      assigned_by,
      status: 'assigned',
      notes
    });

    // Update room status to reserved
    await room.update({ status: 'reserved' });

    // Fetch the created assignment with relations
    const createdAssignment = await RoomAssignment.findOne({
      where: { assignment_id: assignment.assignment_id },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'name', 'email', 'phone']
            },
            {
              model: RoomBooking,
              as: 'roomBooking'
            }
          ]
        },
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'floor', 'status']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['user_id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Room assigned successfully',
      data: createdAssignment
    });
  } catch (error) {
    console.error('Error creating room assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room assignment',
      error: error.message
    });
  }
});

module.exports = router;