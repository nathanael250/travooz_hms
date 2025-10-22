-- Migration: Create Check-In Audit and Logs Table
-- Purpose: Track all guest check-ins for audit, reporting, and hotel manager visibility

-- Create check_in_logs table
CREATE TABLE IF NOT EXISTS `check_in_logs` (
  `check_in_log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `assignment_id` INT NOT NULL,
  `staff_id` INT,
  `guest_name` VARCHAR(255) NOT NULL,
  `room_number` VARCHAR(50),
  `check_in_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `key_card_number` VARCHAR(100),
  `notes` TEXT,
  `homestay_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_booking_id (booking_id),
  INDEX idx_staff_id (staff_id),
  INDEX idx_check_in_time (check_in_time),
  INDEX idx_homestay_id (homestay_id),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure bookings table has proper status columns
-- Update booking status values to include 'completed' when checked in
ALTER TABLE `bookings` MODIFY COLUMN `status` ENUM(
  'pending',
  'confirmed',
  'completed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show',
  'pre_registered'
) DEFAULT 'pending';

-- Add check_in tracking columns to room_assignments (if not exists)
ALTER TABLE `room_assignments` 
ADD COLUMN `check_in_time` TIMESTAMP NULL;

ALTER TABLE `room_assignments` 
ADD COLUMN `check_out_time` TIMESTAMP NULL;

ALTER TABLE `room_assignments` 
ADD COLUMN `key_card_issued` VARCHAR(100);

ALTER TABLE `room_assignments` 
ADD COLUMN `notes` TEXT;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_check_in_logs_date ON `check_in_logs`(check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_check_in_logs_hotel ON `check_in_logs`(homestay_id, check_in_time DESC);