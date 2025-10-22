-- Migration: Create laundry management tables
-- Description: Complete laundry service management system for tracking requests, items, pricing, and status logs
-- Date: 2025-01-13

-- Table 1: Laundry Pricing
CREATE TABLE IF NOT EXISTS laundry_pricing (
  pricing_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  item_type VARCHAR(100) NOT NULL COMMENT 'e.g., shirt, pants, bedsheet, towel',
  service_type ENUM('wash', 'dry_clean', 'iron', 'wash_iron', 'dry_clean_iron') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  
  INDEX idx_homestay (homestay_id),
  INDEX idx_active (is_active),
  UNIQUE KEY unique_pricing (homestay_id, item_type, service_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: Laundry Requests
CREATE TABLE IF NOT EXISTS laundry_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  booking_id INT NULL,
  guest_id INT NULL,
  room_id INT NULL COMMENT 'inventory_id from room_inventory',
  request_date DATE NOT NULL,
  pickup_time DATETIME NULL,
  delivery_time DATETIME NULL,
  status ENUM(
    'pending',
    'picked_up',
    'washing',
    'drying',
    'ironing',
    'ready',
    'delivered',
    'cancelled'
  ) DEFAULT 'pending',
  total_amount DECIMAL(10, 2) DEFAULT 0.00,
  special_instructions TEXT NULL,
  
  -- Staff tracking
  picked_up_by INT NULL COMMENT 'Staff user_id',
  delivered_by INT NULL COMMENT 'Staff user_id',
  
  -- Payment tracking
  payment_status ENUM('pending', 'paid', 'billed_to_room') DEFAULT 'pending',
  payment_method VARCHAR(50) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
  FOREIGN KEY (guest_id) REFERENCES guest_profiles(guest_id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES room_inventory(inventory_id) ON DELETE SET NULL,
  FOREIGN KEY (picked_up_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (delivered_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_homestay (homestay_id),
  INDEX idx_booking (booking_id),
  INDEX idx_guest (guest_id),
  INDEX idx_room (room_id),
  INDEX idx_status (status),
  INDEX idx_request_date (request_date),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: Laundry Items
CREATE TABLE IF NOT EXISTS laundry_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  laundry_request_id INT NOT NULL,
  item_type VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  service_type ENUM('wash', 'dry_clean', 'iron', 'wash_iron', 'dry_clean_iron') NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT NULL,
  status ENUM('pending', 'processing', 'completed', 'damaged') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (laundry_request_id) REFERENCES laundry_requests(request_id) ON DELETE CASCADE,
  
  INDEX idx_request (laundry_request_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: Laundry Status Log
CREATE TABLE IF NOT EXISTS laundry_status_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  laundry_request_id INT NOT NULL,
  status ENUM(
    'pending',
    'picked_up',
    'washing',
    'drying',
    'ironing',
    'ready',
    'delivered',
    'cancelled'
  ) NOT NULL,
  changed_by INT NULL COMMENT 'Staff user_id who changed status',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT NULL,
  
  FOREIGN KEY (laundry_request_id) REFERENCES laundry_requests(request_id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_request (laundry_request_id),
  INDEX idx_status (status),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create trigger to update total_amount when items are added/updated
DELIMITER $$

CREATE TRIGGER update_laundry_request_total_after_insert
AFTER INSERT ON laundry_items
FOR EACH ROW
BEGIN
  UPDATE laundry_requests
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM laundry_items
    WHERE laundry_request_id = NEW.laundry_request_id
  )
  WHERE request_id = NEW.laundry_request_id;
END$$

CREATE TRIGGER update_laundry_request_total_after_update
AFTER UPDATE ON laundry_items
FOR EACH ROW
BEGIN
  UPDATE laundry_requests
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM laundry_items
    WHERE laundry_request_id = NEW.laundry_request_id
  )
  WHERE request_id = NEW.laundry_request_id;
END$$

CREATE TRIGGER update_laundry_request_total_after_delete
AFTER DELETE ON laundry_items
FOR EACH ROW
BEGIN
  UPDATE laundry_requests
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM laundry_items
    WHERE laundry_request_id = OLD.laundry_request_id
  )
  WHERE request_id = OLD.laundry_request_id;
END$$

-- Create trigger to log status changes
CREATE TRIGGER log_laundry_status_change
AFTER UPDATE ON laundry_requests
FOR EACH ROW
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO laundry_status_log (laundry_request_id, status, notes)
    VALUES (NEW.request_id, NEW.status, CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
  END IF;
END$$

DELIMITER ;

-- Create views for reporting
CREATE OR REPLACE VIEW active_laundry_requests AS
SELECT 
  lr.*,
  h.name AS homestay_name,
  gp.first_name AS guest_first_name,
  gp.last_name AS guest_last_name,
  gp.email AS guest_email,
  ri.unit_number AS room_number,
  u_picked.name AS picked_up_by_name,
  u_delivered.name AS delivered_by_name,
  COUNT(li.item_id) AS total_items,
  SUM(li.quantity) AS total_quantity
FROM laundry_requests lr
LEFT JOIN homestays h ON lr.homestay_id = h.homestay_id
LEFT JOIN guest_profiles gp ON lr.guest_id = gp.guest_id
LEFT JOIN room_inventory ri ON lr.room_id = ri.inventory_id
LEFT JOIN users u_picked ON lr.picked_up_by = u_picked.user_id
LEFT JOIN users u_delivered ON lr.delivered_by = u_delivered.user_id
LEFT JOIN laundry_items li ON lr.request_id = li.laundry_request_id
WHERE lr.status NOT IN ('delivered', 'cancelled')
GROUP BY lr.request_id
ORDER BY lr.request_date DESC, lr.request_id DESC;

-- Insert sample pricing data (optional)
-- INSERT INTO laundry_pricing (homestay_id, item_type, service_type, price) VALUES
-- (1, 'Shirt', 'wash', 50.00),
-- (1, 'Shirt', 'dry_clean', 100.00),
-- (1, 'Shirt', 'iron', 30.00),
-- (1, 'Pants', 'wash', 60.00),
-- (1, 'Pants', 'dry_clean', 120.00),
-- (1, 'Bedsheet', 'wash', 150.00),
-- (1, 'Towel', 'wash', 40.00);

SELECT 'Laundry management tables created successfully!' AS message;
