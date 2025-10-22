# 🧪 Guest Check-Out Testing Guide

## Prerequisites
- Backend running on http://localhost:3001
- Frontend running on http://localhost:5173
- Database connection active
- Receptionist user logged in

---

## 🔄 Full Workflow Test

### Step 1: Create a Test Booking
1. Navigate to Bookings Management
2. Create a new booking with:
   - Guest name: "Test Guest"
   - Check-in: Today
   - Check-out: Tomorrow
   - Room: Any available room
   - Payment: Pay 50% to get to 'partial' or 100% to get to 'paid'

### Step 2: Confirm the Booking
1. Booking status should be 'pending'
2. Click confirmation action
3. Verify status changes to 'confirmed'

### Step 3: Assign a Room
1. Click assign room button
2. Select an available room
3. Confirm assignment

### Step 4: Check-In the Guest
1. Click the green "Check-In" button
2. Modal appears asking for confirmation
3. Click "Confirm Check-In"
4. Verify:
   - ✅ Booking status changes to "In-House" (completed)
   - ✅ Room status changes to "occupied"
   - ✅ Success toast appears
   - ✅ Check-in log created in database

**Verify in Database**:
```sql
SELECT * FROM check_in_logs WHERE booking_id = <id> ORDER BY check_in_time DESC LIMIT 1;
```

### Step 5: Check-Out the Guest (NEW!)
1. In BookingsList, find the booking with "In-House" status
2. Click the orange "LogOut" check-out button
3. Check-Out Modal appears with:
   - Guest name
   - Room information
   - Form fields for:
     - Deposit Returned
     - Additional Charges
     - Payment Method
     - Notes

4. Fill in test data:
   - Deposit Returned: 50000
   - Additional Charges: 5000
   - Payment Method: cash
   - Notes: "Guest satisfied with stay"

5. Click "Confirm Check-Out" button

6. Verify:
   - ✅ Success toast: "Guest checked out successfully!"
   - ✅ Booking status changes to "Checked Out"
   - ✅ Check-out button disappears
   - ✅ Booking can no longer be checked out (button gone)

---

## 📊 Database Verification

After check-out, run these queries to verify everything was logged:

### 1. Verify Booking Status Updated
```sql
SELECT booking_id, status, checked_out_at
FROM bookings
WHERE booking_id = <your_booking_id>;
```

**Expected Output**:
```
booking_id | status      | checked_out_at
<id>       | checked_out | 2025-10-10 15:30:00
```

### 2. Verify Room Status Changed to Cleaning
```sql
SELECT inventory_id, unit_number, status
FROM room_inventory
WHERE inventory_id = (
  SELECT inventory_id FROM room_bookings 
  WHERE booking_id = <your_booking_id> LIMIT 1
);
```

**Expected Output**:
```
inventory_id | unit_number | status
<id>         | 101         | cleaning
```

### 3. Verify Front Desk Log Created
```sql
SELECT * FROM front_desk_logs
WHERE booking_id = <your_booking_id>
ORDER BY action_time DESC LIMIT 1;
```

**Expected Output**:
```
log_id | booking_id | action_type | performed_by | action_time | room_unit | deposit_returned | additional_charges | payment_method | notes
<id>   | <id>       | check_out   | <staff_id>   | NOW()       | 101       | 50000            | 5000               | cash           | Guest satisfied with stay
```

### 4. Verify Room Status Log Created
```sql
SELECT * FROM room_status_log
WHERE inventory_id = (
  SELECT inventory_id FROM room_bookings 
  WHERE booking_id = <your_booking_id> LIMIT 1
)
ORDER BY created_at DESC LIMIT 1;
```

**Expected Output**:
```
log_id | inventory_id | previous_status | new_status | changed_by | reason               | created_at
<id>   | <id>         | occupied        | cleaning   | <staff_id> | Guest checked out    | NOW()
```

### 5. Verify Audit Log Created
```sql
SELECT * FROM audit_logs
WHERE action = 'CHECK_OUT' AND record_id = <your_booking_id>
ORDER BY created_at DESC LIMIT 1;
```

**Expected Output**:
```
log_id | user_id    | action   | table_name | record_id | old_values | new_values | ip_address | user_agent | created_at
<id>   | <staff_id> | CHECK_OUT| bookings   | <id>      | {...}      | {...}      | 127.0.0.1  | Mozilla... | NOW()
```

### 6. Verify room_assignments Updated
```sql
SELECT assignment_id, booking_id, check_in_time, check_out_time
FROM room_assignments
WHERE booking_id = <your_booking_id>;
```

