# 📦 Complete Stock Management System - Database Tables

## 🎯 Overview
This document outlines the complete database structure for the comprehensive stock management system, including all existing and newly created tables.

## 📊 Existing Tables (Already Implemented)

### 1. `stock_items` - Master Inventory Items
- **Purpose**: Core inventory item registry
- **Key Fields**: `item_id`, `name`, `description`, `category`, `unit`, `quantity`, `current_stock`, `reorder_level`, `default_supplier_id`, `account_id`
- **Status**: ✅ **Enhanced** with new fields

### 2. `stock_movements` - Stock Movement Logs
- **Purpose**: Track all stock additions/deductions
- **Key Fields**: `movement_id`, `item_id`, `movement_type`, `quantity`, `unit_cost`, `total_cost`, `staff_id`, `supplier_id`, `reference`, `movement_date`
- **Status**: ✅ **Complete**

### 3. `stock_orders` - Purchase Orders
- **Purpose**: Purchase order management with approval workflow
- **Key Fields**: `order_id`, `supplier_id`, `order_number`, `order_date`, `expected_delivery_date`, `status`, `total_amount`, `created_by`, `approved_by`, `received_by`
- **Status**: ✅ **Complete**

### 4. `stock_order_items` - Purchase Order Items
- **Purpose**: Individual items within purchase orders
- **Key Fields**: `order_item_id`, `order_id`, `item_id`, `quantity_ordered`, `quantity_received`, `unit_price`, `total_price`
- **Status**: ✅ **Complete**

### 5. `stock_suppliers` - Supplier Registry
- **Purpose**: Supplier information and management
- **Key Fields**: `supplier_id`, `name`, `contact_info`, `email`, `phone`, `address`, `preferred_items`, `payment_terms`, `is_active`
- **Status**: ✅ **Enhanced** with new fields

### 6. `stock_usage_logs` - Usage Tracking
- **Purpose**: Track item consumption (housekeeping, maintenance, etc.)
- **Key Fields**: `usage_id`, `item_id`, `used_for`, `quantity`, `used_by`, `usage_date`, `department`, `linked_service_id`
- **Status**: ✅ **Complete**

## 🆕 Newly Created Tables

### 7. `inventory_categories` - Item Classification
- **Purpose**: Hierarchical category system for items
- **Key Fields**: 
  - `category_id` (PK)
  - `category_name` (UNIQUE)
  - `description`
  - `parent_category_id` (Self-reference for hierarchy)
  - `is_active`
- **Features**: 
  - Hierarchical categories (parent-child relationships)
  - Pre-seeded with 10 default categories
  - Active/inactive status management

### 8. `delivery_notes` - Delivery Tracking
- **Purpose**: Record actual deliveries from suppliers
- **Key Fields**:
  - `delivery_note_id` (PK)
  - `delivery_number` (UNIQUE)
  - `order_id` (FK to stock_orders)
  - `supplier_id` (FK to stock_suppliers)
  - `delivery_date`
  - `received_by` (FK to users)
  - `delivery_status` (partial, complete, damaged, rejected)
  - `total_items_received` vs `total_items_expected`
- **Features**:
  - Links to purchase orders
  - Tracks delivery status and condition
  - Records who received the delivery

### 9. `delivery_note_items` - Individual Delivery Items
- **Purpose**: Track received quantities and condition per item
- **Key Fields**:
  - `delivery_item_id` (PK)
  - `delivery_note_id` (FK to delivery_notes)
  - `order_item_id` (FK to stock_order_items)
  - `item_id` (FK to stock_items)
  - `quantity_expected` vs `quantity_received`
  - `quantity_damaged` vs `quantity_missing`
  - `condition_status` (good, damaged, defective, expired)
- **Features**:
  - Detailed item-level tracking
  - Condition assessment
  - Missing/damaged item tracking

### 10. `stock_cost_log` - Price Change Tracking
- **Purpose**: Historical price tracking and cost analysis
- **Key Fields**:
  - `cost_log_id` (PK)
  - `item_id` (FK to stock_items)
  - `supplier_id` (FK to stock_suppliers)
  - `old_unit_cost` vs `new_unit_cost`
  - `cost_change_reason` (supplier_price_change, market_adjustment, bulk_discount, contract_renewal, manual_update)
  - `effective_date`
  - `updated_by` (FK to users)
- **Features**:
  - Complete price history
  - Reason tracking for price changes
  - Supplier-specific pricing

### 11. `stock_units` - Unit Definitions
- **Purpose**: Standardized unit system with conversion support
- **Key Fields**:
  - `unit_id` (PK)
  - `unit_name` (UNIQUE)
  - `unit_symbol` (UNIQUE)
  - `unit_type` (weight, volume, length, area, count, time)
  - `base_unit_id` (Self-reference for conversions)
  - `conversion_factor`
