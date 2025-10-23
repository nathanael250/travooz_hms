-- Fix: Make assignment_id nullable in check_in_logs table
-- This allows check-ins to work without requiring an assignment_id

ALTER TABLE `check_in_logs` 
MODIFY COLUMN `assignment_id` INT NULL;