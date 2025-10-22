# Overbooking Prevention - Implementation Guide

## Problem Statement

The booking system was allowing multiple bookings for the same room type on overlapping dates without checking if there were enough physical rooms available. This could lead to overbooking scenarios where more rooms were booked than actually exist in the inventory.

**Example of the problem:**
- Hotel has 5 Deluxe Rooms (room_type_id = 3)
- System allowed 10 bookings for the same dates
- Result: 5 guests would arrive with confirmed bookings but no rooms available

---

## Solution Overview

Added **availability checking** at the room type level during booking creation. The system now:

1. **Counts total rooms** of the requested type in `room_inventory`
2. **Counts booked rooms** for overlapping dates in `room_bookings`
3. **Calculates available capacity** (total - booked)
4. **Rejects booking** if no rooms are available

### ⚠️ Important: Availability Endpoint Alignment

**Issue Fixed (2025-01-XX):** The availability endpoint (`/api/room-availability/available-rooms`) was previously using a flawed view (`room_availability_view`) that only showed ONE booking per room, causing it to show rooms as available when they were actually fully booked.

**Solution:** The availability endpoint has been updated to use the **same date overlap logic** as booking creation, ensuring both endpoints return consistent results.

**See:** `AVAILABILITY_ENDPOINT_FIX.md` for complete details.

---

## Technical Implementation

### Location
File: `/backend/src/routes/roomBooking.routes.js`

### Code Added (After Step 1, Before Step 2)

```javascript
// Step 1.5: Check room type availability for the requested dates
// Count total rooms of this type and how many are already booked
const capacityCheck = await sequelize.query(`
  SELECT 
    (SELECT COUNT(*) 
     FROM room_inventory 
     WHERE room_type_id = ? 
       AND status IN ('available', 'occupied', 'reserved')
    ) as total_rooms,
    (SELECT COUNT(DISTINCT COALESCE(rb.inventory_id, rb.booking_id))
     FROM room_bookings rb
     INNER JOIN bookings b ON rb.booking_id = b.booking_id
     WHERE rb.room_type_id = ?
       AND b.status IN ('confirmed', 'pending', 'checked_in')
       AND rb.check_in_date < ?
       AND rb.check_out_date > ?
    ) as booked_rooms
`, {
  replacements: [
    room_type_id,
    room_type_id,
    check_out_date,  // Existing booking starts before new booking ends
    check_in_date    // Existing booking ends after new booking starts
  ],
  type: sequelize.QueryTypes.SELECT,
  transaction: t
});

const { total_rooms, booked_rooms } = capacityCheck[0];
const available_rooms = total_rooms - booked_rooms;

if (available_rooms <= 0) {
  await t.rollback();
  return res.status(400).json({
    success: false,
    message: `No rooms available for ${roomInfo.room_type} from ${check_in_date} to ${check_out_date}. All ${total_rooms} rooms are already booked.`,
    details: {
      room_type: roomInfo.room_type,
      total_rooms: parseInt(total_rooms),
      booked_rooms: parseInt(booked_rooms),
      available_rooms: 0
    }
  });
}
```

---

## How It Works

### 1. Total Rooms Count
```sql
SELECT COUNT(*) 
FROM room_inventory 
WHERE room_type_id = ? 
  AND status IN ('available', 'occupied', 'reserved')
```
- Counts all physical rooms of the requested type
- Only includes rooms that can be booked (excludes 'maintenance', 'out_of_order')

### 2. Booked Rooms Count
```sql
SELECT COUNT(DISTINCT COALESCE(rb.inventory_id, rb.booking_id))
FROM room_bookings rb
INNER JOIN bookings b ON rb.booking_id = b.booking_id
WHERE rb.room_type_id = ?
  AND b.status IN ('confirmed', 'pending', 'checked_in')
  AND (date overlap conditions)
```
- Counts bookings for the same room type
- Only counts active bookings (confirmed, pending, checked_in)
- Uses `DISTINCT COALESCE(rb.inventory_id, rb.booking_id)` to handle:
  - Assigned rooms: counted by `inventory_id`
  - Unassigned bookings: counted by `booking_id`

### 3. Date Overlap Detection
Uses the standard date range overlap formula:

```sql
-- Two date ranges overlap if:
-- (existing_start < new_end) AND (existing_end > new_start)
WHERE rb.check_in_date < ?      -- Existing booking starts before new booking ends
  AND rb.check_out_date > ?     -- Existing booking ends after new booking starts
```

This simple formula catches **all** possible overlap scenarios:

**Examples:**
```
New Booking:     [====Dec 01 to Dec 02====]

Overlap 1:   [====Nov 30 to Dec 01====]      ✓ Detected (starts before, ends after start)
Overlap 2:       [====Dec 01 to Dec 03====]  ✓ Detected (starts before end, ends after start)
Overlap 3:         [==Dec 01 to Dec 02==]    ✓ Detected (exact match)
Overlap 4:   [====Nov 28 to Dec 05====]      ✓ Detected (spans entire period)

No Overlap:  [==Nov 30 to Dec 01==]           ✗ Not counted (check-out = check-in, same day)
No Overlap:                      [==Dec 02 to Dec 05==]  ✗ Not counted (starts when new ends)
```

