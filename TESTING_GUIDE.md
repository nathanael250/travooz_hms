# Booking Management Testing Guide

## Prerequisites
1. Backend server running on `http://localhost:3001`
2. Frontend running on `http://localhost:5173`
3. Database migration applied for external_bookings table
4. Valid authentication token (login first)

## Database Migration

Before testing External Bookings, run the migration:

```bash
cd /home/nathanadmin/Projects/MOPAS/travooz_hms
mysql -u root -p travooz_hms < backend/migrations/update_external_bookings_table.sql
```

## Testing Order

### 1. External Bookings (New Implementation)

#### Test 1: Import External Booking
1. Navigate to **Booking Management → External Bookings**
2. Click **Import Booking** button
3. Fill in the form:
   - Platform: Select "booking.com"
   - External Booking ID: "BK123456789"
   - Guest Name: "John Doe"
   - Booking Status: "Confirmed"
   - Commission Percentage: 15
   - Commission Amount: 150
   - Notes: "Test booking from Booking.com"
4. Click **Import**
5. ✅ Verify: Booking appears in the table with "Pending" sync status

#### Test 2: Sync External Booking to Internal System
1. Find the imported booking in the table
2. Click the **Sync** button (green refresh icon)
3. Fill in the sync form:
   - Room: Select any available room
   - Check-in Date: Tomorrow's date
   - Check-out Date: 3 days from tomorrow
   - Adults: 2
   - Children: 0
   - Room Rate: 100
   - Discount Amount: 0
   - Tax Amount: 10
4. Click **Sync Booking**
5. ✅ Verify: 
   - Sync status changes to "Synced"
   - Internal Booking ID appears
   - Synced timestamp is recorded

#### Test 3: View External Booking Details
1. Click the **Eye** icon on any booking
2. ✅ Verify: Modal shows complete booking information including:
   - Platform and external ID
   - Guest name
   - Status badges
   - Commission details
   - Internal booking information (if synced)
   - Raw external data (if available)

#### Test 4: Update External Booking
1. Click the **Edit** icon on a booking
2. Update:
   - Booking Status: Change to "Completed"
   - Commission Amount: Update to 175
   - Notes: Add additional notes
3. Click **Update**
4. ✅ Verify: Changes are reflected in the table

#### Test 5: Filter and Search
1. Test Platform Filter: Select "booking.com"
   - ✅ Verify: Only Booking.com bookings shown
2. Test Sync Status Filter: Select "Synced"
   - ✅ Verify: Only synced bookings shown
3. Test Search: Type guest name
   - ✅ Verify: Matching bookings appear
4. Clear all filters
   - ✅ Verify: All bookings shown again

#### Test 6: Delete External Booking
1. Click **Delete** icon on a pending booking
2. Confirm deletion
3. ✅ Verify: Booking removed from list

#### Test 7: Duplicate Prevention
1. Try to import a booking with same Platform + External Booking ID
2. ✅ Verify: Error message appears preventing duplicate

#### Test 8: Sync Validation
1. Try to sync a booking to an already booked room
2. ✅ Verify: Error message about room availability

### 2. Booking Guests

#### Test 1: Add Guest to Booking
1. Navigate to **Booking Management → Booking Guests**
2. Click **Add Guest** button
3. Select a booking from dropdown
4. Select a guest from dropdown
5. Enter room assignment: "Room 101"
6. Check "Primary Guest"
7. Click **Add**
8. ✅ Verify: Guest appears with star icon (primary)

#### Test 2: Primary Guest Enforcement
1. Try to add another guest to the same booking as primary
2. ✅ Verify: System prevents multiple primary guests

#### Test 3: Search Functionality
1. Search by guest name
2. Search by email
3. Search by room assignment
4. ✅ Verify: Results filter correctly

### 3. Booking Modifications

#### Test 1: Create Modification Request
1. Navigate to **Booking Management → Booking Modifications**
2. Click **Request Modification**
3. Fill in form:
   - Booking: Select a booking
   - Modification Type: "date_change"
   - Description: "Guest wants to extend stay by 2 days"
   - Reason: "Business meeting extended"
   - Financial Impact: 200
4. Click **Submit**
5. ✅ Verify: Modification appears with "Pending" status

#### Test 2: Approve Modification
1. Click **Approve** button on pending modification
2. Enter approval notes
3. Click **Approve**
4. ✅ Verify: Status changes to "Approved" with green badge

#### Test 3: Reject Modification
1. Create another modification request
2. Click **Reject** button
3. Enter rejection reason
4. Click **Reject**
5. ✅ Verify: Status changes to "Rejected" with red badge

#### Test 4: Filter by Type and Status
1. Filter by modification type: "date_change"
2. Filter by status: "approved"
3. ✅ Verify: Filters work correctly

### 4. Multi-Room Bookings

#### Test 1: Create Multi-Room Booking
1. Navigate to **Booking Management → Multi-Room Bookings**
2. Click **Add to Group**
3. Fill in form:
   - Booking: Select a booking
   - Room Booking: Select a room booking
   - Group Name: "Smith Family Reunion"
   - Is Master: Check
