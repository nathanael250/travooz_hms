# Room Availability - Visual Guide

## 🎨 Understanding the Problem & Solution

### The Problem: LEFT JOIN Shows Only ONE Booking

```
Room 202 (inventory_id: 6) has MULTIPLE bookings:

┌─────────────────────────────────────────────────────────────┐
│  Room 202 Timeline                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nov 15-20  ████████                                        │
│  Nov 25-30          ████████                                │
│  Dec 01-02                  ████████  ← You want this date  │
│  Dec 05-10                          ████████                │
│  Dec 15-20                                  ████████        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

❌ OLD VIEW (with LEFT JOIN):
   Shows only ONE booking → Nov 15-20
   
   When you search Dec 01-02:
   ✓ Nov 15-20 doesn't overlap Dec 01-02
   → Result: "AVAILABLE" ✅ (WRONG!)

✅ NEW APPROACH (with NOT EXISTS):
   Checks ALL bookings → Finds Dec 01-02
   
   When you search Dec 01-02:
   ✗ Dec 01-02 DOES overlap Dec 01-02
   → Result: "NOT AVAILABLE" ❌ (CORRECT!)
```

---

## 📊 Database View Comparison

### ❌ OLD: Flawed View (LEFT JOIN)

```sql
CREATE VIEW room_availability_view AS
SELECT 
    ri.inventory_id,
    ri.unit_number,
    rb.check_in_date,
    rb.check_out_date
FROM room_inventory ri
LEFT JOIN room_bookings rb 
    ON ri.inventory_id = rb.inventory_id
    AND rb.check_out_date > CURDATE();
```

**Result for Room 202:**
```
┌──────────────┬─────────────┬───────────────┬─────────────────┐
│ inventory_id │ unit_number │ check_in_date │ check_out_date  │
├──────────────┼─────────────┼───────────────┼─────────────────┤
│ 6            │ 202         │ 2025-11-15    │ 2025-11-20      │
└──────────────┴─────────────┴───────────────┴─────────────────┘
                              ↑ Only ONE booking shown!
```

**Problem:** Other bookings (Nov 25-30, Dec 01-02, etc.) are HIDDEN!

---

### ✅ NEW: Correct Approach (NOT EXISTS)

```sql
SELECT ri.inventory_id
FROM room_inventory ri
WHERE NOT EXISTS (
    SELECT 1 
    FROM room_bookings rb
    WHERE rb.inventory_id = ri.inventory_id
      AND rb.check_in_date < '2025-12-02'
      AND rb.check_out_date > '2025-12-01'
);
```

**How it works:**
```
For Room 202, check ALL bookings:

┌─────────────┬───────────────┬─────────────────┬──────────────────┐
│ booking_id  │ check_in_date │ check_out_date  │ Overlaps Dec 1-2?│
├─────────────┼───────────────┼─────────────────┼──────────────────┤
│ 1           │ 2025-11-15    │ 2025-11-20      │ NO  ✓            │
│ 2           │ 2025-11-25    │ 2025-11-30      │ NO  ✓            │
│ 3           │ 2025-12-01    │ 2025-12-02      │ YES ✗            │
│ 4           │ 2025-12-05    │ 2025-12-10      │ NO  ✓            │
│ 5           │ 2025-12-15    │ 2025-12-20      │ NO  ✓            │
└─────────────┴───────────────┴─────────────────┴──────────────────┘
                                                   ↑ Found overlap!

Result: Room 202 is NOT AVAILABLE ❌ (CORRECT!)
```

---

## 🔄 Date Overlap Logic Explained

### The Formula

```
Two date ranges overlap if:
(start1 < end2) AND (end1 > start2)
```

### Visual Examples

#### Example 1: OVERLAP ✗

```
Existing:  [====Nov 15-20====]
New:                    [====Nov 18-22====]

Check: (Nov 15 < Nov 22) AND (Nov 20 > Nov 18)
       TRUE              AND  TRUE
       = TRUE → OVERLAP ✗
```

#### Example 2: NO OVERLAP ✓

```
Existing:  [====Nov 15-20====]
New:                           [====Nov 25-30====]

Check: (Nov 15 < Nov 30) AND (Nov 20 > Nov 25)
       TRUE              AND  FALSE
       = FALSE → NO OVERLAP ✓
```

#### Example 3: SAME-DAY TURNOVER ✓

```
Guest A:   [====Nov 28 - Dec 01====] (checkout Dec 01)
Guest B:                [====Dec 01 - Dec 05====] (checkin Dec 01)

Check: (Nov 28 < Dec 05) AND (Dec 01 > Dec 01)
       TRUE              AND  FALSE
       = FALSE → NO OVERLAP ✓ (Same-day turnover allowed!)
```

---

## 🏗️ Solution Architecture

