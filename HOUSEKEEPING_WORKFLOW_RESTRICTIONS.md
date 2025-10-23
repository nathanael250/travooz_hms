# Housekeeping Task Workflow & Role-Based Restrictions

## Overview
The housekeeping system has been redesigned with strict role-based access control. **Housekeeping staff can ONLY view, confirm, and complete tasks assigned to them by the Front Desk. They CANNOT create new tasks.**

## Workflow Lifecycle

```
Guest makes request
         ↓
Front Desk creates task (OR auto-created from housekeeping guest request)
         ↓
Task appears in Housekeeping Dashboard (Pending Confirmation tab)
         ↓
Housekeeping staff CONFIRMS receipt of task
         ↓
Task moves to In Progress (assigned to confirming staff member)
         ↓
Staff performs work and updates task (add notes, upload photos, etc.)
         ↓
Staff marks task as COMPLETED
         ↓
Task moves to completion record
```

## Role-Based Access Control

### FRONT DESK / HOTEL MANAGER / ADMIN
**CAN DO:**
- ✅ Create new housekeeping tasks
- ✅ Assign tasks to specific staff members
- ✅ View all housekeeping tasks
- ✅ Update task details (priority, scheduled time, notes)
- ✅ Reassign tasks to different staff
- ✅ Cancel or put tasks on hold
- ✅ View task completion reports

**CANNOT DO:**
- ❌ Mark tasks as completed (only staff who performed work can)

### HOUSEKEEPING STAFF
**CAN DO:**
- ✅ View tasks assigned to them
- ✅ View all housekeeping tasks (for overview)
- ✅ CONFIRM/ACKNOWLEDGE receipt of a task from Front Desk
- ✅ Mark task as IN PROGRESS (happens automatically on confirm)
- ✅ Add notes about the task
- ✅ Update task status from IN PROGRESS to COMPLETED
- ✅ Add quality scores and inspection notes
- ✅ View guest information and request details

**CANNOT DO:**
- ❌ Create new tasks
- ❌ Assign tasks to themselves
- ❌ Reassign tasks
- ❌ Modify task type or priority (set by Front Desk)
- ❌ Delete tasks
- ❌ Mark other staff's tasks as complete

## API Endpoints & Access Control

### Task Creation (PROTECTED - Front Desk Only)
```
POST /api/housekeeping/tasks
Required Role: front_desk, hotel_manager, or admin
Response if Housekeeping tries: 403 Forbidden - "Access denied. Allowed roles: front_desk, hotel_manager, admin"
```

**Request Body:**
```json
{
  "inventory_id": 5,
  "task_type": "cleaning",
  "priority": "normal",
  "scheduled_time": "2024-01-15T10:00:00Z",
  "assigned_to": 12,
  "notes": "Clean room after checkout",
  "estimated_duration": 30
}
```

### Task Confirmation (HOUSEKEEPING ONLY)
```
PATCH /api/housekeeping/tasks/:task_id/confirm
Allowed: All authenticated users (typically housekeeping)
Purpose: Staff confirms they received the task
```

**Request Body:**
```json
{
  "notes": "Confirmed, starting now"
}
```

**What Happens:**
- Task status changes: pending → in_progress
- confirmation_status: pending → acknowledged
- confirmed_at: Set to current timestamp
- assigned_to: Set to confirming staff member (if not already assigned)

**Response:**
```json
{
  "success": true,
  "message": "Task confirmed successfully",
  "task": {
    "task_id": 123,
    "status": "in_progress",
    "confirmation_status": "acknowledged",
    "confirmed_at": "2024-01-15T10:30:00Z",
    "assigned_to": 45,
    "guest_info": {
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "room_number": "301"
    },
    "guest_request_details": {
      "request_id": 78,
      "request_type": "housekeeping",
      "description": "Deep clean needed"
    }
  }
}
```

### Get All Tasks (EVERYONE - Read Only)
```
GET /api/housekeeping/tasks
Allowed: All authenticated users
Query Parameters:
  - status: pending, in_progress, completed, cancelled, on_hold
  - task_type: cleaning, deep_cleaning, inspection, etc.
  - priority: low, normal, high, urgent
  - assigned_to: Staff user ID
  - page: 1-based page number
  - limit: Items per page (default 50)
```

**Example - Housekeeping staff sees only their tasks:**
```
GET /api/housekeeping/tasks?assigned_to=45&status=pending
```

### Update Task Status (HOUSEKEEPING)
```
PUT /api/housekeeping/tasks/:task_id
Allowed: All authenticated users
Purpose: Housekeeping staff updates task progress and completion
```

**Request Body for Starting Task:**
```json
{
  "status": "in_progress",
  "notes": "Started work at 10:30 AM"
}
```

**Request Body for Completing Task:**
```json
{
  "status": "completed",
  "quality_score": 5,
  "notes": "Room cleaned thoroughly, all tasks complete",
  "supplies_used": "All-purpose cleaner, vacuum, mop",
  "inspection_notes": "No issues found"
}
```

