# 🎯 Frontend Navigation - Quick Reference

## Role-Based Navigation Quick Matrix

```
┌─────────────┬──────────────┬─────────────┬──────────────┬──────────────┐
│ Role        │ Dashboard    │ Hotel Mgmt  │ Booking Mgmt │ Front Desk   │
├─────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
│ Admin       │ ✅ Full      │ ✅ Full     │ ✅ Full      │ ✅ Full      │
│ Vendor      │ ✅ Full      │ ✅ Full     │ ✅ Full      │ ✅ Full      │
│ Manager     │ ✅ Full      │ ✅ Full     │ ✅ Full      │ ✅ Full      │
│ Receptionist│ ✅ Limited   │ ✅ Limited* │ ❌ None      │ ✅ Full      │
│ Housekeeping│ ✅ Limited   │ ✅ Limited* │ ❌ None      │ ❌ None      │
│ Maintenance │ ✅ Limited   │ ✅ Limited* │ ❌ None      │ ❌ None      │
│ Restaurant  │ ✅ Limited   │ ❌ None     │ ❌ None      │ ❌ None      │
│ Inventory   │ ✅ Limited   │ ❌ None     │ ❌ None      │ ❌ None      │
│ Accountant  │ ✅ Limited   │ ❌ None     │ ✅ Limited** │ ❌ None      │
└─────────────┴──────────────┴─────────────┴──────────────┴──────────────┘

* Limited: Only room status, availability, inventory
** Limited: Only booking charges
```

---

## URL Quick Map

### Front Desk (Receptionist)
```
/front-desk/bookings           ← PRIMARY - Booking list
/front-desk/upcoming-arrivals   ← Today's check-ins
/front-desk/in-house-guests     ← Current occupants
/front-desk/check-out           ← Departing guests
/front-desk/room-status         ← Room status overview
/front-desk/walk-in-booking     ← Create walk-ins
/front-desk/guest-folio         ← Guest accounts
```

### Booking Management (Manager/Admin) ⚠️
```
/bookings/bookings              ← Bookings list
/bookings/room-bookings         ← Room booking details
/bookings/multi-room-bookings   ← Multi-room bookings
/bookings/booking-guests        ← Guest associations
/bookings/booking-modifications ← Modifications
/bookings/booking-charges       ← Charges
/bookings/external-bookings     ← External bookings
```

### Hotel Management
```
/hotels/homestays               ← Properties
/hotels/room-types              ← Room types
/hotels/room-inventory          ← Room inventory
/hotels/room-rates              ← Pricing
/hotels/room-availability       ← Availability calendar
/hotels/room-status             ← Room status log
/hotels/hms-users               ← Staff management
```

### Other Modules
```
/guests/guest-profiles          ← Guest database
/guests/guest-requests          ← Guest requests
/guests/guest-complaints        ← Guest complaints
/financial/invoices             ← Invoicing
/financial/accounts             ← Chart of accounts
/housekeeping/tasks             ← Task management
/maintenance/requests           ← Maintenance requests
/restaurant/orders              ← Food orders
/stock/items                    ← Inventory items
```

---

## Configuration Files

### 1. Role Permissions
**File:** `/frontend/src/config/rolePermissions.js`

```javascript
ROLE_PERMISSIONS = {
  receptionist: {
    allowedSections: [
      'Dashboard',
      'Guest Management',
      'Front Desk'           // Only these 3!
    ]
  }
}
```

**To Add/Remove:** Edit `allowedSections` array

### 2. Sidebar Navigation
**File:** `/frontend/src/components/Sidebar.jsx`

```javascript
getNavigation = (t) => [
  // Sections are defined here
  { name: 'Front Desk', children: [...] },
  { name: 'Booking Management', children: [...] }
]
```

**To Add Menu Item:**
```javascript
{
  name: 'New Section',
  icon: SomeIcon,
  children: [
    { name: 'Item 1', href: '/path/item-1', icon: IconName },
    { name: 'Item 2', href: '/path/item-2', icon: IconName }
  ]
}
```

---

## Common Tasks

### Task 1: Give Receptionist New Permission
```javascript
// In /frontend/src/config/rolePermissions.js

receptionist: {
  allowedSections: [
    'Dashboard',
    'Guest Management',
    'Front Desk',
    'Housekeeping'     // ← Add this
  ]
}
```