### Database Layer

```
┌─────────────────────────────────────────────────────────────┐
│  DATABASE OBJECTS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 TABLES (Existing)                                       │
│  ├── room_inventory                                         │
│  ├── room_bookings                                          │
│  ├── bookings                                               │
│  └── room_types                                             │
│                                                             │
│  🔧 FUNCTION (New)                                          │
│  └── is_room_available(inventory_id, start, end)           │
│      → Returns 1 (available) or 0 (booked)                  │
│      → Checks ALL bookings for the room                     │
│                                                             │
│  👁️ VIEWS (New - Current Status Only)                       │
│  ├── room_current_status_view                               │
│  │   → Shows TODAY's status only                            │
│  │   → Safe for dashboard displays                          │
│  │                                                           │
│  └── room_type_availability_summary                         │
│      → Summary by room type (TODAY only)                    │
│      → Useful for statistics                                │
│                                                             │
│  🚫 DROPPED                                                 │
│  └── room_availability_view (the flawed one)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Application Layer

```
┌─────────────────────────────────────────────────────────────┐
│  ENDPOINTS                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ FIXED                                                   │
│  └── GET /api/room-availability/available-rooms             │
│      ├── Uses: Direct query with NOT EXISTS                 │
│      ├── Checks: ALL bookings per room                      │
│      └── Logic: Same as booking creation                    │
│                                                             │
│  🔴 NEEDS FIXING                                            │
│  ├── GET /api/room-availability/hotels                      │
│  ├── GET /api/room-availability/calendar                    │
│  ├── GET /api/room-availability/room/:roomId                │
│  └── GET /api/room-availability/check                       │
│                                                             │
│  🟡 REVIEW NEEDED                                           │
│  ├── GET /api/room-availability/rooms                       │
│  └── GET /api/room-availability/summary                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Query Comparison

### Scenario: Check availability for Dec 01-02, Room Type 8

#### ❌ OLD WAY (Using Flawed View)

```sql
SELECT * 
FROM room_availability_view
WHERE room_type_id = 8
  AND (check_in_date IS NULL 
       OR check_in_date > '2025-12-02'
       OR check_out_date < '2025-12-01');
```

**Problems:**
- Only sees ONE booking per room
- Misses other bookings
- Returns false positives

**Result:** Shows Room 202 as available ✅ (WRONG!)

---

#### ✅ NEW WAY (Using NOT EXISTS)

```sql
SELECT 
    ri.inventory_id,
    ri.unit_number,
    rt.name as room_type
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
        AND rb.check_in_date < '2025-12-02'
        AND rb.check_out_date > '2025-12-01'
  );
```

**Benefits:**
- Checks ALL bookings per room
- Uses correct overlap logic
- No false positives

**Result:** Shows Room 202 as NOT available ❌ (CORRECT!)

---

## 📈 Performance Visualization

### Query Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│  AVAILABILITY CHECK FLOW                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Filter by room type                                     │
│     ↓ (Uses index: idx_room_inventory_type_status)          │
│     └─→ Fast: ~5ms                                          │
│                                                             │
│  2. For each room, check bookings                           │
│     ↓ (Uses index: idx_room_bookings_inventory_dates)       │
│     └─→ Fast: ~10-20ms per room                             │
│                                                             │
│  3. Filter by booking status                                │
│     ↓ (Uses index: idx_bookings_status)                     │
│     └─→ Fast: ~5ms                                          │
│                                                             │
│  4. Check date overlap                                      │
│     ↓ (Simple comparison)                                   │
│     └─→ Fast: ~1ms                                          │
│                                                             │
│  Total: ~20-50ms for typical query                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Index Usage

```
room_inventory
├── PRIMARY KEY (inventory_id)
└── idx_room_inventory_type_status (room_type_id, status, homestay_id)
    ↑ Used for: WHERE room_type_id = ? AND status = 'available'

room_bookings
├── PRIMARY KEY (booking_id)
└── idx_room_bookings_inventory_dates (inventory_id, check_in_date, check_out_date)
    ↑ Used for: WHERE inventory_id = ? AND date overlap check

bookings
├── PRIMARY KEY (booking_id)
└── idx_bookings_status (status)
    ↑ Used for: WHERE status IN ('confirmed', 'pending', 'checked_in')
```

---

## 🧪 Testing Scenarios

### Test 1: Multiple Bookings Per Room

