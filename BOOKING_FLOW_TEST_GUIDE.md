# 🧪 Complete Booking Flow Test Guide

## Overview
This document provides a comprehensive test plan for the end-to-end booking flow, from browsing available rooms to completing a booking with payment and guest profile creation.

---

## 📋 Test Prerequisites

### 1. Database Setup
Ensure the following tables exist and have data:
- ✅ `homestays` - At least one homestay property
- ✅ `room_types` - Room types (Single, Double, Deluxe, etc.)
- ✅ `room_inventory` - Physical rooms with unit numbers
- ✅ `room_availability` - Availability calendar for each room
- ✅ `room_rates` - Pricing information
- ✅ `room_images` - Room photos
- ✅ `guest_profiles` - Guest information storage
- ✅ `bookings` - Main booking records
- ✅ `room_bookings` - Room-specific booking details
- ✅ `booking_guests` - Link between bookings and guests
- ✅ `payment_transactions` - Payment records

### 2. Backend Server
```bash
cd backend
npm run dev
# Server should be running on http://localhost:3001
```

### 3. Frontend Server
```bash
cd frontend
npm start
# Frontend should be running on http://localhost:3000
```

---

## 🧩 Step 1: Browse Available Rooms

### API Endpoint
```http
GET /api/room-availability/calendar?start_date=2025-01-20&end_date=2025-01-25&homestay_id=1
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "availability": [
      {
        "availability_id": 1,
        "inventory_id": 5,
        "date": "2025-01-20",
        "available_units": 1,
        "total_units": 1,
        "min_stay": 1,
        "max_stay": null,
        "closed": false,
        "room_number": "101",
        "room_type_name": "Deluxe Double",
        "homestay_name": "Kigali Comfort Inn"
      }
    ]
  }
}
```

### Test Cases
- ✅ Filter by homestay_id
- ✅ Filter by date range
- ✅ Filter by room_type_id
- ✅ Check available_units > 0
- ✅ Check closed = false
- ✅ Verify min_stay requirements

### Manual Test
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/room-availability/calendar?start_date=2025-01-20&end_date=2025-01-25&homestay_id=1"
```

---

## 🏨 Step 2: Get Room Details

### API Endpoint
```http
GET /api/room-inventory/:id
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "room": {
      "room_id": 5,
      "room_number": "101",
      "room_type_name": "Deluxe Double",
      "room_type_description": "Spacious room with king bed",
      "price_per_night": 50000,
      "currency": "RWF",
      "max_people": 2,
      "size_sqm": 25,
      "status": "available",
      "homestay_name": "Kigali Comfort Inn",
      "images": [
        {
          "image_url": "/uploads/rooms/room-101-1.jpg",
          "is_primary": true
        }
      ],
      "amenities": ["WiFi", "TV", "AC", "Mini Bar"]
    }
  }
}
```

### Test Cases
- ✅ Room details are complete
- ✅ Images are loaded
- ✅ Pricing is correct
- ✅ Amenities are listed
- ✅ Room status is "available"

---

## 👤 Step 3: Guest Information (New or Existing)

### Option A: Create New Guest Profile
```http
POST /api/guest-profiles
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+250788123456",
  "date_of_birth": "1990-05-15",
  "nationality": "Rwanda",
  "id_type": "passport",
  "id_number": "P123456789",
  "address": "KN 5 Ave, Kigali"
}
```

### Option B: Search Existing Guest
```http
GET /api/guest-profiles?email=john.doe@example.com
```

### Expected Response (New Guest)
```json
{
  "success": true,
  "message": "Guest profile created successfully",
  "data": {
    "guest": {
      "guest_id": 42,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+250788123456"
    }
  }
}
```

### Test Cases
- ✅ Email validation
- ✅ Phone number format
- ✅ Required fields validation
- ✅ Duplicate email check
- ✅ Guest profile is created/retrieved

---

## 📝 Step 4: Create Booking

### API Endpoint
```http
POST /api/room-bookings
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "room_id": 5,
  "check_in_date": "2025-01-20",
  "check_out_date": "2025-01-25",
  "adults": 2,
  "children": 0,
  "room_rate": 50000,
  "discount_amount": 0,
  "tax_amount": 9000,
  "booking_data": {
    "booking_reference": "BK20250115001",
    "guest_name": "John Doe",
    "booking_source": "online"
  },
  "guests": [
    {
      "guest_id": 42,
      "is_primary": true
    }
  ]
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Room booking created successfully",
  "data": {
    "room_booking_id": 123,
    "booking_id": 456,
    "room_id": 5,
    "check_in_date": "2025-01-20",
    "check_out_date": "2025-01-25",
    "nights": 5,
    "adults": 2,
    "children": 0,
    "room_rate": 50000,
    "discount_amount": 0,
    "tax_amount": 9000,
    "final_amount": 259000,
    "booking": {
      "booking_id": 456,
      "booking_reference": "BK20250115001",
      "guest_name": "John Doe",
      "service_type": "room",
      "status": "confirmed",
      "payment_status": "pending",
      "booking_source": "online",
      "total_amount": 259000
    },
    "room": {
      "inventory_id": 5,
      "unit_number": "101",
      "room_type": "Deluxe Double"
    },
    "guests": [
      {
        "guest_id": 42,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "is_primary": true
      }
    ]
  }
}
```

### Backend Validations
- ✅ Room availability check (no overlapping bookings)
- ✅ Date validation (check-out > check-in)
- ✅ Nights calculation: `(check_out - check_in) / 86400000`
- ✅ Amount calculation: `(room_rate * nights) - discount + tax`
- ✅ Booking reference generation (if not provided)
- ✅ Guest profile exists
- ✅ At least one guest is marked as primary

### Test Cases
- ✅ Successful booking creation
- ✅ Room conflict detection (overlapping dates)
- ✅ Invalid date range (check-out before check-in)
- ✅ Invalid guest_id
- ✅ Missing required fields
- ✅ Calculation accuracy (nights, amounts)

---

## 💳 Step 5: Process Payment

### API Endpoint
```http
POST /api/payment-transactions
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "booking_id": 456,
  "amount": 259000,
  "payment_method": "mobile_money",
  "payment_provider": "MTN Mobile Money",
  "transaction_reference": "MM20250115123456",
  "payment_status": "completed",
  "payer_name": "John Doe",
  "payer_phone": "+250788123456"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "transaction": {
      "transaction_id": 789,
      "booking_id": 456,
      "amount": 259000,
      "payment_method": "mobile_money",
      "payment_provider": "MTN Mobile Money",
      "transaction_reference": "MM20250115123456",
      "payment_status": "completed",
      "payment_date": "2025-01-15T10:30:00Z"
    }
  }
}
```

### Update Booking Payment Status
```http
PATCH /api/bookings/456
Content-Type: application/json

