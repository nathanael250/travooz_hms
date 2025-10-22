# Availability Endpoint Fix - Date Overlap Logic Alignment

## Problem Summary

**Issue:** The availability endpoint (`/api/room-availability/available-rooms`) was showing rooms as available when the booking creation endpoint correctly rejected them as fully booked.

**Example:**
- **Availability Endpoint:** Shows 1 room available (Room 202, inventory_id: 6)
- **Booking Creation:** Rejects with "All 6 rooms are already booked"

**Dates:** 2025-12-01 to 2025-12-02  
**Room Type:** Deluxe Room (room_type_id: 8)

---

## Root Cause

The availability endpoint was using `room_availability_view`, which has a **fundamental design flaw**:

### The Flawed View Logic

```sql
CREATE VIEW room_availability_view AS
SELECT 
    ri.inventory_id,
    ri.room_type_id,
    rt.name as room_type,
    ri.unit_number,
    ri.floor,
    ri.status as room_status,
    CASE 
        WHEN rb.booking_id IS NULL THEN 'available'
        WHEN rb.check_in_date <= CURDATE() AND rb.check_out_date > CURDATE() THEN 'occupied'
        WHEN rb.check_in_date > CURDATE() THEN 'reserved'
        ELSE 'available'
    END as current_status,
    rb.check_in_date,
    rb.check_out_date
FROM room_inventory ri
LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
LEFT JOIN room_bookings rb ON ri.inventory_id = rb.inventory_id
    AND rb.check_out_date > CURDATE()  -- ❌ PROBLEM: Only shows ONE booking per room
ORDER BY ri.inventory_id, rb.check_in_date;
```

### Why This Fails

1. **Single Booking Per Room:** The `LEFT JOIN` can only show ONE booking per room (the one matching the join condition)
2. **Multiple Bookings Ignored:** A room can have MULTIPLE bookings for different date ranges, but the view only shows one
3. **Incomplete Data:** When checking availability for a specific date range, the view doesn't show ALL overlapping bookings

**Example Scenario:**

Room 202 has these bookings:
- Nov 15-20 ✅ (shown in view if check_out_date > CURDATE())
- Nov 25-30 ❌ (not shown - only one booking per room in view)
- **Dec 01-02** ❌ (not shown - hidden by the LEFT JOIN limitation)
- Dec 05-10 ❌ (not shown)
- Dec 15-20 ❌ (not shown)

