const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');
const RoomBooking = require('../models/roomBooking.model');
const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const RoomType = require('../models/roomType.model');
const BookingGuest = require('../models/bookingGuest.model');
const GuestProfile = require('../models/guestProfile.model');
const Homestay = require('../models/homestay.model');
const invoiceService = require('../services/invoiceService');

/**
 * RECEPTIONIST CONTROLLER
 *
 * Multi-vendor system: Each user can only access data for their assigned property.
 * All functions automatically scope data to the user's homestay_id.
 * Users cannot view or access data from other properties.
 */

/**
 * Helper function: Get homestay ID for any user (vendor or HMS)
 * - Vendor users: Query homestays table where vendor_id = user.user_id
 * - HMS users: Use assigned_hotel_id directly
 */
async function getHomestayIdForUser(user, userType) {
  if (!user) {
    throw new Error('User is not authenticated');
  }

  // HMS users have assigned_hotel_id directly
  if (userType === 'hms' && user.assigned_hotel_id) {
    return user.assigned_hotel_id;
  }

  // Vendor users need to look up their homestay
  if (userType === 'regular' && user.role === 'vendor' && user.user_id) {
    const homestay = await Homestay.findOne({
      where: { vendor_id: user.user_id },
      attributes: ['homestay_id']
    });
    if (homestay) {
      return homestay.homestay_id;
    }
  }

  return null;
}

/**
 * Get bookings list for receptionist
 * Automatically filtered to user's property only (multi-vendor)
 * Additional filters:
 * - date range
 * - status
 * - guest name or booking ID
 */
