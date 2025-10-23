# Housekeeping Access Control - Testing & Verification Guide

## Quick Start Testing

### Setup
You'll need two browser windows/tabs:
- Window 1: Logged in as **Housekeeping Staff**
- Window 2: Logged in as **Front Desk Staff**

---

## Frontend Tests

### 🔷 Test 1: View Restrictions
**Expected:** Housekeeping sees limited UI vs Front Desk sees full UI

**Housekeeping Staff - Window 1:**
1. Go to `http://localhost:5173/housekeeping/tasks`
2. Look at the page header
   - ✅ Should see subtitle: "View and confirm assigned tasks"
   - ✅ Should see blue info banner explaining their access limits
   - ✅ "Create Task" button should be GRAYED OUT with lock icon
   - ❌ Should NOT be able to click it

**Front Desk Staff - Window 2:**
1. Go to `http://localhost:5173/housekeeping/tasks`
2. Look at the page header
   - ✅ Should see subtitle: "Create, assign, and monitor cleaning tasks"
   - ❌ Should NOT see the blue info banner
   - ✅ "Create Task" button should be BLUE and CLICKABLE

---

### 🔷 Test 2: Table Action Buttons

**Housekeeping Staff - Window 1:**
1. Go to task table
2. Look at the "Actions" column
   - ❌ Should NOT see Edit button (✎ pencil icon)
   - ❌ Should NOT see Delete button (🗑 trash icon)
   - ✅ Should see "🔒 View Only" indicator
   - ✅ Should see Confirm button if task is pending

**Front Desk Staff - Window 2:**
1. Go to task table
2. Look at the "Actions" column
   - ✅ Should see Edit button (✎ pencil icon)
   - ✅ Should see Delete button (🗑 trash icon)
   - ❌ Should NOT see "🔒 View Only" indicator

---

### 🔷 Test 3: Create Task Modal

**Housekeeping Staff - Window 1:**
1. Try to click the grayed out "Create Task" button
   - ✅ Nothing should happen (button is disabled)
2. If you somehow force the modal open (browser dev tools):
   - ✅ Should see RED error banner: "Access Denied"
   - ✅ Submit button should be GRAYED OUT
   - ✅ Form fields should be visible but non-functional
3. Try to submit the form
   - ✅ Should see alert: "❌ Access Denied: Only Front Desk and Managers..."
   - ✅ Modal should close

**Front Desk Staff - Window 2:**
1. Click the blue "Create Task" button
   - ✅ Modal should open
   - ❌ Should NOT see red "Access Denied" banner
   - ✅ Submit button should be BLUE and CLICKABLE
2. Fill in form and submit
   - ✅ Should see success alert: "Task created successfully!"
   - ✅ Task should appear in table

---

### 🔷 Test 4: Edit Task Modal

**Housekeeping Staff - Window 1:**
1. Find any task in the table
2. Look for Edit button (✎ pencil)
   - ✅ Button should NOT exist
   - ✅ Should see "🔒 View Only" instead
3. Cannot click Edit button
   - ✅ No action occurs

**Front Desk Staff - Window 2:**
1. Find any task in the table
2. Click Edit button (✎ pencil)
   - ✅ Modal should open with task data pre-filled
   - ✅ Submit button should say "Update Task"
   - ✅ Submit button should be BLUE and CLICKABLE
3. Modify a field and submit
   - ✅ Should see success alert: "Task updated successfully!"

---

### 🔷 Test 5: Delete Task

**Housekeeping Staff - Window 1:**
1. Find any task in the table
2. Look for Delete button (🗑 trash)
   - ✅ Button should NOT exist
   - ✅ Should see "🔒 View Only" instead
3. Cannot perform deletion
   - ✅ No action occurs

**Front Desk Staff - Window 2:**
1. Find any task in the table
2. Click Delete button (🗑 trash)
   - ✅ Confirmation dialog should appear
3. Click "OK" to confirm
   - ✅ Should see success alert: "Task deleted successfully!"
   - ✅ Task should disappear from table

---

### 🔷 Test 6: Confirm Task (Both Roles CAN Do)

**Housekeeping Staff - Window 1:**
1. Go to "Pending Confirmation" tab
2. Find a task waiting for confirmation
3. Look for "Confirm" button
   - ✅ Button should be VISIBLE and GREEN
4. Click "Confirm"
   - ✅ Should see success alert: "Task confirmed!"
   - ✅ Task should move from "Pending" to "In Progress"
   - ✅ Should disappear from "Pending Confirmation" tab

**Front Desk Staff - Window 2:**
1. Go to "Pending Confirmation" tab
2. Same behavior as housekeeping
   - ✅ Can also confirm tasks
   - ✅ Same success messages

