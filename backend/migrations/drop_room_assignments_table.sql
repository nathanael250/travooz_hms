-- Migration: Drop room_assignments table
-- Reason: System now uses room_inventory_id directly in room_bookings for room assignments
-- This table is no longer needed with the new architecture

-- Drop foreign keys that reference room_assignments
ALTER TABLE `check_in_logs` DROP FOREIGN KEY IF EXISTS `fk_check_in_logs_assignment_id`;

-- Drop the table
DROP TABLE IF EXISTS `room_assignments`;

-- Note: All check-in/check-out data is now stored directly in check_in_logs and audit_logs tables
-- Room assignment tracking is handled via room_bookings.inventory_id