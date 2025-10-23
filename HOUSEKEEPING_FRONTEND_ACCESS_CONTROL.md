# Housekeeping Frontend - Role-Based Access Control Implementation

## Overview

The Housekeeping Tasks dashboard has been updated with comprehensive role-based access control that mirrors the backend restrictions. Housekeeping staff can now only perform actions appropriate to their role, while Front Desk and Managers have full control over task management.

## What Was Changed

### 1. **Added User Role Detection**

The component now uses the `useAuth()` hook to access the current user's role:

```javascript
import { useAuth } from '../../contexts/AuthContext';

const HousekeepingTasks = () => {
  const { user } = useAuth();
  
  // User object contains either:
  // - user.user_role (for HMS staff users)
  // - user.role (for regular users)
```

### 2. **Implemented Role-Based Access Control Functions**

Three helper functions manage access permissions:

```javascript
// Only front_desk, admin, hotel_manager, super_admin can create tasks
const canCreateTask = () => {
  if (!user) return false;
  const userRole = user.user_role || user.role;
  return ['front_desk', 'admin', 'hotel_manager', 'super_admin'].includes(userRole);
};

// Edit and delete permissions same as create
const canEditTask = () => {
  return canCreateTask();
};

const canDeleteTask = () => {
  return canCreateTask();
};
```

## Frontend Behavior by Role

### **For Front Desk / Admin / Hotel Manager:**

✅ **Can Do:**
- Click "Create Task" button (active and blue)
- Create new tasks with all fields
- Edit existing tasks
- Delete tasks
- See all action buttons (Edit, Delete)
- Full modal form access

**Header Description:** "Create, assign, and monitor cleaning tasks"

**Create Button:** Active, clickable, blue button with Plus icon

---

### **For Housekeeping Staff:**

❌ **Cannot Do:**
- Click "Create Task" button (disabled, grayed out, shows lock icon)
- Edit tasks
- Delete tasks

✅ **Can Do:**
- View all tasks (read-only)
- Confirm receipt of assigned tasks
- Update task status/progress
- Mark tasks as completed
- Add notes and quality scores

**Header Description:** "View and confirm assigned tasks"

**Create Button:** Disabled, grayed out with lock icon and text "Create Task (Restricted)"

**Info Banner:** Blue informational banner appears explaining role limitations

**Table Actions:** Only shows relevant action buttons:
- ❌ No Edit button
- ❌ No Delete button
- ✅ "View Only" indicator badge
- ✅ Action buttons for confirming/completing tasks

---

## UI Changes by Role

### Header Section

**Front Desk/Admin (Full Access):**
```
╔════════════════════════════════════════════════════════════╗
║ Housekeeping Tasks                                          ║
║ Create, assign, and monitor cleaning tasks                 ║
║                                    [+ Create Task] (Active) ║
╚════════════════════════════════════════════════════════════╝
```

**Housekeeping Staff (Limited Access):**
```
╔════════════════════════════════════════════════════════════╗
║ Housekeeping Tasks                                          ║
║ View and confirm assigned tasks                            ║
║              [🔒 Create Task (Restricted)] (Disabled)      ║
╚════════════════════════════════════════════════════════════╝

┌─ INFO BANNER ────────────────────────────────────────────┐
│ ℹ️  Housekeeping Staff Access:                            │
│ You can view all tasks and confirm receipt of tasks       │
│ assigned to you. Only Front Desk staff and Managers       │
│ can create, edit, or delete tasks. If you see work        │
│ that needs to be done, please notify the Front Desk       │
│ to create a task for you.                                 │
└──────────────────────────────────────────────────────────┘
```

### Task Table Actions Column

**Front Desk/Admin - Full Control:**
```
Actions:  [►] [✎] [🗑]   (Start/Edit/Delete buttons visible)
```

**Housekeeping Staff - View Only:**
```
Actions:  [►] [🔒 View Only]   (Only confirm/progress buttons)
```

