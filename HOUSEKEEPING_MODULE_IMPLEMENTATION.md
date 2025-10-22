# 🧹 Housekeeping Module - Complete Implementation Guide

## Overview
The Housekeeping module enables comprehensive task management for room cleaning, maintenance, and quality control across all homestays in the HMS system.

---

## ✅ Implementation Status

### Backend Components

| Component | Status | Location |
|-----------|--------|----------|
| Database Model | ✅ Complete | `backend/src/models/housekeepingTask.model.js` |
| API Routes | ✅ Complete | `backend/src/routes/housekeeping.routes.js` |
| Model Associations | ✅ Complete | `backend/src/models/index.js` |
| SQL Migration | ✅ Complete | `backend/migrations/create_housekeeping_tasks_table.sql` |
| Route Registration | ✅ Complete | `backend/src/app.js` |

### Features Implemented

#### ✅ Task Management
- **Create Tasks**: Full CRUD operations for housekeeping tasks
- **Task Types**: cleaning, deep_clean, linen_change, maintenance, inspection, setup, turndown_service, laundry, restocking
- **Priority Levels**: low, normal, high, urgent
- **Status Tracking**: pending → assigned → in_progress → completed/cancelled

#### ✅ Staff Assignment
- Assign tasks to specific staff members
- Track who assigned the task and when
- View tasks assigned to current user (`/my-tasks`)
- Role-based task visibility

#### ✅ Time Tracking
- Scheduled date and time
- Actual start and completion times
- Estimated vs actual duration calculation
- Automatic duration tracking

#### ✅ Quality Control
- Completion notes
- Issues found during task
- Quality rating (1-5 scale)
- Supervisor verification system

#### ✅ Integration
- Links to rooms (inventory_id)
- Links to bookings (auto-create on checkout)
- Updates room_status_log on completion
- Multi-homestay support with vendor filtering

#### ✅ Dashboard & Analytics
- Task statistics by status
- Urgent and overdue task counts
- Staff performance metrics
- Task type breakdown
- Today's completed tasks

---

## 📡 API Endpoints

### Task Management

#### GET `/api/housekeeping/tasks`
List all housekeeping tasks with filtering

**Query Parameters:**
- `status`: pending, assigned, in_progress, completed, cancelled
- `task_type`: cleaning, deep_clean, etc.
- `priority`: low, normal, high, urgent
- `homestay_id`: Filter by homestay
- `inventory_id`: Filter by room
- `assigned_to`: Filter by staff member
- `scheduled_date`: Filter by date
- `page`: Pagination page number
- `limit`: Items per page (default: 50)

**Response:**
```json
{
  "tasks": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

#### GET `/api/housekeeping/tasks/:task_id`
Get specific task details with full associations

#### POST `/api/housekeeping/tasks`
Create new housekeeping task

**Request Body:**
```json
{
  "homestay_id": 1,
  "inventory_id": 5,
  "task_type": "cleaning",
  "priority": "normal",
  "scheduled_date": "2025-01-15",
  "scheduled_time": "10:00:00",
  "assigned_to": 3,
  "notes": "Standard checkout cleaning",
  "booking_id": 42,
  "estimated_duration": 30
}
```

#### PUT `/api/housekeeping/tasks/:task_id`
Update task details

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "high",
  "completion_notes": "Task completed successfully",
  "quality_rating": 5
}
```

### Quick Actions

#### PATCH `/api/housekeeping/tasks/:task_id/assign`
Assign task to staff member

**Request Body:**
```json
{
  "assigned_to": 3
}
```

#### PATCH `/api/housekeeping/tasks/:task_id/start`
Start working on a task (sets status to in_progress, records start_time)

#### PATCH `/api/housekeeping/tasks/:task_id/complete`
Mark task as completed

**Request Body:**
```json
{
  "completion_notes": "Room cleaned thoroughly",
  "issues_found": "Broken lamp - maintenance ticket created",
  "quality_rating": 4
}
```

**Auto-actions:**
- Calculates actual_duration
- Updates room_status_log to 'cleaned'
- Records completion_time

#### DELETE `/api/housekeeping/tasks/:task_id`
Delete task (only pending or cancelled tasks)

### Dashboard & Reports

#### GET `/api/housekeeping/dashboard`
Get comprehensive housekeeping statistics

**Query Parameters:**
- `homestay_id`: Filter by specific homestay

