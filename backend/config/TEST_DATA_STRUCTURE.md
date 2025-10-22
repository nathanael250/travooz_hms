# Stay View Test Data Structure

## 📊 Data Hierarchy

```
Homestay (homestay_id: 1)
└── Urugero Hotel
    │
    ├── Room Types (5 types)
    │   ├── [1] Standard Room (50,000 RWF/night)
    │   ├── [2] Deluxe Room (75,000 RWF/night)
    │   ├── [3] Family Suite (120,000 RWF/night)
    │   ├── [4] Executive Suite (150,000 RWF/night)
    │   └── [5] Presidential Suite (250,000 RWF/night)
    │
    └── Room Inventory (12 physical rooms)
        │
        ├── Floor 1 - Standard Rooms
        │   ├── [1] Room 101 → Room Type 1
        │   ├── [2] Room 102 → Room Type 1
        │   ├── [3] Room 103 → Room Type 1
        │   └── [4] Room 104 → Room Type 1
        │
        ├── Floor 2 - Deluxe Rooms
        │   ├── [5] Room 201 → Room Type 2
        │   ├── [6] Room 202 → Room Type 2
        │   └── [7] Room 203 → Room Type 2
        │
        ├── Floor 3 - Family Suites
        │   ├── [8] Room 301 → Room Type 3
        │   └── [9] Room 302 → Room Type 3
        │
        ├── Floor 4 - Executive Suites
        │   ├── [10] Room 401 → Room Type 4
        │   └── [11] Room 402 → Room Type 4
        │
        └── Floor 5 - Presidential Suite
            └── [12] Room 501 → Room Type 5
```

## 📅 Booking Timeline (Relative to Today)

```
Timeline Key:
═══ = Confirmed (Green)
─── = Pending (Yellow)
××× = Cancelled (Red)
··· = Completed (Blue)

Days: -12  -10  -8   -6   -4   -2   0   +2   +4   +6   +8   +10  +12  +14
      ─────────────────────────────────────────────────────────────────────

Room 101:                              ═══John Smith═══
                                                              ═══Christopher Martin═══

Room 102:                                      ═══David Wilson═══
                                                                        ═══Amanda Clark═══

Room 103:                                                  ───Robert Taylor───

Room 104:                                  ×××Jennifer Lee×××

Room 201: ···Patricia···                   ═══Sarah Johnson═══

Room 202:                                              ───Lisa Martinez───

Room 203:                                                      ═══Maria Rodriguez═══

Room 301:                                      ═══Anderson Family═══

Room 302:                                          ═══Thompson Family═══

Room 401: ···James Anderson···

Room 402:                                  ═══Michael & Emma Brown═══

Room 501:                      ×××William Garcia×××
                                                                  ═══Dr. Richard White═══
```

## 🗂️ Detailed Booking Information

### Booking ID: 100 (Confirmed)
- **Room**: 101 (Standard Room)
- **Guest**: John Smith
- **Dates**: Yesterday → +2 days (3 nights)
- **Amount**: 150,000 RWF
- **Status**: Confirmed, Paid
- **Special**: Late check-in expected

### Booking ID: 101 (Confirmed)
- **Room**: 201 (Deluxe Room)
- **Guest**: Sarah Johnson
- **Dates**: Today → +3 days (3 nights)
- **Amount**: 225,000 RWF
- **Status**: Confirmed, Paid
- **Special**: Need extra pillows

### Booking ID: 102 (Confirmed)
- **Room**: 402 (Executive Suite)
- **Guest**: Michael & Emma Brown
- **Dates**: Tomorrow → +3 days (2 nights)
- **Amount**: 300,000 RWF
- **Status**: Confirmed, Paid
- **Special**: Honeymoon package requested

### Booking ID: 103 (Confirmed)
- **Room**: 102 (Standard Room)
- **Guest**: David Wilson
- **Dates**: +2 days → +4 days (2 nights)
- **Amount**: 100,000 RWF
- **Status**: Confirmed, Paid

