# Room Booking and Payment Flow - Complete Guide

## Overview
This document explains the complete data flow for creating room bookings and confirming payments in the Travooz HMS system after the refactoring that separated room types from inventory assignment.

---

## 1. CREATE BOOKING ENDPOINT

### **Endpoint:** `POST /api/room-bookings/create`

### **Purpose:**
Creates a complete room booking with guest information. Bookings are created by room type only, and specific rooms are assigned when guests arrive at the property.

---

## 2. REQUEST DATA STRUCTURE

### **Required Fields:**

```json
{
  // ROOM SELECTION (required)
  "room_type_id": 1,           // Required: Which type of room to book
  
  // DATES (required)
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  
  // GUEST INFORMATION (required)
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+250788123456",
  
  // OCCUPANCY (required)
  "number_of_adults": 2,
  "number_of_children": 1      // Optional, defaults to 0
}
```

### **Optional Fields:**

```json
{
  // GUEST IDENTIFICATION
  "guest_id_type": "passport",      // passport, national_id, driving_license
  "guest_id_number": "AB123456",
  
  // SPECIAL REQUESTS & PREFERENCES
  "special_requests": "High floor, quiet room, near elevator",
  
  // ADDITIONAL SERVICES
  "early_checkin": true,            // Adds 50% of room rate
  "late_checkout": true,            // Adds 50% of room rate
  "extra_bed_count": 1,             // 10,000 RWF per bed per night
  
  // PAYMENT
  "payment_method": "card",         // card, paypal, stripe, bank_transfer, mobile_money
  
  // SYSTEM FIELDS
  "booking_source": "website",      // website, mobile_app, phone, walk_in
  "user_id": 123                    // If user is logged in
}
```

---

## 3. BOOKING CREATION WORKFLOW

### **Step 1: Validation**
- Validates that `room_type_id` is provided
- Checks room type exists
- Checks room type can accommodate the number of guests (max_people >= total_guests)
- **Checks availability**: Ensures there are available rooms of this type for the requested dates
  - Counts total rooms of this type in inventory
  - Counts how many are already booked for overlapping dates using the standard date overlap formula:
    - `(check_in_date < end_date) AND (check_out_date > start_date)`
  - Prevents overbooking by rejecting if all rooms are booked
  - **Note:** Uses the same logic as the availability endpoint for consistency (see `ROOM_AVAILABILITY_VIEW_FIX.md`)
- No specific room assigned at booking time (inventory_id = NULL)

### **Step 2: Price Calculation**
```javascript
// Base calculation
nights = (check_out_date - check_in_date) in days
total_room_amount = room_price_per_night × nights

// Additional fees
early_checkin_fee = early_checkin ? (room_price_per_night × 0.5) : 0
late_checkout_fee = late_checkout ? (room_price_per_night × 0.5) : 0
extra_bed_fee = extra_bed_count × 10,000 × nights

// Taxes and charges
subtotal = total_room_amount + early_checkin_fee + late_checkout_fee + extra_bed_fee
tax_amount = subtotal × 0.18        // 18% VAT (Rwanda)
service_charge = subtotal × 0.05    // 5% service charge
final_amount = subtotal + tax_amount + service_charge
```

### **Step 3: Create Records**
The system creates records in multiple tables within a transaction:

1. **`bookings` table** - Main booking record
   - `service_type`: 'room'
   - `status`: 'pending' (will be 'confirmed' after payment)
   - `payment_status`: 'pending'
   - `booking_reference`: Auto-generated (e.g., TRV-12345678ABCD)
   - `total_amount`: final_amount

2. **`room_bookings` table** - Room-specific details
   - `room_type_id`: The type of room booked (NEW!)
   - `inventory_id`: Specific room assigned (NULL if not assigned yet)
   - `check_in_date`, `check_out_date`
   - All pricing details
   - Guest information
   - Special requests

3. **`guest_profiles` table** - Guest information
   - Creates new guest OR updates existing (matched by email)
   - Tracks `total_bookings` and `total_spent`

4. **`booking_guests` table** - Links guest to booking
   - `is_primary`: 1 (for main guest)

5. **`payment_transactions` table** - Payment record (if payment_method provided)
   - `status`: 'pending'
   - `amount`: final_amount
   - `payment_method`: from request

---

## 4. BOOKING CREATION RESPONSE

