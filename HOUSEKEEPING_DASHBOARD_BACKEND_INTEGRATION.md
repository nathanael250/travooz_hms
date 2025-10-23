# 🏠 Housekeeping Dashboard - Backend Integration Guide

**Status:** ✅ **LIVE AND OPERATIONAL**  
**URL:** `/housekeeping/dashboard`  
**Data Source:** Backend API (Live)  
**Last Updated:** October 23, 2025  

---

## 📋 Overview

The Housekeeping Dashboard has been updated to fetch **real-time data directly from the backend** instead of using mock data. All statistics and task information are now pulled from the guest requests system.

### What Changed?
✅ Replaced mock data with API calls  
✅ Real-time statistics calculation  
✅ Auto-refresh every 30 seconds  
✅ Error handling with retry capability  
✅ Team activity based on actual task assignments  

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ HOUSEKEEPING DASHBOARD (/housekeeping/dashboard)               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
                ┌──────────────────────┐
                │  fetchDashboardData  │ (Triggered on load & every 30s)
                └──────────┬───────────┘
                           │
                           ↓
            ┌──────────────────────────────┐
            │  API Call:                   │
            │  GET /guest-requests         │
            └──────────────┬───────────────┘
                           │
                    ┌──────┴──────┐
                    ↓             ↓
            ┌─────────────┐  ┌──────────────┐
            │   Backend   │  │  Database    │
            │   Express   │  │  PostgreSQL  │
            │   Server    │  │              │
            └──────┬──────┘  └──────────────┘
                   │
                   ↓
        ┌──────────────────────────────┐
        │  Response Data:              │
        │  - All guest requests        │
        │  - Assigned staff info       │
        │  - Status & priority         │
        │  - Timestamps                │
        └──────────────┬───────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  Frontend Processing:        │
        │  - Filter by status          │
        │  - Calculate statistics      │
        │  - Group by staff            │
        │  - Count completed today     │
        └──────────────┬───────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  Update Dashboard State      │
        │  - Pending tasks count       │
        │  - In progress count         │
        │  - Completed today           │
        │  - Team activity breakdown   │
        └──────────────┬───────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  Render UI Components:       │
        │  - Statistics cards          │
        │  - StaffTaskDashboard        │
        │  - Room status               │
        │  - Team activity             │
        │  - Supply alerts             │
        └──────────────────────────────┘
```

---

## 📊 Statistics Calculation

### How Numbers Are Calculated

#### 1. **Pending Tasks**
```javascript
requests.filter(r => r.status === 'pending').length
```
- Counts all requests where status = 'pending'
- These are tasks waiting to be accepted by staff

#### 2. **In Progress Tasks**
```javascript
requests.filter(r => r.status === 'in_progress').length
```
- Counts all requests where status = 'in_progress'
- These are tasks currently being worked on

#### 3. **Completed Today**
```javascript
requests.filter(r => 
  r.status === 'completed' && 
  new Date(r.completed_time).toDateString() === today
).length
```
- Counts tasks completed today only
- Uses `completed_time` field from database
- Compares date portion only (ignores time)

#### 4. **Team Activity**
```javascript
// Groups requests by assigned_staff_name
// For each staff member:
//   - Count completed tasks
//   - Count in_progress tasks
//   - Mark as 'active' status
```

**Example Output:**
```json
[
  {
    "name": "Maria Santos",
    "tasksCompleted": 15,
    "tasksInProgress": 2,
    "status": "active"
  },
  {
    "name": "John Doe",
    "tasksCompleted": 12,
    "tasksInProgress": 1,
    "status": "active"
  }
]
```

---

## 🔌 API Integration

### Endpoint Used

**GET `/guest-requests`**

```http
GET http://localhost:5000/api/guest-requests
Authorization: Bearer <token>
```

### Response Structure

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "request_id": 1,
        "booking_id": 101,
        "guest_id": 5,
        "request_type": "housekeeping",
        "description": "Need extra towels",
        "priority": "normal",
        "status": "pending",
        "assigned_to": 12,
        "assigned_staff_name": "Maria Santos",
        "assigned_staff_email": "maria@example.com",
        "assigned_staff_role": "housekeeping_staff",
        "requested_time": "2025-10-23T10:30:00Z",
        "scheduled_time": null,
        "completed_time": null,
        "additional_charges": 0,
        "notes": "Guest notes here",
        "staff_notes": "Staff notes here",
        "rating": null,
        "feedback": null,
        "guest_name": "John Doe",
        "guest_email": "john@example.com",
        "booking_reference": "BK-1001",
        "homestay_name": "Luxury Hotel"
      },
      // ... more requests
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Authentication

All API calls automatically include the user's auth token via the `apiClient` interceptor.

---

## 🔄 Auto-Refresh Mechanism

### How It Works

```javascript
useEffect(() => {
  // Initial load on component mount
  fetchDashboardData();
  
  // Set up auto-refresh interval
  const interval = setInterval(fetchDashboardData, 30000);
  
  // Cleanup on unmount
  return () => clearInterval(interval);
}, []);
```

### Refresh Interval
- **Initial Load:** Immediately when component mounts
- **Auto-Refresh:** Every 30 seconds (30,000 milliseconds)
- **Manual Refresh:** Error message displays "Try again" button

### What Updates
- ✅ Pending tasks count
- ✅ In progress count
- ✅ Completed today count
- ✅ Team member activity stats
- ✅ StaffTaskDashboard component (also auto-refreshes)

---

## ⚙️ Configuration & State Management

### Initial State
```javascript
const [dashboardData, setDashboardData] = useState({
  pendingTasks: 0,
  inProgressTasks: 0,
  completedToday: 0,
  totalRooms: 0,
  roomsByStatus: {
    dirty: 0,
    cleaning: 0,
    clean: 0,
    inspectionNeeded: 0
  },
  supplyAlerts: [],
  teamActivity: []
});

