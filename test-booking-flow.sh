#!/bin/bash

# Test Complete Room Booking Flow
# This script demonstrates the entire user journey from search to booking

API_BASE_URL="http://localhost:3001/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  COMPLETE ROOM BOOKING FLOW TEST${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Get all locations
echo -e "${YELLOW}Step 1: Get Available Locations${NC}"
echo -e "${GREEN}GET ${API_BASE_URL}/room-availability/locations${NC}"
LOCATIONS=$(curl -s "${API_BASE_URL}/room-availability/locations")
echo "$LOCATIONS" | python3 -m json.tool
echo -e "\n"

# Extract first location_id for testing
LOCATION_ID=$(echo "$LOCATIONS" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['locations'][0]['location_id']) if data['success'] and len(data['data']['locations']) > 0 else print('2')" 2>/dev/null || echo "2")

# Step 2: Search for available hotels
echo -e "${YELLOW}Step 2: Search Available Hotels${NC}"
echo -e "${GREEN}GET ${API_BASE_URL}/room-availability/available-hotels?location_id=${LOCATION_ID}&start_date=2025-02-15&end_date=2025-02-18&guests=2${NC}"
HOTELS=$(curl -s "${API_BASE_URL}/room-availability/available-hotels?location_id=${LOCATION_ID}&start_date=2025-02-15&end_date=2025-02-18&guests=2")
echo "$HOTELS" | python3 -m json.tool
echo -e "\n"

# Extract first homestay_id for testing
HOMESTAY_ID=$(echo "$HOTELS" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['hotels'][0]['homestay_id']) if data['success'] and len(data['data']['hotels']) > 0 else print('13')" 2>/dev/null || echo "13")

# Step 3: View available rooms in selected hotel
echo -e "${YELLOW}Step 3: View Available Rooms in Selected Hotel${NC}"
echo -e "${GREEN}GET ${API_BASE_URL}/room-availability/available-rooms?homestay_id=${HOMESTAY_ID}&start_date=2025-02-15&end_date=2025-02-18&guests=2${NC}"
ROOMS=$(curl -s "${API_BASE_URL}/room-availability/available-rooms?homestay_id=${HOMESTAY_ID}&start_date=2025-02-15&end_date=2025-02-18&guests=2")
echo "$ROOMS" | python3 -m json.tool
echo -e "\n"

# Extract first inventory_id for testing
INVENTORY_ID=$(echo "$ROOMS" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['available_rooms'][0]['inventory_id']) if data['success'] and len(data['data']['available_rooms']) > 0 else print('4')" 2>/dev/null || echo "4")

# Step 4: Create booking with guest information
echo -e "${YELLOW}Step 4: Create Booking with Guest Information${NC}"
echo -e "${GREEN}POST ${API_BASE_URL}/room-booking/create${NC}"

BOOKING_DATA='{
  "inventory_id": '${INVENTORY_ID}',
  "check_in_date": "2025-02-15",
  "check_out_date": "2025-02-18",
  "guest_name": "John Doe",
  "guest_email": "john.doe@example.com",
  "guest_phone": "+250788123456",
  "number_of_adults": 2,
  "number_of_children": 0,
  "special_requests": "Late check-in expected around 10 PM",
  "payment_method": "mobile_money",
  "guest_id_type": "passport",
  "guest_id_number": "P123456789",
  "early_checkin": false,
  "late_checkout": false,
  "extra_bed_count": 0,
  "booking_source": "website"
}'

echo "Request Body:"
echo "$BOOKING_DATA" | python3 -m json.tool
echo ""

BOOKING_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/room-booking/create" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_DATA")

echo "Response:"
echo "$BOOKING_RESPONSE" | python3 -m json.tool
echo -e "\n"

# Extract booking_id and transaction_id
BOOKING_ID=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['booking']['booking_id']) if data.get('success') else print('')" 2>/dev/null)
TRANSACTION_ID=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['payment']['transaction_id']) if data.get('success') and data['data'].get('payment') else print('')" 2>/dev/null)

if [ -z "$BOOKING_ID" ]; then
  echo -e "${RED}❌ Booking creation failed. Stopping test.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Booking created successfully!${NC}"
