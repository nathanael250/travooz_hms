#!/bin/bash

# 🔧 Script to diagnose and fix hotel assignment for HMS users
# Usage: ./fix-hotel-assignment.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HMS User - Hotel Assignment Fixer${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Configuration
API_URL="${1:-http://localhost:3001/api}"
ADMIN_EMAIL="${2:-admin@hotel.com}"
ADMIN_PASSWORD="${3:-admin123}"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  API URL: $API_URL"
echo "  Admin Email: $ADMIN_EMAIL"
echo ""

# Step 1: Get admin token
echo -e "${YELLOW}🔐 Step 1: Authenticating as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login-hms" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token' 2>/dev/null || echo "")

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Authentication failed!${NC}"
  echo "Response: $LOGIN_RESPONSE"
  echo ""
  echo "Please provide correct admin credentials:"
  echo "  Usage: ./fix-hotel-assignment.sh <API_URL> <ADMIN_EMAIL> <ADMIN_PASSWORD>"
  exit 1
fi

echo -e "${GREEN}✅ Authentication successful${NC}"
echo ""

# Step 2: Get homestays (available hotels)
echo -e "${YELLOW}🏨 Step 2: Fetching available hotels...${NC}"
HOMESTAYS=$(curl -s -X GET "$API_URL/homestays" \
  -H "Authorization: Bearer $TOKEN")

HOTEL_COUNT=$(echo $HOMESTAYS | jq '.data | length' 2>/dev/null || echo "0")

if [ "$HOTEL_COUNT" -eq 0 ]; then
  echo -e "${RED}❌ No hotels found!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Found $HOTEL_COUNT hotel(s)${NC}"
echo ""
echo "Available Hotels:"
echo $HOMESTAYS | jq -r '.data[] | "  ID: \(.homestay_id) - \(.name)"'
echo ""

# Step 3: Diagnose users with missing hotel assignment
echo -e "${YELLOW}🔍 Step 3: Diagnosing users with missing hotel assignment...${NC}"
DIAGNOSIS=$(curl -s -X GET "$API_URL/hms-users/diagnose/missing-hotel" \
  -H "Authorization: Bearer $TOKEN")

MISSING_COUNT=$(echo $DIAGNOSIS | jq '.count' 2>/dev/null || echo "0")

if [ "$MISSING_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ No users with missing hotel assignment found!${NC}"
  exit 0
fi

echo -e "${YELLOW}⚠️  Found $MISSING_COUNT user(s) with missing hotel assignment:${NC}"
echo $DIAGNOSIS | jq -r '.data[] | "  - \(.name) (\(.email)) - Role: \(.role)"'
echo ""

# Step 4: Ask which hotel to assign
echo -e "${YELLOW}🎯 Step 4: Select hotel to assign users to${NC}"
read -p "Enter hotel ID to assign to (default: 1): " HOTEL_ID
HOTEL_ID=${HOTEL_ID:-1}

# Verify hotel exists
HOTEL_EXISTS=$(echo $HOMESTAYS | jq --arg hid "$HOTEL_ID" '.data[] | select(.homestay_id == ($hid | tonumber))' 2>/dev/null)

if [ -z "$HOTEL_EXISTS" ]; then
  echo -e "${RED}❌ Hotel ID $HOTEL_ID not found!${NC}"
  exit 1
fi

HOTEL_NAME=$(echo $HOMESTAYS | jq -r --arg hid "$HOTEL_ID" '.data[] | select(.homestay_id == ($hid | tonumber)) | .name')
echo -e "${GREEN}✅ Selected: Hotel $HOTEL_ID - $HOTEL_NAME${NC}"
echo ""

# Step 5: Confirm and apply fix
echo -e "${YELLOW}📝 Step 5: Summary${NC}"
echo "  Users to fix: $MISSING_COUNT"
echo "  Target hotel: $HOTEL_NAME (ID: $HOTEL_ID)"
echo ""

read -p "Apply fix? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}❌ Fix cancelled${NC}"
  exit 0
fi

# Apply the fix
echo -e "${YELLOW}⚙️  Step 6: Applying fix...${NC}"
FIX_RESPONSE=$(curl -s -X POST "$API_URL/hms-users/bulk/assign-hotel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"hotel_id\": $HOTEL_ID}")

AFFECTED=$(echo $FIX_RESPONSE | jq '.affectedRows' 2>/dev/null || echo "0")

if [ "$AFFECTED" -gt 0 ]; then
  echo -e "${GREEN}✅ Fix applied successfully!${NC}"
  echo "  Fixed $AFFECTED user(s)"
  echo ""
  
  # Verify
  echo -e "${YELLOW}✔️  Verifying fix...${NC}"
  VERIFY=$(curl -s -X GET "$API_URL/hms-users/diagnose/missing-hotel" \
    -H "Authorization: Bearer $TOKEN")
  
  REMAINING=$(echo $VERIFY | jq '.count' 2>/dev/null || echo "0")
  
  if [ "$REMAINING" -eq 0 ]; then
    echo -e "${GREEN}✅ Verification passed! All users now have hotel assignment.${NC}"
  else
    echo -e "${YELLOW}⚠️  Still $REMAINING user(s) with missing assignment${NC}"
    echo $VERIFY | jq -r '.data[] | "  - \(.name) (\(.email))"'
  fi
else
  echo -e "${RED}❌ Fix failed${NC}"
  echo "Response: $FIX_RESPONSE"
  exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ All done!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Hotel managers can now access Front Desk features."
echo ""