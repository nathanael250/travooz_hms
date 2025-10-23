-- Migration: Link guest requests to housekeeping tasks
-- Description: Allows tracking which housekeeping task came from which guest request
-- Date: 2025-01-23

ALTER TABLE housekeeping_tasks 
ADD COLUMN guest_request_id INT NULL COMMENT 'Links to guest_request if task was created from guest request',
ADD COLUMN confirmation_status ENUM('pending', 'acknowledged', 'in_progress', 'completed') DEFAULT 'pending' COMMENT 'Track if staff has acknowledged task',
ADD COLUMN confirmed_at DATETIME NULL COMMENT 'When housekeeping staff acknowledged the task',
ADD CONSTRAINT FK_housekeeping_guest_request 
  FOREIGN KEY (guest_request_id) REFERENCES guest_requests(request_id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_guest_request_id ON housekeeping_tasks(guest_request_id);