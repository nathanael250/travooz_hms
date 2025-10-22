# ⚡ Front Desk System - Quick Start Guide

## 🎯 What's Been Implemented

✅ **Step 6: Automatic Room Assignment** - Rooms are automatically assigned when payment is confirmed
✅ **Step 7: Front Desk Dashboard** - Complete UI for viewing arrivals and processing check-ins

---

## 🚀 How to Access (3 Simple Steps)

### 1️⃣ Make Sure Servers Are Running

```bash
# Check if backend is running
lsof -ti:3001

# Check if frontend is running
lsof -ti:5173

# If not running, start them:
# Terminal 1 - Backend
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend
npm run dev

# Terminal 2 - Frontend
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/frontend
npm run dev
```

### 2️⃣ Login to the Application

Open browser: `http://localhost:5173`

### 3️⃣ Navigate to Front Desk

**Option A - Using Sidebar:**
- Click **"Front Desk"** in the left sidebar
- Click **"Upcoming Arrivals"**

**Option B - Direct URL:**
```
http://localhost:5173/front-desk/upcoming-arrivals
```

---

## 📋 What You'll See

### Dashboard Features

**📊 Summary Cards:**
- Total Arrivals
- Today's Arrivals
- Rooms Assigned
- Checked In

**🔍 Filters:**
- Date range (1, 3, 7, 14, 30 days)
- Specific date picker
- Status filter (All, Confirmed, Pre-Registered)

