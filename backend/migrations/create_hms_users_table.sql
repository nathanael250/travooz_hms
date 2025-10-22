-- Create HMS Users Table for Hotel Staff Management
CREATE TABLE IF NOT EXISTS `hms_users` (
  `hms_user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password_hash` text NOT NULL,
  `role` enum('manager','receptionist','housekeeping','accountant','restaurant','maintenance') NOT NULL,
  `assigned_hotel_id` int NOT NULL,
  `phone` varchar(20),
  `status` enum('active','inactive') DEFAULT 'active',
  `hire_date` date,
  `employment_type` enum('full_time','part_time','contract','temporary') DEFAULT 'full_time',
  `salary` decimal(10,2),
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`hms_user_id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `fk_assigned_hotel_id` (`assigned_hotel_id`),
  CONSTRAINT `fk_assigned_hotel_id` FOREIGN KEY (`assigned_hotel_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_status ON hms_users(status);
CREATE INDEX idx_role ON hms_users(role);
CREATE INDEX idx_hotel_role ON hms_users(assigned_hotel_id, role);