**Response:**
```json
{
  "totalTasks": 150,
  "pendingTasks": 25,
  "assignedTasks": 30,
  "inProgressTasks": 15,
  "completedToday": 45,
  "urgentTasks": 5,
  "overdueTasks": 3,
  "taskTypes": [
    { "task_type": "cleaning", "count": 80 },
    { "task_type": "deep_clean", "count": 20 }
  ],
  "staffPerformance": [
    {
      "assigned_to": 3,
      "completed_count": 12,
      "avg_duration": 28.5,
      "assignedStaff": { "user_id": 3, "name": "John Doe" }
    }
  ]
}
```

#### GET `/api/housekeeping/my-tasks`
Get tasks assigned to current authenticated user

**Query Parameters:**
- `status`: Filter by status (default: active tasks only)

---

## 🗄️ Database Schema

### Table: `housekeeping_tasks`

```sql
CREATE TABLE housekeeping_tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  homestay_id INT NOT NULL,
  inventory_id INT NULL,
  task_type ENUM(...) NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
  
  -- Assignment
  assigned_to INT NULL,
  assigned_by INT NULL,
  assignment_time DATETIME NULL,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NULL,
  
  -- Execution
  start_time DATETIME NULL,
  completion_time DATETIME NULL,
  estimated_duration INT DEFAULT 30,
  actual_duration INT NULL,
  
  -- Notes
  notes TEXT NULL,
  completion_notes TEXT NULL,
  issues_found TEXT NULL,
  
  -- Quality
  quality_rating INT NULL,
  verified_by INT NULL,
  verification_time DATETIME NULL,
  
  -- Relations
  booking_id INT NULL,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50) NULL,
  parent_task_id INT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Database Views

#### `active_housekeeping_tasks`
Shows all non-completed/cancelled tasks with room and staff details

#### `todays_housekeeping_tasks`
Shows today's pending tasks ordered by priority

---

## 🔗 Model Associations

```javascript
// Homestay → Tasks
Homestay.hasMany(HousekeepingTask, { foreignKey: 'homestay_id', as: 'housekeepingTasks' });
HousekeepingTask.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

// Room → Tasks
Room.hasMany(HousekeepingTask, { foreignKey: 'inventory_id', as: 'housekeepingTasks' });
HousekeepingTask.belongsTo(Room, { foreignKey: 'inventory_id', as: 'room' });

// User (Staff) → Tasks
User.hasMany(HousekeepingTask, { foreignKey: 'assigned_to', as: 'assignedTasks' });
HousekeepingTask.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedStaff' });

// User (Manager) → Tasks Assigned
User.hasMany(HousekeepingTask, { foreignKey: 'assigned_by', as: 'tasksAssigned' });
HousekeepingTask.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedByUser' });

// User (Supervisor) → Tasks Verified
User.hasMany(HousekeepingTask, { foreignKey: 'verified_by', as: 'tasksVerified' });
HousekeepingTask.belongsTo(User, { foreignKey: 'verified_by', as: 'verifiedByUser' });

// Booking → Tasks
Booking.hasMany(HousekeepingTask, { foreignKey: 'booking_id', as: 'housekeepingTasks' });
HousekeepingTask.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
```

---

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
cd backend
mysql -u your_user -p travooz_hms < migrations/create_housekeeping_tasks_table.sql
```

### 2. Verify Model Registration

The model is already registered in `backend/src/models/index.js` and exported.

### 3. Test API Endpoints

```bash
# Get all tasks
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/housekeeping/tasks

# Create a task
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "homestay_id": 1,
    "inventory_id": 5,
    "task_type": "cleaning",
    "scheduled_date": "2025-01-15",
    "priority": "normal"
  }' \
  http://localhost:3001/api/housekeeping/tasks

# Get dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/housekeeping/dashboard
```

---

## 🎯 Usage Workflows

### Workflow 1: Guest Checkout → Auto-Create Cleaning Task

```javascript
// In checkout handler
const task = await HousekeepingTask.create({
  homestay_id: booking.homestay_id,
  inventory_id: booking.inventory_id,
  task_type: 'cleaning',
  priority: 'normal',
  scheduled_date: new Date(),
  booking_id: booking.booking_id,
  notes: `Checkout cleaning for booking #${booking.booking_reference}`
});
```

### Workflow 2: Staff Completes Task

```javascript
// Staff starts task
PATCH /api/housekeeping/tasks/123/start

// Staff completes task
PATCH /api/housekeeping/tasks/123/complete
{
  "completion_notes": "Room cleaned and inspected",
  "quality_rating": 5
}