**Expected Output**:
```
assignment_id | booking_id | check_in_time | check_out_time
<id>          | <id>       | 2025-10-10... | 2025-10-10...
```

---

## ❌ Error Scenarios to Test

### Scenario 1: Check-Out Non-Existent Booking
1. Try to check out booking_id = 99999
2. **Expected**: Error message "Booking not found"
3. **Verify**: No logs created

### Scenario 2: Check-Out Before Check-In
1. Create and confirm a booking
2. Try to check out (without checking in first)
3. **Expected**: Error "Guest must be checked in (completed status) before checkout"
4. **Verify**: Booking status unchanged
5. **Verify**: No logs created

### Scenario 3: Negative Values
1. Try to enter negative deposit_returned: -100
2. **Expected**: Either validation error or value treated as 0
3. **Verify**: Database records correct value

### Scenario 4: Non-Numeric Values
1. Try to enter text in deposit field: "abc"
2. **Expected**: Input validation error or field ignores input
3. **Verify**: Form blocks submission or shows error

---

## 🎯 Frontend UI Tests

### Check-Out Button Visibility
1. ✅ Appears for bookings with status = 'completed'
2. ✅ Hidden for bookings with status != 'completed'
3. ✅ Orange color for distinction from other actions
4. ✅ Correct LogOut icon

### Modal Display
1. ✅ Modal appears centered on screen
2. ✅ Guest and room information displayed correctly
3. ✅ Form fields have proper labels
4. ✅ Cancel button closes modal without action
5. ✅ "Confirm Check-Out" button is orange

### Form Behavior
1. ✅ Deposit Returned: Number input, allows decimals
2. ✅ Additional Charges: Number input, allows decimals
3. ✅ Payment Method: Dropdown with all options
4. ✅ Notes: Textarea for multi-line input
5. ✅ Form resets after successful submission

### Status Badge
1. ✅ Shows "In-House" for status='completed'
2. ✅ Shows "Checked Out" for status='checked_out'
3. ✅ Shows "Checked In" for status='checked_in'
4. ✅ Uses correct green/gray/orange colors

---

## 🔍 API Endpoint Test (Postman)

### Request
```
POST http://localhost:3001/api/receptionist/check-out/45
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "deposit_returned": 50000,
  "additional_charges": 5000,
  "payment_method": "cash",
  "notes": "Guest satisfied"
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Guest checked out successfully",
  "data": {
    "booking_id": 45,
    "status": "checked_out",
    "checked_out_at": "2025-10-10T15:30:00Z",
    "booking_reference": "BK000045",
    "guest_name": "Test Guest",
    "roomBooking": [
      {
        "booking_id": 45,
        "inventory_id": 1,
        "room": {
          "inventory_id": 1,
          "unit_number": "101",
          "status": "cleaning"
        }
      }
    ]
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Guest must be checked in (completed status) before checkout"
}
```

---

## 📈 Performance Check

1. **Check-Out Response Time**: Should be < 1 second
2. **Database Queries**: 5-6 queries executed
3. **Transaction Completion**: Should be atomic
4. **No Orphaned Records**: Verify all or nothing

---

## ✅ Acceptance Criteria

- [ ] Check-out button appears for in-house guests
- [ ] Modal displays correctly with all fields
- [ ] Booking status updates to 'checked_out'
- [ ] Room status updates to 'cleaning'
- [ ] front_desk_logs entry created
- [ ] room_status_log entry created
- [ ] audit_logs entry created
- [ ] Deposit and charges recorded
- [ ] Payment method tracked
- [ ] Notes saved
- [ ] Error messages display properly
- [ ] Transaction rollback works on error
- [ ] Toast notifications appear
- [ ] No database orphans created

---

## 🐛 Common Issues & Troubleshooting

### Issue: Check-Out Button Not Appearing
**Solution**: 
- Verify booking status is 'completed'
- Check browser console for errors
- Refresh page

### Issue: Check-Out Modal Blank
**Solution**:
- Clear browser cache
- Rebuild frontend: `npm run build`
- Restart frontend dev server

### Issue: "Guest must be checked in" Error When Already Checked In
**Solution**:
- Verify database shows status = 'completed' (not 'checked_in')
- Restart backend server to load new code

### Issue: Logs Not Created in Database
**Solution**:
- Check backend console for transaction errors
- Verify database tables exist
- Check foreign key constraints

---

## 📞 Support

If tests fail, check:
1. Backend logs: `/backend/logs/error.log`
2. Browser console: F12 → Console
3. Database logs: MySQL error log
4. Network tab: API response details

---

**Test Date**: ________________
**Tester Name**: ________________
**Status**: ☐ PASS / ☐ FAIL
**Notes**: ________________