{
  "payment_status": "paid"
}
```

### Test Cases
- ✅ Payment transaction created
- ✅ Booking payment_status updated to "paid"
- ✅ Transaction reference is unique
- ✅ Amount matches booking total
- ✅ Payment method validation

---

## 🔄 Step 6: Post-Booking Actions

### 6.1 Update Room Availability
After successful booking, reduce available_units:
```sql
UPDATE room_availability 
SET available_units = available_units - 1
WHERE inventory_id = 5 
AND date BETWEEN '2025-01-20' AND '2025-01-24';
```

### 6.2 Create Housekeeping Task (Optional)
```http
POST /api/housekeeping/tasks
Content-Type: application/json

{
  "homestay_id": 1,
  "inventory_id": 5,
  "task_type": "setup",
  "priority": "normal",
  "scheduled_date": "2025-01-20",
  "scheduled_time": "14:00:00",
  "booking_id": 456,
  "notes": "Prepare room for guest arrival - John Doe"
}
```

### 6.3 Send Confirmation Email (Future Enhancement)
- Email to guest with booking details
- Booking reference
- Check-in/check-out dates
- Payment receipt
- Homestay contact information

---

## ✅ Complete Flow Test Checklist

### Pre-Booking
- [ ] Guest can browse available rooms by date range
- [ ] Room details display correctly (images, price, amenities)
- [ ] Room availability is accurate
- [ ] Pricing calculations are correct

### Booking Creation
- [ ] Guest profile is created or retrieved
- [ ] Booking form validates all required fields
- [ ] Room conflict detection works
- [ ] Booking reference is generated
- [ ] Nights and amounts are calculated correctly
- [ ] Booking record is created in database
- [ ] Room booking record is created
- [ ] Booking-guest relationship is established

### Payment Processing
- [ ] Payment transaction is recorded
- [ ] Booking payment status is updated
- [ ] Transaction reference is stored
- [ ] Payment method is captured

### Post-Booking
- [ ] Room availability is updated
- [ ] Booking appears in admin dashboard
- [ ] Guest can view their booking
- [ ] Housekeeping task is created (if applicable)

---

## 🐛 Common Issues & Solutions

### Issue 1: Room Shows Available But Booking Fails
**Cause**: Overlapping booking exists
**Solution**: Check `room_bookings` table for conflicts
```sql
SELECT * FROM room_bookings 
WHERE room_id = 5 
AND check_in_date < '2025-01-25' 
AND check_out_date > '2025-01-20';
```

### Issue 2: Amount Calculation Mismatch
**Cause**: Incorrect nights calculation or tax/discount
**Solution**: Verify formula
```javascript
const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
const subtotal = room_rate * nights;
const final_amount = subtotal - discount_amount + tax_amount;
```

### Issue 3: Guest Profile Not Created
**Cause**: Validation errors or duplicate email
**Solution**: Check validation rules and search for existing guest first

### Issue 4: Payment Status Not Updating
**Cause**: Booking ID mismatch or API error
**Solution**: Verify booking_id in payment transaction matches booking record

---

## 📊 Database Verification Queries

### Check Booking Was Created
```sql
SELECT 
  b.booking_id,
  b.booking_reference,
  b.guest_name,
  b.status,
  b.payment_status,
  rb.check_in_date,
  rb.check_out_date,
  rb.nights,
  rb.final_amount,
  ri.unit_number as room_number
