# Room Availability View Migration Guide

## Overview

This document describes the migration from a **table-based availability system** to a **view-based availability system** using `room_availability_view`. This change provides real-time availability calculation based on actual bookings, eliminating data redundancy and improving accuracy.

---

## What Changed?

### Before (Table-Based System)
- Availability data was stored in the `room_availability` table
- Required manual updates to availability records
- Risk of data inconsistency between bookings and availability
- Needed initialization scripts to populate availability data

### After (View-Based System)
- Availability is calculated in real-time from `room_availability_view`
- View automatically reflects current booking status
- Single source of truth: bookings drive availability
- No manual availability management needed

---

## Database View Structure

### `room_availability_view` Schema

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
    AND rb.check_out_date > CURDATE()
ORDER BY ri.inventory_id, rb.check_in_date;
```

### View Fields

| Field | Type | Description |
|-------|------|-------------|
| `inventory_id` | int | Unique room inventory ID |
| `room_type_id` | int | Room type identifier |
| `room_type` | varchar(100) | Room type name (e.g., "Deluxe Room") |
| `unit_number` | varchar(50) | Room number (e.g., "101", "202") |
| `floor` | varchar(20) | Floor number |
| `room_status` | enum | Physical room status (available, occupied, maintenance, etc.) |
| `current_status` | varchar(12) | Calculated availability status (available, reserved, occupied) |
| `check_in_date` | date | Next/current booking check-in date (NULL if available) |
| `check_out_date` | date | Next/current booking check-out date (NULL if available) |

---

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get Availability Calendar
```http
GET /api/room-availability/calendar
```

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `homestay_id` (optional): Filter by homestay
- `room_type_id` (optional): Filter by room type
- `status` (optional): Filter by status (available, reserved, occupied)

**Response:**
```json
{
  "success": true,
  "data": {
    "availability": [
      {
        "inventory_id": 4,
        "room_type_id": 8,
        "room_type": "Deluxe Room",
        "room_number": "104",
        "floor": "1",
        "room_status": "available",
        "current_status": "available",
        "check_in_date": null,
        "check_out_date": null,
        "homestay_id": 1,
        "homestay_name": "Sunset Villa",
        "base_price": 150.00,
        "max_occupancy": 2
      }
    ],
    "summary": {
      "total_rooms": 9,
      "available": 4,
      "reserved": 2,
      "occupied": 3
    },
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    }
  }
}
```

#### 2. Get Available Rooms
```http
GET /api/room-availability/available-rooms
```

**Query Parameters:**
- `start_date` (required): Check-in date
- `end_date` (required): Check-out date
- `homestay_id` (optional): Filter by homestay
- `room_type_id` (optional): Filter by room type
- `guests` (optional): Minimum occupancy capacity

**Response:**
```json
{
  "success": true,
  "data": {
    "available_rooms": [
      {
        "inventory_id": 4,
        "room_type": "Deluxe Room",
        "room_number": "104",
        "floor": "1",
        "homestay_name": "Sunset Villa",
        "base_price": 150.00,
        "max_occupancy": 2
      }
    ],
    "count": 4,
    "search_criteria": {
      "start_date": "2025-01-15",
      "end_date": "2025-01-20",
      "homestay_id": "all",
      "room_type_id": "all",
      "guests": "any"
    }
  }
}
```

#### 3. Get Specific Room Availability
```http
GET /api/room-availability/room/:roomId
```

**Query Parameters:**
- `start_date` (required): Start date
- `end_date` (required): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "room": {
      "inventory_id": 1,
      "room_type": "Deluxe Room",
      "room_number": "101",
      "current_status": "reserved",
      "check_in_date": "2025-10-20",
      "check_out_date": "2025-10-23"
    },
    "is_available": false,
    "bookings": [
      {
        "check_in_date": "2025-10-20",
        "check_out_date": "2025-10-23"
      }
    ],
    "date_range": {
      "start": "2025-01-15",
      "end": "2025-01-20"
    }
  }
}
```