exports.getBookingsList = async (req, res) => {
  try {
    const {
      status,
      start_date,
      end_date,
      search, // guest name or booking reference
      page = 1,
      limit = 20
    } = req.query;

    const user = req.user;
    const userType = req.userType;

    // Multi-vendor: Each user can only see their own property's bookings
    // Get user's assigned homestay ID (works for both vendor and HMS users)
    const targetHomestayId = await getHomestayIdForUser(user, userType);
    if (!targetHomestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel. Please contact administrator.'
      });
    }

    // Build where clause for bookings
    const bookingWhere = {};
    if (status) {
      bookingWhere.status = status;
    }

    // Add search filter for booking reference or guest name
    if (search) {
      bookingWhere[Op.or] = [
        { booking_reference: { [Op.like]: `%${search}%` } },
        { guest_name: { [Op.like]: `%${search}%` } }
      ];
    }

    // Build where clause for room bookings (date filtering)
    const roomBookingWhere = {};
    if (targetHomestayId) {
      roomBookingWhere.homestay_id = targetHomestayId;
    }

    // Date range filter
    if (start_date && end_date) {
      roomBookingWhere[Op.or] = [
        {
          check_in_date: {
            [Op.between]: [start_date, end_date]
          }
        },
        {
          check_out_date: {
            [Op.between]: [start_date, end_date]
          }
        },
        {
          [Op.and]: [
            { check_in_date: { [Op.lte]: start_date } },
            { check_out_date: { [Op.gte]: end_date } }
          ]
        }
      ];
    } else if (start_date) {
      roomBookingWhere.check_in_date = { [Op.gte]: start_date };
    } else if (end_date) {
      roomBookingWhere.check_out_date = { [Op.lte]: end_date };
    }

    const offset = (page - 1) * limit;

    // Separate queries to avoid Sequelize subquery issues with distinct: true and nested includes
    // First, get the count of matching bookings using simple count query
    const count = await Booking.count({
      where: bookingWhere,
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          where: roomBookingWhere,
          required: true,
          attributes: [] // Don't select any attributes, just use for filtering
        }
      ],
      distinct: true,
      col: 'booking_id'
    });

    // Then fetch the detailed bookings with all related data
    const bookings = await Booking.findAll({
      where: bookingWhere,
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          where: roomBookingWhere,
          required: true, // Inner join - only get bookings with room bookings
          include: [
            {
              model: Room,
              as: 'room',
              attributes: ['inventory_id', 'unit_number', 'floor', 'status'],
              include: [
                {
                  model: RoomType,
                  as: 'roomType',
                  attributes: ['room_type_id', 'name', 'max_people']
                }
              ]
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
              attributes: ['guest_id', 'first_name', 'last_name', 'email', 'phone', 'nationality']
            }
          ]
        }
      ],
      order: [
        ['created_at', 'DESC'],
        [{ model: RoomBooking, as: 'roomBooking' }, 'check_in_date', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      subQuery: false // Prevent Sequelize from creating problematic subqueries
    });

    // Format the response
    const formattedBookings = bookings.map(booking => {
      const roomBooking = booking.roomBooking;
      const primaryGuest = booking.guests && booking.guests.find(g => g.is_primary);

      return {
        booking_id: booking.booking_id,
        booking_reference: booking.booking_reference,
        guest_name: booking.guest_name || (primaryGuest?.guest ?
          `${primaryGuest.guest.first_name} ${primaryGuest.guest.last_name}` : 'N/A'),
        guest_email: primaryGuest?.guest?.email || null,
        guest_phone: primaryGuest?.guest?.phone || null,
        check_in_date: roomBooking?.check_in_date || null,
        check_out_date: roomBooking?.check_out_date || null,
        nights: roomBooking?.nights || 0,
        room_number: roomBooking?.room?.unit_number || 'Not Assigned',
        room_type: roomBooking?.room?.roomType?.name || 'N/A',
        room_type_id: roomBooking?.room?.roomType?.room_type_id || null,
        adults: roomBooking?.number_of_adults || roomBooking?.guests || 0,
        children: roomBooking?.number_of_children || 0,
        status: booking.status,
        payment_status: booking.payment_status,
        total_amount: booking.total_amount,
        booking_source: booking.booking_source,
        special_requests: booking.special_requests,
        created_at: booking.created_at,
        room_assigned: !!roomBooking?.room?.unit_number,
        can_check_in: booking.status === 'confirmed' && booking.payment_status === 'paid',
        can_assign_room: booking.status === 'confirmed' && !roomBooking?.room?.unit_number
      };
    });

    res.json({
      success: true,
      data: formattedBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        total_pages: Math.ceil(count / limit)
      },
      filters: {
        status,
        start_date,
        end_date,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching bookings for receptionist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

/**
 * Get upcoming arrivals for today and tomorrow
 */
exports.getUpcomingArrivals = async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;

    // Multi-vendor: Get user's assigned homestay ID (works for both vendor and HMS users)
    const homestayId = await getHomestayIdForUser(user, userType);
    if (!homestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel. Please contact administrator.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const bookings = await Booking.findAll({
      where: {
        status: 'confirmed'
      },
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          where: {
            check_in_date: {
              [Op.between]: [today, tomorrow]
            },
            homestay_id: homestayId
          },
          required: true,
          include: [
            {
              model: Room,
              as: 'room',
              include: [
                {
                  model: RoomType,
                  as: 'roomType'
                }
              ]
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
        }
      ],
      order: [[{ model: RoomBooking, as: 'roomBooking' }, 'check_in_date', 'ASC']]
    });

    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Error fetching upcoming arrivals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming arrivals',
      error: error.message
    });
  }
};

/**
 * Get available rooms for assignment
 * Filters by date range, room type, and user's property
 */