### Modal Form

**Front Desk/Admin:**
- Full form with all fields enabled
- Submit button active and blue: "Create Task" or "Update Task"

**Housekeeping Staff (attempting to access):**
```
┌─ ACCESS DENIED ──────────────────────────────────────────┐
│ 🔒 Access Denied                                         │
│ Only Front Desk staff and Managers can create or edit    │
│ tasks. Your role does not have permission to perform     │
│ this action.                                             │
└──────────────────────────────────────────────────────────┘

Create Task
[All form fields appear but are not editable]
[Submit button is grayed out and disabled]
```

---

## Access Control Implementation Details

### 1. **Create Task Button**

**Location:** Header section, top right

**Frontend Logic:**
```javascript
{canCreateTask() ? (
  <button
    onClick={() => setShowModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    <Plus className="w-5 h-5" />
    Create Task
  </button>
) : (
  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed">
    <Lock className="w-5 h-5" />
    <span className="text-sm">Create Task (Restricted)</span>
  </div>
)}
```

**Result:**
- ✅ Front Desk can click and open modal
- ❌ Housekeeping sees locked button, cannot interact

---

### 2. **Edit and Delete Buttons in Table**

**Location:** Actions column in tasks table

**Frontend Logic:**
```javascript
{canEditTask() && (
  <button
    onClick={() => handleEdit(task)}
    className="text-indigo-600 hover:text-indigo-900"
    title="Edit"
  >
    <Edit2 className="w-5 h-5" />
  </button>
)}

{canDeleteTask() && (
  <button
    onClick={() => handleDelete(task.task_id)}
    className="text-red-600 hover:text-red-900"
    title="Delete"
  >
    <Trash2 className="w-5 h-5" />
  </button>
)}

{!canEditTask() && !canDeleteTask() && (
  <span className="text-gray-400 text-xs flex items-center gap-1">
    <Lock className="w-4 h-4" />
    View Only
  </span>
)}
```

**Result:**
- ✅ Front Desk sees clickable Edit/Delete buttons
- ❌ Housekeeping sees "🔒 View Only" indicator instead

---

### 3. **Modal Form Submission**

**File:** HousekeepingTasks.jsx, `handleSubmit()` function

**Frontend Logic:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Role-based access check
  if (!canCreateTask()) {
    alert('❌ Access Denied: Only Front Desk and Managers can create or edit tasks. Your role is not authorized to perform this action.');
    handleCloseModal();
    return;
  }

  // ... rest of submission logic
};
```

**Validation:**
- ✅ Front Desk: Form submits successfully
- ❌ Housekeeping: Shows alert and closes modal

---

### 4. **Submit Button State**

**Location:** Modal footer, submit button

**Frontend Logic:**
```javascript
<button
  type="submit"
  disabled={!canCreateTask()}
  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
    canCreateTask()
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
  title={!canCreateTask() ? 'Only Front Desk and Managers can create tasks' : ''}
>
  {editingTask ? 'Update Task' : 'Create Task'}
