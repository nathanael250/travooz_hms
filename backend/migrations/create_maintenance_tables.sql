-- Migration: Create maintenance management tables
-- Description: Tracks maintenance requests and asset management
-- Date: 2025-01-13

-- ============================================
-- Table: maintenance_requests
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  room_id INT NULL COMMENT 'Room/unit requiring maintenance (inventory_id)',
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category ENUM(
    'plumbing',
    'electrical',
    'hvac',
    'furniture',
    'appliance',
    'structural',
    'safety',
    'other'
  ) NOT NULL DEFAULT 'other',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold') DEFAULT 'pending',
  
  -- People involved
  reported_by INT NOT NULL COMMENT 'User who reported the issue',
  assigned_to INT NULL COMMENT 'Staff assigned to fix',
  
  -- Dates
  reported_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  scheduled_date DATETIME NULL,
  started_date DATETIME NULL,
  completed_date DATETIME NULL,
  
  -- Cost tracking
  estimated_cost DECIMAL(10, 2) NULL,
  actual_cost DECIMAL(10, 2) NULL,
  
  -- Additional info
  notes TEXT NULL,
  completion_notes TEXT NULL,
  attachments JSON NULL COMMENT 'Array of attachment URLs',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room_inventory(inventory_id) ON DELETE SET NULL,
  FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_homestay (homestay_id),
  INDEX idx_room (room_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_reported_date (reported_date),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: maintenance_assets
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_assets (
  asset_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(100) NULL COMMENT 'e.g., AC Unit, Water Heater, Elevator',
  asset_code VARCHAR(50) NULL COMMENT 'Internal tracking code',
  location VARCHAR(255) NULL COMMENT 'Where the asset is located',
  room_id INT NULL COMMENT 'If asset is in a specific room',
  
  -- Purchase & warranty
  purchase_date DATE NULL,
  purchase_cost DECIMAL(10, 2) NULL,
  warranty_expiry DATE NULL,
  supplier VARCHAR(255) NULL,
  
  -- Maintenance schedule
  last_maintenance_date DATE NULL,
  next_maintenance_date DATE NULL,
  maintenance_frequency VARCHAR(50) NULL COMMENT 'e.g., monthly, quarterly, yearly',
  
  -- Status
  status ENUM('active', 'inactive', 'retired', 'under_maintenance') DEFAULT 'active',
  condition_rating INT NULL COMMENT 'Rating 1-5',
  
  -- Additional info
  notes TEXT NULL,
  specifications JSON NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room_inventory(inventory_id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_homestay (homestay_id),
  INDEX idx_status (status),
  INDEX idx_asset_type (asset_type),
  INDEX idx_next_maintenance (next_maintenance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Views for convenience
-- ============================================

-- Active maintenance requests
CREATE OR REPLACE VIEW active_maintenance_requests AS
SELECT 
  mr.*,
  ri.unit_number,
  ri.room_type,
  h.name AS homestay_name,
  u_reported.name AS reported_by_name,
  u_reported.email AS reported_by_email,
  u_assigned.name AS assigned_to_name,
  u_assigned.phone AS assigned_to_phone
FROM maintenance_requests mr
LEFT JOIN room_inventory ri ON mr.room_id = ri.inventory_id
LEFT JOIN homestays h ON mr.homestay_id = h.homestay_id
LEFT JOIN users u_reported ON mr.reported_by = u_reported.user_id
LEFT JOIN users u_assigned ON mr.assigned_to = u_assigned.user_id
WHERE mr.status NOT IN ('completed', 'cancelled')
ORDER BY 
  FIELD(mr.priority, 'urgent', 'high', 'medium', 'low'),
  mr.reported_date DESC;

-- Assets requiring maintenance soon
CREATE OR REPLACE VIEW assets_maintenance_due AS
SELECT 
  ma.*,
  h.name AS homestay_name,
  ri.unit_number,
  DATEDIFF(ma.next_maintenance_date, CURDATE()) AS days_until_maintenance
FROM maintenance_assets ma
LEFT JOIN homestays h ON ma.homestay_id = h.homestay_id
LEFT JOIN room_inventory ri ON ma.room_id = ri.inventory_id
WHERE ma.status = 'active'
  AND ma.next_maintenance_date IS NOT NULL
  AND ma.next_maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY ma.next_maintenance_date ASC;

-- Success message
SELECT 'Maintenance tables created successfully!' AS message;
