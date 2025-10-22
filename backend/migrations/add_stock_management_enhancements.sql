-- Migration: Stock Management Enhancements
-- Date: 2025-10-13
-- Description: Add missing fields and tables for comprehensive stock management

-- ============================================
-- 1. ALTER stock_items table
-- ============================================
ALTER TABLE `stock_items`
  ADD COLUMN `homestay_id` INT NULL AFTER `item_id`,
  ADD COLUMN `default_supplier_id` INT NULL AFTER `reorder_level`,
  ADD COLUMN `account_id` INT NULL COMMENT 'Link to financial account for expense tracking' AFTER `default_supplier_id`,
  ADD COLUMN `description` TEXT NULL AFTER `name`,
  ADD COLUMN `current_stock` INT DEFAULT 0 COMMENT 'Calculated from movements' AFTER `quantity`,
  ADD INDEX `idx_homestay` (`homestay_id`),
  ADD INDEX `idx_supplier` (`default_supplier_id`),
  ADD INDEX `idx_account` (`account_id`);

-- Add foreign keys for stock_items
ALTER TABLE `stock_items`
  ADD CONSTRAINT `stock_items_ibfk_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_items_ibfk_supplier` FOREIGN KEY (`default_supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_items_ibfk_account` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`) ON DELETE SET NULL;

-- ============================================
-- 2. ALTER stock_movements table
-- ============================================
ALTER TABLE `stock_movements`
  ADD COLUMN `homestay_id` INT NULL AFTER `item_id`,
  ADD COLUMN `staff_id` INT NULL COMMENT 'User who recorded the movement' AFTER `account_id`,
  ADD COLUMN `supplier_id` INT NULL COMMENT 'Supplier for purchase movements' AFTER `staff_id`,
  ADD COLUMN `reference` VARCHAR(100) NULL COMMENT 'Reference number or document' AFTER `supplier_id`,
  ADD COLUMN `movement_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `reference`,
  MODIFY COLUMN `movement_type` ENUM('purchase','usage','adjustment','transfer','return') NOT NULL,
  ADD INDEX `idx_homestay` (`homestay_id`),
  ADD INDEX `idx_staff` (`staff_id`),
  ADD INDEX `idx_supplier` (`supplier_id`),
  ADD INDEX `idx_movement_date` (`movement_date`);

-- Add foreign keys for stock_movements
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_ibfk_staff` FOREIGN KEY (`staff_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_movements_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`) ON DELETE SET NULL;

-- ============================================
-- 3. ALTER stock_suppliers table
-- ============================================
ALTER TABLE `stock_suppliers`
  ADD COLUMN `homestay_id` INT NULL AFTER `supplier_id`,
  ADD COLUMN `email` VARCHAR(100) NULL AFTER `contact_info`,
  ADD COLUMN `phone` VARCHAR(20) NULL AFTER `email`,
  ADD COLUMN `address` TEXT NULL AFTER `phone`,
  ADD COLUMN `preferred_items` JSON NULL COMMENT 'Array of item IDs this supplier provides' AFTER `address`,
  ADD COLUMN `payment_terms` VARCHAR(100) NULL AFTER `preferred_items`,
  ADD COLUMN `is_active` BOOLEAN DEFAULT TRUE AFTER `payment_terms`,
  ADD INDEX `idx_homestay` (`homestay_id`);

-- Add foreign key for stock_suppliers
ALTER TABLE `stock_suppliers`
  ADD CONSTRAINT `stock_suppliers_ibfk_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE;

-- ============================================
-- 4. ALTER stock_usage_logs table
-- ============================================
ALTER TABLE `stock_usage_logs`
  ADD COLUMN `homestay_id` INT NULL AFTER `item_id`,
  ADD COLUMN `linked_service_id` INT NULL COMMENT 'Link to booking, order, or maintenance request' AFTER `reference_id`,
  ADD COLUMN `department` VARCHAR(50) NULL COMMENT 'Department that used the item' AFTER `used_for`,
  ADD COLUMN `usage_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `used_by`,
  MODIFY COLUMN `used_for` ENUM('room','restaurant','maintenance','housekeeping','laundry','general') NOT NULL,
  ADD INDEX `idx_homestay` (`homestay_id`),
  ADD INDEX `idx_usage_date` (`usage_date`),
  ADD INDEX `idx_department` (`department`);

-- Add foreign keys for stock_usage_logs
ALTER TABLE `stock_usage_logs`
  ADD CONSTRAINT `stock_usage_logs_ibfk_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_usage_logs_ibfk_user` FOREIGN KEY (`used_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

-- ============================================
-- 5. CREATE stock_orders table
-- ============================================
CREATE TABLE `stock_orders` (
  `order_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `homestay_id` INT NOT NULL,
  `supplier_id` INT NOT NULL,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expected_delivery_date` DATE NULL,
  `actual_delivery_date` DATE NULL,
  `status` ENUM('draft','pending','confirmed','shipped','delivered','cancelled') DEFAULT 'draft',
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `notes` TEXT NULL,
  `created_by` INT NULL COMMENT 'User who created the order',
  `approved_by` INT NULL COMMENT 'User who approved the order',
  `received_by` INT NULL COMMENT 'User who received the delivery',
  `account_id` INT NULL COMMENT 'Financial account for this expense',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_homestay` (`homestay_id`),
  INDEX `idx_supplier` (`supplier_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_order_date` (`order_date`),
  CONSTRAINT `stock_orders_ibfk_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  CONSTRAINT `stock_orders_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`) ON DELETE RESTRICT,
  CONSTRAINT `stock_orders_ibfk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `stock_orders_ibfk_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `stock_orders_ibfk_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `stock_orders_ibfk_account` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 6. CREATE stock_order_items table
-- ============================================
CREATE TABLE `stock_order_items` (
  `order_item_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `quantity_ordered` INT NOT NULL,
  `quantity_received` INT DEFAULT 0,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(12,2) GENERATED ALWAYS AS (`quantity_ordered` * `unit_price`) STORED,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_item` (`item_id`),
  CONSTRAINT `stock_order_items_ibfk_order` FOREIGN KEY (`order_id`) REFERENCES `stock_orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `stock_order_items_ibfk_item` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 7. CREATE stock_alerts view (for dashboard)
-- ============================================
CREATE OR REPLACE VIEW `inventory_alerts` AS
SELECT
  si.item_id,
  si.name,
  si.category,
  si.unit,
  si.quantity AS current_quantity,
  si.reorder_level,
  si.homestay_id,
  h.name AS homestay_name,
  CASE
    WHEN si.quantity <= 0 THEN 'out_of_stock'
    WHEN si.quantity <= si.reorder_level THEN 'low_stock'
    WHEN si.quantity <= (si.reorder_level * 1.5) THEN 'warning'
    ELSE 'normal'
  END AS alert_status,
  ss.name AS supplier_name,
  ss.supplier_id
FROM stock_items si
LEFT JOIN homestays h ON si.homestay_id = h.homestay_id
LEFT JOIN stock_suppliers ss ON si.default_supplier_id = ss.supplier_id
WHERE si.quantity <= (si.reorder_level * 1.5)
ORDER BY alert_status, si.quantity ASC;

COMMIT;