</button>
```

**Result:**
- ✅ Front Desk: Blue, enabled, clickable
- ❌ Housekeeping: Gray, disabled, tooltip explains why

---

### 5. **Delete Button Handler**

**File:** HousekeepingTasks.jsx, `handleDelete()` function

**Frontend Logic:**
```javascript
const handleDelete = async (taskId) => {
  // Role-based access check
  if (!canDeleteTask()) {
    alert('❌ Access Denied: Only Front Desk and Managers can delete tasks.');
    return;
  }

  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  // ... rest of deletion logic
};
```

**Result:**
- ✅ Front Desk: Shows confirmation and deletes
- ❌ Housekeeping: Shows denial message, no deletion

---

### 6. **Info Banner for Housekeeping**

**Location:** Below header, only shows for housekeeping staff

**Frontend Logic:**
```javascript
{!canCreateTask() && (
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
    <div className="text-sm text-blue-800">
      <strong>Housekeeping Staff Access:</strong> You can view all tasks and confirm receipt of tasks assigned to you. 
      Only Front Desk staff and Managers can create, edit, or delete tasks. 
      If you see work that needs to be done, please notify the Front Desk to create a task for you.
    </div>
  </div>
)}
```

**Result:**
- ✅ Housekeeping sees blue info banner explaining their access
- ❌ Front Desk does NOT see this banner

---

## Complete Role Access Matrix

| Action | Housekeeping | Front Desk | Manager | Admin |
|--------|:---:|:---:|:---:|:---:|
| **View all tasks** | ✅ | ✅ | ✅ | ✅ |
| **Create new task** | ❌ | ✅ | ✅ | ✅ |
| **Edit task** | ❌ | ✅ | ✅ | ✅ |
| **Delete task** | ❌ | ✅ | ✅ | ✅ |
| **Confirm task receipt** | ✅ | ✅ | ✅ | ✅ |
| **Update task status** | ✅ | ✅ | ✅ | ✅ |
| **Mark task complete** | ✅ | ✅ | ✅ | ✅ |
| **Add notes/quality score** | ✅ | ✅ | ✅ | ✅ |
| **See info banner** | ✅ | ❌ | ❌ | ❌ |
| **See "View Only" indicator** | ✅ | ❌ | ❌ | ❌ |

---

## Testing the Access Control

### Test 1: Housekeeping Staff Cannot Create Tasks

**Steps:**
1. Log in as housekeeping user
2. Navigate to /housekeeping/tasks
3. Observe: "Create Task (Restricted)" button is grayed out with lock icon
4. Try clicking it: No action occurs

**Expected Result:** ✅ Button is disabled

---

### Test 2: Housekeeping Staff Cannot Edit Tasks

**Steps:**
1. Log in as housekeeping user
2. Go to task table
3. Look for Edit button (pencil icon)
4. Try clicking where Edit button should be: See "🔒 View Only" instead

**Expected Result:** ✅ No Edit button visible

---

### Test 3: Housekeeping Staff Cannot Delete Tasks

**Steps:**
1. Log in as housekeeping user
2. Go to task table
3. Look for Delete button (trash icon)
4. Try clicking where Delete button should be: See "🔒 View Only" instead

**Expected Result:** ✅ No Delete button visible

---

### Test 4: Front Desk Can Create Tasks

**Steps:**
1. Log in as front_desk user
2. Navigate to /housekeeping/tasks
3. Click "Create Task" button (should be blue and active)
4. Fill form and submit

**Expected Result:** ✅ Modal opens, form submits successfully

---

### Test 5: Housekeeping Tries to Hack Modal

**Steps:**
1. Log in as housekeeping user
2. Try to open /housekeeping/tasks?action=create or similar URL hack
3. Click "Create Task" button to force modal open
4. Try to submit the form

**Expected Result:** 
- ✅ Red error banner appears in modal
- ✅ Submit button is disabled (grayed out)
- ✅ Alert shown: "Access Denied: Only Front Desk and Managers..."
- ✅ Modal closes without creating task

---

### Test 6: Info Banner Only for Housekeeping

**Steps:**
1. Log in as housekeeping user
2. Go to /housekeeping/tasks
3. Observe: Blue info banner explaining access restrictions

**Then:**
1. Log in as front_desk user
2. Go to /housekeeping/tasks
3. Observe: No info banner

**Expected Result:** ✅ Info banner only shows for housekeeping staff

---

## Code Changes Summary

### File Modified:
**`/home/nathanadmin/Projects/MOPAS/travooz_hms/frontend/src/pages/housekeeping/HousekeepingTasks.jsx`**

### Changes Made:

1. **Import addition:**
   - Added `Lock` icon from lucide-react
   - Added `useAuth` from contexts

2. **State management:**
   - Added user context: `const { user } = useAuth();`

3. **Helper functions:**
   - `canCreateTask()` - checks if user can create/edit/delete
   - `canEditTask()` - checks if user can edit
   - `canDeleteTask()` - checks if user can delete

4. **UI Components Updated:**
   - Header "Create Task" button - now conditional
   - Info banner for housekeeping - shows role limitations
   - Edit/Delete buttons in table - now conditional
   - "View Only" indicator - shows for housekeeping
   - Modal access denied warning - shows when housekeeping tries
   - Submit button state - disabled for housekeeping

5. **Handler Functions Updated:**
   - `handleSubmit()` - added role check before submission
   - `handleDelete()` - added role check before deletion

---

## Coordinated Backend & Frontend

### Backend Endpoints (Already Implemented)
- `POST /api/housekeeping/tasks` - 403 if housekeeping tries
- `PATCH /api/housekeeping/tasks/:id` - 403 if housekeeping tries
- `DELETE /api/housekeeping/tasks/:id` - 403 if housekeeping tries
- `PATCH /api/housekeeping/tasks/:id/confirm` - All authenticated users allowed
- `PUT /api/housekeeping/tasks/:id` - All authenticated users allowed

### Frontend UI (Just Implemented)
- Prevents housekeeping from even attempting restricted actions
- Shows clear visual indicators of what they can/cannot do
- Displays helpful info banners explaining their role

### Double Protection Strategy
1. **Frontend:** Prevents UI access + disables buttons + blocks modal submission
2. **Backend:** Rejects requests with 403 Forbidden (safety net)

If housekeeping somehow bypasses frontend, backend still rejects their request.

---

## User Experience Flow

### Scenario 1: Housekeeping Staff Using Dashboard

```
[Open /housekeeping/tasks]
    ↓
