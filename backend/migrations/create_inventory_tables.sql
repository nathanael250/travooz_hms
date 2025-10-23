-- Inventory Management System Tables
-- Created for complete stock management with purchase orders

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    item_categories TEXT, -- JSON array of categories they supply
    payment_terms VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- pieces, kg, liters, etc.
    current_quantity INT DEFAULT 0,
    reorder_threshold INT DEFAULT 10,
    max_quantity INT DEFAULT 100,
    category VARCHAR(100) NOT NULL, -- linen, toiletries, kitchen, etc.
    supplier_id INT,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    sku VARCHAR(100),
    location VARCHAR(255), -- storage location
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Inventory usage log table
CREATE TABLE IF NOT EXISTS inventory_usage_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    used_by VARCHAR(255), -- staff member or system
    used_for VARCHAR(255), -- guest_request_1023, housekeeping_task, etc.
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    homestay_id INT,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE SET NULL
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    created_by INT NOT NULL, -- hms_user_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'ordered', 'received', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    notes TEXT,
    approved_by INT, -- hms_user_id of approver
    approved_at TIMESTAMP NULL,
    received_at TIMESTAMP NULL,
    homestay_id INT NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES hms_users(hms_user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES hms_users(hms_user_id) ON DELETE SET NULL,
    FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE
);

-- Purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes TEXT,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Stock adjustments table (for manual adjustments)
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    adjustment_type ENUM('add', 'deduct', 'set') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    adjusted_by INT NOT NULL, -- hms_user_id
    adjusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    homestay_id INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (adjusted_by) REFERENCES hms_users(hms_user_id) ON DELETE CASCADE,
    FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE
);

-- Low stock alerts table
CREATE TABLE IF NOT EXISTS low_stock_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    current_quantity INT NOT NULL,
    reorder_threshold INT NOT NULL,
    alert_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    homestay_id INT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id) ON DELETE CASCADE
);

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_email, contact_phone, item_categories) VALUES
('Hotel Supplies Co.', 'orders@hotelsupplies.com', '+250-123-4567', '["linen", "toiletries", "cleaning"]'),
('Kitchen Essentials Ltd.', 'sales@kitchenessentials.com', '+250-234-5678', '["kitchen", "dining", "cleaning"]'),
('Luxury Amenities Inc.', 'info@luxuryamenities.com', '+250-345-6789', '["toiletries", "amenities", "linen"]');

-- Insert sample inventory items
INSERT INTO inventory_items (item_name, description, unit, current_quantity, reorder_threshold, max_quantity, category, supplier_id, unit_cost) VALUES
('Bath Towels', 'White cotton bath towels', 'pieces', 25, 10, 50, 'linen', 1, 15.00),
('Hand Towels', 'White cotton hand towels', 'pieces', 15, 5, 30, 'linen', 1, 8.00),
('Toilet Paper', 'Premium 2-ply toilet paper', 'rolls', 45, 20, 100, 'toiletries', 1, 2.50),
('Shampoo', 'Hotel-grade shampoo bottles', 'bottles', 30, 10, 60, 'toiletries', 3, 5.00),
('Body Soap', 'Hotel-grade body soap bars', 'bars', 40, 15, 80, 'toiletries', 3, 3.00),
('Coffee Cups', 'Ceramic coffee cups', 'pieces', 20, 8, 40, 'kitchen', 2, 12.00),
('Tea Cups', 'Ceramic tea cups', 'pieces', 18, 8, 40, 'kitchen', 2, 10.00),
('Bed Sheets', 'White cotton bed sheets', 'sets', 12, 5, 25, 'linen', 1, 25.00),
('Pillow Cases', 'White cotton pillow cases', 'pieces', 20, 10, 40, 'linen', 1, 8.00),
('Cleaning Spray', 'Multi-purpose cleaning spray', 'bottles', 8, 5, 20, 'cleaning', 1, 7.50);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_usage_log_item ON inventory_usage_log(item_id);
CREATE INDEX idx_inventory_usage_log_date ON inventory_usage_log(used_at);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_stock_adjustments_item ON stock_adjustments(item_id);
CREATE INDEX idx_low_stock_alerts_item ON low_stock_alerts(item_id);
