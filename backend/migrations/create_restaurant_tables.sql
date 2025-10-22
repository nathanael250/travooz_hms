-- Migration: Create restaurant and kitchen management tables
-- Description: Manage restaurant tables, menu, orders, and kitchen operations
-- Date: 2025-10-13

-- ============================================
-- Table: restaurant_tables
-- ============================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
  table_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  table_number VARCHAR(20) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  location VARCHAR(100) NULL COMMENT 'e.g., Indoor, Outdoor, Patio, VIP',
  status ENUM('available', 'occupied', 'reserved', 'maintenance') DEFAULT 'available',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  INDEX idx_homestay (homestay_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_table (homestay_id, table_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: menu_categories
-- ============================================
CREATE TABLE IF NOT EXISTS menu_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  INDEX idx_homestay (homestay_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: menu_items
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  category_id INT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL,
  preparation_time INT NULL COMMENT 'Preparation time in minutes',
  is_available BOOLEAN DEFAULT TRUE,
  dietary_info VARCHAR(100) NULL COMMENT 'e.g., Vegan, Gluten-Free, Vegetarian',
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES menu_categories(category_id) ON DELETE SET NULL,
  INDEX idx_homestay (homestay_id),
  INDEX idx_category (category_id),
  INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: restaurant_orders
-- ============================================
CREATE TABLE IF NOT EXISTS restaurant_orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  booking_id INT NULL,
  guest_id INT NULL,
  table_id INT NULL,
  room_id INT NULL COMMENT 'Room number for room service',
  order_number VARCHAR(50) NOT NULL,
  order_type ENUM('dine_in', 'room_service', 'takeaway') NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled') DEFAULT 'pending',
  subtotal DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) DEFAULT 0.00,
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivery_time DATETIME NULL,
  special_instructions TEXT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
  FOREIGN KEY (table_id) REFERENCES restaurant_tables(table_id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES room_inventory(inventory_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_homestay (homestay_id),
  INDEX idx_status (status),
  INDEX idx_order_type (order_type),
  INDEX idx_order_date (order_date),
  UNIQUE KEY unique_order_number (homestay_id, order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: order_items
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT NULL,
  status ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES restaurant_orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(item_id) ON DELETE RESTRICT,
  INDEX idx_order (order_id),
  INDEX idx_menu_item (menu_item_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: kitchen_queue
-- ============================================
CREATE TABLE IF NOT EXISTS kitchen_queue (
  queue_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  order_item_id INT NOT NULL,
  priority INT DEFAULT 0 COMMENT 'Higher number = higher priority',
  status ENUM('pending', 'preparing', 'ready', 'served') DEFAULT 'pending',
  assigned_chef INT NULL,
  start_time DATETIME NULL,
  completion_time DATETIME NULL,
  estimated_time INT NULL COMMENT 'Estimated time in minutes',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES restaurant_orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_chef) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_order (order_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_chef (assigned_chef)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: order_delivery_info
-- ============================================
CREATE TABLE IF NOT EXISTS order_delivery_info (
  delivery_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  delivery_type ENUM('dine_in', 'room_service', 'takeaway') NOT NULL,
  room_number VARCHAR(20) NULL,
  table_number VARCHAR(20) NULL,
  delivery_address TEXT NULL,
  delivery_status ENUM('pending', 'in_transit', 'delivered', 'failed') DEFAULT 'pending',
  delivered_by INT NULL,
  delivered_at DATETIME NULL,
  delivery_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES restaurant_orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (delivered_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_order (order_id),
  INDEX idx_status (delivery_status),
  INDEX idx_type (delivery_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Views for convenience
-- ============================================

-- Active orders view
CREATE OR REPLACE VIEW active_restaurant_orders AS
SELECT 
  ro.*,
  rt.table_number,
  rt.location AS table_location,
  ri.unit_number AS room_number,
  h.name AS homestay_name,
  u.name AS created_by_name,
  COUNT(oi.order_item_id) AS item_count
FROM restaurant_orders ro
LEFT JOIN restaurant_tables rt ON ro.table_id = rt.table_id
LEFT JOIN room_inventory ri ON ro.room_id = ri.inventory_id
LEFT JOIN homestays h ON ro.homestay_id = h.homestay_id
LEFT JOIN users u ON ro.created_by = u.user_id
LEFT JOIN order_items oi ON ro.order_id = oi.order_id
WHERE ro.status NOT IN ('completed', 'cancelled')
GROUP BY ro.order_id
ORDER BY ro.order_date DESC;

-- Kitchen queue view
CREATE OR REPLACE VIEW kitchen_queue_view AS
SELECT 
  kq.*,
  ro.order_number,
  ro.order_type,
  rt.table_number,
  ri.unit_number AS room_number,
  mi.name AS menu_item_name,
  oi.quantity,
  oi.special_instructions AS item_instructions,
  u.name AS chef_name
FROM kitchen_queue kq
INNER JOIN restaurant_orders ro ON kq.order_id = ro.order_id
INNER JOIN order_items oi ON kq.order_item_id = oi.order_item_id
INNER JOIN menu_items mi ON oi.menu_item_id = mi.item_id
LEFT JOIN restaurant_tables rt ON ro.table_id = rt.table_id
LEFT JOIN room_inventory ri ON ro.room_id = ri.inventory_id
LEFT JOIN users u ON kq.assigned_chef = u.user_id
WHERE kq.status NOT IN ('served')
ORDER BY kq.priority DESC, kq.created_at ASC;

-- Success message
SELECT 'Restaurant & Kitchen tables created successfully!' AS message;
