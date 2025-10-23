# 🧾 Guest Request Task Lifecycle Implementation Guide

## Overview

This document describes the complete guest request task lifecycle system, allowing hotel staff to manage, track, and fulfill guest requests operationally from logging through to completion and billing.

## System Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ RECEPTIONIST LOGS GUEST REQUEST (Front Desk)                        │
│ - Type: housekeeping, maintenance, room_service, etc.              │
│ - Priority: low, normal, high, urgent                               │
│ - Assigned to: Specific staff member or department                  │
│ - Status: pending                                                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STAFF RECEIVES NOTIFICATION & VIEWS TASK                            │
│ - Dashboard: /dashboards/housekeeping (or other role)              │
│ - Sees "My Assigned Tasks" section                                  │
│ - Priority ordering: urgent → high → normal → low                   │
│ - Status: pending                                                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: ACCEPT TASK                                                 │
│ - Staff reviews task details                                        │
│ - Clicks "Accept Task" button                                       │
│ - Status changes: pending → acknowledged                            │
│ - Backend: PATCH /guest-requests/:id/accept                        │
│ - Staff notes logged automatically                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: PERFORM THE WORK                                            │
│ - Staff starts working on the task                                  │
│ - Can optionally click "Start Working" → status: in_progress        │
│ - All timestamps recorded in database                               │
│ - Status: in_progress                                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: MARK TASK COMPLETE                                          │
│ - Staff clicks "Mark Complete" button                               │
│ - Modal opens for completion details:                               │
│   • Completion notes (required)                                     │
│   • Satisfaction rating (optional, 1-5 stars)                       │
│   • Feedback (optional)                                             │
│ - Backend: PATCH /guest-requests/:id/complete                      │
│ - Status changes: in_progress → completed                           │
│ - completed_time timestamp recorded                                 │
│ - Success notification shown                                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: BILLING INTEGRATION                                         │
│ - If additional_charges > 0:                                        │
│   • Request appears in invoice aggregation                          │
│   • Line item added when invoice generated                          │
│   • Amount: additional_charges field                                │
│ - Receptionist sees charge in Guest Folio                           │
│ - Charge included in final invoice                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ OPTIONAL: MANAGER OVERSIGHT                                         │
│ - Manager views "Task Management Overview"                          │
│ - See all tasks across all departments                              │
│ - Filter by: status, type, assigned staff                           │
│ - Statistics: pending, in_progress, completed, avg time             │
│ - Can reassign tasks if needed                                      │
│ - Can view team performance metrics                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### guest_requests table

```sql
CREATE TABLE guest_requests (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  guest_id INT,
  request_type ENUM('room_service','housekeeping','maintenance','amenity','wake_up_call','transportation','concierge','other'),
  description TEXT NOT NULL,
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  
  -- Task Assignment & Status
  status ENUM('pending','acknowledged','in_progress','completed','cancelled') DEFAULT 'pending',
  assigned_to INT,  -- FK to hms_users.hms_user_id
  
  -- Timestamps
  requested_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scheduled_time TIMESTAMP NULL,
  completed_time TIMESTAMP NULL,
  
  -- Billing
  additional_charges DECIMAL(10,2) DEFAULT 0.00,
  
  -- Notes & Feedback
  notes TEXT,           -- Guest notes when requesting
  staff_notes TEXT,     -- Staff notes during completion
  rating INT,           -- 1-5 satisfaction rating
  feedback TEXT,        -- Staff feedback
  
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  FOREIGN KEY (guest_id) REFERENCES guest_profiles(guest_id),
  FOREIGN KEY (assigned_to) REFERENCES hms_users(hms_user_id)
);
```

## API Endpoints

### 1. Create Guest Request (Receptionist)

**Endpoint:** `POST /api/guest-requests`

**Request Body:**
```json
{
  "booking_id": 1,
  "guest_id": 5,
  "request_type": "housekeeping",
  "description": "Need extra towels and pillows",
  "priority": "normal",
  "assigned_to": 12,  // hms_user_id of staff
  "requested_time": "2025-10-22T14:30:00Z",
  "additional_charges": 0,
  "notes": "Guest requested soft pillows"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guest request created successfully",
  "data": {
    "request_id": 42,
    "booking_id": 1,
    "status": "pending",
    ...
  }
}
```