---

### 🔷 Test 7: Complete Task (Both Roles CAN Do)

**Housekeeping Staff - Window 1:**
1. Find a task with status "In Progress"
2. Click the Complete button (✓ check icon)
3. Fill in completion details:
   - Quality rating (1-5)
   - Completion notes
   - Supplies used
4. Click "Mark Complete"
   - ✅ Should see success alert
   - ✅ Task should move to "Completed" section
   - ✅ Status badge should show "Completed" (green)

**Front Desk Staff - Window 2:**
1. Can also complete tasks
   - ✅ Same functionality as housekeeping

---

## Backend Tests (API Level)

### 🟦 Test 8: Backend - Create Task (403 for Housekeeping)

**Using Postman/curl - Test as Housekeeping Staff:**

```bash
curl -X POST http://localhost:5000/api/housekeeping/tasks \
  -H "Authorization: Bearer HOUSEKEEPING_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "homestay_id": 1,
    "inventory_id": 1,
    "task_type": "cleaning",
    "priority": "normal",
    "scheduled_time": "2024-01-15T10:00:00",
    "assigned_to": 2
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Allowed roles: front_desk, hotel_manager, admin",
  "status": 403
}
```

**Using Postman/curl - Test as Front Desk Staff:**

```bash
curl -X POST http://localhost:5000/api/housekeeping/tasks \
  -H "Authorization: Bearer FRONTDESK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "homestay_id": 1,
    "inventory_id": 1,
    "task_type": "cleaning",
    "priority": "normal",
    "scheduled_time": "2024-01-15T10:00:00",
    "assigned_to": 2
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task_id": 123,
    ...
  }
}
```

---

### 🟦 Test 9: Backend - Edit Task (403 for Housekeeping)

**Using Postman/curl - Test as Housekeeping Staff:**

```bash
curl -X PATCH http://localhost:5000/api/housekeeping/tasks/123 \
  -H "Authorization: Bearer HOUSEKEEPING_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "high"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Allowed roles: front_desk, hotel_manager, admin",
  "status": 403
}
```

---

### 🟦 Test 10: Backend - Delete Task (403 for Housekeeping)

**Using Postman/curl - Test as Housekeeping Staff:**

```bash
curl -X DELETE http://localhost:5000/api/housekeeping/tasks/123 \
  -H "Authorization: Bearer HOUSEKEEPING_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied. Allowed roles: front_desk, hotel_manager, admin",
  "status": 403
}
```

---

### 🟦 Test 11: Backend - Confirm Task (200 for All)

**Using Postman/curl - Test as Housekeeping Staff:**

```bash
curl -X PATCH http://localhost:5000/api/housekeeping/tasks/123/confirm \
  -H "Authorization: Bearer HOUSEKEEPING_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Confirmed, starting now"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task confirmed successfully",
  "data": {
    "task_id": 123,
    "status": "in_progress",
    ...
  }
}
```

**Should work for both Housekeeping and Front Desk** ✅

---

## Error Scenarios

### Scenario 1: Housekeeping Tries to Create Task via API

**What Happens:**
1. Frontend: Button disabled, can't click
2. If they somehow send API request: Backend returns 403
3. Security message: "Access denied. Allowed roles: front_desk, hotel_manager, admin"

**Result:** ✅ Completely blocked at both layers

---

### Scenario 2: Housekeeping Force-Opens Modal in DevTools

**What Happens:**
1. Modal appears (frontend limitation can be bypassed by dev tools)
2. Red error banner appears: "Access Denied"
3. Submit button is disabled
4. If they modify button with DevTools to enable it and submit:
5. Form validates with `handleSubmit()` role check
6. Alert appears: "❌ Access Denied: Only Front Desk and Managers..."
7. Modal closes

**Result:** ✅ Can't get past validation

---

### Scenario 3: Housekeeping Tries to Call API Directly

**What Happens:**
1. Frontend validation: Fails with role check
2. Frontend submits anyway via Postman/curl
3. Backend middleware: `restrictToRoles()` checks role
4. Backend returns 403 with error message
5. Request is logged for audit purposes

**Result:** ✅ Completely blocked

---

## Accessibility Verification

### For Housekeeping Staff

**Header:** ✅ Clearly says "View and confirm assigned tasks" (not "create and manage")

**Button State:** ✅ Disabled button with lock icon is obvious

**Info Banner:** ✅ Blue banner explains what they can/cannot do

**Table Indicators:** ✅ "🔒 View Only" clearly marks restricted tasks

**Error Messages:** ✅ All error messages are clear and actionable

---

### For Front Desk Staff

**Header:** ✅ Clearly says "Create, assign, and monitor cleaning tasks"