### Booking ID: 104 (Confirmed)
- **Room**: 301 (Family Suite)
- **Guest**: Anderson Family
- **Dates**: +3 days → +4 days (1 night)
- **Amount**: 120,000 RWF
- **Status**: Confirmed, Paid
- **Special**: Ground floor preferred

### Booking ID: 105 (Pending)
- **Room**: 202 (Deluxe Room)
- **Guest**: Lisa Martinez
- **Dates**: +5 days → +7 days (2 nights)
- **Amount**: 150,000 RWF
- **Status**: Pending, Pending Payment
- **Special**: Vegetarian breakfast

### Booking ID: 106 (Pending)
- **Room**: 103 (Standard Room)
- **Guest**: Robert Taylor
- **Dates**: +6 days → +7 days (1 night)
- **Amount**: 50,000 RWF
- **Status**: Pending, Pending Payment

### Booking ID: 107 (Completed)
- **Room**: 401 (Executive Suite)
- **Guest**: James Anderson
- **Dates**: -8 days → -5 days (3 nights)
- **Amount**: 450,000 RWF
- **Status**: Completed, Paid

### Booking ID: 108 (Completed)
- **Room**: 201 (Deluxe Room)
- **Guest**: Patricia Moore
- **Dates**: -12 days → -10 days (2 nights)
- **Amount**: 150,000 RWF
- **Status**: Completed, Paid
- **Special**: Business trip

### Booking ID: 109 (Cancelled)
- **Room**: 501 (Presidential Suite)
- **Guest**: William Garcia
- **Dates**: -3 days → -1 day (2 nights)
- **Amount**: 500,000 RWF
- **Status**: Cancelled, Refunded

### Booking ID: 110 (Cancelled)
- **Room**: 104 (Standard Room)
- **Guest**: Jennifer Lee
- **Dates**: Tomorrow → +3 days (2 nights)
- **Amount**: 100,000 RWF
- **Status**: Cancelled, Refunded
- **Special**: Change of plans

### Booking ID: 111 (Confirmed)
- **Room**: 302 (Family Suite)
- **Guest**: Thompson Family
- **Dates**: +4 days → +7 days (3 nights)
- **Amount**: 360,000 RWF
- **Status**: Confirmed, Paid
- **Special**: Anniversary celebration

### Booking ID: 112 (Confirmed)
- **Room**: 501 (Presidential Suite)
- **Guest**: Dr. Richard White
- **Dates**: +7 days → +9 days (2 nights)
- **Amount**: 500,000 RWF
- **Status**: Confirmed, Paid
- **Special**: VIP guest - special attention

### Booking ID: 113 (Confirmed)
- **Room**: 203 (Deluxe Room)
- **Guest**: Maria Rodriguez
- **Dates**: +8 days → +9 days (1 night)
- **Amount**: 75,000 RWF
- **Status**: Confirmed, Paid

### Booking ID: 114 (Confirmed)
- **Room**: 101 (Standard Room)
- **Guest**: Christopher Martin
- **Dates**: +10 days → +13 days (3 nights)
- **Amount**: 225,000 RWF
- **Status**: Confirmed, Paid
- **Special**: Early check-in requested

### Booking ID: 115 (Confirmed)
- **Room**: 102 (Standard Room)
- **Guest**: Amanda Clark
- **Dates**: +12 days → +14 days (2 nights)
- **Amount**: 100,000 RWF
- **Status**: Confirmed, Paid

## 📈 Statistics

### By Status
| Status | Count | Percentage |
|--------|-------|------------|
| Confirmed | 10 | 62.5% |
| Pending | 2 | 12.5% |
| Completed | 2 | 12.5% |
| Cancelled | 2 | 12.5% |
| **Total** | **16** | **100%** |

### By Room Type
| Room Type | Bookings | Occupancy |
|-----------|----------|-----------|
| Standard Room | 6 | 37.5% |
| Deluxe Room | 4 | 25% |
| Family Suite | 2 | 12.5% |
| Executive Suite | 2 | 12.5% |
| Presidential Suite | 2 | 12.5% |