### 2. Get My Tasks (Staff)

**Endpoint:** `GET /api/guest-requests/my-tasks?status=pending`

**Query Parameters:**
- `status`: pending, acknowledged, in_progress, completed, all (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "request_id": 42,
        "booking_id": 1,
        "request_type": "housekeeping",
        "description": "Need extra towels",
        "priority": "high",
        "status": "pending",
        "guest_name": "John Doe",
        "guest_email": "john@example.com",
        "booking_reference": "BK-1001",
        "homestay_name": "Luxury Suite Hotel",
        "requested_time": "2025-10-22T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    },
    "staff": {
      "hms_user_id": 12,
      "name": "Maria Santos",
      "role": "housekeeping"
    }
  }
}
```

### 3. Accept Task (Staff)

**Endpoint:** `PATCH /api/guest-requests/:request_id/accept`

**Request Body:**
```json
{
  "notes": "Starting work now"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task accepted successfully",
  "data": {
    "request_id": 42,
    "status": "acknowledged",
    "accepted_by": "Maria Santos",
    "accepted_at": "2025-10-22T14:35:00Z"
  }
}
```

### 4. Complete Task (Staff)

**Endpoint:** `PATCH /api/guest-requests/:request_id/complete`

**Request Body:**
```json
{
  "notes": "Delivered 2 extra towels and 3 pillows. Guest satisfied.",
  "rating": 5,           // 1-5 stars (optional)
  "feedback": "Task completed quickly and efficiently"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task completed successfully",
  "data": {
    "request_id": 42,
    "status": "completed",
    "completed_by": "Maria Santos",
    "completed_at": "2025-10-22T15:00:00Z"
  }
}
```

### 5. Get All Requests (Manager)

**Endpoint:** `GET /api/guest-requests?status=all&request_type=all&assigned_to=all`

**Query Parameters:**
- `status`: pending, acknowledged, in_progress, completed, cancelled (optional)
- `request_type`: room_service, housekeeping, maintenance, etc. (optional)
- `assigned_to`: hms_user_id (optional)
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "request_id": 42,
        "booking_id": 1,
        "request_type": "housekeeping",
        "description": "Need extra towels",
        "priority": "high",
        "status": "in_progress",
        "guest_name": "John Doe",
        "booking_reference": "BK-1001",
        "homestay_name": "Luxury Suite Hotel",
        "assigned_staff_name": "Maria Santos",
        "assigned_staff_role": "housekeeping",
        "requested_time": "2025-10-22T14:30:00Z",
        "completed_time": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

## Frontend Components

### 1. StaffTaskDashboard Component

**Location:** `/frontend/src/components/StaffTaskDashboard.jsx`

**Purpose:** Allows staff members to view, accept, and complete assigned tasks.

**Features:**
- View pending, acknowledged, in_progress, completed tasks
- Accept tasks with one click
- Mark tasks as complete with notes and feedback
- Priority-based sorting
- Auto-refresh every 30 seconds
- Task statistics and counts
- Expandable task details

**Usage:**
```jsx
import StaffTaskDashboard from '../../components/StaffTaskDashboard';

// In your component
<StaffTaskDashboard staffRole="housekeeping" />
```

**Props:**
- `staffRole`: string (optional) - For display/filtering purposes

### 2. ManagerTaskOversight Component

**Location:** `/frontend/src/components/ManagerTaskOversight.jsx`

**Purpose:** Allows managers to view all tasks and oversee staff performance.

**Features:**
- View all tasks across departments
- Filter by status, request type, assigned staff
- Statistics dashboard (total, pending, in_progress, completed, avg time, completion rate)
- Reassign tasks to different staff
- Task details expansion
- Team performance metrics

**Usage:**
```jsx
import ManagerTaskOversight from '../../components/ManagerTaskOversight';

// In your component
<ManagerTaskOversight />
```

### 3. Integration in Role-Specific Dashboards

**HousekeepingDashboard:**
```jsx
import StaffTaskDashboard from '../../components/StaffTaskDashboard';

<div className="bg-white rounded-lg p-4">
  <h3>My Assigned Tasks</h3>
  <StaffTaskDashboard staffRole="housekeeping" />
