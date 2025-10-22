# Testing Availability Query - Debugging Guide

## Issue Reported
- Booking endpoint says: "All 6 rooms are already booked"
- Availability endpoint shows: 1 room available (inventory_id: 6, room_number: 202)
- Dates: 2025-12-01 to 2025-12-02
- Room Type: Deluxe Room (room_type_id: 8)

## Root Cause
The date overlap detection logic was too complex and incorrectly counting overlaps.

## Fix Applied
Changed from complex 3-condition OR logic to simple standard date range overlap:

### Before (INCORRECT):
```sql
AND (
  (rb.check_in_date < ? AND rb.check_out_date > ?)
  OR (rb.check_in_date >= ? AND rb.check_in_date < ?)
  OR (rb.check_out_date > ? AND rb.check_out_date <= ?)
)
```

### After (CORRECT):
```sql
AND rb.check_in_date < ?      -- Existing starts before new ends
AND rb.check_out_date > ?     -- Existing ends after new starts
```

## How to Test

### 1. Check Total Rooms for Room Type 8
```sql
SELECT COUNT(*) as total_rooms
FROM room_inventory 
WHERE room_type_id = 8
  AND status IN ('available', 'occupied', 'reserved');
```
**Expected:** 6 rooms

### 2. Check Existing Bookings for Dec 01-02
```sql
SELECT 
  rb.booking_id,
  rb.inventory_id,
  rb.check_in_date,
  rb.check_out_date,
  b.status,
  b.booking_reference
FROM room_bookings rb
INNER JOIN bookings b ON rb.booking_id = b.booking_id
WHERE rb.room_type_id = 8
  AND b.status IN ('confirmed', 'pending', 'checked_in')
  AND rb.check_in_date < '2025-12-02'
  AND rb.check_out_date > '2025-12-01'
ORDER BY rb.check_in_date;
```
**Expected:** Should show actual overlapping bookings (likely 5 or fewer)

### 3. Check Which Rooms Are Actually Booked
```sql
SELECT 
  ri.inventory_id,
  ri.unit_number as room_number,
  ri.status,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM room_bookings rb
      INNER JOIN bookings b ON rb.booking_id = b.booking_id
      WHERE rb.inventory_id = ri.inventory_id
        AND b.status IN ('confirmed', 'pending', 'checked_in')
        AND rb.check_in_date < '2025-12-02'
        AND rb.check_out_date > '2025-12-01'
    ) THEN 'BOOKED'
    ELSE 'AVAILABLE'
  END as booking_status
FROM room_inventory ri
WHERE ri.room_type_id = 8
ORDER BY ri.unit_number;
```
**Expected:** Should show room 202 (inventory_id: 6) as AVAILABLE

### 4. Full Availability Check (What the Code Does)
```sql
SELECT 
  (SELECT COUNT(*) 
   FROM room_inventory 
   WHERE room_type_id = 8
     AND status IN ('available', 'occupied', 'reserved')
  ) as total_rooms,
  (SELECT COUNT(DISTINCT COALESCE(rb.inventory_id, rb.booking_id))
   FROM room_bookings rb
   INNER JOIN bookings b ON rb.booking_id = b.booking_id
   WHERE rb.room_type_id = 8
     AND b.status IN ('confirmed', 'pending', 'checked_in')
     AND rb.check_in_date < '2025-12-02'
     AND rb.check_out_date > '2025-12-01'
  ) as booked_rooms;
```
**Expected:** 
- total_rooms: 6
- booked_rooms: 5 (or fewer)
- available_rooms: 1 (or more)

## Understanding the Date Logic

### Overlap Detection Formula
```
Two date ranges overlap if and only if:
  (range1_start < range2_end) AND (range1_end > range2_start)
```

### Examples with Dec 01-02 Booking