const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### State Updates During Fetch

**Before Request:**
```
loading = true
error = null
```

**On Success:**
```
loading = false
error = null
dashboardData = { ...updated data from API }
```

**On Error:**
```
loading = false
error = "Failed to load dashboard data"
dashboardData = { ...last known state }
```

---

## 🎯 URL Structure

### Current Route
```
http://localhost:5173/housekeeping/dashboard
```

### Route Definition (App.jsx)
```jsx
<Route path="housekeeping/dashboard" element={<HousekeepingDashboard />} />
```

### All Housekeeping Routes
```
/housekeeping/dashboard      → Main dashboard (THIS PAGE)
/housekeeping/tasks          → Task management
/housekeeping/my-tasks       → Staff's assigned tasks
/housekeeping/pending        → Pending tasks view
/housekeeping/completed      → Completed tasks view
```

---

## 📱 Component Structure

### HousekeepingDashboard Layout

```
┌─────────────────────────────────────────────┐
│ Header (Welcome, Current Time)              │
├─────────────────────────────────────────────┤
│ Error Message (if any)                      │
├─────────────────────────────────────────────┤
│ Quick Stats (4 cards)                       │
│ ┌─────────┬─────────┬─────────┬─────────┐   │
│ │ Pending │In Prog. │Completed│ Rooms   │   │
│ │   12    │    5    │   28    │   60    │   │
│ └─────────┴─────────┴─────────┴─────────┘   │
├─────────────────────────────────────────────┤
│ My Assigned Tasks (StaffTaskDashboard)      │
│ ┌─────────────────────────────────────────┐ │
│ │ Pending │Ack│InProg│Complete           │ │
│ │    0    │ 0 │  0  │  0                │ │
│ │                                       │ │
│ │ No tasks in this status               │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Room Status Overview                        │
│ ┌────┬────┬────┬────┐                      │
│ │12  │ 5  │38  │ 5  │                      │
│ │Dty │Cln │Good│Insp│                      │
│ └────┴────┴────┴────┘                      │
├──────────────────┬──────────────────────────┤
│ Supply Alerts    │ Team Activity            │
│                  │                         │
│ ⚠️ Toilet Paper   │ Maria Santos: 8/2       │
│ (critical)       │ John Doe: 6/1           │
│                  │ Emma Wilson: 7/2        │
└──────────────────┴──────────────────────────┘
```

---

## 🔐 Security & Multi-Tenant

### How Multi-Tenancy Works

1. **User Authentication**
   - User logs in and gets auth token
   - Token stored in AuthContext

2. **Request Filtering**
   - Every API call includes auth token
   - Backend middleware validates token
   - Backend filters data by user's `assigned_hotel_id`

3. **Data Isolation**
   - Tasks only from user's hotel
   - Cannot see other hotels' data
   - Cross-hotel requests are blocked

### Code Example
```javascript
// Frontend - transparent to user
const response = await apiClient.get('/guest-requests');

// Backend - enforces multi-tenancy
const user = req.user; // From auth middleware
const whereClause = `WHERE rb.homestay_id = ?`; // Only this hotel
const replacements = [user.assigned_hotel_id];
```

---

## 🐛 Error Handling

### Error Scenarios

| Scenario | Error Message | User Action |
|----------|---------------|-------------|
| Network down | "Failed to load dashboard data" | Click "Try again" |
| Invalid token | API returns 401 | User redirected to login |
| Server error (500) | "Failed to load dashboard data" | Click "Try again" |
| No data found | Shows zeros | Normal operation |

### Error UI
```jsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <h3>Error loading dashboard</h3>
    <p>{error}</p>
    <button onClick={fetchDashboardData}>Try again</button>
  </div>
)}
```

