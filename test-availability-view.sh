#!/bin/bash

# Script to test room availability endpoints using room_availability_view
# This tests the new view-based availability system

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3001/api}"

# Test dates
TODAY=$(date +%Y-%m-%d)
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
NEXT_WEEK=$(date -d "+7 days" +%Y-%m-%d)
NEXT_MONTH=$(date -d "+30 days" +%Y-%m-%d)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Room Availability View Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${BLUE}Configuration:${NC}"
echo -e "  API URL: ${API_BASE_URL}"
echo -e "  Test Date Range: ${TODAY} to ${NEXT_MONTH}"
echo -e ""

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local endpoint="$2"
    local expected_status="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}Test $TOTAL_TESTS: ${test_name}${NC}"
    echo -e "  Endpoint: ${endpoint}"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE_URL}${endpoint}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq "$expected_status" ]; then
        echo -e "  ${GREEN}✓ PASSED${NC} (HTTP $HTTP_CODE)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Pretty print JSON if jq is available
        if command -v jq &> /dev/null; then
            echo -e "  ${GREEN}Response:${NC}"
            echo "$BODY" | jq '.' | head -20
        fi
    else
        echo -e "  ${RED}✗ FAILED${NC} (Expected HTTP $expected_status, got HTTP $HTTP_CODE)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "  ${RED}Response:${NC}"
        echo "$BODY"
    fi
    echo ""
}

# Test 1: Get availability calendar for date range
run_test \
    "Get availability calendar (30 days)" \
    "/room-availability/calendar?start_date=${TODAY}&end_date=${NEXT_MONTH}" \
    200

# Test 2: Get availability calendar without dates (should fail)
run_test \
    "Get availability calendar without dates (should fail)" \
    "/room-availability/calendar" \
    400

# Test 3: Get available rooms only
run_test \
    "Get only available rooms" \
    "/room-availability/available-rooms?start_date=${TODAY}&end_date=${NEXT_WEEK}" \
    200

# Test 4: Get available rooms for specific date range
run_test \
    "Get available rooms for next week" \
    "/room-availability/available-rooms?start_date=${NEXT_WEEK}&end_date=${NEXT_MONTH}" \
    200

# Test 5: Get all rooms list
run_test \
    "Get all rooms list" \
    "/room-availability/rooms" \
    200

# Test 6: Get rooms filtered by status
run_test \
    "Get available rooms only (filtered)" \
    "/room-availability/rooms?status=available" \
    200

# Test 7: Get room availability summary
run_test \
    "Get room status summary" \
    "/room-availability/summary" \
    200

# Test 8: Get specific room availability (room ID 1)
run_test \
    "Get specific room availability (ID: 1)" \
    "/room-availability/room/1?start_date=${TODAY}&end_date=${NEXT_WEEK}" \
    200

# Test 9: Get specific room availability (room ID 4 - should be available)
run_test \
    "Get specific room availability (ID: 4 - available)" \
    "/room-availability/room/4?start_date=${TODAY}&end_date=${NEXT_WEEK}" \
    200

# Test 10: Check availability for multiple rooms
echo -e "${BLUE}Test $((TOTAL_TESTS + 1)): Check availability for multiple rooms${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE_URL}/room-availability/check-availability" \
  -H "Content-Type: application/json" \
  -d "{
    \"room_ids\": [1, 2, 3, 4, 5],
    \"start_date\": \"${TODAY}\",
    \"end_date\": \"${NEXT_WEEK}\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "  ${GREEN}✓ PASSED${NC} (HTTP $HTTP_CODE)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    if command -v jq &> /dev/null; then
        echo -e "  ${GREEN}Response:${NC}"
        echo "$BODY" | jq '.'
    fi
else
    echo -e "  ${RED}✗ FAILED${NC} (Expected HTTP 200, got HTTP $HTTP_CODE)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "  ${RED}Response:${NC}"
    echo "$BODY"
fi
echo ""

# Test 11: Get available rooms with guest filter
run_test \
    "Get available rooms for 2 guests" \
    "/room-availability/available-rooms?start_date=${TODAY}&end_date=${NEXT_WEEK}&guests=2" \
    200

# Test 12: Get calendar with status filter
run_test \
    "Get calendar filtered by available status" \
    "/room-availability/calendar?start_date=${TODAY}&end_date=${NEXT_WEEK}&status=available" \
    200

# Print summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
else
    echo -e "${GREEN}Failed: ${FAILED_TESTS}${NC}"
fi
echo -e "${BLUE}========================================${NC}"

# Exit with appropriate code
if [ $FAILED_TESTS -gt 0 ]; then
    exit 1
else
    exit 0
fi