## Database Schema Changes

### housekeeping_tasks Table
New columns for linking to guest requests:

| Column | Type | Purpose |
|--------|------|---------|
| guest_request_id | INT (FK) | Links task to originating guest request |
| confirmation_status | ENUM | pending, acknowledged, in_progress, completed |
| confirmed_at | DATETIME | When staff confirmed receipt of task |

## Error Scenarios

### Scenario 1: Housekeeping tries to create a task
```
POST /api/housekeeping/tasks
Response Status: 403 Forbidden
Response Body:
{
  "success": false,
  "message": "Access denied. Allowed roles: front_desk, hotel_manager, admin. Your role: housekeeping"
}
```

### Scenario 2: Front Desk tries to mark task as completed
*Currently allowed* (system assumes they're verifying, but best practice is for staff to mark own tasks)

### Scenario 3: Housekeeping confirms a task already confirmed
```
PATCH /api/housekeeping/tasks/123/confirm
Response Status: 200 OK (updates again - safe to retry)
```

## Implementation Files Modified

### Backend
1. **`roleAccess.middleware.js`** (NEW)
   - Implements `restrictToRoles()` middleware for role-based access control

2. **`housekeeping.routes.js`** (MODIFIED)
   - Added role access middleware to POST /tasks endpoint
   - Added documentation comments for each endpoint
   - POST /tasks now requires: front_desk, hotel_manager, or admin role

3. **`housekeepingTaskService.js`** (UNCHANGED)
   - Already supports the confirm workflow

### Frontend
1. **`HousekeepingTasks.jsx`** (EXISTING)
   - Shows "Pending Confirmation" tab for tasks awaiting staff confirmation
   - Provides "Confirm" button to acknowledge receipt
   - Shows task source (guest request or manual creation)

## Testing the New Restrictions

### Test 1: Verify housekeeping cannot create tasks
```bash
# Create token for housekeeping staff
TOKEN=$(curl http://localhost:3001/api/auth/login -d '{"email":"housekeeper@hms.local","password":"password"}' | jq -r '.token')

# Try to create task (should fail)
curl -X POST http://localhost:3001/api/housekeeping/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": 5,
    "task_type": "cleaning",
    "priority": "normal",
    "scheduled_time": "2024-01-15T10:00:00Z"
  }'

# Expected: 403 Forbidden with message "Access denied"
```

### Test 2: Verify front desk CAN create tasks
```bash
# Create token for front desk staff
TOKEN=$(curl http://localhost:3001/api/auth/login -d '{"email":"frontdesk@hms.local","password":"password"}' | jq -r '.token')

# Create task (should succeed)
curl -X POST http://localhost:3001/api/housekeeping/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": 5,
    "task_type": "cleaning",
    "priority": "normal",
    "scheduled_time": "2024-01-15T10:00:00Z"
  }'

# Expected: 201 Created with task details
```

### Test 3: Verify housekeeping can confirm tasks
```bash
# Create token for housekeeping staff
TOKEN=$(curl http://localhost:3001/api/auth/login -d '{"email":"housekeeper@hms.local","password":"password"}' | jq -r '.token')

# Confirm task (should succeed)
curl -X PATCH http://localhost:3001/api/housekeeping/tasks/123/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Confirmed receipt"}'

# Expected: 200 OK with task status = "in_progress"
```

## User Experience Flow

### For Housekeeping Staff:
1. **Login** → Directed to Housekeeping Dashboard
2. **View Tasks** → See all tasks, filtered by assigned_to=me
3. **See "Pending Confirmation" Tab** → Tasks awaiting their acknowledgment
4. **Click "Confirm" Button** → Acknowledges receipt, task becomes "In Progress"
5. **Start Work** → Optionally update status and add notes
6. **Complete Work** → Add quality score, supplies used, inspection notes
7. **Click "Mark Complete"** → Task status changes to "completed"

### For Front Desk Staff:
1. **Login** → Directed to Front Desk Dashboard
2. **Create Task** → Click "New Task" button to create housekeeping task
3. **Assign to Staff** → Select housekeeping staff member
4. **Set Details** → Priority, time, notes, duration estimate
5. **Submit** → Task created and appears in Housekeeping dashboard
6. **Monitor** → View task progress as housekeeping updates it

## Best Practices

✅ **DO:**
- Front Desk creates tasks based on guest requests or property needs
- Housekeeping confirms immediate receipt of assignments
- Use priority levels to indicate urgency
- Add descriptive notes to help staff understand requirements
- Set realistic estimated durations

❌ **DON'T:**
- Allow housekeeping to create their own tasks (breaks accountability)
- Let staff delete or reassign their own tasks
- Create tasks without clear descriptions
- Assign tasks to staff who aren't scheduled to work

## Future Enhancements

- [ ] Automatic task assignment based on shift schedules
- [ ] SMS/Push notifications when new tasks are assigned
- [ ] Estimated vs actual duration tracking
- [ ] Task history and analytics per staff member
- [ ] Quality assurance re-inspection workflow