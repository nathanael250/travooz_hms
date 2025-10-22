-- ============================================
-- Stay View Test Data
-- ============================================
-- This script creates comprehensive test data for the Stay View feature
-- including homestays, room types, room inventory, bookings, and room bookings
-- with various statuses and date ranges for testing the timeline view.
-- ============================================

-- First, let's ensure we have a test vendor user
-- Assuming vendor_id = 2 exists (from the existing data)

-- ============================================
-- 1. CREATE ROOM TYPES FOR HOMESTAY
-- ============================================
-- For homestay_id = 1 (Urugero Hotel)

INSERT INTO `room_types` 
(`room_type_id`, `homestay_id`, `name`, `description`, `price`, `max_people`, `discount`, `size_sqm`, `wifi`, `tv`, `air_conditioner`, `minibar`, `created_at`) 
VALUES
(1, 1, 'Standard Room', 'Comfortable room with essential amenities', 50000.00, 2, 0.00, 25, 1, 1, 1, 0, NOW()),
(2, 1, 'Deluxe Room', 'Spacious room with premium amenities and city view', 75000.00, 2, 0.00, 35, 1, 1, 1, 1, NOW()),
(3, 1, 'Family Suite', 'Large suite perfect for families with separate living area', 120000.00, 4, 0.00, 50, 1, 1, 1, 1, NOW()),
(4, 1, 'Executive Suite', 'Luxury suite with ocean view and premium facilities', 150000.00, 2, 0.00, 60, 1, 1, 1, 1, NOW()),
(5, 1, 'Presidential Suite', 'Top-tier luxury suite with panoramic views', 250000.00, 4, 0.00, 100, 1, 1, 1, 1, NOW());

-- ============================================
-- 2. CREATE ROOM INVENTORY (Physical Rooms)
-- ============================================

INSERT INTO `room_inventory` 
(`inventory_id`, `room_type_id`, `unit_number`, `floor`, `status`, `created_at`) 
VALUES
-- Standard Rooms (Floor 1)
(1, 1, '101', '1', 'available', NOW()),
(2, 1, '102', '1', 'available', NOW()),
(3, 1, '103', '1', 'available', NOW()),
(4, 1, '104', '1', 'available', NOW()),

-- Deluxe Rooms (Floor 2)
(5, 2, '201', '2', 'available', NOW()),
(6, 2, '202', '2', 'available', NOW()),
(7, 2, '203', '2', 'available', NOW()),

-- Family Suites (Floor 3)
(8, 3, '301', '3', 'available', NOW()),
(9, 3, '302', '3', 'available', NOW()),

-- Executive Suites (Floor 4)
(10, 4, '401', '4', 'available', NOW()),
(11, 4, '402', '4', 'available', NOW()),

-- Presidential Suite (Floor 5)
(12, 5, '501', '5', 'available', NOW());

-- ============================================
-- 3. CREATE BOOKINGS (Main booking records)
-- ============================================
-- Creating bookings with various statuses and dates
-- Dates are relative to today for better testing

INSERT INTO `bookings` 
(`booking_id`, `service_type`, `user_id`, `total_amount`, `status`, `payment_status`, `booking_reference`, `booking_source`, `special_requests`, `created_at`, `updated_at`) 
VALUES
-- CONFIRMED BOOKINGS (Current and upcoming)
(100, 'room', 4, 150000.00, 'confirmed', 'paid', 'TRV-000100', 'website', 'Late check-in expected', NOW() - INTERVAL 5 DAY, NOW()),
(101, 'room', 4, 225000.00, 'confirmed', 'paid', 'TRV-000101', 'mobile_app', 'Need extra pillows', NOW() - INTERVAL 4 DAY, NOW()),
(102, 'room', 4, 300000.00, 'confirmed', 'paid', 'TRV-000102', 'phone', 'Honeymoon package requested', NOW() - INTERVAL 3 DAY, NOW()),
(103, 'room', 4, 100000.00, 'confirmed', 'paid', 'TRV-000103', 'website', NULL, NOW() - INTERVAL 2 DAY, NOW()),
(104, 'room', 4, 150000.00, 'confirmed', 'paid', 'TRV-000104', 'walk_in', 'Ground floor preferred', NOW() - INTERVAL 1 DAY, NOW()),

-- PENDING BOOKINGS (Awaiting confirmation)
(105, 'room', 4, 200000.00, 'pending', 'pending', 'TRV-000105', 'website', 'Vegetarian breakfast', NOW(), NOW()),
(106, 'room', 4, 75000.00, 'pending', 'pending', 'TRV-000106', 'mobile_app', NULL, NOW(), NOW()),

