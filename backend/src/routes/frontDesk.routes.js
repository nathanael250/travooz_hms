// routes/frontDesk.routes.js
const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/database');
const authMiddleware = require('../middlewares/auth.middleware');
const hotelAccessMiddleware = require('../middlewares/hotelAccess.middleware');

// Apply hotel access middleware to all routes
router.use(hotelAccessMiddleware);

/**
 * @route   GET /api/front-desk/upcoming-arrivals
 * @desc    Get list of upcoming arrivals for front desk (Step 7)
 * @access  Private (Staff only)
 * @query   days - Number of days to look ahead (default: 7)
 * @query   date - Specific date to check (YYYY-MM-DD)
 * @query   status - Filter by booking status (confirmed, pre_registered, all)
 */
router.get('/upcoming-arrivals', authMiddleware, async (req, res) => {
  try {
    const { days = 7, date, status = 'all' } = req.query;
    
    let dateCondition;
    if (date) {
      // Specific date
      dateCondition = `rb.check_in_date = '${date}'`;
    } else {
      // Date range (today + next N days)
      dateCondition = `rb.check_in_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ${days} DAY)`;
    }
    
    let statusCondition = '';
    if (status !== 'all') {
      statusCondition = `AND b.status = '${status}'`;
    } else {
      statusCondition = `AND b.status IN ('confirmed', 'pre_registered')`;
    }
    
    const upcomingArrivals = await sequelize.query(`
      SELECT 
        b.booking_id,
        b.booking_reference,
        b.status as booking_status,
        b.payment_status,
        b.confirmed_at,
        b.special_requests,
        rb.check_in_date,
        rb.check_out_date,
        rb.nights,
        rb.guests,
        rb.number_of_adults,
        rb.number_of_children,
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        rb.guest_id_type,
        rb.guest_id_number,
        rb.early_checkin,
        rb.late_checkout,
        rt.name as room_type,
        rt.price as room_price,
        h.name as homestay_name,
        h.address as homestay_address,
        ra.assignment_id,
        ra.status as assignment_status,
        ra.assigned_at,
        ri.inventory_id as assigned_room_id,
        ri.unit_number as assigned_room_number,
        ri.floor as assigned_room_floor,
        ri.status as room_status,
        COALESCE(
          (SELECT new_status
           FROM room_status_log
           WHERE inventory_id = ri.inventory_id
           ORDER BY log_id DESC
           LIMIT 1),
          'unknown'
        ) as room_cleanliness,
        b.total_amount,
        DATEDIFF(rb.check_in_date, CURDATE()) as days_until_arrival
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      INNER JOIN room_inventory ri_booked ON rb.inventory_id = ri_booked.inventory_id
      INNER JOIN room_types rt ON ri_booked.room_type_id = rt.room_type_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN room_assignments ra ON b.booking_id = ra.booking_id 
        AND ra.status IN ('assigned', 'checked_in')
      LEFT JOIN room_inventory ri ON ra.inventory_id = ri.inventory_id
      WHERE ${dateCondition}
        ${statusCondition}
      ORDER BY rb.check_in_date ASC, b.booking_id ASC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Group by check-in date
    const groupedByDate = upcomingArrivals.reduce((acc, arrival) => {
      const date = arrival.check_in_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(arrival);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        total_arrivals: upcomingArrivals.length,
        arrivals: upcomingArrivals,
        grouped_by_date: groupedByDate,
        date_range: date || `Today + ${days} days`
      }
    });
    
  } catch (error) {
    console.error('Error fetching upcoming arrivals:', error);
    console.error('Error stack:', error.stack);
    console.error('SQL:', error.sql);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming arrivals',
      error: error.message,
      details: error.sql || error.original?.sqlMessage
    });
  }
});

/**
 * @route   GET /api/front-desk/today-arrivals
 * @desc    Get today's arrivals (quick access)
 * @access  Private (Staff only)
 */
router.get('/today-arrivals', authMiddleware, async (req, res) => {
  try {
    const todayArrivals = await sequelize.query(`
      SELECT 
        b.booking_id,
        b.booking_reference,
        b.status as booking_status,
        rb.check_in_date,
        rb.guest_name,
        rb.guest_phone,
        rb.guests,
        rt.name as room_type,
        h.name as homestay_name,
        ra.assignment_id,
        ri.unit_number as assigned_room_number,
        ra.status as assignment_status
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      INNER JOIN room_inventory ri_booked ON rb.inventory_id = ri_booked.inventory_id
      INNER JOIN room_types rt ON ri_booked.room_type_id = rt.room_type_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN room_assignments ra ON b.booking_id = ra.booking_id 
        AND ra.status IN ('assigned', 'checked_in')
      LEFT JOIN room_inventory ri ON ra.inventory_id = ri.inventory_id
      WHERE rb.check_in_date = CURDATE()
        AND b.status IN ('confirmed', 'pre_registered')
      ORDER BY b.booking_id ASC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: {
        total: todayArrivals.length,
        arrivals: todayArrivals
      }
    });
    
  } catch (error) {
    console.error('Error fetching today arrivals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today arrivals',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/front-desk/check-in/:booking_id
 * @desc    Process guest check-in with audit logging
 * @access  Private (Staff only)
 */
router.post('/check-in/:booking_id', authMiddleware, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { booking_id } = req.params;
    const { key_card_number, notes } = req.body;
    const staff_id = req.user.user_id;
    
    // Get booking details
    const bookings = await sequelize.query(`
      SELECT b.booking_id, b.status, rb.guest_name, rb.homestay_id
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE b.booking_id = ?
      LIMIT 1
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });
    
    if (bookings.length === 0) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const booking = bookings[0];
    const previousStatus = booking.status;
    
    // Get room inventory from room booking
    const roomBookings = await sequelize.query(`
      SELECT rb.inventory_id
      FROM room_bookings rb
      WHERE rb.booking_id = ? AND rb.inventory_id IS NOT NULL
      LIMIT 1
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });
    
    if (roomBookings.length === 0) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'No room assigned for this booking'
      });
    }
    
    const inventoryId = roomBookings[0].inventory_id;
    
    // Get room details for logging
    const roomDetails = await sequelize.query(`
      SELECT ri.unit_number, ri.floor
      FROM room_inventory ri
      WHERE ri.inventory_id = ?
      LIMIT 1
    `, {
      replacements: [inventoryId],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });
    
    const roomNumber = roomDetails.length > 0 ? roomDetails[0].unit_number : null;
    
    // Update room inventory status to occupied
    await sequelize.query(`
      UPDATE room_inventory
      SET status = 'occupied', updated_at = NOW()
      WHERE inventory_id = ?
    `, {
      replacements: [inventoryId],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });
    
    // Update booking status to 'checked_in' (guest checked in and in house)
    await sequelize.query(`
      UPDATE bookings
      SET status = 'checked_in', updated_at = NOW()
      WHERE booking_id = ?
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });
    
    // Create check-in log entry
    await sequelize.query(`
      INSERT INTO check_in_logs (
        booking_id, assignment_id, staff_id, guest_name, 
        room_number, check_in_time, key_card_number, notes, homestay_id
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `, {
      replacements: [
        booking_id,
        assignment.assignment_id,
        staff_id,
        booking.guest_name,
        roomNumber,
        key_card_number,
        notes,
        booking.homestay_id
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });
    
    // Create audit log entry
    await sequelize.query(`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        staff_id,
        'CHECK_IN',
        'bookings',
        booking_id,
        JSON.stringify({ status: previousStatus, assignment_status: 'assigned' }),
        JSON.stringify({ 
          status: 'checked_in', 
          assignment_status: 'checked_in',
          checked_in_by: staff_id,
          room_number: roomNumber
        }),
        req.ip || 'unknown',
        req.get('user-agent') || 'unknown'
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });
    
    await t.commit();
    
    console.log(`✅ Guest Check-in: Booking ${booking_id} by Staff ${staff_id}`);
    
    res.json({
      success: true,
      message: 'Guest checked in successfully',
      data: {
        booking_id,
        assignment_id: assignment.assignment_id,
        guest_name: booking.guest_name,
        room_number: roomNumber,
        check_in_time: new Date(),
        checked_in_by: staff_id
      }
    });
    
  } catch (error) {
    await t.rollback();
    console.error('❌ Error processing check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process check-in',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/front-desk/in-house-guests
 * @desc    Get list of all currently checked-in guests
 * @access  Private (Staff only)
 */
router.get('/in-house-guests', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Multi-vendor: Get user's assigned hotel ID
    if (!user || !user.assigned_hotel_id) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    const homestayId = user.assigned_hotel_id;

    // Get all bookings with status 'checked_in' (checked-in) that haven't checked out yet
    const inHouseGuests = await sequelize.query(`
      SELECT
        b.booking_id,
        b.booking_reference,
        b.status as booking_status,
        b.payment_status,
        b.updated_at as checked_in_at,
        rb.check_in_date,
        rb.check_out_date,
        rb.nights,
        rb.guests,
        rb.number_of_adults,
        rb.number_of_children,
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        rb.guest_id_type,
        rb.guest_id_number,
        rb.inventory_id,
        rt.name as room_type,
        rt.max_people as room_capacity,
        ri.unit_number as room_number,
        ri.floor as room_floor,
        ri.status as room_status,
        h.name as homestay_name,
        rb.total_room_amount,
        rb.final_amount,
        DATEDIFF(rb.check_out_date, CURDATE()) as days_until_checkout
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE b.status = 'checked_in'
        AND rb.homestay_id = ?
      ORDER BY rb.check_out_date ASC, ri.unit_number ASC
    `, {
      replacements: [homestayId],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        total: inHouseGuests.length,
        guests: inHouseGuests
      }
    });

  } catch (error) {
    console.error('Error fetching in-house guests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch in-house guests',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/front-desk/checkouts
 * @desc    Get list of guests scheduled to check out today or pending checkout
 * @access  Private (Staff only)
 */
router.get('/checkouts', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Multi-vendor: Get user's assigned hotel ID
    if (!user || !user.assigned_hotel_id) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    const homestayId = user.assigned_hotel_id;

    // Get all bookings with check-out date today or overdue
    const checkouts = await sequelize.query(`
      SELECT
        b.booking_id,
        b.booking_reference,
        b.status as booking_status,
        b.payment_status,
        b.total_amount,
        b.updated_at as checked_in_at,
        rb.check_in_date,
        rb.check_out_date,
        rb.nights,
        rb.guests,
        rb.number_of_adults,
        rb.number_of_children,
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        rb.inventory_id,
        rt.name as room_type,
        ri.unit_number as room_number,
        ri.floor as room_floor,
        ri.status as room_status,
        h.name as homestay_name,
        rb.total_room_amount,
        rb.final_amount,
        rb.early_checkin_fee,
        rb.late_checkout_fee,
        rb.extra_bed_fee,
        CASE
          WHEN rb.check_out_date < CURDATE() THEN 'overdue'
          WHEN rb.check_out_date = CURDATE() THEN 'today'
          ELSE 'upcoming'
        END as checkout_status,
        DATEDIFF(CURDATE(), rb.check_out_date) as days_overdue
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE b.status = 'checked_in'
        AND rb.homestay_id = ?
      ORDER BY rb.check_out_date ASC, ri.unit_number ASC
    `, {
      replacements: [homestayId],
      type: sequelize.QueryTypes.SELECT
    });

    // Calculate balance amounts
    const checkoutsWithBalance = checkouts.map(checkout => ({
      ...checkout,
      balance_amount: parseFloat(checkout.final_amount) - (checkout.payment_status === 'paid' ? parseFloat(checkout.final_amount) : 0)
    }));

    res.json({
      success: true,
      data: {
        total: checkoutsWithBalance.length,
        checkouts: checkoutsWithBalance
      }
    });

  } catch (error) {
    console.error('Error fetching checkouts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch checkouts',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/front-desk/room-status
 * @desc    Get real-time status of all rooms (for housekeeping & front desk)
 * @access  Private (Staff only)
 */
router.get('/room-status', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Multi-vendor: Get user's assigned hotel ID
    if (!user || !user.assigned_hotel_id) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    const homestayId = user.assigned_hotel_id;

    // Get all rooms with their current status, occupancy, and cleanliness
    const roomStatus = await sequelize.query(`
      SELECT
        ri.inventory_id,
        ri.unit_number as room_number,
        ri.floor,
        ri.status as room_status,
        rt.name as room_type,
        rt.max_people as capacity,
        h.name as homestay_name,
        COALESCE(
          (SELECT new_status
           FROM room_status_log
           WHERE inventory_id = ri.inventory_id
           ORDER BY log_id DESC
           LIMIT 1),
          'unknown'
        ) as cleanliness_status,
        COALESCE(
          (SELECT created_at
           FROM room_status_log
           WHERE inventory_id = ri.inventory_id
           ORDER BY log_id DESC
           LIMIT 1),
          ri.updated_at
        ) as last_status_update,
        b.booking_id,
        b.booking_reference,
        rb.guest_name,
        rb.check_in_date,
        rb.check_out_date,
        CASE
          WHEN ri.status = 'occupied' AND b.status IN ('checked_in', 'completed') THEN 'occupied'
          WHEN ri.status = 'available' THEN 'vacant'
          WHEN ri.status = 'maintenance' THEN 'maintenance'
          WHEN ri.status = 'blocked' THEN 'blocked'
          ELSE 'available'
        END as occupancy_status
      FROM room_inventory ri
      INNER JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      INNER JOIN homestays h ON rt.homestay_id = h.homestay_id
      LEFT JOIN room_bookings rb ON rb.inventory_id = ri.inventory_id
        AND rb.booking_id IN (
          SELECT booking_id FROM bookings 
          WHERE status IN ('checked_in', 'completed')
        )
      LEFT JOIN bookings b ON rb.booking_id = b.booking_id
        AND b.status IN ('checked_in', 'completed')
      WHERE h.homestay_id = ?
      ORDER BY ri.floor ASC, ri.unit_number ASC
    `, {
      replacements: [homestayId],
      type: sequelize.QueryTypes.SELECT
    });

    // Combine occupancy and cleanliness into a single status
    const roomsWithCombinedStatus = roomStatus.map(room => {
      let combinedStatus = 'vacant-clean';

      if (room.occupancy_status === 'occupied') {
        combinedStatus = room.cleanliness_status === 'dirty' ? 'occupied-dirty' : 'occupied-clean';
      } else if (room.occupancy_status === 'vacant') {
        combinedStatus = room.cleanliness_status === 'dirty' ? 'vacant-dirty' : 'vacant-clean';
      } else if (room.occupancy_status === 'maintenance') {
        combinedStatus = 'maintenance';
      } else if (room.occupancy_status === 'blocked') {
        combinedStatus = 'blocked';
      }

      return {
        ...room,
        status: combinedStatus
      };
    });

    res.json({
      success: true,
      data: {
        total: roomsWithCombinedStatus.length,
        rooms: roomsWithCombinedStatus
      }
    });

  } catch (error) {
    console.error('Error fetching room status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room status',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/front-desk/room-status/:room_id
 * @desc    Update room status (housekeeping status, maintenance, etc.)
 * @access  Private (Staff only)
 */
router.put('/room-status/:room_id', authMiddleware, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { room_id } = req.params;
    const { status, notes } = req.body;
    const staff_id = req.user.user_id;
    const user = req.user;

    // Multi-vendor: Verify room belongs to user's hotel
    if (!user || !user.assigned_hotel_id) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    const homestayId = user.assigned_hotel_id;

    // Verify room exists and belongs to the user's hotel
    const rooms = await sequelize.query(`
      SELECT ri.inventory_id, ri.status
      FROM room_inventory ri
      INNER JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      WHERE ri.inventory_id = ? AND rt.homestay_id = ?
      LIMIT 1
    `, {
      replacements: [room_id, homestayId],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (rooms.length === 0) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Room not found or access denied'
      });
    }

    // Map combined status to room_inventory status and cleanliness
    let newRoomStatus = rooms[0].status;
    let cleanlinessStatus = 'clean';

    if (status === 'vacant-clean') {
      newRoomStatus = 'available';
      cleanlinessStatus = 'clean';
    } else if (status === 'vacant-dirty') {
      newRoomStatus = 'available';
      cleanlinessStatus = 'dirty';
    } else if (status === 'occupied-clean') {
      newRoomStatus = 'occupied';
      cleanlinessStatus = 'clean';
    } else if (status === 'occupied-dirty') {
      newRoomStatus = 'occupied';
      cleanlinessStatus = 'dirty';
    } else if (status === 'maintenance') {
      newRoomStatus = 'maintenance';
      cleanlinessStatus = 'clean';
    } else if (status === 'blocked') {
      newRoomStatus = 'blocked';
      cleanlinessStatus = 'clean';
    }

    // Update room_inventory status
    await sequelize.query(`
      UPDATE room_inventory
      SET status = ?, updated_at = NOW()
      WHERE inventory_id = ?
    `, {
      replacements: [newRoomStatus, room_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    // Log the cleanliness status change
    await sequelize.query(`
      INSERT INTO room_status_log (inventory_id, previous_status, new_status, changed_by, notes)
      VALUES (?,
        (SELECT new_status FROM room_status_log WHERE inventory_id = ? ORDER BY log_id DESC LIMIT 1),
        ?, ?, ?)
    `, {
      replacements: [room_id, room_id, cleanlinessStatus, staff_id, notes || null],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Room status updated successfully',
      data: {
        room_id,
        new_status: status,
        updated_at: new Date()
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error updating room status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/front-desk/folio/:booking_id
 * @desc    Get guest folio with all charges and payments
 * @access  Private (Staff only)
 */
router.get('/folio/:booking_id', authMiddleware, async (req, res) => {
  try {
    const { booking_id } = req.params;
    const user = req.user;

    if (!user || !user.assigned_hotel_id) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    const homestayId = user.assigned_hotel_id;

    // Get booking details with all charges
    const folioQuery = await sequelize.query(`
      SELECT
        b.booking_id,
        b.booking_reference,
        b.status as booking_status,
        b.payment_status,
        b.total_amount,
        b.created_at as booking_date,
        rb.check_in_date,
        rb.check_out_date,
        rb.nights,
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        rb.total_room_amount,
        rb.final_amount,
        rt.name as room_type,
        ri.unit_number as room_number,
        h.name as homestay_name,
        h.address as homestay_address
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE b.booking_id = ? AND rb.homestay_id = ?
      LIMIT 1
    `, {
      replacements: [booking_id, homestayId],
      type: sequelize.QueryTypes.SELECT
    });

    if (folioQuery.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }

    const folio = folioQuery[0];

    // Get all charges including room charges, booking charges, and guest request charges
    const charges = [
      {
        id: 1,
        date: folio.check_in_date,
        category: 'Room',
        description: `Room Charge - ${folio.room_type} (${folio.nights} nights)`,
        amount: parseFloat(folio.total_room_amount || folio.total_amount),
        quantity: folio.nights
      }
    ];

    // Get booking charges (from booking_charges table)
    const bookingCharges = await sequelize.query(`
      SELECT charge_id, charge_type, description, quantity, unit_price, total_amount, charged_at
      FROM booking_charges
      WHERE booking_id = ?
      ORDER BY charged_at ASC
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT
    });

    // Add booking charges to charges array
    bookingCharges.forEach((charge) => {
      charges.push({
        id: `bc_${charge.charge_id}`,
        date: charge.charged_at,
        category: charge.charge_type.replace('_', ' ').toUpperCase(),
        description: charge.description,
        amount: parseFloat(charge.total_amount),
        quantity: charge.quantity || 1
      });
    });

    // Get guest request charges (for backward compatibility - these should now be in booking_charges)
    const guestRequestCharges = await sequelize.query(`
      SELECT request_id, request_type, description, additional_charges, status, completed_time
      FROM guest_requests
      WHERE booking_id = ? AND additional_charges > 0 AND status = 'completed'
      ORDER BY completed_time ASC
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT
    });

    // Add guest request charges to charges array (only if not already in booking_charges)
    guestRequestCharges.forEach((request) => {
      // Check if this charge is already in booking_charges
      const alreadyExists = bookingCharges.some(bc => 
        bc.description.includes(request.description) && 
        parseFloat(bc.total_amount) === parseFloat(request.additional_charges)
      );
      
      if (!alreadyExists) {
        charges.push({
          id: `gr_${request.request_id}`,
          date: request.completed_time,
          category: request.request_type.replace('_', ' ').toUpperCase(),
          description: `${request.request_type.replace('_', ' ').toUpperCase()} - ${request.description}`,
          amount: parseFloat(request.additional_charges),
          quantity: 1
        });
      }
    });

    // Get payments from payment_transactions table
    const paymentsQuery = await sequelize.query(`
      SELECT 
        transaction_id as id,
        payment_method as method,
        reference_number as reference,
        amount,
        paid_by,
        status,
        created_at
      FROM payment_transactions 
      WHERE booking_id = ? AND status = 'completed'
      ORDER BY created_at DESC
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT
    });

    const payments = paymentsQuery.map(payment => ({
      id: payment.id,
      date: payment.created_at,
      method: payment.method,
      reference: payment.reference || '',
      amount: parseFloat(payment.amount),
      paid_by: payment.paid_by,
      status: payment.status
    }));

    // Calculate totals
    const totalCharges = charges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);
    const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const balance = totalCharges - totalPayments;

    res.json({
      success: true,
      data: {
        booking: {
          id: folio.booking_id,
          reference: folio.booking_reference,
          guest_name: folio.guest_name,
          guest_email: folio.guest_email,
          guest_phone: folio.guest_phone,
          room_number: folio.room_number,
          room_type: folio.room_type,
          check_in: folio.check_in_date,
          check_out: folio.check_out_date,
          nights: folio.nights,
          status: folio.booking_status,
          payment_status: folio.payment_status
        },
        charges,
        payments,
        summary: {
          totalCharges: totalCharges,
          totalPayments: totalPayments,
          balance: balance
        },
        hotel: {
          name: folio.homestay_name,
          address: folio.homestay_address
        }
      }
    });

  } catch (error) {
    console.error('Error fetching guest folio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest folio',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/front-desk/folio/:booking_id/payment
 * @desc    Record a payment against a guest folio/booking
 * @access  Private (Front Desk/Receptionist)
 */
router.post('/folio/:booking_id/payment', authMiddleware, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { booking_id } = req.params;
    const { amount, method, reference, notes } = req.body;
    const paid_by = req.user.full_name || req.user.email || 'Unknown User';

    console.log('Payment request data:', {
      booking_id,
      amount,
      method,
      reference,
      notes,
      paid_by
    });

    // Validate required fields
    if (!amount || !method) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and payment method are required' 
      });
    }

    // Ensure booking_id is a number
    const bookingId = parseInt(booking_id);
    if (isNaN(bookingId)) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid booking ID' 
      });
    }

    // Get booking details
    const bookings = await sequelize.query(`
      SELECT b.*, rb.final_amount, b.payment_status
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE b.booking_id = ?
    `, {
      replacements: [bookingId],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (bookings.length === 0) {
      await t.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    const booking = bookings[0];
    const paymentAmount = parseFloat(amount);
    
    // Record payment transaction
    const [transactionId] = await sequelize.query(`
      INSERT INTO payment_transactions (
        booking_id, amount, payment_method, paid_by, reference_number, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'completed', NOW(), NOW())
    `, {
      replacements: [bookingId, paymentAmount, method, paid_by, reference],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Calculate total payments for this booking
    const totalPayments = await sequelize.query(`
      SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM payment_transactions 
      WHERE booking_id = ? AND status = 'completed'
    `, {
      replacements: [bookingId],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    const totalPaid = parseFloat(totalPayments[0].total_paid);
    const finalAmount = parseFloat(booking.final_amount);
    
    // Update booking payment status
    let newPaymentStatus = 'unpaid';
    if (totalPaid >= finalAmount) {
      newPaymentStatus = 'paid';
    } else if (totalPaid > 0) {
      newPaymentStatus = 'partially_paid';
    }

    await sequelize.query(`
      UPDATE bookings 
      SET payment_status = ?
      WHERE booking_id = ?
    `, {
      replacements: [newPaymentStatus, bookingId],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    // Log staff activity (optional - staff_id can be null)
    try {
      await sequelize.query(`
        INSERT INTO staff_activity_logs (
          staff_id, action, table_name, record_id, timestamp
        ) VALUES (?, 'record_folio_payment', 'bookings', ?, NOW())
      `, {
        replacements: [req.user.hms_user_id, bookingId],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
    } catch (logError) {
      console.log('Note: Could not log staff activity:', logError.message);
      // Continue without logging - this is not critical
    }

    await t.commit();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        transaction_id: transactionId,
        amount_paid: paymentAmount,
        total_paid: totalPaid,
        balance_due: finalAmount - totalPaid,
        payment_status: newPaymentStatus
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error recording folio payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record payment',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/front-desk/check-in-logs
 * @desc    Get all check-in logs for hotel manager reporting
 * @access  Private (Manager/Admin only)
 * @query   start_date - Filter from date (YYYY-MM-DD)
 * @query   end_date - Filter to date (YYYY-MM-DD)
 * @query   limit - Number of records (default: 100)
 * @query   offset - Pagination offset (default: 0)
 */
router.get('/check-in-logs', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Multi-vendor: Get user's assigned hotel ID
    if (!user || !user.assigned_hotel_id) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    const homestayId = user.assigned_hotel_id;
    const { start_date, end_date, limit = 100, offset = 0 } = req.query;
    
    let dateCondition = '';
    if (start_date && end_date) {
      dateCondition = `AND cil.check_in_time BETWEEN '${start_date} 00:00:00' AND '${end_date} 23:59:59'`;
    }
    
    // Get check-in logs with staff and guest details
    const checkInLogs = await sequelize.query(`
      SELECT 
        cil.check_in_log_id,
        cil.booking_id,
        cil.assignment_id,
        cil.guest_name,
        cil.room_number,
        cil.check_in_time,
        cil.key_card_number,
        cil.notes,
        u.first_name as staff_first_name,
        u.last_name as staff_last_name,
        u.email as staff_email,
        b.booking_reference,
        b.status as booking_status,
        h.name as homestay_name
      FROM check_in_logs cil
      LEFT JOIN users u ON cil.staff_id = u.user_id
      LEFT JOIN bookings b ON cil.booking_id = b.booking_id
      INNER JOIN homestays h ON cil.homestay_id = h.homestay_id
      WHERE cil.homestay_id = ?
        ${dateCondition}
      ORDER BY cil.check_in_time DESC
      LIMIT ? OFFSET ?
    `, {
      replacements: [homestayId, parseInt(limit), parseInt(offset)],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get total count
    const countResult = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM check_in_logs cil
      WHERE cil.homestay_id = ?
        ${dateCondition}
    `, {
      replacements: [homestayId],
      type: sequelize.QueryTypes.SELECT
    });
    
    const totalCount = countResult[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        check_in_logs: checkInLogs,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching check-in logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch check-in logs',
      error: error.message
    });
  }
});

module.exports = router;