FROM bookings b
JOIN room_bookings rb ON b.booking_id = rb.booking_id
JOIN room_inventory ri ON rb.room_id = ri.inventory_id
WHERE b.booking_reference = 'BK20250115001';
```

### Check Guest Profile
```sql
SELECT * FROM guest_profiles 
WHERE email = 'john.doe@example.com';
```

### Check Booking-Guest Link
```sql
SELECT 
  bg.*,
  gp.first_name,
  gp.last_name,
  gp.email
FROM booking_guests bg
JOIN guest_profiles gp ON bg.guest_id = gp.guest_id
WHERE bg.booking_id = 456;
```

### Check Payment Transaction
```sql
SELECT * FROM payment_transactions 
WHERE booking_id = 456;
```

### Check Room Availability Updated
```sql
SELECT * FROM room_availability 
WHERE inventory_id = 5 
AND date BETWEEN '2025-01-20' AND '2025-01-25';
```

---

## 🚀 Automated Test Script

Create a test script to run the complete flow:

```bash
#!/bin/bash

# Set variables
API_URL="http://localhost:3001/api"
TOKEN="YOUR_AUTH_TOKEN"
CHECK_IN="2025-01-20"
CHECK_OUT="2025-01-25"
HOMESTAY_ID=1
ROOM_ID=5

echo "🧪 Starting Booking Flow Test..."

# Step 1: Check room availability
echo "📋 Step 1: Checking room availability..."
AVAILABILITY=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/room-availability/calendar?start_date=$CHECK_IN&end_date=$CHECK_OUT&homestay_id=$HOMESTAY_ID")
echo "$AVAILABILITY" | jq '.'

# Step 2: Create guest profile
echo "👤 Step 2: Creating guest profile..."
GUEST=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test.user@example.com",
    "phone": "+250788999888"
  }' \
  "$API_URL/guest-profiles")
GUEST_ID=$(echo "$GUEST" | jq -r '.data.guest.guest_id')
echo "Guest ID: $GUEST_ID"

# Step 3: Create booking
echo "📝 Step 3: Creating booking..."
BOOKING=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"room_id\": $ROOM_ID,
    \"check_in_date\": \"$CHECK_IN\",
    \"check_out_date\": \"$CHECK_OUT\",
    \"adults\": 2,
    \"children\": 0,
    \"room_rate\": 50000,
    \"discount_amount\": 0,
    \"tax_amount\": 9000,
    \"booking_data\": {
      \"booking_reference\": \"BK$(date +%Y%m%d%H%M%S)\",
      \"guest_name\": \"Test User\",
      \"booking_source\": \"online\"
    },
    \"guests\": [{
      \"guest_id\": $GUEST_ID,
      \"is_primary\": true
    }]
  }" \
  "$API_URL/room-bookings")
BOOKING_ID=$(echo "$BOOKING" | jq -r '.data.booking.booking_id')
echo "Booking ID: $BOOKING_ID"
echo "$BOOKING" | jq '.'

# Step 4: Process payment
echo "💳 Step 4: Processing payment..."
PAYMENT=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"booking_id\": $BOOKING_ID,
    \"amount\": 259000,
    \"payment_method\": \"mobile_money\",
    \"payment_provider\": \"MTN Mobile Money\",
    \"transaction_reference\": \"MM$(date +%Y%m%d%H%M%S)\",
    \"payment_status\": \"completed\",
    \"payer_name\": \"Test User\",
    \"payer_phone\": \"+250788999888\"
  }" \
  "$API_URL/payment-transactions")
echo "$PAYMENT" | jq '.'

echo "✅ Booking Flow Test Complete!"
echo "Booking ID: $BOOKING_ID"
echo "Guest ID: $GUEST_ID"
```

---

## 📈 Success Metrics

A successful booking flow should achieve:
- ✅ 100% data integrity (all related records created)
- ✅ < 3 seconds total API response time
- ✅ 0 orphaned records (all foreign keys valid)
- ✅ Accurate calculations (amounts, nights, dates)
- ✅ Proper status transitions (pending → confirmed → paid)
- ✅ Room availability correctly updated

---

## 🎯 Next Steps

After verifying the booking flow:
1. ✅ Implement frontend booking form
2. ✅ Add payment gateway integration
3. ✅ Create booking confirmation emails
4. ✅ Add booking management dashboard
5. ✅ Implement check-in/check-out workflow
6. ✅ Add housekeeping task automation
7. ✅ Create guest portal for viewing bookings

---

**Status**: 🟢 **READY FOR TESTING**

For questions or issues, refer to the API documentation or contact the development team.