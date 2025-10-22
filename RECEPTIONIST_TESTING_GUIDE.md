# 🧪 Receptionist Booking List - Testing Guide

## ✅ Pre-Testing Checklist

Before running tests, ensure:

- [ ] Backend is running (`npm start` in `/backend` directory)
- [ ] Frontend is running (`npm run dev` in `/frontend` directory)
- [ ] Database is configured and migrations are applied
- [ ] At least one HMS user has been created with `receptionist` role
- [ ] At least one booking exists in the system
- [ ] User is logged in as a receptionist

---

## 🚀 Test Scenarios

### Test 1: Login as Receptionist

**Steps:**
1. Navigate to http://localhost:5173/login
2. Log in with receptionist credentials
3. Verify landing on dashboard

**Expected Result:**
- ✅ Successfully logged in
- ✅ Redirected to `/dashboard`
- ✅ Can see "Front Desk Dashboard"

---

### Test 2: Access Booking List Page

**Steps:**
1. From dashboard, navigate to `Front Desk > Bookings` (or visit `/front-desk/bookings`)
2. Wait for data to load

**Expected Result:**
- ✅ Page loads without errors
- ✅ Booking table displays
- ✅ Shows pagination info (e.g., "Page 1 of X")

**What to Check:**
- [ ] Table has correct columns: Booking ID, Guest, Dates, Room, Status, Amount, Actions
- [ ] Bookings are sorted by date
- [ ] No error messages in console

---

### Test 3: Filter by Status

**Steps:**
1. Click "Show Filters"
2. Select status "Confirmed"
3. Observe table updates

**Expected Result:**
- ✅ Table filters to show only confirmed bookings
- ✅ No loading spinner
- ✅ Result count updates in pagination

**Test All Statuses:**
- [ ] Confirmed - Shows only confirmed bookings
- [ ] Checked In - Shows checked-in bookings
- [ ] Checked Out - Shows checked-out bookings
- [ ] Cancelled - Shows cancelled bookings
- [ ] Pending - Shows pending bookings

---

### Test 4: Filter by Date Range

**Steps:**
1. Click "Show Filters"
2. Set "Check-in From" to today's date
3. Set "Check-in To" to 7 days from now
4. Observe table updates

**Expected Result:**
- ✅ Table filters to show bookings within date range
- ✅ Only bookings with check-in dates in range are shown
- ✅ Pagination updates

---

### Test 5: Search Functionality

**Steps:**
1. Click "Show Filters"
2. In search box, type a guest name (e.g., "John")
3. Press Enter or wait for auto-search

**Expected Result:**
- ✅ Table filters to show only bookings matching search
- ✅ Search works for both guest names and booking references
- ✅ Results update in real-time

---

### Test 6: View Booking Details

**Steps:**
1. Click "View" button on any booking row
2. Modal opens showing booking details

**Expected Result:**
- ✅ Modal displays all booking information
- ✅ Correct guest name and booking reference shown
- ✅ Dates and room info are accurate
- ✅ Special requests (if any) are displayed

**Modal Content Check:**
- [ ] Guest name
- [ ] Booking reference
- [ ] Check-in and check-out dates
- [ ] Room type
- [ ] Number of adults/children
- [ ] Payment status
- [ ] Total amount
- [ ] Special requests (if any)
- [ ] Close button works

---

### Test 7: Assign Room to Booking

**Pre-requisites:**
- Booking exists with status "Confirmed" and no room assigned
- At least one available room exists

**Steps:**
1. Find a booking with no room assigned (room number shows "Not Assigned")
2. Click "Assign Room" button
3. Modal opens showing available rooms
4. Select a room from dropdown
5. Click "Confirm"

**Expected Result:**
- ✅ Modal shows list of available rooms
- ✅ Each room shows: Room Number, Room Type, Floor, Max Occupancy
- ✅ After assignment, table updates
- ✅ Room number now shows in the booking row
- ✅ Success toast notification appears

**Error Cases to Test:**
- [ ] Try to assign room already booked for same dates → Should show error
- [ ] Try without selecting a room → Should show "Please select a room" error
- [ ] Try to assign to wrong room type → Should still work (verify backend allows this)

---

### Test 8: Check-In Guest

**Pre-requisites:**
- Booking exists with status "Confirmed"
- Room is assigned to the booking
- Payment status is "Paid" or "Partial"

**Steps:**
1. Find a confirmed booking with assigned room
2. Click "Check-In" button
3. Confirmation modal appears
4. Click "Confirm"

**Expected Result:**
- ✅ Check-in confirmation modal appears
- ✅ After confirmation, booking status changes to "Checked In"
- ✅ Table updates automatically
- ✅ Success toast notification appears
- ✅ Room status changes to "Occupied" (verify in room status view)

**Error Cases to Test:**
- [ ] Try to check in unpaid booking → Should show payment error
- [ ] Try to check in without room assigned → Should show error
- [ ] Try to check in already checked-in booking → Should show status error

---

### Test 9: Pagination

**Steps:**
1. Click on page 2 (if available)
2. Verify new bookings load
3. Click back to page 1
4. Verify original bookings appear

**Expected Result:**
- ✅ Pagination controls work
- ✅ Correct page number displays
- ✅ Total pages shown accurately
- ✅ Page changes are smooth

---

### Test 10: Clear Filters

**Steps:**
1. Apply multiple filters (status, date range, search)
2. Click "Clear Filters" button
3. Observe table

**Expected Result:**
- ✅ All filters are cleared
- ✅ All bookings reappear
- ✅ Reset to page 1