exports.getAvailableRooms = async (req, res) => {
  try {
    const { check_in_date, check_out_date, room_type_id } = req.query;
    const user = req.user;
    const userType = req.userType;

    // Multi-vendor: Get user's assigned homestay ID (works for both vendor and HMS users)
    const homestayId = await getHomestayIdForUser(user, userType);
    if (!homestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any homestay. Please contact administrator.'
      });
    }

    // Build where clause for rooms (homestay_id is in room_types table, not room_inventory)
    const roomWhere = {
      status: 'available' // Only show available rooms
    };

    if (room_type_id) {
      roomWhere.room_type_id = room_type_id;
    }

    // Find all rooms matching criteria - filter by homestay through room_type join
    const rooms = await Room.findAll({
      where: roomWhere,
      include: [
        {
          model: RoomType,
          as: 'roomType',
          where: { homestay_id: homestayId }, // Filter by homestay in room_types table
          required: true, // Inner join to ensure only rooms with matching homestay
          attributes: ['room_type_id', 'name', 'max_people']
        }
      ],
      order: [['unit_number', 'ASC']]
    });

    // If dates provided, filter out rooms that are already booked
    if (check_in_date && check_out_date) {
      const bookedRooms = await RoomBooking.findAll({
        where: {
          homestay_id: homestayId,
          [Op.or]: [
            {
              // Check-in during the period
              check_in_date: {
                [Op.between]: [check_in_date, check_out_date]
              }
            },
            {
              // Check-out during the period
              check_out_date: {
                [Op.between]: [check_in_date, check_out_date]
              }
            },
            {
              // Booking spans the entire period
              [Op.and]: [
                { check_in_date: { [Op.lte]: check_in_date } },
                { check_out_date: { [Op.gte]: check_out_date } }
              ]
            }
          ]
        },
        attributes: ['inventory_id']
      });

      const bookedRoomIds = bookedRooms.map(rb => rb.inventory_id);

      // Filter out booked rooms
      const availableRooms = rooms
        .filter(room => !bookedRoomIds.includes(room.inventory_id))
        .map(room => ({
          room_id: room.inventory_id,
          room_number: room.unit_number,
          room_type_id: room.room_type_id,
          room_type_name: room.roomType?.name || 'N/A',
          floor_number: room.floor,
          status: room.status,
          max_occupancy: room.roomType?.max_people
        }));

      return res.json({
        success: true,
        data: availableRooms,
        count: availableRooms.length
      });
    }

    // If no dates, return all available rooms
    const formattedRooms = rooms.map(room => ({
      room_id: room.inventory_id,
      room_number: room.unit_number,
      room_type_id: room.room_type_id,
      room_type_name: room.roomType?.name || 'N/A',
      floor_number: room.floor,
      status: room.status,
      max_occupancy: room.roomType?.max_people
    }));

    res.json({
      success: true,
      data: formattedRooms,
      count: formattedRooms.length
    });

  } catch (error) {
    console.error('Error fetching available rooms:', {
      message: error.message,
      stack: error.stack,
      params: { check_in_date, check_out_date, room_type_id },
      user: user?.user_id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error.message
    });
  }
};

/**
 * Assign room to booking
 */
exports.assignRoom = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { room_id } = req.body;
    const user = req.user;
    const userType = req.userType;

    // Multi-vendor: Get user's assigned homestay ID (works for both vendor and HMS users)
    const homestayId = await getHomestayIdForUser(user, userType);
    if (!homestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel. Please contact administrator.'
      });
    }

    // Find the booking
    const booking = await Booking.findByPk(booking_id, {
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          where: { homestay_id: homestayId }
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.roomBooking) {
      return res.status(404).json({
        success: false,
        message: 'No room booking found for this booking'
      });
    }

    // Verify the room exists and belongs to the user's property
    const room = await Room.findOne({
      where: {
        inventory_id: room_id,
        status: 'available'
      },
      include: [{
        model: RoomType,
        as: 'roomType',
        where: { homestay_id: homestayId },
        required: true
      }]
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or not available'
      });
    }

    // Check if room is already booked for these dates
    const roomBooking = booking.roomBooking;
    const conflictingBooking = await RoomBooking.findOne({
      where: {
        inventory_id: room_id,
        booking_id: { [Op.ne]: roomBooking.booking_id },
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
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for these dates'
      });
    }

    // Assign the room
    await roomBooking.update({
      inventory_id: room_id,
      updated_at: new Date()
    });

    // Update room status to occupied if check-in date is today or past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(roomBooking.check_in_date);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate <= today && booking.status === 'checked_in') {
      await room.update({
        status: 'occupied'
      });
    }

    // Fetch updated booking
    const updatedBooking = await Booking.findByPk(booking_id, {
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          include: [
            {
              model: Room,
              as: 'room',
              include: [{ model: RoomType, as: 'roomType' }]
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Room assigned successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Error assigning room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign room',
      error: error.message
    });
  }
};

/**
 * Check-in a guest
 */