[See "View and confirm assigned tasks" subtitle]
    ↓
[See info banner explaining their limited access]
    ↓
[See disabled "Create Task (Restricted)" button]
    ↓
[See task table with "🔒 View Only" indicators]
    ↓
[Click on "Pending Confirmation" tab]
    ↓
[See "Confirm" button for pending tasks - WORKS]
    ↓
[Task confirmed, moves to "In Progress"]
    ↓
[Click task, add notes, mark complete - WORKS]
    ↓
[Task moves to "Completed" with quality score]
```

### Scenario 2: Front Desk Staff Using Dashboard

```
[Open /housekeeping/tasks]
    ↓
[See "Create, assign, and monitor cleaning tasks" subtitle]
    ↓
[NO info banner for front desk]
    ↓
[See active blue "Create Task" button]
    ↓
[Click "Create Task" → Modal opens normally]
    ↓
[Fill form → Submit button is BLUE and ENABLED]
    ↓
[Submit form → Task created successfully]
    ↓
[See table with Edit [✎] and Delete [🗑] buttons]
    ↓
[Click Edit → Can modify any task]
    ↓
[Click Delete → Can remove any task]
```

---

## Future Enhancements

1. **Toast Notifications:** Replace alerts with toast UI notifications
2. **Audit Logging:** Log all attempted restricted actions for admin review
3. **Permissions Tooltip:** More detailed hover tooltips explaining why buttons are disabled
4. **Role Icons:** Show role indicator in header so users know their access level
5. **Assignment Panel:** Only housekeeping assigned to task can see it (currently all can see all)
6. **Task History:** Show who created task vs who confirmed/completed it

---

## Summary

The Housekeeping Tasks frontend now has comprehensive role-based access control that:

✅ Prevents housekeeping staff from creating/editing/deleting tasks
✅ Allows housekeeping staff to confirm and complete assigned tasks
✅ Shows clear UI indicators of what actions are available/restricted
✅ Provides helpful information to housekeeping about their access level
✅ Validates all actions on submission before sending to backend
✅ Complements backend role restrictions with frontend protection

The system now enforces the architectural principle:
**Front Desk Directs → Housekeeping Executes**