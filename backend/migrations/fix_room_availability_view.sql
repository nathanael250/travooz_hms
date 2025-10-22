-- ============================================
-- Fix Room Availability View
-- ============================================
-- This migration replaces the flawed room_availability_view with a proper implementation
-- that can be used for date-range availability checking.
--
-- PROBLEM WITH OLD VIEW:
-- - Used LEFT JOIN which only shows ONE booking per room
-- - Caused false positives (showing rooms as available when they're booked)
-- - Inconsistent with booking creation logic
--
-- SOLUTION:
-- - Drop the old flawed view
-- - Create helper function for date-range availability checking
-- - Create new view for CURRENT STATUS ONLY (today's availability)
-- ============================================

-- Drop old view if it exists
DROP VIEW IF EXISTS room_availability_view;

-- ============================================
-- 1. Create function to check room availability for date range
-- ============================================
-- This function checks if a specific room is available for a given date range
-- Returns 1 if available, 0 if booked

DELIMITER $$

DROP FUNCTION IF EXISTS is_room_available$$

CREATE FUNCTION is_room_available(
    p_inventory_id INT,
    p_check_in_date DATE,
    p_check_out_date DATE
)
RETURNS TINYINT(1)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE booking_count INT;
    
    -- Count overlapping bookings for this room
    -- Uses the standard date overlap formula: (start1 < end2) AND (end1 > start2)
    SELECT COUNT(*) INTO booking_count
    FROM room_bookings rb
    JOIN bookings b ON rb.booking_id = b.booking_id
    WHERE rb.inventory_id = p_inventory_id
        AND b.status IN ('confirmed', 'pending', 'checked_in')
        AND rb.check_in_date < p_check_out_date
        AND rb.check_out_date > p_check_in_date;
    
    -- Return 1 if available (no overlapping bookings), 0 if booked
    RETURN IF(booking_count = 0, 1, 0);
END$$

DELIMITER ;

-- ============================================
-- 2. Create view for CURRENT room status (TODAY only)
-- ============================================
-- This view shows the current status of each room as of TODAY
-- It's safe to use LEFT JOIN here because we only care about TODAY's status
-- DO NOT use this view for date-range availability checking!

CREATE OR REPLACE VIEW room_current_status_view AS
SELECT 
    ri.inventory_id,
    ri.room_type_id,
    rt.name as room_type,
    rt.description as room_type_description,
    ri.unit_number,
    ri.floor,
    ri.status as room_status,
    ri.homestay_id,
    h.name as homestay_name,
    rt.base_price,
    rt.max_people,
    rt.bed_type,
    -- Current status based on TODAY's date
    CASE 
        WHEN ri.status = 'maintenance' THEN 'maintenance'
        WHEN ri.status = 'out_of_service' THEN 'out_of_service'
        WHEN rb.booking_id IS NULL THEN 'available'
        WHEN rb.check_in_date <= CURDATE() AND rb.check_out_date > CURDATE() THEN 'occupied'
        WHEN rb.check_in_date > CURDATE() THEN 'reserved'
        ELSE 'available'
    END as current_status,
    rb.booking_id as current_booking_id,
    rb.check_in_date as current_booking_checkin,
    rb.check_out_date as current_booking_checkout,
    b.booking_reference,
    CONCAT(gp.first_name, ' ', gp.last_name) as current_guest_name
FROM room_inventory ri
LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
LEFT JOIN homestays h ON ri.homestay_id = h.homestay_id
-- Only join with bookings that are active TODAY
LEFT JOIN room_bookings rb ON ri.inventory_id = rb.inventory_id
    AND rb.check_in_date <= CURDATE() 
    AND rb.check_out_date > CURDATE()
LEFT JOIN bookings b ON rb.booking_id = b.booking_id
    AND b.status IN ('confirmed', 'checked_in')
LEFT JOIN booking_guests bg ON b.booking_id = bg.booking_id AND bg.is_primary = 1
LEFT JOIN guest_profiles gp ON bg.guest_id = gp.guest_id
WHERE ri.status IN ('available', 'occupied', 'maintenance', 'out_of_service')
ORDER BY ri.homestay_id, ri.floor, ri.unit_number;

-- ============================================
-- 3. Create view for room type availability summary
-- ============================================
-- This view shows how many rooms of each type are currently available TODAY
-- Useful for dashboard and quick availability checks

CREATE OR REPLACE VIEW room_type_availability_summary AS
SELECT 
    rt.room_type_id,
    rt.name as room_type,
    rt.homestay_id,
    h.name as homestay_name,
    rt.base_price,
    rt.max_people,
    COUNT(ri.inventory_id) as total_rooms,
    SUM(CASE WHEN rcs.current_status = 'available' THEN 1 ELSE 0 END) as available_rooms,
    SUM(CASE WHEN rcs.current_status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
    SUM(CASE WHEN rcs.current_status = 'reserved' THEN 1 ELSE 0 END) as reserved_rooms,
    SUM(CASE WHEN rcs.current_status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_rooms,
    SUM(CASE WHEN rcs.current_status = 'out_of_service' THEN 1 ELSE 0 END) as out_of_service_rooms
FROM room_types rt
LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
LEFT JOIN room_inventory ri ON rt.room_type_id = ri.room_type_id
LEFT JOIN room_current_status_view rcs ON ri.inventory_id = rcs.inventory_id
WHERE rt.is_active = 1
GROUP BY rt.room_type_id, rt.name, rt.homestay_id, h.name, rt.base_price, rt.max_people
ORDER BY rt.homestay_id, rt.name;

-- ============================================
-- 4. Create indexes for optimal performance
-- ============================================

-- Index for room bookings date range queries
CREATE INDEX IF NOT EXISTS idx_room_bookings_inventory_dates 
ON room_bookings(inventory_id, check_in_date, check_out_date);

-- Index for room bookings status queries
CREATE INDEX IF NOT EXISTS idx_room_bookings_booking_id 
ON room_bookings(booking_id);

-- Index for bookings status
CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON bookings(status);

-- Index for room inventory lookups
CREATE INDEX IF NOT EXISTS idx_room_inventory_type_status 
ON room_inventory(room_type_id, status, homestay_id);

-- ============================================
-- USAGE GUIDELINES
-- ============================================

/*
1. FOR CURRENT STATUS (TODAY ONLY):
   - Use: room_current_status_view
   - Use: room_type_availability_summary
   - These views are safe and accurate for showing today's room status

2. FOR DATE RANGE AVAILABILITY CHECKING:
   - DO NOT use views with LEFT JOIN
   - Use direct queries with NOT EXISTS subquery (see example below)
   - Or use the is_room_available() function

3. EXAMPLE: Check availability for date range
   
   -- Get available rooms for a specific date range
   SELECT 
       ri.inventory_id,
       ri.unit_number,
       rt.name as room_type,
       rt.base_price
   FROM room_inventory ri
   JOIN room_types rt ON ri.room_type_id = rt.room_type_id
   WHERE ri.room_type_id = 8
       AND ri.status = 'available'
       AND NOT EXISTS (
           SELECT 1 
           FROM room_bookings rb
           JOIN bookings b ON rb.booking_id = b.booking_id
           WHERE rb.inventory_id = ri.inventory_id
               AND b.status IN ('confirmed', 'pending', 'checked_in')
               AND rb.check_in_date < '2025-12-02'  -- end_date
               AND rb.check_out_date > '2025-12-01' -- start_date
       );

   -- Or use the function
   SELECT 
       ri.inventory_id,
       ri.unit_number,
       is_room_available(ri.inventory_id, '2025-12-01', '2025-12-02') as is_available
   FROM room_inventory ri
   WHERE ri.room_type_id = 8;

4. IMPORTANT: Date Overlap Logic
   - Two date ranges overlap if: (start1 < end2) AND (end1 > start2)
   - Same-day turnover is allowed: checkout date = checkin date is NOT an overlap
   - Always use this formula consistently across all availability checks
*/

-- ============================================
-- Verification Queries
-- ============================================

-- Test 1: Check current status view
-- SELECT * FROM room_current_status_view LIMIT 10;

-- Test 2: Check room type summary
-- SELECT * FROM room_type_availability_summary;

-- Test 3: Test the availability function
-- SELECT is_room_available(6, '2025-12-01', '2025-12-02') as is_available;

-- Test 4: Find all bookings for a specific room
-- SELECT rb.*, b.status, b.booking_reference
-- FROM room_bookings rb
-- JOIN bookings b ON rb.booking_id = b.booking_id
-- WHERE rb.inventory_id = 6
-- ORDER BY rb.check_in_date;