exports.checkInGuest = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { booking_id } = req.params;
    const { actual_check_in_time, notes, key_card_number } = req.body;
    // Handle both HMS users (hms_user_id) and regular users (user_id)
    const staff_id = req.user?.hms_user_id || req.user?.user_id;

    if (!staff_id) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: 'Staff ID not found in user information'
      });
    }

    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'confirmed') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Booking must be confirmed before check-in'
      });
    }

    if (booking.payment_status !== 'paid' && booking.payment_status !== 'partial') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment must be completed or partially paid before check-in'
      });
    }

    const previousStatus = booking.status;

    // Update booking status to checked_in
    await booking.update({
      status: 'checked_in',
      updated_at: new Date()
    }, { transaction: t });

    // Update assigned room status to occupied and get room details
    const roomBookings = await RoomBooking.findAll({
      where: { booking_id: booking_id },
      include: [{ model: Room, as: 'room' }],
      transaction: t
    });

    let roomNumber = null;
    let homestayId = null;

    for (const rb of roomBookings) {
      if (rb.inventory_id && rb.room) {
        await rb.room.update({ status: 'occupied' }, { transaction: t });
        roomNumber = rb.room.unit_number;
        homestayId = rb.homestay_id;
      }
    }

    // Get guest name from room booking
    const guestName = roomBookings[0]?.guest_name || 'Unknown Guest';

    // Create check-in log entry
    // Note: assignment_id is now optional as it may not always be available
    await sequelize.query(`
      INSERT INTO check_in_logs (
        booking_id, assignment_id, staff_id, guest_name, 
        room_number, check_in_time, key_card_number, notes, homestay_id
      ) VALUES (?, NULL, ?, ?, ?, NOW(), ?, ?, ?)
    `, {
      replacements: [
        booking_id,
        staff_id,
        guestName,
        roomNumber,
        key_card_number,
        notes,
        homestayId
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Create audit log entry
    await sequelize.query(`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, {
      replacements: [
        staff_id,
        'CHECK_IN',
        'bookings',
        booking_id,
        JSON.stringify({ status: previousStatus }),
        JSON.stringify({ status: 'completed', checked_in_by: staff_id, key_card: key_card_number }),
        req.ip || 'unknown',
        req.get('user-agent') || 'unknown'
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await t.commit();

    const updatedBooking = await Booking.findByPk(booking_id, {
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          include: [
            {
              model: Room,
              as: 'room',
              include: [{ model: RoomType, as: 'roomType' }]
            }
          ]
        },
        {
          model: BookingGuest,
          as: 'guests',
          include: [{ model: GuestProfile, as: 'guest' }]
        }
      ]
    });

    console.log(`✅ Guest Check-in: Booking ${booking_id} by Staff ${staff_id}`);

    res.json({
      success: true,
      message: 'Guest checked in successfully',
      data: updatedBooking
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Error checking in guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in guest',
      error: error.message
    });
  }
};

/**
 * Check out a guest
 * Updates booking status to checked_out
 * Updates room status to cleaning
 * Creates front_desk_logs and room_status_log entries
 * 
 * POST /api/receptionist/check-out/:booking_id
 * Body:
 * - deposit_returned: amount returned to guest (optional)
 * - additional_charges: extra charges (optional)
 * - payment_method: payment method used (optional)
 * - notes: checkout notes (optional)
 */
exports.checkOutGuest = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { booking_id } = req.params;
    const { 
      deposit_returned = 0, 
      additional_charges = 0, 
      payment_method,
      notes,
      admin_override
    } = req.body;
    // Handle both HMS users (hms_user_id) and regular users (user_id)
    const staff_id = req.user?.hms_user_id || req.user?.user_id;
    const userRole = req.user?.role;

    if (!staff_id) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: 'Staff ID not found in user information'
      });
    }

    // Validate booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate booking is currently checked in (status = 'completed')
    if (booking.status !== 'completed') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Guest must be checked in (completed status) before checkout'
      });
    }

    const previousStatus = booking.status;
    const checkOutTime = new Date();

    // Update booking status to checked_out
    await booking.update({
      status: 'checked_out',
      checked_out_at: checkOutTime,
      updated_at: checkOutTime
    }, { transaction: t });

    // Get room details and update room status to cleaning
    const roomBookings = await RoomBooking.findAll({
      where: { booking_id: booking_id },
      include: [{ model: Room, as: 'room' }],
      transaction: t
    });

    let roomNumber = null;
    let roomInventoryId = null;
    let previousRoomStatus = null;
    let homestayId = null;

    for (const rb of roomBookings) {
      if (rb.inventory_id && rb.room) {
        previousRoomStatus = rb.room.status;
        await rb.room.update({ status: 'cleaning' }, { transaction: t });
        roomNumber = rb.room.unit_number;
        roomInventoryId = rb.inventory_id;
        homestayId = rb.homestay_id;
      }
    }

    // Get guest name
    const guestName = roomBookings[0]?.guest_name || 'Unknown Guest';

    // Create front_desk_logs entry
    await sequelize.query(`
      INSERT INTO front_desk_logs (
        booking_id, action_type, performed_by, action_time, 
        room_unit, deposit_returned, additional_charges, 
        payment_method, notes, created_at
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, NOW())
    `, {
      replacements: [
        booking_id,
        'check_out',
        staff_id,
        roomNumber,
        deposit_returned,
        additional_charges,
        payment_method || null,
        notes || null
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Create room_status_log entry
    if (roomInventoryId) {
      await sequelize.query(`
        INSERT INTO room_status_log (
          inventory_id, previous_status, new_status, changed_by, 
          reason, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, {
        replacements: [
          roomInventoryId,
          previousRoomStatus,
          'cleaning',
          staff_id,
          'Guest checked out',
          notes || null
        ],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
    }

    // Create audit log entry
    await sequelize.query(`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, {
      replacements: [
        staff_id,
        'CHECK_OUT',
        'bookings',
        booking_id,
        JSON.stringify({ status: previousStatus }),
        JSON.stringify({ 
          status: 'checked_out', 
          checked_out_by: staff_id, 
          deposit_returned,
          additional_charges 
        }),
        req.ip || 'unknown',
        req.get('user-agent') || 'unknown'
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Update room_assignments with check_out_time if the column exists
    if (roomBookings[0]?.assignment_id) {
      await sequelize.query(`
        UPDATE room_assignments 
        SET check_out_time = NOW()
        WHERE assignment_id = ?
      `, {
        replacements: [roomBookings[0].assignment_id],
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      });
    }

    // Handle admin override if provided and user is admin
    let overrideId = null;
    if (admin_override && userRole === 'admin') {
      const { final_amount, reason, confirm_rate } = admin_override;

      if (confirm_rate) {
        // Confirm current rate (no changes)
        const confirmResult = await sequelize.query(`
          INSERT INTO checkout_confirmations (
            booking_id, confirmed_by, final_amount, confirmation_note, created_at
          ) VALUES (?, ?, ?, ?, NOW())
        `, {
          replacements: [booking_id, staff_id, booking.final_amount || booking.total_amount || 0, reason || ''],
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        });

        await booking.update({
          rate_confirmed_by: staff_id,
          rate_confirmed_at: new Date()
        }, { transaction: t });

      } else if (final_amount && final_amount > 0) {
        // Apply rate override
        const originalAmount = booking.final_amount || booking.total_amount || 0;
        const difference = final_amount - originalAmount;

        const overrideResult = await sequelize.query(`
          INSERT INTO admin_overrides (
            booking_id, admin_user_id, override_type, 
            original_final_amount, overridden_final_amount, 
            difference_amount, override_reason, status, created_at
          ) VALUES (?, ?, 'rate_override', ?, ?, ?, ?, 'applied', NOW())
        `, {
          replacements: [booking_id, staff_id, originalAmount, final_amount, difference, reason],
          type: sequelize.QueryTypes.INSERT,
          transaction: t
        });

        overrideId = overrideResult[0];

        // Update booking with new final amount
        await booking.update({
          final_amount,
          total_amount: final_amount
        }, { transaction: t });

        // Update front_desk_logs with override reference
        if (overrideId) {
          await sequelize.query(`
            UPDATE front_desk_logs
            SET admin_override_id = ?
            WHERE booking_id = ? AND action_type = 'check_out'
            ORDER BY created_at DESC
            LIMIT 1
          `, {
            replacements: [overrideId, booking_id],
            type: sequelize.QueryTypes.UPDATE,
            transaction: t
          });
        }
      }
    }

    await t.commit();

    // Fetch updated booking with all associations
    const updatedBooking = await Booking.findByPk(booking_id, {
      include: [
        {
          model: RoomBooking,
          as: 'roomBooking',
          include: [
            {
              model: Room,
              as: 'room',
              include: [{ model: RoomType, as: 'roomType' }]
            }
          ]
        },
        {
          model: BookingGuest,
          as: 'guests',
          include: [{ model: GuestProfile, as: 'guest' }]
        }
      ]
    });

    console.log(`✅ Guest Check-out: Booking ${booking_id} by Staff ${staff_id}`);

    res.json({
      success: true,
      message: 'Guest checked out successfully',
      data: updatedBooking
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Error checking out guest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out guest',
      error: error.message
    });
  }
};

/**
 * Generate invoice for a guest
 * Aggregates all charges (room, restaurant, laundry, services, etc.)
 * Creates invoice with proper line items and totals
 * 
 * Multi-vendor: Validates that the booking belongs to the user's property
 * 
 * @route POST /front-desk/invoices/generate/:booking_id
 * @param {number} booking_id - Booking ID from params
 * @param {number} tax_rate - Tax rate percentage (default: 18)
 * @param {number} service_charge_rate - Service charge rate percentage (default: 0)
 * @param {number} discount_amount - Discount amount in currency (default: 0)
 * @param {string} payment_terms - Payment terms text (default: "Due on receipt")
 * @param {string} notes - Invoice notes
 */
exports.generateInvoice = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const user = req.user;
    const userType = req.userType;

    const {
      tax_rate = 18,
      service_charge_rate = 0,
      discount_amount = 0,
      payment_terms = 'Due on receipt',
      notes = ''
    } = req.body;

    // Multi-vendor: Verify booking belongs to user's property
    const targetHomestayId = await getHomestayIdForUser(user, userType);
    if (!targetHomestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel'
      });
    }

    // Verify booking exists and belongs to user's property
    const booking = await sequelize.query(`
      SELECT rb.homestay_id, b.booking_id
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE b.booking_id = ?
      LIMIT 1
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to user's property
    if (booking[0].homestay_id !== targetHomestayId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to generate invoice for this booking'
      });
    }

    // Generate invoice using service
    const result = await invoiceService.createInvoice({
      bookingId: booking_id,
      taxRate: parseFloat(tax_rate),
      serviceChargeRate: parseFloat(service_charge_rate),
      discountAmount: parseFloat(discount_amount),
      paymentTerms: payment_terms,
      notes,
      generatedBy: user.user_id || user.hms_user_id
    });

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: result.invoice
    });

  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      sql: error.sql,
      original: error.original
    });

    // Check if it's an "invoice already exists" error
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message,
      details: error.sql || error.original?.message || 'No additional details'
    });
  }
};