When you query for Dec 01-02 availability:
- **View shows:** Room 202 has a booking for Nov 15-20 (doesn't overlap Dec 01-02) → **Available** ✅
- **Reality:** Room 202 has a booking for Dec 01-02 → **NOT Available** ❌

### The Endpoint's Flawed Logic

The old endpoint query tried to compensate:

```javascript
// OLD (INCORRECT) - Tried to use the flawed view
whereConditions = [
  'rav.current_status = "available"',
  '(rav.check_in_date IS NULL OR rav.check_out_date <= ? OR rav.check_in_date >= ?)'
];
```

**Problem:** This logic assumes the view shows ALL bookings, but it doesn't!

---

## Solution

### Replaced View-Based Query with Direct Booking Check

The fix **abandons the flawed view** and queries `room_inventory` and `room_bookings` directly, using the **same date overlap logic** as the booking creation endpoint.

### New Query Logic

```sql
SELECT 
  ri.inventory_id,
  ri.room_type_id,
  rt.name as room_type,
  ri.unit_number as room_number,
  ri.floor,
  ri.status as room_status,
  'available' as current_status,
  rt.homestay_id,
  h.name as homestay_name,
  rt.price as base_price,
  rt.max_people as max_occupancy,
  rt.description as room_description
FROM room_inventory ri
LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
LEFT JOIN homestays h ON rt.homestay_id = h.homestay_id
WHERE ri.status IN ('available', 'occupied', 'reserved')
  AND NOT EXISTS (
    SELECT 1
    FROM room_bookings rb
    INNER JOIN bookings b ON rb.booking_id = b.booking_id
    WHERE rb.inventory_id = ri.inventory_id
      AND b.status IN ('confirmed', 'pending', 'checked_in')
      AND rb.check_in_date < ?      -- Existing starts before new ends
      AND rb.check_out_date > ?     -- Existing ends after new starts
  )
ORDER BY h.name, rt.name, ri.unit_number
```

### Key Changes

1. **Direct Query:** Queries `room_inventory` directly instead of using the view
2. **NOT EXISTS Subquery:** Checks for ANY overlapping booking (not just one)
3. **Same Date Logic:** Uses identical date overlap formula as booking creation:
   - `rb.check_in_date < end_date` (existing starts before new ends)
   - `rb.check_out_date > start_date` (existing ends after new starts)
4. **All Bookings Checked:** The subquery checks ALL bookings for each room, not just one

---

## Comparison: Before vs After

### Before (INCORRECT)

| Component | Logic | Problem |
|-----------|-------|---------|
| **View** | `LEFT JOIN` with `rb.check_out_date > CURDATE()` | Only shows ONE booking per room |
| **Endpoint** | Filters view results by date range | Misses hidden bookings |
| **Result** | Shows rooms as available when they're actually booked | ❌ False positives |

### After (CORRECT)

| Component | Logic | Benefit |
|-----------|-------|---------|
| **Query** | Direct query to `room_inventory` | No view limitations |
| **Subquery** | `NOT EXISTS` checks ALL bookings | Finds ALL overlaps |
| **Date Logic** | Same as booking creation | Consistent results |
| **Result** | Shows only truly available rooms | ✅ Accurate |

---

## Testing the Fix

### Test Case 1: Your Specific Scenario

**Request:**
```bash
GET /api/room-availability/available-rooms?start_date=2025-12-01&end_date=2025-12-02&room_type_id=8
```

**Expected Result (After Fix):**
```json
{
  "success": true,
  "data": {
    "available_rooms": [],  // ✅ Empty - no rooms available
    "count": 0,
    "search_criteria": {
      "start_date": "2025-12-01",
      "end_date": "2025-12-02",
      "room_type_id": "8"
    }
  }
}
```

**Booking Creation (Should Match):**
```json
{
  "success": false,
  "message": "No rooms available for Deluxe Room from 2025-12-01 to 2025-12-02. All 6 rooms are already booked."
}
```

✅ **Both endpoints now agree: No rooms available**

### Test Case 2: Verify Available Rooms

Find a date range where rooms ARE available:

```bash
GET /api/room-availability/available-rooms?start_date=2025-12-15&end_date=2025-12-16&room_type_id=8
```

Then try to book:

```bash
POST /api/room-bookings/create
{
  "room_type_id": 8,
  "check_in_date": "2025-12-15",
  "check_out_date": "2025-12-16",
  "guest_name": "Test User",
  "guest_email": "test@example.com",
  "guest_phone": "+250788123456",
  "number_of_adults": 2
}
```

✅ **Both should succeed if rooms are available**

### Test Case 3: Same-Day Turnover

```bash
# Check availability for Dec 10-11
GET /api/room-availability/available-rooms?start_date=2025-12-10&end_date=2025-12-11

# If a booking exists for Dec 09-10 (checkout Dec 10)
# Room should be AVAILABLE for Dec 10-11 (checkin Dec 10)
```

✅ **Same-day turnover allowed (checkout date = checkin date is NOT an overlap)**

---

## SQL Debugging Queries

### Check Total Rooms for Room Type 8

```sql
SELECT COUNT(*) as total_rooms
FROM room_inventory 
WHERE room_type_id = 8
  AND status IN ('available', 'occupied', 'reserved');
```

### Check Overlapping Bookings for Dec 01-02

```sql
SELECT 
  rb.inventory_id,
  ri.unit_number as room_number,
  rb.check_in_date,
  rb.check_out_date,
  b.status
FROM room_bookings rb
INNER JOIN bookings b ON rb.booking_id = b.booking_id
INNER JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
WHERE rb.room_type_id = 8
  AND b.status IN ('confirmed', 'pending', 'checked_in')
  AND rb.check_in_date < '2025-12-02'
  AND rb.check_out_date > '2025-12-01'
ORDER BY rb.inventory_id, rb.check_in_date;
```

### Check Available Rooms (New Logic)

```sql
SELECT 
  ri.inventory_id,
  ri.unit_number as room_number,
  ri.status
FROM room_inventory ri
WHERE ri.room_type_id = 8
  AND ri.status IN ('available', 'occupied', 'reserved')
  AND NOT EXISTS (
    SELECT 1
    FROM room_bookings rb
    INNER JOIN bookings b ON rb.booking_id = b.booking_id
    WHERE rb.inventory_id = ri.inventory_id
      AND b.status IN ('confirmed', 'pending', 'checked_in')
      AND rb.check_in_date < '2025-12-02'
      AND rb.check_out_date > '2025-12-01'
  );
```

---

## Files Modified

### 1. `/backend/src/routes/roomAvailability.routes.js`

**Lines Changed:** 350-438 (approximately)

**Changes:**
- Replaced view-based query with direct `room_inventory` query
- Added `NOT EXISTS` subquery to check for overlapping bookings
- Used same date overlap logic as booking creation
- Updated comments to explain the new approach

**Before:**
```javascript
// Used room_availability_view with flawed date filtering
FROM room_availability_view rav
WHERE rav.current_status = "available"
  AND (rav.check_in_date IS NULL OR rav.check_out_date <= ? OR rav.check_in_date >= ?)
```

**After:**
```javascript
// Direct query with NOT EXISTS subquery
FROM room_inventory ri
WHERE NOT EXISTS (
  SELECT 1 FROM room_bookings rb
  WHERE rb.inventory_id = ri.inventory_id
    AND rb.check_in_date < ?
    AND rb.check_out_date > ?
)
```

---

## Impact Analysis

### ✅ Benefits

1. **Consistency:** Availability and booking creation now use identical logic
2. **Accuracy:** No more false positives (showing available when actually booked)
3. **Reliability:** Checks ALL bookings, not just one per room
4. **Maintainability:** Single source of truth for date overlap logic
5. **Performance:** `NOT EXISTS` with proper indexes is efficient

### ⚠️ Considerations

1. **View Still Exists:** `room_availability_view` is still in the database but no longer used by this endpoint
2. **Other Endpoints:** Other endpoints may still use the view - they should be reviewed
3. **Indexes Needed:** Ensure these indexes exist for performance:
   - `idx_room_inventory_type_status` on `room_inventory(room_type_id, status)`
   - `idx_room_bookings_inventory_dates` on `room_bookings(inventory_id, check_in_date, check_out_date)`
   - `idx_bookings_status` on `bookings(status)`

### 🔍 Other Endpoints to Review

These endpoints also use `room_availability_view` and may need similar fixes:

1. `/api/room-availability/calendar` (line 227)
2. `/api/room-availability/homestays/:homestay_id/rooms` (line 306)
3. `/api/room-availability/rooms` (line 561)
4. `/api/room-availability/rooms/:inventory_id` (line 612)

**Recommendation:** Review each endpoint to determine if it needs the same fix.

---

## Recommended Next Steps

### 1. Test the Fix

```bash
# Test your specific scenario
curl "http://localhost:3000/api/room-availability/available-rooms?start_date=2025-12-01&end_date=2025-12-02&room_type_id=8"

# Should return empty array (no rooms available)
```

### 2. Verify Consistency

```bash
# Try to create a booking for the same dates
curl -X POST http://localhost:3000/api/room-bookings/create \
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

# Should also reject (all rooms booked)
```

### 3. Check Database Indexes

```sql
-- Verify indexes exist
SHOW INDEX FROM room_inventory WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM room_bookings WHERE Key_name LIKE 'idx_%';
SHOW INDEX FROM bookings WHERE Key_name LIKE 'idx_%';

-- Create missing indexes if needed
CREATE INDEX idx_room_inventory_type_status ON room_inventory(room_type_id, status);
CREATE INDEX idx_room_bookings_inventory_dates ON room_bookings(inventory_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### 4. Review Other Endpoints

Check if other endpoints using `room_availability_view` need similar fixes.

---

## Summary

**Problem:** Availability endpoint used a flawed view that only showed ONE booking per room, causing false positives.

**Solution:** Replaced view-based query with direct query using `NOT EXISTS` subquery and the same date overlap logic as booking creation.

**Result:** ✅ Both endpoints now use consistent logic and will show the same availability results.

**Status:** **FIXED** - Ready for testing

---

## Date Overlap Logic Reference

For future reference, the standard date range overlap formula is:

```
Two date ranges overlap if and only if:
  (range1_start < range2_end) AND (range1_end > range2_start)
```

**Applied to bookings:**
```sql
-- Existing booking overlaps with new booking if:
WHERE rb.check_in_date < new_check_out_date
  AND rb.check_out_date > new_check_in_date
```

**Examples for Dec 01-02 booking:**

| Existing Booking | Overlaps? | Why |
|-----------------|-----------|-----|
| Nov 30 to Dec 01 | ❌ NO | Dec 01 < Dec 02 ✅ BUT Dec 01 > Dec 01 ❌ |
| Nov 30 to Dec 02 | ✅ YES | Nov 30 < Dec 02 ✅ AND Dec 02 > Dec 01 ✅ |
| Dec 01 to Dec 02 | ✅ YES | Dec 01 < Dec 02 ✅ AND Dec 02 > Dec 01 ✅ |
| Dec 01 to Dec 03 | ✅ YES | Dec 01 < Dec 02 ✅ AND Dec 03 > Dec 01 ✅ |
| Dec 02 to Dec 05 | ❌ NO | Dec 02 < Dec 02 ❌ |

This formula is used consistently in both:
- Booking creation availability check
- Availability endpoint (after this fix)