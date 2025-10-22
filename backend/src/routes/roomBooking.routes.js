const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/database');
const { body, validationResult } = require('express-validator');

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

/**
 * POST /api/room-bookings/create
 * Create a complete room booking with guest information and payment
 * 
 * This endpoint handles the entire booking flow:
 * 1. Creates a booking record in the bookings table
 * 2. Creates room booking details in room_bookings table
 * 3. Creates or updates guest profile in guest_profiles table
 * 4. Links guest to booking in booking_guests table
 * 5. Optionally creates payment transaction record
 */
router.post('/create', [
  // Room and date validation - room_type_id is required, inventory_id will always be NULL (assigned on arrival)
  body('room_type_id').notEmpty().isInt().withMessage('Room type ID is required and must be an integer'),
  body('check_in_date').isDate().withMessage('Valid check-in date is required'),
  body('check_out_date').isDate().withMessage('Valid check-out date is required'),
  
  // Guest information validation
  body('guest_name').trim().notEmpty().withMessage('Guest name is required'),
  body('guest_email').isEmail().withMessage('Valid email is required'),
  body('guest_phone').trim().notEmpty().withMessage('Phone number is required'),
  
  // Occupancy validation
  body('number_of_adults').isInt({ min: 1 }).withMessage('At least 1 adult is required'),
  body('number_of_children').optional().isInt({ min: 0 }).withMessage('Number of children must be 0 or more'),
  
  // Optional fields
  body('special_requests').optional().trim(),
  body('payment_method').optional().isIn(['card', 'paypal', 'stripe', 'bank_transfer', 'mobile_money']).withMessage('Invalid payment method'),
  body('guest_id_type').optional().trim(),
  body('guest_id_number').optional().trim(),
  body('early_checkin').optional().isBoolean().withMessage('Early checkin must be true or false'),
  body('late_checkout').optional().isBoolean().withMessage('Late checkout must be true or false'),
  body('extra_bed_count').optional().isInt({ min: 0 }).withMessage('Extra bed count must be 0 or more'),
  body('booking_source').optional().trim(),
  body('user_id').optional().isInt().withMessage('User ID must be an integer'),
  
], handleValidationErrors, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      room_type_id,
      check_in_date,
      check_out_date,
      guest_name,
      guest_email,
      guest_phone,
      number_of_adults = 1,
      number_of_children = 0,
      special_requests = null,
      payment_method = null,
      guest_id_type = null,
      guest_id_number = null,
      early_checkin = false,
      late_checkout = false,
      extra_bed_count = 0,
      booking_source = 'website',
      user_id = null // Optional: if user is logged in
    } = req.body;
    
    // Calculate total guests
    const total_guests = parseInt(number_of_adults) + parseInt(number_of_children);
    
    // Step 1: Validate room type exists and can accommodate guests
    const availabilityCheck = await sequelize.query(`
      SELECT 
        rt.room_type_id,
        rt.name as room_type,
        rt.price as base_price,
        rt.max_people as max_occupancy,
        h.homestay_id,
        h.name as homestay_name
      FROM room_types rt
      INNER JOIN homestays h ON rt.homestay_id = h.homestay_id
      WHERE rt.room_type_id = ?
        AND rt.max_people >= ?
    `, {
      replacements: [room_type_id, total_guests],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });
    
    if (availabilityCheck.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Room type not found or cannot accommodate the number of guests'
      });
    }
    
    const roomInfo = availabilityCheck[0];
    // No specific room assigned yet - will be assigned on arrival
    roomInfo.inventory_id = null;
    roomInfo.room_number = null;
    
    // Step 1.5: Check room type availability for the requested dates
    // Count total rooms of this type and how many are already booked
    const capacityCheck = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) 
         FROM room_inventory 
         WHERE room_type_id = ? 
           AND status IN ('available', 'occupied', 'reserved')
        ) as total_rooms,
        (SELECT COUNT(DISTINCT COALESCE(rb.inventory_id, rb.booking_id))
         FROM room_bookings rb
         INNER JOIN bookings b ON rb.booking_id = b.booking_id
         WHERE rb.room_type_id = ?
           AND b.status IN ('confirmed', 'pending', 'checked_in')
           AND rb.check_in_date < ?
           AND rb.check_out_date > ?
        ) as booked_rooms
    `, {
      replacements: [
        room_type_id,
        room_type_id,
        check_out_date,  // Existing booking starts before new booking ends
        check_in_date    // Existing booking ends after new booking starts
      ],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });
    
    const { total_rooms, booked_rooms } = capacityCheck[0];
    const available_rooms = total_rooms - booked_rooms;
    
    if (available_rooms <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `No rooms available for ${roomInfo.room_type} from ${check_in_date} to ${check_out_date}. All ${total_rooms} rooms are already booked.`,
        details: {
          room_type: roomInfo.room_type,
          total_rooms: parseInt(total_rooms),
          booked_rooms: parseInt(booked_rooms),
          available_rooms: 0
        }
      });
    }
    
    // Step 2: Calculate pricing
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    const room_price_per_night = parseFloat(roomInfo.base_price);
    const total_room_amount = room_price_per_night * nights;
    
    // Calculate additional fees
    const early_checkin_fee = early_checkin ? room_price_per_night * 0.5 : 0; // 50% of room rate
    const late_checkout_fee = late_checkout ? room_price_per_night * 0.5 : 0;
    const extra_bed_fee = extra_bed_count * 10000 * nights; // 10,000 RWF per bed per night
    
    // Calculate tax and service charge (18% VAT in Rwanda)
    const subtotal = total_room_amount + early_checkin_fee + late_checkout_fee + extra_bed_fee;
    const tax_amount = subtotal * 0.18;
    const service_charge = subtotal * 0.05; // 5% service charge
    const final_amount = subtotal + tax_amount + service_charge;
    
    // Step 3: Generate booking reference
    const booking_reference = 'TRV-' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Step 4: Create main booking record
    const [bookingResult] = await sequelize.query(`
      INSERT INTO bookings (
        service_type,
        user_id,
        total_amount,
        status,
        payment_status,
        booking_reference,
        booking_source,
        special_requests,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        'room',
        user_id || null, // Allow guest bookings without user account
        final_amount,
        'pending', // Will be updated to 'confirmed' after payment
        'pending',
        booking_reference,
        booking_source,
        special_requests
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });
    
    const booking_id = bookingResult;
    
    // Step 5: Create room booking details
    await sequelize.query(`
      INSERT INTO room_bookings (
        booking_id,
        room_type_id,
        inventory_id,
        homestay_id,
        check_in_date,
        check_out_date,
        guests,
        nights,
        room_price_per_night,
        total_room_amount,
        guest_name,
        guest_email,
        guest_phone,
        guest_id_type,
        guest_id_number,
        number_of_adults,
        number_of_children,
        early_checkin,
        late_checkout,
        early_checkin_fee,
        late_checkout_fee,
        extra_bed_count,
        extra_bed_fee,
        tax_amount,
        service_charge,
        final_amount,
        special_requests,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        booking_id,
        roomInfo.room_type_id,
        roomInfo.inventory_id, // Will be NULL if not assigned yet
        roomInfo.homestay_id,
        check_in_date,
        check_out_date,
        total_guests,
        nights,
        room_price_per_night,
        total_room_amount,
        guest_name,
        guest_email,
        guest_phone,
        guest_id_type,
        guest_id_number,
        number_of_adults,
        number_of_children,
        early_checkin ? 1 : 0,
        late_checkout ? 1 : 0,
        early_checkin_fee,
        late_checkout_fee,
        extra_bed_count,
        extra_bed_fee,
        tax_amount,
        service_charge,
        final_amount,
        special_requests
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });
    
    // Step 6: Create or update guest profile
    let guest_id;
    
    // Check if guest already exists by email
    const existingGuest = await sequelize.query(`
      SELECT guest_id FROM guest_profiles WHERE email = ?
    `, {
      replacements: [guest_email],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });
    
    if (existingGuest.length > 0) {
      // Update existing guest
      guest_id = existingGuest[0].guest_id;
      
      // Parse name (simple split by space)
      const nameParts = guest_name.trim().split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(' ') || nameParts[0];
      
      await sequelize.query(`
        UPDATE guest_profiles 
        SET 
          first_name = ?,
          last_name = ?,
          phone = ?,
          id_type = COALESCE(?, id_type),
          id_number = COALESCE(?, id_number),
          total_bookings = total_bookings + 1,
          total_spent = total_spent + ?,
          updated_at = NOW()
        WHERE guest_id = ?
      `, {
        replacements: [first_name, last_name, guest_phone, guest_id_type, guest_id_number, final_amount, guest_id],
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      });
      
    } else {
      // Create new guest profile
      const nameParts = guest_name.trim().split(' ');
      const first_name = nameParts[0];
      const last_name = nameParts.slice(1).join(' ') || nameParts[0];
      
      const [guestResult] = await sequelize.query(`
        INSERT INTO guest_profiles (
          user_id,
          first_name,
          last_name,
          email,
          phone,
          id_type,
          id_number,
          total_bookings,
          total_spent,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())
      `, {
        replacements: [user_id, first_name, last_name, guest_email, guest_phone, guest_id_type, guest_id_number, final_amount],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
      
      guest_id = guestResult;
    }
    
    // Step 7: Link guest to booking
    await sequelize.query(`
      INSERT INTO booking_guests (
        booking_id,
        guest_id,
        is_primary,
        room_assignment,
        created_at
      ) VALUES (?, ?, 1, ?, NOW())
    `, {
      replacements: [booking_id, guest_id, roomInfo.room_number],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });
    
    // Step 8: Create payment transaction record (if payment method provided)
    let transaction_id = null;
    if (payment_method) {
      const [paymentResult] = await sequelize.query(`
        INSERT INTO payment_transactions (
          booking_id,
          amount,
          currency,
          payment_method,
          status,
          created_at
        ) VALUES (?, ?, 'RWF', ?, 'pending', NOW())
      `, {
        replacements: [booking_id, final_amount, payment_method],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
      
      transaction_id = paymentResult;
    }
    
    // Commit transaction
    await t.commit();
    
    // Return success response with booking details
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: {
          booking_id,
          booking_reference,
          status: 'pending',
          payment_status: 'pending'
        },
        room: {
          room_number: roomInfo.room_number,
          room_type: roomInfo.room_type,
          homestay_name: roomInfo.homestay_name
        },
        dates: {
          check_in_date,
          check_out_date,
          nights
        },
        guest: {
          guest_id,
          name: guest_name,
          email: guest_email,
          phone: guest_phone
        },
        pricing: {
          room_price_per_night,
          total_room_amount,
          early_checkin_fee,
          late_checkout_fee,
          extra_bed_fee,
          subtotal,
          tax_amount,
          service_charge,
          final_amount,
          currency: 'RWF'
        },
        payment: transaction_id ? {
          transaction_id,
          payment_method,
          status: 'pending'
        } : null,
        next_steps: {
          message: 'Please proceed with payment to confirm your booking',
          payment_url: transaction_id ? `/api/room-bookings/payment/${transaction_id}` : null
        }
      }
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

/**
 * POST /api/room-bookings/payment/:transaction_id
 * Process payment for a booking
 */
router.post('/payment/:transaction_id', [
  body('payment_gateway_id').optional().trim(),
  body('gateway_response').optional()
], handleValidationErrors, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { transaction_id } = req.params;
    const { payment_gateway_id, gateway_response } = req.body;
    
    // Get transaction details
    const transactions = await sequelize.query(`
      SELECT pt.*, b.booking_id, b.booking_reference
      FROM payment_transactions pt
      INNER JOIN bookings b ON pt.booking_id = b.booking_id
      WHERE pt.transaction_id = ?
    `, {
      replacements: [transaction_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });
    
    if (transactions.length === 0) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    const transaction = transactions[0];
    
    if (transaction.status === 'completed') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }
    
    // Update payment transaction
    await sequelize.query(`
      UPDATE payment_transactions
      SET 
        status = 'completed',
        payment_gateway_id = ?,
        gateway_response = ?,
        updated_at = NOW()
      WHERE transaction_id = ?
    `, {
      replacements: [payment_gateway_id, JSON.stringify(gateway_response), transaction_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });
    
    // Update booking status
    await sequelize.query(`
      UPDATE bookings
      SET 
        status = 'confirmed',
        payment_status = 'paid',
        confirmed_at = NOW(),
        updated_at = NOW()
      WHERE booking_id = ?
    `, {
      replacements: [transaction.booking_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });
    
    // Room will be assigned when guest arrives (via Room Assignment interface)
    // No automatic assignment on payment confirmation
    
    await t.commit();
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        transaction_id,
        booking_id: transaction.booking_id,
        booking_reference: transaction.booking_reference,
        status: 'confirmed',
        payment_status: 'paid'
      }
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

/**
 * GET /api/room-bookings
 * Get all room bookings with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      payment_status, 
      homestay_id, 
      check_in_date,
      check_out_date,
      search 
    } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    
    // Build WHERE conditions
    if (status) {
      whereConditions.push('b.status = ?');
      queryParams.push(status);
    }
    
    if (payment_status) {
      whereConditions.push('b.payment_status = ?');
      queryParams.push(payment_status);
    }
    
    if (homestay_id) {
      whereConditions.push('rb.homestay_id = ?');
      queryParams.push(homestay_id);
    }
    
    if (check_in_date) {
      whereConditions.push('rb.check_in_date >= ?');
      queryParams.push(check_in_date);
    }
    
    if (check_out_date) {
      whereConditions.push('rb.check_out_date <= ?');
      queryParams.push(check_out_date);
    }
    
    if (search) {
      whereConditions.push('(rb.guest_name LIKE ? OR rb.guest_email LIKE ? OR b.booking_reference LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    const bookings = await sequelize.query(`
      SELECT 
        b.booking_id,
        b.booking_reference,
        b.status,
        b.payment_status,
        b.total_amount,
        b.special_requests,
        b.created_at,
        b.confirmed_at,
        rb.booking_id as room_booking_id,
        rb.inventory_id,
        rb.room_type_id,
        rb.homestay_id,
        rb.check_in_date,
        rb.check_out_date,
        rb.guests,
        rb.nights,
        rb.room_price_per_night,
        rb.total_room_amount,
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        rb.number_of_adults,
        rb.number_of_children,
        rb.early_checkin,
        rb.late_checkout,
        rb.early_checkin_fee,
        rb.late_checkout_fee,
        rb.extra_bed_count,
        rb.extra_bed_fee,
        rb.tax_amount,
        rb.service_charge,
        rb.final_amount,
        ri.unit_number as room_number,
        ri.floor,
        rt.name as room_type_name,
        h.name as homestay_name,
        pt.transaction_id,
        pt.payment_method,
        pt.status as transaction_status
      FROM room_bookings rb
      INNER JOIN bookings b ON rb.booking_id = b.booking_id
      LEFT JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      LEFT JOIN room_types rt ON rb.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN payment_transactions pt ON b.booking_id = pt.booking_id
      ${whereClause}
      ORDER BY b.created_at DESC
    `, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: {
        bookings,
        total: bookings.length
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

/**
 * GET /api/room-bookings/:booking_id
 * Get booking details by booking ID
 */
router.get('/:booking_id', async (req, res) => {
  try {
    const { booking_id } = req.params;
    
    const bookings = await sequelize.query(`
      SELECT 
        b.booking_id,
        b.booking_reference,
        b.status,
        b.payment_status,
        b.total_amount,
        b.special_requests,
        b.created_at,
        b.confirmed_at,
        rb.inventory_id,
        rb.check_in_date,
        rb.check_out_date,
        rb.guests,
        rb.nights,
        rb.room_price_per_night,
        rb.total_room_amount,
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        rb.number_of_adults,
        rb.number_of_children,
        rb.early_checkin,
        rb.late_checkout,
        rb.early_checkin_fee,
        rb.late_checkout_fee,
        rb.extra_bed_count,
        rb.extra_bed_fee,
        rb.tax_amount,
        rb.service_charge,
        rb.final_amount,
        ri.unit_number as room_number,
        ri.floor,
        rt.name as room_type,
        rt.description as room_description,
        h.homestay_id,
        h.name as homestay_name,
        h.address as homestay_address,
        h.phone as homestay_phone,
        gp.guest_id,
        gp.first_name,
        gp.last_name,
        pt.transaction_id,
        pt.payment_method,
        pt.status as payment_transaction_status
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      INNER JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      INNER JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN booking_guests bg ON b.booking_id = bg.booking_id AND bg.is_primary = 1
      LEFT JOIN guest_profiles gp ON bg.guest_id = gp.guest_id
      LEFT JOIN payment_transactions pt ON b.booking_id = pt.booking_id
      WHERE b.booking_id = ?
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT
    });
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: { booking: bookings[0] }
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

