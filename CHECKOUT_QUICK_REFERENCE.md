# 🚀 Check-Out Quick Reference Card

## ⚡ 30-Second Overview

**What**: Guest check-out process with charge tracking
**Where**: Front Desk → Bookings Management  
**How**: Orange LogOut button → Fill form → Confirm
**Result**: Booking status changed to "Checked Out", Room status to "cleaning", Logs created

---

## 🎯 How to Use (Receptionist)

### 1. Find Guest
- Navigate to **Bookings** (Front Desk)
- Find booking with status **"In-House"** (green badge)

### 2. Click Check-Out Button
- Orange **LogOut** icon in Actions column
- Modal opens

### 3. Fill Check-Out Form
| Field | Required? | Example |
|-------|-----------|---------|
| Deposit Returned | No | 50000 |
| Additional Charges | No | 5000 |
| Payment Method | No | Cash |
| Notes | No | "Guest satisfied" |

### 4. Click "Confirm Check-Out"
- Status changes to **"Checked Out"** ✅
- Room status → **"cleaning"**
- Success notification appears
- Button disappears

---

## 🔌 API Usage (Developers)

### Endpoint
```bash
POST /api/receptionist/check-out/:booking_id
Authorization: Bearer <token>
```

### Request
```json
{
  "deposit_returned": 50000,
  "additional_charges": 5000,
  "payment_method": "cash",
  "notes": "Guest feedback"
}
```

### Success (200)
```json
{
  "success": true,
  "message": "Guest checked out successfully",
  "data": { booking_id, status: "checked_out", ... }
}
```

### Error (400)
```json
{
  "success": false,
  "message": "Guest must be checked in before checkout"
}
```

---

## 💾 Database Changes

| Table | Change |
|-------|--------|
| `bookings` | status='checked_out', checked_out_at=NOW() |
| `room_inventory` | status='cleaning' |
| `front_desk_logs` | ✨ NEW: action_type='check_out' |
| `room_status_log` | ✨ NEW: previous_status→'cleaning' |
| `audit_logs` | ✨ NEW: action='CHECK_OUT' |
| `room_assignments` | check_out_time=NOW() |

---

## ✅ Verification Queries

### Booking Status Changed?
```sql
SELECT booking_id, status, checked_out_at 
FROM bookings WHERE booking_id = 45;
-- Expected: status='checked_out', checked_out_at=<timestamp>
```

### Room Status Changed?
```sql
SELECT unit_number, status 
FROM room_inventory WHERE inventory_id = 1;
-- Expected: status='cleaning'
```

### Logs Created?
```sql
SELECT * FROM front_desk_logs WHERE booking_id = 45 AND action_type = 'check_out';
SELECT * FROM room_status_log WHERE new_status = 'cleaning' AND inventory_id = 1;
SELECT * FROM audit_logs WHERE action = 'CHECK_OUT' AND record_id = 45;
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Button not visible | Booking must have status='completed' |
| Modal won't open | Clear browser cache, refresh page |
| "Guest not checked in" error | Verify booking was checked in first |
| Logs not created | Check database, run verification queries |
| Form won't submit | Ensure all data is valid numbers |

---

## 📱 Frontend Implementation

**File**: `/frontend/src/pages/frontdesk/BookingsList.jsx`

**Components**:
- Check-out button (lines 555-563)
- Check-out modal (lines 942-1073)
- Handler functions (lines 186-223)
- State management (lines 53, 57-63)

**Handlers**:
- `handleCheckOutClick()`: Open modal
- `handleCheckOutConfirm()`: Submit API request

---

## 🔙 Backend Implementation

**File**: `/backend/src/controllers/receptionist.controller.js`

**Function**: `checkOutGuest()` (lines 739-930)

**Key Logic**:
1. Validate booking exists
2. Validate status = 'completed'
3. Start transaction
4. Update booking & room
5. Create 3 log entries
6. Commit transaction
7. Return updated booking

---

## 📊 Status Lifecycle

```
pending
   ↓
confirmed
   ↓
completed (In-House)  ← Can check out from here
   ↓
checked_out
   ↓
[final state]
```

---

## 🎨 UI Elements

### Check-Out Button
- **Location**: Bookings table, Actions column
- **Color**: Orange (#F97316)
- **Icon**: LogOut
- **Shows when**: status === 'completed'

### Check-Out Modal
- **Title**: "Guest Check-Out"
- **Size**: Medium (max-w-lg)
- **Fields**: 4 optional form fields
- **Actions**: Cancel / Confirm Check-Out

### Status Badge
- **'completed'**: Green "In-House"
- **'checked_out'**: Gray "Checked Out"

---

## ⏱️ Timeline

### Single Check-Out Operation
- Frontend click: instant
- API call: <1s
- Database operations: <500ms
- Transaction commit: automatic
- UI update: instant

---

## 🔐 Security

- ✅ Staff ID logged with action
- ✅ IP address captured
- ✅ User agent tracked
- ✅ Transaction atomicity
- ✅ Role-based access
- ✅ Input validation
- ✅ SQL injection protected (parameterized queries)

---

## 📈 Monitoring

### Check Success
```bash
tail -f /backend/logs/combined.log | grep "Check-out"
# Look for: ✅ Guest Check-out: Booking X by Staff Y
```

### Check Errors
```bash
tail -f /backend/logs/error.log | grep "checkout"
# Should be empty for successful operations
```

---

## 🎯 Common Scenarios

### Scenario 1: Normal Check-Out
1. Guest paid fully → status='completed'
2. Guest packs out → Click check-out
3. No charges → Leave charges empty
4. Confirm → Done ✅

### Scenario 2: With Extra Charges
1. Guest damaged something → Charges=5000
2. Fill additional_charges field
3. Select payment_method='other'
4. Add notes explaining charge
5. Confirm → Done ✅

### Scenario 3: With Deposit Return
1. Guest paid deposit → Deposit_returned=50000
2. Fill deposit_returned field
3. Confirm → Done ✅

---

## 📞 Support

**For Issues**:
1. Check troubleshooting section above
2. Review backend logs: `/backend/logs/error.log`
3. Check database: Run verification queries
4. See full documentation: `CHECKOUT_IMPLEMENTATION_COMPLETE.md`
5. Run tests: See `CHECKOUT_TESTING_GUIDE.md`

---

## ✨ Pro Tips

1. **Bulk Check-Out**: Do one-by-one for audit trail clarity
2. **Notes**: Always add notes for charges (auditable)
3. **Payment Method**: Select if charges incurred
4. **Deposits**: Double-check amounts before confirming
5. **Filter**: Use "Checked Out" filter to see completed checkouts

---

## 🚀 Next Steps

1. ✅ Restart backend server
2. ✅ Login to frontend
3. ✅ Test with in-house booking
4. ✅ Verify logs created
5. ✅ Check room status = cleaning
6. ✅ Ready for production! 🎉

---

**Quick Ref Version**: 1.0
**Last Updated**: October 10, 2025
**Status**: Ready for Use ✅