### Task 2: Add New Role
```javascript
// In /frontend/src/config/rolePermissions.js

supervisor: {         // ← New role
  allowedSections: [
    'Dashboard',
    'Booking Management',
    'Guest Management',
    'Front Desk'
  ]
}
```

### Task 3: Add Menu Item to Section
```javascript
// In /frontend/src/components/Sidebar.jsx

{
  name: 'Front Desk',
  children: [
    // ... existing items ...
    { 
      name: 'New Feature', 
      href: '/front-desk/new-feature',  // ← Follow pattern
      icon: NewIcon 
    }
  ]
}
```

### Task 4: Remove Access from Role
```javascript
// In /frontend/src/config/rolePermissions.js

receptionist: {
  allowedSections: [
    'Dashboard',
    'Guest Management',
    'Front Desk'
    // 'Booking Management'  ← Remove this
  ]
}
```

---

## How It Works

```
┌─────────────────────────────────────┐
│ User Login                          │
│ (JWT token with role)               │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Sidebar.jsx loads                   │
│ calls filterNavigationByRole()       │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ rolePermissions.js                  │
│ checks allowedSections for role     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Only allowed sections render        │
│ in sidebar                          │
└─────────────────────────────────────┘
```

---

## Debugging Navigation Issues

### Problem: Can't see menu item
```
1. Check role in database (hms_users.role)
2. Check role is in rolePermissions.js
3. Check section name matches exactly
4. Restart dev server
5. Clear browser cache
```

### Problem: Menu item shows but page blank
```
1. Check route exists in App.jsx
2. Check component is imported
3. Check component file exists
4. Check browser console for errors
5. Check JWT token contains role
```

### Problem: Can access unauthorized route
```
1. Check ProtectedRoute wrapper in App.jsx
2. Check role permission in rolePermissions.js
3. Check JWT token role is correct
4. Check database role matches JWT
5. Verify permissions sync after role change
```

---

## Key Principles

### 1. URL Patterns
```
Module scope: /module/feature

Examples:
✅ /front-desk/bookings       (front desk module)
✅ /bookings/room-bookings    (booking mgmt module)
❌ /bookings/front-desk       (wrong - reversed)
```

### 2. Role Separation
```
Each role sees ONLY its own sections
No mixing of concerns
Clear boundaries
```

### 3. Backend Independence
```
Frontend navigation ≠ Backend permissions
Both layers enforce access control
Defense in depth
```

### 4. Fallback Behavior
```
Unauthorized access → Redirect to dashboard
No error page shown to user
Admin logs the attempt
```

---

## Testing Checklist

- [ ] Each role sees correct sections
- [ ] Each role cannot see other sections
- [ ] All links work (no 404s)
- [ ] Mobile sidebar works
- [ ] Role change updates navigation
- [ ] Unauthorized routes redirect
- [ ] No console errors
- [ ] Icons display correctly

---

## Performance Tips

1. **Permissions filter once** - on page load, not on each render
2. **Cache navigation** - recompute only when role changes
3. **Lazy load components** - especially for hidden features
4. **Minimize imports** - unused icons add to bundle

---

## Common Mistakes to Avoid

❌ Don't: Hardcode role checks in components
✅ Do: Use rolePermissions.js

❌ Don't: Show/hide UI based on frontend only
✅ Do: Always verify on backend too

❌ Don't: Make permission changes without testing
✅ Do: Test each role after changes

❌ Don't: Forget to import new icons
✅ Do: Add icons to Sidebar.jsx imports

---

## Files Reference

| File | Purpose | Edit When |
|------|---------|-----------|
| `rolePermissions.js` | Define role permissions | Changing access |
| `Sidebar.jsx` | Navigation menu | Adding menu items |
| `App.jsx` | Routes definition | Adding new routes |
| `Layout.jsx` | Page structure | Changing layout |
| `ProtectedRoute.jsx` | Access protection | Changing auth |

---

## Version Info

- **Frontend:** React + React Router
- **Auth:** JWT tokens
- **State:** React Context (useAuth)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

---

## Quick Links

- 📖 Full Navigation Guide: `NAVIGATION_STRUCTURE_GUIDE.md`
- 🔧 Fix Summary: `NAVIGATION_FIX_SUMMARY.md`
- 👤 User Guide: `RECEPTIONIST_USER_GUIDE.md`
- 📋 Role Matrix: `ROLE_ACCESS_MATRIX.md`

---

**Last Updated:** January 15, 2025
**Audience:** Frontend Developers
**Difficulty:** Beginner to Intermediate