**Button State:** ✅ Active blue button is obviously clickable

**No Info Banner:** ✅ Front desk doesn't see confusion message

**Full Table Control:** ✅ Edit and Delete buttons obviously available

---

## Testing Checklist

### Frontend UI Tests
- [ ] Housekeeping: See "Create Task (Restricted)" button (disabled)
- [ ] Housekeeping: See info banner explaining access limits
- [ ] Housekeeping: No Edit buttons in table
- [ ] Housekeeping: No Delete buttons in table
- [ ] Housekeeping: See "🔒 View Only" indicators
- [ ] Front Desk: See "Create Task" button (enabled, blue)
- [ ] Front Desk: No info banner
- [ ] Front Desk: See Edit buttons in table
- [ ] Front Desk: See Delete buttons in table
- [ ] Front Desk: No "View Only" indicators

### Frontend Functional Tests
- [ ] Housekeeping: Cannot click disabled "Create Task" button
- [ ] Housekeeping: Cannot click missing Edit button
- [ ] Housekeeping: Cannot click missing Delete button
- [ ] Housekeeping: Can click "Confirm" button
- [ ] Housekeeping: Can complete tasks and add notes
- [ ] Front Desk: Can click "Create Task" and open modal
- [ ] Front Desk: Can fill form and create task
- [ ] Front Desk: Can click Edit and modify tasks
- [ ] Front Desk: Can click Delete and remove tasks
- [ ] Both: "Pending Confirmation" tab shows correct tasks
- [ ] Both: Can confirm task receipt successfully

### Backend API Tests
- [ ] Housekeeping GET /housekeeping/tasks: 200 ✅
- [ ] Housekeeping POST /housekeeping/tasks: 403 ❌
- [ ] Housekeeping PATCH /housekeeping/tasks/:id: 403 ❌
- [ ] Housekeeping DELETE /housekeeping/tasks/:id: 403 ❌
- [ ] Housekeeping PATCH /housekeeping/tasks/:id/confirm: 200 ✅
- [ ] Front Desk GET /housekeeping/tasks: 200 ✅
- [ ] Front Desk POST /housekeeping/tasks: 200 ✅
- [ ] Front Desk PATCH /housekeeping/tasks/:id: 200 ✅
- [ ] Front Desk DELETE /housekeeping/tasks/:id: 200 ✅
- [ ] Front Desk PATCH /housekeeping/tasks/:id/confirm: 200 ✅

### Error Handling Tests
- [ ] Housekeeping modal: Shows red "Access Denied" banner
- [ ] Housekeeping submit: Shows "Access Denied" alert
- [ ] Housekeeping delete: Shows "Access Denied" alert
- [ ] API errors: Return 403 with clear message
- [ ] All errors: Include message about allowed roles

### User Experience Tests
- [ ] New housekeeping user: Can immediately see they have limited access
- [ ] No confusion: Info banner explains limitations clearly
- [ ] Task confirmation: Works intuitively for housekeeping
- [ ] Completion flow: Housekeeping can mark tasks done
- [ ] Front desk control: Can manage all aspects of tasks
- [ ] Role separation: Clear division of responsibilities

---

## Common Issues & Troubleshooting

### Issue: Create Button Shows but is Disabled

**Solution:** Verify user is logged in with correct role
```javascript
// Check console:
console.log('User role:', user.user_role || user.role);
```

### Issue: Edit/Delete Buttons Not Hidden

**Solution:** Check that `canEditTask()` and `canDeleteTask()` functions are properly checking role
```javascript
// These should return false for housekeeping:
canEditTask()  // should be false
canDeleteTask() // should be false
```

### Issue: Modal Still Shows Red Banner After Login

**Solution:** Clear browser cache and localStorage
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Issue: Backend Still Allowing Housekeeping to Create

**Solution:** Verify backend middleware is applied to routes
```bash
# Check if middleware file exists:
ls -la /home/nathanadmin/Projects/MOPAS/travooz_hms/backend/src/middlewares/roleAccess.middleware.js
```

---

## Success Criteria

✅ All tests pass
✅ Frontend prevents UI access to restricted features
✅ Backend rejects requests from unauthorized roles
✅ Error messages are clear and helpful
✅ Housekeeping can still confirm and complete tasks
✅ Front Desk has full control over task management
✅ No confusion about role permissions

---

## Sign-Off

Once all tests pass, the implementation is complete and ready for production.

- [ ] Frontend UI Tests: PASSED
- [ ] Frontend Functional Tests: PASSED
- [ ] Backend API Tests: PASSED
- [ ] Error Handling: VERIFIED
- [ ] User Experience: APPROVED
- [ ] Ready for Production: YES