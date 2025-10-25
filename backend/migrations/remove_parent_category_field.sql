-- ============================================
-- Remove parent_category_id field from inventory_categories
-- This simplifies category management by removing hierarchical structure
-- ============================================

-- Drop the foreign key constraint first
ALTER TABLE `inventory_categories` 
DROP FOREIGN KEY `inventory_categories_ibfk_parent`;

-- Drop the parent_category_id column
ALTER TABLE `inventory_categories` 
DROP COLUMN `parent_category_id`;

-- Final table structure should be:
-- category_id (PK)
-- category_name (UNIQUE)
-- description
-- is_active
-- created_at, updated_at (timestamps)