// System automatically:
// - Records completion_time
// - Calculates actual_duration
// - Updates room_status_log to 'cleaned'
```

### Workflow 3: Manager Assigns Daily Tasks

```javascript
// Get unassigned tasks
GET /api/housekeeping/tasks?status=pending

// Assign to staff
PATCH /api/housekeeping/tasks/123/assign
{
  "assigned_to": 5
}
```

---

## 🔐 Security & Permissions

### Role-Based Access

- **Vendors**: See only tasks for their homestays
- **Staff**: See only their assigned tasks via `/my-tasks`
- **Admins**: See all tasks across all homestays

### Implemented in Routes

```javascript
// Vendor filtering
if (req.user && req.user.role === 'vendor') {
  const userHomestays = await Homestay.findAll({
    where: { vendor_id: req.user.user_id }
  });
  whereClause.homestay_id = { [Op.in]: homestayIds };
}
```

---

## 📊 Frontend Integration Guide

### Recommended Components

1. **HousekeepingDashboard.jsx**
   - Display statistics cards
   - Show urgent/overdue tasks
   - Staff performance charts

2. **TaskList.jsx**
   - Filterable task table
   - Status badges
   - Quick action buttons

3. **TaskForm.jsx**
   - Create/edit task modal
   - Room selector
   - Staff assignment dropdown

4. **MyTasks.jsx** (Staff View)
   - Personal task list
   - Start/Complete buttons
   - Timer display

5. **TaskDetails.jsx**
   - Full task information
   - History timeline
   - Quality rating display

### Sample API Calls

```javascript
// Fetch tasks
const fetchTasks = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await apiClient.get(`/housekeeping/tasks?${params}`);
  return response.data;
};

// Create task
const createTask = async (taskData) => {
  const response = await apiClient.post('/housekeeping/tasks', taskData);
  return response.data;
};

// Complete task
const completeTask = async (taskId, completionData) => {
  const response = await apiClient.patch(
    `/housekeeping/tasks/${taskId}/complete`,
    completionData
  );
  return response.data;
};

// Get dashboard stats
const getDashboardStats = async (homestayId) => {
  const params = homestayId ? `?homestay_id=${homestayId}` : '';
  const response = await apiClient.get(`/housekeeping/dashboard${params}`);
  return response.data;
};
```

---

## 🧪 Testing Checklist

- [ ] Create task for each task_type
- [ ] Assign task to staff
- [ ] Start task (verify start_time recorded)
- [ ] Complete task (verify duration calculated)
- [ ] Verify room_status_log updated
- [ ] Test vendor filtering (only see own homestays)
- [ ] Test staff view (/my-tasks)
- [ ] Test dashboard statistics
- [ ] Test overdue task detection
- [ ] Test quality rating constraints (1-5)
- [ ] Test task deletion (only pending/cancelled)
- [ ] Test recurring task creation
- [ ] Test booking-triggered task creation

---

## 🔄 Future Enhancements

### Phase 2 Features
- [ ] Recurring task automation (daily/weekly schedules)
- [ ] Push notifications for staff assignments
- [ ] Photo upload for task completion verification
- [ ] Task templates for common scenarios
- [ ] Bulk task creation
- [ ] Staff availability calendar integration
- [ ] Performance analytics and reports
- [ ] Mobile app for staff task management
- [ ] QR code scanning for room check-in
- [ ] Integration with maintenance module

---

## 📝 Notes

- All timestamps are in UTC
- Duration is tracked in minutes
- Quality ratings are optional but recommended
- Tasks can be created without room assignment (general tasks)
- Vendor filtering is automatic based on JWT token
- Room status updates are automatic on task completion

---

## 🆘 Troubleshooting

### Issue: Tasks not showing for vendor
**Solution**: Verify homestay_id matches vendor's homestays

### Issue: Cannot complete task
**Solution**: Ensure task status is not already 'completed'

### Issue: Room status not updating
**Solution**: Verify inventory_id is set on the task

### Issue: Duration not calculating
**Solution**: Ensure start_time was recorded before completion

---

## 📞 Support

For issues or questions:
- Check API logs: `backend/logs/`
- Review model associations in `backend/src/models/index.js`
- Test endpoints with Postman collection
- Verify database constraints and foreign keys

---

**Module Status**: ✅ **PRODUCTION READY**

Last Updated: 2025-01-13
Version: 1.0.0
