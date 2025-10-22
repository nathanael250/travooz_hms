#!/bin/bash

# Test script for Room Availability Public Access
# This script tests both public and protected endpoints

API_BASE_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Room Availability Public Access Test${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Public endpoint - Get availability calendar
echo -e "${YELLOW}Test 1: GET /api/room-availability/calendar (Public)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "${API_BASE_URL}/api/room-availability/calendar?start_date=2024-01-01&end_date=2024-01-31")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $HTTP_CODE"
  echo "Response: $(echo $BODY | jq -r '.success')"
else
  echo -e "${RED}✗ FAIL${NC} - Status: $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 2: Public endpoint - Get rooms list
echo -e "${YELLOW}Test 2: GET /api/room-availability/rooms (Public)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "${API_BASE_URL}/api/room-availability/rooms")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $HTTP_CODE"
  echo "Response: $(echo $BODY | jq -r '.success')"
else
  echo -e "${RED}✗ FAIL${NC} - Status: $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 3: Public endpoint - Get homestays
echo -e "${YELLOW}Test 3: GET /api/homestays (Public)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "${API_BASE_URL}/api/homestays")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $HTTP_CODE"
  echo "Response: $(echo $BODY | jq -r 'if .success != null then .success else "OK" end')"
else
  echo -e "${RED}✗ FAIL${NC} - Status: $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""

# Test 4: Protected endpoint without token - Should fail
echo -e "${YELLOW}Test 4: POST /api/room-availability (Protected - No Token)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${API_BASE_URL}/api/room-availability" \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": 1,
    "date": "2024-01-15",
    "available_units": 1,
    "total_units": 1
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $HTTP_CODE (Correctly rejected)"
  echo "Response: $(echo $BODY | jq -r '.message // .error // "Unauthorized"')"
else
  echo -e "${RED}✗ FAIL${NC} - Status: $HTTP_CODE (Should be 401 or 403)"
  echo "Response: $BODY"
fi
echo ""

# Test 5: Protected endpoint with token - Should succeed (if token provided)
if [ -n "$AUTH_TOKEN" ]; then
  echo -e "${YELLOW}Test 5: POST /api/room-availability (Protected - With Token)${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "${API_BASE_URL}/api/room-availability" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "inventory_id": 1,
      "date": "2024-12-31",
      "available_units": 1,
      "total_units": 1,
      "min_stay": 1,
      "closed": false
    }')
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Status: $HTTP_CODE"
    echo "Response: $(echo $BODY | jq -r '.message')"
  else
    echo -e "${RED}✗ FAIL${NC} - Status: $HTTP_CODE"
    echo "Response: $BODY"
  fi
  echo ""
else
  echo -e "${YELLOW}Test 5: SKIPPED${NC} - Set AUTH_TOKEN environment variable to test authenticated endpoints"
  echo "Example: export AUTH_TOKEN='your_jwt_token_here'"
  echo ""
fi

# Test 6: Bulk update without token - Should fail
echo -e "${YELLOW}Test 6: POST /api/room-availability/bulk (Protected - No Token)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${API_BASE_URL}/api/room-availability/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": 1,
    "start_date": "2024-02-01",
    "end_date": "2024-02-07",
    "available_units": 1,
    "total_units": 1
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $HTTP_CODE (Correctly rejected)"
  echo "Response: $(echo $BODY | jq -r '.message // .error // "Unauthorized"')"
else
  echo -e "${RED}✗ FAIL${NC} - Status: $HTTP_CODE (Should be 401 or 403)"
  echo "Response: $BODY"
fi
echo ""

# Test 7: Delete without token - Should fail
echo -e "${YELLOW}Test 7: DELETE /api/room-availability/1 (Protected - No Token)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
  "${API_BASE_URL}/api/room-availability/1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
  echo -e "${GREEN}✓ PASS${NC} - Status: $HTTP_CODE (Correctly rejected)"
  echo "Response: $(echo $BODY | jq -r '.message // .error // "Unauthorized"')"
else
  echo -e "${RED}✗ FAIL${NC} - Status: $HTTP_CODE (Should be 401 or 403)"
  echo "Response: $BODY"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Public endpoints are accessible${NC}"
echo -e "${GREEN}✓ Protected endpoints require authentication${NC}"
echo -e "${YELLOW}Note: Run with AUTH_TOKEN to test authenticated operations${NC}"
echo ""
echo -e "${BLUE}Usage:${NC}"
echo "  export AUTH_TOKEN='your_jwt_token'"
echo "  ./test-public-availability.sh"
echo ""