---

### Test 11: Receptionist Dashboard

**Steps:**
1. Go to `/dashboard` while logged in as receptionist
2. Dashboard should show Receptionist Dashboard
3. Check that stats are populated

**Expected Result:**
- ✅ Dashboard loads with real data
- ✅ Today's Check-ins count is accurate
- ✅ Today's Check-outs count is accurate
- ✅ Available Rooms shows correct count
- ✅ Pending Requests shows unassigned bookings
- ✅ Today's Arrivals section shows correct guests
- ✅ Today's Departures section shows correct guests
- ✅ Refresh button works and updates data

---

### Test 12: Multi-Vendor Scoping (Multi-Property)

**Pre-requisites:**
- Two different properties exist in the system
- Two different receptionist users, each assigned to different properties

**Steps:**
1. Log in as Receptionist A (assigned to Property 1)
2. Navigate to booking list
3. Verify only Property 1 bookings show
4. Log out
5. Log in as Receptionist B (assigned to Property 2)
6. Navigate to booking list
7. Verify only Property 2 bookings show

**Expected Result:**
- ✅ Each receptionist sees only their property's bookings
- ✅ Cannot see other property's data
- ✅ No cross-property contamination

---

### Test 13: Error Handling

**Steps:**
1. Disconnect network while on booking list page
2. Try to apply a filter
3. Reconnect network
4. Retry action

**Expected Result:**
- ✅ Error toast message appears
- ✅ No page crash
- ✅ User can retry after network restored
- ✅ Data reloads correctly

---

### Test 14: Performance

**Steps:**
1. Load booking list with 1000+ bookings (if available)
2. Apply various filters
3. Change pagination
4. Monitor console for performance

**Expected Result:**
- ✅ Page remains responsive
- ✅ No "Not responding" message
- ✅ Filters apply quickly (< 2 seconds)
- ✅ No memory leaks in console

---

## 🔧 API Testing with CURL/Postman

### Test API: Get Bookings

```bash
# Get all confirmed bookings for today
curl -X GET "http://localhost:3001/api/receptionist/bookings?status=confirmed&start_date=2025-01-15&end_date=2025-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "booking_id": 1,
      "booking_reference": "BK-2025-001",
      "guest_name": "John Doe",
      "check_in_date": "2025-01-15",
      "check_out_date": "2025-01-18",
      "room_type": "Deluxe",
      "room_number": "205",
      "status": "confirmed",
      "payment_status": "paid",
      "total_amount": 500000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

### Test API: Assign Room

```bash
curl -X POST "http://localhost:3001/api/receptionist/assign-room/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_id": "INV-001"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Room assigned successfully",
  "data": { /* updated booking */ }
}
```

### Test API: Check-In

```bash
curl -X POST "http://localhost:3001/api/receptionist/check-in/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"actual_check_in_time": "2025-01-15T14:30:00Z"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Guest checked in successfully",
  "data": { /* updated booking with status: checked_in */ }
}
```

---

## 🐛 Troubleshooting

### Issue: Bookings not loading

**Possible Causes:**
- Backend not running
- User not associated with property
- No bookings in database
- Authentication token invalid

**Solution:**
1. Check backend console for errors
2. Verify user HMS association: `SELECT * FROM hms_users WHERE user_id = YOUR_USER_ID;`
3. Create test bookings if needed
4. Check token validity in network tab

---

### Issue: "User is not associated with any homestay"

**Solution:**
1. Go to HMS Users management
2. Assign the receptionist user to a homestay/property
3. Refresh browser and retry

---

### Issue: Room assignment shows no available rooms

**Possible Causes:**
- No rooms exist for the property
- All rooms are booked for those dates
- Room status is not "available"

**Solution:**
1. Check room inventory: `/hotels/room-inventory`
2. Verify rooms have status "available"
3. Check if dates have existing bookings

---

### Issue: Check-in button disabled

**Possible Causes:**
- Booking status is not "confirmed"
- Payment is not "paid"
- No room assigned

**Solution:**
1. Verify booking has status "confirmed"
2. Complete payment for booking
3. Assign a room first

---

## 📊 Expected Behavior Summary

| Action | Expected Behavior | Status |
|--------|------------------|--------|
| Load booking list | Shows paginated bookings | ✅ |
| Filter by status | Filters to matching status | ✅ |
| Filter by date | Shows bookings in date range | ✅ |
| Search by name | Searches guest name/booking ref | ✅ |
| View details | Opens detail modal | ✅ |
| Assign room | Updates booking with room | ✅ |
| Check-in | Changes status to checked_in | ✅ |
| Pagination | Navigates between pages | ✅ |
| Clear filters | Resets all filters | ✅ |
| Error handling | Shows error toast | ✅ |

---

## ✅ Sign-Off Checklist

After completing all tests, verify:

- [ ] All test scenarios passed
- [ ] No console errors
- [ ] Dashboard shows real data
- [ ] Booking list filters work correctly
- [ ] Room assignment works
- [ ] Check-in functionality works
- [ ] Multi-vendor scoping works
- [ ] Performance is acceptable
- [ ] Error handling is proper

---

## 📝 Notes

- For testing, you may need to create test bookings with various statuses
- Ensure user has proper HMS User record linked to a homestay
- Test with both confirmed (with room) and unconfirmed (without room) bookings
- Test across different properties if multi-vendor setup exists

---

**Testing Started:** _____________
**Testing Completed:** _____________
**Tester Name:** _____________
**Issues Found:** _____________