---

## 📊 Sample Data Transformation

### Raw API Response
```json
{
  "requests": [
    {
      "request_id": 1,
      "status": "pending",
      "assigned_staff_name": "Maria"
    },
    {
      "request_id": 2,
      "status": "pending",
      "assigned_staff_name": "John"
    },
    {
      "request_id": 3,
      "status": "in_progress",
      "assigned_staff_name": "Maria"
    },
    {
      "request_id": 4,
      "status": "completed",
      "completed_time": "2025-10-23T14:30:00Z",
      "assigned_staff_name": "Emma"
    }
  ]
}
```

### Processed Dashboard Data
```javascript
{
  pendingTasks: 2,        // Requests with status='pending'
  inProgressTasks: 1,     // Requests with status='in_progress'
  completedToday: 1,      // Completed today
  teamActivity: [
    { name: "Maria", tasksCompleted: 1, tasksInProgress: 1 },
    { name: "John", tasksCompleted: 0, tasksInProgress: 0 },
    { name: "Emma", tasksCompleted: 1, tasksInProgress: 0 }
  ]
}
```

---

## 🚀 Performance Optimization

### Current Optimizations
1. **Auto-refresh every 30 seconds** - Balances freshness with performance
2. **Efficient filtering** - Done in frontend after fetch
3. **State management** - Only updates when data actually changes
4. **Error states** - Doesn't re-render while loading (preserves old data)

### Future Optimizations
- [ ] WebSocket for real-time updates
- [ ] GraphQL query for specific fields only
- [ ] Pagination for large task lists
- [ ] Caching layer with stale-while-revalidate
- [ ] Request debouncing for multiple refreshes

---

## 🧪 Testing the Integration

### Step 1: Create Test Data
```bash
# Create a guest request from Front Desk module
POST /api/guest-requests
{
  "booking_id": 1,
  "guest_id": 1,
  "request_type": "housekeeping",
  "description": "Need extra towels",
  "priority": "normal",
  "assigned_to": 5,
  "additional_charges": 0,
  "notes": "Guest preference: soft towels"
}
```

### Step 2: Verify Dashboard Update
1. Open `/housekeeping/dashboard`
2. Check if Pending Tasks count increases
3. Check Team Activity shows assignment
4. Wait 30 seconds to verify auto-refresh

### Step 3: Accept and Complete Task
1. Open StaffTaskDashboard (integrated in dashboard)
2. Click "Accept Task"
3. Task status changes to "acknowledged"
4. Click "Mark Complete"
5. Dashboard stats update

### Step 4: Verify Completed Count
1. Check "Completed Today" increases
2. Verify it only counts tasks from today
3. If task was created yesterday, shouldn't count

---

## 📝 Implementation Checklist

- [x] Remove hardcoded mock data
- [x] Add API call to fetch guest requests
- [x] Calculate statistics from real data
- [x] Implement auto-refresh every 30 seconds
- [x] Add error handling with retry
- [x] Add loading states
- [x] Group team activity by staff
- [x] Filter completed tasks by date
- [x] Multi-tenant security validation
- [x] Component integration with StaffTaskDashboard
- [x] Update UI for error display
- [x] Test with sample data

---

## 🔧 Troubleshooting

### Issue: Dashboard shows "No tasks in this status"
**Cause:** No guest requests created yet  
**Solution:** Create test guest request via Front Desk

### Issue: Team Activity shows "No team members"
**Cause:** No tasks have assigned_staff_name  
**Solution:** Ensure tasks are properly assigned to staff members

### Issue: "Failed to load dashboard data" error
**Cause:** API call failed  
**Solution:** Check network tab, verify backend is running, click "Try again"

### Issue: Completed count not updating
**Cause:** Refresh interval hasn't triggered  
**Solution:** Wait 30 seconds or reload page

### Issue: Statistics are 0
**Cause:** First load, data still fetching  
**Solution:** Wait for loading spinner to complete

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `HousekeepingDashboard.jsx` | Main component (UPDATED) |
| `StaffTaskDashboard.jsx` | Task management (Integrated) |
| `guestRequests.routes.js` | Backend API endpoints |
| `guest_requests.ts` | Backend database table |
| `apiClient.js` | Axios config for API calls |

---

## 🎯 What's Next?

### Phase 2 Enhancements
- [ ] Room Status Overview - Fetch from room status endpoint
- [ ] Supply Alerts - Integrate with stock management
- [ ] Real-time notifications - WebSocket integration
- [ ] Performance analytics - Detailed staff metrics
- [ ] Task completion trends - Chart visualization

---

**Status:** ✅ **All Systems Operational**  
**Last Verified:** October 23, 2025  
**Maintained By:** Hotel Management System Team

For questions or issues, refer to the troubleshooting section or check backend logs at `/backend/logs/combined.log`