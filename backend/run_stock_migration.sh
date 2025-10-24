#!/bin/bash

# Script to run the missing stock tables migration
# This script will create all the missing stock management tables

echo "🚀 Starting Stock Management Tables Migration..."
echo "=============================================="

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL is not running. Please start MySQL first."
    exit 1
fi

# Database connection details
DB_HOST="localhost"
DB_USER="admin"
DB_PASS="admin"
DB_NAME="travooz_hms"

echo "📊 Creating missing stock management tables..."

# Run the migration
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < migrations/create_missing_stock_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Created tables:"
    echo "   • inventory_categories - Item classification system"
    echo "   • delivery_notes - Delivery tracking"
    echo "   • delivery_note_items - Individual delivery items"
    echo "   • stock_cost_log - Price change tracking"
    echo "   • stock_units - Unit definitions and conversions"
    echo ""
    echo "📊 Created views:"
    echo "   • stock_value_summary - Stock value calculations"
    echo "   • low_stock_alerts - Low stock monitoring"
    echo "   • supplier_performance - Supplier analytics"
    echo ""
    echo "🔧 Enhanced existing tables:"
    echo "   • stock_items - Added category_id, unit_id, unit_price, etc."
    echo "   • stock_suppliers - Added supplier_name, contact_email, etc."
    echo ""
    echo "🌱 Seeded data:"
    echo "   • 10 default categories (Linen, Toiletries, Kitchen, etc.)"
    echo "   • 15 default units (Piece, Kilogram, Liter, etc.)"
    echo ""
    echo "🎉 Stock management system is now complete!"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
