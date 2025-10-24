-- Missing Stock Management Tables Migration
-- Date: 2025-01-20
-- Description: Create missing tables for comprehensive stock management system

-- ============================================
-- 1. CREATE inventory_categories table
-- ============================================
CREATE TABLE IF NOT EXISTS `inventory_categories` (
  `category_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `parent_category_id` INT NULL COMMENT 'For hierarchical categories',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_parent_category` (`parent_category_id`),
  INDEX `idx_category_name` (`category_name`),
  CONSTRAINT `inventory_categories_ibfk_parent` FOREIGN KEY (`parent_category_id`) REFERENCES `inventory_categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 2. CREATE delivery_notes table
-- ============================================
CREATE TABLE IF NOT EXISTS `delivery_notes` (
  `delivery_note_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `delivery_number` VARCHAR(50) NOT NULL UNIQUE,
  `order_id` INT NOT NULL COMMENT 'Reference to stock_orders',
  `supplier_id` INT NOT NULL,
  `homestay_id` INT NOT NULL,
  `delivery_date` DATE NOT NULL,
  `received_by` INT NULL COMMENT 'User who received the delivery',
  `delivery_status` ENUM('partial', 'complete', 'damaged', 'rejected') DEFAULT 'complete',
  `total_items_received` INT DEFAULT 0,
  `total_items_expected` INT DEFAULT 0,
  `delivery_notes` TEXT NULL,
  `condition_notes` TEXT NULL COMMENT 'Notes about item condition',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_supplier` (`supplier_id`),
  INDEX `idx_homestay` (`homestay_id`),
  INDEX `idx_delivery_date` (`delivery_date`),
  INDEX `idx_status` (`delivery_status`),
  CONSTRAINT `delivery_notes_ibfk_order` FOREIGN KEY (`order_id`) REFERENCES `stock_orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_notes_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`) ON DELETE RESTRICT,
  CONSTRAINT `delivery_notes_ibfk_homestay` FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_notes_ibfk_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 3. CREATE delivery_note_items table
-- ============================================
CREATE TABLE IF NOT EXISTS `delivery_note_items` (
  `delivery_item_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `delivery_note_id` INT NOT NULL,
  `order_item_id` INT NOT NULL COMMENT 'Reference to stock_order_items',
  `item_id` INT NOT NULL,
  `quantity_expected` INT NOT NULL,
  `quantity_received` INT NOT NULL,
  `quantity_damaged` INT DEFAULT 0,
  `quantity_missing` INT DEFAULT 0 COMMENT 'Calculated as expected - received - damaged',
  `unit_price` DECIMAL(10,2) NOT NULL,
  `condition_status` ENUM('good', 'damaged', 'defective', 'expired') DEFAULT 'good',
  `condition_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_delivery_note` (`delivery_note_id`),
  INDEX `idx_order_item` (`order_item_id`),
  INDEX `idx_item` (`item_id`),
  CONSTRAINT `delivery_note_items_ibfk_delivery` FOREIGN KEY (`delivery_note_id`) REFERENCES `delivery_notes` (`delivery_note_id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_note_items_ibfk_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `stock_order_items` (`order_item_id`) ON DELETE RESTRICT,
  CONSTRAINT `delivery_note_items_ibfk_item` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 4. CREATE stock_cost_log table
-- ============================================
CREATE TABLE IF NOT EXISTS `stock_cost_log` (
  `cost_log_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `supplier_id` INT NULL,
  `old_unit_cost` DECIMAL(10,2) NULL,
  `new_unit_cost` DECIMAL(10,2) NOT NULL,
  `cost_change_reason` ENUM('supplier_price_change', 'market_adjustment', 'bulk_discount', 'contract_renewal', 'manual_update') NOT NULL,
  `effective_date` DATE NOT NULL,
  `notes` TEXT NULL,
  `updated_by` INT NULL COMMENT 'User who updated the cost',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_item` (`item_id`),
  INDEX `idx_supplier` (`supplier_id`),
  INDEX `idx_effective_date` (`effective_date`),
  INDEX `idx_reason` (`cost_change_reason`),
  CONSTRAINT `stock_cost_log_ibfk_item` FOREIGN KEY (`item_id`) REFERENCES `stock_items` (`item_id`) ON DELETE CASCADE,
  CONSTRAINT `stock_cost_log_ibfk_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `stock_suppliers` (`supplier_id`) ON DELETE SET NULL,
  CONSTRAINT `stock_cost_log_ibfk_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 5. CREATE stock_units table
-- ============================================
CREATE TABLE IF NOT EXISTS `stock_units` (
  `unit_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `unit_name` VARCHAR(50) NOT NULL UNIQUE,
  `unit_symbol` VARCHAR(10) NOT NULL UNIQUE,
  `unit_type` ENUM('weight', 'volume', 'length', 'area', 'count', 'time') NOT NULL,
  `base_unit_id` INT NULL COMMENT 'For conversion calculations',
  `conversion_factor` DECIMAL(10,4) DEFAULT 1.0000 COMMENT 'Factor to convert to base unit',
  `description` TEXT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_unit_type` (`unit_type`),
  INDEX `idx_base_unit` (`base_unit_id`),
  CONSTRAINT `stock_units_ibfk_base` FOREIGN KEY (`base_unit_id`) REFERENCES `stock_units` (`unit_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 6. ALTER stock_items table to add missing fields
-- ============================================

-- Add item_name column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'item_name') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `item_name` VARCHAR(255) NOT NULL AFTER `name`',
  'SELECT "Column item_name already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add unit_price column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'unit_price') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `unit_price` DECIMAL(10,2) DEFAULT 0.00 AFTER `reorder_level`',
  'SELECT "Column unit_price already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add current_quantity column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'current_quantity') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `current_quantity` INT DEFAULT 0 AFTER `quantity`',
  'SELECT "Column current_quantity already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add reorder_threshold column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'reorder_threshold') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `reorder_threshold` INT DEFAULT 0 AFTER `reorder_level`',
  'SELECT "Column reorder_threshold already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add category_id column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'category_id') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `category_id` INT NULL AFTER `category`',
  'SELECT "Column category_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add unit_id column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'unit_id') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `unit_id` INT NULL AFTER `unit`',
  'SELECT "Column unit_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add sku column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'sku') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `sku` VARCHAR(100) NULL AFTER `unit_price`',
  'SELECT "Column sku already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add location column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'location') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `location` VARCHAR(255) NULL AFTER `sku`',
  'SELECT "Column location already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND column_name = 'status') = 0,
  'ALTER TABLE `stock_items` ADD COLUMN `status` ENUM(\'active\', \'inactive\', \'discontinued\') DEFAULT \'active\' AFTER `location`',
  'SELECT "Column status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes (if they don't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND index_name = 'idx_category_id') = 0,
  'ALTER TABLE `stock_items` ADD INDEX `idx_category_id` (`category_id`)',
  'SELECT "Index idx_category_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND index_name = 'idx_unit_id') = 0,
  'ALTER TABLE `stock_items` ADD INDEX `idx_unit_id` (`unit_id`)',
  'SELECT "Index idx_unit_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND index_name = 'idx_status') = 0,
  'ALTER TABLE `stock_items` ADD INDEX `idx_status` (`status`)',
  'SELECT "Index idx_status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraints (if they don't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND constraint_name = 'stock_items_ibfk_category') = 0,
  'ALTER TABLE `stock_items` ADD CONSTRAINT `stock_items_ibfk_category` FOREIGN KEY (`category_id`) REFERENCES `inventory_categories` (`category_id`) ON DELETE SET NULL',
  'SELECT "Constraint stock_items_ibfk_category already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
   WHERE table_name = 'stock_items' 
   AND table_schema = DATABASE() 
   AND constraint_name = 'stock_items_ibfk_unit') = 0,
  'ALTER TABLE `stock_items` ADD CONSTRAINT `stock_items_ibfk_unit` FOREIGN KEY (`unit_id`) REFERENCES `stock_units` (`unit_id`) ON DELETE SET NULL',
  'SELECT "Constraint stock_items_ibfk_unit already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 7. ALTER stock_suppliers table to add missing fields