### **Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "booking_id": 456,
      "booking_reference": "TRV-12345678ABCD",
      "status": "pending",
      "payment_status": "pending"
    },
    "room": {
      "room_number": null,            // Always NULL - room assigned on arrival
      "room_type": "Deluxe Room",
      "homestay_name": "Kigali Heights Hotel"
    },
    "dates": {
      "check_in_date": "2024-01-15",
      "check_out_date": "2024-01-20",
      "nights": 5
    },
    "guest": {
      "guest_id": 789,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+250788123456"
    },
    "pricing": {
      "room_price_per_night": 50000,
      "total_room_amount": 250000,
      "early_checkin_fee": 25000,
      "late_checkout_fee": 25000,
      "extra_bed_fee": 50000,
      "subtotal": 350000,
      "tax_amount": 63000,
      "service_charge": 17500,
      "final_amount": 430500,
      "currency": "RWF"
    },
    "payment": {
      "transaction_id": 999,
      "status": "pending",
      "message": "Please proceed with payment to confirm your booking"
    }
  }
}
```

### **Error Responses:**

```json
// Missing room_type_id
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Room type ID is required and must be an integer",
      "param": "room_type_id"
    }
  ]
}

// Room type not found or can't accommodate guests
{
  "success": false,
  "message": "Room type not found or cannot accommodate the number of guests"
}

// No rooms available (overbooking prevention)
{
  "success": false,
  "message": "No rooms available for Deluxe Room from 2024-01-15 to 2024-01-20. All 5 rooms are already booked.",
  "details": {
    "room_type": "Deluxe Room",
    "total_rooms": 5,
    "booked_rooms": 5,
    "available_rooms": 0
  }
}

// Invalid dates
{
  "success": false,
  "message": "Check-out date must be after check-in date"
}
```

---

## 5. PAYMENT CONFIRMATION ENDPOINT

### **Endpoint:** `POST /api/room-bookings/payment/:transaction_id`

### **Purpose:**
Confirms payment for a booking and updates booking status to 'confirmed'

### **Request Data:**

```json
{
  "payment_gateway_id": "stripe_ch_1234567890",  // Optional: Gateway transaction ID
  "gateway_response": {                          // Optional: Full gateway response
    "status": "succeeded",
    "amount": 430500,
    "currency": "RWF",
    "payment_method": "card_visa",
    "last4": "4242"
  }
}
```

### **Payment Confirmation Workflow:**

1. **Validates transaction exists and is pending**
2. **Updates `payment_transactions` table:**
   - `status`: 'completed'
   - `payment_gateway_id`: from request
   - `gateway_response`: JSON of gateway response
   - `updated_at`: NOW()

3. **Updates `bookings` table:**
   - `status`: 'confirmed'
   - `payment_status`: 'paid'
   - `confirmed_at`: NOW()

4. **Room Assignment:**
   - Rooms are NOT automatically assigned on payment confirmation
   - Staff will assign specific rooms when guests arrive via the Room Assignment interface

### **Success Response:**

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transaction_id": 999,
    "booking_id": 456,
    "booking_reference": "TRV-12345678ABCD",
    "payment_status": "completed",
    "booking_status": "confirmed",
    "amount": 430500,
    "currency": "RWF"
  }
}
```

### **Error Responses:**

```json
// Transaction not found
{
  "success": false,
  "message": "Transaction not found"
}

// Already paid
{
  "success": false,
  "message": "Payment already completed"
}
```

---

## 6. COMPLETE EXAMPLE FLOW

### **Standard Booking Flow**

```javascript
// Step 1: Create booking
POST /api/room-bookings/create
{
  "room_type_id": 3,              // Deluxe Room type
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "guest_name": "Jane Smith",
  "guest_email": "jane@example.com",
  "guest_phone": "+250788999888",
  "number_of_adults": 2,
  "number_of_children": 0,
  "special_requests": "High floor, city view",
  "early_checkin": false,
  "late_checkout": false,
  "extra_bed_count": 0,
  "payment_method": "card",
  "guest_id_type": "passport",
  "guest_id_number": "AB123456",
  "booking_source": "website"
}

// Response includes transaction_id: 999
// room_bookings.inventory_id = NULL (no specific room assigned yet)
// room_bookings.room_type_id = 3

// Step 2: Process payment
POST /api/room-bookings/payment/999
{
  "payment_gateway_id": "stripe_ch_abc123",
  "gateway_response": { 
    "status": "succeeded",
    "amount": 430500,
    "currency": "RWF"
  }
}

// Booking is now confirmed
// room_bookings.inventory_id is still NULL
// Staff will assign a specific room when guest arrives via Room Assignment interface
```

---