4. Click **Add**
5. ✅ Verify: Group card appears with booking

#### Test 2: Add More Rooms to Group
1. Click **Add to Group** again
2. Select same booking
3. Select different room booking
4. Use same group name
5. Leave "Is Master" unchecked
6. Click **Add**
7. ✅ Verify: Room added to existing group

#### Test 3: Verify Group Totals
1. Check the group card
2. ✅ Verify: Total amount is sum of all rooms

#### Test 4: Remove Room from Group
1. Click **Delete** icon on a room in the group
2. Confirm deletion
3. ✅ Verify: Room removed, totals updated

## API Testing with cURL

### Import External Booking
```bash
curl -X POST http://localhost:3001/api/external-bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "platform": "booking.com",
    "external_booking_id": "BK987654321",
    "external_guest_name": "Jane Smith",
    "external_status": "confirmed",
    "commission_percentage": 15,
    "commission_amount": 150,
    "notes": "VIP guest",
    "external_data": {
      "check_in": "2025-01-15",
      "check_out": "2025-01-18",
      "room_type": "Deluxe Suite"
    }
  }'
```

### Get All External Bookings
```bash
curl -X GET http://localhost:3001/api/external-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Sync External Booking
```bash
curl -X POST http://localhost:3001/api/external-bookings/1/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "inventory_id": 1,
    "check_in_date": "2025-01-15",
    "check_out_date": "2025-01-18",
    "adults": 2,
    "children": 0,
    "room_rate": 100,
    "discount_amount": 0,
    "tax_amount": 10
  }'
```

### Get External Booking Statistics
```bash
curl -X GET http://localhost:3001/api/external-bookings/statistics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues and Solutions

### Issue 1: "Failed to fetch external bookings"
**Solution:** 
- Check if backend server is running
- Verify database connection
- Check if migration was applied
- Verify authentication token is valid

### Issue 2: "Room is not available for the selected dates"
**Solution:**
- Check if room is already booked for those dates
- Select different dates or different room
- Verify room exists in room_inventory table

### Issue 3: "External booking already exists"
**Solution:**
- Each platform + external_booking_id combination must be unique
- Use different external_booking_id or different platform

### Issue 4: "Cannot sync already synced booking"
**Solution:**
- Booking can only be synced once
- To re-sync, delete and re-import the external booking

### Issue 5: Dropdown shows no rooms
**Solution:**
- Verify rooms exist in room_inventory table
- Check API endpoint: `GET /api/rooms`
- Verify authentication token

## Performance Testing

### Load Test: Import Multiple Bookings
```bash
# Import 10 bookings from different platforms
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/external-bookings \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d "{
      \"platform\": \"booking.com\",
      \"external_booking_id\": \"BK$i\",
      \"external_guest_name\": \"Guest $i\",
      \"external_status\": \"confirmed\",
      \"commission_percentage\": 15,
      \"commission_amount\": 150
    }"
done
```

### Verify Performance
1. Check page load time with 100+ bookings
2. Test search performance
3. Test filter performance
4. Verify pagination (if implemented)

## Security Testing

### Test 1: Unauthorized Access
```bash
# Try to access without token
curl -X GET http://localhost:3001/api/external-bookings
# Expected: 401 Unauthorized
```

### Test 2: Invalid Token
```bash
# Try with invalid token
curl -X GET http://localhost:3001/api/external-bookings \
  -H "Authorization: Bearer INVALID_TOKEN"
# Expected: 401 Unauthorized
```

### Test 3: SQL Injection Prevention
1. Try to inject SQL in search field: `'; DROP TABLE external_bookings; --`
2. ✅ Verify: No SQL injection occurs, search returns no results

### Test 4: XSS Prevention
1. Try to inject script in guest name: `<script>alert('XSS')</script>`
2. ✅ Verify: Script is escaped and displayed as text

## Regression Testing

After any code changes, verify:
1. ✅ All existing bookings still load
2. ✅ Search and filters still work
3. ✅ CRUD operations still function
4. ✅ Sync workflow still works
5. ✅ No console errors in browser
6. ✅ No server errors in logs

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Testing

1. ✅ Keyboard navigation works
2. ✅ Screen reader compatible
3. ✅ Color contrast meets WCAG standards
4. ✅ Form labels are properly associated
5. ✅ Error messages are clear and helpful

## Success Criteria

All tests pass when:
- ✅ All CRUD operations work without errors
- ✅ Search and filters return correct results
- ✅ Sync workflow creates internal bookings correctly
- ✅ Commission tracking is accurate
- ✅ Status badges display correctly
- ✅ No console errors
- ✅ No server errors
- ✅ Data persists after page refresh
- ✅ Responsive design works on mobile
- ✅ Authentication is enforced

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Console errors (if any)
6. Server logs (if any)
7. Screenshots or screen recordings

## Next Steps After Testing

1. Fix any bugs found during testing
2. Optimize performance if needed
3. Add pagination for large datasets
4. Implement export functionality
5. Add analytics dashboard
6. Set up automated testing
7. Deploy to staging environment
8. Conduct user acceptance testing (UAT)
9. Deploy to production