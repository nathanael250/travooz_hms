# ⚡ Housekeeping Dashboard - Quick Reference

**URL:** `http://localhost:5173/housekeeping/dashboard`  
**Status:** ✅ Live with Backend Integration  

---

## 🎯 What Changed

| Aspect | Before | After |
|--------|--------|-------|
| **Data Source** | Hardcoded mock data | Real backend API |
| **Update Frequency** | Static (no updates) | Auto-refresh every 30 seconds |
| **Task Count** | Fixed "12", "5", "28" | Dynamic from database |
| **Team Activity** | Sample names | Real staff assignments |
| **Error Handling** | None | Error messages with retry |

---

## 📍 URL Structure

### Main Route
```
/housekeeping/dashboard
```

### All Housekeeping Routes
```
/housekeeping/dashboard        ← You are here
/housekeeping/tasks
/housekeeping/my-tasks
/housekeeping/pending
/housekeeping/completed
```

---

## 🔄 How Data Flows

```
Component Mount
    ↓
Fetch Data from API (/guest-requests)
    ↓
Process & Calculate Stats
    ↓
Update Dashboard Display
    ↓
Wait 30 seconds
    ↓
Fetch Data Again (auto-refresh)
    ↓
[Repeat]
```

---

## 📊 Dashboard Sections

### 1️⃣ Quick Stats Cards
```
┌─────────────┬─────────────┬──────────────┬──────────────┐
│  Pending    │ In Progress │ Completed    │ Total Rooms  │
│  Tasks      │    Tasks    │    Today     │              │
│             │             │              │              │
│    Count    │    Count    │    Count     │    Count     │
└─────────────┴─────────────┴──────────────┴──────────────┘

Data Source: guest_requests table
```

### 2️⃣ My Assigned Tasks (StaffTaskDashboard)
```
┌────────────────────────────────────────────┐
│ Pending │ Ack │ In Prog │ Completed         │
│ Count   │Count│  Count  │ Count             │
│                                            │
│ Task list with status + details            │
│ Accept / Complete buttons                  │
│                                            │
│ Auto-refreshes every 30 seconds            │
└────────────────────────────────────────────┘

Data Source: GET /guest-requests/my-tasks
```

### 3️⃣ Team Activity
```
┌────────────────────────┐
│ Team Member Name       │
│ ✅ 8 tasks completed   │
│ 🔄 2 in progress       │
└────────────────────────┘

Data Source: guest_requests grouped by assigned_staff_name
```

---

## ✅ Verification Checklist

### Is It Working?

- [ ] Page loads without errors
- [ ] Statistics show numbers (not "0" everywhere)
- [ ] Numbers change after you create a task
- [ ] "My Assigned Tasks" section displays
- [ ] Error message appears if API is down
- [ ] Numbers auto-refresh every 30 seconds

### How to Test

**Step 1: Go to Front Desk**
```
Click: Front Desk → Guest Folio → Create Guest Request
```

**Step 2: Create a Request**
```
Booking: Select any booking
Type: housekeeping
Description: "Test extra towels"
Priority: normal
Assigned To: Select any housekeeping staff
Click: Create
```

**Step 3: Watch Dashboard Update**
```
Go back to /housekeeping/dashboard
Pending Tasks count should increase by 1
Team Activity should show assignment
```

**Step 4: Accept Task**
```
In "My Assigned Tasks" section
Click: "Accept Task" button
Status should change to "Acknowledged"
```

**Step 5: Complete Task**
```
Click: "Mark Complete"
Add completion notes
Click: "✅ Complete"
Dashboard should update
```

---

## 🔴 Troubleshooting

### Dashboard is Empty (All zeros)
```
✅ First load? Dashboard loads but no requests created yet
   → Create a test request from Front Desk

✅ API error? Check browser console (F12) for errors
   → Ensure backend is running: npm start (in /backend)

✅ Wrong hotel? Multi-tenant isolation
   → Verify you're logged in with correct user
```

### "Failed to load dashboard data" Error
```
❌ Backend is not running
   → cd /backend && npm start

❌ Invalid auth token
   → Logout and login again

❌ Network issue
   → Check network tab (F12) for failed requests
   → Click "Try again" button
```

### Numbers Not Updating
```
⏳ Auto-refresh runs every 30 seconds
   → Wait 30 seconds for auto-update
   → Or reload page (F5)

❌ Check if task status changed
   → Go to Front Desk → View task status
   → Might be in "cancelled" state
```

### Team Member Not Showing
```
📋 Task must have assigned_to value
   → When creating request, select a staff member
   → Staff must have hms_user_id in database

👤 Staff not created?
   → Go to Hotels → HMS Users
   → Create housekeeping staff member
   → Assign to your hotel
```

---

## 🔌 API Integration

### What API is Used?

```
Endpoint: GET /api/guest-requests
Purpose: Fetch all guest requests for the hotel
Frequency: On page load + every 30 seconds
Requires: Auth token (automatic)
Filters: Automatically by hotel (user.assigned_hotel_id)
```

