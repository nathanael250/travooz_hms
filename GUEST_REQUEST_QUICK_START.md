# 🚀 Guest Request Task Management - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- ✅ Backend running with `/api/guest-requests` endpoints
- ✅ Frontend with React components imported
- ✅ HMS staff users created with roles (housekeeping, maintenance, etc.)

### Step 1: Import Components (1 minute)

```jsx
// In your dashboard file
import StaffTaskDashboard from '../../components/StaffTaskDashboard';
import ManagerTaskOversight from '../../components/ManagerTaskOversight';
```

### Step 2: Add to Dashboard (1 minute)

**For Staff Dashboards (Housekeeping, Maintenance, etc.):**
```jsx
<div className="bg-white rounded-lg p-4">
  <h3 className="text-lg font-semibold mb-4">My Assigned Tasks</h3>
  <StaffTaskDashboard staffRole="housekeeping" />
</div>
```

**For Manager Dashboard:**
```jsx
<ManagerTaskOversight />
```

### Step 3: Test the Flow (3 minutes)

1. **As Receptionist:**
   - Go to Front Desk → Guest Management
   - Select a booking
   - Click "Create Guest Request"
   - Fill in: Type, Description, Priority, Assigned Staff
   - Click "Create"

2. **As Staff Member:**
   - Go to your dashboard (Housekeeping, Maintenance, etc.)
   - See the task in "My Assigned Tasks"
   - Click to expand
   - Click "Accept Task" (status → acknowledged)
   - Click "Start Working" (status → in_progress)
   - Click "Mark Complete"
   - Fill in notes and optional rating
   - Click "Complete" (status → completed)

3. **As Manager:**
   - Go to Task Management Overview
   - See all tasks across departments
   - Filter by status, type, or staff
   - View statistics

### Step 4: Verify Billing Integration (1 minute)

1. Go to Front Desk → Guest Folio
2. Select a guest with completed requests
3. Click "Preview Invoice"
4. Verify completed requests with charges appear
5. Click "Generate Invoice"

---

## Day-to-Day Usage

### For Housekeeping Staff

```
Morning:
  1. Login → Housekeeping Dashboard
  2. See "My Assigned Tasks" section
  3. See all your pending tasks
  
For Each Task:
  1. Click to expand task details
  2. Read guest notes
  3. Click "Accept Task"
  4. Go do the work
  5. Return and click "Mark Complete"
  6. Add notes (e.g., "Delivered 3 extra towels")
  7. Give optional rating
  8. Click "Complete"
  9. Task done! ✅

End of Day:
  - View "Completed" tasks
  - See how many you completed
  - Review performance metrics
```

### For Receptionist

```
When Guest Needs Something:
  1. Guest calls/arrives at desk
  2. Go to Front Desk section
  3. Find booking
  4. Click "Create Guest Request"
  5. Select request type (housekeeping, maintenance, etc.)
  6. Describe what guest needs
  7. Set priority (normal, high, urgent)
  8. Assign to staff member
  9. Click "Create"
  ✅ Request sent to staff!

Later:
  - Can track status in Guest Folio
  - See when completed
  - Add charge if needed

At Checkout:
  - Generate invoice
  - Completed requests with charges included
  - Guest pays
```

### For Manager

```
During Day:
  1. Go to Task Management Overview
  2. Check statistics dashboard
  3. Filter tasks by status
  4. See which staff are busy
  5. Identify any bottlenecks
  
If Issue:
  1. Find task
  2. Click "Reassign"
  3. Select different staff member
  4. Click "Reassign"
  ✅ Task reassigned!

End of Day:
  - Review completion rate %
  - Check average completion time
  - Identify top performers
```

---

## Common Scenarios

### Scenario 1: Guest Needs Extra Towels

