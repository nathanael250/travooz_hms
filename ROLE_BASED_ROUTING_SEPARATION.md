# Role-Based Routing Separation - Front Desk Navigation

## Overview
Implemented separate URL namespaces for managers and receptionists to keep concerns cleanly separated while reusing the same components.

## Architecture

### URL Structure
```
Receptionists:  http://localhost:5173/front-desk/*
Managers:       http://localhost:5173/manager/front-desk/*
```

### Component Reusability
- ✅ Components are **reused** for both roles (same code)
- ✅ Only the **URL path** differs based on role
- ✅ **API endpoints** remain the same (`/api/front-desk/*`)
- ✅ **Data filtering** happens server-side by `assigned_hotel_id`

---

## Implementation Details

### 1. **Frontend Routes** (`App.jsx`)

**Added new manager routes:**
```javascript
// Receptionist routes (existing)
<Route path="front-desk/bookings" element={<FrontDeskBookingsList />} />
<Route path="front-desk/upcoming-arrivals" element={<UpcomingArrivals />} />
<Route path="front-desk/check-out" element={<CheckOut />} />
// ... etc

// Manager routes (new)
<Route path="manager/front-desk/bookings" element={<FrontDeskBookingsList />} />
<Route path="manager/front-desk/upcoming-arrivals" element={<UpcomingArrivals />} />
<Route path="manager/front-desk/check-out" element={<CheckOut />} />
// ... etc
```

### 2. **Navigation Links** (`Sidebar.jsx`)

**Added URL transformation function:**
```javascript
const adjustNavigationForRole = (navigation, role) => {
  return navigation.map(item => {
    if (item.name === 'Front Desk' && role === 'manager') {
      // Transform: /front-desk/* → /manager/front-desk/*
      return {
        ...item,
        children: item.children?.map(child => ({
          ...child,
          href: child.href.replace('/front-desk/', '/manager/front-desk/')
        }))
      };
    }
    return item;
  });
};
```

**Applied transformation:**
```javascript
let navigation = filterNavigationByRole(allNavigation, user?.role);
navigation = adjustNavigationForRole(navigation, user?.role);
```

### 3. **Active Menu Highlighting** (`Sidebar.jsx`)

**Updated `isCurrentPage()` function:**
```javascript
const isCurrentPage = (href) => {
  const currentPath = location.pathname;
  
  // Exact match
  if (currentPath === href || currentPath.startsWith(href + '/')) {
    return true;
  }
  
  // For managers accessing /manager/front-desk/*, also match /front-desk/* hrefs
  if (user?.role === 'manager' && href.startsWith('/front-desk/')) {
    const managerHref = href.replace('/front-desk/', '/manager/front-desk/');
    return currentPath === managerHref || currentPath.startsWith(managerHref + '/');
  }
  
  return false;
};
```

---

## Front Desk Components Affected

All components are **reused** by both roles:

| Route | Component | Receptionist | Manager |
|-------|-----------|--------------|---------|
| Bookings | FrontDeskBookingsList | `/front-desk/bookings` | `/manager/front-desk/bookings` |
| Upcoming Arrivals | UpcomingArrivals | `/front-desk/upcoming-arrivals` | `/manager/front-desk/upcoming-arrivals` |
| Check-Out | CheckOut | `/front-desk/check-out` | `/manager/front-desk/check-out` |
| In-House Guests | InHouseGuests | `/front-desk/in-house-guests` | `/manager/front-desk/in-house-guests` |
| Room Status | FrontDeskRoomStatus | `/front-desk/room-status` | `/manager/front-desk/room-status` |
| Walk-In Booking | WalkInBooking | `/front-desk/walk-in-booking` | `/manager/front-desk/walk-in-booking` |
| Guest Folio | GuestFolio | `/front-desk/guest-folio` | `/manager/front-desk/guest-folio` |

---

## API Endpoints (Unchanged)

All components call the **same backend API endpoints** regardless of URL:

```
GET  /api/front-desk/bookings
GET  /api/front-desk/upcoming-arrivals
POST /api/front-desk/check-in/:booking_id
GET  /api/front-desk/checkouts
GET  /api/front-desk/in-house-guests
GET  /api/front-desk/room-status
PUT  /api/front-desk/room-status/:room_id
POST /api/front-desk/guest-request
GET  /api/front-desk/folio/:guest_id
POST /api/front-desk/folio/:guest_id/charge
POST /api/front-desk/folio/:guest_id/payment
```

**Server-side data filtering** by `assigned_hotel_id` ensures:
- ✅ Managers see only their assigned hotel's data
- ✅ Receptionists see only their assigned hotel's data
- ✅ No data leakage between hotels or roles

---

## Testing Checklist

### Receptionist Testing
```bash
# Login as receptionist
- ✅ Sidebar shows "Front Desk" section
- ✅ Click "Upcoming Arrivals" → URL: /front-desk/upcoming-arrivals
- ✅ Navigation highlights current page
- ✅ API calls work correctly
- ✅ Data filtered by assigned_hotel_id
```

### Manager Testing
```bash
# Login as manager
- ✅ Sidebar shows "Front Desk" section
- ✅ Click "Upcoming Arrivals" → URL: /manager/front-desk/upcoming-arrivals
- ✅ Navigation highlights current page
- ✅ API calls work correctly
- ✅ Data filtered by assigned_hotel_id
```

---

## Advantages of This Approach

1. **Clear Separation**: Different roles have distinct URL namespaces
2. **Maintainability**: Easier to understand which role accesses what
3. **Extensibility**: Easy to add role-specific customizations later
4. **No Duplication**: Components reused across roles
5. **Server-side Security**: Data filtering ensures proper authorization

---

## Files Modified

- ✅ `/frontend/src/App.jsx` - Added manager routes
- ✅ `/frontend/src/components/Sidebar.jsx` - Added URL transformation + highlighting logic

## Files Unchanged

- ✅ All component files (`CheckOut.jsx`, `UpcomingArrivals.jsx`, etc.) - Reused as-is
- ✅ Backend API endpoints - No changes needed
- ✅ Database schema - No changes needed

---

## Future Enhancements

### Option 1: Role-Specific Layouts
```javascript
// Later: If managers need different sidebar, add:
<Route path="manager/*" element={<ManagerLayout />}>
  <Route path="front-desk/bookings" element={<FrontDeskBookingsList />} />
  ...
</Route>
```

### Option 2: Additional Role Namespaces
```javascript
// If needed, add similar separation for other roles:
/housekeeping/front-desk/*
/maintenance/front-desk/*
/accountant/front-desk/*
```

---

## Summary

✅ **Routing separation implemented successfully**
- Managers: `/manager/front-desk/*`
- Receptionists: `/front-desk/*`
- Components: Reused
- Data: Server-side filtered by `assigned_hotel_id`
- Ready for testing and deployment