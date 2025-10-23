-- Admin Overrides Audit Table
-- Tracks all admin-level overrides and advanced actions
-- Required for compliance and audit trails

CREATE TABLE IF NOT EXISTS admin_overrides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  admin_user_id INT NOT NULL,
  override_type ENUM('rate_override', 'discount', 'waiver', 'rate_confirmation') DEFAULT 'rate_override',
  
  -- Original values before override
  original_final_amount DECIMAL(10, 2),
  original_details JSON,
  
  -- Override values
  overridden_final_amount DECIMAL(10, 2),
  difference_amount DECIMAL(10, 2),
  override_reason TEXT NOT NULL,
  
  -- Action status
  status ENUM('applied', 'pending_approval', 'rejected', 'reversed') DEFAULT 'applied',
  approval_admin_id INT,
  approval_timestamp TIMESTAMP NULL,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (approval_admin_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_booking_id (booking_id),
  INDEX idx_admin_user_id (admin_user_id),
  INDEX idx_override_type (override_type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add admin_override_id column to front_desk_logs for traceability
ALTER TABLE front_desk_logs ADD COLUMN admin_override_id INT DEFAULT NULL;
ALTER TABLE front_desk_logs ADD FOREIGN KEY (admin_override_id) REFERENCES admin_overrides(id) ON DELETE SET NULL;

-- Create index for fast lookup
ALTER TABLE front_desk_logs ADD INDEX idx_admin_override_id (admin_override_id);

-- Add rate_confirmation_status to track if admin confirmed checkout rate
ALTER TABLE bookings ADD COLUMN rate_confirmed_by INT DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN rate_confirmed_at TIMESTAMP NULL;
ALTER TABLE bookings ADD FOREIGN KEY (rate_confirmed_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS checkout_confirmations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL UNIQUE,
  confirmed_by INT NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  confirmation_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE RESTRICT,
  
  INDEX idx_booking_id (booking_id),
  INDEX idx_confirmed_by (confirmed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;