| Existing Booking | Check-in | Check-out | Overlaps? | Why? |
|-----------------|----------|-----------|-----------|------|
| Booking A | Nov 30 | Dec 01 | ❌ NO | Ends exactly when new starts (same-day checkout/checkin allowed) |
| Booking B | Nov 30 | Dec 02 | ✅ YES | Nov 30 < Dec 02 AND Dec 02 > Dec 01 |
| Booking C | Dec 01 | Dec 02 | ✅ YES | Dec 01 < Dec 02 AND Dec 02 > Dec 01 (exact match) |
| Booking D | Dec 01 | Dec 03 | ✅ YES | Dec 01 < Dec 02 AND Dec 03 > Dec 01 |
| Booking E | Nov 28 | Dec 05 | ✅ YES | Nov 28 < Dec 02 AND Dec 05 > Dec 01 (spans entire period) |
| Booking F | Dec 02 | Dec 05 | ❌ NO | Starts exactly when new ends (same-day checkout/checkin allowed) |

### Key Insight
- Check-out date = Check-in date is **NOT** an overlap
- This allows same-day turnover (guest checks out Dec 01, new guest checks in Dec 01)

## Debugging Steps

If the issue persists after the fix:

### Step 1: Enable Query Logging
Add this before the capacityCheck query in `roomBooking.routes.js`:

```javascript
console.log('=== AVAILABILITY CHECK DEBUG ===');
console.log('Room Type ID:', room_type_id);
console.log('Check-in Date:', check_in_date);
console.log('Check-out Date:', check_out_date);
```

Add this after the query:

```javascript
console.log('Total Rooms:', total_rooms);
console.log('Booked Rooms:', booked_rooms);
console.log('Available Rooms:', available_rooms);
console.log('=== END DEBUG ===');
```

### Step 2: Check Database Directly
Run the test queries above in your MySQL client to see actual data.

### Step 3: Check for Data Issues
- Are there cancelled bookings still marked as 'confirmed'?
- Are there old bookings that should be 'checked_out'?
- Are there duplicate bookings in the database?

### Step 4: Verify Room Inventory
```sql
SELECT * FROM room_inventory WHERE room_type_id = 8;
```
Ensure all 6 rooms exist and have correct status.

## Expected Behavior After Fix

### Test Case: Book Dec 01-02 for Room Type 8
1. **First booking:** ✅ SUCCESS (1 of 6 rooms booked)
2. **Second booking:** ✅ SUCCESS (2 of 6 rooms booked)
3. **Third booking:** ✅ SUCCESS (3 of 6 rooms booked)
4. **Fourth booking:** ✅ SUCCESS (4 of 6 rooms booked)
5. **Fifth booking:** ✅ SUCCESS (5 of 6 rooms booked)
6. **Sixth booking:** ✅ SUCCESS (6 of 6 rooms booked)
7. **Seventh booking:** ❌ REJECTED - "All 6 rooms are already booked"

### Test Case: Overlapping Dates
```
Existing: Dec 01-05 (5 rooms booked)
New: Dec 03-07
Result: ✅ SUCCESS (1 room still available for Dec 03-07)
```

### Test Case: Non-Overlapping Dates
```
Existing: Dec 01-05 (6 rooms booked)
New: Dec 05-10 (check-in on checkout day)
Result: ✅ SUCCESS (all 6 rooms available, no overlap)
```

## Performance Considerations

The query uses:
- Subqueries for clarity
- `DISTINCT COALESCE(rb.inventory_id, rb.booking_id)` to handle both assigned and unassigned bookings
- Indexed columns for fast lookups

### Recommended Indexes
```sql
CREATE INDEX idx_room_inventory_type_status 
  ON room_inventory(room_type_id, status);

CREATE INDEX idx_room_bookings_type_dates 
  ON room_bookings(room_type_id, check_in_date, check_out_date);

CREATE INDEX idx_bookings_status 
  ON bookings(status);
```

## Summary

✅ **Fixed:** Simplified date overlap logic from 3 OR conditions to 2 AND conditions
✅ **Result:** Accurate availability checking that matches the availability endpoint
✅ **Benefit:** No more false "all rooms booked" errors when rooms are actually available

---

**Date Fixed:** 2024
**Issue:** Date overlap logic was too complex and incorrectly counting bookings
**Solution:** Use standard date range overlap formula: `(start1 < end2) AND (end1 > start2)`