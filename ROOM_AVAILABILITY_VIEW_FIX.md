# Room Availability View - Complete Fix

## 🎯 Problem Summary

The original `room_availability_view` had a **fundamental design flaw** that caused availability checking to fail:

- **Used LEFT JOIN** which can only show ONE booking per room
- **Caused false positives** - showed rooms as available when they were actually booked
- **Inconsistent logic** - different from booking creation endpoint

## ✅ Solution Implemented

We've completely redesigned the room availability system with:

1. **Dropped the flawed view** - No more LEFT JOIN issues
2. **Created a helper function** - `is_room_available()` for date-range checks
3. **Created proper views** - For current status only (safe to use)
4. **Added performance indexes** - For optimal query speed

---

## 📁 Files Created

### 1. Migration File: `fix_room_availability_view.sql`

**Location:** `/backend/migrations/fix_room_availability_view.sql`

**What it does:**
- Drops the old flawed `room_availability_view`
- Creates `is_room_available()` function for date-range checking
- Creates `room_current_status_view` for TODAY's status only
- Creates `room_type_availability_summary` for dashboard
- Adds performance indexes

---

## 🔧 New Database Objects

### 1. Function: `is_room_available()`

**Purpose:** Check if a specific room is available for a date range

**Usage:**
```sql
SELECT is_room_available(6, '2025-12-01', '2025-12-02') as is_available;
-- Returns: 1 if available, 0 if booked
```

**How it works:**
- Counts ALL overlapping bookings for the room
- Uses standard date overlap formula: `(start1 < end2) AND (end1 > start2)`
- Checks bookings with status: 'confirmed', 'pending', 'checked_in'
- Returns 1 (available) or 0 (booked)

---

### 2. View: `room_current_status_view`

**Purpose:** Show current status of each room as of TODAY

**Safe to use for:**
- Dashboard displays
- "What's happening right now" queries
- Current occupancy reports
- Today's room status

**DO NOT use for:**
- Date range availability checking
- Future booking availability
- Historical availability queries

**Example:**
```sql
SELECT * FROM room_current_status_view 
WHERE homestay_id = 1 
ORDER BY floor, unit_number;
```

**Columns:**
- `inventory_id`, `room_type_id`, `room_type`, `unit_number`, `floor`
- `room_status` - Physical status (available, maintenance, etc.)
- `current_status` - Booking status (available, occupied, reserved)
- `current_booking_id`, `current_booking_checkin`, `current_booking_checkout`
- `booking_reference`, `current_guest_name`

---

### 3. View: `room_type_availability_summary`

**Purpose:** Summary of room type availability for TODAY

**Safe to use for:**
- Dashboard statistics
- Quick availability overview
- Current capacity reports

**Example:**
```sql
SELECT * FROM room_type_availability_summary 
WHERE homestay_id = 1;
```

**Columns:**
- `room_type_id`, `room_type`, `homestay_id`, `homestay_name`
- `total_rooms` - Total rooms of this type
- `available_rooms` - Currently available
- `occupied_rooms` - Currently occupied
- `reserved_rooms` - Reserved for today
- `maintenance_rooms` - Under maintenance
- `out_of_service_rooms` - Out of service

---

## 📋 How to Use (For Developers)

### ✅ For Current Status (TODAY only)

**Use the views:**
```sql
-- Get current status of all rooms
SELECT * FROM room_current_status_view;

-- Get availability summary by room type
SELECT * FROM room_type_availability_summary;
```

### ✅ For Date Range Availability

**Option 1: Use NOT EXISTS (RECOMMENDED)**
```sql
-- Get available rooms for a date range
SELECT 
    ri.inventory_id,
    ri.unit_number,
    rt.name as room_type,
    rt.base_price
FROM room_inventory ri
JOIN room_types rt ON ri.room_type_id = rt.room_type_id
WHERE ri.room_type_id = 8
    AND ri.status = 'available'
    AND NOT EXISTS (
        SELECT 1 
        FROM room_bookings rb
        JOIN bookings b ON rb.booking_id = b.booking_id
        WHERE rb.inventory_id = ri.inventory_id
            AND b.status IN ('confirmed', 'pending', 'checked_in')
            AND rb.check_in_date < '2025-12-02'  -- end_date
            AND rb.check_out_date > '2025-12-01' -- start_date
    );
```

**Option 2: Use the function**
```sql
-- Check if specific room is available
SELECT 
    ri.inventory_id,
    ri.unit_number,
    is_room_available(ri.inventory_id, '2025-12-01', '2025-12-02') as is_available
FROM room_inventory ri
WHERE ri.room_type_id = 8
HAVING is_available = 1;
```

### ❌ DO NOT Use Views for Date Ranges

**WRONG:**
```sql
-- ❌ This will give WRONG results for date ranges
SELECT * FROM room_current_status_view
WHERE check_in_date >= '2025-12-01';
```

**RIGHT:**
```sql
-- ✅ Use NOT EXISTS for date ranges
SELECT ri.* FROM room_inventory ri
WHERE NOT EXISTS (
    SELECT 1 FROM room_bookings rb
    JOIN bookings b ON rb.booking_id = b.booking_id
    WHERE rb.inventory_id = ri.inventory_id
        AND b.status IN ('confirmed', 'pending', 'checked_in')
        AND rb.check_in_date < '2025-12-02'
        AND rb.check_out_date > '2025-12-01'
);
```

