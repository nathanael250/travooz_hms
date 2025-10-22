# 📖 Receptionist Booking List - User Guide

## 👋 Welcome to the Front Desk Booking Management System

This guide walks you through using the new Booking List feature to manage guest check-ins and room assignments.

---

## 🏠 Getting Started

### How to Access the Booking List

1. **Log in** with your receptionist credentials
2. **Click "Front Desk"** in the left sidebar menu
3. **Select "Bookings"** from the submenu
4. Or navigate directly to: `http://yoursite.com/front-desk/bookings`

### Understanding the Dashboard

When you first log in, you'll see the **Front Desk Dashboard** showing:
- 📊 Quick stats (today's check-ins, check-outs, available rooms)
- 👥 Today's arrivals list
- 🚪 Today's departures list
- 🛏️ Room status overview
- 🔔 Recent guest requests

---

## 📋 Booking List Overview

### The Booking Table

The main booking list shows all bookings with these details:

| Column | What It Shows | Purpose |
|--------|---------------|---------| 
| **Booking** | Booking ID and Reference | Quick identification |
| **Guest** | Guest name and contact info | Verify guest identity |
| **Dates** | Check-in and check-out dates | Plan room assignments |
| **Room** | Room type and number | See current assignment |
| **Status** | Booking status (badge) | Track booking state |
| **Amount** | Total booking amount | Payment tracking |
| **Actions** | View, Assign Room, Check-In | Manage booking |

### Status Badges

```
🟦 CONFIRMED (Blue)      → Booking confirmed, ready for check-in
🟩 CHECKED IN (Green)    → Guest has checked in
⬜ CHECKED OUT (Gray)    → Guest has checked out
🟥 CANCELLED (Red)       → Booking cancelled
🟨 PENDING (Yellow)      → Waiting for confirmation/payment
```

---

## 🔍 Finding Bookings

### Method 1: Filter by Status

1. Click **"Show Filters"** button at top
2. Select a status from dropdown:
   - **Confirmed** - Ready for check-in
   - **Checked In** - Already in property
   - **Checked Out** - Already left
   - **Cancelled** - Not happening
   - **Pending** - Awaiting confirmation

3. Table updates automatically

**Use Case:** "Show me all bookings that need check-in today"

### Method 2: Filter by Date Range

1. Click **"Show Filters"**
2. Set **"Check-in From"** date (today or future date)
3. Set **"Check-in To"** date (end of range)
4. Table updates to show bookings in that date range

**Use Case:** "Show me all check-ins this week"

### Method 3: Search by Guest Name

1. Click **"Show Filters"**
2. Type guest name in **"Search"** box
3. As you type, results filter in real-time

**Tip:** Works with partial names (e.g., "John" finds "John Smith")

### Method 4: Search by Booking Reference

1. Click **"Show Filters"**
2. Type booking reference (e.g., "BK-2025-001") in search box
3. Results filter immediately

**Tip:** Each booking has a unique reference starting with "BK-"

### Clear All Filters

Click **"Clear Filters"** button to reset and see all bookings again.

---

## 👀 Viewing Booking Details

### Step-by-Step

1. Find the booking in the list
2. Click **"View"** button in the Actions column
3. A **details modal** opens showing:

**Guest Information:**
- Full name and contact details
- Email and phone number
- Special requests or notes

**Booking Details:**
- Booking reference number
- Check-in and check-out dates
- Number of adults and children
- Number of nights

**Room Information:**
- Room type (e.g., "Deluxe", "Standard")
- Assigned room number (if assigned)
- Room capacity

**Payment Information:**
- Booking amount
- Payment status (Paid, Pending, Partial)
- Payment method

4. Click **"Close"** or outside modal to close

---

## 🛏️ Assigning Rooms

### When to Assign a Room

Assign a room when:
- Guest is checking in today
- Booking shows room as "Not Assigned"
- Guest preference is known

### Step-by-Step Room Assignment

1. Find the booking in list
2. Look for **"Assign Room"** button (appears if room not assigned)
3. Click **"Assign Room"**
4. **Available Rooms Modal** opens showing:
   - Room number
   - Room type
   - Floor
   - Occupancy capacity
   - Status

5. **Select a room** from the list
6. Review the room details
7. Click **"Confirm Assignment"**

**Success!** The room number now appears in the booking row.

### Available Room Indicators

Rooms shown in the modal are guaranteed available for:
- The booking's check-in date
- The booking's check-out date
- The booking's required room type (if specified)

### Tips for Room Selection

- 🏔️ **High Floors:** Give if guest requests (privacy/view)
- 🎵 **Quiet Rooms:** Assign if special request made
- ♿ **Accessible:** Assign if guest needs accessibility
- 👨‍👩‍👧‍👦 **Large Groups:** Assign rooms near each other
- 🚪 **New Guests:** Prefer central locations (easier to find)

---

## ✅ Checking In Guests

### When to Check In

- Guest has arrived at the property
- Room is assigned
- Booking status is "Confirmed"
- Payment is complete (or partially paid)

### Step-by-Step Check-In

1. **Verify guest arrival** (by phone/in person)
2. Find booking in list
3. Click **"Check-In"** button
4. **Check-In Confirmation Modal** appears asking:
   - Confirm guest name
   - Confirm room assignment
   - Accept or add special notes

5. Click **"Confirm Check-In"**

**Success!** 
- Status changes to "Checked In" (green badge)
- Room status changes to "Occupied"
- Guest has access to room

### What Happens After Check-In

- Guest receives key/card
- Housekeeping is notified if needed
- Billing period starts
- Late checkout fees may apply

---

## 📊 Pagination (Viewing Multiple Pages)

### How Pagination Works

- **Default:** Shows 20 bookings per page
- **Bottom of table:** Navigation controls appear

### Pagination Controls

```
Page 1 of 5
← Previous | 1  2  3  4  5 | Next →
```

- Click **Next** to go to next page
- Click **Previous** to go to previous page
- Click **page number** to jump to specific page
- Shows "1-20 of 145" = 20 bookings out of 145 total

### Tips

- Use filters first to narrow down results
- Then navigate pages if needed
- Search is faster than pagination for finding specific booking

---

## 🔄 Refreshing Data

### When to Refresh

- After another staff member makes changes
- To see new bookings that just came in
- Every few hours for an updated view

### How to Refresh

1. Click **refresh icon** (circular arrows) in dashboard header
2. Or manually refresh browser (F5 or Ctrl+R)
3. Data reloads from server

---

## ⚠️ What You Can & Cannot Do

### ✅ You Can

- [x] View all bookings for your property
- [x] Filter and search bookings
- [x] View complete booking details
- [x] Assign available rooms
- [x] Check in guests
- [x] Access daily dashboard summary

### ❌ You Cannot

- [ ] View other properties' bookings (if multi-property setup)
- [ ] Modify booking dates
- [ ] Change guest information
- [ ] Cancel bookings
- [ ] Process refunds
- [ ] Create new bookings (use booking system for that)

---

## 🐛 Common Issues & Solutions

### Issue: "Room Not Assigned" - No Assign Button Showing

**Possible Causes:**
1. Room already assigned (check Room column)
2. Booking not confirmed yet
3. All rooms are booked

**Solution:**
1. Check Room column - room may already be assigned
2. Wait for booking confirmation
3. Contact manager if all rooms booked

---

### Issue: "Check-In Button Grayed Out"

**Possible Causes:**
1. Payment not completed
2. Booking not confirmed
3. No room assigned yet

**Solution:**
1. Complete payment first
2. Wait for booking confirmation
3. Assign a room first

---

### Issue: "Can't Find Guest Booking"

**Solutions:**
1. Try searching by booking reference (BK-XXXX)
2. Clear all filters and search again
3. Check correct date range
4. Verify guest is for your property (not another hotel)
5. Ask manager for booking reference

---

### Issue: "Can't See Today's Check-Ins"

**Possible Causes:**
1. Bookings haven't arrived yet (check future dates)
2. Filter might be hiding them
3. Refresh needed

**Solution:**
1. Click "Clear Filters" to see all bookings
2. Set date filter to today
3. Refresh browser (F5)
4. Check dashboard for summary

---

## 📞 Need Help?

### Quick Tips

- **Hover over fields** - Many show helpful tooltips
- **Color badges** - Status badges always show current state
- **Error messages** - Read carefully; they explain what went wrong
- **Refresh icon** - Use if data seems outdated

### Contact Your Manager If:

- Cannot see any bookings
- Cannot assign rooms
- Cannot check in guest
- System shows error messages
- Data seems incorrect

---

## 🎯 Daily Workflow Example

### Morning (8:00 AM)

```
1. Log in to system
2. Go to Front Desk Dashboard
3. Review "Today's Arrivals" widget
4. Count how many need room assignments
5. Go to Bookings List
6. Filter: Status = Confirmed, Date = Today
7. Assign rooms to guests checking in today
```

### Afternoon (2:00 PM)

```
1. Guests start arriving
2. Find each guest in booking list
3. Verify details match guest
4. Click "Check-In"
5. Provide room key/card
6. Give welcome information
7. Repeat for each arrival
```

### Evening (5:00 PM)

```
1. Review "Today's Departures" in dashboard
2. Note which guests checking out tomorrow
3. Mark their rooms for cleaning
4. Check for any special requests
5. Prepare for next day's arrivals
```

---

## 💡 Pro Tips

### Tip 1: Use Keyboard Shortcuts
- `Ctrl+F` - Browser find (to search page)
- `F5` - Refresh page
- `Ctrl+L` - Go to address bar

### Tip 2: Multi-Filter Searching
1. Filter by **Status: Confirmed**
2. Filter by **Date: Today**
3. Search by **"Room Not Assigned"**
Result: All guests arriving today who need rooms

### Tip 3: Batch Operations
When multiple guests arriving:
1. Sort by check-in time
2. Assign rooms in order
3. Check in as guests arrive
4. Document any special requests

### Tip 4: Special Requests
Always:
1. Note special requests in details modal
2. Communicate to housekeeping
3. Check off after completed
4. Thank guest when acknowledged

---

## 📱 Mobile Access

The booking list is **mobile-friendly**:

1. Works on phones and tablets
2. Touch-friendly buttons
3. Responsive tables (scroll right if needed)
4. Can check in guests from anywhere

### Mobile Tips

- Use **landscape mode** for better view
- Pinch-zoom if table too small
- Use search instead of scrolling
- Refresh regularly on slow connections

---

## 🔒 Security Reminders

- **Your Account:** Don't share login credentials
- **Guest Information:** Keep information private
- **Logout:** Always logout when leaving desk
- **Passwords:** Change regularly (every 90 days recommended)

---

## 📚 Related Resources

- Dashboard Overview Guide
- Room Management Guide
- Payment Processing Guide
- Guest Request Handling Guide

---

## ✨ Key Takeaways

✅ **You can now:**
- View all bookings quickly
- Find any guest in seconds
- Assign rooms efficiently
- Check in guests smoothly
- Manage your daily workflow

✅ **Best practices:**
- Use filters to narrow results
- Assign rooms in advance when possible
- Verify details before check-in
- Note special requests
- Refresh data regularly

✅ **Remember:**
- You can only see your property's bookings
- Always complete payment before check-in
- Room availability is guaranteed until assignment
- Special requests need communication to staff

---

## 🎓 Training Completed

**I understand:**
- [ ] How to access booking list
- [ ] How to filter and search bookings
- [ ] How to view booking details
- [ ] How to assign rooms
- [ ] How to check in guests
- [ ] How to handle common issues
- [ ] How to use pagination
- [ ] How to refresh data
- [ ] My permissions and limitations
- [ ] Daily workflow steps

---

**Date Trained:** _________________
**Staff Member:** _________________
**Trainer Name:** _________________
**Notes:** _________________________

---

## 🚀 You're Ready!

You now have all the knowledge to efficiently manage guest bookings and check-ins using the new Front Desk Booking Management System.

**Happy hosting!** 🎉

---

**For technical support or feature requests, contact your system administrator.**

**Last Updated:** January 15, 2025
**Version:** 1.0
**Status:** Ready for Use ✅