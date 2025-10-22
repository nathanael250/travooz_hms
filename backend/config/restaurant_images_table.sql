-- Create hotel_restaurant_images table
CREATE TABLE IF NOT EXISTS `hotel_restaurant_images` (
  `image_id` int(11) NOT NULL AUTO_INCREMENT,
  `restaurant_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `image_type` enum('main','gallery') DEFAULT 'gallery',
  `image_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_restaurant_id` (`restaurant_id`),
  KEY `idx_image_order` (`image_order`),
  CONSTRAINT `fk_restaurant_images_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `hotel_restaurants` (`restaurant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;