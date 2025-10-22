# 🏨 Front Desk System - Implementation Guide

## ✅ What Has Been Implemented

### **Step 6: Automatic Room Assignment (Pre-Arrival)**

When a booking payment is confirmed, the system automatically:

1. **Finds an available, clean room** matching the booked room type
2. **Creates a room assignment** record
3. **Updates room status** to 'reserved'

**Implementation Location:** `/backend/src/routes/roomBooking.routes.js` (lines 507-582)

**Logic:**
```sql
-- Find available clean room
SELECT ri.inventory_id, ri.unit_number
FROM room_inventory ri
LEFT JOIN room_status_log rsl ON ri.inventory_id = rsl.inventory_id 
WHERE ri.room_type_id = ?
  AND ri.status = 'available'
  AND (rsl.cleanliness_status = 'clean' OR rsl.cleanliness_status IS NULL)
  AND ri.inventory_id NOT IN (
    SELECT inventory_id 
    FROM room_assignments 
    WHERE status IN ('assigned', 'checked_in')
  )
LIMIT 1

-- Create assignment
INSERT INTO room_assignments (booking_id, inventory_id, assigned_by, assigned_at, status)
VALUES (?, ?, NULL, NOW(), 'assigned')

-- Update room status
UPDATE room_inventory SET status = 'reserved' WHERE inventory_id = ?
```

---

### **Step 7: Front Desk "Upcoming Arrivals" Dashboard**

A complete dashboard for front desk staff to manage guest arrivals.

**Frontend:** `/frontend/src/pages/frontdesk/UpcomingArrivals.jsx`
**Backend API:** `/backend/src/routes/frontDesk.routes.js`

#### **Features:**

1. **📅 View Upcoming Arrivals**
   - Filter by date range (1, 3, 7, 14, 30 days)
   - Filter by specific date
   - Filter by booking status (confirmed, pre_registered)
   - Grouped by check-in date

2. **📊 Dashboard Statistics**
   - Total arrivals
   - Today's arrivals
   - Rooms assigned
   - Guests checked in

3. **👤 Guest Information Display**
   - Guest name, phone, email
   - ID type and number
   - Number of adults/children
   - Special requests
   - Booking reference
   - Total amount

4. **🏠 Room Assignment Info**
   - Homestay name
   - Room type
   - Assigned room number
   - Room floor
   - Assignment status

5. **✅ Check-In Process**
   - One-click check-in for today's arrivals
   - Key card number entry
   - Check-in notes
   - Automatic status updates

---

## 🚀 How to Use

### **1. Access the Front Desk Dashboard**

Navigate to: `http://localhost:5173/front-desk/upcoming-arrivals`

### **2. View Upcoming Arrivals**

The dashboard shows all confirmed bookings with:
- ✅ **Green badge**: Confirmed booking
- 🔵 **Blue badge**: Pre-registered
- 🟢 **Room Assigned**: Room has been auto-assigned
- ⚪ **Not Assigned**: No room assigned yet

### **3. Check In a Guest (Today's Arrivals Only)**

For guests arriving today with assigned rooms:

1. Click **"Check In"** button
2. Enter **Key Card Number** (e.g., KC-12345)
3. Add optional **Notes**
4. Click **"Confirm Check-In"**

**What happens:**
- Room assignment status → `checked_in`
- Room inventory status → `occupied`
- Check-in time recorded
- Key card number saved

---

## 📡 API Endpoints

### **1. Get Upcoming Arrivals**
```http
GET /api/front-desk/upcoming-arrivals
Authorization: Bearer {token}

Query Parameters:
- days: Number of days ahead (default: 7)
- date: Specific date (YYYY-MM-DD)
- status: confirmed | pre_registered | all (default: all)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_arrivals": 5,
    "arrivals": [
      {
        "booking_id": 78,
        "booking_reference": "TRV-42143807TBDM",
        "booking_status": "confirmed",
        "payment_status": "paid",
        "check_in_date": "2025-02-20",
        "check_out_date": "2025-02-23",
        "nights": 3,
        "guest_name": "John Doe",
        "guest_phone": "+250788123456",
        "guest_email": "john@example.com",
        "guest_id_type": "National ID",
        "guest_id_number": "1234567890123456",
        "number_of_adults": 2,
        "number_of_children": 0,
        "room_type": "Deluxe Room",
        "homestay_name": "Kigali Heights Hotel",
        "assignment_id": 15,
        "assignment_status": "assigned",
        "assigned_room_number": "101",
        "assigned_room_floor": "1",
        "room_status": "reserved",
        "room_cleanliness": "clean",
        "total_amount": 36900.00,
        "days_until_arrival": 1,
        "special_requests": "Late check-in expected"
      }
    ],
    "grouped_by_date": {
      "2025-02-20": [...]
    }
  }
}
```

### **2. Get Today's Arrivals (Quick Access)**
```http
GET /api/front-desk/today-arrivals
Authorization: Bearer {token}
```