### Example Response Processing

```javascript
// Raw API returns 150 requests
[
  { request_id: 1, status: 'pending', ... },
  { request_id: 2, status: 'in_progress', ... },
  { request_id: 3, status: 'completed', ... },
  ...
]

// Frontend calculates:
Pending = 45 requests with status='pending'
InProgress = 23 requests with status='in_progress'
CompletedToday = 12 requests with status='completed' + today's date
```

---

## 🎛️ Configuration

### Auto-Refresh Interval
**Location:** `HousekeepingDashboard.jsx` line 48
```javascript
const interval = setInterval(fetchDashboardData, 30000); // 30 seconds
```

**To Change:** Update `30000` to desired milliseconds
- 5 seconds = 5000
- 1 minute = 60000
- 2 minutes = 120000

### Error Message Display
**Location:** `HousekeepingDashboard.jsx` lines 162-176

Shows when API fails. Users can click "Try again" to retry.

---

## 📱 Page Layout

```
┌─────────────────────────────────────────────────────┐
│ HEADER - Housekeeping Dashboard                     │
│ Thursday, October 23, 2025 • 08:12 AM              │
│ Welcome housekeeping_vendor                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ERROR (if any) - Shows red alert box               │
└─────────────────────────────────────────────────────┘

┌───────┬───────┬───────┬───────┐
│ Stat  │ Stat  │ Stat  │ Stat  │  QUICK STATS
└───────┴───────┴───────┴───────┘

┌─────────────────────────────────────────────────────┐
│ My Assigned Tasks (StaffTaskDashboard Component)   │
│ ┌──────┬──────┬──────┬──────┐                      │
│ │ Pend │ Ack  │ Prog │ Comp │ Task counts         │
│ └──────┴──────┴──────┴──────┘                      │
│ [Task list/No tasks message]                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Room Status Overview                               │
│ ┌──────┬──────┬──────┬──────┐                      │
│ │ Dirty│Clean │Good  │Insp. │                     │
│ │  12  │  5   │ 38   │  5   │                     │
│ └──────┴──────┴──────┴──────┘                      │
└─────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│ Supply Alerts    │ Team Activity    │  BOTTOM SECTIONS
│                  │                  │
│ ⚠️ 3 low items   │ 3 team members   │
└──────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────┐
│ Today's Performance                                │
│ 28 Rooms Cleaned | 95% Completion | 42 min avg    │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Data Points Explained

### Pending Tasks
- **What:** Requests assigned but not yet accepted
- **Status:** `pending`
- **Action:** Staff member must click "Accept Task"
- **Example:** 12 pending means 12 tasks waiting

### In Progress Tasks
- **What:** Requests that staff is working on
- **Status:** `in_progress`
- **Action:** Staff member clicked "Start Working"
- **Example:** 5 in progress means 5 people actively working

### Completed Today
- **What:** Requests finished today
- **Status:** `completed`
- **Date:** Only counts if `completed_time` is today
- **Example:** 28 completed means 28 tasks done today

### Team Activity
- **What:** Individual staff performance
- **Shows:** Number of completed + in-progress tasks
- **Data:** Aggregated from all requests assigned to that person
- **Example:** "Maria: 8 completed, 2 in progress"

---

## 🔐 Security Notes

### Data Isolation
- ✅ Staff can only see their own hotel's tasks
- ✅ Backend enforces `homestay_id` filtering
- ✅ Cannot see other hotels' data
- ✅ All requests validated by auth middleware

### User Role
- **housekeeping_staff:** Views their assigned tasks
- **housekeeping_manager:** Can view all housekeeping tasks
- **admin:** Can view everything

---

## 📞 Need Help?

### Check Logs
```bash
# Backend logs
tail -f backend/logs/combined.log

# Frontend browser console
Press F12 → Console tab
Look for errors
```

### Verify Backend Running
```bash
curl http://localhost:5000/api/guest-requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify Database
```bash
# Check guest_requests table
SELECT COUNT(*) FROM guest_requests 
WHERE homestay_id = YOUR_HOTEL_ID;
```

---

## 🚀 Quick Deployment Checklist

- [x] Code updated in HousekeepingDashboard.jsx
- [x] API integration working
- [x] Error handling added
- [x] Auto-refresh implemented
- [x] Multi-tenant security verified
- [x] Component tested
- [x] Documentation created

**Status:** ✅ Ready to Use

---

## 🎯 Next Steps

1. **Open Dashboard**
   ```
   http://localhost:5173/housekeeping/dashboard
   ```

2. **Create Test Request**
   - Go to Front Desk
   - Create guest request
   - Assign to yourself

3. **Verify Dashboard Updates**
   - Check pending count increases
   - Check team activity
   - Wait 30 seconds for auto-refresh

4. **Accept Task**
   - Click "Accept Task" in My Assigned Tasks
   - Verify status changes

5. **Complete Task**
   - Click "Mark Complete"
   - Add notes and rating
   - Watch dashboard update

---

**Last Updated:** October 23, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready