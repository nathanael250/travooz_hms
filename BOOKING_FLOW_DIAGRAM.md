# 🔄 Booking Flow Diagram

## Visual Representation of the Complete Booking Process

---

## 📊 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BOOKING FLOW OVERVIEW                         │
└─────────────────────────────────────────────────────────────────────┘

    👤 Guest                    🖥️ Frontend              🔧 Backend              💾 Database
       │                            │                        │                       │
       │  1. Browse Rooms           │                        │                       │
       ├───────────────────────────>│                        │                       │
       │                            │  GET /room-availability│                       │
       │                            ├───────────────────────>│                       │
       │                            │                        │  Query availability   │
       │                            │                        ├──────────────────────>│
       │                            │                        │<──────────────────────┤
       │                            │<───────────────────────┤                       │
       │  Display Available Rooms   │                        │                       │
       │<───────────────────────────┤                        │                       │
       │                            │                        │                       │
       │  2. Select Room            │                        │                       │
       ├───────────────────────────>│                        │                       │
       │                            │  GET /room-inventory/:id                       │
       │                            ├───────────────────────>│                       │
       │                            │                        │  Get room details     │
       │                            │                        ├──────────────────────>│
       │                            │                        │<──────────────────────┤
       │                            │<───────────────────────┤                       │
       │  Show Room Details         │                        │                       │
       │<───────────────────────────┤                        │                       │
       │                            │                        │                       │
       │  3. Enter Guest Info       │                        │                       │
       ├───────────────────────────>│                        │                       │
       │                            │  POST /guest-profiles  │                       │
       │                            ├───────────────────────>│                       │
       │                            │                        │  Create guest profile │
       │                            │                        ├──────────────────────>│
       │                            │                        │<──────────────────────┤
       │                            │<───────────────────────┤                       │
       │  Guest Profile Created     │                        │                       │
       │<───────────────────────────┤                        │                       │
       │                            │                        │                       │
       │  4. Confirm Booking        │                        │                       │
       ├───────────────────────────>│                        │                       │
       │                            │  POST /room-bookings   │                       │
       │                            ├───────────────────────>│                       │
       │                            │                        │  Check availability   │
       │                            │                        ├──────────────────────>│
       │                            │                        │<──────────────────────┤
       │                            │                        │  Create booking       │
       │                            │                        ├──────────────────────>│
       │                            │                        │  Create room_booking  │
       │                            │                        ├──────────────────────>│
       │                            │                        │  Link booking_guests  │
       │                            │                        ├──────────────────────>│
       │                            │                        │<──────────────────────┤
       │                            │<───────────────────────┤                       │
       │  Booking Confirmed         │                        │                       │
       │<───────────────────────────┤                        │                       │
       │                            │                        │                       │
       │  5. Make Payment           │                        │                       │
       ├───────────────────────────>│                        │                       │
       │                            │  POST /payment-transactions                    │
       │                            ├───────────────────────>│                       │
       │                            │                        │  Record payment       │
       │                            │                        ├──────────────────────>│
       │                            │                        │  Update booking status│
       │                            │                        ├──────────────────────>│
       │                            │                        │<──────────────────────┤
       │                            │<───────────────────────┤                       │
       │  Payment Confirmed         │                        │                       │
       │<───────────────────────────┤                        │                       │
       │                            │                        │                       │
       │  6. Receive Confirmation   │                        │  Update availability  │
       │                            │                        ├──────────────────────>│
       │                            │                        │  Create housekeeping  │
       │                            │                        ├──────────────────────>│
       │                            │                        │  Send email (future)  │
       │                            │                        │                       │
       │  📧 Confirmation Email     │                        │                       │
       │<───────────────────────────┴────────────────────────┤                       │
       │                                                                              │