## 7. DATABASE STATE AFTER BOOKING

### **After Booking Creation:**

```sql
-- bookings table
booking_id: 456
status: 'pending'
payment_status: 'pending'
booking_reference: 'TRV-12345678ABCD'

-- room_bookings table
booking_id: 456
room_type_id: 3              -- ✅ Room type is set
inventory_id: NULL           -- ⏳ No specific room assigned yet
check_in_date: '2024-01-15'
check_out_date: '2024-01-20'
guests: 3
nights: 5
final_amount: 430500

-- guest_profiles table
guest_id: 789
email: 'jane@example.com'
total_bookings: 1
total_spent: 430500

-- booking_guests table
booking_id: 456
guest_id: 789
is_primary: 1

-- payment_transactions table
transaction_id: 999
booking_id: 456
status: 'pending'
amount: 430500
payment_method: 'card'

-- room_assignments table
(No record yet - will be created when staff assigns a room on arrival)
```

### **After Payment Confirmation:**

```sql
-- bookings table
booking_id: 456
status: 'confirmed'          -- ✅ Updated
payment_status: 'paid'       -- ✅ Updated
confirmed_at: '2024-01-10 14:30:00'

-- room_bookings table
booking_id: 456
room_type_id: 3
inventory_id: NULL           -- ⏳ Still NULL - room assigned on arrival

-- payment_transactions table
transaction_id: 999
status: 'completed'          -- ✅ Updated
payment_gateway_id: 'stripe_ch_abc123'
gateway_response: '{"status":"succeeded",...}'

-- room_assignments table
(Still no record - will be created when guest arrives)
```

---

## 8. KEY DIFFERENCES AFTER REFACTORING

### **Before Refactoring:**
- ❌ `room_bookings.inventory_id` was NOT NULL
- ❌ Had to select specific room at booking time
- ❌ No `room_type_id` field
- ❌ Couldn't book "just a Deluxe Room"

### **After Refactoring:**
- ✅ `room_bookings.room_type_id` is NOT NULL (always know what type was booked)
- ✅ `room_bookings.inventory_id` is NULLABLE (always NULL at booking, assigned on arrival)
- ✅ Book by room type only - no pre-assignment option
- ✅ Specific rooms assigned when guests arrive
- ✅ Clear separation: booking (what type) vs assignment (which specific room)

---

## 9. FRONTEND INTEGRATION NOTES

### **Booking Form Should Collect:**

**Required Fields:**
1. Room type selection (dropdown/cards showing available room types)
2. Check-in date
3. Check-out date
4. Guest name
5. Guest email
6. Guest phone number
7. Number of adults (minimum 1)

**Optional Fields:**
8. Number of children (defaults to 0)
9. Guest ID type (passport, national_id, driving_license)
10. Guest ID number
11. Special requests (text area)
12. Early check-in (checkbox)
13. Late checkout (checkbox)
14. Extra bed count (number input)
15. Payment method (card, paypal, stripe, bank_transfer, mobile_money)

### **After Booking Creation:**
1. Show booking confirmation with booking reference
2. Display pricing breakdown (room amount, fees, taxes, total)
3. Show message: "Your room will be assigned when you arrive"
4. If payment_method provided, redirect to payment gateway
5. After payment, call payment confirmation endpoint
6. Show final confirmation with booking details

### **Display Considerations:**
- Always show "Room will be assigned upon arrival" (inventory_id is always NULL)
- Display room type name and description
- Show special requests prominently for staff to see
- Display all pricing details clearly
- Show booking status (pending → confirmed after payment)

---

## 10. TESTING EXAMPLES

### **Test Case 1: Book by Room Type**
```bash
curl -X POST http://localhost:3000/api/room-bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "room_type_id": 1,
    "check_in_date": "2024-02-01",
    "check_out_date": "2024-02-05",
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "guest_phone": "+250788000000",
    "number_of_adults": 2,
    "payment_method": "card"
  }'
```

### **Test Case 2: Confirm Payment**
```bash
curl -X POST http://localhost:3000/api/room-bookings/payment/999 \
  -H "Content-Type: application/json" \
  -d '{
    "payment_gateway_id": "test_payment_123",
    "gateway_response": {
      "status": "succeeded",
      "amount": 430500
    }
  }'
```

---

## Summary

The refactored system now supports a **single, streamlined booking workflow**:

1. **Book by Room Type** - Guests book a room type (e.g., "Deluxe Room")
2. **Payment Confirmation** - Payment is processed and booking is confirmed
3. **Room Assignment on Arrival** - Staff assigns specific room when guest arrives

