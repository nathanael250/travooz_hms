# Stock Management Module Implementation Guide

## Overview
Complete implementation of the Stock Management module for the HMS system, including inventory tracking, supplier management, stock movements, usage logs, and purchase orders.

## Database Schema

### ✅ Existing Tables (Enhanced)
1. **stock_items** - Inventory items
   - Added: `homestay_id`, `default_supplier_id`, `account_id`, `description`, `current_stock`

2. **stock_movements** - Item movements
   - Added: `homestay_id`, `staff_id`, `supplier_id`, `reference`, `movement_date`
   - Enhanced: movement_type enum to include 'transfer' and 'return'

3. **stock_suppliers** - Supplier information
   - Added: `homestay_id`, `email`, `phone`, `address`, `preferred_items`, `payment_terms`, `is_active`

4. **stock_usage_logs** - Usage tracking
   - Added: `homestay_id`, `linked_service_id`, `department`, `usage_date`
   - Enhanced: used_for enum to include 'housekeeping', 'laundry', 'general'

### ✅ New Tables Created
1. **stock_orders** - Purchase orders
   - Fields: order_id, homestay_id, supplier_id, order_number, order_date, expected_delivery_date, actual_delivery_date, status, total_amount, notes, created_by, approved_by, received_by, account_id

2. **stock_order_items** - Order line items
   - Fields: order_item_id, order_id, item_id, quantity_ordered, quantity_received, unit_price, total_price, notes

3. **inventory_alerts** (VIEW) - Low stock alerts dashboard

## Backend Implementation

### Models Created
- ✅ `/backend/src/models/stockItem.model.js`
- ✅ `/backend/src/models/stockMovement.model.js`
- ✅ `/backend/src/models/stockSupplier.model.js`
- ✅ `/backend/src/models/stockUsageLog.model.js`
- ✅ `/backend/src/models/stockOrder.model.js`
- ✅ `/backend/src/models/stockOrderItem.model.js`

### API Routes Created
File: `/backend/src/routes/stock.routes.js`

#### Stock Items
- `GET /api/stock/items` - List all items (with filters: homestay_id, category, low_stock)
- `GET /api/stock/items/:id` - Get single item with movement history
- `POST /api/stock/items` - Create new item
- `PUT /api/stock/items/:id` - Update item
- `DELETE /api/stock/items/:id` - Delete item

#### Stock Movements
- `GET /api/stock/movements` - List movements (filters: homestay_id, item_id, movement_type, date range)
- `POST /api/stock/movements` - Record movement (auto-updates stock quantity)

#### Suppliers
- `GET /api/stock/suppliers` - List suppliers
- `POST /api/stock/suppliers` - Create supplier
- `PUT /api/stock/suppliers/:id` - Update supplier
- `DELETE /api/stock/suppliers/:id` - Delete supplier

#### Usage Logs
- `GET /api/stock/usage-logs` - List usage logs
- `POST /api/stock/usage-logs` - Log usage

#### Stock Orders
- `GET /api/stock/orders` - List orders
- `POST /api/stock/orders` - Create purchase order
- `PATCH /api/stock/orders/:id/receive` - Receive delivery (auto-creates movements)

#### Alerts
- `GET /api/stock/alerts` - Get low stock alerts

### Database Associations
All models are properly associated in `/backend/src/models/index.js`:
- StockItem ↔ Homestay, StockSupplier, FinancialAccount
- StockMovement ↔ StockItem, Homestay, User, StockSupplier, FinancialAccount
- StockSupplier ↔ Homestay
- StockUsageLog ↔ StockItem, Homestay, User
- StockOrder ↔ Homestay, StockSupplier, User (creator, approver, receiver), FinancialAccount
- StockOrderItem ↔ StockOrder, StockItem

## Migration Script
Location: `/backend/migrations/add_stock_management_enhancements.sql`

To apply:
```bash
mysql -u root -p travooz_hms < /home/nathanadmin/Projects/MOPAS/travooz_hms/backend/migrations/add_stock_management_enhancements.sql
```

## Features Implemented

### 1. Stock Items Management
- Register and categorize inventory items
- Set reorder levels for automated alerts
- Link items to financial accounts for expense tracking
- Assign default suppliers
- Track current stock levels

### 2. Stock Movements
- Record purchases, usage, adjustments, transfers, and returns
- Automatic stock quantity updates
- Link to financial accounts for expense tracking
- Reference tracking for audit trails

### 3. Supplier Management
- Complete supplier profiles with contact information
- Track preferred items per supplier
- Payment terms management
- Active/inactive status

### 4. Usage Tracking
- Department-wise usage logs (room, restaurant, maintenance, housekeeping, laundry)
- Link usage to specific services (bookings, orders, maintenance requests)
- Usage trend analysis

### 5. Purchase Orders
- Create multi-item purchase orders
- Track order status (draft, pending, confirmed, shipped, delivered, cancelled)
- Receive deliveries with automatic stock updates
- Financial account integration

### 6. Inventory Alerts
- Real-time low stock alerts
- Out-of-stock notifications
- Reorder level monitoring

## Security & Best Practices
- ✅ All routes protected with authentication middleware
- ✅ Input validation using express-validator
- ✅ Database transactions for critical operations
- ✅ Proper error handling and logging
- ✅ Foreign key constraints for data integrity

## Integration Points

### Financial Accounts
- Every stock item can be linked to a financial account
- Stock movements automatically record expenses
- Purchase orders track costs against accounts

### Other Modules
- **Housekeeping**: Track towels, toiletries usage
- **Restaurant**: Track food, beverage inventory
- **Maintenance**: Track tools, spare parts
- **Rooms**: Link to room service items

## Next Steps: Frontend Implementation

### Components to Create
1. **Stock Items List & Form** - Manage inventory items
2. **Stock Movements** - Record and view movements
3. **Suppliers Management** - Supplier profiles
4. **Purchase Orders** - Create and manage orders
5. **Usage Logs** - View department-wise usage
6. **Inventory Alerts Dashboard** - Low stock alerts

### Sidebar Menu Structure
```
Stock Management
├── Stock Items
├── Stock Movements
├── Suppliers
├── Purchase Orders
├── Usage Logs
└── Alerts
```

## Currency Formatting
All prices in the stock management module should use RWF (Rwandan Francs):
- Display format: `5,000 RWF`
- Input format: Whole numbers (no decimals)

## Status
- ✅ Database schema designed and enhanced
- ✅ Migration script created
- ✅ Backend models implemented
- ✅ API routes implemented
- ✅ Routes registered in app.js
- ⏳ Database migration pending execution
- ⏳ Frontend components pending
- ⏳ Integration testing pending

## Testing Checklist
- [ ] Run database migrations
- [ ] Test stock item CRUD operations
- [ ] Test stock movement recording
- [ ] Test automatic quantity updates
- [ ] Test purchase order creation
- [ ] Test order receiving and stock updates
- [ ] Test low stock alerts
- [ ] Test supplier management
- [ ] Test usage logging
- [ ] Verify financial account integration

---
Generated: 2025-10-13