-- COMPLETED BOOKINGS (Past stays)
(107, 'room', 4, 300000.00, 'completed', 'paid', 'TRV-000107', 'website', NULL, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 10 DAY),
(108, 'room', 4, 150000.00, 'completed', 'paid', 'TRV-000108', 'phone', 'Business trip', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 15 DAY),

-- CANCELLED BOOKINGS
(109, 'room', 4, 250000.00, 'cancelled', 'refunded', 'TRV-000109', 'website', NULL, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 6 DAY),
(110, 'room', 4, 100000.00, 'cancelled', 'refunded', 'TRV-000110', 'mobile_app', 'Change of plans', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY),

-- MORE CONFIRMED BOOKINGS (For timeline variety)
(111, 'room', 4, 360000.00, 'confirmed', 'paid', 'TRV-000111', 'website', 'Anniversary celebration', NOW() - INTERVAL 1 DAY, NOW()),
(112, 'room', 4, 500000.00, 'confirmed', 'paid', 'TRV-000112', 'agent', 'VIP guest - special attention', NOW() - INTERVAL 2 DAY, NOW()),
(113, 'room', 4, 150000.00, 'confirmed', 'paid', 'TRV-000113', 'website', NULL, NOW(), NOW()),
(114, 'room', 4, 225000.00, 'confirmed', 'paid', 'TRV-000114', 'mobile_app', 'Early check-in requested', NOW(), NOW()),
(115, 'room', 4, 100000.00, 'confirmed', 'paid', 'TRV-000115', 'website', NULL, NOW(), NOW());

-- ============================================
-- 4. CREATE ROOM BOOKINGS (Detailed room booking info)
-- ============================================
-- Linking bookings to specific rooms with dates

INSERT INTO `room_bookings` 
(`booking_id`, `inventory_id`, `check_in_date`, `check_out_date`, `guests`, `nights`, `room_price_per_night`, `total_room_amount`, `homestay_id`, `guest_name`, `guest_email`, `guest_phone`, `number_of_adults`, `number_of_children`, `special_requests`, `created_at`) 
VALUES
-- CONFIRMED BOOKINGS - Current and Upcoming

-- Room 101: 3-night stay starting yesterday
(100, 1, CURDATE() - INTERVAL 1 DAY, CURDATE() + INTERVAL 2 DAY, 2, 3, 50000.00, 150000.00, 1, 
 'John Smith', 'john.smith@email.com', '+250788123456', 2, 0, 'Late check-in expected', NOW()),

-- Room 201: 3-night stay starting today
(101, 5, CURDATE(), CURDATE() + INTERVAL 3 DAY, 2, 3, 75000.00, 225000.00, 1, 
 'Sarah Johnson', 'sarah.j@email.com', '+250788234567', 2, 0, 'Need extra pillows', NOW()),

-- Room 402: 2-night stay (honeymoon) starting tomorrow
(102, 11, CURDATE() + INTERVAL 1 DAY, CURDATE() + INTERVAL 3 DAY, 2, 2, 150000.00, 300000.00, 1, 
 'Michael & Emma Brown', 'mbrown@email.com', '+250788345678', 2, 0, 'Honeymoon package requested', NOW()),

-- Room 102: 2-night stay starting in 2 days
(103, 2, CURDATE() + INTERVAL 2 DAY, CURDATE() + INTERVAL 4 DAY, 1, 2, 50000.00, 100000.00, 1, 
 'David Wilson', 'dwilson@email.com', '+250788456789', 1, 0, NULL, NOW()),

-- Room 301: 1-night stay starting in 3 days
(104, 8, CURDATE() + INTERVAL 3 DAY, CURDATE() + INTERVAL 4 DAY, 4, 1, 120000.00, 120000.00, 1, 
 'Anderson Family', 'anderson.fam@email.com', '+250788567890', 2, 2, 'Ground floor preferred', NOW()),

-- PENDING BOOKINGS

-- Room 202: 2-night pending booking starting in 5 days
(105, 6, CURDATE() + INTERVAL 5 DAY, CURDATE() + INTERVAL 7 DAY, 2, 2, 75000.00, 150000.00, 1, 
 'Lisa Martinez', 'lisa.m@email.com', '+250788678901', 2, 0, 'Vegetarian breakfast', NOW()),

-- Room 103: 1-night pending booking starting in 6 days
(106, 3, CURDATE() + INTERVAL 6 DAY, CURDATE() + INTERVAL 7 DAY, 2, 1, 50000.00, 50000.00, 1, 
 'Robert Taylor', 'rtaylor@email.com', '+250788789012', 2, 0, NULL, NOW()),

-- COMPLETED BOOKINGS (Past)

