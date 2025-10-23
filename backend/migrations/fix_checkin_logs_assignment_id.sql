-- Fix: Make assignment_id nullable in check_in_logs table
-- This allows check-ins to work without requiring an assignment_id
-- Added inventory_id to track which room unit was actually checked in

ALTER TABLE `check_in_logs` 
MODIFY COLUMN `assignment_id` INT NULL;

-- Add inventory_id column if it doesn't exist
ALTER TABLE `check_in_logs` 
ADD COLUMN `inventory_id` INT NULL AFTER `assignment_id`;

-- Add foreign key constraint for inventory_id
ALTER TABLE `check_in_logs`
ADD CONSTRAINT fk_inventory_id FOREIGN KEY (inventory_id) 
REFERENCES room_inventory(inventory_id) ON DELETE SET NULL;