echo -e "   Booking ID: ${BOOKING_ID}"
echo -e "   Transaction ID: ${TRANSACTION_ID}\n"

# Step 5: Get booking details
echo -e "${YELLOW}Step 5: Retrieve Booking Details${NC}"
echo -e "${GREEN}GET ${API_BASE_URL}/room-booking/${BOOKING_ID}${NC}"
BOOKING_DETAILS=$(curl -s "${API_BASE_URL}/room-booking/${BOOKING_ID}")
echo "$BOOKING_DETAILS" | python3 -m json.tool
echo -e "\n"

# Step 6: Process payment (simulate payment gateway response)
if [ -n "$TRANSACTION_ID" ]; then
  echo -e "${YELLOW}Step 6: Process Payment${NC}"
  echo -e "${GREEN}POST ${API_BASE_URL}/room-booking/payment/${TRANSACTION_ID}${NC}"
  
  PAYMENT_DATA='{
    "payment_gateway_id": "MOMO_'$(date +%s)'",
    "gateway_response": {
      "status": "success",
      "transaction_ref": "TXN'$(date +%s)'",
      "payment_method": "MTN Mobile Money",
      "phone": "+250788123456",
      "amount": 100000,
      "currency": "RWF",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    }
  }'
  
  echo "Request Body:"
  echo "$PAYMENT_DATA" | python3 -m json.tool
  echo ""
  
  PAYMENT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/room-booking/payment/${TRANSACTION_ID}" \
    -H "Content-Type: application/json" \
    -d "$PAYMENT_DATA")
  
  echo "Response:"
  echo "$PAYMENT_RESPONSE" | python3 -m json.tool
  echo -e "\n"
  
  PAYMENT_SUCCESS=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('success', False))" 2>/dev/null)
  
  if [ "$PAYMENT_SUCCESS" = "True" ]; then
    echo -e "${GREEN}✅ Payment processed successfully!${NC}\n"
  else
    echo -e "${RED}❌ Payment processing failed${NC}\n"
  fi
fi

# Step 7: Verify booking status after payment
echo -e "${YELLOW}Step 7: Verify Booking Status After Payment${NC}"
echo -e "${GREEN}GET ${API_BASE_URL}/room-booking/${BOOKING_ID}${NC}"
FINAL_BOOKING=$(curl -s "${API_BASE_URL}/room-booking/${BOOKING_ID}")
echo "$FINAL_BOOKING" | python3 -m json.tool
echo -e "\n"

BOOKING_STATUS=$(echo "$FINAL_BOOKING" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['booking']['status']) if data.get('success') else print('unknown')" 2>/dev/null)
PAYMENT_STATUS=$(echo "$FINAL_BOOKING" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['booking']['payment_status']) if data.get('success') else print('unknown')" 2>/dev/null)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  BOOKING FLOW SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Booking ID:      ${BOOKING_ID}"
echo -e "Booking Status:  ${BOOKING_STATUS}"
echo -e "Payment Status:  ${PAYMENT_STATUS}"

if [ "$BOOKING_STATUS" = "confirmed" ] && [ "$PAYMENT_STATUS" = "paid" ]; then
  echo -e "\n${GREEN}✅ Complete booking flow executed successfully!${NC}"
else
  echo -e "\n${YELLOW}⚠️  Booking created but not fully confirmed${NC}"
fi

echo -e "${BLUE}========================================${NC}\n"

# Optional: Test cancellation (commented out by default)
# echo -e "${YELLOW}Step 8 (Optional): Cancel Booking${NC}"
# echo -e "${GREEN}PATCH ${API_BASE_URL}/room-booking/${BOOKING_ID}/cancel${NC}"
# CANCEL_DATA='{"cancellation_reason": "Test cancellation", "cancelled_by": 1}'
# CANCEL_RESPONSE=$(curl -s -X PATCH "${API_BASE_URL}/room-booking/${BOOKING_ID}/cancel" \
#   -H "Content-Type: application/json" \
#   -d "$CANCEL_DATA")
# echo "$CANCEL_RESPONSE" | python3 -m json.tool
# echo -e "\n"