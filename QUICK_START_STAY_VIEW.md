# 🚀 Quick Start Guide - Stay View Feature

## Step 1: Load Test Data

Navigate to the config directory and run the loader script:

```bash
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend/config
./load_test_data.sh
```

**Or** load directly with MySQL:

```bash
mysql -u root -p travooz_hms < stay_view_test_data.sql
```

## Step 2: Start the Servers

### Backend:
```bash
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend
npm start
```

### Frontend (in a new terminal):
```bash
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/frontend
npm start
```

## Step 3: Access Stay View

1. Open browser: `http://localhost:3000`
2. Login as vendor (vendor_id = 2)
3. Navigate to: `http://localhost:3000/hotels/homestays/1`
4. Click the blue **"Stay View"** button

## What You'll See

### 📊 Timeline View
- **12 rooms** listed vertically (Room 101 to Room 501)
- **30-day calendar** displayed horizontally
- **Colored booking bars** showing occupancy:
  - 🟡 Yellow = Pending
  - 🟢 Green = Confirmed
  - 🔵 Blue = Completed
  - 🔴 Red = Cancelled

### 🎯 Interactive Features
- **Click on any booking bar** → Opens modal with full details
- **Previous/Next buttons** → Navigate through 30-day periods
- **Today button** → Jump back to current date
- **Horizontal scroll** → View more dates

### 📅 Sample Bookings You'll See

| Room | Guest | Status | Dates |
|------|-------|--------|-------|
| 101 | John Smith | Confirmed | Yesterday → +2 days |
| 201 | Sarah Johnson | Confirmed | Today → +3 days |
| 402 | Michael & Emma Brown | Confirmed | Tomorrow → +3 days |
| 301 | Anderson Family | Confirmed | +3 days → +4 days |
| 202 | Lisa Martinez | Pending | +5 days → +7 days |
| 501 | Dr. Richard White | Confirmed | +7 days → +9 days |

## 🧪 Test Scenarios

### Scenario 1: View Current Occupancy
- Look for bookings that span today's date
- Should see John Smith (Room 101) and Sarah Johnson (Room 201)

### Scenario 2: Check Upcoming Bookings
- Click "Next" to see future bookings
- Should see bookings up to 14 days ahead

### Scenario 3: View Booking Details
- Click on any colored bar
- Modal shows: Guest info, room details, dates, special requests

### Scenario 4: Navigate Timeline
- Use Previous/Next to move through dates
- Click "Today" to return to current date

### Scenario 5: Check Different Statuses
- Yellow bars = Pending (Lisa Martinez, Robert Taylor)
- Red bars = Cancelled (William Garcia, Jennifer Lee)
- Green bars = Confirmed (most bookings)

## 📊 Test Data Summary

- **Total Rooms**: 12 (across 5 floors)
- **Total Bookings**: 16
  - Confirmed: 10
  - Pending: 2
  - Completed: 2
  - Cancelled: 2
- **Date Range**: 25 days (12 days past → 14 days future)
- **Homestay**: Urugero Hotel (ID: 1)

## 🔍 Verify Data Loaded

Run this query in MySQL:

```sql
SELECT 
    rb.booking_id,
    b.booking_reference,
    b.status,
    rb.guest_name,
    ri.unit_number as room,
    rb.check_in_date,
    rb.check_out_date
FROM room_bookings rb
JOIN bookings b ON rb.booking_id = b.booking_id
JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
WHERE rb.booking_id BETWEEN 100 AND 115
ORDER BY rb.check_in_date;
```

Expected result: 16 rows

## 🐛 Troubleshooting

### Issue: "No bookings found"
**Solution**: 
- Check if data loaded: `SELECT COUNT(*) FROM bookings WHERE booking_id BETWEEN 100 AND 115;`
- Should return 16

### Issue: "Unauthorized" or "Access Denied"
**Solution**: 
- Make sure you're logged in as vendor_id = 2
- This vendor owns homestay_id = 1

### Issue: Stay View button not visible
**Solution**: 
- Clear browser cache
- Check if you're on the homestay details page
- Verify frontend is running on port 3000

### Issue: Bookings not showing on timeline
**Solution**: 
- Check browser console for errors
- Verify API endpoint: `http://localhost:5000/api/homestays/1/stay-view`
- Check backend logs

## 📝 API Endpoint

The Stay View uses this endpoint:

```
GET /api/homestays/:id/stay-view
```

**Test it directly**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/homestays/1/stay-view
```

## 🎨 Visual Reference

```
┌─────────────┬────┬────┬────┬────┬────┬────┬────┐
│ Room        │ D1 │ D2 │ D3 │ D4 │ D5 │ D6 │... │
├─────────────┼────┼────┼────┼────┼────┼────┼────┤
│ Room 101    │[══John Smith══]│    │    │    │    │
│ Room 102    │    │    │[═David═]│    │    │    │
│ Room 103    │    │    │    │    │    │[P] │    │
│ Room 201    │[═══Sarah Johnson═══]│    │    │    │
│ Room 202    │    │    │    │    │[═Lisa═]│    │
│ Room 301    │    │    │[A] │    │    │    │    │
│ Room 402    │    │[══Honeymoon══]│    │    │    │
│ Room 501    │    │    │    │    │    │    │[VIP]│
└─────────────┴────┴────┴────┴────┴────┴────┴────┘

Legend:
[══] = Confirmed (Green)
[P]  = Pending (Yellow)
[X]  = Cancelled (Red)
```

## ✅ Success Checklist

- [ ] Test data loaded successfully
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can access homestay details page
- [ ] Stay View button is visible
- [ ] Timeline displays with rooms and dates
- [ ] Booking bars are visible and color-coded
- [ ] Can click on bookings to see details
- [ ] Navigation buttons work (Previous/Next/Today)
- [ ] Modal shows complete booking information

## 🎉 Next Steps

Once you've verified the Stay View works:

1. **Test with real data**: Create actual bookings through the booking system
2. **Test edge cases**: Try different date ranges, multiple bookings per room
3. **Test responsiveness**: Check on different screen sizes
4. **Test performance**: Load more bookings to see how it handles scale
5. **Customize**: Adjust colors, layout, or add new features

---

**Need Help?** Check the detailed README at:
`/home/nathanadmin/Projects/MOPAS/travooz_hms/backend/config/STAY_VIEW_TEST_DATA_README.md`