</div>
```

**Similar integration needed for:**
- MaintenanceDashboard
- RestaurantDashboard
- ReceptionistDashboard

## How to Integrate into Your Project

### Step 1: Database Setup (Already Done)
The `guest_requests` table already exists with all necessary fields.

### Step 2: Backend Routes
Routes are already implemented in `/backend/src/routes/guestRequests.routes.js`:
- ✅ POST /guest-requests
- ✅ GET /guest-requests
- ✅ GET /guest-requests/my-tasks
- ✅ PATCH /guest-requests/:id/accept
- ✅ PATCH /guest-requests/:id/complete
- ✅ GET /guest-requests/staff
- ✅ GET /guest-requests/:id

### Step 3: Frontend Components

**1. Copy the task components:**
- ✅ StaffTaskDashboard.jsx → `/frontend/src/components/`
- ✅ ManagerTaskOversight.jsx → `/frontend/src/components/`

**2. Update role-specific dashboards:**
```jsx
// Add to HousekeepingDashboard.jsx, MaintenanceDashboard.jsx, etc.
import StaffTaskDashboard from '../../components/StaffTaskDashboard';

// In render:
<StaffTaskDashboard staffRole="housekeeping" />
```

**3. Update sidebar/navigation to link to manager oversight:**
```jsx
// In navigation menu for managers
<Link to="/manager/task-oversight">Task Management</Link>
```

### Step 4: Add to Manager Dashboard (Optional)
Create a new route/page for manager oversight:

```jsx
// /frontend/src/pages/dashboards/ManagerTaskDashboard.jsx
import ManagerTaskOversight from '../../components/ManagerTaskOversight';

