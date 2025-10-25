const express = require('express');
const { RoomAvailability } = require('../models');
const { sequelize } = require('../../config/database');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

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
 * STEP 1: Get all available locations
 * Returns unique locations where homestays exist
 * This is the first step in the booking flow
 */
router.get('/locations', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        l.location_id,
        l.location_name,
        COUNT(DISTINCT h.homestay_id) as homestay_count
      FROM locations l
      INNER JOIN homestays h ON l.location_id = h.location_id
      WHERE h.status = 'active'
      GROUP BY l.location_id, l.location_name
      ORDER BY l.location_name
    `;
    
    const results = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        locations: results
      }
    });
  } catch (error) {
    console.error('Fetch locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: error.message
    });
  }
});

/**
 * STEP 2: Get available hotels/homestays by location, dates, and occupancy
 * Returns hotels that have at least one available room matching the criteria
 * This is the second step in the booking flow - after location selection
 * 
 * Query Parameters:
 * - location_id: Location ID to search (required)
 * - start_date: Check-in date (required)
 * - end_date: Check-out date (required)
 * - guests: Number of guests (optional)
 */
router.get('/available-hotels', async (req, res) => {
  try {
    const { location_id, start_date, end_date, guests } = req.query;
    
    if (!location_id) {
      return res.status(400).json({
        success: false,
        message: 'Location ID is required'
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Build WHERE clause for guest filter
    let guestFilter = '';
    let queryParams = [location_id, start_date, end_date];
    
    if (guests) {
      guestFilter = 'AND rt.max_people >= ?';
      queryParams.push(guests);
    }

    const query = `
      SELECT 
        h.homestay_id,
        h.name as homestay_name,
        h.description,
        h.address,
        COALESCE(l.location_name, 'Not specified') as location_name,
        h.star_rating,
        h.free_wifi,
        h.parking_available,
        h.swimming_pool,
        h.restaurant,
        h.breakfast_included,
        COUNT(DISTINCT rav.inventory_id) as available_rooms_count,
        MIN(rt.price) as price_from,
        MAX(rt.max_people) as max_occupancy
      FROM homestays h
      LEFT JOIN locations l ON h.location_id = l.location_id
      INNER JOIN room_types rt ON h.homestay_id = rt.homestay_id
      INNER JOIN room_availability_view rav ON rt.room_type_id = rav.room_type_id
      WHERE (h.location_id = ? OR h.location_id IS NULL)
        AND h.status = 'active'
        AND rav.current_status = 'available'
        AND (rav.check_in_date IS NULL OR rav.check_out_date <= ? OR rav.check_in_date >= ?)
        ${guestFilter}
      GROUP BY h.homestay_id, l.location_name
      HAVING available_rooms_count > 0
      ORDER BY h.featured DESC, h.star_rating DESC, h.name
    `;
    
    const results = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    // Get images for each hotel
    const hotelsWithImages = await Promise.all(
      results.map(async (hotel) => {
        const images = await sequelize.query(
          "SELECT * FROM homestay_images WHERE homestay_id = ? ORDER BY image_order",
          {
            replacements: [hotel.homestay_id],
            type: sequelize.QueryTypes.SELECT,
          }
        );
        
        return {
          ...hotel,
          images: images
        };
      })
    );

    res.json({
      success: true,
      data: {
        hotels: hotelsWithImages,
        count: hotelsWithImages.length,
        search_criteria: {
          location_id,
          start_date,
          end_date,
          guests: guests || 'any'
        }
      }
    });
  } catch (error) {
    console.error('Fetch available hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available hotels',
      error: error.message
    });
  }
});

/**
 * Get room availability using room_availability_view
 * This view provides real-time availability based on actual bookings
 * 
 * Query Parameters:
 * - homestay_id: Filter by homestay (optional)
 * - room_type_id: Filter by room type (optional)
 * - start_date: Start date for availability check (required)
 * - end_date: End date for availability check (required)
 * - status: Filter by current_status (available, reserved, occupied) (optional)
 */
router.get('/calendar', async (req, res) => {
  try {
    const { homestay_id, room_type_id, start_date, end_date, status } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Build WHERE clause dynamically
    let whereConditions = [];
    let queryParams = [];
    
    // Filter by date range - check if room is available during the requested period
    // A room is available if:
    // 1. It has no booking (check_in_date and check_out_date are NULL), OR
    // 2. The booking doesn't overlap with the requested date range
    whereConditions.push(`(
      (check_in_date IS NULL AND check_out_date IS NULL) OR
      (check_out_date <= ? OR check_in_date >= ?)
    )`);
    queryParams.push(start_date, end_date);
    
    if (homestay_id) {
      whereConditions.push('rt.homestay_id = ?');
      queryParams.push(homestay_id);
    }
    
    if (room_type_id) {
      whereConditions.push('rav.room_type_id = ?');
      queryParams.push(room_type_id);
    }

    if (status) {
      whereConditions.push('rav.current_status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const query = `
      SELECT 
        rav.inventory_id,
        rav.room_type_id,
        rav.room_type,
        rav.unit_number as room_number,
        rav.floor,
        rav.room_status,
        rav.current_status,
        rav.check_in_date,
        rav.check_out_date,
        rt.homestay_id,
        h.name as homestay_name,
        rt.price as base_price,
        rt.max_people as max_occupancy
      FROM room_availability_view rav
      LEFT JOIN room_types rt ON rav.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      ${whereClause}
      ORDER BY h.name, rav.room_type, rav.unit_number
    `;
    
    const results = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    // Group results by availability status
    const available = results.filter(r => r.current_status === 'available');
    const reserved = results.filter(r => r.current_status === 'reserved');
    const occupied = results.filter(r => r.current_status === 'occupied');

    res.json({
      success: true,
      data: {
        availability: results,
        summary: {
          total_rooms: results.length,
          available: available.length,
          reserved: reserved.length,
          occupied: occupied.length
        },
        date_range: {
          start: start_date,
          end: end_date
        }
      }
    });
  } catch (error) {
    console.error('Fetch room availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room availability',
      error: error.message
    });
  }
});

/**
 * Get availability for specific room type and date range
 * Checks if a specific room type is available for the given dates
 */
router.get('/room/:roomTypeId', async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // First, get the room type details
    const roomTypeQuery = `
      SELECT 
        rt.room_type_id,
        rt.name as room_type,
        rt.description,
        rt.price as base_price,
        rt.max_people as max_occupancy,
        rt.size_sqm,
        rt.homestay_id,
        h.name as homestay_name
      FROM room_types rt
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      WHERE rt.room_type_id = ?
    `;
    
    const roomTypeResults = await sequelize.query(roomTypeQuery, {
      replacements: [roomTypeId],
      type: sequelize.QueryTypes.SELECT
    });

    if (roomTypeResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    const roomType = roomTypeResults[0];

    // Get images for the room type
    const images = await sequelize.query(
      "SELECT * FROM room_images WHERE room_type_id = ? ORDER BY image_order",
      {
        replacements: [roomTypeId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Now get availability for all rooms of this type using the same logic as booking creation
    const availabilityQuery = `
      SELECT 
        ri.inventory_id,
        ri.room_type_id,
        rt.name as room_type,
        ri.unit_number as room_number,
        ri.floor,
        ri.status as room_status,
        CASE 
          WHEN ri.status IN ('maintenance', 'out_of_service') THEN 'maintenance'
          WHEN rb.booking_id IS NULL THEN 'available'
          WHEN rb.check_in_date <= ? AND rb.check_out_date > ? THEN 'occupied'
          WHEN rb.check_in_date > ? THEN 'reserved'
          ELSE 'available'
        END as current_status,
        rb.check_in_date,
        rb.check_out_date,
        CASE 
          WHEN ri.status IN ('maintenance', 'out_of_service') THEN false
          WHEN rb.booking_id IS NULL THEN true
          WHEN rb.check_in_date < ? AND rb.check_out_date > ? THEN false
          ELSE true
        END as is_available
      FROM room_inventory ri
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      LEFT JOIN room_bookings rb ON ri.inventory_id = rb.inventory_id
        AND rb.check_in_date < ?
        AND rb.check_out_date > ?
      LEFT JOIN bookings b ON rb.booking_id = b.booking_id
        AND b.status IN ('confirmed', 'pending', 'checked_in')
      WHERE ri.room_type_id = ?
        AND ri.status IN ('available', 'occupied', 'reserved', 'cleaning')
      ORDER BY ri.unit_number
    `;
    
    const availabilityResults = await sequelize.query(availabilityQuery, {
      replacements: [end_date, start_date, start_date, end_date, start_date, end_date, start_date, roomTypeId],
      type: sequelize.QueryTypes.SELECT
    });

    // Calculate availability summary using the same logic as booking creation
    const totalRooms = availabilityResults.length;
    
    // Count actual bookings for this room type (same logic as booking creation)
    const bookingCountQuery = `
      SELECT COUNT(DISTINCT rb.booking_id) as booked_count
      FROM room_bookings rb
      INNER JOIN bookings b ON rb.booking_id = b.booking_id
      WHERE rb.room_type_id = ?
        AND b.status IN ('confirmed', 'pending', 'checked_in')
        AND rb.check_in_date < ?
        AND rb.check_out_date > ?
    `;
    
    const bookingCountResult = await sequelize.query(bookingCountQuery, {
      replacements: [roomTypeId, end_date, start_date],
      type: sequelize.QueryTypes.SELECT
    });
    
    const bookedRooms = parseInt(bookingCountResult[0].booked_count);
    const availableRooms = Math.max(0, totalRooms - bookedRooms);
    const isAvailable = availableRooms > 0;

    res.json({
      success: true,
      data: {
        room_type_id: roomType.room_type_id,
        room_type: roomType.room_type,
        description: roomType.description,
        base_price: roomType.base_price,
        max_occupancy: roomType.max_occupancy,
        size_sqm: roomType.size_sqm,
        homestay_id: roomType.homestay_id,
        homestay_name: roomType.homestay_name,
        images: images,
        is_available: isAvailable,
        availability_summary: {
          total_rooms: totalRooms,
          available_rooms: availableRooms,
          occupied_rooms: totalRooms - availableRooms
        },
        room_details: availabilityResults,
        date_range: {
          start: start_date,
          end: end_date
        }
      }
    });
  } catch (error) {
    console.error('Fetch room type availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room type availability',
      error: error.message
    });
  }
});

/**
 * Get all available rooms for a date range
 * Returns only rooms that are completely available (no overlapping bookings)
 * Uses the same date overlap logic as booking creation for consistency
 */
router.get('/available-rooms', async (req, res) => {
  try {
    const { homestay_id, room_type_id, start_date, end_date, guests } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Build WHERE clause for filtering
    let whereConditions = ['ri.status IN ("available", "occupied", "reserved")'];
    let queryParams = [];
    
    if (homestay_id) {
      whereConditions.push('rt.homestay_id = ?');
      queryParams.push(homestay_id);
    }
    
    if (room_type_id) {
      whereConditions.push('ri.room_type_id = ?');
      queryParams.push(room_type_id);
    }

    if (guests) {
      whereConditions.push('rt.max_people >= ?');
      queryParams.push(guests);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Add date parameters for the subquery (date overlap check)
    queryParams.push(end_date);   // For: rb.check_in_date < ?
    queryParams.push(start_date);  // For: rb.check_out_date > ?

    // Query to find rooms with NO overlapping bookings
    // Uses the same date overlap logic as booking creation
    const query = `
      SELECT 
        ri.inventory_id,
        ri.room_type_id,
        rt.name as room_type,
        ri.unit_number as room_number,
        ri.floor,
        ri.status as room_status,
        'available' as current_status,
        rt.homestay_id,
        h.name as homestay_name,
        rt.price as base_price,
        rt.max_people as max_occupancy,
        rt.description as room_description
      FROM room_inventory ri
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      ${whereClause}
      AND NOT EXISTS (
        SELECT 1
        FROM room_bookings rb
        INNER JOIN bookings b ON rb.booking_id = b.booking_id
        WHERE rb.inventory_id = ri.inventory_id
          AND b.status IN ('confirmed', 'pending', 'checked_in')
          AND rb.check_in_date < ?
          AND rb.check_out_date > ?
      )
      ORDER BY h.name, rt.name, ri.unit_number
    `;
    
    const results = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        available_rooms: results,
        count: results.length,
        search_criteria: {
          start_date,
          end_date,
          homestay_id: homestay_id || 'all',
          room_type_id: room_type_id || 'all',
          guests: guests || 'any'
        }
      }
    });
  } catch (error) {
    console.error('Fetch available rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error.message
    });
  }
});

/**
 * Check availability for multiple rooms at once
 * Useful for booking systems that need to check multiple rooms simultaneously
 */
router.post('/check-availability', [
  body('room_ids').isArray().withMessage('Room IDs must be an array'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').isDate().withMessage('Valid end date is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { room_ids, start_date, end_date } = req.body;

    if (room_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one room ID is required'
      });
    }

    const placeholders = room_ids.map(() => '?').join(',');
    
    const query = `
      SELECT 
        rav.inventory_id,
        rav.room_type,
        rav.unit_number as room_number,
        rav.current_status,
        rav.check_in_date,
        rav.check_out_date,
        CASE 
          WHEN rav.check_in_date IS NULL AND rav.check_out_date IS NULL THEN true
          WHEN rav.check_out_date <= ? OR rav.check_in_date >= ? THEN true
          ELSE false
        END as is_available
      FROM room_availability_view rav
      WHERE rav.inventory_id IN (${placeholders})
    `;
    
    const results = await sequelize.query(query, {
      replacements: [start_date, end_date, ...room_ids],
      type: sequelize.QueryTypes.SELECT
    });

    // Group by availability
    const availabilityMap = {};
    results.forEach(room => {
      if (!availabilityMap[room.inventory_id]) {
        availabilityMap[room.inventory_id] = {
          inventory_id: room.inventory_id,
          room_type: room.room_type,
          room_number: room.room_number,
          is_available: room.is_available,
          current_status: room.current_status,
          conflicting_booking: room.is_available ? null : {
            check_in: room.check_in_date,
            check_out: room.check_out_date
          }
        };
      }
    });

    res.json({
      success: true,
      data: {
        rooms: Object.values(availabilityMap),
        date_range: {
          start: start_date,
          end: end_date
        }
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
});

/**
 * Get room types with availability counts
 * Returns room types grouped with counts of available items for each type
 */
router.get('/rooms', async (req, res) => {
  try {
    const { homestay_id, status } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    
    if (homestay_id) {
      whereConditions.push('rt.homestay_id = ?');
      queryParams.push(homestay_id);
    }

    if (status) {
      whereConditions.push('rav.current_status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const query = `
      SELECT 
        rt.room_type_id,
        rt.name as room_type,
        rt.description,
        rt.price as base_price,
        rt.max_people as max_occupancy,
        rt.homestay_id,
        h.name as homestay_name,
        COUNT(rav.inventory_id) as total_items,
        COUNT(CASE WHEN rav.current_status = 'available' THEN 1 END) as available_count,
        COUNT(CASE WHEN rav.current_status = 'occupied' THEN 1 END) as occupied_count,
        COUNT(CASE WHEN rav.current_status = 'reserved' THEN 1 END) as reserved_count,
        COUNT(CASE WHEN rav.current_status = 'maintenance' THEN 1 END) as maintenance_count,
        COUNT(CASE WHEN rav.current_status = 'out_of_order' THEN 1 END) as out_of_order_count
      FROM room_types rt
      LEFT JOIN room_availability_view rav ON rt.room_type_id = rav.room_type_id
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      ${whereClause}
      GROUP BY rt.room_type_id, rt.name, rt.description, rt.price, rt.max_people, 
               rt.homestay_id, h.name
      ORDER BY h.name, rt.name
    `;
    
    const results = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: { room_types: results }
    });
  } catch (error) {
    console.error('Fetch room types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room types',
      error: error.message
    });
  }
});

/**
 * Get room status summary
 * Provides a quick overview of all room statuses
 */
router.get('/summary', async (req, res) => {
  try {
    const { homestay_id } = req.query;
    
    let whereClause = '';
    let queryParams = [];
    
    if (homestay_id) {
      whereClause = 'WHERE rt.homestay_id = ?';
      queryParams.push(homestay_id);
    }

    const query = `
      SELECT 
        rav.current_status,
        COUNT(DISTINCT rav.inventory_id) as count,
        rt.homestay_id,
        h.name as homestay_name
      FROM room_availability_view rav
      LEFT JOIN room_types rt ON rav.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
      ${whereClause}
      GROUP BY rav.current_status, rt.homestay_id, h.name
      ORDER BY h.name, rav.current_status
    `;
    
    const results = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    // Calculate totals
    const summary = {
      available: 0,
      reserved: 0,
      occupied: 0,
      total: 0
    };

    results.forEach(row => {
      if (row.current_status === 'available') summary.available += row.count;
      if (row.current_status === 'reserved') summary.reserved += row.count;
      if (row.current_status === 'occupied') summary.occupied += row.count;
      summary.total += row.count;
    });

    res.json({
      success: true,
      data: {
        summary,
        by_homestay: results
      }
    });
  } catch (error) {
    console.error('Fetch summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
});

// ============================================================================
// PROTECTED ROUTES - Require Authentication
// These routes are kept for backward compatibility with the old system
// ============================================================================

/**
 * Create or update room availability (DEPRECATED - kept for backward compatibility)
 * Note: With the view-based system, availability is automatically calculated from bookings
 */
router.post('/', authMiddleware, [
  body('inventory_id').isInt().withMessage('Room inventory ID is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('available_units').isInt({ min: 0 }).withMessage('Available units must be a non-negative integer'),
  body('total_units').isInt({ min: 0 }).withMessage('Total units must be a non-negative integer'),
  body('min_stay').optional().isInt({ min: 1 }).withMessage('Minimum stay must be at least 1'),
  body('max_stay').optional().isInt({ min: 1 }).withMessage('Maximum stay must be at least 1')
], handleValidationErrors, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'This endpoint is deprecated. Availability is now automatically calculated from bookings via room_availability_view.',
      note: 'To manage availability, create or modify bookings instead.'
    });
  } catch (error) {
    console.error('Create/update room availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room availability',
      error: error.message
    });
  }
});

/**
 * Bulk update availability (DEPRECATED)
 */
router.post('/bulk', authMiddleware, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint is deprecated. Availability is now automatically calculated from bookings.',
    note: 'To manage availability, create or modify bookings instead.'
  });
});

/**
 * Toggle room closed status (DEPRECATED)
 */
router.patch('/toggle-closed', authMiddleware, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint is deprecated. To close a room, update its status in room_inventory table.',
    note: 'Use PUT /api/rooms/:id endpoint to update room status.'
  });
});

/**
 * Delete availability record (DEPRECATED)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This endpoint is deprecated. Availability is now automatically calculated from bookings.',
    note: 'To remove availability, delete the corresponding booking instead.'
  });
});

module.exports = router;