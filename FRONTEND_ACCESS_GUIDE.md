# 🎨 Front Desk Frontend - Access Guide

## ✅ Setup Complete!

The Front Desk "Upcoming Arrivals" dashboard has been fully integrated into your frontend application.

---

## 🚀 How to Access the Front Desk Dashboard

### Step 1: Start the Application

Make sure both backend and frontend servers are running:

```bash
# Terminal 1 - Backend (if not already running)
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend
npm run dev

# Terminal 2 - Frontend (if not already running)
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/frontend
npm run dev
```

### Step 2: Login to the Application

1. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

2. Login with your credentials (staff account)

### Step 3: Navigate to Front Desk

Once logged in, you have **two ways** to access the Front Desk dashboard:

#### Option 1: Using the Sidebar Menu
1. Look for the **"Front Desk"** section in the left sidebar
2. Click on **"Front Desk"** to expand the menu
3. Click on **"Upcoming Arrivals"**

#### Option 2: Direct URL
Navigate directly to:
```
http://localhost:5173/front-desk/upcoming-arrivals
```

---

## 📍 Navigation Structure

The sidebar now includes a new **Front Desk** section:

```
📊 Dashboard
🏨 Hotel Management
  └─ Homestays
  └─ Room Types
  └─ Room Inventory
  └─ Room Images
  └─ Room Rates
  └─ Room Availability
  └─ Room Status Log
  └─ Room Assignments
📅 Booking Management
  └─ Bookings
  └─ Room Bookings
  └─ Multi-Room Bookings
  └─ Booking Guests
  └─ Booking Modifications
  └─ Booking Charges
  └─ External Bookings
💳 Financial Management
  └─ Accounts
  └─ Account Linkage
  └─ Account Summary
👥 Guest Management
  └─ Guest Profiles
  └─ Guest Requests
  └─ Guest Complaints
  └─ Guest Reviews
  └─ User Favorites
✅ Front Desk                    ← NEW!
  └─ Upcoming Arrivals          ← NEW!
✨ Housekeeping
  └─ Housekeeping Tasks
🔧 Maintenance
  └─ Maintenance Requests
🍽️ Restaurant & Kitchen
  └─ Restaurant Tables
  └─ Menu Management
  └─ Restaurant Orders
  └─ Order Items
  └─ Kitchen Queue
  └─ Order Delivery Info
📦 Stock Management
  └─ Stock Items
  └─ Stock Movements
  └─ Suppliers
  └─ Purchase Orders
  └─ Usage Logs
  └─ Inventory Alerts
📊 Reports
⚙️ Settings
```

---

## 🎯 What You'll See on the Dashboard

### 1. Header Section
- **Title:** "Upcoming Arrivals"
- **Subtitle:** "Manage guest check-ins and room assignments"
- **Refresh Button:** Reload the latest data

### 2. Filter Controls
- **Date Range Selector:**
  - Next 1 Day
  - Next 3 Days
  - Next 7 Days (default)
  - Next 14 Days
  - Next 30 Days

- **Specific Date Picker:** Choose a particular date

- **Status Filter:**
  - All Statuses
  - Confirmed
  - Pre-Registered

### 3. Summary Statistics Cards
Four cards showing:
- **Total Arrivals:** Total number of upcoming guests
- **Today:** Guests arriving today
- **Rooms Assigned:** How many rooms have been auto-assigned
- **Checked In:** How many guests are already checked in

### 4. Arrivals List
Grouped by check-in date, showing:

**For Each Guest:**
- ✅ Guest name
- ✅ Booking status badge (Confirmed/Pre-Registered)
- ✅ Room assignment status badge (Not Assigned/Room Assigned/Checked In)
- ✅ Homestay name
- ✅ Room type and assigned room number
- ✅ Number of adults and children
- ✅ Contact information (phone, email)
- ✅ ID information (ID type and number)
- ✅ Booking reference
- ✅ Number of nights
- ✅ Check-out date
- ✅ Total amount
- ✅ Special requests (if any)

