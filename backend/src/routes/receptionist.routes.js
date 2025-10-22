const express = require('express');
const router = express.Router();
const receptionistController = require('../controllers/receptionist.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const hotelAccessMiddleware = require('../middlewares/hotelAccess.middleware');

// All routes require authentication and hotel access
router.use(authMiddleware);
router.use(hotelAccessMiddleware);

/**
 * GET /api/receptionist/bookings
 * Get filtered list of bookings for receptionist
 * Query params:
 * - status: booking status (confirmed, checked_in, checked_out, cancelled)
 * - start_date: filter by check-in date range start
 * - end_date: filter by check-in date range end
 * - search: search by guest name or booking reference
 * - page: page number (default: 1)
 * - limit: items per page (default: 20)
 */
router.get('/bookings', receptionistController.getBookingsList);

/**
 * GET /api/receptionist/upcoming-arrivals
 * Get bookings checking in today and tomorrow
 */
router.get('/upcoming-arrivals', receptionistController.getUpcomingArrivals);

/**
 * GET /api/receptionist/available-rooms
 * Get available rooms for assignment
 * Query params:
 * - check_in_date: check-in date (optional)
 * - check_out_date: check-out date (optional)
 * - room_type_id: filter by room type (optional)
 */
router.get('/available-rooms', receptionistController.getAvailableRooms);

/**
 * POST /api/receptionist/assign-room/:booking_id
 * Assign a room to a booking
 * Body:
 * - room_id: ID of the room to assign
 */
router.post('/assign-room/:booking_id', receptionistController.assignRoom);

/**
 * POST /api/receptionist/check-in/:booking_id
 * Check in a guest
 * Body:
 * - actual_check_in_time: timestamp (optional, defaults to now)
 * - notes: check-in notes (optional)
 */
router.post('/check-in/:booking_id', receptionistController.checkInGuest);

/**
 * POST /api/receptionist/check-out/:booking_id
 * Check out a guest
 * Body:
 * - deposit_returned: amount returned to guest (optional)
 * - additional_charges: extra charges incurred (optional)
 * - payment_method: payment method used for charges (optional)
 * - notes: checkout notes (optional)
 */
router.post('/check-out/:booking_id', receptionistController.checkOutGuest);

module.exports = router;
