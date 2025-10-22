#!/bin/bash

# ============================================
# Load Stay View Test Data Script
# ============================================
# This script loads the test data for Stay View feature
# into the travooz_hms database
# ============================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}Stay View Test Data Loader${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""

# Database configuration
DB_NAME="travooz_hms"
SQL_FILE="stay_view_test_data.sql"

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: $SQL_FILE not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}This script will load test data into the database.${NC}"
echo -e "${YELLOW}Database: $DB_NAME${NC}"
echo ""
echo -e "${YELLOW}The following data will be created:${NC}"
echo "  • 5 Room Types (Standard, Deluxe, Family Suite, Executive Suite, Presidential Suite)"
echo "  • 12 Physical Rooms (inventory_id 1-12)"
echo "  • 16 Bookings (booking_id 100-115)"
echo "  • Various booking statuses: Confirmed, Pending, Completed, Cancelled"
echo "  • Date range: ~25 days (past to future)"
echo ""

# Prompt for MySQL credentials
read -p "Enter MySQL username [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Enter MySQL password: " DB_PASS
echo ""
echo ""

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
mysql -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME;" 2>/dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Could not connect to database!${NC}"
    echo -e "${RED}Please check your credentials and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database connection successful${NC}"
echo ""

# Confirm before proceeding
read -p "Do you want to proceed with loading the test data? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Loading test data...${NC}"

# Execute SQL file
mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}✓ Test data loaded successfully!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${GREEN}You can now test the Stay View feature with:${NC}"
    echo "  • Homestay ID: 1 (Urugero Hotel)"
    echo "  • 12 rooms across 5 floors"
    echo "  • 16 bookings with various statuses"
    echo ""
    echo -e "${GREEN}To view the data:${NC}"
    echo "  • Navigate to: http://localhost:3000/hotels/homestays/1"
    echo "  • Click the 'Stay View' button"
    echo ""
else
    echo ""
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}✗ Error loading test data!${NC}"
    echo -e "${RED}============================================${NC}"
    echo ""
    echo -e "${RED}Please check the error messages above.${NC}"
    echo -e "${RED}Common issues:${NC}"
    echo "  • Duplicate key errors (data already exists)"
    echo "  • Foreign key constraints (missing parent records)"
    echo ""
    exit 1
fi