```
Setup:
┌─────────────────────────────────────────────────────────────┐
│  Room 202 Bookings                                          │
├─────────────────────────────────────────────────────────────┤
│  Nov 15-20  ████████                                        │
│  Nov 25-30          ████████                                │
│  Dec 01-02                  ████████                        │
│  Dec 05-10                          ████████                │
│  Dec 15-20                                  ████████        │
└─────────────────────────────────────────────────────────────┘

Test Cases:
┌──────────────┬─────────────┬──────────────────────────────┐
│ Search Dates │ Expected    │ Reason                       │
├──────────────┼─────────────┼──────────────────────────────┤
│ Nov 15-20    │ NOT AVAIL ❌│ Exact match                  │
│ Nov 18-22    │ NOT AVAIL ❌│ Overlaps Nov 15-20           │
│ Nov 21-24    │ AVAILABLE ✓ │ Gap between bookings         │
│ Dec 01-02    │ NOT AVAIL ❌│ Exact match                  │
│ Dec 03-04    │ AVAILABLE ✓ │ Gap between bookings         │
│ Nov 28-Dec 3 │ NOT AVAIL ❌│ Overlaps multiple bookings   │
└──────────────┴─────────────┴──────────────────────────────┘
```

### Test 2: Same-Day Turnover

```
Scenario: Guest A checks out, Guest B checks in same day

┌─────────────────────────────────────────────────────────────┐
│  Timeline                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Guest A:  [====Nov 28 - Dec 01====]                        │
│                              ↑ Checkout Dec 01              │
│                                                             │
│  Guest B:            [====Dec 01 - Dec 05====]              │
│                       ↑ Checkin Dec 01                      │
│                                                             │
│  Overlap Check:                                             │
│  (Nov 28 < Dec 05) AND (Dec 01 > Dec 01)                    │
│   TRUE             AND  FALSE                               │
│   = FALSE → NO OVERLAP ✓                                    │
│                                                             │
│  Result: ALLOWED (Same-day turnover is OK)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Test 3: Endpoint Consistency

```
┌─────────────────────────────────────────────────────────────┐
│  CONSISTENCY TEST                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Check Availability Endpoint                             │
│     GET /api/room-availability/available-rooms              │
│     ?room_type_id=8&check_in=2025-12-01&check_out=2025-12-02│
│                                                             │
│     Response: { available_rooms: 0 }                        │
│                                                             │
│  2. Try Booking Creation                                    │
│     POST /api/room-bookings/create                          │
│     { room_type_id: 8, check_in: "2025-12-01", ... }        │
│                                                             │
│     Response: { error: "All 6 rooms are already booked" }   │
│                                                             │
│  ✅ CONSISTENT: Both say NO ROOMS AVAILABLE                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Decision Tree: Which Approach to Use?

```
                    Need to check availability?
                              │
                              ▼
                    ┌─────────────────────┐
                    │ What are you doing? │
                    └─────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌───────────────┐           ┌──────────────┐
        │ Current status│           │ Date range   │
        │ (TODAY only)  │           │ availability │
        └───────────────┘           └──────────────┘
                │                           │
                ▼                           ▼
        ┌───────────────┐           ┌──────────────────┐
        │ ✅ USE VIEWS  │           │ ✅ USE NOT EXISTS│
        │               │           │    or FUNCTION   │
        │ • room_current│           │                  │
        │   _status_view│           │ • NOT EXISTS     │
        │               │           │   subquery       │
        │ • room_type_  │           │                  │
        │   availability│           │ • is_room_       │
        │   _summary    │           │   available()    │
        └───────────────┘           └──────────────────┘
```

---

## 📋 Quick Reference Card

### ✅ DO

```sql
-- ✅ For current status (TODAY)
SELECT * FROM room_current_status_view;

-- ✅ For date range availability
SELECT ri.* FROM room_inventory ri
WHERE NOT EXISTS (
    SELECT 1 FROM room_bookings rb
    WHERE rb.inventory_id = ri.inventory_id
      AND rb.check_in_date < ?
      AND rb.check_out_date > ?
);

-- ✅ Using the function
SELECT is_room_available(6, '2025-12-01', '2025-12-02');

-- ✅ Date overlap check
WHERE check_in_date < ? AND check_out_date > ?
```

### ❌ DON'T

```sql
-- ❌ Don't use LEFT JOIN for date ranges
SELECT * FROM room_availability_view
WHERE check_in_date >= ?;

-- ❌ Don't use BETWEEN for overlaps
WHERE ? BETWEEN check_in_date AND check_out_date;

-- ❌ Don't use different logic in different places
WHERE check_in_date <= ? AND check_out_date >= ?;  -- Wrong!
```

---

## 🔗 Navigation

- **Apply the fix:** `APPLY_AVAILABILITY_FIX.md`
- **Technical details:** `ROOM_AVAILABILITY_VIEW_FIX.md`
- **Complete solution:** `ROOM_AVAILABILITY_COMPLETE_SOLUTION.md`
- **Endpoint analysis:** `ROOM_AVAILABILITY_VIEW_ANALYSIS.md`
- **Booking flow:** `BOOKING_AND_PAYMENT_FLOW.md`