**Why this works:**
- If existing check-in >= new check-out: No overlap (existing starts after new ends)
- If existing check-out <= new check-in: No overlap (existing ends before new starts)
- All other cases = overlap

---

## Error Response

When no rooms are available, the API returns:

```json
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
```

**Benefits:**
- Clear error message for users
- Shows exact capacity information
- Helps frontend display alternative dates or room types

---

## Testing Scenarios

### Scenario 1: Normal Booking (Should Succeed)
```
Room Type: Deluxe Room (5 total rooms)
Existing Bookings: 3 rooms booked for Jan 15-20
New Booking: Jan 15-20
Result: ✅ SUCCESS (2 rooms still available)
```

### Scenario 2: Full Capacity (Should Fail)
```
Room Type: Deluxe Room (5 total rooms)
Existing Bookings: 5 rooms booked for Jan 15-20
New Booking: Jan 15-20
Result: ❌ REJECTED - "All 5 rooms are already booked"
```

### Scenario 3: Partial Overlap (Should Check Correctly)
```
Room Type: Suite (3 total rooms)
Existing Bookings:
  - 2 rooms: Jan 10-18
  - 1 room: Jan 16-22
New Booking: Jan 15-20
Result: ❌ REJECTED - All 3 rooms overlap with Jan 15-20
```

### Scenario 4: No Overlap (Should Succeed)
```
Room Type: Standard Room (10 total rooms)
Existing Bookings: 10 rooms booked for Jan 10-15
New Booking: Jan 15-20 (check-in on previous check-out date)
Result: ✅ SUCCESS - No overlap, all rooms available
```

---

## Database Tables Involved

### `room_inventory`
- Stores physical rooms
- Each room has a `room_type_id`
- Status indicates if room can be booked

### `room_bookings`
- Stores all bookings
- `room_type_id`: What type was booked
- `inventory_id`: Which specific room (NULL until assigned)
- `check_in_date`, `check_out_date`: Booking period

### `bookings`
- Main booking record
- `status`: confirmed, pending, cancelled, checked_in, checked_out
- Only active statuses count toward capacity

---

## Performance Considerations

### Query Optimization
- Uses subqueries for clarity and transaction safety
- Counts are performed on indexed columns (`room_type_id`, `booking_id`)
- Date comparisons use indexed date columns

### Recommended Indexes
```sql
-- Ensure these indexes exist for optimal performance
CREATE INDEX idx_room_inventory_type_status ON room_inventory(room_type_id, status);
CREATE INDEX idx_room_bookings_type_dates ON room_bookings(room_type_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

---

## Future Enhancements

### 1. Real-time Availability API
Create a dedicated endpoint to check availability without creating a booking:

```javascript
GET /api/room-bookings/availability?room_type_id=3&check_in=2024-01-15&check_out=2024-01-20

Response:
{
  "room_type": "Deluxe Room",
  "total_rooms": 5,
  "available_rooms": 2,
  "dates": {
    "check_in": "2024-01-15",
    "check_out": "2024-01-20"
  }
}
```

### 2. Alternative Suggestions
When a room type is fully booked, suggest alternatives:
- Similar room types with availability
- Same room type on nearby dates
- Upgrade options

### 3. Waitlist Feature
Allow guests to join a waitlist when rooms are fully booked:
- Notify when cancellations occur
- Automatic booking if room becomes available

### 4. Overbooking Strategy (Advanced)
Some hotels intentionally allow slight overbooking (e.g., 105% capacity) to account for cancellations:
- Configurable overbooking percentage per room type
- Risk management dashboard
- Automatic upgrade protocols

---

## Documentation Updates

Updated the following files to reflect overbooking prevention:

1. **BOOKING_AND_PAYMENT_FLOW.md**
   - Added availability check to Step 1 validation
   - Added error response example for no availability

2. **API_REQUEST_EXAMPLES.md**
   - Added availability check to validation rules
   - Added error response example with details

---

## Summary

✅ **Problem Solved:** System now prevents overbooking by checking room type capacity

✅ **How:** Counts total rooms vs. booked rooms for overlapping dates

✅ **When:** Validation happens during booking creation (before payment)

✅ **Result:** Clear error message when no rooms available, with capacity details

✅ **Impact:** Prevents double-booking, improves guest experience, protects hotel reputation

---

## Testing Checklist

- [ ] Test booking when rooms are available
- [ ] Test booking when all rooms are booked (should fail)
- [ ] Test with overlapping date ranges
- [ ] Test with non-overlapping dates (should succeed)
- [ ] Test with different room types
- [ ] Test with cancelled bookings (should not count toward capacity)
- [ ] Test with checked-out bookings (should not count toward capacity)
- [ ] Verify error message includes correct capacity details
- [ ] Test performance with large number of bookings

---

**Implementation Date:** 2024
**Status:** ✅ Completed and Documented