**Action Buttons:**
- **Details:** View more information
- **Check In:** Process guest check-in (only visible for today's arrivals with assigned rooms)

### 5. Check-In Modal
When you click "Check In", a modal appears with:
- Guest name and room number
- **Key Card Number** input field
- **Notes** textarea (optional)
- **Cancel** and **Confirm Check-In** buttons

---

## 🔄 Complete User Workflow

### Scenario: Guest Arrives at Front Desk

1. **Staff opens the dashboard:**
   - Navigate to Front Desk → Upcoming Arrivals

2. **Filter for today's arrivals:**
   - Select "Next 1 Day" or use the date picker for today

3. **Find the guest:**
   - Look through the list grouped by today's date
   - Verify guest name and booking reference

4. **Check room assignment:**
   - Look for the "Room Assigned" badge
   - Note the assigned room number (e.g., "Room 205")

5. **Process check-in:**
   - Click the **"Check In"** button
   - Enter the key card number (e.g., "KC-12345")
   - Add any notes if needed
   - Click **"Confirm Check-In"**

6. **Confirmation:**
   - Success toast notification appears
   - Guest status changes to "Checked In"
   - Room status updates to "Occupied" in the system

---

## 🎨 UI Features

### Color-Coded Status Badges

**Booking Status:**
- 🟢 **Green:** Confirmed
- 🔵 **Blue:** Pre-Registered
- 🟡 **Yellow:** Pending

**Assignment Status:**
- ⚪ **Gray:** Not Assigned
- 🔵 **Blue:** Room Assigned
- 🟢 **Green:** Checked In
- ⚪ **Gray:** Checked Out

### Responsive Design
- ✅ Works on desktop, tablet, and mobile
- ✅ Sidebar collapses on mobile
- ✅ Cards stack vertically on smaller screens
- ✅ Touch-friendly buttons and inputs

### Visual Indicators
- 📅 Calendar icon for dates
- 🏨 Building icon for homestays
- 🛏️ Bed icon for rooms
- 👥 Users icon for guest count
- 📞 Phone icon for contact
- ✉️ Mail icon for email
- 💳 Credit card icon for ID
- ✅ Check circle for confirmed status
- ⏰ Clock icon for time-based info

---

## 🧪 Testing the Frontend

### Test 1: View Upcoming Arrivals
```
1. Login to the application
2. Navigate to Front Desk → Upcoming Arrivals
3. Verify the page loads without errors
4. Check that summary cards show correct counts
5. Verify arrivals are grouped by date
```

### Test 2: Use Filters
```
1. Change date range to "Next 3 Days"
2. Verify the list updates
3. Select a specific date using the date picker
4. Verify only that date's arrivals show
5. Change status filter to "Confirmed"
6. Verify only confirmed bookings appear
```

### Test 3: Check-In Process
```
1. Filter for today's arrivals
2. Find a guest with "Room Assigned" status
3. Click "Check In" button
4. Enter key card number: "KC-TEST-001"
5. Add note: "Guest requested early check-in"
6. Click "Confirm Check-In"
7. Verify success toast appears
8. Verify status changes to "Checked In"
9. Verify "Check In" button disappears
```

### Test 4: Refresh Data
```
1. Click the "Refresh" button in the header
2. Verify loading spinner appears
3. Verify data reloads successfully
4. Check that filters remain applied
```

---

## 🐛 Troubleshooting

### Issue: "Front Desk" menu not visible in sidebar
**Solution:**
- Clear browser cache and refresh
- Make sure you're logged in
- Check that the frontend server is running

### Issue: Page shows "Failed to fetch upcoming arrivals"
**Possible Causes:**
1. Backend server not running
2. Authentication token expired
3. CORS issues

**Solutions:**
```bash
# Check backend is running
lsof -ti:3001

# If not running, start it
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend
npm run dev

# Clear localStorage and login again
# In browser console:
localStorage.clear();
# Then login again
```

### Issue: No arrivals showing
**Possible Causes:**
1. No bookings in the selected date range
2. All bookings are in 'pending' status (not confirmed)
3. Database has no data

**Solutions:**
```sql
-- Check if there are any confirmed bookings
SELECT b.booking_id, b.status, rb.check_in_date, rb.guest_name
FROM bookings b
INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
WHERE b.status IN ('confirmed', 'pre_registered')
AND rb.check_in_date >= CURDATE()
ORDER BY rb.check_in_date;

-- If no results, create a test booking or confirm an existing one
```

### Issue: Check-in button not appearing
**Requirements for check-in button to show:**
1. Guest must have a room assignment (`assignment_status = 'assigned'`)
2. Check-in date must be today (`days_until_arrival = 0`)
3. Guest must not already be checked in

**Solution:**
```sql
-- Verify room assignment exists
SELECT * FROM room_assignments WHERE booking_id = YOUR_BOOKING_ID;

-- If no assignment, the auto-assignment may have failed
-- Check if there are available clean rooms
```

### Issue: Modal doesn't close after check-in
**Solution:**
- Check browser console for errors
- Verify the API response is successful
- Try refreshing the page

---

## 📱 Mobile Access

The dashboard is fully responsive and works on mobile devices:

1. **Access on mobile:**
   ```
   http://YOUR_SERVER_IP:5173/front-desk/upcoming-arrivals
   ```

2. **Mobile menu:**
   - Tap the hamburger menu icon (☰) in the top-left
   - Navigate to Front Desk → Upcoming Arrivals

3. **Mobile features:**
   - Cards stack vertically
   - Filters wrap to multiple lines
   - Touch-friendly buttons
   - Swipe-friendly modals

---

## 🔐 Security & Permissions

### Authentication Required
- All front desk endpoints require authentication
- You must be logged in to access the dashboard
- Token is stored in `localStorage` as `hms_token`

### Role-Based Access (Future Enhancement)
Currently, any authenticated user can access the front desk.
Future versions may restrict access to specific roles:
- Front Desk Staff
- Hotel Manager
- Admin

---

## 📊 Data Flow

```
User Action → Frontend Component → API Request → Backend Route → Database Query → Response → UI Update
```

**Example: Loading Arrivals**
```
1. User navigates to /front-desk/upcoming-arrivals
2. UpcomingArrivals component mounts
3. useEffect triggers fetchUpcomingArrivals()
4. GET request to /api/front-desk/upcoming-arrivals?days=7
5. Backend queries database with complex JOIN
6. Returns JSON with arrivals data
7. Frontend updates state and renders list
```

**Example: Check-In**
```
1. User clicks "Check In" button
2. Modal opens with form
3. User enters key card number
4. User clicks "Confirm Check-In"
5. POST request to /api/front-desk/check-in/:booking_id
6. Backend updates room_assignments and room_inventory
7. Returns success response
8. Frontend shows toast notification
9. Frontend refreshes arrivals list
10. UI updates to show "Checked In" status
```

---

## 🎓 Training Guide for Front Desk Staff

### Daily Routine

**Morning Shift:**
1. Login to the system
2. Navigate to Front Desk → Upcoming Arrivals
3. Filter for "Next 1 Day" to see today's arrivals
4. Review the list and note:
   - Total arrivals expected
   - Rooms that have been assigned
   - Any special requests
5. Prepare rooms and key cards

**During the Day:**
1. Keep the dashboard open
2. Click "Refresh" periodically to see updates
3. When a guest arrives:
   - Find their name in the list
   - Verify booking details
   - Click "Check In"
   - Issue key card and enter the number
   - Complete check-in

**End of Shift:**
1. Review checked-in vs pending arrivals
2. Note any no-shows or late arrivals
3. Communicate with next shift

### Best Practices
- ✅ Always verify guest ID before check-in
- ✅ Double-check room number before issuing key
- ✅ Note any special requests in the system
- ✅ Keep key card numbers accurate for tracking
- ✅ Refresh the dashboard regularly
- ✅ Report any system issues immediately

---

## 🎉 Success!

Your Front Desk dashboard is now **fully operational** and accessible through the sidebar menu!

**Quick Access:**
```
http://localhost:5173/front-desk/upcoming-arrivals
```

**Menu Path:**
```
Front Desk → Upcoming Arrivals
```

Enjoy managing your guest arrivals! 🚀