- **Features**:
  - Unit type categorization
  - Conversion factor support
  - Pre-seeded with 15 default units
  - Hierarchical unit relationships

## 📈 Database Views (Reporting)

### 1. `stock_value_summary`
- **Purpose**: Real-time stock value calculations
- **Fields**: item_id, item_name, category, current_quantity, unit_price, total_value, homestay_name, category_name, unit_name
- **Use Case**: Dashboard metrics, financial reporting

### 2. `low_stock_alerts`
- **Purpose**: Automated low stock monitoring
- **Fields**: item_id, item_name, current_quantity, reorder_threshold, alert_level, supplier_name, contact_email
- **Alert Levels**: out_of_stock, low_stock, warning, normal
- **Use Case**: Dashboard alerts, automated notifications

### 3. `supplier_performance`
- **Purpose**: Supplier analytics and performance metrics
- **Fields**: supplier_id, supplier_name, total_orders, total_purchase_value, avg_order_value, completed_orders, cancelled_orders, delivery_success_rate
- **Use Case**: Supplier evaluation, procurement decisions

## 🔗 Key Relationships

### Foreign Key Relationships:
- `stock_items` → `inventory_categories` (category_id)
- `stock_items` → `stock_units` (unit_id)
- `stock_items` → `stock_suppliers` (default_supplier_id)
- `delivery_notes` → `stock_orders` (order_id)
- `delivery_notes` → `stock_suppliers` (supplier_id)
- `delivery_note_items` → `delivery_notes` (delivery_note_id)
- `delivery_note_items` → `stock_order_items` (order_item_id)
- `stock_cost_log` → `stock_items` (item_id)
- `stock_cost_log` → `stock_suppliers` (supplier_id)

### Hierarchical Relationships:
- `inventory_categories` → `inventory_categories` (parent_category_id)
- `stock_units` → `stock_units` (base_unit_id)

## 🌱 Seeded Data

### Default Categories (10):
1. **Linen** - Bed sheets, towels, pillowcases
2. **Toiletries** - Shampoo, soap, toilet paper
3. **Kitchen** - Cups, plates, utensils
4. **Cleaning** - Cleaning supplies and equipment
5. **Maintenance** - Tools and maintenance supplies
6. **Amenities** - Guest amenities and extras
7. **Food & Beverage** - Food items and beverages
8. **Office Supplies** - Stationery and office materials
9. **Safety** - Safety equipment and supplies
10. **Other** - Miscellaneous items

### Default Units (15):
**Count Units**: Piece, Set, Pair, Dozen, Box, Pack
**Weight Units**: Kilogram, Gram, Pound
**Volume Units**: Liter, Milliliter, Gallon
**Length Units**: Meter, Centimeter, Foot
**Area Units**: Square Meter, Square Foot

## 🚀 Migration Instructions

### 1. Run the Migration:
```bash
cd backend
./run_stock_migration.sh
```

### 2. Verify Tables:
```sql
SHOW TABLES LIKE '%stock%';
SHOW TABLES LIKE '%inventory%';
SHOW TABLES LIKE '%delivery%';
```

### 3. Check Views:
```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

## 📋 Complete Table List

| Table Name | Purpose | Status |
|------------|---------|--------|
| `stock_items` | Master inventory items | ✅ Enhanced |
| `stock_movements` | Stock movement logs | ✅ Complete |
| `stock_orders` | Purchase orders | ✅ Complete |
| `stock_order_items` | Purchase order items | ✅ Complete |
| `stock_suppliers` | Supplier registry | ✅ Enhanced |
| `stock_usage_logs` | Usage tracking | ✅ Complete |
| `inventory_categories` | Item classification | 🆕 New |
| `delivery_notes` | Delivery tracking | 🆕 New |
| `delivery_note_items` | Delivery item details | 🆕 New |
| `stock_cost_log` | Price change tracking | 🆕 New |
| `stock_units` | Unit definitions | 🆕 New |

## 🎯 Next Steps

1. **Run Migration**: Execute the migration script
2. **Update Models**: Sequelize models are already created
3. **Create APIs**: Build REST endpoints for new tables
4. **Frontend Integration**: Connect to storekeeper dashboard
5. **Testing**: Verify all functionality works correctly

## 📊 Benefits

- **Complete Traceability**: Track items from order to delivery to usage
- **Cost Management**: Historical pricing and cost analysis
- **Supplier Management**: Performance tracking and evaluation
- **Automated Alerts**: Low stock monitoring and notifications
- **Flexible Categorization**: Hierarchical category system
- **Unit Standardization**: Consistent unit management with conversions
- **Delivery Tracking**: Complete delivery and condition tracking
- **Financial Integration**: Links to financial accounts for expense tracking

The stock management system is now complete and ready for full implementation! 🎉
