const express = require('express');
const { sequelize } = require('../../config/database');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

/**
 * @route   GET /api/guests/search
 * @desc    Search guests by name, email, or phone
 * @access  Private (Staff only)
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const user = req.user;

    if (!user || !user.assigned_hotel_id) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    // If no search query or query is too short, return all guests
    let guests;
    if (!q || q.trim().length < 2) {
      // Return all guests
      guests = await sequelize.query(`
        SELECT 
          gp.guest_id,
          gp.first_name,
          gp.last_name,
          gp.email,
          gp.phone,
          gp.nationality,
          gp.vip_status,
          gp.loyalty_points,
          gp.total_bookings,
          gp.total_spent,
          gp.last_stay_date,
          CONCAT(gp.first_name, ' ', gp.last_name) as full_name
        FROM guest_profiles gp
        ORDER BY gp.last_stay_date DESC, gp.total_spent DESC
        LIMIT 50
      `, {
        type: sequelize.QueryTypes.SELECT
      });
    } else {
      // Search with query
      const searchTerm = `%${q.trim()}%`;
      guests = await sequelize.query(`
        SELECT 
          gp.guest_id,
          gp.first_name,
          gp.last_name,
          gp.email,
          gp.phone,
          gp.nationality,
          gp.vip_status,
          gp.loyalty_points,
          gp.total_bookings,
          gp.total_spent,
          gp.last_stay_date,
          CONCAT(gp.first_name, ' ', gp.last_name) as full_name
        FROM guest_profiles gp
        WHERE gp.first_name LIKE ? 
           OR gp.last_name LIKE ? 
           OR gp.email LIKE ? 
           OR gp.phone LIKE ?
           OR CONCAT(gp.first_name, ' ', gp.last_name) LIKE ?
        ORDER BY gp.last_stay_date DESC, gp.total_spent DESC
        LIMIT 20
      `, {
        replacements: [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
        type: sequelize.QueryTypes.SELECT
      });
    }

    res.json({
      success: true,
      data: {
        guests,
        total: guests.length
      }
    });

  } catch (error) {
    console.error('Error searching guests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search guests',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/guests/:guest_id
 * @desc    Get guest profile with complete information
 * @access  Private (Staff only)
 */