export const ManagerTaskDashboard = () => {
  return (
    <div className="p-4">
      <ManagerTaskOversight />
    </div>
  );
};
```

## User Workflows

### For Housekeeping Staff

1. **View Tasks:**
   - Go to Housekeeping Dashboard
   - See "My Assigned Tasks" section
   - Tasks sorted by priority

2. **Accept Task:**
   - Click "Accept Task" button
   - System records acceptance time
   - Status changes to "Acknowledged"

3. **Start Working:**
   - Click "Start Working" (optional)
   - Status changes to "In Progress"

4. **Complete Task:**
   - Click "Mark Complete"
   - Fill in completion notes (required)
   - Optionally add satisfaction rating (1-5 stars)
   - Submit
   - Status changes to "Completed"
   - Success notification shown

### For Receptionist

1. **Log Guest Request:**
   - Front Desk → Guest Management
   - Create new Guest Request
   - Select request type, priority
   - Assign to staff member
   - Submit (Status: pending)

2. **Track Request:**
   - Can see request status in Guest Folio
   - See who it's assigned to
   - View completion status
   - See completion notes

3. **Billing:**
   - When generating invoice for guest
   - Completed requests with charges appear
   - Automatically included as line items

### For Manager/Supervisor

1. **Monitor All Tasks:**
   - Go to Task Management Overview
   - View dashboard statistics
   - See all pending/in-progress/completed tasks

2. **Filter Tasks:**
   - By status (pending, acknowledged, in_progress, completed, cancelled)
   - By type (housekeeping, maintenance, room_service, etc.)
   - By assigned staff member

3. **Manage Performance:**
   - View avg completion time
   - View completion rate percentage
   - See which staff members are busy
   - Identify bottlenecks

4. **Reassign Tasks:**
   - Click "Reassign" on any task
   - Select new staff member
   - Submit
   - Task automatically reassigned

## Task Statuses

| Status | Description | Flow |
|--------|-------------|------|
| **pending** | Task created, waiting for staff to accept | Initial state when logged |
| **acknowledged** | Staff has accepted the task | After clicking "Accept Task" |
| **in_progress** | Staff actively working on task | After clicking "Start Working" |
| **completed** | Task finished and marked complete | After submitting completion form |
| **cancelled** | Task cancelled for some reason | Manual cancellation (admin only) |

## Billing Integration

### How Charges Are Handled

1. **When Request is Created:**
   - `additional_charges` field set (e.g., $5.00 for laundry)
   - Can be $0 for free requests (e.g., extra towels)

2. **When Invoice is Generated:**
   - Receptionist goes to Guest Folio
   - Clicks "Preview Invoice"
   - Backend aggregates charges:
     - Room charges
     - Restaurant orders
     - **Guest request charges** ← From here
     - Other services
   - Shows in preview modal
   - Receptionist clicks "Generate Invoice"
   - Request charges added as line items

3. **In Final Invoice:**
   - Line item appears: "Laundry Service - $5.00"
   - Included in subtotal
   - Tax calculated on subtotal
   - Guest pays when checking out

### Example Invoice Line Item

```
Description         | Quantity | Unit Price | Total
--------------------|----------|------------|----------
Room Charge         | 3        | $50.00     | $150.00
Restaurant Orders   | 2        | $15.00     | $30.00
Laundry Service     | 1        | $5.00      | $5.00
--------------------|----------|------------|----------
Subtotal:                                    $185.00
Tax (18%):                                   $33.30
Grand Total:                                 $218.30
```

## Statistics & Metrics

### Dashboard Shows:
- **Total Tasks:** All tasks in database
- **Pending:** Tasks waiting to be accepted
- **In Progress:** Tasks being worked on
- **Completed:** Tasks finished today/this period
- **Avg Completion Time:** Average time from request to completion
- **Completion Rate:** % of tasks completed vs. total

### Example Calculation:
- Total Tasks: 50
- Completed: 42
- Completion Rate: 84%
- Avg Time: 1h 30m

## Security Considerations

1. **Multi-tenant isolation:**
   - Staff can only see tasks for their assigned hotel
   - Tasks filtered by `homestay_id`

2. **Role-based access:**
   - Only assigned staff can accept their tasks
   - Only managers can reassign
   - Receptionists can see all for their hotel

3. **Audit trail:**
   - All actions logged with timestamps
   - `staff_notes` field tracks who did what and when
   - `completed_time` recorded automatically

## Future Enhancements

1. **Task Templates:**
   - Pre-defined common requests (extra towels, extra beds, etc.)
   - Quick-select buttons for faster logging

2. **Photo Evidence:**
   - Staff can upload photos of completed work
   - Stored with task for quality assurance

3. **Task Dependencies:**
   - Some tasks dependent on others
   - Can't complete until predecessor tasks complete

4. **SLA Tracking:**
   - Set target completion times by request type
   - Alert if task approaching deadline
   - Historical SLA compliance metrics

5. **Guest Satisfaction Feedback:**
   - After task completion, prompt guest for feedback
   - Guest rates the service (1-5 stars)
   - Comments linked to request

6. **Real-time Notifications:**
   - Push notifications when task assigned
   - SMS reminders for urgent tasks
   - Email summaries of daily tasks

7. **Mobile App:**
   - Staff access tasks on mobile device
   - Photo capture for completion verification
   - Offline support with sync

## Testing Checklist

- [ ] Create guest request with proper validation
- [ ] Staff receives task in their dashboard
- [ ] Staff can accept pending task
- [ ] Staff can mark task complete with notes
- [ ] Completion time recorded accurately
- [ ] Task appears in manager oversight
- [ ] Filter by status, type, staff works
- [ ] Statistics calculated correctly
- [ ] Charges appear in invoice aggregation
- [ ] Multi-hotel isolation enforced
- [ ] Only assigned staff can accept their tasks
- [ ] Auto-refresh of tasks works (30 sec)

## API Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Missing required fields | Check request body |
| 404 | Task not found or access denied | Verify task_id exists and is assigned to user |
| 500 | Server error | Check backend logs |
| 403 | Access denied (wrong hotel/staff) | Verify user permissions |

## Troubleshooting

**Q: Staff not seeing tasks?**
- Check `assigned_to` field matches `hms_user_id`
- Verify staff is active (`hms_users.status = 'active'`)
- Check homestay_id matches in bookings

**Q: Charges not appearing in invoice?**
- Verify `additional_charges > 0` in guest_requests
- Confirm task is marked `completed`
- Check booking_id is correct

**Q: Dashboard not loading?**
- Check API token is valid
- Verify `/my-tasks` endpoint returns data
- Check browser console for errors

**Q: Completion time incorrect?**
- Verify server timezone setting
- Check `completed_time` field in database
- Ensure timestamps are ISO format

## Support & Questions

For issues or questions about the task management system:
1. Check this documentation
2. Review the API endpoints
3. Check browser console for errors
4. Review backend logs in `/backend/logs/`

---

**Last Updated:** October 22, 2025
**Version:** 1.0
**Status:** ✅ Production Ready