#### 4. Check Multiple Rooms Availability
```http
POST /api/room-availability/check-availability
```

**Request Body:**
```json
{
  "room_ids": [1, 2, 3, 4, 5],
  "start_date": "2025-01-15",
  "end_date": "2025-01-20"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "inventory_id": 1,
        "room_type": "Deluxe Room",
        "room_number": "101",
        "is_available": false,
        "current_status": "reserved",
        "conflicting_booking": {
          "check_in": "2025-10-20",
          "check_out": "2025-10-23"
        }
      },
      {
        "inventory_id": 4,
        "room_type": "Deluxe Room",
        "room_number": "104",
        "is_available": true,
        "current_status": "available",
        "conflicting_booking": null
      }
    ],
    "date_range": {
      "start": "2025-01-15",
      "end": "2025-01-20"
    }
  }
}
```

#### 5. Get All Rooms List
```http
GET /api/room-availability/rooms
```

**Query Parameters:**
- `homestay_id` (optional): Filter by homestay
- `status` (optional): Filter by current status

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "inventory_id": 1,
        "room_type": "Deluxe Room",
        "room_number": "101",
        "floor": "1",
        "current_status": "occupied",
        "homestay_name": "Sunset Villa"
      }
    ]
  }
}
```

#### 6. Get Room Status Summary
```http
GET /api/room-availability/summary
```

**Query Parameters:**
- `homestay_id` (optional): Filter by homestay

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "available": 4,
      "reserved": 2,
      "occupied": 3,
      "total": 9
    },
    "by_homestay": [
      {
        "current_status": "available",
        "count": 4,
        "homestay_id": 1,
        "homestay_name": "Sunset Villa"
      }
    ]
  }
}
```

---

## Availability Logic

### How Availability is Determined

The view calculates availability based on booking dates:

```
1. Room is AVAILABLE if:
   - No booking exists (check_in_date and check_out_date are NULL), OR
   - Booking doesn't overlap with requested date range

2. Room is RESERVED if:
   - Booking exists with check_in_date > TODAY

3. Room is OCCUPIED if:
   - Booking exists with check_in_date <= TODAY AND check_out_date > TODAY
```

### Date Range Overlap Logic

For a requested date range `[start_date, end_date]`, a room is available if:

```sql
(check_in_date IS NULL AND check_out_date IS NULL) OR
(check_out_date <= start_date OR check_in_date >= end_date)
```

This means:
- Booking ends before requested start date → Available
- Booking starts after requested end date → Available
- Otherwise → Not available (overlap exists)

---

## Migration Steps

### 1. Backend Migration

The backend routes have been updated to use `room_availability_view`:

**File:** `/backend/src/routes/roomAvailability.routes.js`

**Changes:**
- All GET endpoints now query `room_availability_view`
- POST/PATCH/DELETE endpoints are deprecated (return informational messages)
- Availability is calculated in real-time from bookings
- No need for manual availability management

### 2. Frontend Migration

**File:** `/frontend/src/pages/hotels/RoomAvailability.jsx`

**Required Changes:**
1. Update data structure to match view fields
2. Remove availability editing features (deprecated)
3. Display real-time booking status
4. Show check-in/check-out dates for reserved/occupied rooms

### 3. Database Migration

**No migration needed!** The view already exists in your database.

To verify:
```sql
DESCRIBE room_availability_view;
SELECT * FROM room_availability_view;
```

---

## Testing

### Test Script

Run the provided test script:

```bash
chmod +x test-availability-view.sh
./test-availability-view.sh
```

### Manual Testing

#### Test 1: Get Available Rooms
```bash
curl "http://localhost:5000/api/room-availability/available-rooms?start_date=2025-01-15&end_date=2025-01-20"
```

Expected: List of rooms with `current_status = "available"`

#### Test 2: Check Specific Room
```bash
curl "http://localhost:5000/api/room-availability/room/1?start_date=2025-01-15&end_date=2025-01-20"
```