-- Room 401: Completed 5 days ago (3-night stay)
(107, 10, CURDATE() - INTERVAL 8 DAY, CURDATE() - INTERVAL 5 DAY, 2, 3, 150000.00, 450000.00, 1, 
 'James Anderson', 'james.a@email.com', '+250788890123', 2, 0, NULL, NOW()),

-- Room 201: Completed 10 days ago (2-night stay)
(108, 5, CURDATE() - INTERVAL 12 DAY, CURDATE() - INTERVAL 10 DAY, 1, 2, 75000.00, 150000.00, 1, 
 'Patricia Moore', 'patricia.m@email.com', '+250788901234', 1, 0, 'Business trip', NOW()),

-- CANCELLED BOOKINGS

-- Room 501: Cancelled booking (was supposed to start 3 days ago)
(109, 12, CURDATE() - INTERVAL 3 DAY, CURDATE() - INTERVAL 1 DAY, 2, 2, 250000.00, 500000.00, 1, 
 'William Garcia', 'wgarcia@email.com', '+250789012345', 2, 0, NULL, NOW()),

-- Room 104: Cancelled booking (was supposed to start tomorrow)
(110, 4, CURDATE() + INTERVAL 1 DAY, CURDATE() + INTERVAL 3 DAY, 2, 2, 50000.00, 100000.00, 1, 
 'Jennifer Lee', 'jlee@email.com', '+250789123456', 2, 0, 'Change of plans', NOW()),

-- MORE CONFIRMED BOOKINGS for better timeline visualization

-- Room 302: 3-night stay starting in 4 days
(111, 9, CURDATE() + INTERVAL 4 DAY, CURDATE() + INTERVAL 7 DAY, 4, 3, 120000.00, 360000.00, 1, 
 'Thompson Family', 'thompson@email.com', '+250789234567', 2, 2, 'Anniversary celebration', NOW()),

-- Room 501: 2-night VIP stay starting in 7 days
(112, 12, CURDATE() + INTERVAL 7 DAY, CURDATE() + INTERVAL 9 DAY, 2, 2, 250000.00, 500000.00, 1, 
 'Dr. Richard White', 'dr.white@email.com', '+250789345678', 2, 0, 'VIP guest - special attention', NOW()),

-- Room 203: 1-night stay starting in 8 days
(113, 7, CURDATE() + INTERVAL 8 DAY, CURDATE() + INTERVAL 9 DAY, 2, 1, 75000.00, 75000.00, 1, 
 'Maria Rodriguez', 'maria.r@email.com', '+250789456789', 2, 0, NULL, NOW()),

-- Room 101: 3-night stay starting in 10 days (after current booking ends)
(114, 1, CURDATE() + INTERVAL 10 DAY, CURDATE() + INTERVAL 13 DAY, 2, 3, 75000.00, 225000.00, 1, 
 'Christopher Martin', 'chris.m@email.com', '+250789567890', 2, 0, 'Early check-in requested', NOW()),

-- Room 102: 2-night stay starting in 12 days
(115, 2, CURDATE() + INTERVAL 12 DAY, CURDATE() + INTERVAL 14 DAY, 1, 2, 50000.00, 100000.00, 1, 
 'Amanda Clark', 'amanda.c@email.com', '+250789678901', 1, 0, NULL, NOW());

-- ============================================
-- SUMMARY OF TEST DATA
-- ============================================
-- Homestay: Urugero Hotel (homestay_id = 1)
-- 
-- Room Types: 5 types (Standard, Deluxe, Family Suite, Executive Suite, Presidential Suite)
-- Room Inventory: 12 physical rooms across 5 floors
-- 
-- Bookings Created: 16 bookings
--   - Confirmed: 10 bookings (various dates from past to future)
--   - Pending: 2 bookings (awaiting confirmation)
--   - Completed: 2 bookings (past stays)
--   - Cancelled: 2 bookings (refunded)
-- 
-- Date Range: Covers approximately 25 days (from 12 days ago to 14 days in the future)
-- 
-- This data provides:
--   ✓ Multiple booking statuses for color-coded visualization
--   ✓ Overlapping bookings on different rooms
--   ✓ Sequential bookings on the same room
--   ✓ Various guest types (individuals, couples, families)
--   ✓ Different booking sources (website, mobile app, phone, walk-in, agent)
--   ✓ Special requests for testing detail views
--   ✓ Realistic guest information
-- ============================================

-- To verify the data, run these queries:
-- SELECT * FROM room_types WHERE homestay_id = 1;
-- SELECT * FROM room_inventory WHERE room_type_id IN (SELECT room_type_id FROM room_types WHERE homestay_id = 1);
-- SELECT * FROM bookings WHERE booking_id >= 100 AND booking_id <= 115;
-- SELECT * FROM room_bookings WHERE booking_id >= 100 AND booking_id <= 115;