**📝 Arrivals List:**
Each guest shows:
- Name, contact info, ID details
- Homestay and room type
- Assigned room number (if auto-assigned)
- Booking status and room assignment status
- Special requests
- Check-in button (for today's arrivals)

---

## ✅ Quick Test

### Test the Complete Workflow

**1. Create a Booking** (if you don't have one)
```bash
# Use your booking system to create a booking
# Make sure check-in date is today or in the next few days
```

**2. Confirm Payment** (triggers auto-assignment)
```bash
POST /api/room-booking/payment/:transaction_id
{
  "payment_method": "credit_card",
  "payment_reference": "TEST123"
}

# Check backend console for:
# ✅ Auto-assigned room 205 to booking 1032
```

**3. View in Front Desk Dashboard**
```
1. Go to: http://localhost:5173/front-desk/upcoming-arrivals
2. You should see the booking in the list
3. Room number should be displayed
4. Status should show "Room Assigned"
```

**4. Process Check-In** (if check-in date is today)
```
1. Click "Check In" button
2. Enter key card number: "KC-12345"
3. Click "Confirm Check-In"
4. Status changes to "Checked In"
```

---

## 🎨 Visual Guide

### Sidebar Menu Structure
```
📊 Dashboard
🏨 Hotel Management
📅 Booking Management
💳 Financial Management
👥 Guest Management
✅ Front Desk              ← CLICK HERE
  └─ Upcoming Arrivals    ← THEN CLICK HERE
✨ Housekeeping
🔧 Maintenance
🍽️ Restaurant & Kitchen
📦 Stock Management
📊 Reports
⚙️ Settings
```

### Status Badges You'll See

**Booking Status:**
- 🟢 **Confirmed** - Payment received, booking confirmed
- 🔵 **Pre-Registered** - Guest pre-registered, awaiting confirmation
- 🟡 **Pending** - Awaiting payment

**Room Assignment Status:**
- ⚪ **Not Assigned** - No room assigned yet
- 🔵 **Room Assigned** - Room auto-assigned, ready for check-in
- 🟢 **Checked In** - Guest has checked in
- ⚪ **Checked Out** - Guest has checked out

---

## 🔄 How Auto-Assignment Works

### Automatic Process (Step 6)

**When:** Payment is confirmed for a booking

**What Happens:**
1. System finds the room type from the booking
2. Searches for available, clean rooms of that type
3. Assigns the first available room
4. Updates room status to "reserved"
5. Creates room assignment record
6. Logs to console: `✅ Auto-assigned room 205 to booking 1032`

**SQL Logic:**
```sql
-- Find available clean room
SELECT inventory_id, unit_number
FROM room_inventory ri
WHERE room_type_id = ?
  AND status = 'available'
  AND cleanliness_status = 'clean'
  AND NOT already assigned
LIMIT 1;

-- Assign room
INSERT INTO room_assignments (booking_id, inventory_id, assigned_by, status)
VALUES (?, ?, NULL, 'assigned');

-- Update room status
UPDATE room_inventory SET status = 'reserved' WHERE inventory_id = ?;
```

---

## 📱 Frontend Features

### Filter Options

**Date Range:**
- Next 1 Day (today's arrivals)
- Next 3 Days
- Next 7 Days (default)
- Next 14 Days
- Next 30 Days

**Or Specific Date:**
- Use date picker to select exact date

**Status Filter:**
- All Statuses
- Confirmed only
- Pre-Registered only

### Check-In Modal

**Fields:**
- **Key Card Number** (required) - e.g., "KC-12345"
- **Notes** (optional) - Any additional information

**Actions:**
- **Cancel** - Close modal without saving
- **Confirm Check-In** - Process the check-in

---

## 🐛 Common Issues & Solutions

### Issue: Can't see Front Desk menu
**Solution:** Clear browser cache and refresh

### Issue: No arrivals showing
**Check:**
1. Are there confirmed bookings in the date range?
2. Is the backend running?
3. Are you logged in?

**SQL to verify:**
```sql
SELECT b.booking_id, b.status, rb.check_in_date, rb.guest_name
FROM bookings b
INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
WHERE b.status IN ('confirmed', 'pre_registered')
AND rb.check_in_date >= CURDATE()
ORDER BY rb.check_in_date;
```

### Issue: Check-in button not showing
**Requirements:**
- Room must be assigned
- Check-in date must be today
- Guest must not already be checked in

### Issue: "Failed to fetch arrivals"
**Solutions:**
```bash
# Check backend is running
lsof -ti:3001

# Check for errors in backend console
# Check browser console for errors

# Try logging out and back in
localStorage.clear();
# Then login again
```

---

## 📚 Documentation Files

**Detailed Guides:**
- `FRONTEND_ACCESS_GUIDE.md` - Complete frontend access guide
- `IMPLEMENTATION_STATUS.md` - Technical implementation details
- `TEST_FRONT_DESK.md` - Testing procedures
- `FRONT_DESK_GUIDE.md` - Comprehensive feature guide

**This File:**
- `QUICK_START.md` - You are here! Quick reference guide

---

## 🎯 Key Endpoints

### Backend API

**Get Upcoming Arrivals:**
```
GET /api/front-desk/upcoming-arrivals?days=7
Headers: Authorization: Bearer {token}
```

**Get Today's Arrivals:**
```
GET /api/front-desk/today-arrivals
Headers: Authorization: Bearer {token}
```

**Check-In Guest:**
```
POST /api/front-desk/check-in/:booking_id
Headers: Authorization: Bearer {token}
Body: {
  "key_card_number": "KC-12345",
  "notes": "Optional notes"
}
```

### Frontend Routes

**Dashboard:**
```
http://localhost:5173/front-desk/upcoming-arrivals
```

---

## ✨ Features Summary

### What Front Desk Staff Can Do

**Before Check-In:**
- ✅ View all upcoming arrivals
- ✅ See auto-assigned rooms
- ✅ Check guest details and ID info
- ✅ Review special requests
- ✅ Filter by date and status

**On Check-In Day:**
- ✅ View today's arrivals
- ✅ Process guest check-in
- ✅ Issue key cards
- ✅ Add check-in notes
- ✅ Track checked-in vs pending

**System Features:**
- ✅ Automatic room assignment on payment
- ✅ Real-time status updates
- ✅ Responsive design (mobile-friendly)
- ✅ Toast notifications for feedback
- ✅ Grouped by check-in date
- ✅ Color-coded status badges

---

## 🎉 You're All Set!

The Front Desk system is **fully operational** and ready to use!

**Quick Access:**
1. Login: `http://localhost:5173`
2. Navigate: **Front Desk → Upcoming Arrivals**
3. Start managing guest arrivals! 🚀

**Need Help?**
- Check the detailed guides in the documentation files
- Review the troubleshooting section above
- Check backend console logs for errors
- Check browser console for frontend errors

---

## 📞 Support Checklist

If you encounter issues:

- [ ] Backend server running? (`lsof -ti:3001`)
- [ ] Frontend server running? (`lsof -ti:5173`)
- [ ] Logged in with valid credentials?
- [ ] Browser cache cleared?
- [ ] Database has confirmed bookings?
- [ ] Check backend console for errors
- [ ] Check browser console for errors
- [ ] Token not expired? (Try logging out and back in)

---

**Happy Managing! 🎊**