```
Housekeeping Staff POV:

You arrive for your shift and check your dashboard.

SCREEN SHOWS:
┌────────────────────────────────────────┐
│ My Assigned Tasks                      │
├────────────────────────────────────────┤
│ 📋 Pending: 3                          │
│ 👀 Acknowledged: 1                     │
│ ⚙️  In Progress: 0                     │
│ ✅ Completed: 5                        │
└────────────────────────────────────────┘

First task:
┌────────────────────────────────────────┐
│ 🧺 HOUSEKEEPING                        │
│ "Need extra towels"                    │
│ Priority: Normal                       │
│ Status: ⏳ Pending                     │
│ Room 205 | Guest: Alice Johnson        │
│ Requested: 2 min ago                   │
├────────────────────────────────────────┤
│ Guest Notes: "Soft towels please"      │
│ Additional Charge: $0                  │
├────────────────────────────────────────┤
│ [Accept Task] [Close]                  │
└────────────────────────────────────────┘

YOU CLICK: Accept Task

SYSTEM SHOWS: ✅ Task accepted! You can now start working on it.

Task now shows:
┌────────────────────────────────────────┐
│ 👀 ACKNOWLEDGED                        │
│ [Start Working]  [Mark Complete]       │
└────────────────────────────────────────┘

YOU CLICK: Start Working
→ Status becomes ⚙️  In Progress

YOU GO DELIVER TOWELS TO ROOM 205
→ Alice opens door, you deliver towels
→ Alice: "Thank you, perfect!"

YOU RETURN AND CLICK: Mark Complete

MODAL APPEARS:
┌────────────────────────────────────────┐
│ Complete Task                          │
├────────────────────────────────────────┤
│ Completion Notes:                      │
│ [Delivered 3 soft towels as requested] │
│                                        │
│ Satisfaction: ⭐⭐⭐⭐⭐              │
│ Feedback: Great service today!         │
│                                        │
│ [Cancel] [✅ Complete]                 │
└────────────────────────────────────────┘

YOU SUBMIT

SYSTEM SHOWS: ✅ Task completed successfully!

TASK MOVES TO COMPLETED:
┌────────────────────────────────────────┐
│ ✅ COMPLETED                           │
│ Completed by: You                      │
│ Time: 15 minutes ago                   │
│ Notes: Delivered 3 soft towels...      │
│ Rating: 5 stars                        │
└────────────────────────────────────────┘

YOU'VE EARNED: 1 completed task ✅
```

### Scenario 2: Generator Broken, Manager Reassigns Task

```
Manager POV:

Morning - Check dashboard:
┌────────────────────────────────────────┐
│ TASK MANAGEMENT OVERVIEW               │
├────────────────────────────────────────┤
│ Total Tasks: 25                        │
│ Pending: 5                             │
│ In Progress: 8                         │
│ Completed: 12                          │
│ Avg Time: 1h 20m                       │
│ Completion Rate: 85%                   │
└────────────────────────────────────────┘

Filter: Show MAINTENANCE, Status: PENDING

SHOWS:
- Generator maintenance (2 hours) → Assigned to John
- AC repair (1 hour) → Assigned to Maria
- Plumbing issue (30 min) → Assigned to James

PROBLEM: John's generator task not moving. It's been 2 hours!

CLICK GENERATOR TASK:

┌────────────────────────────────────────┐
│ ⚙️ MAINTENANCE                         │
│ "Generator not working"                │
│ Priority: URGENT 🚨                    │
│ Status: ⏳ PENDING (2h 15m!)          │
│ Assigned to: John Smith                │
│ Guest: VIP Suite - Lost air con!       │
│                                        │
│ Guest Notes: "Urgent! Cooling is off!" │
├────────────────────────────────────────┤
│ [Reassign] [View Details]              │
└────────────────────────────────────────┘

YOU CLICK: Reassign

MODAL APPEARS:
┌────────────────────────────────────────┐
│ Reassign Task                          │
├────────────────────────────────────────┐
│ Generator not working                  │
│                                        │
│ Assign to:                             │
│ [SELECT STAFF MEMBER ▼]                │
│   John Smith (maintenance)             │
│   Maria Garcia (maintenance)  ← Select │
│   James Wilson (maintenance)           │
│                                        │
│ [Cancel] [Reassign]                    │
└────────────────────────────────────────┘

YOU SELECT: Maria Garcia

YOU CLICK: Reassign

SYSTEM SHOWS: ✅ Task reassigned to Maria Garcia

WHAT HAPPENS:
- Task removed from John's queue
- Task added to Maria's queue
- Maria sees new URGENT task
- John sees one fewer task
- Timestamp updated

RESULT:
- Maria fixes generator in 45 minutes
- Guest happy
- Crisis averted! ✅
```

### Scenario 3: Request with Extra Charge