```

---

## 🗂️ Database Tables Involved

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE RELATIONSHIPS                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   homestays      │
│──────────────────│
│ homestay_id (PK) │
│ name             │
│ location         │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐
│   room_types     │
│──────────────────│
│ room_type_id(PK) │
│ homestay_id (FK) │
│ name             │
│ price            │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐         ┌──────────────────────┐
│ room_inventory   │         │  room_availability   │
│──────────────────│         │──────────────────────│
│ inventory_id(PK) │◄────────│ inventory_id (FK)    │
│ room_type_id(FK) │    1:N  │ date                 │
│ unit_number      │         │ available_units      │
│ status           │         │ total_units          │
└────────┬─────────┘         └──────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐         ┌──────────────────────┐
│  room_bookings   │         │     bookings         │
│──────────────────│    N:1  │──────────────────────│
│ room_booking_id  │────────>│ booking_id (PK)      │
│ booking_id (FK)  │         │ booking_reference    │
│ room_id (FK)     │         │ guest_name           │
│ check_in_date    │         │ status               │
│ check_out_date   │         │ payment_status       │
│ nights           │         │ total_amount         │
│ final_amount     │         └──────────┬───────────┘
└──────────────────┘                    │
                                        │ 1:N
                                        ▼
                            ┌──────────────────────┐
                            │   booking_guests     │
                            │──────────────────────│
                            │ booking_guest_id(PK) │
                            │ booking_id (FK)      │
                            │ guest_id (FK)        │
                            │ is_primary           │
                            └──────────┬───────────┘
                                       │
                                       │ N:1
                                       ▼
                            ┌──────────────────────┐
                            │   guest_profiles     │
                            │──────────────────────│
                            │ guest_id (PK)        │
                            │ first_name           │
                            │ last_name            │
                            │ email                │
                            │ phone                │
                            │ id_number            │
                            └──────────────────────┘

┌──────────────────────┐
│ payment_transactions │
│──────────────────────│
│ transaction_id (PK)  │
│ booking_id (FK)      │◄────────┐
│ amount               │         │
│ payment_method       │         │ 1:N
│ payment_status       │         │
│ transaction_ref      │    ┌────┴─────────┐
└──────────────────────┘    │   bookings   │
                            └──────────────┘

┌──────────────────────┐
│ housekeeping_tasks   │
│──────────────────────│
│ task_id (PK)         │
│ booking_id (FK)      │◄────────┐
│ inventory_id (FK)    │         │
│ task_type            │         │ 1:N (optional)
│ status               │         │
│ scheduled_date       │    ┌────┴─────────┐
└──────────────────────┘    │   bookings   │
                            └──────────────┘
```

---

## 🔄 State Transitions

### Booking Status Flow
```
┌─────────┐
│ pending │  Initial state when booking is created
└────┬────┘
     │
     │ Payment received
     ▼
┌───────────┐
│ confirmed │  Booking is confirmed and paid
└─────┬─────┘
      │
      │ Guest arrives
      ▼
┌────────────┐
│ checked_in │  Guest has checked in
└──────┬─────┘
       │
       │ Guest leaves
       ▼
┌───────────┐
│ completed │  Booking is finished
└───────────┘

       OR
       
┌─────────┐
│ pending │
└────┬────┘
     │
     │ Guest cancels
     ▼
┌───────────┐
│ cancelled │  Booking is cancelled
└───────────┘
```

### Payment Status Flow
```
┌─────────┐
│ pending │  Awaiting payment
└────┬────┘
     │
     │ Payment processed
     ▼
┌──────┐
│ paid │  Payment completed
└──────┘

     OR
     
┌─────────┐
│ pending │
└────┬────┘
     │
     │ Payment fails
     ▼
┌────────┐
│ failed │  Payment failed
└────────┘

     OR
     
┌─────────┐
│ pending │
└────┬────┘
     │
     │ Partial payment
     ▼
┌─────────┐
│ partial │  Partially paid
└─────────┘
```

### Room Status Flow (After Booking)
```
┌───────────┐
│ available │  Room is ready for booking
└─────┬─────┘
      │
      │ Booking confirmed
      ▼
┌─────────┐
│ booked  │  Room is reserved
└────┬────┘
     │
     │ Guest checks in
     ▼
┌──────────┐
│ occupied │  Guest is staying
└─────┬────┘
      │
      │ Guest checks out
      ▼
┌────────┐
│ dirty  │  Needs cleaning
└────┬───┘
     │
     │ Housekeeping completes
     ▼
┌─────────┐
│ cleaned │  Ready for inspection
└────┬────┘
     │
     │ Inspection passed
     ▼
┌───────────┐
│ available │  Ready for next guest
└───────────┘
```

---

## 📋 Data Flow Example

### Complete Booking Scenario

**Guest**: John Doe wants to book Room 101 for 5 nights