-- ============================================

-- Add supplier_name column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_suppliers' 
   AND table_schema = DATABASE() 
   AND column_name = 'supplier_name') = 0,
  'ALTER TABLE `stock_suppliers` ADD COLUMN `supplier_name` VARCHAR(255) NOT NULL AFTER `name`',
  'SELECT "Column supplier_name already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add contact_email column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_suppliers' 
   AND table_schema = DATABASE() 
   AND column_name = 'contact_email') = 0,
  'ALTER TABLE `stock_suppliers` ADD COLUMN `contact_email` VARCHAR(255) NULL AFTER `email`',
  'SELECT "Column contact_email already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add contact_phone column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_suppliers' 
   AND table_schema = DATABASE() 
   AND column_name = 'contact_phone') = 0,
  'ALTER TABLE `stock_suppliers` ADD COLUMN `contact_phone` VARCHAR(50) NULL AFTER `phone`',
  'SELECT "Column contact_phone already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add categories_supplied column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_suppliers' 
   AND table_schema = DATABASE() 
   AND column_name = 'categories_supplied') = 0,
  'ALTER TABLE `stock_suppliers` ADD COLUMN `categories_supplied` JSON NULL COMMENT \'Array of category IDs this supplier provides\' AFTER `preferred_items`',
  'SELECT "Column categories_supplied already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status column (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'stock_suppliers' 
   AND table_schema = DATABASE() 
   AND column_name = 'status') = 0,
  'ALTER TABLE `stock_suppliers` ADD COLUMN `status` ENUM(\'active\', \'inactive\', \'suspended\') DEFAULT \'active\' AFTER `is_active`',
  'SELECT "Column status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status index (if it doesn't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_name = 'stock_suppliers' 
   AND table_schema = DATABASE() 
   AND index_name = 'idx_status') = 0,
  'ALTER TABLE `stock_suppliers` ADD INDEX `idx_status` (`status`)',
  'SELECT "Index idx_status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 8. INSERT default categories