### By Booking Source
| Source | Count |
|--------|-------|
| Website | 9 |
| Mobile App | 3 |
| Phone | 2 |
| Walk-in | 1 |
| Agent | 1 |

### Revenue Summary
| Category | Amount (RWF) |
|----------|--------------|
| Total Bookings | 2,885,000 |
| Confirmed Revenue | 2,185,000 |
| Pending Revenue | 200,000 |
| Cancelled (Refunded) | 600,000 |
| Completed Revenue | 600,000 |

### Occupancy by Date Range
| Period | Bookings | Rooms Occupied |
|--------|----------|----------------|
| Past (-12 to -1 days) | 4 | 3 rooms |
| Current (Today) | 2 | 2 rooms |
| Near Future (+1 to +7 days) | 6 | 6 rooms |
| Far Future (+8 to +14 days) | 4 | 4 rooms |

## 🎯 Test Coverage

### Scenarios Covered
✅ **Overlapping Bookings**: Multiple rooms booked on same dates  
✅ **Sequential Bookings**: Same room booked back-to-back (Room 101, 102)  
✅ **Gap Days**: Rooms with availability between bookings  
✅ **Long Stays**: 3-night bookings (John Smith, Thompson Family)  
✅ **Short Stays**: 1-night bookings (Anderson Family, Maria Rodriguez)  
✅ **Past Bookings**: Completed stays for historical view  
✅ **Future Bookings**: Upcoming reservations  
✅ **Cancelled Bookings**: Refunded reservations  
✅ **Pending Bookings**: Awaiting confirmation  
✅ **Special Requests**: Various guest requirements  
✅ **Different Guest Types**: Singles, couples, families  
✅ **Price Variations**: Different room types and rates  
✅ **Booking Sources**: Multiple channels (web, mobile, phone, etc.)  

## 🔗 Database Relationships

```
bookings (booking_id: 100-115)
    ↓ (1:1)
room_bookings (booking_id: 100-115)
    ↓ (N:1)
room_inventory (inventory_id: 1-12)
    ↓ (N:1)
room_types (room_type_id: 1-5)
    ↓ (N:1)
homestays (homestay_id: 1)
    ↓ (N:1)
vendors (vendor_id: 2)
```

## 📋 SQL Queries for Analysis

### Get all bookings for a specific date
```sql
SELECT * FROM room_bookings 
WHERE check_in_date <= '2025-01-15' 
  AND check_out_date > '2025-01-15'
  AND homestay_id = 1;
```

### Get occupancy rate for a date range
```sql
SELECT 
    COUNT(DISTINCT rb.inventory_id) as occupied_rooms,
    (SELECT COUNT(*) FROM room_inventory ri 
     JOIN room_types rt ON ri.room_type_id = rt.room_type_id 
     WHERE rt.homestay_id = 1) as total_rooms,
    ROUND(COUNT(DISTINCT rb.inventory_id) * 100.0 / 
          (SELECT COUNT(*) FROM room_inventory ri 
           JOIN room_types rt ON ri.room_type_id = rt.room_type_id 
           WHERE rt.homestay_id = 1), 2) as occupancy_percentage
FROM room_bookings rb
JOIN bookings b ON rb.booking_id = b.booking_id
WHERE rb.homestay_id = 1
  AND b.status = 'confirmed'
  AND rb.check_in_date <= CURDATE()
  AND rb.check_out_date > CURDATE();
```

### Get revenue by room type
```sql
SELECT 
    rt.name as room_type,
    COUNT(rb.booking_id) as total_bookings,
    SUM(rb.total_room_amount) as total_revenue
FROM room_bookings rb
JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
JOIN room_types rt ON ri.room_type_id = rt.room_type_id
JOIN bookings b ON rb.booking_id = b.booking_id
WHERE rb.homestay_id = 1
  AND b.status IN ('confirmed', 'completed')
GROUP BY rt.room_type_id, rt.name
ORDER BY total_revenue DESC;
```

---

**This structure provides comprehensive test coverage for the Stay View feature!**