```
Scenario: Guest wants laundry service

RECEPTIONIST:
1. Guest calls: "Can you press 3 shirts? Will pay extra."
2. Go to Front Desk
3. Find booking
4. Create Guest Request:
   - Type: "housekeeping"
   - Description: "Press 3 dress shirts"
   - Priority: "normal"
   - Assigned to: "Maria (housekeeping)"
   - Additional Charge: "$5.00"
5. Click Create ✅

HOUSEKEEPING STAFF (Maria):
1. Sees task in dashboard
2. "Press 3 dress shirts" with $5 charge noted
3. Accepts task
4. Picks up shirts from room 301
5. Goes to laundry
6. Presses shirts (takes 30 min)
7. Returns to room 301
8. Guest: "Perfect! Looks great!"
9. Returns to dashboard
10. Clicks "Mark Complete"
11. Adds notes: "All 3 shirts pressed perfectly"
12. Submits ✅

RECEPTIONIST (At checkout):
1. Guest ready to check out
2. Go to Guest Folio for room 301
3. Click "Preview Invoice"
4. SYSTEM SHOWS:
   ┌─────────────────────────────┐
   │ Room Charge: $200           │
   │ Restaurant: $45             │
   │ Laundry Service: $5 ← HERE! │
   ├─────────────────────────────┤
   │ Subtotal: $250              │
   │ Tax (18%): $45              │
   ├─────────────────────────────┤
   │ TOTAL: $295                 │
   └─────────────────────────────┘
5. Click "Generate Invoice"
6. Invoice created with all charges
7. Guest pays $295
8. Everyone happy! ✅
```

---

## Quick Reference: Status Colors

| Status | Color | Meaning | What to Do |
|--------|-------|---------|-----------|
| ⏳ Pending | Yellow | Task not yet accepted | Accept it! |
| 👀 Acknowledged | Blue | You accepted it | Start working or click "Start Working" |
| ⚙️ In Progress | Purple | Actively working | Do the work, then mark complete |
| ✅ Completed | Green | All done! | Task finished and recorded |
| ❌ Cancelled | Red | Task cancelled | Don't need to do anything |

---

## Keyboard Shortcuts (Optional to Add Later)

```
A - Accept selected task
S - Start working on task
C - Mark complete
R - Reassign task (manager only)
F - Filter tasks
```

---

## Performance Tips

### For Staff:
1. **Check Dashboard Every Morning** - See all your tasks
2. **Accept Tasks Immediately** - Don't let them sit
3. **Add Detailed Notes** - Helps with future requests
4. **Rate Your Work** - Helps track quality

### For Managers:
1. **Check Overview Daily** - Monitor team performance
2. **Reassign Early** - Don't wait for deadlines
3. **Review Metrics** - Identify bottlenecks
4. **Reward Top Performers** - High completion rates

### For Receptionists:
1. **Assign Clearly** - Give specific staff member
2. **Set Right Priority** - Urgent vs normal
3. **Add Guest Notes** - Help staff understand needs
4. **Track Charges** - Include in billing

---

## Troubleshooting

### "I don't see my tasks"
- ✅ Check you're logged in as staff member
- ✅ Check you're on correct dashboard
- ✅ Refresh page (F5)
- ✅ Check if any tasks are actually assigned to you

### "I can't accept a task"
- ✅ Verify it's assigned to YOU
- ✅ Check status is "pending"
- ✅ Try refreshing
- ✅ Check internet connection

### "Task didn't complete"
- ✅ Check internet connection
- ✅ Fill in all required fields
- ✅ Try again
- ✅ Contact manager if still doesn't work

### "Charge didn't appear in invoice"
- ✅ Check task marked "completed" (not just started)
- ✅ Verify additional_charge > $0
- ✅ Check booking ID is correct
- ✅ Try previewing again

---

## Success Indicators

### For Staff:
✅ Accept first task within 2 minutes  
✅ Complete first task  
✅ Add completion notes  
✅ See task in "Completed" section  

### For Receptionist:
✅ Create first guest request  
✅ See task assigned to staff in their dashboard  
✅ Track status change to "completed"  
✅ Include charge in invoice  

### For Manager:
✅ View task overview dashboard  
✅ See real-time statistics  
✅ Filter tasks by multiple criteria  
✅ Reassign a task  

---

## Need Help?

📋 See **GUEST_REQUEST_TASK_LIFECYCLE.md** for detailed documentation  
💡 Check API Endpoints section for technical details  
🐛 Review logs at `/backend/logs/` for errors  
📞 Contact your administrator for support  

---

**Ready to start?** Login and check your dashboard! 🚀