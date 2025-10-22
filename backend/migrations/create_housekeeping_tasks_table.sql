-- Migration: Create housekeeping_tasks table
-- Description: Tracks cleaning and maintenance tasks for rooms across homestays
-- Date: 2025-01-13

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  inventory_id INT NULL COMMENT 'Room/unit being serviced',
  task_type ENUM(
    'cleaning',
    'deep_clean',
    'linen_change',
    'maintenance',
    'inspection',
    'setup',
    'turndown_service',
    'laundry',
    'restocking'
  ) NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  
  -- Assignment tracking
  assigned_to INT NULL COMMENT 'Staff user_id',
  assigned_by INT NULL COMMENT 'Manager/system user_id',
  assignment_time DATETIME NULL,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NULL,
  
  -- Execution tracking
  start_time DATETIME NULL,
  completion_time DATETIME NULL,
  estimated_duration INT DEFAULT 30 COMMENT 'Estimated duration in minutes',
  actual_duration INT NULL COMMENT 'Actual duration in minutes',
  
  -- Notes and feedback
  notes TEXT NULL COMMENT 'Task instructions or special requirements',
  completion_notes TEXT NULL COMMENT 'Notes added upon completion',
  issues_found TEXT NULL COMMENT 'Any issues or maintenance needs discovered',
  
  -- Quality control
  quality_rating INT NULL COMMENT 'Quality rating 1-5',
  verified_by INT NULL COMMENT 'Supervisor who verified completion',
  verification_time DATETIME NULL,
  
  -- Related entities
  booking_id INT NULL COMMENT 'Related booking if task triggered by check-out',
  
  -- Recurring tasks
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50) NULL COMMENT 'daily, weekly, monthly, etc.',
  parent_task_id INT NULL COMMENT 'For recurring tasks, reference to parent',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES room_inventory(inventory_id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
  FOREIGN KEY (parent_task_id) REFERENCES housekeeping_tasks(task_id) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_homestay (homestay_id),
  INDEX idx_inventory (inventory_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_scheduled_date (scheduled_date),
  INDEX idx_priority (priority),
  INDEX idx_booking (booking_id),
  INDEX idx_status_date (status, scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add check constraint for quality rating
ALTER TABLE housekeeping_tasks 
ADD CONSTRAINT chk_quality_rating 
CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5));

-- Create view for active tasks
CREATE OR REPLACE VIEW active_housekeeping_tasks AS
SELECT 
  ht.*,
  ri.unit_number,
  ri.room_type,
  ri.floor,
  h.name AS homestay_name,
  u_assigned.name AS assigned_staff_name,
  u_assigned.email AS assigned_staff_email,
  u_assigned_by.name AS assigned_by_name
FROM housekeeping_tasks ht
LEFT JOIN room_inventory ri ON ht.inventory_id = ri.inventory_id
LEFT JOIN homestays h ON ht.homestay_id = h.homestay_id
LEFT JOIN users u_assigned ON ht.assigned_to = u_assigned.user_id
LEFT JOIN users u_assigned_by ON ht.assigned_by = u_assigned_by.user_id
WHERE ht.status NOT IN ('completed', 'cancelled')
ORDER BY 
  FIELD(ht.priority, 'urgent', 'high', 'normal', 'low'),
  ht.scheduled_date ASC,
  ht.scheduled_time ASC;

-- Create view for today's tasks
CREATE OR REPLACE VIEW todays_housekeeping_tasks AS
SELECT 
  ht.*,
  ri.unit_number,
  ri.room_type,
  h.name AS homestay_name,
  u.name AS assigned_staff_name
FROM housekeeping_tasks ht
LEFT JOIN room_inventory ri ON ht.inventory_id = ri.inventory_id
LEFT JOIN homestays h ON ht.homestay_id = h.homestay_id
LEFT JOIN users u ON ht.assigned_to = u.user_id
WHERE ht.scheduled_date = CURDATE()
  AND ht.status NOT IN ('completed', 'cancelled')
ORDER BY 
  FIELD(ht.priority, 'urgent', 'high', 'normal', 'low'),
  ht.scheduled_time ASC;

-- Insert sample data for testing (optional)
-- INSERT INTO housekeeping_tasks (
--   homestay_id, 
--   inventory_id, 
--   task_type, 
--   priority, 
--   scheduled_date,
--   notes
-- ) VALUES
-- (1, 1, 'cleaning', 'normal', CURDATE(), 'Standard room cleaning after checkout'),
-- (1, 2, 'deep_clean', 'high', CURDATE(), 'Deep cleaning required - guest reported issues'),
-- (1, 3, 'linen_change', 'normal', CURDATE() + INTERVAL 1 DAY, 'Weekly linen change');

-- Success message
SELECT 'Housekeeping tasks table created successfully!' AS message;
