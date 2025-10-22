-- Create user_favorites table for Guest Management

CREATE TABLE IF NOT EXISTS `user_favorites` (
  `favorite_id` int NOT NULL AUTO_INCREMENT,
  `guest_id` int NOT NULL,
  `favorite_type` enum('homestay','room','menu_item','service','activity') NOT NULL,
  `reference_id` int NOT NULL COMMENT 'ID of the favorited item (homestay_id, inventory_id, etc.)',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favorite_id`),
  KEY `guest_id` (`guest_id`),
  KEY `favorite_type` (`favorite_type`),
  KEY `reference_id` (`reference_id`),
  UNIQUE KEY `unique_favorite` (`guest_id`, `favorite_type`, `reference_id`),
  CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
