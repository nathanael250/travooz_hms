#!/bin/bash

# Script to initialize room availability data
# This creates default availability records for all rooms

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000/api}"
AUTH_TOKEN="${AUTH_TOKEN:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Room Availability Initialization Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if AUTH_TOKEN is provided
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  AUTH_TOKEN not provided${NC}"
    echo -e "${YELLOW}Please set AUTH_TOKEN environment variable:${NC}"
    echo -e "${YELLOW}export AUTH_TOKEN='your-jwt-token-here'${NC}\n"
    exit 1
fi

# Get current date and date 365 days from now
START_DATE=$(date +%Y-%m-%d)
END_DATE=$(date -d "+365 days" +%Y-%m-%d)

echo -e "${BLUE}Configuration:${NC}"
echo -e "  API URL: ${API_BASE_URL}"
echo -e "  Start Date: ${START_DATE}"
echo -e "  End Date: ${END_DATE}"
echo -e ""

# Initialize availability for all rooms
echo -e "${BLUE}Initializing availability for all rooms...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE_URL}/room-availability/initialize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"start_date\": \"${START_DATE}\",
    \"end_date\": \"${END_DATE}\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Success!${NC}"
    echo -e "${GREEN}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo -e "${RED}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Initialization Complete${NC}"
echo -e "${BLUE}========================================${NC}"