### **3. Check In Guest**
```http
POST /api/front-desk/check-in/{booking_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "key_card_number": "KC-12345",
  "notes": "Guest arrived early, upgraded to suite"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guest checked in successfully",
  "data": {
    "booking_id": 78,
    "assignment_id": 15,
    "check_in_time": "2025-02-19T10:30:00Z"
  }
}
```

---

## 🧪 Testing the Complete Flow

### **Test Scenario: Complete Booking to Check-In**

#### **Step 1: Create a Booking**
```bash
curl -X POST http://localhost:3001/api/room-booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": 1,
    "check_in_date": "2025-02-20",
    "check_out_date": "2025-02-23",
    "guests": 2,
    "guest_name": "Jane Smith",
    "guest_email": "jane@example.com",
    "guest_phone": "+250788999888",
    "guest_id_type": "Passport",
    "guest_id_number": "AB1234567",
    "number_of_adults": 2,
    "number_of_children": 0,
    "payment_method": "mobile_money"
  }'
```

**Expected:** Booking created with `status: pending`, `payment_status: pending`

#### **Step 2: Process Payment**
```bash
curl -X POST http://localhost:3001/api/room-booking/payment/{transaction_id} \
  -H "Content-Type: application/json" \
  -d '{
    "payment_gateway_id": "MOMO_9876543210",
    "gateway_response": {
      "status": "success",
      "transaction_ref": "TXN9876543210"
    }
  }'
```

**Expected:** 
- ✅ Booking status → `confirmed`
- ✅ Payment status → `paid`
- ✅ **Room automatically assigned** (Step 6)
- ✅ Room status → `reserved`

#### **Step 3: View in Front Desk Dashboard**

1. Login to frontend
2. Navigate to **Front Desk → Upcoming Arrivals**
3. You should see the booking with:
   - ✅ Confirmed status
   - ✅ Room assigned (e.g., Room 101)
   - ✅ Guest details visible

#### **Step 4: Check In Guest (On Arrival Day)**

1. Click **"Check In"** button
2. Enter key card: `KC-20250220-001`
3. Add note: `Guest arrived on time`
4. Click **"Confirm Check-In"**

**Expected:**
- ✅ Assignment status → `checked_in`
- ✅ Room status → `occupied`
- ✅ Check-in time recorded
- ✅ Success notification

---

## 📊 Database Changes

### **Tables Involved:**

1. **`room_assignments`** - Stores room assignments
   - `assignment_id` (PK)
   - `booking_id` (FK → bookings)
   - `inventory_id` (FK → room_inventory)
   - `assigned_by` (NULL for auto-assignment)
   - `assigned_at`
   - `check_in_time`
   - `check_out_time`
   - `key_card_issued`
   - `status` (assigned, checked_in, checked_out, cancelled)

2. **`room_inventory`** - Room status updated
   - `status`: available → reserved → occupied

3. **`bookings`** - Booking status
   - `status`: pending → confirmed
   - `payment_status`: pending → paid

---

## 🔍 Troubleshooting

### **Issue: No room assigned after payment**

**Possible causes:**
1. No available rooms of the booked type
2. All rooms are dirty (cleanliness_status != 'clean')
3. All rooms already assigned

**Check:**
```sql
-- Check available rooms
SELECT ri.*, rsl.cleanliness_status
FROM room_inventory ri
LEFT JOIN room_status_log rsl ON ri.inventory_id = rsl.inventory_id
WHERE ri.room_type_id = ?
  AND ri.status = 'available';
```

### **Issue: Can't check in guest**

**Possible causes:**
1. No room assignment exists
2. Assignment status is not 'assigned'
3. Check-in date is not today

**Check:**
```sql
SELECT * FROM room_assignments WHERE booking_id = ?;
```

---

## 🎯 Next Steps

### **Recommended Enhancements:**

1. **Manual Room Assignment**
   - Allow staff to manually assign/reassign rooms
   - Room swap functionality

2. **Check-Out Process**
   - Check-out endpoint
   - Final billing
   - Room status update to 'cleaning'

3. **Early/Late Check-In Handling**
   - Time-based check-in validation
   - Early check-in fee calculation

4. **Notifications**
   - Email/SMS to guest with room number
   - Staff notifications for arrivals

5. **Room Preferences**
   - Save guest room preferences
   - Auto-assign based on preferences

---

## ✅ Summary

**What's Working:**
- ✅ Automatic room assignment on payment confirmation
- ✅ Front desk dashboard with upcoming arrivals
- ✅ Guest information display
- ✅ Room assignment tracking
- ✅ Check-in process
- ✅ Status management (booking, assignment, room)

**Access Points:**
- **Frontend:** http://localhost:5173/front-desk/upcoming-arrivals
- **API Base:** http://localhost:3001/api/front-desk

**Key Files:**
- Backend Routes: `/backend/src/routes/frontDesk.routes.js`
- Auto-Assignment: `/backend/src/routes/roomBooking.routes.js` (lines 507-582)
- Frontend Dashboard: `/frontend/src/pages/frontdesk/UpcomingArrivals.jsx`
- Model: `/backend/src/models/roomAssignment.model.js`

🎉 **The front desk system is now fully operational!**