/**
 * Get invoice preview with aggregated charges
 * Shows what the invoice will look like before creation
 * 
 * @route GET /front-desk/invoices/preview/:booking_id
 * @param {number} booking_id - Booking ID from params
 */
exports.previewInvoice = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const user = req.user;
    const userType = req.userType;

    // Multi-vendor: Verify booking belongs to user's property
    const targetHomestayId = await getHomestayIdForUser(user, userType);
    if (!targetHomestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel'
      });
    }

    // Verify booking exists and belongs to user's property
    const booking = await sequelize.query(`
      SELECT rb.homestay_id, b.booking_id
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE b.booking_id = ?
      LIMIT 1
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking[0].homestay_id !== targetHomestayId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this booking'
      });
    }

    // Get aggregated charges
    const { booking: bookingData, nights, invoiceItems, subtotal } = 
      await invoiceService.aggregateChargesForBooking(booking_id);

    // Calculate with default rates for preview
    const taxRate = 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    res.json({
      success: true,
      data: {
        booking: bookingData,
        nights,
        items: invoiceItems,
        summary: {
          subtotal,
          tax_amount: taxAmount,
          service_charge: 0,
          discount_amount: 0,
          total_amount: totalAmount,
          balance_due: totalAmount
        }
      }
    });

  } catch (error) {
    console.error('Error generating invoice preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice preview',
      error: error.message
    });
  }
};