-- ============================================
INSERT IGNORE INTO `inventory_categories` (`category_name`, `description`) VALUES
('Linen', 'Bed sheets, towels, pillowcases, etc.'),
('Toiletries', 'Shampoo, soap, toilet paper, etc.'),
('Kitchen', 'Cups, plates, utensils, etc.'),
('Cleaning', 'Cleaning supplies and equipment'),
('Maintenance', 'Tools and maintenance supplies'),
('Amenities', 'Guest amenities and extras'),
('Food & Beverage', 'Food items and beverages'),
('Office Supplies', 'Stationery and office materials'),
('Safety', 'Safety equipment and supplies'),
('Other', 'Miscellaneous items');

-- ============================================
-- 9. INSERT default units
-- ============================================
INSERT IGNORE INTO `stock_units` (`unit_name`, `unit_symbol`, `unit_type`, `description`) VALUES
-- Count units
('Piece', 'pcs', 'count', 'Individual items'),
('Set', 'set', 'count', 'Complete set of items'),
('Pair', 'pair', 'count', 'Two items together'),
('Dozen', 'doz', 'count', '12 pieces'),
('Box', 'box', 'count', 'Items in a box'),
('Pack', 'pack', 'count', 'Items in a pack'),

-- Weight units
('Kilogram', 'kg', 'weight', 'Metric weight unit'),
('Gram', 'g', 'weight', 'Small weight unit'),
('Pound', 'lb', 'weight', 'Imperial weight unit'),

-- Volume units
('Liter', 'L', 'volume', 'Metric volume unit'),
('Milliliter', 'ml', 'volume', 'Small volume unit'),
('Gallon', 'gal', 'volume', 'Imperial volume unit'),

-- Length units
('Meter', 'm', 'length', 'Metric length unit'),
('Centimeter', 'cm', 'length', 'Small length unit'),
('Foot', 'ft', 'length', 'Imperial length unit'),

-- Area units
('Square Meter', 'm²', 'area', 'Metric area unit'),
('Square Foot', 'ft²', 'area', 'Imperial area unit');

-- ============================================
-- 10. CREATE views for reporting
-- ============================================

-- Stock value view
CREATE OR REPLACE VIEW `stock_value_summary` AS
SELECT 
  si.item_id,
  si.item_name,
  si.category,
  si.current_quantity,
  si.unit_price,
  (si.current_quantity * si.unit_price) AS total_value,
  si.homestay_id,
  h.name AS homestay_name,
  ic.category_name,
  su.unit_name,
  su.unit_symbol
FROM stock_items si
LEFT JOIN homestays h ON si.homestay_id = h.homestay_id
LEFT JOIN inventory_categories ic ON si.category_id = ic.category_id
LEFT JOIN stock_units su ON si.unit_id = su.unit_id
WHERE si.status = 'active';

-- Low stock alerts view
CREATE OR REPLACE VIEW `low_stock_alerts` AS
SELECT 
  si.item_id,
  si.item_name,
  si.current_quantity,
  si.reorder_threshold,
  si.unit_price,
  si.homestay_id,
  h.name AS homestay_name,
  ss.supplier_name,
  ss.contact_email,
  ss.contact_phone,
  CASE
    WHEN si.current_quantity <= 0 THEN 'out_of_stock'
    WHEN si.current_quantity <= si.reorder_threshold THEN 'low_stock'
    WHEN si.current_quantity <= (si.reorder_threshold * 1.5) THEN 'warning'
    ELSE 'normal'
  END AS alert_level
FROM stock_items si
LEFT JOIN homestays h ON si.homestay_id = h.homestay_id
LEFT JOIN stock_suppliers ss ON si.default_supplier_id = ss.supplier_id
WHERE si.status = 'active' AND si.current_quantity <= (si.reorder_threshold * 1.5)
ORDER BY alert_level, si.current_quantity ASC;

-- Supplier performance view
CREATE OR REPLACE VIEW `supplier_performance` AS
SELECT 
  ss.supplier_id,
  ss.supplier_name,
  ss.contact_email,
  ss.contact_phone,
  COUNT(DISTINCT so.order_id) AS total_orders,
  SUM(so.total_amount) AS total_purchase_value,
  AVG(so.total_amount) AS avg_order_value,
  COUNT(DISTINCT CASE WHEN so.status = 'delivered' THEN so.order_id END) AS completed_orders,
  COUNT(DISTINCT CASE WHEN so.status = 'cancelled' THEN so.order_id END) AS cancelled_orders,
  ROUND(
    (COUNT(DISTINCT CASE WHEN so.status = 'delivered' THEN so.order_id END) * 100.0) / 
    NULLIF(COUNT(DISTINCT so.order_id), 0), 2
  ) AS delivery_success_rate
FROM stock_suppliers ss
LEFT JOIN stock_orders so ON ss.supplier_id = so.supplier_id
WHERE ss.status = 'active'
GROUP BY ss.supplier_id, ss.supplier_name, ss.contact_email, ss.contact_phone;

COMMIT;