**Key Benefits:**
- ✅ Simplified booking process - no need to select specific rooms
- ✅ Flexibility for hotel operations - assign best available room on arrival
- ✅ Consider special requests during assignment (high floor, quiet area, etc.)
- ✅ Better inventory management - no rooms locked to specific bookings
- ✅ Clear audit trail - all assignments tracked in `room_assignments` table

**Data Flow:**
- `room_bookings.room_type_id` = REQUIRED (what type was booked)
- `room_bookings.inventory_id` = NULL (no specific room at booking time)
- Room assigned via Room Assignment interface when guest arrives
- `room_assignments` table tracks all assignment history

---

## 11. AVAILABILITY CHECKING & OVERBOOKING PREVENTION

### **Critical: Consistent Availability Logic**

⚠️ **IMPORTANT:** The booking creation and availability endpoints MUST use identical logic to prevent inconsistencies.

### **Date Overlap Formula (Standard)**

Two date ranges overlap if and only if:
```javascript
(check_in_date < end_date) AND (check_out_date > start_date)
```

**Example:**
- Existing booking: Dec 01 - Dec 05
- New booking request: Dec 03 - Dec 07
- Check: (Dec 01 < Dec 07) AND (Dec 05 > Dec 03) = TRUE → **OVERLAP** ❌

### **Same-Day Turnover (Allowed)**

When checkout date equals checkin date, there is NO overlap:
```javascript
// Guest A: Nov 28 - Dec 01 (checkout Dec 01)
// Guest B: Dec 01 - Dec 05 (checkin Dec 01)
// Check: (Nov 28 < Dec 05) AND (Dec 01 > Dec 01) = FALSE → **NO OVERLAP** ✅
```

### **Database Views vs. Direct Queries**

**❌ DO NOT use `room_availability_view` for date range checking:**
- The view uses LEFT JOIN which only shows ONE booking per room
- Rooms with multiple bookings will show incorrect availability
- This causes false positives (showing available when actually booked)

**✅ DO use direct queries with NOT EXISTS:**
```sql
-- Correct way to check availability
SELECT ri.inventory_id
FROM room_inventory ri
WHERE ri.room_type_id = ?
  AND ri.status = 'available'
  AND NOT EXISTS (
    SELECT 1 
    FROM room_bookings rb
    JOIN bookings b ON rb.booking_id = b.booking_id
    WHERE rb.inventory_id = ri.inventory_id
      AND b.status IN ('confirmed', 'pending', 'checked_in')
      AND rb.check_in_date < ?  -- end_date
      AND rb.check_out_date > ? -- start_date
  );
```

**✅ OR use the `is_room_available()` function:**
```sql
SELECT is_room_available(inventory_id, '2025-12-01', '2025-12-02') as is_available
FROM room_inventory
WHERE room_type_id = 8;
```

### **Availability Endpoint Fix**

The availability endpoint has been fixed to use the same logic as booking creation:

**Before (WRONG):**
- Used `room_availability_view` with LEFT JOIN
- Only checked ONE booking per room
- Showed rooms as available when they had other bookings

**After (CORRECT):**
- Uses direct query with NOT EXISTS
- Checks ALL bookings for each room
- Uses identical date overlap formula as booking creation

**See:** `ROOM_AVAILABILITY_VIEW_FIX.md` for complete details

### **Testing Consistency**

Always test that both endpoints return the same result:

```bash
# 1. Check availability
curl "http://localhost:3000/api/room-availability/available-rooms?room_type_id=8&check_in_date=2025-12-01&check_out_date=2025-12-02"

# 2. Try to book (should match availability result)
curl -X POST "http://localhost:3000/api/room-bookings/create" \
  -H "Content-Type: application/json" \
  -d '{
    "room_type_id": 8,
    "check_in_date": "2025-12-01",
    "check_out_date": "2025-12-02",
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "guest_phone": "+250788123456",
    "number_of_adults": 2
  }'
```

**Expected:** If availability shows 0 rooms, booking should fail with "All X rooms are already booked"

### **Related Documentation**

- `ROOM_AVAILABILITY_VIEW_FIX.md` - Complete fix for the availability view
- `AVAILABILITY_ENDPOINT_FIX.md` - Details of the endpoint fix
- `OVERBOOKING_PREVENTION.md` - Overbooking prevention strategy
- `ROOM_AVAILABILITY_VIEW_ANALYSIS.md` - Analysis of all affected endpoints