Expected: Room details with availability status

#### Test 3: Get Summary
```bash
curl "http://localhost:5000/api/room-availability/summary"
```

Expected: Count of available, reserved, and occupied rooms

---

## Benefits of View-Based System

### 1. **Real-Time Accuracy**
- Availability always reflects current booking status
- No risk of stale or inconsistent data

### 2. **Simplified Management**
- No need to manually update availability records
- Bookings automatically update availability

### 3. **Reduced Complexity**
- Single source of truth (bookings)
- No synchronization issues

### 4. **Better Performance**
- Database view is optimized
- No need for complex joins in application code

### 5. **Easier Maintenance**
- Less code to maintain
- Fewer potential bugs

---

## Backward Compatibility

### Deprecated Endpoints

The following endpoints are deprecated but still exist for backward compatibility:

- `POST /api/room-availability` - Returns deprecation message
- `POST /api/room-availability/bulk` - Returns deprecation message
- `PATCH /api/room-availability/toggle-closed` - Returns deprecation message
- `DELETE /api/room-availability/:id` - Returns deprecation message

**Migration Path:**
- To manage availability, create/modify bookings instead
- To close a room, update `room_inventory.status` to "maintenance" or "out_of_order"

---

## Common Use Cases

### Use Case 1: Guest Booking Flow

```javascript
// 1. Search for available rooms
const response = await fetch(
  `/api/room-availability/available-rooms?start_date=2025-01-15&end_date=2025-01-20&guests=2`
);
const { available_rooms } = await response.json();

// 2. Select a room and create booking
const booking = await createBooking({
  inventory_id: available_rooms[0].inventory_id,
  check_in_date: "2025-01-15",
  check_out_date: "2025-01-20",
  guests: 2
});

// 3. Availability automatically updates via view
```

### Use Case 2: Admin Dashboard

```javascript
// Get real-time summary
const summary = await fetch('/api/room-availability/summary');
// Display: "4 available, 2 reserved, 3 occupied"

// Get calendar view
const calendar = await fetch(
  `/api/room-availability/calendar?start_date=2025-01-01&end_date=2025-01-31`
);
// Display monthly calendar with room statuses
```

### Use Case 3: Room Status Check

```javascript
// Check if specific room is available
const check = await fetch('/api/room-availability/room/4?start_date=2025-01-15&end_date=2025-01-20');
const { is_available } = await check.json();

if (is_available) {
  // Proceed with booking
} else {
  // Show alternative rooms
}
```

---

## Troubleshooting

### Issue: Empty availability array

**Cause:** No rooms exist in `room_inventory` or all rooms are filtered out

**Solution:**
```sql
-- Check if rooms exist
SELECT * FROM room_inventory;

-- Check view data
SELECT * FROM room_availability_view;
```

### Issue: Room shows as occupied but should be available

**Cause:** Booking exists with overlapping dates

**Solution:**
```sql
-- Check bookings for the room
SELECT * FROM room_bookings WHERE inventory_id = 1;

-- Verify booking dates don't overlap with your search
```

### Issue: View returns duplicate rows

**Cause:** Multiple bookings exist for the same room

**Solution:** This is expected behavior. The view shows all bookings. Use `GROUP BY inventory_id` in queries to get unique rooms.

---

## Support

For questions or issues:
1. Check this documentation
2. Review the test script output
3. Examine database view definition
4. Check application logs

---

## Summary

✅ **Migration Complete**
- Backend routes updated to use `room_availability_view`
- Real-time availability calculation from bookings
- Public API access for guest users
- Comprehensive test suite provided

🎯 **Next Steps**
1. Run test script to verify functionality
2. Update frontend to display view-based data
3. Remove deprecated availability management UI
4. Test booking flow end-to-end

📚 **Key Takeaway**
The view-based system provides accurate, real-time availability without manual management. Bookings are the single source of truth.