-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 11, 2025 at 04:27 AM
-- Server version: 8.0.43-0ubuntu0.22.04.2
-- PHP Version: 8.1.2-1ubuntu2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `travooz_hms`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `log_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`log_id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 3, 'CREATE', 'categories', 4, NULL, '{\"name\": \"Accommodation\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": 4, \"description\": \"Hotels, homestays, and other lodging options\"}', 'system', 'system', '2025-09-11 14:18:22'),
(2, 3, 'CREATE', 'categories', 5, NULL, '{\"name\": \"Activities\", \"image\": \"uploads/categories/category-1757600501418-32830598.png\", \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": 5, \"description\": \"Experiences and things to do, such as sightseeing tours, adventure sports, cultural experiences.\"}', 'system', 'system', '2025-09-11 14:21:41'),
(3, 3, 'CREATE', 'categories', 1, NULL, '{\"name\": \"Activities\", \"image\": \"uploads/categories/category-1757600537538-535727366.png\", \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": 1, \"description\": \"Experiences and things to do, such as sightseeing tours, adventure sports, cultural experiences.\"}', 'system', 'system', '2025-09-11 14:22:17'),
(4, 3, 'CREATE', 'categories', 2, NULL, '{\"name\": \"Eating Out\", \"image\": \"uploads/categories/category-1757606496956-845082444.png\", \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": 2, \"description\": \"Discover restaurants, cafés, street food spots, fine dining, local specialties, and international cuisine. Includes recommendations for breakfast, lunch, dinner, and snacks to experience the culinary culture of each destination.\"}', 'system', 'system', '2025-09-11 16:01:36'),
(5, 3, 'CREATE', 'categories', 3, NULL, '{\"name\": \"Nightlife and entertainment\", \"image\": \"uploads/categories/category-1757606568230-651312586.png\", \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": 3, \"description\": \"Enjoy the vibrant nightlife with bars, nightclubs, live music venues, theaters, cinemas, cultural shows, and local entertainment events. Perfect for travelers who want to unwind, socialize, and experience evening culture.\"}', 'system', 'system', '2025-09-11 16:02:48'),
(6, 3, 'CREATE', 'categories', 4, NULL, '{\"name\": \"Rest & Stay\", \"image\": \"uploads/categories/category-1757606624199-28665480.png\", \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": 4, \"description\": \"Find accommodation options ranging from budget hostels and guesthouses to luxury hotels and resorts. Includes amenities, locations, ratings, and traveler reviews to help plan a comfortable and enjoyable stay.\"}', 'system', 'system', '2025-09-11 16:03:44'),
(7, 3, 'CREATE', 'categories', 5, NULL, '{\"name\": \"Taxi\", \"image\": \"uploads/categories/category-1757606780482-982630295.png\", \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": 5, \"description\": \"Provides detailed information about local taxes, fees, tourist levies, entry fees, and financial guidelines for travelers. Helps visitors plan their budgets accurately and avoid surprises during their trip.\"}', 'system', 'system', '2025-09-11 16:06:20'),
(8, 3, 'CREATE', 'categories', 6, NULL, '{\"name\": \"Tour Packages\", \"image\": \"uploads/categories/category-1757606888891-205088470.png\", \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": 6, \"description\": \"Browse curated tour packages that include guided tours, multi-day itineraries, sightseeing, transportation, accommodation, and optional activities. Ideal for travelers who prefer convenient and organized travel plans.\"}', 'system', 'system', '2025-09-11 16:08:08'),
(9, 3, 'CREATE', 'subcategories', 1, NULL, '{\"name\": \"City Exploration\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"1\", \"description\": null, \"category_name\": null, \"subcategory_id\": 1, \"category_status\": null}', 'system', 'system', '2025-09-11 16:25:33'),
(10, 3, 'CREATE', 'subcategories', 2, NULL, '{\"name\": \"Shopping & Markets\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"1\", \"description\": null, \"category_name\": null, \"subcategory_id\": 2, \"category_status\": null}', 'system', 'system', '2025-09-11 16:26:12'),
(11, 3, 'CREATE', 'subcategories', 3, NULL, '{\"name\": \"Parks\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"1\", \"description\": null, \"category_name\": null, \"subcategory_id\": 3, \"category_status\": null}', 'system', 'system', '2025-09-11 16:26:26'),
(12, 3, 'CREATE', 'subcategories', 4, NULL, '{\"name\": \"Recreational Activities\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"1\", \"description\": null, \"category_name\": null, \"subcategory_id\": 4, \"category_status\": null}', 'system', 'system', '2025-09-11 16:26:44'),
(13, 3, 'CREATE', 'subcategories', 5, NULL, '{\"name\": \"CocalRestaurants\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"2\", \"description\": null, \"category_name\": null, \"subcategory_id\": 5, \"category_status\": null}', 'system', 'system', '2025-09-11 16:27:24'),
(14, 3, 'CREATE', 'subcategories', 6, NULL, '{\"name\": \"Street Food\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"2\", \"description\": null, \"category_name\": null, \"subcategory_id\": 6, \"category_status\": null}', 'system', 'system', '2025-09-11 16:27:33'),
(15, 3, 'CREATE', 'subcategories', 7, NULL, '{\"name\": \"Cafes & Bakeries\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"2\", \"description\": null, \"category_name\": null, \"subcategory_id\": 7, \"category_status\": null}', 'system', 'system', '2025-09-11 16:27:54'),
(16, 3, 'CREATE', 'subcategories', 8, NULL, '{\"name\": \"Bars & Lounges\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"3\", \"description\": null, \"category_name\": null, \"subcategory_id\": 8, \"category_status\": null}', 'system', 'system', '2025-09-11 16:28:25'),
(17, 3, 'CREATE', 'subcategories', 9, NULL, '{\"name\": \"Nightclubs\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"3\", \"description\": null, \"category_name\": null, \"subcategory_id\": 9, \"category_status\": null}', 'system', 'system', '2025-09-11 16:28:42'),
(18, 3, 'CREATE', 'subcategories', 10, NULL, '{\"name\": \"Live Music Venues\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"3\", \"description\": null, \"category_name\": null, \"subcategory_id\": 10, \"category_status\": null}', 'system', 'system', '2025-09-11 16:28:53'),
(19, 3, 'CREATE', 'subcategories', 11, NULL, '{\"name\": \"Hotels\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"4\", \"description\": null, \"category_name\": null, \"subcategory_id\": 11, \"category_status\": null}', 'system', 'system', '2025-09-11 16:29:12'),
(20, 3, 'CREATE', 'subcategories', 12, NULL, '{\"name\": \"Motels\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"4\", \"description\": null, \"category_name\": null, \"subcategory_id\": 12, \"category_status\": null}', 'system', 'system', '2025-09-11 16:29:18'),
(21, 3, 'CREATE', 'subcategories', 13, NULL, '{\"name\": \"Homestays\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"4\", \"description\": null, \"category_name\": null, \"subcategory_id\": 13, \"category_status\": null}', 'system', 'system', '2025-09-11 16:29:24'),
(22, 3, 'CREATE', 'subcategories', 14, NULL, '{\"name\": \"MOto Taxi\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"5\", \"description\": null, \"category_name\": null, \"subcategory_id\": 14, \"category_status\": null}', 'system', 'system', '2025-09-11 16:29:40'),
(23, 3, 'CREATE', 'subcategories', 15, NULL, '{\"name\": \"Self Drive\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"5\", \"description\": null, \"category_name\": null, \"subcategory_id\": 15, \"category_status\": null}', 'system', 'system', '2025-09-11 16:29:51'),
(24, 3, 'CREATE', 'subcategories', 16, NULL, '{\"name\": \"Car Rental\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"5\", \"description\": null, \"category_name\": null, \"subcategory_id\": 16, \"category_status\": null}', 'system', 'system', '2025-09-11 16:30:01'),
(25, 3, 'CREATE', 'subcategories', 17, NULL, '{\"name\": \"Car Taxi\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"5\", \"description\": null, \"category_name\": null, \"subcategory_id\": 17, \"category_status\": null}', 'system', 'system', '2025-09-11 16:30:11'),
(26, 3, 'CREATE', 'subcategories', 18, NULL, '{\"name\": \"Multi Day Trip\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"6\", \"description\": null, \"category_name\": null, \"subcategory_id\": 18, \"category_status\": null}', 'system', 'system', '2025-09-11 16:30:28'),
(27, 3, 'CREATE', 'subcategories', 19, NULL, '{\"name\": \"Day Trip\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"6\", \"description\": null, \"category_name\": null, \"subcategory_id\": 19, \"category_status\": null}', 'system', 'system', '2025-09-11 16:30:35'),
(28, 2, 'CREATE', 'eating_out', 1, NULL, '{\"name\": \"La Bella Vista Restaurant\", \"status\": \"pending\", \"location\": null, \"vendor_id\": 2, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"Authentic Italian cuisine with beautiful city views\", \"vendor_name\": null, \"private_boat\": false, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 1, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": false, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": false}', 'system', 'system', '2025-09-11 17:54:54'),
(29, 2, 'CREATE', 'eating_out', 1, NULL, '{\"name\": \"Bella Vista Restaurant\", \"status\": \"pending\", \"location\": \"123 Main Street, Downtown, New York, USA\", \"vendor_id\": 2, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"Authentic Italian cuisine with beautiful city views\", \"vendor_name\": null, \"private_boat\": false, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 1, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": true}', 'system', 'system', '2025-09-12 06:47:57'),
(30, 2, 'CREATE', 'eating_out', 1, NULL, '{\"name\": \"Bella Vista Restaurant\", \"images\": [{\"image_id\": 1, \"image_path\": \"/uploads/eating_out/eating_out_1757660609890-680244804.jpg\", \"image_type\": \"main\", \"image_order\": 0}, {\"image_id\": 2, \"image_path\": \"/uploads/eating_out/eating_out_1757660609893-803826167.jpg\", \"image_type\": \"gallery\", \"image_order\": 1}, {\"image_id\": 3, \"image_path\": \"/uploads/eating_out/eating_out_1757660609893-803522906.jpg\", \"image_type\": \"gallery\", \"image_order\": 2}], \"status\": \"pending\", \"location\": \"123 Main Street, Downtown, New York, USA\", \"vendor_id\": 2, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"Authentic Italian cuisine with beautiful city views\", \"vendor_name\": null, \"private_boat\": false, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 1, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": true}', 'system', 'system', '2025-09-12 07:03:29'),
(31, 2, 'CREATE', 'menu', 1, NULL, '{\"name\": \"Margherita Pizza\", \"image\": \"uploads/menu/menu-1757662490926-701516435.png\", \"price\": 5000, \"menu_id\": 1, \"available\": true, \"created_at\": null, \"updated_at\": null, \"description\": \"Traditional pizza with fresh mozzarella, tomato sauce, and basil\", \"restaurant_id\": 1, \"restaurant_name\": null}', 'system', 'system', '2025-09-12 07:34:50'),
(32, 2, 'CREATE', 'menu', 2, NULL, '{\"name\": \"PAPILLOTE OF LIBOKE WITH TILAPIA\", \"image\": \"uploads/menu/menu-1757662988137-283452926.png\", \"price\": 12000, \"menu_id\": 2, \"available\": true, \"created_at\": null, \"updated_at\": null, \"description\": \"Neutral test of liboke ya Malangwa Tilapia and local vegetables smothered in banana leaf serve with cassava couscous\", \"restaurant_id\": 1, \"restaurant_name\": null}', 'system', 'system', '2025-09-12 07:43:08'),
(33, 2, 'CREATE', 'restaurant_table', 1, NULL, '{\"seats\": 4, \"status\": \"available\", \"table_id\": 1, \"created_at\": null, \"table_number\": \"T01\", \"restaurant_id\": 1}', 'system', 'system', '2025-09-12 08:03:34'),
(34, 2, 'CREATE', 'restaurant_table', 2, NULL, '{\"seats\": 6, \"status\": \"available\", \"table_id\": 2, \"created_at\": null, \"table_number\": \"T02\", \"restaurant_id\": 1}', 'system', 'system', '2025-09-12 08:04:23'),
(35, 2, 'CREATE', 'restaurant_table', 3, NULL, '{\"seats\": 6, \"status\": \"available\", \"table_id\": 3, \"created_at\": null, \"table_number\": \"T03\", \"restaurant_id\": 1}', 'system', 'system', '2025-09-12 08:04:31'),
(36, 2, 'CREATE', 'restaurant_table', 4, NULL, '{\"seats\": 6, \"status\": \"available\", \"table_id\": 4, \"created_at\": null, \"table_number\": \"T04\", \"restaurant_id\": 1}', 'system', 'system', '2025-09-12 08:04:34'),
(37, 2, 'CREATE', 'restaurant_table', 5, NULL, '{\"seats\": 10, \"status\": \"available\", \"table_id\": 5, \"created_at\": null, \"table_number\": \"T05\", \"restaurant_id\": 1}', 'system', 'system', '2025-09-12 08:04:44'),
(38, 2, 'CREATE', 'tour_package', 1, NULL, '{\"name\": \"Kigali Universe Tour\", \"phone\": \"+250788123456\", \"price\": 50000, \"status\": \"pending\", \"currency\": \"RWF\", \"duration\": \"6 hours\", \"includes\": \"\\\"Professional guide\\\",\\n    \\\"Transport\\\",\\n    \\\"Lunch\\\"\", \"location\": \"Kigali, Rwanda\", \"vendor_id\": 2, \"created_at\": null, \"highlights\": \"\\\"Visit Kigali Genocide Memorial\\\",\\n    \\\"Explore vibrant local markets\\\",\\n    \\\"Enjoy a traditional Rwandan lunch\\\"\", \"max_people\": 12, \"min_people\": 2, \"package_id\": 1, \"updated_at\": null, \"updated_flag\": null, \"what_to_bring\": \"\\\"Comfortable walking shoes\\\",\\n    \\\"Camera\\\",\\n    \\\"Reusable water bottle\\\"\", \"subcategory_id\": 1, \"things_to_know\": \"Wear light, comfortable clothes. Tour operates rain or shine. Bring some cash for souvenirs.\", \"description_full\": \"The Kigali Universe Tour offers an immersive journey through Kigali’s history, art, and culture. Visit major landmarks, enjoy local cuisine, and experience Rwanda’s warm hospitality.\", \"description_short\": \"Professional and experienced tour guide. Explore Kigali’s vibrant culture and landmarks.\", \"free_cancellation\": true, \"instructor_language\": \"English/French\", \"meeting_point_details\": \"Meet at Kigali City Center, near the main roundabout, 15 minutes before departure.\", \"reserve_now_pay_later\": true}', 'system', 'system', '2025-09-12 11:28:46'),
(39, 2, 'CREATE', 'tour_package', 2, NULL, '{\"name\": \"Nyungwe Forest Canopy Adventure\", \"phone\": \"+250788987654\", \"price\": 100000, \"status\": \"pending\", \"currency\": \"RWF\", \"duration\": \"8 hours\", \"includes\": \"\\\"Professional guide\\\",\\n    \\\"Transport from Kigali\\\",\\n    \\\"Park entry fees\\\"\", \"location\": \"Nyungwe National Park, Rwanda\", \"vendor_id\": 2, \"created_at\": null, \"highlights\": \"\\\"Walk across Africa’s highest canopy bridge\\\",\\n    \\\"Spot monkeys and exotic birds\\\",\\n    \\\"Learn about conservation efforts\\\"\", \"max_people\": 10, \"min_people\": 2, \"package_id\": 2, \"updated_at\": null, \"updated_flag\": null, \"what_to_bring\": \"\\\"Hiking boots\\\",\\n    \\\"Rain jacket\\\",\\n    \\\"Binoculars\\\"\", \"subcategory_id\": 1, \"things_to_know\": \"Moderate physical fitness is recommended. The tour operates even in light rain.\", \"description_full\": \"Discover Rwanda’s lush Nyungwe Forest on a breathtaking canopy walk high above the rainforest floor. Enjoy guided hikes, spot rare wildlife, and learn about the park’s incredible biodiversity.\", \"description_short\": \"A thrilling canopy walk and wildlife experience in Nyungwe National Park.\", \"free_cancellation\": true, \"instructor_language\": \"English\", \"meeting_point_details\": \"Pickup at your Kigali hotel at 6:00 AM.\", \"reserve_now_pay_later\": false}', 'system', 'system', '2025-09-12 11:37:08'),
(40, 2, 'CREATE', 'eating_out', 2, NULL, '{\"name\": \"Sample Restaurant\", \"status\": \"active\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"A great place to eat.\", \"vendor_name\": null, \"private_boat\": false, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": true}', 'system', 'system', '2025-09-13 02:54:50'),
(41, 2, 'CREATE', 'menu', 3, NULL, '{\"name\": \"Grilled Chicken\", \"image\": null, \"price\": 12.99, \"menu_id\": 3, \"available\": true, \"created_at\": null, \"updated_at\": null, \"description\": \"Juicy grilled chicken breast.\", \"restaurant_id\": 2, \"restaurant_name\": null}', 'system', 'system', '2025-09-13 02:54:50'),
(42, 2, 'CREATE', 'menu', 4, NULL, '{\"name\": \"Veggie Pizza\", \"image\": null, \"price\": 10.5, \"menu_id\": 4, \"available\": true, \"created_at\": null, \"updated_at\": null, \"description\": \"Pizza with fresh vegetables.\", \"restaurant_id\": 2, \"restaurant_name\": null}', 'system', 'system', '2025-09-13 02:54:50'),
(43, 2, 'CREATE', 'restaurant_table', 6, NULL, '{\"seats\": 4, \"status\": \"available\", \"table_id\": 6, \"created_at\": null, \"table_number\": \"A1\", \"restaurant_id\": 2}', 'system', 'system', '2025-09-13 02:54:50'),
(44, 2, 'CREATE', 'restaurant_table', 7, NULL, '{\"seats\": 2, \"status\": \"available\", \"table_id\": 7, \"created_at\": null, \"table_number\": \"B2\", \"restaurant_id\": 2}', 'system', 'system', '2025-09-13 02:54:50'),
(45, 2, 'CREATE', 'menu', 5, NULL, '{\"name\": \"Tesing Menu\", \"image\": \"uploads/menu/menu-1757801739891-138447811.png\", \"price\": 12000, \"menu_id\": 5, \"available\": true, \"created_at\": null, \"updated_at\": null, \"description\": \"Neutral test of liboke ya Malangwa Tilapia and local vegetables smothered in banana leaf serve with cassava couscous\", \"restaurant_id\": 1, \"restaurant_name\": null}', 'system', 'system', '2025-09-13 22:15:39'),
(46, 2, 'CREATE', 'eating_out', 3, NULL, '{\"name\": \"Umubano Restourant\", \"images\": [{\"image_id\": 4, \"image_path\": \"/uploads/eating_out/eating_out_1757916547003-594007609.png\", \"image_type\": \"main\", \"image_order\": 0}, {\"image_id\": 5, \"image_path\": \"/uploads/eating_out/eating_out_1757916547003-526198204.png\", \"image_type\": \"gallery\", \"image_order\": 1}, {\"image_id\": 6, \"image_path\": \"/uploads/eating_out/eating_out_1757916547005-421008999.png\", \"image_type\": \"gallery\", \"image_order\": 2}], \"status\": \"pending\", \"location\": \"Kigali\", \"vendor_id\": 2, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"Umuganura brings you the authentic flavors of Rwanda\'s harvest celebration. Our restaurant offers a modern twist on traditional Rwandan cuisine, featuring fresh, locally-sourced ingredients and family recipes passed down through generations.\", \"vendor_name\": null, \"private_boat\": true, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 3, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 5, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": true}', 'system', 'system', '2025-09-15 06:09:07'),
(47, 6, 'CREATE', 'eating_out', 4, NULL, '{\"name\": \"Restourant kimaranzara\", \"images\": [{\"image_id\": 7, \"image_path\": \"/uploads/eating_out/eating_out_1757917855956-300475726.png\", \"image_type\": \"main\", \"image_order\": 0}, {\"image_id\": 8, \"image_path\": \"/uploads/eating_out/eating_out_1757917855960-165384152.png\", \"image_type\": \"gallery\", \"image_order\": 1}], \"status\": \"pending\", \"location\": \"KIgali\", \"vendor_id\": 6, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"safddddddddddddddddddddddddddddddddddddddddddddddddddfasdcsadfadsfsdfsadf\", \"vendor_name\": null, \"private_boat\": true, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 4, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 7, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": true}', 'system', 'system', '2025-09-15 06:30:55'),
(48, 6, 'CREATE', 'eating_out', 5, NULL, '{\"name\": \"Garuka Restaurant\", \"images\": [{\"image_id\": 9, \"image_path\": \"/uploads/eating_out/eating_out_1757923147163-863708463.png\", \"image_type\": \"main\", \"image_order\": 0}, {\"image_id\": 10, \"image_path\": \"/uploads/eating_out/eating_out_1757923147166-317141802.png\", \"image_type\": \"gallery\", \"image_order\": 1}, {\"image_id\": 11, \"image_path\": \"/uploads/eating_out/eating_out_1757923147167-229064430.png\", \"image_type\": \"gallery\", \"image_order\": 2}], \"status\": \"pending\", \"location\": \"Kigali\", \"vendor_id\": 6, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"Garuka Restaurant is a welcoming place where fresh ingredients, flavorful dishes, and genuine hospitality come together. Whether for a casual meal or a special occasion, we make every visit memorable with care, quality, and community.\", \"vendor_name\": null, \"private_boat\": true, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 5, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 7, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": true}', 'system', 'system', '2025-09-15 07:59:07'),
(49, 6, 'CREATE', 'menu', 6, NULL, '{\"name\": \"Ibishyimbo\", \"image\": \"uploads/menu/menu-1757924981347-148180078.png\", \"price\": 5000, \"menu_id\": 6, \"available\": true, \"created_at\": null, \"updated_at\": null, \"description\": \"This is ibishyimbo\", \"restaurant_id\": 5, \"restaurant_name\": null}', 'system', 'system', '2025-09-15 08:29:41'),
(50, 6, 'CREATE', 'restaurant_table', 8, NULL, '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": null, \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:30:06'),
(51, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"reserved\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:34:39'),
(52, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"reserved\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"occupied\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:34:40'),
(53, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"occupied\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:34:41'),
(54, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"reserved\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:34:42'),
(55, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"reserved\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"occupied\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:34:43'),
(56, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"occupied\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:34:44'),
(57, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"reserved\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:36:13'),
(58, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"reserved\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"occupied\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:36:13'),
(59, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"occupied\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:36:14'),
(60, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"reserved\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:36:15'),
(61, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"reserved\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"occupied\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:36:15'),
(62, 6, 'UPDATE', 'restaurant_table', 8, '{\"seats\": 5, \"status\": \"occupied\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', '{\"seats\": 5, \"status\": \"available\", \"table_id\": 8, \"created_at\": \"2025-09-15T08:30:06.000Z\", \"table_number\": \"T7\", \"restaurant_id\": 5}', 'system', 'system', '2025-09-15 08:36:17'),
(63, 2, 'CREATE', 'menu', 7, NULL, '{\"name\": \"Ibirayi\", \"image\": \"uploads/menu/menu-1757926631018-356443848.jpg\", \"price\": 9000, \"menu_id\": 7, \"available\": true, \"created_at\": null, \"updated_at\": null, \"description\": \"This is ibirayi descriptions\", \"restaurant_id\": 1, \"restaurant_name\": null}', 'system', 'system', '2025-09-15 08:57:11'),
(64, 2, 'SOFT_DELETE', 'eating_out', 2, '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"active\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-13T02:54:50.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-13T02:54:50.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', 'system', 'system', '2025-09-15 09:02:57'),
(65, 2, 'SOFT_DELETE', 'eating_out', 2, '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:02:57.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:02:57.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', 'system', 'system', '2025-09-15 09:03:06'),
(66, 2, 'SOFT_DELETE', 'eating_out', 2, '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:03:06.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:03:06.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', 'system', 'system', '2025-09-15 09:03:17'),
(67, 2, 'SOFT_DELETE', 'eating_out', 2, '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:03:17.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:03:17.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', 'system', 'system', '2025-09-15 09:26:54'),
(68, 2, 'SOFT_DELETE', 'eating_out', 2, '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:26:54.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:26:54.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', 'system', 'system', '2025-09-15 09:46:13'),
(69, 2, 'SOFT_DELETE', 'eating_out', 2, '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:46:13.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:46:13.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', 'system', 'system', '2025-09-15 09:46:28'),
(70, 2, 'HARD_DELETE', 'eating_out', 2, '{\"name\": \"Sample Restaurant\", \"images\": [], \"status\": \"inactive\", \"location\": \"123 Main St\", \"vendor_id\": 2, \"created_at\": \"2025-09-13T02:54:50.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T09:46:28.000Z\", \"description\": \"A great place to eat.\", \"vendor_name\": \"Vendor\", \"private_boat\": false, \"total_tables\": 2, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Activities\", \"eating_out_id\": 2, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 1, \"wifi_available\": 1, \"available_tables\": 2, \"menu_items_count\": 2, \"subcategory_name\": \"City Exploration\", \"parking_available\": 1}', NULL, 'system', 'system', '2025-09-15 09:49:52'),
(71, 2, 'UPDATE', 'eating_out', 3, '{\"name\": \"Umubano Restourant\", \"images\": [], \"status\": \"pending\", \"location\": \"Kigali\", \"vendor_id\": 2, \"created_at\": \"2025-09-15T06:09:07.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T06:09:07.000Z\", \"description\": \"Umuganura brings you the authentic flavors of Rwanda\'s harvest celebration. Our restaurant offers a modern twist on traditional Rwandan cuisine, featuring fresh, locally-sourced ingredients and family recipes passed down through generations.\", \"vendor_name\": \"Vendor\", \"private_boat\": 1, \"total_tables\": 0, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Eating Out\", \"eating_out_id\": 3, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 5, \"wifi_available\": 1, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": \"CocalRestaurants\", \"parking_available\": 1}', '{\"name\": \"Umubano Restourant\", \"images\": [{\"image_id\": 12, \"created_at\": \"2025-09-16T13:52:29.000Z\", \"image_path\": \"/uploads/eating_out/eating_out_1758030749115-400605725.png\", \"image_type\": \"main\", \"image_order\": 0, \"eating_out_id\": 3}, {\"image_id\": 13, \"created_at\": \"2025-09-16T13:52:29.000Z\", \"image_path\": \"/uploads/eating_out/eating_out_1758030749119-207175033.png\", \"image_type\": \"gallery\", \"image_order\": 1, \"eating_out_id\": 3}], \"status\": \"pending\", \"location\": \"Kigali\", \"vendor_id\": 2, \"created_at\": \"2025-09-15T06:09:07.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-15T06:09:07.000Z\", \"description\": \"Umuganura brings you the authentic flavors of Rwanda\'s harvest celebration. Our restaurant offers a modern twist on traditional Rwandan cuisine, featuring fresh, locally-sourced ingredients and family recipes passed down through generations.\", \"vendor_name\": \"Vendor\", \"private_boat\": true, \"total_tables\": 0, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Eating Out\", \"eating_out_id\": 3, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 5, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": \"CocalRestaurants\", \"parking_available\": true}', 'system', 'system', '2025-09-16 13:52:29'),
(72, 2, 'UPDATE', 'eating_out', 3, '{\"name\": \"Umubano Restourant\", \"images\": [], \"status\": \"pending\", \"location\": \"Kigali\", \"vendor_id\": 2, \"created_at\": \"2025-09-15T06:09:07.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-16T13:52:29.000Z\", \"description\": \"Umuganura brings you the authentic flavors of Rwanda\'s harvest celebration. Our restaurant offers a modern twist on traditional Rwandan cuisine, featuring fresh, locally-sourced ingredients and family recipes passed down through generations.\", \"vendor_name\": \"Vendor\", \"private_boat\": 1, \"total_tables\": 0, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Eating Out\", \"eating_out_id\": 3, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 5, \"wifi_available\": 1, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": \"CocalRestaurants\", \"parking_available\": 1}', '{\"name\": \"Umubano Restourant\", \"images\": [{\"image_id\": 14, \"created_at\": \"2025-09-16T13:52:56.000Z\", \"image_path\": \"/uploads/eating_out/eating_out_1758030776955-565513463.png\", \"image_type\": \"main\", \"image_order\": 0, \"eating_out_id\": 3}, {\"image_id\": 15, \"created_at\": \"2025-09-16T13:52:56.000Z\", \"image_path\": \"/uploads/eating_out/eating_out_1758030776961-983210846.png\", \"image_type\": \"gallery\", \"image_order\": 1, \"eating_out_id\": 3}], \"status\": \"pending\", \"location\": \"Kigali\", \"vendor_id\": 2, \"created_at\": \"2025-09-15T06:09:07.000Z\", \"main_image\": null, \"updated_at\": \"2025-09-16T13:52:29.000Z\", \"description\": \"Umuganura brings you the authentic flavors of Rwanda\'s harvest celebration. Our restaurant offers a modern twist on traditional Rwandan cuisine, featuring fresh, locally-sourced ingredients and family recipes passed down through generations.\", \"vendor_name\": \"Vendor\", \"private_boat\": true, \"total_tables\": 0, \"vendor_email\": \"vendor@gmail.com\", \"category_name\": \"Eating Out\", \"eating_out_id\": 3, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 5, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": \"CocalRestaurants\", \"parking_available\": true}', 'system', 'system', '2025-09-16 13:52:56'),
(73, 8, 'CREATE', 'eating_out', 6, NULL, '{\"name\": \"ZED REST\", \"images\": [{\"image_id\": 16, \"image_path\": \"/uploads/eating_out/eating_out_1758124465016-894434135.png\", \"image_type\": \"main\", \"image_order\": 0}], \"status\": \"pending\", \"location\": \"Kigali, Remera\", \"vendor_id\": 8, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"Good by far\", \"vendor_name\": null, \"private_boat\": true, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 6, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 5, \"wifi_available\": true, \"available_tables\": 0, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": true}', 'system', 'system', '2025-09-17 15:54:25'),
(74, 2, 'CREATE', 'tour_package', 3, NULL, '{\"name\": \"Lake Kivu Scenic Escape\", \"phone\": \"+250 781796824\", \"price\": 85000, \"status\": \"pending\", \"currency\": \"RWF\", \"duration\": \"+250788112233\", \"includes\": \"Professional local guide\\r\\nBoat and safety equipment\\r\\nLight lunch and bottled water\", \"location\": \"Lake Kivu, Rwanda\", \"vendor_id\": 2, \"created_at\": null, \"highlights\": \"Boat cruise through scenic islands\\r\\nIsland hopping and village visits\\r\\nOpportunity for swimming or kayaking\", \"max_people\": 20, \"min_people\": 2, \"package_id\": 3, \"updated_at\": null, \"updated_flag\": null, \"what_to_bring\": \"Sunscreen\\r\\nSwimwear and towel\\r\\nCamera for photos\", \"subcategory_id\": 2, \"things_to_know\": \"Suitable for most travelers. Children must be accompanied by an adult. Operates in fair weather—boat routes may change with lake conditions.\", \"description_full\": null, \"description_short\": \"Relaxing boat cruises, island hopping, and cultural encounters on Rwanda’s Lake Kivu.\", \"free_cancellation\": true, \"instructor_language\": \"English\", \"meeting_point_details\": \"Pickup available from Gisenyi hotels or meet at Kibuye harbor at 9:00 AM.\", \"reserve_now_pay_later\": false}', 'system', 'system', '2025-09-21 01:01:57'),
(75, 3, 'UPDATE', 'categories', 6, '{\"name\": \"Tour Packages\", \"image\": \"uploads/categories/category-1757606888891-205088470.png\", \"status\": \"active\", \"created_at\": \"2025-09-11T16:08:08.000Z\", \"updated_at\": \"2025-09-11T16:08:08.000Z\", \"category_id\": 6, \"description\": \"Browse curated tour packages that include guided tours, multi-day itineraries, sightseeing, transportation, accommodation, and optional activities. Ideal for travelers who prefer convenient and organized travel plans.\"}', '{\"name\": \"Tour Packages\", \"image\": \"uploads/categories/category-1759135879877-670694559.png\", \"status\": \"active\", \"created_at\": \"2025-09-11T16:08:08.000Z\", \"updated_at\": \"2025-09-11T16:08:08.000Z\", \"category_id\": 6, \"description\": \"Browse curated tour packages that include guided tours, multi-day itineraries, sightseeing, transportation, accommodation, and optional activities. Ideal for travelers who prefer convenient and organized travel plans.\"}', 'system', 'system', '2025-09-29 08:51:19'),
(76, 2, 'CREATE', 'tour_package', 4, NULL, '{\"name\": \"Nyandungu national park\", \"phone\": \"+250 787366563\", \"price\": 23333, \"status\": \"pending\", \"currency\": \"RWF\", \"duration\": \"sdfasdf\", \"includes\": \"S\", \"location\": \"sdfasd\", \"vendor_id\": 2, \"created_at\": null, \"highlights\": \"S\", \"max_people\": 99, \"min_people\": 4, \"package_id\": 4, \"updated_at\": null, \"updated_flag\": null, \"what_to_bring\": \"S\", \"subcategory_id\": 1, \"things_to_know\": \"sdfsdf\", \"description_full\": \"sdfsadf\", \"description_short\": \"asdfasdf\", \"free_cancellation\": true, \"instructor_language\": \"English\", \"meeting_point_details\": \"dasasdfs\", \"reserve_now_pay_later\": true}', 'system', 'system', '2025-09-29 08:58:36'),
(77, 2, 'DELETE', 'tour_package', 4, '{\"name\": \"Nyandungu national park\", \"phone\": \"+250 787366563\", \"price\": \"23333.00\", \"status\": \"pending\", \"currency\": \"RWF\", \"duration\": \"sdfasdf\", \"includes\": \"S\", \"location\": \"sdfasd\", \"vendor_id\": 2, \"created_at\": \"2025-09-29T08:58:36.000Z\", \"highlights\": \"S\", \"max_people\": 99, \"min_people\": 4, \"package_id\": 4, \"updated_at\": \"2025-09-29T08:58:36.000Z\", \"updated_flag\": null, \"what_to_bring\": \"S\", \"subcategory_id\": 1, \"things_to_know\": \"sdfsdf\", \"description_full\": \"sdfsadf\", \"description_short\": \"asdfasdf\", \"free_cancellation\": 1, \"instructor_language\": \"English\", \"meeting_point_details\": \"dasasdfs\", \"reserve_now_pay_later\": 1}', NULL, 'system', 'system', '2025-09-29 10:16:52'),
(78, 3, 'CREATE', 'subcategories', 20, NULL, '{\"name\": \"asdfsdfasfd\", \"image\": null, \"status\": \"active\", \"created_at\": null, \"updated_at\": null, \"category_id\": \"6\", \"description\": \"asfsdfdfsdfa\", \"category_name\": null, \"subcategory_id\": 20, \"category_status\": null}', 'system', 'system', '2025-09-30 08:45:10'),
(79, 3, 'SOFT_DELETE', 'subcategories', 20, '{\"name\": \"asdfsdfasfd\", \"image\": null, \"status\": \"active\", \"created_at\": \"2025-09-30T08:45:10.000Z\", \"updated_at\": \"2025-09-30T08:45:10.000Z\", \"category_id\": 6, \"description\": \"asfsdfdfsdfa\", \"category_name\": \"Tour Packages\", \"subcategory_id\": 20, \"category_status\": \"active\"}', '{\"name\": \"asdfsdfasfd\", \"image\": null, \"status\": \"inactive\", \"created_at\": \"2025-09-30T08:45:10.000Z\", \"updated_at\": \"2025-09-30T08:45:10.000Z\", \"category_id\": 6, \"description\": \"asfsdfdfsdfa\", \"category_name\": \"Tour Packages\", \"subcategory_id\": 20, \"category_status\": \"active\"}', 'system', 'system', '2025-09-30 08:45:16'),
(80, 3, 'SOFT_DELETE', 'subcategories', 20, '{\"name\": \"asdfsdfasfd\", \"image\": null, \"status\": \"inactive\", \"created_at\": \"2025-09-30T08:45:10.000Z\", \"updated_at\": \"2025-09-30T08:45:16.000Z\", \"category_id\": 6, \"description\": \"asfsdfdfsdfa\", \"category_name\": \"Tour Packages\", \"subcategory_id\": 20, \"category_status\": \"active\"}', '{\"name\": \"asdfsdfasfd\", \"image\": null, \"status\": \"inactive\", \"created_at\": \"2025-09-30T08:45:10.000Z\", \"updated_at\": \"2025-09-30T08:45:16.000Z\", \"category_id\": 6, \"description\": \"asfsdfdfsdfa\", \"category_name\": \"Tour Packages\", \"subcategory_id\": 20, \"category_status\": \"active\"}', 'system', 'system', '2025-09-30 08:46:48');
INSERT INTO `audit_logs` (`log_id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
(81, 3, 'SOFT_DELETE', 'subcategories', 13, '{\"name\": \"Homestays\", \"image\": null, \"status\": \"active\", \"created_at\": \"2025-09-11T16:29:24.000Z\", \"updated_at\": \"2025-09-11T16:29:24.000Z\", \"category_id\": 4, \"description\": null, \"category_name\": \"Rest & Stay\", \"subcategory_id\": 13, \"category_status\": \"active\"}', '{\"name\": \"Homestays\", \"image\": null, \"status\": \"inactive\", \"created_at\": \"2025-09-11T16:29:24.000Z\", \"updated_at\": \"2025-09-11T16:29:24.000Z\", \"category_id\": 4, \"description\": null, \"category_name\": \"Rest & Stay\", \"subcategory_id\": 13, \"category_status\": \"active\"}', 'system', 'system', '2025-09-30 08:47:03'),
(82, 7, 'CREATE', 'eating_out', 7, NULL, '{\"name\": \"ADSFASDF\", \"phone\": \"+2509834323\", \"images\": [{\"image_id\": 17, \"image_path\": \"/uploads/eating_out/eating_out_1759237847423-302478429.png\", \"image_type\": \"main\", \"image_order\": 0}, {\"image_id\": 18, \"image_path\": \"/uploads/eating_out/eating_out_1759237847431-845437328.png\", \"image_type\": \"gallery\", \"image_order\": 1}, {\"image_id\": 19, \"image_path\": \"/uploads/eating_out/eating_out_1759237847435-218467907.png\", \"image_type\": \"gallery\", \"image_order\": 2}], \"status\": \"pending\", \"location\": \"SDFSADF\", \"vendor_id\": 7, \"created_at\": null, \"main_image\": null, \"updated_at\": null, \"description\": \"ASDFSAFSADFSADFSADF KSDJFASDFASJ;DFSKALDFSAD\", \"vendor_name\": null, \"private_boat\": true, \"total_tables\": 0, \"vendor_email\": null, \"category_name\": null, \"eating_out_id\": 7, \"total_reviews\": 0, \"average_rating\": null, \"subcategory_id\": 7, \"wifi_available\": true, \"available_tables\": 0, \"delivery_support\": false, \"menu_items_count\": 0, \"subcategory_name\": null, \"parking_available\": true}', 'system', 'system', '2025-09-30 13:10:47'),
(83, 3, 'CREATE', 'locations', 1, NULL, '{\"location_id\": 1, \"location_name\": \"sdwe\"}', 'system', 'system', '2025-10-02 18:15:02');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int NOT NULL,
  `service_type` enum('homestay','restaurant_table','tour_package','food_order','room','car_rental','activity') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_status` enum('pending','paid','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `order_status` enum('received','preparing','ready_for_pickup','out_for_delivery','delivered') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `booking_reference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Unique booking reference code',
  `booking_source` enum('website','mobile_app','phone','email','walk_in','agent','ota') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'website',
  `special_requests` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` int DEFAULT NULL COMMENT 'user_id who cancelled',
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `service_type`, `user_id`, `total_amount`, `status`, `payment_status`, `order_status`, `created_at`, `updated_at`, `booking_reference`, `booking_source`, `special_requests`, `cancellation_reason`, `cancelled_at`, `cancelled_by`, `confirmed_at`, `completed_at`) VALUES
(1, 'homestay', 4, '150.00', 'pending', 'pending', NULL, '2025-09-14 08:21:18', '2025-09-14 08:21:18', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'homestay', 4, '150.00', 'pending', 'pending', NULL, '2025-09-14 08:21:46', '2025-09-14 08:21:46', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'restaurant_table', 4, '0.00', 'pending', 'pending', NULL, '2025-09-14 08:22:24', '2025-09-14 08:22:24', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'restaurant_table', 4, '0.00', 'pending', 'pending', NULL, '2025-09-14 08:36:27', '2025-09-14 08:36:27', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'homestay', 4, '100.00', 'pending', 'pending', NULL, '2025-09-15 13:10:18', '2025-09-15 13:10:18', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'homestay', 4, '100.00', 'pending', 'pending', NULL, '2025-09-15 13:13:05', '2025-09-15 13:13:05', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'restaurant_table', 4, '0.00', 'pending', 'pending', NULL, '2025-09-15 14:14:37', '2025-09-15 14:14:37', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'restaurant_table', 4, '0.00', 'pending', 'pending', NULL, '2025-09-16 08:37:03', '2025-09-16 08:37:03', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'restaurant_table', 4, '0.00', 'pending', 'pending', NULL, '2025-09-16 08:37:57', '2025-09-16 08:37:57', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'restaurant_table', 4, '0.00', 'pending', 'pending', NULL, '2025-09-16 08:39:28', '2025-09-16 08:39:28', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'restaurant_table', 4, '0.00', 'pending', 'pending', NULL, '2025-09-16 09:31:45', '2025-09-16 09:31:45', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'car_rental', 4, '100000.00', 'pending', 'pending', NULL, '2025-09-17 10:37:22', '2025-09-17 10:37:22', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'restaurant_table', 4, '0.00', 'pending', 'pending', NULL, '2025-09-17 11:34:54', '2025-09-17 11:34:54', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 02:19:27', '2025-09-28 02:19:27', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 02:19:28', '2025-09-28 02:19:28', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 02:19:28', '2025-09-28 02:19:28', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 02:29:30', '2025-09-28 02:29:30', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 02:29:30', '2025-09-28 02:29:30', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 02:29:30', '2025-09-28 02:29:30', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(23, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 02:33:37', '2025-09-28 02:33:37', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 02:33:37', '2025-09-28 02:33:37', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 02:33:37', '2025-09-28 02:33:37', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(26, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 02:40:01', '2025-09-28 02:40:01', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 02:40:02', '2025-09-28 02:40:02', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 02:40:02', '2025-09-28 02:40:02', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 02:44:45', '2025-09-28 02:44:45', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 02:44:45', '2025-09-28 02:44:45', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 02:44:45', '2025-09-28 02:44:45', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 02:47:23', '2025-09-28 02:47:23', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 02:47:23', '2025-09-28 02:47:23', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 02:47:23', '2025-09-28 02:47:23', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 03:03:54', '2025-09-28 03:03:54', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(36, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 03:03:54', '2025-09-28 03:03:54', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 03:03:55', '2025-09-28 03:03:55', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 03:08:26', '2025-09-28 03:08:26', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 03:08:26', '2025-09-28 03:08:26', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 03:08:26', '2025-09-28 03:08:26', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'activity', 11, '100.00', 'pending', 'pending', NULL, '2025-09-28 03:22:07', '2025-09-28 03:22:07', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'activity', 11, '750.00', 'pending', 'pending', NULL, '2025-09-28 03:22:07', '2025-09-28 03:22:07', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(43, 'activity', 11, '0.00', 'pending', 'pending', NULL, '2025-09-28 03:22:07', '2025-09-28 03:22:07', NULL, 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(44, 'room', 4, '150000.00', 'confirmed', 'paid', NULL, '2025-10-10 04:28:42', '2025-10-10 09:37:30', 'TRV-000044', 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(45, 'room', 4, '200000.00', 'confirmed', 'paid', NULL, '2025-10-10 04:28:42', '2025-10-10 10:50:37', 'TRV-000045', 'phone', NULL, NULL, NULL, NULL, '2025-10-10 10:50:37', NULL),
(46, 'room', 4, '180000.00', 'confirmed', 'paid', NULL, '2025-10-08 04:28:42', '2025-10-10 09:37:30', 'TRV-000046', 'walk_in', NULL, NULL, NULL, NULL, NULL, NULL),
(47, 'room', 4, '120000.00', 'confirmed', 'paid', NULL, '2025-10-10 04:28:42', '2025-10-10 09:37:30', 'TRV-000047', 'website', NULL, NULL, NULL, NULL, NULL, NULL),
(48, 'room', 4, '250000.00', 'confirmed', 'paid', NULL, '2025-10-10 04:28:42', '2025-10-10 09:37:30', 'TRV-000048', 'mobile_app', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking_charges`
--

CREATE TABLE `booking_charges` (
  `charge_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `charge_type` enum('room','minibar','room_service','laundry','phone','parking','extra_bed','early_checkin','late_checkout','damage','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `charged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `charged_by` int DEFAULT NULL COMMENT 'staff user_id',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_guests`
--

CREATE TABLE `booking_guests` (
  `id` int NOT NULL,
  `booking_id` int NOT NULL,
  `guest_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0' COMMENT 'Primary guest for the booking',
  `room_assignment` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Which room unit',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_modifications`
--

CREATE TABLE `booking_modifications` (
  `modification_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `modified_by` int NOT NULL COMMENT 'user_id or staff_id',
  `modification_type` enum('date_change','room_change','guest_change','cancellation','amount_change','status_change','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON of old values',
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON of new values',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `additional_charges` decimal(10,2) DEFAULT '0.00',
  `refund_amount` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`, `description`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Activities', 'Experiences and things to do, such as sightseeing tours, adventure sports, cultural experiences.', 'uploads/categories/category-1757600537538-535727366.png', 'active', '2025-09-11 14:22:17', '2025-09-11 14:22:17'),
(2, 'Eating Out', 'Discover restaurants, cafés, street food spots, fine dining, local specialties, and international cuisine. Includes recommendations for breakfast, lunch, dinner, and snacks to experience the culinary culture of each destination.', 'uploads/categories/category-1757606496956-845082444.png', 'active', '2025-09-11 16:01:36', '2025-09-11 16:01:36'),
(4, 'Rest & Stay', 'Find accommodation options ranging from budget hostels and guesthouses to luxury hotels and resorts. Includes amenities, locations, ratings, and traveler reviews to help plan a comfortable and enjoyable stay.', 'uploads/categories/category-1757606624199-28665480.png', 'active', '2025-09-11 16:03:44', '2025-09-11 16:03:44'),
(5, 'Car Rental', 'Provides detailed information about local taxes, fees, tourist levies, entry fees, and financial guidelines for travelers. Helps visitors plan their budgets accurately and avoid surprises during their trip.', 'uploads/categories/category-1757606780482-982630295.png', 'active', '2025-09-11 16:06:20', '2025-09-16 21:28:36'),
(6, 'Tour Packages', 'Browse curated tour packages that include guided tours, multi-day itineraries, sightseeing, transportation, accommodation, and optional activities. Ideal for travelers who prefer convenient and organized travel plans.', 'uploads/categories/category-1759135879877-670694559.png', 'active', '2025-09-11 16:08:08', '2025-09-29 08:51:19');

-- --------------------------------------------------------

--
-- Table structure for table `external_bookings`
--

CREATE TABLE `external_bookings` (
  `external_id` int NOT NULL,
  `booking_reference` varchar(100) DEFAULT NULL,
  `ota_name` varchar(50) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `room_type_id` int DEFAULT NULL,
  `check_in` date DEFAULT NULL,
  `check_out` date DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('confirmed','cancelled','completed') DEFAULT 'confirmed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_accounts`
--

CREATE TABLE `financial_accounts` (
  `account_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `account_name` varchar(100) DEFAULT NULL,
  `account_type` enum('bank','cash','mobile_money') DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'RWF',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `financial_reports`
--

CREATE TABLE `financial_reports` (
  `report_id` int NOT NULL,
  `report_type` enum('daily','weekly','monthly','custom') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `data` json DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `front_desk_logs`
--

CREATE TABLE `front_desk_logs` (
  `log_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `action_type` enum('check_in','check_out','no_show','early_checkout','late_checkout','room_change','extend_stay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `performed_by` int NOT NULL COMMENT 'staff user_id',
  `action_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `room_unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `key_card_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deposit_collected` decimal(10,2) DEFAULT '0.00',
  `deposit_returned` decimal(10,2) DEFAULT '0.00',
  `additional_charges` decimal(10,2) DEFAULT '0.00',
  `payment_method` enum('cash','card','mobile_money','bank_transfer','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `guest_signature` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Base64 encoded signature or file path',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `front_desk_logs`
--

INSERT INTO `front_desk_logs` (`log_id`, `booking_id`, `action_type`, `performed_by`, `action_time`, `room_unit`, `key_card_number`, `deposit_collected`, `deposit_returned`, `additional_charges`, `payment_method`, `notes`, `guest_signature`, `created_at`) VALUES
(1, 45, 'check_in', 1, '2025-10-10 10:50:37', NULL, 'KC001', '50000.00', '0.00', '0.00', NULL, 'I received this client', NULL, '2025-10-10 10:50:37');

-- --------------------------------------------------------

--
-- Table structure for table `guest_complaints`
--

CREATE TABLE `guest_complaints` (
  `complaint_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `guest_id` int DEFAULT NULL,
  `complaint_type` enum('room_condition','service','noise','cleanliness','staff_behavior','amenities','billing','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('minor','moderate','serious','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'moderate',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('reported','investigating','resolved','escalated','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'reported',
  `assigned_to` int DEFAULT NULL COMMENT 'staff user_id handling complaint',
  `resolution` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `compensation_offered` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compensation_amount` decimal(10,2) DEFAULT '0.00',
  `reported_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `guest_satisfied` tinyint(1) DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT '0',
  `follow_up_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest_profiles`
--

CREATE TABLE `guest_profiles` (
  `guest_id` int NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Link to users table if registered',
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_expiry_date` date DEFAULT NULL,
  `passport_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_expiry_date` date DEFAULT NULL,
  `preferences` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON: room preferences, dietary, etc.',
  `vip_status` tinyint(1) DEFAULT '0',
  `loyalty_points` int DEFAULT '0',
  `total_bookings` int DEFAULT '0',
  `total_spent` decimal(12,2) DEFAULT '0.00',
  `last_stay_date` date DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `blacklisted` tinyint(1) DEFAULT '0',
  `blacklist_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest_requests`
--

CREATE TABLE `guest_requests` (
  `request_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `guest_id` int DEFAULT NULL,
  `request_type` enum('room_service','housekeeping','maintenance','amenity','wake_up_call','transportation','concierge','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','normal','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `status` enum('pending','acknowledged','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `assigned_to` int DEFAULT NULL COMMENT 'staff user_id',
  `requested_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `scheduled_time` timestamp NULL DEFAULT NULL,
  `completed_time` timestamp NULL DEFAULT NULL,
  `additional_charges` decimal(10,2) DEFAULT '0.00',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `staff_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rating` int DEFAULT NULL COMMENT '1-5 rating',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest_reviews`
--

CREATE TABLE `guest_reviews` (
  `review_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `guest_id` int DEFAULT NULL,
  `homestay_id` int NOT NULL,
  `inventory_id` int DEFAULT NULL,
  `overall_rating` int NOT NULL,
  `cleanliness_rating` int DEFAULT NULL,
  `service_rating` int DEFAULT NULL,
  `location_rating` int DEFAULT NULL,
  `value_rating` int DEFAULT NULL,
  `amenities_rating` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `review_text` text,
  `pros` text,
  `cons` text,
  `would_recommend` tinyint(1) DEFAULT '1',
  `stay_type` enum('business','leisure','family','couple','solo','group') DEFAULT NULL,
  `images` text,
  `status` enum('pending','approved','rejected','flagged') DEFAULT 'pending',
  `verified_stay` tinyint(1) DEFAULT '1',
  `helpful_count` int DEFAULT '0',
  `not_helpful_count` int DEFAULT '0',
  `vendor_response` text,
  `vendor_responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hms_users`
--

CREATE TABLE `hms_users` (
  `hms_user_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` text,
  `role` enum('manager','receptionist','housekeeping','maintenance','restaurant','inventory','accountant') DEFAULT NULL,
  `assigned_hotel_id` int DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `homestays`
--

CREATE TABLE `homestays` (
  `homestay_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `star_rating` tinyint(1) DEFAULT '3',
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_in_time` time DEFAULT '14:00:00',
  `check_out_time` time DEFAULT '11:00:00',
  `cancellation_policy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `child_policy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pet_policy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `total_rooms` int DEFAULT '0',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `free_wifi` tinyint(1) DEFAULT '0',
  `parking_available` tinyint(1) DEFAULT '0',
  `pet_friendly` tinyint(1) DEFAULT '0',
  `swimming_pool` tinyint(1) DEFAULT '0',
  `spa` tinyint(1) DEFAULT '0',
  `fitness_center` tinyint(1) DEFAULT '0',
  `restaurant` tinyint(1) DEFAULT '0',
  `bar_lounge` tinyint(1) DEFAULT '0',
  `air_conditioning` tinyint(1) DEFAULT '0',
  `room_service` tinyint(1) DEFAULT '0',
  `laundry_service` tinyint(1) DEFAULT '0',
  `airport_shuttle` tinyint(1) DEFAULT '0',
  `family_rooms` tinyint(1) DEFAULT '0',
  `non_smoking_rooms` tinyint(1) DEFAULT '0',
  `breakfast_included` tinyint(1) DEFAULT '0',
  `kitchen_facilities` tinyint(1) DEFAULT '0',
  `balcony` tinyint(1) DEFAULT '0',
  `ocean_view` tinyint(1) DEFAULT '0',
  `garden_view` tinyint(1) DEFAULT '0',
  `wheelchair_accessible` tinyint(1) DEFAULT '0',
  `meeting_rooms` tinyint(1) DEFAULT '0',
  `conference_facilities` tinyint(1) DEFAULT '0',
  `security_24h` tinyint(1) DEFAULT '0',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `fresh discoveries` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `homestays`
--

INSERT INTO `homestays` (`homestay_id`, `vendor_id`, `name`, `description`, `star_rating`, `location`, `check_in_time`, `check_out_time`, `cancellation_policy`, `child_policy`, `pet_policy`, `total_rooms`, `phone`, `email`, `free_wifi`, `parking_available`, `pet_friendly`, `swimming_pool`, `spa`, `fitness_center`, `restaurant`, `bar_lounge`, `air_conditioning`, `room_service`, `laundry_service`, `airport_shuttle`, `family_rooms`, `non_smoking_rooms`, `breakfast_included`, `kitchen_facilities`, `balcony`, `ocean_view`, `garden_view`, `wheelchair_accessible`, `meeting_rooms`, `conference_facilities`, `security_24h`, `featured`, `fresh discoveries`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Urugero Hotel', 'A cozy place near the beach with all amenities.', 3, '123 Ocean View Road, Beach City', '14:00:00', '11:00:00', NULL, NULL, NULL, 0, '+250734567890', NULL, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 'active', '2025-09-12 12:38:24', '2025-09-28 04:26:34'),
(5, 2, 'Kigali Gardens Boutique Hotel', 'A modern boutique hotel in the heart of Kigali, offering luxury accommodation with stunning city views, excellent dining, and world-class service.', 3, 'Kimihurura, Kigali, Rwanda', '14:00:00', '11:00:00', NULL, NULL, NULL, 0, '+2500781796824', NULL, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 'active', '2025-10-09 15:42:14', '2025-10-09 15:42:14');

-- --------------------------------------------------------

--
-- Table structure for table `homestay_bookings`
--

CREATE TABLE `homestay_bookings` (
  `booking_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `check_in_date` date DEFAULT NULL,
  `check_out_date` date DEFAULT NULL,
  `guests` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `homestay_images`
--

CREATE TABLE `homestay_images` (
  `image_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_type` enum('main','gallery') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'gallery',
  `image_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `homestay_images`
--

INSERT INTO `homestay_images` (`image_id`, `homestay_id`, `image_path`, `image_type`, `image_order`, `created_at`) VALUES
(1, 1, 'uploads/homestays/1757680704551-226595297.png', 'gallery', 0, '2025-09-12 12:38:24'),
(2, 1, 'uploads/homestays/1757680704557-691972401.png', 'gallery', 1, '2025-09-12 12:38:24'),
(3, 1, 'uploads/homestays/1757680704560-691454438.png', 'gallery', 2, '2025-09-12 12:38:24'),
(10, 5, 'uploads/homestays/1760024534179-906645359.png', 'gallery', 0, '2025-10-09 15:42:14'),
(11, 5, 'uploads/homestays/1760024534186-324577062.png', 'gallery', 1, '2025-10-09 15:42:14'),
(12, 5, 'uploads/homestays/1760024534190-722031357.png', 'gallery', 2, '2025-10-09 15:42:14');

-- --------------------------------------------------------

--
-- Table structure for table `homestay_staff`
--

CREATE TABLE `homestay_staff` (
  `staff_id` int NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'Link to users table if they have login',
  `homestay_id` int NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('manager','receptionist','housekeeper','maintenance','supervisor','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employment_type` enum('full_time','part_time','contract','temporary') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'full_time',
  `hire_date` date DEFAULT NULL,
  `termination_date` date DEFAULT NULL,
  `status` enum('active','inactive','on_leave','terminated') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `emergency_contact_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Ensure homestays table has proper primary key
--
ALTER TABLE homestays ADD PRIMARY KEY (homestay_id);

-- --------------------------------------------------------

--
-- Table structure for table `hotel_restaurants`
--

CREATE TABLE hotel_restaurants (
  restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  cuisine_type VARCHAR(100),  -- e.g., Italian, Rwandan, Indian
  opening_time TIME DEFAULT '07:00:00',
  closing_time TIME DEFAULT '23:00:00',
  contact_number VARCHAR(20),
  email VARCHAR(100),
  menu_image VARCHAR(255),   -- optional image path for menu
  status ENUM('open', 'closed', 'under_maintenance') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_homestay_id (homestay_id),
  CONSTRAINT fk_restaurant_homestay
    FOREIGN KEY (homestay_id)
    REFERENCES homestays(homestay_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotel_kitchen_queue`
--


CREATE TABLE `hotel_kitchen_queue` (
  `queue_id` int NOT NULL,
  `order_id` int NOT NULL,
  `item_name` varchar(100) DEFAULT NULL,
  `status` enum('pending','cooking','ready','served') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotel_menu`
--

CREATE TABLE `hotel_menu` (
  `menu_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotel_menu`
--

INSERT INTO `hotel_menu` (`menu_id`, `restaurant_id`, `name`, `description`, `price`, `image`, `available`, `created_at`, `updated_at`) VALUES
(1, 1, 'Margherita Pizza', 'Traditional pizza with fresh mozzarella, tomato sauce, and basil', '5000.00', 'uploads/menu/menu-1757662490926-701516435.png', 1, '2025-09-12 07:34:50', '2025-09-12 07:34:50'),
(2, 1, 'PAPILLOTE OF LIBOKE WITH TILAPIA', 'Neutral test of liboke ya Malangwa Tilapia and local vegetables smothered in banana leaf serve with cassava couscous', '12000.00', 'uploads/menu/menu-1757662988137-283452926.png', 1, '2025-09-12 07:43:08', '2025-09-12 07:43:08'),
(5, 1, 'Tesing Menu', 'Neutral test of liboke ya Malangwa Tilapia and local vegetables smothered in banana leaf serve with cassava couscous', '12000.00', 'uploads/menu/menu-1757801739891-138447811.png', 1, '2025-09-13 22:15:39', '2025-09-13 22:15:39'),
(6, 5, 'Ibishyimbo', 'This is ibishyimbo', '5000.00', 'uploads/menu/menu-1757924981347-148180078.png', 1, '2025-09-15 08:29:41', '2025-09-15 08:29:41'),
(7, 1, 'Ibirayi', 'This is ibirayi descriptions', '9000.00', 'uploads/menu/menu-1757926631018-356443848.jpg', 1, '2025-09-15 08:57:11', '2025-09-15 08:57:11');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_order_delivery_info`
--

CREATE TABLE `hotel_order_delivery_info` (
  `delivery_info_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `order_type` enum('delivery','pickup') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pickup',
  `delivery_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `delivery_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotel_order_items`
--

CREATE TABLE `hotel_order_items` (
  `order_item_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL,
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotel_restaurant_orders`
--

CREATE TABLE `hotel_restaurant_orders` (
  `order_id` int NOT NULL,
  `booking_id` int DEFAULT NULL,
  `table_id` int DEFAULT NULL,
  `status` enum('received','preparing','served','cancelled') DEFAULT 'received',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hotel_restaurant_tables`
--

CREATE TABLE `hotel_restaurant_tables` (
  `table_id` int NOT NULL,
  `table_number` varchar(10) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `status` enum('available','occupied','reserved') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `housekeeping_tasks`
--

CREATE TABLE `housekeeping_tasks` (
  `task_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `task_type` enum('cleaning','deep_cleaning','inspection','maintenance','turndown_service','laundry','minibar_restock') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','normal','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `assigned_to` int DEFAULT NULL COMMENT 'staff user_id',
  `status` enum('pending','in_progress','completed','cancelled','on_hold') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `scheduled_time` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `estimated_duration` int DEFAULT NULL COMMENT 'Minutes',
  `actual_duration` int DEFAULT NULL COMMENT 'Minutes',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `issues_found` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `supplies_used` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of supplies',
  `quality_score` int DEFAULT NULL COMMENT '1-5 rating',
  `inspected_by` int DEFAULT NULL COMMENT 'supervisor user_id',
  `inspection_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `invoice_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `service_charge` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `balance_due` decimal(10,2) DEFAULT '0.00',
  `status` enum('draft','sent','paid','partially_paid','overdue','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `payment_terms` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `generated_by` int DEFAULT NULL COMMENT 'staff user_id',
  `sent_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `item_id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `location_id` int NOT NULL,
  `location_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`location_id`, `location_name`) VALUES
(2, 'Gasabo'),
(3, 'Kicukiro'),
(4, 'Nyarugenge'),
(5, 'Burera'),
(6, 'Gakenke'),
(7, 'Gicumbi'),
(8, 'Musanze'),
(9, 'Rulindo'),
(10, 'Gisagara'),
(11, 'Huye'),
(12, 'Kamonyi'),
(13, 'Muhanga'),
(14, 'Nyamagabe'),
(15, 'Nyanza'),
(16, 'Nyaruguru'),
(17, 'Ruhango'),
(18, 'Bugesera'),
(19, 'Gatsibo'),
(20, 'Kayonza'),
(21, 'Kirehe'),
(22, 'Ngoma'),
(23, 'Nyagatare'),
(24, 'Rwamagana'),
(25, 'Karongi'),
(26, 'Ngororero'),
(27, 'Nyabihu'),
(28, 'Nyamasheke'),
(29, 'Rubavu'),
(30, 'Rusizi'),
(31, 'Rutsiro');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_requests`
--

CREATE TABLE `maintenance_requests` (
  `request_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `reported_by` int NOT NULL COMMENT 'user_id (staff or guest)',
  `issue_type` enum('plumbing','electrical','hvac','furniture','appliance','structural','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('low','normal','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('reported','assigned','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'reported',
  `assigned_to` int DEFAULT NULL COMMENT 'maintenance staff user_id',
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `actual_cost` decimal(10,2) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `resolution_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON array of image paths',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `money_transactions`
--

CREATE TABLE `money_transactions` (
  `transaction_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `account_id` int NOT NULL,
  `type` enum('inflow','outflow','transfer','refund') NOT NULL,
  `source_type` enum('booking','restaurant','supplier','maintenance','refund','subscription','manual') NOT NULL,
  `source_id` int DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'RWF',
  `payment_method` enum('cash','card','mobile_money','bank_transfer') NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `transaction_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `multi_room_bookings`
--

CREATE TABLE `multi_room_bookings` (
  `group_booking_id` int NOT NULL,
  `booking_id` int NOT NULL COMMENT 'Main booking ID',
  `room_booking_id` int NOT NULL COMMENT 'Individual room booking',
  `group_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_master_booking` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('booking','review','system','promotion') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ota_mappings`
--

CREATE TABLE `ota_mappings` (
  `mapping_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `ota_name` varchar(50) DEFAULT NULL,
  `ota_listing_id` varchar(100) DEFAULT NULL,
  `sync_status` enum('active','paused','error') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp_verifications`
--

CREATE TABLE `otp_verifications` (
  `otp_id` int NOT NULL COMMENT 'Primary key for OTP verification',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Phone number to verify',
  `otp_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hashed OTP code',
  `purpose` enum('registration','password_reset','phone_verification','login') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'registration' COMMENT 'Purpose of OTP verification',
  `is_used` tinyint(1) DEFAULT '0' COMMENT 'Whether OTP has been used',
  `expires_at` datetime NOT NULL COMMENT 'OTP expiration time',
  `verified_at` datetime DEFAULT NULL COMMENT 'Time when OTP was verified',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'OTP creation time'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores OTP codes for phone verification via Twilio SMS';

--
-- Dumping data for table `otp_verifications`
--

INSERT INTO `otp_verifications` (`otp_id`, `phone`, `otp_hash`, `purpose`, `is_used`, `expires_at`, `verified_at`, `created_at`) VALUES
(1, '+250788123456', '741e770fa6463d8124642ed2ea180175c513e53e07574c9c3d13cf54414b43e0', 'registration', 0, '2025-10-07 20:49:23', NULL, '2025-10-07 18:44:23'),
(2, '0781796826', '7bd19d2f92cd9eda3046ad6c8a0f13c02638183b51aa5dcfee61833bf875fc23', 'registration', 1, '2025-10-07 20:54:53', NULL, '2025-10-07 18:49:52'),
(3, '0781796826', '8330b826f55bc8b118aea1d425b747b884c82e2a328980b5effe7238897517f8', 'registration', 1, '2025-10-07 20:54:55', NULL, '2025-10-07 18:49:54'),
(4, '0781796826', '79fcb9ae9f6882697d6b58ca80b56e1d699c4880c4219dcc232f6eb323034c85', 'registration', 0, '2025-10-07 20:55:00', NULL, '2025-10-07 18:49:59'),
(5, '+250724728389', '96578daf9287a31faef86f004c0f269c3fdaf7a14ba0dd8258bc0a5cbad74d0d', 'registration', 1, '2025-10-07 21:12:12', NULL, '2025-10-07 19:07:11'),
(6, '+250724728389', 'fdb03b8b08ec9209a94e59c3c27f9a73e6b78f7413d0e7bbeb9977ca72944756', 'registration', 1, '2025-10-07 21:12:21', NULL, '2025-10-07 19:07:20'),
(7, '+250724728389', 'ab9aec7bdc28d90e274fe4c60c6cc8cbc16d34b05393dccd754514ed34d6d5f9', 'registration', 1, '2025-10-07 21:12:40', NULL, '2025-10-07 19:07:40'),
(8, '+250724728389', '8bc35a67598ea81910808c501748fb98156219502175d551b33873a21f006b88', 'registration', 1, '2025-10-07 21:19:30', NULL, '2025-10-07 19:14:29'),
(9, '0724728389', '685377512c6af05e00ad2e1237da3941530f7899ccad779be5c2aac46f0e77c4', 'registration', 1, '2025-10-07 21:24:12', NULL, '2025-10-07 19:19:12'),
(10, '0724728389', '8d404b10ae0d6acae7708369d8df98cc861981ad4c488962e3435d5ef5b329e7', 'registration', 1, '2025-10-07 21:24:25', NULL, '2025-10-07 19:19:25'),
(11, '0724728389', 'c6c9385ff887190368fee2c2cc7e2142b7c526172e006b1e095560fc57c9ea60', 'registration', 1, '2025-10-07 21:25:13', NULL, '2025-10-07 19:20:12'),
(12, '0724728389', '1b512668c84cfd1b691ad9660d6bf942e864064053db85f23c476530f5af772c', 'registration', 1, '2025-10-07 21:28:19', NULL, '2025-10-07 19:23:19'),
(13, '0724728389', '1e4c5c9d77787fd6fc798b00d93053b92b9503a4d3a37f3f75e0c18783c2d619', 'registration', 0, '2025-10-07 21:40:55', NULL, '2025-10-07 19:35:55'),
(14, '+250724728389', 'd477b9c586d780facad16ccf9ae9eb3f2fa33f8addf0b08abca781298944fc9c', 'registration', 0, '2025-10-07 21:58:54', NULL, '2025-10-07 19:53:53'),
(15, '+25072748389', 'c92c4b2831ad635bcbe120fca6d61532bd775e25e5400f7f05ab0a318f25e64a', 'registration', 0, '2025-10-07 22:16:42', NULL, '2025-10-07 20:11:41');

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `transaction_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `account_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `payment_method` enum('card','paypal','stripe','bank_transfer') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_gateway_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','processing','completed','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `gateway_response` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rate_sync_logs`
--

CREATE TABLE `rate_sync_logs` (
  `sync_id` int NOT NULL,
  `room_type_id` int DEFAULT NULL,
  `ota_name` varchar(50) DEFAULT NULL,
  `old_rate` decimal(10,2) DEFAULT NULL,
  `new_rate` decimal(10,2) DEFAULT NULL,
  `synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_exports`
--

CREATE TABLE `report_exports` (
  `export_id` int NOT NULL,
  `template_id` int DEFAULT NULL,
  `format` enum('pdf','excel','csv') DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_logs`
--

CREATE TABLE `report_logs` (
  `log_id` int NOT NULL,
  `template_id` int DEFAULT NULL,
  `run_by` int DEFAULT NULL,
  `run_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('success','error') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_templates`
--

CREATE TABLE `report_templates` (
  `template_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `query` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_capacity`
--

CREATE TABLE `restaurant_capacity` (
  `capacity_id` int NOT NULL,
  `eating_out_id` int NOT NULL,
  `max_capacity` int NOT NULL,
  `max_group_size` int DEFAULT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `max_reservation_duration` int DEFAULT '240' COMMENT 'Maximum allowed reservation time in minutes',
  `buffer_minutes` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `restaurant_capacity`
--

INSERT INTO `restaurant_capacity` (`capacity_id`, `eating_out_id`, `max_capacity`, `max_group_size`, `opening_time`, `closing_time`, `created_at`, `updated_at`, `max_reservation_duration`, `buffer_minutes`) VALUES
(5, 5, 5, NULL, NULL, NULL, '2025-09-16 14:58:15', '2025-09-16 14:58:15', 240, 0),
(7, 1, 40, 8, '10:00:00', '22:00:00', '2025-09-17 11:32:03', '2025-09-17 11:32:03', 180, 15),
(8, 3, 50, 8, '09:00:00', '23:00:00', '2025-09-30 12:33:40', '2025-09-30 12:33:40', 120, 15);

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_capacity_bookings`
--

CREATE TABLE `restaurant_capacity_bookings` (
  `capacity_booking_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `eating_out_id` int NOT NULL,
  `reservation_start` datetime NOT NULL,
  `reservation_end` datetime NOT NULL,
  `guests` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `restaurant_capacity_bookings`
--

INSERT INTO `restaurant_capacity_bookings` (`capacity_booking_id`, `booking_id`, `eating_out_id`, `reservation_start`, `reservation_end`, `guests`, `created_at`, `updated_at`) VALUES
(1, 16, 1, '2025-09-25 19:00:00', '2025-09-25 21:00:00', 4, '2025-09-17 11:34:54', '2025-09-17 11:34:54');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int NOT NULL,
  `user_id` int NOT NULL,
  `review_type` enum('homestay','eating_out','tour_package') NOT NULL,
  `reference_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_assignments`
--

CREATE TABLE `room_assignments` (
  `assignment_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` int NOT NULL COMMENT 'staff user_id',
  `check_in_time` timestamp NULL DEFAULT NULL,
  `check_out_time` timestamp NULL DEFAULT NULL,
  `actual_checkout_time` timestamp NULL DEFAULT NULL,
  `key_card_issued` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('assigned','checked_in','checked_out','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'assigned',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_availability`
--

CREATE TABLE `room_availability` (
  `availability_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `date` date NOT NULL,
  `available_units` int NOT NULL DEFAULT '0',
  `total_units` int NOT NULL DEFAULT '0',
  `min_stay` int DEFAULT '1',
  `max_stay` int DEFAULT NULL,
  `closed` tinyint(1) DEFAULT '0',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_bookings`
--

CREATE TABLE `room_bookings` (
  `booking_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `guests` int NOT NULL DEFAULT '1',
  `nights` int DEFAULT NULL,
  `room_price_per_night` decimal(10,2) NOT NULL,
  `total_room_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `homestay_id` int DEFAULT NULL,
  `guest_name` varchar(150) DEFAULT NULL,
  `guest_email` varchar(150) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `guest_id_type` varchar(50) DEFAULT NULL,
  `guest_id_number` varchar(100) DEFAULT NULL,
  `number_of_adults` int DEFAULT '1',
  `number_of_children` int DEFAULT '0',
  `early_checkin` tinyint(1) DEFAULT '0',
  `late_checkout` tinyint(1) DEFAULT '0',
  `early_checkin_fee` decimal(10,2) DEFAULT '0.00',
  `late_checkout_fee` decimal(10,2) DEFAULT '0.00',
  `extra_bed_count` int DEFAULT '0',
  `extra_bed_fee` decimal(10,2) DEFAULT '0.00',
  `tax_amount` decimal(10,2) DEFAULT '0.00',
  `service_charge` decimal(10,2) DEFAULT '0.00',
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `final_amount` decimal(10,2) DEFAULT '0.00',
  `deposit_amount` decimal(10,2) DEFAULT '0.00',
  `deposit_paid` tinyint(1) DEFAULT '0',
  `special_requests` text,
  `internal_notes` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_images`
--

CREATE TABLE `room_images` (
  `image_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `image_type` enum('main','gallery') DEFAULT 'gallery',
  `image_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_inventory`
--

CREATE TABLE `room_inventory` (
  `inventory_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `unit_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., 101, 102, A1, B2',
  `floor` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('available','occupied','reserved','maintenance','out_of_order','cleaning') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `last_cleaned` timestamp NULL DEFAULT NULL,
  `last_maintenance` timestamp NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_rates`
--

CREATE TABLE `room_rates` (
  `rate_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `rate_name` varchar(100) NOT NULL,
  `rate_type` enum('base','seasonal','weekend','holiday','promotional','last_minute') DEFAULT 'base',
  `price_per_night` decimal(10,2) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `min_nights` int DEFAULT '1',
  `max_nights` int DEFAULT NULL,
  `days_of_week` varchar(50) DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `priority` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_status_log`
--

CREATE TABLE `room_status_log` (
  `log_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `previous_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` int NOT NULL COMMENT 'user_id',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_types`
--

CREATE TABLE `room_types` (
  `room_type_id` int NOT NULL,
  `homestay_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `max_people` int NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `included` varchar(255) DEFAULT NULL,
  `size_sqm` int DEFAULT NULL,
  `minibar` tinyint(1) DEFAULT '0',
  `tea_coffee_facilities` tinyint(1) DEFAULT '0',
  `wardrobe_hangers` tinyint(1) DEFAULT '0',
  `luggage_rack` tinyint(1) DEFAULT '0',
  `safe` tinyint(1) DEFAULT '0',
  `air_conditioner` tinyint(1) DEFAULT '0',
  `heater` tinyint(1) DEFAULT '0',
  `fan` tinyint(1) DEFAULT '0',
  `wifi` tinyint(1) DEFAULT '0',
  `tv` tinyint(1) DEFAULT '0',
  `speaker` tinyint(1) DEFAULT '0',
  `phone` tinyint(1) DEFAULT '0',
  `usb_charging_points` tinyint(1) DEFAULT '0',
  `power_adapters` tinyint(1) DEFAULT '0',
  `desk_workspace` tinyint(1) DEFAULT '0',
  `iron_ironing_board` tinyint(1) DEFAULT '0',
  `hairdryer` tinyint(1) DEFAULT '0',
  `towels` tinyint(1) DEFAULT '0',
  `bathrobes` tinyint(1) DEFAULT '0',
  `slippers` tinyint(1) DEFAULT '0',
  `toiletries` tinyint(1) DEFAULT '0',
  `teeth_shaving_kits` tinyint(1) DEFAULT '0',
  `table_lamps` tinyint(1) DEFAULT '0',
  `bedside_lamps` tinyint(1) DEFAULT '0',
  `alarm_clock` tinyint(1) DEFAULT '0',
  `laundry_bag` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_activity_logs`
--

CREATE TABLE `staff_activity_logs` (
  `log_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_profiles`
--

CREATE TABLE `staff_profiles` (
  `staff_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `assigned_hotel` int DEFAULT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_roles`
--

CREATE TABLE `staff_roles` (
  `role_id` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_schedules`
--

CREATE TABLE `staff_schedules` (
  `schedule_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `shift_date` date NOT NULL,
  `shift_start` time NOT NULL,
  `shift_end` time NOT NULL,
  `shift_type` enum('morning','afternoon','evening','night','full_day') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'full_day',
  `status` enum('scheduled','confirmed','completed','cancelled','no_show') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `actual_start` timestamp NULL DEFAULT NULL,
  `actual_end` timestamp NULL DEFAULT NULL,
  `break_duration` int DEFAULT '0' COMMENT 'Minutes',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_items`
--

CREATE TABLE `stock_items` (
  `item_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `reorder_level` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `movement_id` int NOT NULL,
  `item_id` int NOT NULL,
  `movement_type` enum('purchase','usage','adjustment') NOT NULL,
  `quantity` int NOT NULL,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  `total_cost` decimal(12,2) DEFAULT NULL,
  `account_id` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_suppliers`
--

CREATE TABLE `stock_suppliers` (
  `supplier_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_info` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_usage_logs`
--

CREATE TABLE `stock_usage_logs` (
  `usage_id` int NOT NULL,
  `item_id` int NOT NULL,
  `used_for` enum('room','restaurant','maintenance') NOT NULL,
  `reference_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `used_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `role` enum('admin','vendor','client') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT '0',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `failed_logins` int DEFAULT '0',
  `password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `role`, `name`, `email`, `phone`, `phone_verified`, `password_hash`, `address`, `gender`, `profile_image`, `cover_image`, `is_active`, `email_verified`, `last_login`, `failed_logins`, `password_reset_token`, `password_reset_expires`, `created_at`, `updated_at`) VALUES
(2, 'vendor', 'Vendor', 'vendor@gmail.com', '+250724718389', 0, '$2a$12$oNMCtER.Muvo30aRriUA8eaDVjDCLrpG.ezg3bKS0/htJ8cuNb8l2', '123 Main Street, Kigali', 'male', NULL, NULL, 1, 0, '2025-10-11 01:16:32', 0, NULL, NULL, '2025-09-11 13:27:52', '2025-10-11 01:16:32'),
(3, 'admin', 'Admin', 'admin@gmail.com', '+250724718389', 0, '$2a$12$iW3M/Wponox8dWrw2/1H4.beHQl0XM98ZJNDBwySwkCOfvJO.5Ciu', '123 Main Street, Kigali', 'male', NULL, NULL, 1, 0, '2025-10-04 07:19:32', 0, NULL, NULL, '2025-09-11 13:28:33', '2025-10-04 07:19:32'),
(4, 'client', 'MUGWANEZA Jules', 'client@gmail.com', '+250724718389', 0, '$2a$12$T/JcpleV8wfetsyst1h6XeH.n8pkUBFR8ptETRtZeE3WPj47x.Iwi', '123 Main Street, Kigali', 'male', NULL, NULL, 1, 0, '2025-09-15 05:45:02', 1, NULL, NULL, '2025-09-11 13:29:28', '2025-10-10 10:32:27'),
(5, 'client', 'Vendor1', 'vendor1@gmail.com', '+250724718389', 0, '$2a$12$z.HKxo.OF4V8BbHyUFg3/e75i4ku.tZbo/Ml0C8UOFVm0OjOUXFx6', '123 Main Street, Kigali', 'male', NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-09-15 05:40:20', '2025-09-15 05:40:20'),
(6, 'vendor', 'NIYOGUSHIMWA Natanael', 'nathanaelniyogushimwa@gmail.com', '+250781796824', 0, '$2a$12$VFb2QGORBleh4.B2.8LawuqmA1DM5jW2HruMB8AwWqEWExxDhyTI6', 'Kigali', 'male', NULL, NULL, 1, 0, '2025-09-20 01:02:15', 5, NULL, NULL, '2025-09-15 06:26:35', '2025-09-30 12:50:03'),
(7, 'vendor', 'IMANISHIMWE Noel', 'noel@gmail.com', '+250781721787', 0, '$2a$12$sVwXled8Ra/sCZ9O5kVT9O32zeZe1ymMyxFx/fgpHTOyDgrz5qunm', 'Kigali', 'male', NULL, NULL, 1, 0, '2025-09-30 13:10:14', 0, NULL, NULL, '2025-09-15 16:11:51', '2025-09-30 13:10:14'),
(8, 'vendor', 'MUGABO Enock', 'mugabo@gmail.com', '+25078298983', 0, '$2a$12$vUqBkNJ./Yqm6f3RIZWPkuq/aOsFuqe2tfBnPgGBZw9KNUEOy7NSy', 'Kigali', 'male', NULL, NULL, 1, 0, '2025-09-17 15:45:43', 0, NULL, NULL, '2025-09-17 15:45:43', '2025-09-17 15:45:43'),
(9, 'client', 'Test User', 'test@example.com', '+1234567890', 0, '$2a$12$H9Bp4ZBhj49yFI3zN8ZlaeZPcRqoggCG2RkNClIgQA1xkojRvzehK', '123 Test Street', 'male', NULL, NULL, 1, 0, '2025-09-28 06:16:35', 2, NULL, NULL, '2025-09-28 02:13:52', '2025-09-29 12:43:47'),
(10, 'vendor', 'Test Vendor', 'vendor@example.com', '+1234567891', 0, '$2a$12$IxuWkY5gRlFtSYOFIo7MRO82tHgabLVmAWUYMOXd7M7k2cuDTm/sq', '123 Vendor Street', 'male', NULL, NULL, 1, 0, '2025-09-28 06:16:35', 1, NULL, NULL, '2025-09-28 02:19:25', '2025-09-28 08:49:36'),
(11, 'client', 'Test Client', 'client@example.com', '+1234567892', 0, '$2a$12$ZRGuEU1yrKZBdFFsFRBnhuCLI9ZtdJQngDoQNsuebaZ41ix7o7CWu', '123 Client Street', 'female', NULL, NULL, 1, 0, '2025-09-28 06:16:35', 0, NULL, NULL, '2025-09-28 02:19:27', '2025-09-28 06:16:35'),
(12, 'vendor', 'Category Test Vendor', 'categoryvendor@example.com', '+1234567893', 0, '$2a$12$gpCPJU6PKnXmGGDuzdcw7eu.iwpzxuz99EI7uICDdvgwmLHwn0TPy', '123 Category Street', 'male', NULL, NULL, 1, 0, '2025-09-28 06:16:35', 0, NULL, NULL, '2025-09-28 03:04:52', '2025-09-28 06:16:35'),
(13, 'vendor', 'Johnson Johnson', 'john@gmail.com', '+250734567890', 0, '$2a$12$CVA.hD9ksouRCvqWNdBkxOcIObzgIWaTZRnrqBrwlcFuaPO4yG0aG', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 13:36:12', '2025-10-03 13:36:12'),
(14, 'vendor', 'John Doe', 'john.doe.test@example.com', '1234567890', 0, '$2a$12$r0/9HpRzInnx0X0F7WTv4O5VnqoyZzv3RN7BMVwlrH7ZZQAXVMvLO', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 13:37:17', '2025-10-03 13:37:17'),
(15, 'vendor', 'John Doe', 'john@example.com', '1234567890', 0, '$2a$12$61fSCsX56qmJhjB7o.2L3.7pIrFcd.F306rGHA5x8WBJguimFZEke', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 13:53:54', '2025-10-03 13:53:54'),
(16, 'vendor', 'Johnson Johnson', 'john1@gmail.com', '+250734567890', 0, '$2a$12$MQSkvA.awQ7efzR.sqP8qORA/jSDHNLMucNkXxlTwD9FzEDj2VnWG', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 13:57:34', '2025-10-03 13:57:34'),
(17, 'vendor', 'Test Vendor Admin', 'testvendor@admin.com', '1234567890', 0, '$2a$12$PPXAunK6kee8i4Drxl7SEOVIKFg0ZuYKWyabQ7Qd7U02ePAsOOlHS', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-03 14:19:43', '2025-10-03 14:19:43'),
(18, 'vendor', 'NIYO John', 'john25@gmail.com', '+250781796825', 0, '$2a$12$5W4rQksAe57bOL.y.oRcgegZB.Id.FrvcPEUMWjeuRam5sktPCMx.', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-04 11:51:08', '2025-10-04 11:51:08'),
(19, 'vendor', 'MUKUNZI Poul', 'poul@gmail.com', '+250781796828', 0, '$2a$12$9ZVB17aAXnZtCuQKHwoiT.x1UjvZJXSzqve2u8vvb7ums3pnCKW8C', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-07 18:12:05', '2025-10-07 18:12:05'),
(20, 'vendor', 'MUGABO Jaques', 'mujaques@gmail.com', '+250781796828', 0, '$2a$12$UOMKZkC/xyaenMOefMjwgeI9huUt6jn0b01XoKezG6I8C4K14YRiC', NULL, NULL, NULL, NULL, 1, 0, NULL, 0, NULL, NULL, '2025-10-07 18:48:30', '2025-10-07 18:48:30');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `session_id` int NOT NULL,
  `user_id` int NOT NULL,
  `refresh_token` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_sessions`
--

INSERT INTO `user_sessions` (`session_id`, `user_id`, `refresh_token`, `device_info`, `ip_address`, `expires_at`, `is_active`, `created_at`) VALUES
(1, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiY2xpZW50QGdtYWlsLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTc1OTc0MTAsImV4cCI6MTc1ODIwMjIxMH0.1Ifc9Zz_gs0FEMaxNxhqnEPkLyXjqlHVicRNnPiG1aw', 'PostmanRuntime/7.45.0', '::1', '2025-09-18 13:30:10', 1, '2025-09-11 13:30:10'),
(2, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3NTk5ODU1LCJleHAiOjE3NTgyMDQ2NTV9.lCt3AOhIJ7nvMeuWeHN2gXZxtTczBb3DUih6jdM-9FM', 'PostmanRuntime/7.45.0', '::1', '2025-09-18 14:10:55', 1, '2025-09-11 14:10:55'),
(3, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3NTk5OTI2LCJleHAiOjE3NTgyMDQ3MjZ9.9fTtQ427bdu2ii4fow0DdosTkxroOlTZPHNeHIkBgx0', 'PostmanRuntime/7.45.0', '::1', '2025-09-18 14:12:06', 1, '2025-09-11 14:12:06'),
(4, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc2MTI4NDAsImV4cCI6MTc1ODIxNzY0MH0.K_8Xxojg-PzOQ5KJ5ps0PSOHWCGirluOfCK0YhMDkfc', 'PostmanRuntime/7.45.0', '::1', '2025-09-18 17:47:20', 1, '2025-09-11 17:47:20'),
(5, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc3MzE5MTAsImV4cCI6MTc1ODMzNjcxMH0.nS8y_-sNBN6nuLhRKN8shP2V7kK2MQD-VP2bTa106LI', 'PostmanRuntime/7.45.0', '::1', '2025-09-20 02:51:50', 1, '2025-09-13 02:51:50'),
(6, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc4MDE3MDAsImV4cCI6MTc1ODQwNjUwMH0.AiDeiBg2ZSJADVVbM-bqb9NmMH51dK_RlVgEcdRbfHU', 'PostmanRuntime/7.46.0', '::1', '2025-09-20 22:15:00', 1, '2025-09-13 22:15:00'),
(7, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODI1NzY0LCJleHAiOjE3NTg0MzA1NjR9.5NgkasOf3Hd_ZS3gWqzcTw53ciZoZXbOQVmgPRqqoTY', 'PostmanRuntime/7.46.0', '::1', '2025-09-21 04:56:04', 1, '2025-09-14 04:56:04'),
(8, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiY2xpZW50QGdtYWlsLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTc4MzA5NjgsImV4cCI6MTc1ODQzNTc2OH0.fuTP7VXCWpSMLwpzuJYOUtKW6DtYjnV3JAW5X5mVNdA', 'PostmanRuntime/7.46.0', '::1', '2025-09-21 06:22:48', 1, '2025-09-14 06:22:48'),
(9, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODgwNjgxLCJleHAiOjE3NTg0ODU0ODF9.RAC7JcDNLQFxnUv_LK3wQbBbatv8z6NiJCAhKjQYkKg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 20:11:21', 1, '2025-09-14 20:11:21'),
(10, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODgxMDIwLCJleHAiOjE3NTg0ODU4MjB9.BH8kQytZYqD024f9_r2oEUVu2RUySGOaNa3lU8_BM-c', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 20:17:00', 1, '2025-09-14 20:17:00'),
(11, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODgxMDk3LCJleHAiOjE3NTg0ODU4OTd9.uAP1LjLgKGv6H98KK8MjrEPKl3u60JSjgbzErpSBxFQ', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 20:18:17', 1, '2025-09-14 20:18:17'),
(12, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODgxMTI0LCJleHAiOjE3NTg0ODU5MjR9.Wpmq_gwGCPGT41_VPh_r7-Zqh1vgVd49TElzBBjEjD4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 20:18:44', 1, '2025-09-14 20:18:44'),
(13, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODgxMTMzLCJleHAiOjE3NTg0ODU5MzN9.07Qqm9GQRkuUeag6g7rSOMuuN8vI9kKl0FX2sSYc9Ec', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 20:18:53', 1, '2025-09-14 20:18:53'),
(14, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODgxMzY4LCJleHAiOjE3NTg0ODYxNjh9.7Ln3Gc5rG3uTpIcgNxndcsyxKetJNjEvxlZcD4e3zTE', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 20:22:48', 1, '2025-09-14 20:22:48'),
(15, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODgyMTM4LCJleHAiOjE3NTg0ODY5Mzh9.ZSylc0Y0rw9lCNbGit53NhGLfvmTXhkoI9NBxYyPelw', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 20:35:38', 1, '2025-09-14 20:35:38'),
(16, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc4ODI5MTUsImV4cCI6MTc1ODQ4NzcxNX0.Wu27-E0GoNT-5uzA1pS1bnl7tsx1BFcgJo5XlIj07Gg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 20:48:35', 1, '2025-09-14 20:48:35'),
(17, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODg1NTc4LCJleHAiOjE3NTg0OTAzNzh9.VaBvKNxhUi1CmQ9bfeLUK6MMu9jtyOoL7kfRwnbQTNc', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 21:32:58', 1, '2025-09-14 21:32:58'),
(18, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODg2MzY5LCJleHAiOjE3NTg0OTExNjl9.FwdTdxb_gc9fh-YUT1GW1qF-hMnF-xVFpepxV8GgZ-o', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 21:46:09', 1, '2025-09-14 21:46:09'),
(19, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc4OTA4NjcsImV4cCI6MTc1ODQ5NTY2N30.g4pZz2F-YX1A-FzxbfLtLspUVi2IqHTyQq1KL93n1Wc', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 23:01:07', 1, '2025-09-14 23:01:07'),
(20, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODkxNzE0LCJleHAiOjE3NTg0OTY1MTR9.8LJMCH_5PCSxiEl7wbAgsh8s5th9GEAqH7DF3WAJ3FI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 23:15:14', 1, '2025-09-14 23:15:14'),
(21, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3ODkxOTQyLCJleHAiOjE3NTg0OTY3NDJ9.ZvJO8NqpwO6lLsI3QOyrNbAUGCvGS2-WPkGeSqQJiQs', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-21 23:19:02', 1, '2025-09-14 23:19:02'),
(22, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc4OTU3NzgsImV4cCI6MTc1ODUwMDU3OH0.yNfY4S8JJh2mJFyYJ6EF7xAC15h-oSZdMDRZd2x5lQo', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 00:22:58', 1, '2025-09-15 00:22:58'),
(23, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiY2xpZW50QGdtYWlsLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTc5MDE4MjEsImV4cCI6MTc1ODUwNjYyMX0.H2NtKpqHQdxrm2CfD2xfRXTVeCAN6q-G8wPvHxwBcTY', 'PostmanRuntime/7.46.0', '::1', '2025-09-22 02:03:41', 1, '2025-09-15 02:03:41'),
(24, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc5MDE4MzAsImV4cCI6MTc1ODUwNjYzMH0.6FwssVt6DXQxVTmZZ91n9XVlTAf2lequ9HYftU7jpkk', 'PostmanRuntime/7.46.0', '::1', '2025-09-22 02:03:50', 1, '2025-09-15 02:03:50'),
(25, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc5MTA3NjEsImV4cCI6MTc1ODUxNTU2MX0.X1GTq5dO_kSvyro64atJ8hkbmDpQXarRfMyU5GvsAFg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 04:32:41', 1, '2025-09-15 04:32:41'),
(26, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiY2xpZW50QGdtYWlsLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTc5MTUxMDIsImV4cCI6MTc1ODUxOTkwMn0.nGpY-iGu4tHvvozvp_7dhcFKXudWktQZLVX7DjCOX8g', 'PostmanRuntime/7.46.0', '::1', '2025-09-22 05:45:02', 1, '2025-09-15 05:45:02'),
(27, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoibmF0aGFuYWVsbml5b2d1c2hpbXdhQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc5MTc1OTUsImV4cCI6MTc1ODUyMjM5NX0.3AtIvor-uQRJ2r_5ZDWMmbE94kfTJbaltzrnL3aC2fM', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 06:26:35', 1, '2025-09-15 06:26:35'),
(28, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc5MjMxODUsImV4cCI6MTc1ODUyNzk4NX0.I3oq-Elklahkzk45ag2_RMpz7ed3ar2ZGj74qqoo7DM', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 07:59:45', 1, '2025-09-15 07:59:45'),
(29, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoibmF0aGFuYWVsbml5b2d1c2hpbXdhQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc5MjMyOTQsImV4cCI6MTc1ODUyODA5NH0.7WIzEV7zBzPn9xRkP-02ck-BKp2nsgFnTYhdJXSrOQ4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 08:01:34', 1, '2025-09-15 08:01:34'),
(30, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc5MjU3MDksImV4cCI6MTc1ODUzMDUwOX0.JIrGUIKa1pp6FL-Iwvf9DPZjnfwbBnN1g2-fb-PT2tI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 08:41:49', 1, '2025-09-15 08:41:49'),
(31, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc5Mjg0MDYsImV4cCI6MTc1ODUzMzIwNn0.xEiBwXvJ36eEBycnWzDuxvrO2eIg_vlsUc2NAZ3Atds', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 09:26:46', 1, '2025-09-15 09:26:46'),
(32, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTc5NDQ1ODAsImV4cCI6MTc1ODU0OTM4MH0.k1nberCja644Gi5Ep3YZ_DouRTrigXL1lXKZeXLzANU', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 13:56:20', 1, '2025-09-15 13:56:20'),
(33, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3OTUyMjcxLCJleHAiOjE3NTg1NTcwNzF9.oaJVlqmFmMQYEd7I3lmOxoeq4fsfR2Wt4qfEetz203g', 'PostmanRuntime/7.46.0', '::1', '2025-09-22 16:04:31', 1, '2025-09-15 16:04:31'),
(34, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoibm9lbEBnbWFpbC5jb20iLCJyb2xlIjoidmVuZG9yIiwiaWF0IjoxNzU3OTUyNzExLCJleHAiOjE3NTg1NTc1MTF9.dTsGNCffbJc_WoWxCT2NF6fDEAvxT4U4OS4BeCHaAKo', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-22 16:11:51', 1, '2025-09-15 16:11:51'),
(35, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoibm9lbEBnbWFpbC5jb20iLCJyb2xlIjoidmVuZG9yIiwiaWF0IjoxNzU4MDA4NjcxLCJleHAiOjE3NTg2MTM0NzF9.H8NZgGUVMr4DwMHamprxB_7Sd1saCXlDv-Ngq8E9sS4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 07:44:31', 1, '2025-09-16 07:44:31'),
(36, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMDg3MDUsImV4cCI6MTc1ODYxMzUwNX0.dPsRTorxD-8jZ5CoT9x692KiI2DspwLWY009vBbnlBY', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 07:45:05', 1, '2025-09-16 07:45:05'),
(37, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoibmF0aGFuYWVsbml5b2d1c2hpbXdhQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMTQyMDEsImV4cCI6MTc1ODYxOTAwMX0.Wrgi3rIc95nfF1DlSn2tMyPAHq1r7lTVXXFc9nu4llQ', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 09:16:41', 1, '2025-09-16 09:16:41'),
(38, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMTQ1NTksImV4cCI6MTc1ODYxOTM1OX0.4ldQaGAKoeJKRpIFf-fg-OljD4UZHO114E4XF9h7VKI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 09:22:39', 1, '2025-09-16 09:22:39'),
(39, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMTY5NDgsImV4cCI6MTc1ODYyMTc0OH0.x-t2JyFUzSKqJJQ_hGx0D_IM6zCKKs9jzXqYn85doMg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 10:02:28', 1, '2025-09-16 10:02:28'),
(40, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMTkyMTksImV4cCI6MTc1ODYyNDAxOX0._md6HiYtCcglNRRqiEqK40LSj5-aiCcuyWSRJS3v3Hg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 10:40:19', 1, '2025-09-16 10:40:19'),
(41, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU4MDI0OTA3LCJleHAiOjE3NTg2Mjk3MDd9.JpOrbFf3JJgpx6eVx-qfXLHpL8Qd5yF7_ogoBBt6gFw', 'PostmanRuntime/7.46.0', '::1', '2025-09-23 12:15:07', 1, '2025-09-16 12:15:07'),
(42, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU4MDI2MzEyLCJleHAiOjE3NTg2MzExMTJ9.r3MfLev6NHaa-YcamPBFgcjCalEfcyb99gce52FPl48', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 12:38:32', 1, '2025-09-16 12:38:32'),
(43, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMjYzNzksImV4cCI6MTc1ODYzMTE3OX0.79cAWkcGiIxrExYV9Ivuu7M5pLTpK6k9eGrY8-vCjkM', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 12:39:39', 1, '2025-09-16 12:39:39'),
(44, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMjg2MDQsImV4cCI6MTc1ODYzMzQwNH0.4iUiRZ9tnh7fzP8f-Ve7seFDo-0rckVZ4NrFUKfLQLk', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 13:16:44', 1, '2025-09-16 13:16:44'),
(45, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMjk4NDMsImV4cCI6MTc1ODYzNDY0M30.jB-fF4ZYDYR9Bt43aD5TwySshHAEOvO1eInchQxlJVw', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 13:37:23', 1, '2025-09-16 13:37:23'),
(46, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwMzAwMTYsImV4cCI6MTc1ODYzNDgxNn0.X3_O8s7WXmgKyj00e19HeYlFXx0S3g1mvtDzSy_UVgQ', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-23 13:40:16', 1, '2025-09-16 13:40:16'),
(47, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgwOTUwNjAsImV4cCI6MTc1ODY5OTg2MH0.e9SonSVFjqi1Q3bcc9iI1w1P5va6JLyLsSVlNrSFApM', 'PostmanRuntime/7.46.0', '::1', '2025-09-24 07:44:20', 1, '2025-09-17 07:44:20'),
(48, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMDg2OTcsImV4cCI6MTc1ODcxMzQ5N30.n5NvK38JIkrn5WyuS1hJ9ixNh_vWGxe5gJmoS3-9Mhc', 'PostmanRuntime/7.46.0', '::1', '2025-09-24 11:31:37', 1, '2025-09-17 11:31:37'),
(49, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMTAwNTQsImV4cCI6MTc1ODcxNDg1NH0.q6SjpfJuXC6do3nB4qKbtCl89lcYZNeL8Xa2f68-Sfk', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-24 11:54:14', 1, '2025-09-17 11:54:14'),
(50, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMTAyNjQsImV4cCI6MTc1ODcxNTA2NH0.rkvA8BwCZFOfpZw79fcIWqlULfgT7JdXbzAz3UtdRvM', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-24 11:57:44', 1, '2025-09-17 11:57:44'),
(51, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMTI0ODYsImV4cCI6MTc1ODcxNzI4Nn0.REz5bdI7ozNFEdu1K5Xj64m2J-rKtS13cqm19M0HYmA', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-24 12:34:46', 1, '2025-09-17 12:34:46'),
(52, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMTczMTIsImV4cCI6MTc1ODcyMjExMn0.Pn8SrdG6VZ5RGdaoekxc51ptjkdZZ7FZx50tQc2toeo', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-24 13:55:12', 1, '2025-09-17 13:55:12'),
(53, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMTczNzcsImV4cCI6MTc1ODcyMjE3N30.Qxi93l1XQeK-AGXRx9lPYJGvUnp0e5I7-Td9N33Aq34', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-24 13:56:17', 1, '2025-09-17 13:56:17'),
(54, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMTg1NjgsImV4cCI6MTc1ODcyMzM2OH0.xlQXGO-7P8MBhka4qhggCP0_lq6RskKI3S6LO3byqUI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-24 14:16:08', 1, '2025-09-17 14:16:08'),
(55, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMTg5MzUsImV4cCI6MTc1ODcyMzczNX0.sLN2vy3Od7yG2YATH0yk0ZetZpVjN_jfQRbOXIWKVBc', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-24 14:22:15', 1, '2025-09-17 14:22:15'),
(56, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImVtYWlsIjoibXVnYWJvQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxMjM5NDMsImV4cCI6MTc1ODcyODc0M30.2-0VeUty1_TAlaibqcJyolrFx6wPsY3zs6QNK481gZA', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-24 15:45:43', 1, '2025-09-17 15:45:43'),
(57, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgxNzQwNDUsImV4cCI6MTc1ODc3ODg0NX0.75kqbEMuKsqR7uiSoDmFAG2iFZWy2ldwfVv7Op9oAQ0', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-25 05:40:45', 1, '2025-09-18 05:40:45'),
(58, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgyNzI4NjgsImV4cCI6MTc1ODg3NzY2OH0.6mlYLKVWZAssVylbyDKoeylvl54aarbBt9Sx4siFpfw', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 09:07:48', 1, '2025-09-19 09:07:48'),
(59, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgyODM4OTYsImV4cCI6MTc1ODg4ODY5Nn0.0lbeZ0b8QNCNzHiO_FBZY3P24PbzpTpBUV6Z4Sfce78', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 12:11:36', 1, '2025-09-19 12:11:36'),
(60, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgyODQwMjksImV4cCI6MTc1ODg4ODgyOX0.2ESqZABdmxHllr98ZZcbU5sbz6GYG6SFseNbiQQx5Cg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 12:13:49', 1, '2025-09-19 12:13:49'),
(61, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU4Mjg3NTUwLCJleHAiOjE3NTg4OTIzNTB9.YtVVuln34p9TJariWkIo4sOWENUN-sRciwbKCd8KbJc', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 13:12:30', 1, '2025-09-19 13:12:30'),
(62, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgyODc1NjYsImV4cCI6MTc1ODg5MjM2Nn0.WqajLeYkkRoq4T5ZVcGV9n4FIY776HKyw1nyMYoRZ1g', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 13:12:46', 1, '2025-09-19 13:12:46'),
(63, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgyODg0MzEsImV4cCI6MTc1ODg5MzIzMX0.z7cOh1jw5uybBE0VRM-U_ycKySTy28PYskistxpxwWI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 13:27:11', 1, '2025-09-19 13:27:11'),
(64, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgyOTk5MTIsImV4cCI6MTc1ODkwNDcxMn0.BhV3tFHSLO_Jsxm2yXNo-kxJBGGpqNThVCc1iZDbXSM', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 16:38:32', 1, '2025-09-19 16:38:32'),
(65, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMDYwODMsImV4cCI6MTc1ODkxMDg4M30.-KFQA361utaDvzbOSd2E-YWqOD0a64-uCRTdKEqMTGk', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 18:21:23', 1, '2025-09-19 18:21:23'),
(66, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMTA1NDQsImV4cCI6MTc1ODkxNTM0NH0.yDTqS1Vj5AclNV0f3g1Oi4kGumMBNGwQcfOTWQcJ5K0', 'PostmanRuntime/7.46.0', '::1', '2025-09-26 19:35:44', 1, '2025-09-19 19:35:44'),
(67, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMTE0MTEsImV4cCI6MTc1ODkxNjIxMX0.6GutJ6jTXVlrp3ao_1Aq40OVEF_P_cj8u7Ut-CYLD-8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 19:50:11', 1, '2025-09-19 19:50:11'),
(68, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMTE2NDgsImV4cCI6MTc1ODkxNjQ0OH0.dhGpbmQk2_mOF1_fsap7C1n2UABvxdKdl2xQmu26hMU', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 19:54:08', 1, '2025-09-19 19:54:08'),
(69, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMTIxOTIsImV4cCI6MTc1ODkxNjk5Mn0.-61pT7WB0QvdH2QLDoCVNBSK9dK3V5zUqOOi85Be-R8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 20:03:12', 1, '2025-09-19 20:03:12'),
(70, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMjMyMDYsImV4cCI6MTc1ODkyODAwNn0.enfvrS3VDy7qu4WHezPq-ASeIriV8bVV7JlejIVlkSM', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 23:06:46', 1, '2025-09-19 23:06:46'),
(71, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMjM4MjEsImV4cCI6MTc1ODkyODYyMX0.hK3CRwsxB_FzcxNcgaxkR3gTEP4GiI2Iv5RsrqwINQU', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-26 23:17:02', 1, '2025-09-19 23:17:02'),
(72, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMjczMzIsImV4cCI6MTc1ODkzMjEzMn0.Ul2OZwhx13TkBrqFzQXVOlbhLPXnnYF8IR1GdHpcSl0', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 00:15:32', 1, '2025-09-20 00:15:32'),
(73, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoibmF0aGFuYWVsbml5b2d1c2hpbXdhQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMzAxMzUsImV4cCI6MTc1ODkzNDkzNX0.WQCjb_MfUzsgOAUJ-e2bgNzIl3A-Zq6_ndwj9DUiO8k', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 01:02:15', 1, '2025-09-20 01:02:15'),
(74, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMzAxNTMsImV4cCI6MTc1ODkzNDk1M30.JCoznFR8nsfABaReEUKDHv8qgG9MJ3sAv0Dm0FTy6ww', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 01:02:33', 1, '2025-09-20 01:02:33'),
(75, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzMzE0NjUsImV4cCI6MTc1ODkzNjI2NX0.IQap87QSNXLWYmVvS0qdpsko3637g6ysMedvWSqPnqA', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 01:24:25', 1, '2025-09-20 01:24:25'),
(76, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzNTMxMjcsImV4cCI6MTc1ODk1NzkyN30.SaMJZ7AAvfHXHAfX0NpYBc-XJT_RXL01X55oDHmCTpI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 07:25:27', 1, '2025-09-20 07:25:27'),
(77, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzNTgxNDAsImV4cCI6MTc1ODk2Mjk0MH0.PS95ETEimGj_GcHHjh8QbA1Qx7faycoFB0xdYzkzpbs', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 08:49:00', 1, '2025-09-20 08:49:00'),
(78, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzNjA2NzIsImV4cCI6MTc1ODk2NTQ3Mn0.iqTjMKz033OT9fWeFP5SZLs4wmY03EhizVVwzV6T4s8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 09:31:12', 1, '2025-09-20 09:31:12'),
(79, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzNjEyNjUsImV4cCI6MTc1ODk2NjA2NX0.9yPCDpKHje9C-pTW4EioKRnio0QRpX4pb-E-YYLDQHc', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 09:41:05', 1, '2025-09-20 09:41:05'),
(80, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzNjYwMjgsImV4cCI6MTc1ODk3MDgyOH0.G030t5J62WSs7ILkSUfvwDcilXSEAJiNIKzCIfevDHY', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 11:00:28', 1, '2025-09-20 11:00:28'),
(81, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTgzOTE3NjYsImV4cCI6MTc1ODk5NjU2Nn0.Aw2QE1fTnoYAx_TH5Bk8qVC5zZOHpMk5lVxOewItMFk', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-27 18:09:26', 1, '2025-09-20 18:09:26'),
(82, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg0NDEwMjAsImV4cCI6MTc1OTA0NTgyMH0.TsQzNkTi7twHi2Q5kZbH9RkDM8NpOTUjHQ6VhMtaaIw', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-28 07:50:20', 1, '2025-09-21 07:50:20'),
(83, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg0NDM4NTEsImV4cCI6MTc1OTA0ODY1MX0.IYA3RLVoFlM0hGs3H9Uip4qwLeW8Mswl-ZZ3x4JxPmo', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-28 08:37:31', 1, '2025-09-21 08:37:31'),
(84, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg0NDcyODgsImV4cCI6MTc1OTA1MjA4OH0.BrfpWCSbg3VB5jo8vUvtkSYNGEUpPKcuF1Eh5Cy-wBY', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-28 09:34:48', 1, '2025-09-21 09:34:48'),
(85, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg0NjU5MDQsImV4cCI6MTc1OTA3MDcwNH0.mrZbPIZzG861RQWBd0n2W0oDXPx1el6r_HbivBeS5Ho', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-28 14:45:04', 1, '2025-09-21 14:45:04'),
(86, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg0Njg5MTksImV4cCI6MTc1OTA3MzcxOX0.rTOnzsgYxzgiGSmNwhbp0dZ8cO08I0oV04ucFmk95N8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-28 15:35:19', 1, '2025-09-21 15:35:19'),
(87, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg1MjIzODEsImV4cCI6MTc1OTEyNzE4MX0.SlT-fT8POmQBRxdpw0B4cZYDcoQEcbFad3xqMQYehqA', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-29 06:26:21', 1, '2025-09-22 06:26:21'),
(88, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg1MzIwNjksImV4cCI6MTc1OTEzNjg2OX0.EjfbK2eiEtjJ02zHR0WYtv97K8yKIaDlfPYAt9YRNi8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-29 09:07:49', 1, '2025-09-22 09:07:49'),
(89, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg1NDc2NjAsImV4cCI6MTc1OTE1MjQ2MH0.PCUPihF7_Pz0YQvMXOwhMRe8qFqjnUbkqIsgKi_iHMA', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-29 13:27:40', 1, '2025-09-22 13:27:40'),
(90, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg1NTA5MzAsImV4cCI6MTc1OTE1NTczMH0.NAwuLGBsJtuNWVbb2p0mVwMdjSpNGhSCW7KG9tblgGo', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-29 14:22:10', 1, '2025-09-22 14:22:10'),
(91, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg1NTY1MjEsImV4cCI6MTc1OTE2MTMyMX0.Lkn9zdyhofXYQBDYRStfRqmYG3Hxm1JvFgy5bqyTHXI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-29 15:55:21', 1, '2025-09-22 15:55:21'),
(92, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg1OTAyOTYsImV4cCI6MTc1OTE5NTA5Nn0.uZSPytlj4lniFb3SD3MR3-n9RWknDkYpuoOwTsG_OBI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-30 01:18:16', 1, '2025-09-23 01:18:16'),
(93, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg2MTY0MzgsImV4cCI6MTc1OTIyMTIzOH0.CLQqwfLXTJ9EqDXNzKd8WkvfNCy1uYZzG0CqiC6kfhE', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-30 08:33:58', 1, '2025-09-23 08:33:58'),
(94, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg2MjExNzgsImV4cCI6MTc1OTIyNTk3OH0.Yl6MYHcoIeMmA6mcw9OVSTCK6IEZijy0iBiucJSsFCI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-09-30 09:52:58', 1, '2025-09-23 09:52:58'),
(95, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg4MzA3ODAsImV4cCI6MTc1OTQzNTU4MH0.xgaXr5YWGnkqT09EJ6hWTyu0UDCmdccyEa3z9m8cqYc', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-02 20:06:20', 1, '2025-09-25 20:06:20'),
(96, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg4OTMwODEsImV4cCI6MTc1OTQ5Nzg4MX0.LzcTY-V83Z67rKVEvctuNQy44UXpPVhsJl276t81E7Y', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-03 13:24:41', 1, '2025-09-26 13:24:41'),
(97, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg4OTMxNzQsImV4cCI6MTc1OTQ5Nzk3NH0.z9B0SGM8QC0K7WXdz-StrrHs1XmaXJdh52n11sstRQU', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-03 13:26:14', 1, '2025-09-26 13:26:14'),
(98, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg4OTUxNDQsImV4cCI6MTc1OTQ5OTk0NH0.NBjcA1NkgpSMGh1w3p5bhw7M-YCYC6JwIpo3npm74_I', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-03 13:59:04', 1, '2025-09-26 13:59:04'),
(99, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg4OTY1OTcsImV4cCI6MTc1OTUwMTM5N30.Yi-erxqB1SjZ5lRdQOvIG46Uoj2TmpZ0q6WVjeqLaLw', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-03 14:23:17', 1, '2025-09-26 14:23:17'),
(100, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg4OTg5ODUsImV4cCI6MTc1OTUwMzc4NX0.f3o_Cz9fskLvRo7RIjSeODagZ8vCU555yFv7mJU5iwk', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-03 15:03:05', 1, '2025-09-26 15:03:05'),
(101, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTg5MDAxMTYsImV4cCI6MTc1OTUwNDkxNn0.t9suP089xJPUb0m8MuVIn1cvmq8sXFmbvtVLAQMYPwA', 'PostmanRuntime/7.46.0', '::1', '2025-10-03 15:21:56', 1, '2025-09-26 15:21:56'),
(102, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMTEyNTgsImV4cCI6MTc1OTYxNjA1OH0.NzOTDqW_HaIMWWhvMJLQjVpa5T3gIkwD1JBnKZ8blWY', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-04 22:14:18', 1, '2025-09-27 22:14:18'),
(103, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjUxNjYsImV4cCI6MTc1OTYyOTk2Nn0.9xsZDh63o4RexpWxnCo-6PZX3I14k5_dSePwnD-Fq2o', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-05 02:06:06', 1, '2025-09-28 02:06:06'),
(104, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjU2MzMsImV4cCI6MTc1OTYzMDQzM30.7TCTTm10wZ3DPyicum6MH6o5qFd-JVW6s2BLmkR-9Bg', NULL, '::ffff:127.0.0.1', '2025-10-05 02:13:53', 1, '2025-09-28 02:13:53'),
(105, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjU5NjYsImV4cCI6MTc1OTYzMDc2Nn0.o3e52AjaXRFk6odU0YQEGWuvuMyFTyB0T-nxialgZSo', NULL, '::ffff:127.0.0.1', '2025-10-05 02:19:26', 1, '2025-09-28 02:19:26'),
(106, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjU5NjcsImV4cCI6MTc1OTYzMDc2N30.eFe6p5KwAU8DM6lJHpePkuj4wCagna_EKojXaQPxNBc', NULL, '::ffff:127.0.0.1', '2025-10-05 02:19:27', 1, '2025-09-28 02:19:27'),
(107, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjY1NjksImV4cCI6MTc1OTYzMTM2OX0.TqFaOuCpzdz77W-d9aCuxna0LDAbpFj0r9zs5KNO4I4', NULL, '::ffff:127.0.0.1', '2025-10-05 02:29:29', 1, '2025-09-28 02:29:29'),
(108, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjY1NzAsImV4cCI6MTc1OTYzMTM3MH0.hFyPd-AM7vvi-70u4CuSsFhJcbZKjGxu8d4NbtAUYd4', NULL, '::ffff:127.0.0.1', '2025-10-05 02:29:30', 1, '2025-09-28 02:29:30'),
(109, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjY4MTYsImV4cCI6MTc1OTYzMTYxNn0.URTjTwLxaPZUKxuEQkyZ7zpFs76kLNb6FE7I3iOlwPM', NULL, '::ffff:127.0.0.1', '2025-10-05 02:33:36', 1, '2025-09-28 02:33:36'),
(110, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjY4MTcsImV4cCI6MTc1OTYzMTYxN30.gtz_OptJ-IgKDeQluLD7lW3tfmYdZt_faxi5oVvckxs', NULL, '::ffff:127.0.0.1', '2025-10-05 02:33:37', 1, '2025-09-28 02:33:37'),
(111, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjY5MzEsImV4cCI6MTc1OTYzMTczMX0.z66ae-sHR6lK2T8bM5rGur5xn1SZHxQ3MZ-HYZrD4lo', NULL, '::ffff:127.0.0.1', '2025-10-05 02:35:31', 1, '2025-09-28 02:35:31'),
(112, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjY5MzEsImV4cCI6MTc1OTYzMTczMX0.E-k4lb9-NX_dDFtqz1_OokA5Zqyu01e8gEiYxPkTgRg', NULL, '::ffff:127.0.0.1', '2025-10-05 02:35:31', 1, '2025-09-28 02:35:31'),
(113, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjcwOTMsImV4cCI6MTc1OTYzMTg5M30.0Ky5iTwLZ051YN9p2O-N53MmiWTeUucBVWgxsIGnOc4', NULL, '::ffff:127.0.0.1', '2025-10-05 02:38:13', 1, '2025-09-28 02:38:13'),
(114, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjcwOTMsImV4cCI6MTc1OTYzMTg5M30.WYHLDr2eZxC6CPbmScLNraRC3cqWsnHEZQTL0p4QrT8', NULL, '::ffff:127.0.0.1', '2025-10-05 02:38:13', 1, '2025-09-28 02:38:13'),
(115, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjcxNzAsImV4cCI6MTc1OTYzMTk3MH0._Llp3R_xKHe7gavSWrMlAutrDMm4J8VDexirlFcXWeg', NULL, '::ffff:127.0.0.1', '2025-10-05 02:39:30', 1, '2025-09-28 02:39:30'),
(116, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjcxNzAsImV4cCI6MTc1OTYzMTk3MH0.M3npj92FUo1lrHFSYP-t-T6XNONiulpcH_5pjuvE960', NULL, '::ffff:127.0.0.1', '2025-10-05 02:39:30', 1, '2025-09-28 02:39:30'),
(117, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjcyMDEsImV4cCI6MTc1OTYzMjAwMX0.-XjqWvy8WP6WU6200iixsLzjTb_7SJNUWFFsy2KkWRw', NULL, '::ffff:127.0.0.1', '2025-10-05 02:40:01', 1, '2025-09-28 02:40:01'),
(118, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjcyMDEsImV4cCI6MTc1OTYzMjAwMX0.KmWRP8EqL860fB7HVBZLmRcsN0nZQLiyNrdU40NebF0', NULL, '::ffff:127.0.0.1', '2025-10-05 02:40:01', 1, '2025-09-28 02:40:01'),
(119, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjc0ODQsImV4cCI6MTc1OTYzMjI4NH0.0w7cI-fR4jWEZiz67XJKF-tG2M5y5bxaUSeuNK1ACZ4', NULL, '::ffff:127.0.0.1', '2025-10-05 02:44:44', 1, '2025-09-28 02:44:44'),
(120, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjc0ODUsImV4cCI6MTc1OTYzMjI4NX0.iuB7Lw-hct87GIue3zsvBWQgQRgGICILF8RnsPJ5bBA', NULL, '::ffff:127.0.0.1', '2025-10-05 02:44:45', 1, '2025-09-28 02:44:45'),
(121, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjc2NDIsImV4cCI6MTc1OTYzMjQ0Mn0.yN8jlzm3bhKUDR4EoucQXue-eHtZx8h88R5Uu_C9Rwk', NULL, '::ffff:127.0.0.1', '2025-10-05 02:47:22', 1, '2025-09-28 02:47:22'),
(122, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjc2NDMsImV4cCI6MTc1OTYzMjQ0M30.2_cu4cffv_V8UnCmR_RsIyNQO8H4dEaoHCeGCbKz9YY', NULL, '::ffff:127.0.0.1', '2025-10-05 02:47:23', 1, '2025-09-28 02:47:23'),
(123, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjg2MzQsImV4cCI6MTc1OTYzMzQzNH0.laDv9Q5NWxwNdclw5fkCixJnNbZ8J-769vJFH8jQzK0', NULL, '::ffff:127.0.0.1', '2025-10-05 03:03:54', 1, '2025-09-28 03:03:54'),
(124, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjg2MzQsImV4cCI6MTc1OTYzMzQzNH0.XSS5iHeCJ_8DZrJ0C1ngZRKKUXNNkPToXX_sRwdKd_8', NULL, '::ffff:127.0.0.1', '2025-10-05 03:03:54', 1, '2025-09-28 03:03:54'),
(125, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJlbWFpbCI6ImNhdGVnb3J5dmVuZG9yQGV4YW1wbGUuY29tIiwicm9sZSI6InZlbmRvciIsImlhdCI6MTc1OTAyODY5MywiZXhwIjoxNzU5NjMzNDkzfQ.xAJwioImZnDyXZXmzmuESSkW96-ZOvk8RoxgN_MzJ0o', NULL, '::ffff:127.0.0.1', '2025-10-05 03:04:53', 1, '2025-09-28 03:04:53'),
(126, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJlbWFpbCI6ImNhdGVnb3J5dmVuZG9yQGV4YW1wbGUuY29tIiwicm9sZSI6InZlbmRvciIsImlhdCI6MTc1OTAyODgyNywiZXhwIjoxNzU5NjMzNjI3fQ.ysdeyvDvHNJC_6hsr8UcwKmPv3CoK6VFk3FhHboTzrA', NULL, '::ffff:127.0.0.1', '2025-10-05 03:07:07', 1, '2025-09-28 03:07:07'),
(127, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjg5MDUsImV4cCI6MTc1OTYzMzcwNX0.wf9ZOAca8HMtIklyQbhpJY3zWLmB-RSqIBgoNjpb7ug', NULL, '::ffff:127.0.0.1', '2025-10-05 03:08:25', 1, '2025-09-28 03:08:25'),
(128, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjg5MDYsImV4cCI6MTc1OTYzMzcwNn0.Qutmq3f8AJVABgJ8M_lZx7zWfIuGuuUOlFXQQr679z8', NULL, '::ffff:127.0.0.1', '2025-10-05 03:08:26', 1, '2025-09-28 03:08:26'),
(129, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJlbWFpbCI6ImNhdGVnb3J5dmVuZG9yQGV4YW1wbGUuY29tIiwicm9sZSI6InZlbmRvciIsImlhdCI6MTc1OTAyOTQyNywiZXhwIjoxNzU5NjM0MjI3fQ.YMTV7j96_ClsFabSfGbGfWWfmiA3temV9gJwRViLyQk', NULL, '::ffff:127.0.0.1', '2025-10-05 03:17:07', 1, '2025-09-28 03:17:07'),
(130, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMjk3MjYsImV4cCI6MTc1OTYzNDUyNn0.waTWhte8S2ZX11Tr9LY5e2FFb6QMh8z8pCMZZT8ZVGw', NULL, '::ffff:127.0.0.1', '2025-10-05 03:22:06', 1, '2025-09-28 03:22:06'),
(131, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMjk3MjcsImV4cCI6MTc1OTYzNDUyN30.FG890rmIynOwJU12fQNUes4mi-zj0gXKfqWckXXKoDU', NULL, '::ffff:127.0.0.1', '2025-10-05 03:22:07', 1, '2025-09-28 03:22:07'),
(132, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJlbWFpbCI6ImNhdGVnb3J5dmVuZG9yQGV4YW1wbGUuY29tIiwicm9sZSI6InZlbmRvciIsImlhdCI6MTc1OTAzMzY4NCwiZXhwIjoxNzU5NjM4NDg0fQ.BktWQXziHVL1BzgzcRpt2WHpoegHo3WaC6R_7C9v4jU', NULL, '::ffff:127.0.0.1', '2025-10-05 04:28:04', 1, '2025-09-28 04:28:04'),
(133, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMzM2ODQsImV4cCI6MTc1OTYzODQ4NH0.8QqaHlhie101KGGj2VTPk3LegpU-8cidMmLMNSzTOro', NULL, '::ffff:127.0.0.1', '2025-10-05 04:28:04', 1, '2025-09-28 04:28:04'),
(134, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMzM2ODUsImV4cCI6MTc1OTYzODQ4NX0.C0JeRMcKgCgzrf8oFfMSGToUz-JMMbZm1-mtie1XlOM', NULL, '::ffff:127.0.0.1', '2025-10-05 04:28:05', 1, '2025-09-28 04:28:05'),
(135, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMzM2ODUsImV4cCI6MTc1OTYzODQ4NX0.iTpaq1B5ThrJ5530EilrjKpzoVJgKCN1KILsIOsuDAM', NULL, '::ffff:127.0.0.1', '2025-10-05 04:28:05', 1, '2025-09-28 04:28:05'),
(136, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwMzY5MDgsImV4cCI6MTc1OTY0MTcwOH0.SLCx1nkwRvrUwYi_adaz-sC0PAy1kTGS6U8wReEPsw8', NULL, '::ffff:127.0.0.1', '2025-10-05 05:21:48', 1, '2025-09-28 05:21:48'),
(137, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJlbWFpbCI6ImNhdGVnb3J5dmVuZG9yQGV4YW1wbGUuY29tIiwicm9sZSI6InZlbmRvciIsImlhdCI6MTc1OTAzNjkwOCwiZXhwIjoxNzU5NjQxNzA4fQ.Z-x1gWKeLF056CpqSH57zUJlSMzxRhzJyu5nQ4J9erw', NULL, '::ffff:127.0.0.1', '2025-10-05 05:21:48', 1, '2025-09-28 05:21:48'),
(138, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMzY5MDgsImV4cCI6MTc1OTY0MTcwOH0.vEegzzOZ-_rJui7BKEytAWk9L0Z6847g2iHCG5nY5_8', NULL, '::ffff:127.0.0.1', '2025-10-05 05:21:48', 1, '2025-09-28 05:21:48'),
(139, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwMzY5MDgsImV4cCI6MTc1OTY0MTcwOH0.HQK13rNPMlf7RHs7XWPc4MoG4xjCGa1NTtH3gJUZSFk', NULL, '::ffff:127.0.0.1', '2025-10-05 05:21:48', 1, '2025-09-28 05:21:48'),
(140, 12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJlbWFpbCI6ImNhdGVnb3J5dmVuZG9yQGV4YW1wbGUuY29tIiwicm9sZSI6InZlbmRvciIsImlhdCI6MTc1OTA0MDE5NSwiZXhwIjoxNzU5NjQ0OTk1fQ.kOOOc07RYhfnRspd3Bv7IgJokFcwYdKoqZHK5-Qjb1U', NULL, '::ffff:127.0.0.1', '2025-10-05 06:16:35', 1, '2025-09-28 06:16:35'),
(141, 10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJlbWFpbCI6InZlbmRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwNDAxOTUsImV4cCI6MTc1OTY0NDk5NX0.1u16FA7kC6CkfNNB_R_9kBRQE_iNmX_uLv1LgT97EMM', NULL, '::ffff:127.0.0.1', '2025-10-05 06:16:35', 1, '2025-09-28 06:16:35'),
(142, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwNDAxOTUsImV4cCI6MTc1OTY0NDk5NX0.60GlhH_DA1dDlNzGt4OAse8KdHPSn-yEddHPKjAkrMA', NULL, '::ffff:127.0.0.1', '2025-10-05 06:16:35', 1, '2025-09-28 06:16:35'),
(143, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImNsaWVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NTkwNDAxOTUsImV4cCI6MTc1OTY0NDk5NX0.l_pIzpsQcw4Fh501B-J5VqLJgmy9LVYYreuILBBe1MQ', NULL, '::ffff:127.0.0.1', '2025-10-05 06:16:35', 1, '2025-09-28 06:16:35'),
(144, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwNDgzODQsImV4cCI6MTc1OTY1MzE4NH0.9xY6czaf6N0Gu3deKQrRpEVOLqW9IydfarurR3NV-xo', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-05 08:33:04', 1, '2025-09-28 08:33:04'),
(145, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwNTM0NzcsImV4cCI6MTc1OTY1ODI3N30.JIAVS_zchfURscxFAHilMoi1HBHLXfkIX3rnHyRPx-s', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-05 09:57:57', 1, '2025-09-28 09:57:57'),
(146, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwNzg3OTQsImV4cCI6MTc1OTY4MzU5NH0.Q02HJTSDOTHMRv9awDcI8Go3gi9i9OmkjX1ZoINQbHw', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-05 16:59:54', 1, '2025-09-28 16:59:54');
INSERT INTO `user_sessions` (`session_id`, `user_id`, `refresh_token`, `device_info`, `ip_address`, `expires_at`, `is_active`, `created_at`) VALUES
(147, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MDgwNTQyLCJleHAiOjE3NTk2ODUzNDJ9.-eXNxFzqE7WP8hnqxI7C4nmvG93OEx1uhwdcSHOtrAs', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-05 17:29:02', 1, '2025-09-28 17:29:02'),
(148, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwOTExODIsImV4cCI6MTc1OTY5NTk4Mn0.xspFLPnNikdPrAk4zXmk6lILuf3SYsaGN1rhGFQJi3c', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-05 20:26:22', 1, '2025-09-28 20:26:22'),
(149, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkwOTEyNDIsImV4cCI6MTc1OTY5NjA0Mn0.fbVzSVbzpEGZRGbDowDKOBmCLLt8gOsl55GB0bg2_Xs', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-05 20:27:22', 1, '2025-09-28 20:27:22'),
(150, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MDkyMzI4LCJleHAiOjE3NTk2OTcxMjh9.G4aOmFHhfx19sT1m3FuhfIbyQeiaVoxwoGgLWf2nTWA', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-05 20:45:28', 1, '2025-09-28 20:45:28'),
(151, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MTI5MTQ2LCJleHAiOjE3NTk3MzM5NDZ9.UfqmhYwYJNrrUM_W8Caq5s2C8is-24O-L9P_IhMS-EU', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 06:59:06', 1, '2025-09-29 06:59:06'),
(152, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkxMjk5NjMsImV4cCI6MTc1OTczNDc2M30.rYsKhBKKH_GRhs4v6sbdRRxUUT2mkbwGiCGmHGWAGu8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 07:12:43', 1, '2025-09-29 07:12:43'),
(153, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MTM0ODc2LCJleHAiOjE3NTk3Mzk2NzZ9.VO6fIVlLmYOPNw60W82YTfty6fs4IYUMAOq37CiY-f0', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 08:34:36', 1, '2025-09-29 08:34:36'),
(154, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkxMzUxOTUsImV4cCI6MTc1OTczOTk5NX0.3vvbLNnLX_lDTx5aIQ6KdOQq2DIowp_w_xiKjlwZ0aU', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 08:39:55', 1, '2025-09-29 08:39:55'),
(155, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MTUwMDUzLCJleHAiOjE3NTk3NTQ4NTN9.Lx-10Y7ynx_G-9sjD62gXYtmbyVwow-WWPFixM4Cj2c', 'PostmanRuntime/7.48.0', '::1', '2025-10-06 12:47:33', 1, '2025-09-29 12:47:33'),
(156, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MTUwMjEyLCJleHAiOjE3NTk3NTUwMTJ9.LeDr1d-iMk44_oFTRfpMk-DTAQeI_cAKGc27GShNUSc', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 12:50:12', 1, '2025-09-29 12:50:12'),
(157, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MTUyNzI5LCJleHAiOjE3NTk3NTc1Mjl9.uLSlWt-krwhC_A4n9GOdFU-p_8RGq6a_tc4eh0OfTJM', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 13:32:09', 1, '2025-09-29 13:32:09'),
(158, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkxNjY4NzAsImV4cCI6MTc1OTc3MTY3MH0.8FPQ4XQ73eagniU58hosV_c17TZYHnh6mpBlpv5ZGco', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 17:27:50', 1, '2025-09-29 17:27:50'),
(159, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MTY4MTE2LCJleHAiOjE3NTk3NzI5MTZ9.yY9-nCRJbywwhikfWp-9nSRHr0UKtIpK5Lm7T74-wII', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 17:48:36', 1, '2025-09-29 17:48:36'),
(160, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkxNzI3MTEsImV4cCI6MTc1OTc3NzUxMX0.PKNT9Pgxo3IjpK-eFKVTfqUnU528Ic7baSCXek7u9F4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-06 19:05:11', 1, '2025-09-29 19:05:11'),
(161, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyMTAxMDEsImV4cCI6MTc1OTgxNDkwMX0.HbGAoO8Nrvt_1QIwDk_EoXSGnNcvw6ZKJkZwMPxW9NI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 05:28:21', 1, '2025-09-30 05:28:21'),
(162, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MjE1NTQ0LCJleHAiOjE3NTk4MjAzNDR9.brBHMZPyjcOVLS4KuxzKpcXhGhcevcUlXdJcnCBuoL4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 06:59:04', 1, '2025-09-30 06:59:04'),
(163, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyMjMwODIsImV4cCI6MTc1OTgyNzg4Mn0.DAOO8RZXjCOdy2oNo1Uc0297x2l152I8yyuuuilzI7A', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 09:04:42', 1, '2025-09-30 09:04:42'),
(164, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyMjk1NTEsImV4cCI6MTc1OTgzNDM1MX0.8790T3gv6JhOhsdwVZTjMDDbeC9WRbYxRZN8gvvE0s4', 'PostmanRuntime/7.48.0', '::1', '2025-10-07 10:52:31', 1, '2025-09-30 10:52:31'),
(165, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyMjk1ODUsImV4cCI6MTc1OTgzNDM4NX0.8FdJdvJwpSwPwGCxAQO_97NMZcL_2EItHn00APTEu0U', 'PostmanRuntime/7.48.0', '::1', '2025-10-07 10:53:05', 1, '2025-09-30 10:53:05'),
(166, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyMzIyMDAsImV4cCI6MTc1OTgzNzAwMH0.ECn5gKtRbWQPIiCg0fXMIchFjkq96Eb7SBAJY9zq41A', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 11:36:40', 1, '2025-09-30 11:36:40'),
(167, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyMzI0ODMsImV4cCI6MTc1OTgzNzI4M30.R0nXkLMNgzWcovZLd6FthzGLW172iMyAJ22aGpMzFyg', 'PostmanRuntime/7.48.0', '::1', '2025-10-07 11:41:23', 1, '2025-09-30 11:41:23'),
(168, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5MjM0NDU1LCJleHAiOjE3NTk4MzkyNTV9.ta6d0gO-AOtSR0qmp22kKFZ-dEYe6hHUv0l87kG30ZI', 'PostmanRuntime/7.48.0', '::1', '2025-10-07 12:14:15', 1, '2025-09-30 12:14:15'),
(169, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyMzQ3NTEsImV4cCI6MTc1OTgzOTU1MX0.2zEPK3EBTHUcy7EezN50PLOOOcTcA9e6wS-aDcd8nQw', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 12:19:11', 1, '2025-09-30 12:19:11'),
(170, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoibm9lbEBnbWFpbC5jb20iLCJyb2xlIjoidmVuZG9yIiwiaWF0IjoxNzU5MjM0OTUxLCJleHAiOjE3NTk4Mzk3NTF9.APjnIoQBKfqwFatUHFC9XzW7RpBI4bjTIDRK4RAGgRY', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 12:22:31', 1, '2025-09-30 12:22:31'),
(171, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyMzY1MjksImV4cCI6MTc1OTg0MTMyOX0.wfNbNOl0BTI7lkGCuBjbQcJnsC9kLgSduS0keoYrNPg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 12:48:49', 1, '2025-09-30 12:48:49'),
(172, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoibm9lbEBnbWFpbC5jb20iLCJyb2xlIjoidmVuZG9yIiwiaWF0IjoxNzU5MjM3ODE0LCJleHAiOjE3NTk4NDI2MTR9.tahDcSNKKeER4tzqM4x8aDvE2o3Zah6UwSHFCfeiFT8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 13:10:14', 1, '2025-09-30 13:10:14'),
(173, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyNDEzNDcsImV4cCI6MTc1OTg0NjE0N30.kqgys-zcxWtsWFTAMyPG3bFyMM-bGMFAPw1H1oIXWWk', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 14:09:07', 1, '2025-09-30 14:09:07'),
(174, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkyNDIyMjUsImV4cCI6MTc1OTg0NzAyNX0.eOZWw6tyFk3mWh3HWNJmazUM5ralEFwpH4woEhV-oM4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-07 14:23:45', 1, '2025-09-30 14:23:45'),
(175, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTkzODEyMDIsImV4cCI6MTc1OTk4NjAwMn0.qiYgKTZeWSgQPT_bYdK7T_Rg-UIESuMREPJhqdjlPko', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 05:00:02', 1, '2025-10-02 05:00:02'),
(176, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0MTY1MzAsImV4cCI6MTc2MDAyMTMzMH0.RNshdSt9btctV1H6c6E_rSSeR3tZI5MZDfsZ5kHBqUg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 14:48:50', 1, '2025-10-02 14:48:50'),
(177, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0MTg4NzcsImV4cCI6MTc2MDAyMzY3N30.CSea5CkCLVfaY4tKhcLt5cRpCgMa4A0QoqiBBfOY4-o', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 15:27:57', 1, '2025-10-02 15:27:57'),
(178, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0MjI0NzksImV4cCI6MTc2MDAyNzI3OX0.RJLiIs_vFQZMw7rbQf6INHe8E0Em84b2ac-hQRejCu8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 16:27:59', 1, '2025-10-02 16:27:59'),
(179, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5NDI1MDQ1LCJleHAiOjE3NjAwMjk4NDV9.urDM5TjNzWvhRxZdf4CFqBzfJesDa7HM8ML8o2UXUBQ', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 17:10:45', 1, '2025-10-02 17:10:45'),
(180, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0Mzk4ODUsImV4cCI6MTc2MDA0NDY4NX0.VgpoO5kNW4WGDxhXUzt_nnQ67mvalxqEWDPmW4F9C-4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 21:18:05', 1, '2025-10-02 21:18:05'),
(181, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5NDQ1NjIwLCJleHAiOjE3NjAwNTA0MjB9.eyxnepDBhIOkUmd2sjFR1davi5jbjpfVtPGYZ0T1deQ', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 22:53:40', 1, '2025-10-02 22:53:40'),
(182, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0NDY0OTIsImV4cCI6MTc2MDA1MTI5Mn0.m69TQXCznqGrwI7q6VBv2pt-UvohO0B9UTXRvgZG4Yo', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 23:08:12', 1, '2025-10-02 23:08:12'),
(183, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0NDY2MjUsImV4cCI6MTc2MDA1MTQyNX0.CN7i1irepCvp4n6PFQoofxljXS6GAjzFeiUwQHfTbq4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 23:10:25', 1, '2025-10-02 23:10:25'),
(184, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0NDgxMzEsImV4cCI6MTc2MDA1MjkzMX0.Ss3GitO-RHoTT-CXfo8LZh4OUg0MPjgaJOC-zZxJm9w', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 23:35:31', 1, '2025-10-02 23:35:31'),
(185, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5NDQ4NzA1LCJleHAiOjE3NjAwNTM1MDV9.80ZdPUp8Crdr4maksfL4W1_CXf0GxGjrD3FUBQWPNzI', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 23:45:05', 1, '2025-10-02 23:45:05'),
(186, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0NDkxNjIsImV4cCI6MTc2MDA1Mzk2Mn0.8VNyqioukJC8t6dcwL0cn7VouDSjWxsXJ97D_hAlE6c', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-09 23:52:42', 1, '2025-10-02 23:52:42'),
(187, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk0ODU4MDAsImV4cCI6MTc2MDA5MDYwMH0.eDMbudqd3ist-MU6IbX_JKLttCIH-CyIt0I8MGJV1Iw', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-10 10:03:20', 1, '2025-10-03 10:03:20'),
(188, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5NTAwNjQxLCJleHAiOjE3NjAxMDU0NDF9.fl5xyCrSioF85lxQ_2oT3PsFulEy3bDt4v3o23hBkeU', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-10 14:10:41', 1, '2025-10-03 14:10:41'),
(189, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5NTAzMjg0LCJleHAiOjE3NjAxMDgwODR9.KuKTSig-aRy232o82NF5VCDVNs2mLT4fX7Hd8Yowui8', 'PostmanRuntime/7.48.0', '::1', '2025-10-10 14:54:44', 1, '2025-10-03 14:54:44'),
(190, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5NTYyMzcyLCJleHAiOjE3NjAxNjcxNzJ9.q-d7sm26ddc57i6xqUeBrd19E4kDmWE3JikJxxzfYsU', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-11 07:19:32', 1, '2025-10-04 07:19:32'),
(191, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk1NzgxNDcsImV4cCI6MTc2MDE4Mjk0N30.C-Jz4-FSTUbBTqZkfCfREKiOrLCh4AhJQs-UmTfLcLE', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-11 11:42:27', 1, '2025-10-04 11:42:27'),
(192, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk1Nzg3NjksImV4cCI6MTc2MDE4MzU2OX0.XvvhjoD7FkYrJxtlsFPjLkKwmiwEY2I3sJYYrgHts3I', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-11 11:52:49', 1, '2025-10-04 11:52:49'),
(193, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk3NjgyNzAsImV4cCI6MTc2MDM3MzA3MH0.D7D9WmdwRb4FBtKnMKZu46b1mlnS6W1NJ7CDeKgNu7w', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-13 16:31:10', 1, '2025-10-06 16:31:10'),
(194, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk5MDg5MDAsImV4cCI6MTc2MDUxMzcwMH0.t6K50WQDZnec9M6iNmKgL2C2mxqDZxeWLL5bBxryAQ4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-15 07:35:00', 1, '2025-10-08 07:35:00'),
(195, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk5Nzg5ODAsImV4cCI6MTc2MDU4Mzc4MH0.7Q6uS752CHWjw0fwtmgK9fLOYx1cTqdyjPoz7QOBOUk', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-16 03:03:00', 1, '2025-10-09 03:03:00'),
(196, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTk5OTgwMTcsImV4cCI6MTc2MDYwMjgxN30.8qhJXZnd5FYu76quCuIt7D8G9ycsOOOCssVyQJcZQjA', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-16 08:20:17', 1, '2025-10-09 08:20:17'),
(197, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NjAwMTc5NjEsImV4cCI6MTc2MDYyMjc2MX0.LW_QWrYFx9y94hYgZNs8JcqiVJwKliVAjmlqxkKHiEM', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-16 13:52:41', 1, '2025-10-09 13:52:41'),
(198, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NjAwMTk2OTUsImV4cCI6MTc2MDYyNDQ5NX0.xdtmlLAztN--h7ujXa6WKERCjDs_zFNj_SFtJG_VRIE', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-16 14:21:35', 1, '2025-10-09 14:21:35'),
(199, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NjAwMjYzMTMsImV4cCI6MTc2MDYzMTExM30.c2_H-r5ym-4nAkUo9dNpnlCQKP0uvfDaqsNjAp_8HF8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-16 16:11:53', 1, '2025-10-09 16:11:53'),
(200, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NjAwNjUyODcsImV4cCI6MTc2MDY3MDA4N30.iANH5wZB5WlJpZWyVMC0-ahqb6dXxm-wc4iRDMUpWls', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-17 03:01:27', 1, '2025-10-10 03:01:27'),
(201, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NjAwNzc5NDMsImV4cCI6MTc2MDY4Mjc0M30.qZL5UjUxEabk97k5VtUqkDrGXVAaDjygKl_L62HRY_8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-17 06:32:23', 1, '2025-10-10 06:32:23'),
(202, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NjAwODQxMDUsImV4cCI6MTc2MDY4ODkwNX0.PCwICAtXWKfhek8Rx-bBsfCfqPgDWSvKp5_29H2BuME', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-17 08:15:05', 1, '2025-10-10 08:15:05'),
(203, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NjAwODg5NDgsImV4cCI6MTc2MDY5Mzc0OH0.nMTsfXKdbM-JpUs2LZPH8HRpg77XAINjhwc4Dww8nzY', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-17 09:35:48', 1, '2025-10-10 09:35:48'),
(204, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidmVuZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NjAxNDUzOTIsImV4cCI6MTc2MDc1MDE5Mn0._obwQD5zb70Wco28CHsypF4UiXhu5QR-5TOLv4AJwbg', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '::1', '2025-10-18 01:16:32', 1, '2025-10-11 01:16:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_audit_logs_user` (`user_id`),
  ADD KEY `idx_audit_logs_table` (`table_name`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD UNIQUE KEY `booking_reference` (`booking_reference`),
  ADD KEY `idx_bookings_user` (`user_id`),
  ADD KEY `idx_booking_reference` (`booking_reference`),
  ADD KEY `idx_booking_status` (`status`,`payment_status`);

--
-- Indexes for table `booking_charges`
--
ALTER TABLE `booking_charges`
  ADD PRIMARY KEY (`charge_id`),
  ADD KEY `idx_booking_type` (`booking_id`,`charge_type`);

--
-- Indexes for table `booking_guests`
--
ALTER TABLE `booking_guests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `idx_booking_guest` (`booking_id`,`guest_id`);

--
-- Indexes for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  ADD PRIMARY KEY (`modification_id`),
  ADD KEY `idx_booking_type` (`booking_id`,`modification_type`);

--
-- Indexes for table `external_bookings`
--
ALTER TABLE `external_bookings`
  ADD PRIMARY KEY (`external_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `financial_accounts`
--
ALTER TABLE `financial_accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `homestay_id` (`homestay_id`);

--
-- Indexes for table `financial_reports`
--
ALTER TABLE `financial_reports`
  ADD PRIMARY KEY (`report_id`);

--
-- Indexes for table `front_desk_logs`
--
ALTER TABLE `front_desk_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_booking_action` (`booking_id`,`action_type`),
  ADD KEY `idx_action_time` (`action_time`);

--
-- Indexes for table `guest_complaints`
--
ALTER TABLE `guest_complaints`
  ADD PRIMARY KEY (`complaint_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `idx_status_severity` (`status`,`severity`);

--
-- Indexes for table `guest_profiles`
--
ALTER TABLE `guest_profiles`
  ADD PRIMARY KEY (`guest_id`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_vip_loyalty` (`vip_status`,`loyalty_points`);

--
-- Indexes for table `guest_requests`
--
ALTER TABLE `guest_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `idx_booking_status` (`booking_id`,`status`),
  ADD KEY `idx_assigned` (`assigned_to`,`status`);

--
-- Indexes for table `guest_reviews`
--
ALTER TABLE `guest_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `hms_users`
--
ALTER TABLE `hms_users`
  ADD PRIMARY KEY (`hms_user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `assigned_hotel_id` (`assigned_hotel_id`);

--
-- Indexes for table `homestays`
--
ALTER TABLE `homestays`
  ADD KEY `idx_homestays_vendor` (`vendor_id`);

--
-- Indexes for table `homestay_bookings`
--
ALTER TABLE `homestay_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `homestay_images`
--
ALTER TABLE `homestay_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `homestay_id` (`homestay_id`);

--
-- Indexes for table `homestay_staff`
--
ALTER TABLE `homestay_staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_homestay_role` (`homestay_id`,`role`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `hotel_kitchen_queue`
--
ALTER TABLE `hotel_kitchen_queue`
  ADD PRIMARY KEY (`queue_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `hotel_menu`
--
ALTER TABLE `hotel_menu`
  ADD PRIMARY KEY (`menu_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `hotel_order_delivery_info`
--
ALTER TABLE `hotel_order_delivery_info`
  ADD PRIMARY KEY (`delivery_info_id`),
  ADD UNIQUE KEY `unique_booking_delivery` (`booking_id`);

--
-- Indexes for table `hotel_order_items`
--
ALTER TABLE `hotel_order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `hotel_restaurant_orders`
--
ALTER TABLE `hotel_restaurant_orders`
  ADD PRIMARY KEY (`order_id`);

--
-- Indexes for table `hotel_restaurant_tables`
--
ALTER TABLE `hotel_restaurant_tables`
  ADD PRIMARY KEY (`table_id`);

--
-- Indexes for table `housekeeping_tasks`
--
ALTER TABLE `housekeeping_tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `idx_assigned_status` (`assigned_to`,`status`),
  ADD KEY `idx_scheduled` (`scheduled_time`,`status`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_invoice_number` (`invoice_number`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`location_id`);

--
-- Indexes for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `idx_status_priority` (`status`,`priority`),
  ADD KEY `idx_assigned` (`assigned_to`);

--
-- Indexes for table `money_transactions`
--
ALTER TABLE `money_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `homestay_id` (`homestay_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `multi_room_bookings`
--
ALTER TABLE `multi_room_bookings`
  ADD PRIMARY KEY (`group_booking_id`),
  ADD KEY `room_booking_id` (`room_booking_id`),
  ADD KEY `idx_group_booking` (`booking_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notifications_user` (`user_id`),
  ADD KEY `idx_notifications_read` (`is_read`);

--
-- Indexes for table `ota_mappings`
--
ALTER TABLE `ota_mappings`
  ADD PRIMARY KEY (`mapping_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD PRIMARY KEY (`otp_id`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_purpose` (`purpose`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `idx_payment_transactions_booking` (`booking_id`),
  ADD KEY `idx_payment_transactions_status` (`status`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `rate_sync_logs`
--
ALTER TABLE `rate_sync_logs`
  ADD PRIMARY KEY (`sync_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `report_exports`
--
ALTER TABLE `report_exports`
  ADD PRIMARY KEY (`export_id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `report_logs`
--
ALTER TABLE `report_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `report_templates`
--
ALTER TABLE `report_templates`
  ADD PRIMARY KEY (`template_id`);

--
-- Indexes for table `restaurant_capacity`
--
ALTER TABLE `restaurant_capacity`
  ADD PRIMARY KEY (`capacity_id`),
  ADD UNIQUE KEY `unique_eating_out_id` (`eating_out_id`),
  ADD KEY `eating_out_id` (`eating_out_id`);

--
-- Indexes for table `restaurant_capacity_bookings`
--
ALTER TABLE `restaurant_capacity_bookings`
  ADD PRIMARY KEY (`capacity_booking_id`),
  ADD KEY `idx_restaurant_time` (`eating_out_id`,`reservation_start`,`reservation_end`),
  ADD KEY `fk_rcb_booking` (`booking_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_reviews_reference` (`reference_id`,`review_type`);

--
-- Indexes for table `room_assignments`
--
ALTER TABLE `room_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `idx_booking_inventory` (`booking_id`,`inventory_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `room_availability`
--
ALTER TABLE `room_availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `room_bookings`
--
ALTER TABLE `room_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `homestay_id` (`homestay_id`);

--
-- Indexes for table `room_images`
--
ALTER TABLE `room_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `room_inventory`
--
ALTER TABLE `room_inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD UNIQUE KEY `unique_room_unit` (`room_type_id`,`unit_number`);

--
-- Indexes for table `room_rates`
--
ALTER TABLE `room_rates`
  ADD PRIMARY KEY (`rate_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `room_status_log`
--
ALTER TABLE `room_status_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_inventory_date` (`inventory_id`,`created_at`);

--
-- Indexes for table `room_types`
--
ALTER TABLE `room_types`
  ADD PRIMARY KEY (`room_type_id`),
  ADD KEY `homestay_id` (`homestay_id`);

--
-- Indexes for table `staff_activity_logs`
--
ALTER TABLE `staff_activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD PRIMARY KEY (`staff_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `staff_roles`
--
ALTER TABLE `staff_roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `idx_staff_date` (`staff_id`,`shift_date`),
  ADD KEY `idx_date_status` (`shift_date`,`status`);

--
-- Indexes for table `stock_items`
--
ALTER TABLE `stock_items`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`movement_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `stock_suppliers`
--
ALTER TABLE `stock_suppliers`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `stock_usage_logs`
--
ALTER TABLE `stock_usage_logs`
  ADD PRIMARY KEY (`usage_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_phone_verified` (`phone_verified`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_user_sessions_user` (`user_id`),
  ADD KEY `idx_user_sessions_expires` (`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `booking_charges`
--
ALTER TABLE `booking_charges`
  MODIFY `charge_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_guests`
--
ALTER TABLE `booking_guests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  MODIFY `modification_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `external_bookings`
--
ALTER TABLE `external_bookings`
  MODIFY `external_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `financial_accounts`
--
ALTER TABLE `financial_accounts`
  MODIFY `account_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `financial_reports`
--
ALTER TABLE `financial_reports`
  MODIFY `report_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `front_desk_logs`
--
ALTER TABLE `front_desk_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `guest_complaints`
--
ALTER TABLE `guest_complaints`
  MODIFY `complaint_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guest_profiles`
--
ALTER TABLE `guest_profiles`
  MODIFY `guest_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `guest_requests`
--
ALTER TABLE `guest_requests`
  MODIFY `request_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guest_reviews`
--
ALTER TABLE `guest_reviews`
  MODIFY `review_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `homestays` (skipped due to foreign key constraints)
--
-- ALTER TABLE `homestays`
--   MODIFY `homestay_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `homestay_images`
--
ALTER TABLE `homestay_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `homestay_staff`
--
ALTER TABLE `homestay_staff`
  MODIFY `staff_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotel_kitchen_queue`
--
ALTER TABLE `hotel_kitchen_queue`
  MODIFY `queue_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotel_menu`
--
ALTER TABLE `hotel_menu`
  MODIFY `menu_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `hotel_order_delivery_info`
--
ALTER TABLE `hotel_order_delivery_info`
  MODIFY `delivery_info_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotel_order_items`
--
ALTER TABLE `hotel_order_items`
  MODIFY `order_item_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotel_restaurant_orders`
--
ALTER TABLE `hotel_restaurant_orders`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotel_restaurant_tables`
--
ALTER TABLE `hotel_restaurant_tables`
  MODIFY `table_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `housekeeping_tasks`
--
ALTER TABLE `housekeeping_tasks`
  MODIFY `task_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `location_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  MODIFY `request_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `money_transactions`
--
ALTER TABLE `money_transactions`
  MODIFY `transaction_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `multi_room_bookings`
--
ALTER TABLE `multi_room_bookings`
  MODIFY `group_booking_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ota_mappings`
--
ALTER TABLE `ota_mappings`
  MODIFY `mapping_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  MODIFY `otp_id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key for OTP verification', AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `transaction_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rate_sync_logs`
--
ALTER TABLE `rate_sync_logs`
  MODIFY `sync_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_exports`
--
ALTER TABLE `report_exports`
  MODIFY `export_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_logs`
--
ALTER TABLE `report_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_templates`
--
ALTER TABLE `report_templates`
  MODIFY `template_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `restaurant_capacity`
--
ALTER TABLE `restaurant_capacity`
  MODIFY `capacity_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `restaurant_capacity_bookings`
--
ALTER TABLE `restaurant_capacity_bookings`
  MODIFY `capacity_booking_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_assignments`
--
ALTER TABLE `room_assignments`
  MODIFY `assignment_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_availability`
--
ALTER TABLE `room_availability`
  MODIFY `availability_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_images`
--
ALTER TABLE `room_images`
  MODIFY `image_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_inventory`
--
ALTER TABLE `room_inventory`
  MODIFY `inventory_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_rates`
--
ALTER TABLE `room_rates`
  MODIFY `rate_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_status_log`
--
ALTER TABLE `room_status_log`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_types`
--
ALTER TABLE `room_types`
  MODIFY `room_type_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_activity_logs`
--
ALTER TABLE `staff_activity_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  MODIFY `staff_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_roles`
--
ALTER TABLE `staff_roles`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  MODIFY `schedule_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_items`
--
ALTER TABLE `stock_items`
  MODIFY `item_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `movement_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_suppliers`
--
ALTER TABLE `stock_suppliers`
  MODIFY `supplier_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_usage_logs`
--
ALTER TABLE `stock_usage_logs`
  MODIFY `usage_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `session_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=205;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `booking_charges`
--
ALTER TABLE `booking_charges`
  ADD CONSTRAINT `booking_charges_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_guests`
--
ALTER TABLE `booking_guests`
  ADD CONSTRAINT `booking_guests_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_guests_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`) ON DELETE CASCADE;

--
-- Constraints for table `booking_modifications`
--
ALTER TABLE `booking_modifications`
  ADD CONSTRAINT `booking_modifications_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `external_bookings`
--
ALTER TABLE `external_bookings`
  ADD CONSTRAINT `external_bookings_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `financial_accounts`
--
ALTER TABLE `financial_accounts`
  ADD CONSTRAINT `financial_accounts_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `front_desk_logs`
--
ALTER TABLE `front_desk_logs`
  ADD CONSTRAINT `front_desk_logs_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `guest_complaints`
--
ALTER TABLE `guest_complaints`
  ADD CONSTRAINT `guest_complaints_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_complaints_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`) ON DELETE SET NULL;

--
-- Constraints for table `guest_profiles`
--
ALTER TABLE `guest_profiles`
  ADD CONSTRAINT `guest_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `guest_requests`
--
ALTER TABLE `guest_requests`
  ADD CONSTRAINT `guest_requests_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_requests_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`) ON DELETE SET NULL;

--
-- Constraints for table `guest_reviews`
--
ALTER TABLE `guest_reviews`
  ADD CONSTRAINT `guest_reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  ADD CONSTRAINT `guest_reviews_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest_profiles` (`guest_id`),
  ADD CONSTRAINT `guest_reviews_ibfk_3` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`),
  ADD CONSTRAINT `guest_reviews_ibfk_4` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`);

--
-- Constraints for table `hms_users`
--
ALTER TABLE `hms_users`
  ADD CONSTRAINT `hms_users_ibfk_1` FOREIGN KEY (`assigned_hotel_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `homestays`
--
ALTER TABLE `homestays`
  ADD CONSTRAINT `homestays_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `homestay_bookings`
--
ALTER TABLE `homestay_bookings`
  ADD CONSTRAINT `homestay_bookings_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`),
  ADD CONSTRAINT `homestay_bookings_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`);

--
-- Constraints for table `homestay_images`
--
ALTER TABLE `homestay_images`
  ADD CONSTRAINT `homestay_images_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE;

--
-- Constraints for table `homestay_staff`
--
ALTER TABLE `homestay_staff`
  ADD CONSTRAINT `homestay_staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `homestay_staff_ibfk_2` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_kitchen_queue`
--
ALTER TABLE `hotel_kitchen_queue`
  ADD CONSTRAINT `hotel_kitchen_queue_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `hotel_restaurant_orders` (`order_id`);

--
-- Clean up orphaned records in hotel_menu before adding foreign key constraint
--
DELETE FROM hotel_menu 
WHERE restaurant_id NOT IN (SELECT restaurant_id FROM hotel_restaurants);

--
-- Constraints for table `hotel_menu`
--
ALTER TABLE hotel_menu
ADD CONSTRAINT fk_menu_restaurant
FOREIGN KEY (restaurant_id)
REFERENCES hotel_restaurants(restaurant_id)
ON DELETE CASCADE
ON UPDATE CASCADE;


--
-- Constraints for table `hotel_order_delivery_info`
--
ALTER TABLE `hotel_order_delivery_info`
  ADD CONSTRAINT `hotel_order_delivery_info_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_order_items`
--
ALTER TABLE `hotel_order_items`
  ADD CONSTRAINT `hotel_order_items_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_order_items_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `hotel_menu` (`menu_id`);

--
-- Constraints for table `housekeeping_tasks`
--
ALTER TABLE `housekeeping_tasks`
  ADD CONSTRAINT `housekeeping_tasks_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`);

--
-- Constraints for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD CONSTRAINT `maintenance_requests_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `money_transactions`
--
ALTER TABLE `money_transactions`
  ADD CONSTRAINT `money_transactions_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`),
  ADD CONSTRAINT `money_transactions_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`);

--
-- Constraints for table `multi_room_bookings`
--
ALTER TABLE `multi_room_bookings`
  ADD CONSTRAINT `multi_room_bookings_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `multi_room_bookings_ibfk_2` FOREIGN KEY (`room_booking_id`) REFERENCES `room_bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `ota_mappings`
--
ALTER TABLE `ota_mappings`
  ADD CONSTRAINT `ota_mappings_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`);

--
-- Constraints for table `rate_sync_logs`
--
ALTER TABLE `rate_sync_logs`
  ADD CONSTRAINT `rate_sync_logs_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `report_exports`
--
ALTER TABLE `report_exports`
  ADD CONSTRAINT `report_exports_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `report_templates` (`template_id`);

--
-- Constraints for table `report_logs`
--
ALTER TABLE `report_logs`
  ADD CONSTRAINT `report_logs_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `report_templates` (`template_id`);

--
-- Constraints for table `restaurant_capacity`
--




--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `room_assignments`
--
ALTER TABLE `room_assignments`
  ADD CONSTRAINT `room_assignments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_assignments_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `room_availability`
--
ALTER TABLE `room_availability`
  ADD CONSTRAINT `room_availability_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`);

--
-- Constraints for table `room_bookings`
--
ALTER TABLE `room_bookings`
  ADD CONSTRAINT `room_bookings_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`),
  ADD CONSTRAINT `room_bookings_ibfk_2` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `room_images`
--
ALTER TABLE `room_images`
  ADD CONSTRAINT `room_images_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `room_inventory`
--
ALTER TABLE `room_inventory`
  ADD CONSTRAINT `fk_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `room_rates`
--
ALTER TABLE `room_rates`
  ADD CONSTRAINT `room_rates_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`);

--
-- Constraints for table `room_status_log`
--
ALTER TABLE `room_status_log`
  ADD CONSTRAINT `room_status_log_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `room_inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `room_types`
--
ALTER TABLE `room_types`
  ADD CONSTRAINT `room_types_ibfk_1` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`);

--
-- Constraints for table `staff_activity_logs`
--
ALTER TABLE `staff_activity_logs`
  ADD CONSTRAINT `staff_activity_logs_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles` (`staff_id`);

--
-- Constraints for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  ADD CONSTRAINT `staff_schedules_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `homestay_staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`),
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`);

--
-- Constraints for table `stock_usage_logs`
--
ALTER TABLE `stock_usage_logs`
  ADD CONSTRAINT `stock_usage_logs_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`);

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