/**
 * PATCH /api/room-bookings/:booking_id/cancel
 * Cancel a booking
 */
router.patch('/:booking_id/cancel', [
  body('cancellation_reason').optional().trim()
], handleValidationErrors, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { booking_id } = req.params;
    const { cancellation_reason, cancelled_by } = req.body;
    
    // Check if booking exists and can be cancelled
    const bookings = await sequelize.query(`
      SELECT booking_id, status, payment_status
      FROM bookings
      WHERE booking_id = ?
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
    
    if (booking.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }
    
    // Update booking status
    await sequelize.query(`
      UPDATE bookings
      SET 
        status = 'cancelled',
        cancellation_reason = ?,
        cancelled_at = NOW(),
        cancelled_by = ?,
        updated_at = NOW()
      WHERE booking_id = ?
    `, {
      replacements: [cancellation_reason, cancelled_by, booking_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });
    
    // If payment was made, update payment status to refunded
    if (booking.payment_status === 'paid') {
      await sequelize.query(`
        UPDATE bookings
        SET payment_status = 'refunded'
        WHERE booking_id = ?
      `, {
        replacements: [booking_id],
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      });
      
      await sequelize.query(`
        UPDATE payment_transactions
        SET status = 'refunded', updated_at = NOW()
        WHERE booking_id = ?
      `, {
        replacements: [booking_id],
        type: sequelize.QueryTypes.UPDATE,
        transaction: t
      });
    }
    
    await t.commit();
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking_id,
        status: 'cancelled',
        refund_status: booking.payment_status === 'paid' ? 'refunded' : 'not_applicable'
      }
    });
    
  } catch (error) {
    await t.rollback();
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
});

module.exports = router;