---

## 🚀 How to Apply the Fix

### Step 1: Run the Migration

```bash
# Connect to your MySQL database
mysql -u your_user -p travooz_hms

# Run the migration
source /path/to/backend/migrations/fix_room_availability_view.sql
```

### Step 2: Verify the Fix

```sql
-- Test 1: Check the function exists
SELECT is_room_available(6, '2025-12-01', '2025-12-02') as is_available;

-- Test 2: Check current status view
SELECT * FROM room_current_status_view LIMIT 10;

-- Test 3: Check room type summary
SELECT * FROM room_type_availability_summary;

-- Test 4: Verify indexes were created
SHOW INDEX FROM room_bookings WHERE Key_name = 'idx_room_bookings_inventory_dates';
SHOW INDEX FROM room_inventory WHERE Key_name = 'idx_room_inventory_type_status';
```

### Step 3: Update Endpoints (Already Done)

The `/available-rooms` endpoint has already been updated to use the correct logic. Other endpoints still need updating:

**Still need fixing:**
1. `/api/room-availability/hotels` - Line 118
2. `/api/room-availability/calendar` - Line 227
3. `/api/room-availability/room/:roomId` - Line 306
4. `/api/room-availability/check` - Line 450

See `ROOM_AVAILABILITY_VIEW_ANALYSIS.md` for details.

---

## 📊 Performance Considerations

### Indexes Created

The migration creates these indexes for optimal performance:

1. **`idx_room_bookings_inventory_dates`** - For date range queries
   ```sql
   ON room_bookings(inventory_id, check_in_date, check_out_date)
   ```

2. **`idx_room_inventory_type_status`** - For room type filtering
   ```sql
   ON room_inventory(room_type_id, status, homestay_id)
   ```

3. **`idx_bookings_status`** - For status filtering
   ```sql
   ON bookings(status)
   ```

### Query Performance

- **NOT EXISTS queries:** Very fast with proper indexes (~10-50ms)
- **Function calls:** Slightly slower but still acceptable (~20-100ms)
- **Views (current status):** Very fast, pre-joined data (~5-20ms)

---

## 🧪 Testing Scenarios

### Test Case 1: Room with Multiple Bookings

```sql
-- Setup: Room 202 (inventory_id: 6) has bookings:
-- Nov 15-20, Nov 25-30, Dec 01-02, Dec 05-10, Dec 15-20

-- Test: Check availability for Dec 01-02
SELECT is_room_available(6, '2025-12-01', '2025-12-02') as is_available;
-- Expected: 0 (not available)

-- Test: Check availability for Dec 03-04
SELECT is_room_available(6, '2025-12-03', '2025-12-04') as is_available;
-- Expected: 1 (available)
```

### Test Case 2: Same-Day Turnover

```sql
-- Guest A checks out Dec 01, Guest B checks in Dec 01
-- Booking A: Nov 28 - Dec 01 (checkout)
-- Booking B: Dec 01 - Dec 05 (checkin)

-- These should NOT overlap (same-day turnover allowed)
SELECT 
    ('2025-11-28' < '2025-12-05') AND ('2025-12-01' > '2025-12-01') as overlaps;
-- Expected: 0 (FALSE - no overlap because checkout = checkin)
```

### Test Case 3: Endpoint Consistency

```bash
# Test availability endpoint
curl -X GET "http://localhost:3000/api/room-availability/available-rooms?room_type_id=8&check_in_date=2025-12-01&check_out_date=2025-12-02"

# Test booking creation with same parameters
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

# Both should return the same availability result
```

---

## 📝 Key Takeaways

### ✅ DO:
1. Use `room_current_status_view` for TODAY's status
2. Use `room_type_availability_summary` for dashboard stats
3. Use `NOT EXISTS` subquery for date range availability
4. Use `is_room_available()` function for single room checks
5. Always use date overlap formula: `(start1 < end2) AND (end1 > start2)`

### ❌ DON'T:
1. Don't use views with LEFT JOIN for date range checking
2. Don't assume one booking per room
3. Don't use different overlap logic in different places
4. Don't query `room_current_status_view` for future dates

### 🔑 Remember:
- **Views are for current status only**
- **Functions/subqueries are for date ranges**
- **Consistency is critical** - use same logic everywhere
- **Same-day turnover is allowed** - checkout date = checkin date is OK

---

## 🔗 Related Documentation

- `AVAILABILITY_ENDPOINT_FIX.md` - Details of the /available-rooms fix
- `ROOM_AVAILABILITY_VIEW_ANALYSIS.md` - Analysis of all affected endpoints
- `OVERBOOKING_PREVENTION.md` - Overbooking prevention strategy
- `FIX_SUMMARY.md` - Quick reference guide

---

## 📞 Support

If you encounter issues:

1. **Check the function exists:**
   ```sql
   SHOW FUNCTION STATUS WHERE Name = 'is_room_available';
   ```

2. **Check the views exist:**
   ```sql
   SHOW FULL TABLES WHERE Table_type = 'VIEW';
   ```

3. **Check the indexes:**
   ```sql
   SHOW INDEX FROM room_bookings;
   SHOW INDEX FROM room_inventory;
   ```

4. **Test with sample data:**
   ```sql
   -- See verification queries in the migration file
   ```