```
Step 1: Browse Available Rooms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input:
  - Check-in: 2025-02-01
  - Check-out: 2025-02-06
  - Homestay: Kigali Comfort Inn

Query:
  SELECT * FROM room_availability
  WHERE date BETWEEN '2025-02-01' AND '2025-02-05'
  AND homestay_id = 1
  AND available_units > 0
  AND closed = false

Result:
  - Room 101 (Deluxe Double) - Available
  - Room 102 (Standard Single) - Available
  - Room 103 (Suite) - Booked


Step 2: Select Room & Get Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Selected: Room 101

Query:
  SELECT ri.*, rt.*, h.*
  FROM room_inventory ri
  JOIN room_types rt ON ri.room_type_id = rt.room_type_id
  JOIN homestays h ON rt.homestay_id = h.homestay_id
  WHERE ri.inventory_id = 5

Result:
  - Room Number: 101
  - Type: Deluxe Double
  - Price: 50,000 RWF/night
  - Max People: 2
  - Amenities: WiFi, TV, AC, Mini Bar


Step 3: Create Guest Profile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input:
  - First Name: John
  - Last Name: Doe
  - Email: john.doe@example.com
  - Phone: +250788123456
  - ID Type: Passport
  - ID Number: P123456789

Insert:
  INSERT INTO guest_profiles (first_name, last_name, email, phone, ...)
  VALUES ('John', 'Doe', 'john.doe@example.com', '+250788123456', ...)

Result:
  - Guest ID: 42


Step 4: Create Booking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Calculations:
  - Nights: 5
  - Room Rate: 50,000 RWF
  - Subtotal: 250,000 RWF
  - Tax (18%): 45,000 RWF
  - Discount: 0 RWF
  - Final Amount: 295,000 RWF

Insert into bookings:
  INSERT INTO bookings (booking_reference, guest_name, service_type, 
                        status, payment_status, total_amount, ...)
  VALUES ('BK20250115001', 'John Doe', 'room', 'confirmed', 
          'pending', 295000, ...)
  
  → Booking ID: 456

Insert into room_bookings:
  INSERT INTO room_bookings (booking_id, room_id, check_in_date, 
                             check_out_date, nights, final_amount, ...)
  VALUES (456, 5, '2025-02-01', '2025-02-06', 5, 295000, ...)
  
  → Room Booking ID: 123

Insert into booking_guests:
  INSERT INTO booking_guests (booking_id, guest_id, is_primary)
  VALUES (456, 42, true)


Step 5: Process Payment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input:
  - Booking ID: 456
  - Amount: 295,000 RWF
  - Method: Mobile Money (MTN)
  - Transaction Ref: MM20250115123456

Insert:
  INSERT INTO payment_transactions (booking_id, amount, payment_method,
                                    transaction_reference, payment_status, ...)
  VALUES (456, 295000, 'mobile_money', 'MM20250115123456', 'completed', ...)
  
  → Transaction ID: 789

Update:
  UPDATE bookings 
  SET payment_status = 'paid'
  WHERE booking_id = 456


Step 6: Post-Booking Actions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Update room availability:
  UPDATE room_availability
  SET available_units = available_units - 1
  WHERE inventory_id = 5
  AND date BETWEEN '2025-02-01' AND '2025-02-05'

Create housekeeping task:
  INSERT INTO housekeeping_tasks (homestay_id, inventory_id, task_type,
                                  priority, scheduled_date, booking_id, ...)
  VALUES (1, 5, 'setup', 'normal', '2025-02-01', 456, ...)

Send confirmation email:
  → Email to: john.doe@example.com
  → Subject: Booking Confirmation - BK20250115001
  → Content: Booking details, check-in instructions, contact info


FINAL RESULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Booking Reference: BK20250115001
✅ Guest: John Doe (ID: 42)
✅ Room: 101 - Deluxe Double
✅ Check-in: February 1, 2025
✅ Check-out: February 6, 2025
✅ Nights: 5
✅ Total Amount: 295,000 RWF
✅ Payment Status: Paid
✅ Booking Status: Confirmed
✅ Housekeeping Task: Created
```

---

## 🔍 Validation Checks

### During Booking Creation

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION CHECKLIST                          │
└─────────────────────────────────────────────────────────────────┘

1. Date Validation
   ✓ Check-out date > Check-in date
   ✓ Check-in date >= Today
   ✓ Date range within allowed booking window

2. Room Availability
   ✓ Room exists in inventory
   ✓ Room status is 'available'
   ✓ No overlapping bookings for same room
   ✓ Available units > 0 for all dates
   ✓ Room not closed for maintenance

3. Guest Information
   ✓ All required fields provided
   ✓ Email format is valid
   ✓ Phone number format is valid
   ✓ ID number is provided
   ✓ At least one guest is primary

4. Pricing Calculation
   ✓ Room rate matches current pricing
   ✓ Nights calculated correctly
   ✓ Tax calculated correctly
   ✓ Discount is valid (if applied)
   ✓ Final amount = (rate × nights) - discount + tax

5. Payment Validation
   ✓ Payment amount matches booking total
   ✓ Payment method is supported
   ✓ Transaction reference is unique
   ✓ Payment status is valid

6. Business Rules
   ✓ Minimum stay requirement met
   ✓ Maximum stay not exceeded
   ✓ Number of guests <= room capacity
   ✓ Booking reference is unique
```

---

## 📊 Success Metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOOKING FLOW METRICS                          │
└─────────────────────────────────────────────────────────────────┘

Performance Targets:
  ✓ Room search: < 500ms
  ✓ Booking creation: < 2 seconds
  ✓ Payment processing: < 3 seconds
  ✓ Total flow: < 10 seconds

Data Integrity:
  ✓ 100% foreign key validation
  ✓ 0 orphaned records
  ✓ 0 double bookings
  ✓ 100% calculation accuracy

User Experience:
  ✓ Clear error messages
  ✓ Real-time availability updates
  ✓ Instant booking confirmation
  ✓ Automatic email notifications
```

---

*This diagram provides a comprehensive visual representation of the booking flow, database relationships, and state transitions in the Travooz HMS system.*