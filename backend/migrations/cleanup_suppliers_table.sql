-- ============================================
-- Clean up stock_suppliers table
-- Keep only essential fields for suppliers
-- ============================================

-- Drop redundant columns (check if they exist first)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_suppliers' 
     AND COLUMN_NAME = 'name') > 0,
    'ALTER TABLE `stock_suppliers` DROP COLUMN `name`',
    'SELECT "Column name does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_suppliers' 
     AND COLUMN_NAME = 'contact_info') > 0,
    'ALTER TABLE `stock_suppliers` DROP COLUMN `contact_info`',
    'SELECT "Column contact_info does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_suppliers' 
     AND COLUMN_NAME = 'email') > 0,
    'ALTER TABLE `stock_suppliers` DROP COLUMN `email`',
    'SELECT "Column email does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_suppliers' 
     AND COLUMN_NAME = 'phone') > 0,
    'ALTER TABLE `stock_suppliers` DROP COLUMN `phone`',
    'SELECT "Column phone does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_suppliers' 
     AND COLUMN_NAME = 'preferred_items') > 0,
    'ALTER TABLE `stock_suppliers` DROP COLUMN `preferred_items`',
    'SELECT "Column preferred_items does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_suppliers' 
     AND COLUMN_NAME = 'categories_supplied') > 0,
    'ALTER TABLE `stock_suppliers` DROP COLUMN `categories_supplied`',
    'SELECT "Column categories_supplied does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_suppliers' 
     AND COLUMN_NAME = 'payment_terms') > 0,
    'ALTER TABLE `stock_suppliers` DROP COLUMN `payment_terms`',
    'SELECT "Column payment_terms does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_suppliers' 
     AND COLUMN_NAME = 'is_active') > 0,
    'ALTER TABLE `stock_suppliers` DROP COLUMN `is_active`',
    'SELECT "Column is_active does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename supplier_name to name for simplicity
ALTER TABLE `stock_suppliers` 
CHANGE COLUMN `supplier_name` `name` VARCHAR(255) NOT NULL;

-- Rename contact fields for clarity
ALTER TABLE `stock_suppliers` 
CHANGE COLUMN `contact_email` `email` VARCHAR(255),
CHANGE COLUMN `contact_phone` `phone` VARCHAR(50);

-- Add TIN field for business identification
ALTER TABLE `stock_suppliers` 
ADD COLUMN `tin` VARCHAR(50) NULL AFTER `phone`,
ADD COLUMN `contact_person` VARCHAR(255) NULL AFTER `tin`,
ADD COLUMN `notes` TEXT NULL AFTER `contact_person`;

-- Add index for TIN
ALTER TABLE `stock_suppliers` 
ADD INDEX `idx_tin` (`tin`);

-- Update status enum to be more business-focused
ALTER TABLE `stock_suppliers` 
MODIFY COLUMN `status` ENUM('active', 'inactive', 'blacklisted') DEFAULT 'active';
