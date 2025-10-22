-- Migration: Update external_bookings table to support OTA integration
-- This updates the table structure to match the ExternalBooking model

-- Drop the old table if it exists (backup data first if needed!)
DROP TABLE IF EXISTS `external_bookings`;

-- Create the updated external_bookings table
CREATE TABLE `external_bookings` (
  `external_booking_record_id` int NOT NULL AUTO_INCREMENT,
  `platform` enum('booking.com','airbnb','expedia','agoda','hotels.com','trivago','priceline','kayak','other') NOT NULL,
  `external_booking_id` varchar(100) NOT NULL,
  `external_data` json DEFAULT NULL COMMENT 'Raw booking data from OTA platform',
  `external_guest_name` varchar(100) NOT NULL,
  `external_status` enum('confirmed','pending','cancelled','completed') DEFAULT 'confirmed',
  `internal_booking_id` int DEFAULT NULL,
  `sync_status` enum('pending','synced','failed') DEFAULT 'pending',
  `synced_at` datetime DEFAULT NULL,
  `synced_by` int DEFAULT NULL,
  `commission_percentage` decimal(5,2) DEFAULT 0.00 COMMENT 'OTA commission percentage',
  `commission_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'OTA commission amount',
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`external_booking_record_id`),
  UNIQUE KEY `unique_external_booking` (`platform`, `external_booking_id`),
  KEY `idx_platform` (`platform`),
  KEY `idx_sync_status` (`sync_status`),
  KEY `idx_external_status` (`external_status`),
  KEY `fk_internal_booking` (`internal_booking_id`),
  KEY `fk_synced_by` (`synced_by`),
  KEY `fk_created_by` (`created_by`),
  CONSTRAINT `fk_external_booking_internal` FOREIGN KEY (`internal_booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_external_booking_synced_by` FOREIGN KEY (`synced_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_external_booking_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better query performance
CREATE INDEX `idx_created_at` ON `external_bookings` (`created_at`);
CREATE INDEX `idx_synced_at` ON `external_bookings` (`synced_at`);