router.get('/:guest_id', authMiddleware, async (req, res) => {
  try {
    const { guest_id } = req.params;
    const user = req.user;

    if (!user || !user.assigned_hotel_id) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    const homestayId = user.assigned_hotel_id;

    // Get guest profile details
    const guestProfile = await sequelize.query(`
      SELECT 
        gp.*,
        CONCAT(gp.first_name, ' ', gp.last_name) as full_name
      FROM guest_profiles gp
      WHERE gp.guest_id = ?
    `, {
      replacements: [guest_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (guestProfile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guest profile not found'
      });
    }

    const guest = guestProfile[0];

    // Get booking history
    const bookingHistory = await sequelize.query(`
      SELECT 
        b.booking_id,
        b.booking_reference,
        b.status,
        b.payment_status,
        b.total_amount,
        b.created_at as booking_date,
        b.confirmed_at,
        b.completed_at,
        b.cancelled_at,
        rb.check_in_date,
        rb.check_out_date,
        rb.nights,
        rb.guest_name,
        rt.name as room_type,
        ri.unit_number as room_number,
        h.name as homestay_name
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE rb.guest_name = ? OR rb.guest_email = ?
      ORDER BY b.created_at DESC
    `, {
      replacements: [guest.full_name, guest.email],
      type: sequelize.QueryTypes.SELECT
    });

    // Get payment history - look for payments by guest name/email or through bookings
    const paymentHistory = await sequelize.query(`
      SELECT 
        pt.transaction_id,
        pt.amount,
        pt.payment_method,
        pt.paid_by,
        pt.reference_number,
        pt.status,
        pt.created_at as payment_date,
        b.booking_reference,
        i.invoice_number,
        rb.guest_name,
        rb.guest_email
      FROM payment_transactions pt
      LEFT JOIN invoices i ON pt.invoice_id = i.invoice_id
      LEFT JOIN bookings b ON (pt.booking_id = b.booking_id OR i.booking_id = b.booking_id)
      LEFT JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE pt.paid_by = ? 
         OR pt.paid_by LIKE ?
         OR rb.guest_name = ?
         OR rb.guest_email = ?
      ORDER BY pt.created_at DESC
    `, {
      replacements: [guest.full_name, `%${guest.email}%`, guest.full_name, guest.email],
      type: sequelize.QueryTypes.SELECT
    });

    // Get reviews
    const reviews = await sequelize.query(`
      SELECT 
        gr.*,
        h.name as homestay_name
      FROM guest_reviews gr
      LEFT JOIN homestays h ON gr.homestay_id = h.homestay_id
      WHERE gr.guest_id = ?
      ORDER BY gr.created_at DESC
    `, {
      replacements: [guest_id],
      type: sequelize.QueryTypes.SELECT
    });

    // Get complaints
    const complaints = await sequelize.query(`
      SELECT 
        gc.*,
        h.name as homestay_name
      FROM guest_complaints gc
      LEFT JOIN bookings b ON gc.booking_id = b.booking_id
      LEFT JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE gc.guest_id = ?
      ORDER BY gc.reported_at DESC
    `, {
      replacements: [guest_id],
      type: sequelize.QueryTypes.SELECT
    });

    // Get service requests
    const serviceRequests = await sequelize.query(`
      SELECT
        gr.request_id,
        gr.booking_id,
        gr.guest_id,
        gr.request_type,
        gr.description,
        gr.priority,
        gr.status,
        gr.assigned_to,
        gr.requested_time,
        gr.scheduled_time,
        gr.completed_time,
        gr.additional_charges,
        gr.notes,
        gr.staff_notes,
        gr.rating,
        gr.feedback,
        rb.guest_name,
        rb.guest_email,
        hu.name as assigned_staff_name,
        hu.email as assigned_staff_email,
        hu.role as assigned_staff_role
      FROM guest_requests gr
      LEFT JOIN bookings b ON gr.booking_id = b.booking_id
      LEFT JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN hms_users hu ON gr.assigned_to = hu.hms_user_id
      WHERE gr.guest_id = ? OR rb.guest_name = ? OR rb.guest_email = ?
      ORDER BY gr.requested_time DESC
    `, {
      replacements: [guest_id, guest.full_name, guest.email],
      type: sequelize.QueryTypes.SELECT
    });

    // Get activity logs related to this guest
    const activityLogs = await sequelize.query(`
      SELECT 
        sal.log_id,
        sal.staff_id,
        sal.action,
        sal.table_name,
        sal.record_id,
        sal.timestamp
      FROM staff_activity_logs sal
      WHERE sal.table_name IN ('bookings', 'guest_profiles', 'payment_transactions', 'guest_requests', 'guest_complaints')
        AND sal.record_id IN (
          SELECT b.booking_id FROM bookings b
          INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
          WHERE rb.guest_name = ? OR rb.guest_email = ?
          UNION
          SELECT ? as guest_id
        )
      ORDER BY sal.timestamp DESC
    `, {
      replacements: [guest.full_name, guest.email, guest_id],
      type: sequelize.QueryTypes.SELECT
    });

    // Calculate guest statistics
    const totalBookings = bookingHistory.length;
    const totalSpent = paymentHistory.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const lastStayDate = bookingHistory.length > 0 ? bookingHistory[0].check_out_date : null;

    res.json({
      success: true,
      data: {
        profile: {
          ...guest,
          total_bookings: totalBookings,
          total_spent: totalSpent,
          last_stay_date: lastStayDate
        },
        bookingHistory,
        paymentHistory,
        reviews,
        complaints,
        serviceRequests,
        activityLogs,
        statistics: {
          totalBookings,
          totalSpent,
          averageRating: reviews.length > 0 ? 
            reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length : 0,
          complaintsCount: complaints.length,
          serviceRequestsCount: serviceRequests.length,
          activityLogsCount: activityLogs.length,
          loyaltyStatus: guest.vip_status ? 'VIP' : 
                        guest.loyalty_points > 1000 ? 'Gold' :
                        guest.loyalty_points > 500 ? 'Silver' : 'Bronze'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching guest profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest profile',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/guests/:guest_id
 * @desc    Update guest profile information
 * @access  Private (Staff only)
 */
router.put('/:guest_id', authMiddleware, async (req, res) => {
  try {
    const { guest_id } = req.params;
    const updateData = req.body;
    const user = req.user;

    if (!user || !user.assigned_hotel_id) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel.'
      });
    }

    // Validate required fields
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'country', 'city', 'address',
      'date_of_birth', 'nationality', 'id_type', 'id_number', 'id_expiry_date',
      'passport_number', 'passport_expiry_date', 'preferences', 'notes'
    ];

    const updateFields = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields[key] = updateData[key];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateFields.updated_at = new Date();

    // Build dynamic update query
    const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(guest_id);

    await sequelize.query(`
      UPDATE guest_profiles 
      SET ${setClause}
      WHERE guest_id = ?
    `, {
      replacements: values,
      type: sequelize.QueryTypes.UPDATE
    });

    // Log staff activity
    try {
      await sequelize.query(`
        INSERT INTO staff_activity_logs (
          staff_id, action, table_name, record_id, timestamp
        ) VALUES (?, 'update_guest_profile', 'guest_profiles', ?, NOW())
      `, {
        replacements: [user.hms_user_id || user.user_id, guest_id],
        type: sequelize.QueryTypes.INSERT
      });
    } catch (logError) {
      console.log('Note: Could not log staff activity:', logError.message);
    }

    res.json({
      success: true,
      message: 'Guest profile updated successfully',
      data: updateFields
    });

  } catch (error) {
    console.error('Error updating guest profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update guest profile',
      error: error.message
    });
  }
});

module.exports = router;