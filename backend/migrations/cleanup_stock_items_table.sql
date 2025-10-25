-- ============================================
-- Clean up stock_items table
-- Keep only essential fields for stock items
-- ============================================

-- Drop foreign key constraints first
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND CONSTRAINT_NAME = 'stock_items_ibfk_category') > 0,
    'ALTER TABLE `stock_items` DROP FOREIGN KEY `stock_items_ibfk_category`',
    'SELECT "Foreign key stock_items_ibfk_category does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND CONSTRAINT_NAME = 'stock_items_ibfk_unit') > 0,
    'ALTER TABLE `stock_items` DROP FOREIGN KEY `stock_items_ibfk_unit`',
    'SELECT "Foreign key stock_items_ibfk_unit does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop redundant columns (check if they exist first)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'item_name') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `item_name`',
    'SELECT "Column item_name does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'category_id') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `category_id`',
    'SELECT "Column category_id does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'unit_id') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `unit_id`',
    'SELECT "Column unit_id does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'quantity') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `quantity`',
    'SELECT "Column quantity does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'current_stock') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `current_stock`',
    'SELECT "Column current_stock does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'reorder_level') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `reorder_level`',
    'SELECT "Column reorder_level does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'sku') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `sku`',
    'SELECT "Column sku does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'location') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `location`',
    'SELECT "Column location does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'default_supplier_id') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `default_supplier_id`',
    'SELECT "Column default_supplier_id does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'travooz_hms' 
     AND TABLE_NAME = 'stock_items' 
     AND COLUMN_NAME = 'account_id') > 0,
    'ALTER TABLE `stock_items` DROP COLUMN `account_id`',
    'SELECT "Column account_id does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename reorder_threshold to reorder_level for simplicity
ALTER TABLE `stock_items` 
CHANGE COLUMN `reorder_threshold` `reorder_level` INT DEFAULT 0;

-- Final table structure should be:
-- item_id (PK)
-- homestay_id (FK)
-- name (item name)
-- description (item description)
-- category (item category)
-- unit (unit of measurement)
-- current_quantity (current stock quantity)
-- reorder_level (minimum stock level)
-- unit_price (price per unit)
-- status (active/inactive/discontinued)
-- created_at, updated_at (timestamps)
