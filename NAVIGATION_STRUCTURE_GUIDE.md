# 🗺️ Navigation Structure Guide

## Overview

This document outlines the complete navigation structure for the HMS system, organized by module and user role access.

---

## 📊 Navigation by Role

### 1. **ADMIN** (System Administrator)
**Access Level:** Full system access ✅

| Section | Routes | Purpose |
|---------|--------|---------|
| **Dashboard** | `/dashboard` | System overview and role-based dashboard |
| **Hotel Management** | `/hotels/homestays`, `/hotels/room-types`, `/hotels/room-inventory`, etc. | Complete property management |
| **Booking Management** | `/bookings/bookings`, `/bookings/room-bookings`, `/bookings/booking-guests`, etc. | Advanced booking management |
| **Financial Management** | `/financial/*` | Account and invoice management |
| **Guest Management** | `/guests/*` | Guest profiles, requests, complaints |
| **Front Desk** | `/front-desk/*` | Reception operations |
| **Housekeeping** | `/housekeeping/*` | Housekeeping management |
| **Maintenance** | `/maintenance/*` | Maintenance operations |
| **Restaurant & Kitchen** | `/restaurant/*` | Restaurant operations |
| **Stock Management** | `/stock/*` | Inventory management |
| **Reports** | `/reports` | System reports |
| **Settings** | `/settings` | System configuration |

---

### 2. **VENDOR** (Property Owner)
**Access Level:** Full property management

| Section | Routes |
|---------|--------|
| Dashboard | `/dashboard` |
| Hotel Management | All `/hotels/*` routes |
| Booking Management | All `/bookings/*` routes |
| Financial Management | All `/financial/*` routes |
| Guest Management | All `/guests/*` routes |
| Front Desk | All `/front-desk/*` routes |
| Housekeeping | All `/housekeeping/*` routes |
| Maintenance | All `/maintenance/*` routes |
| Restaurant & Kitchen | All `/restaurant/*` routes |
| Stock Management | All `/stock/*` routes |
| Reports | `/reports` |
| Settings | `/settings` |

---

### 3. **MANAGER** (Property Manager)
**Access Level:** Property and operational management

| Section | Routes |
|---------|--------|
| Dashboard | `/dashboard` |
| Hotel Management | All `/hotels/*` routes |
| Booking Management | All `/bookings/*` routes |
| Financial Management | All `/financial/*` routes |
| Guest Management | All `/guests/*` routes |
| Front Desk | All `/front-desk/*` routes |
| Housekeeping | All `/housekeeping/*` routes |
| Maintenance | All `/maintenance/*` routes |
| Restaurant & Kitchen | All `/restaurant/*` routes |
| Stock Management | All `/stock/*` routes |
| Reports | `/reports` |

---

### 4. **RECEPTIONIST** (Front Desk Staff) ⭐
**Access Level:** Front desk operations ONLY

| Section | Routes | Notes |
|---------|--------|-------|
| **Dashboard** | `/dashboard` (Receptionist Dashboard) | Quick stats and today's bookings |
| **Front Desk** | `/front-desk/bookings` | Main booking list |
| | `/front-desk/upcoming-arrivals` | Today's arrivals |
| | `/front-desk/in-house-guests` | Current guests |
| | `/front-desk/check-out` | Departing guests |
| | `/front-desk/room-status` | Room status overview |
| | `/front-desk/walk-in-booking` | Create walk-in bookings |
| | `/front-desk/guest-folio` | Guest account details |
| **Guest Management** | `/guests/guest-requests` | Guest requests |
| | `/guests/guest-complaints` | Guest complaints |
| | `/guests/guest-reviews` | Guest reviews |
| **Allowed Hotel Items** | `/hotels/room-availability` | View room availability |
| | `/hotels/room-status` | View room status |
| | `/hotels/room-inventory` | View room inventory |

**❌ NOT accessible:**
- Booking Management section (`/bookings/*`) - Manager's role
- Financial Management
- Housekeeping management
- Maintenance management
- Restaurant management
- Stock management

---

### 5. **HOUSEKEEPING** (Housekeeping Staff)
**Access Level:** Housekeeping operations ONLY

| Section | Routes |
|---------|--------|
| Dashboard | `/dashboard` (Housekeeping Dashboard) |
| Housekeeping | `/housekeeping/tasks` |
| | `/housekeeping/my-tasks` |
| Allowed Hotel Items | `/hotels/room-status` |
| | `/hotels/room-inventory` |

---

### 6. **MAINTENANCE** (Maintenance Staff)
**Access Level:** Maintenance operations ONLY

| Section | Routes |
|---------|--------|
| Dashboard | `/dashboard` (Maintenance Dashboard) |
| Maintenance | `/maintenance/requests` |
| | `/maintenance/assets` |
| Allowed Hotel Items | `/hotels/room-status` |

---

### 7. **RESTAURANT** (Restaurant Manager)
**Access Level:** Restaurant operations ONLY

| Section | Routes |
|---------|--------|
| Dashboard | `/dashboard` (Restaurant Dashboard) |
| Restaurant & Kitchen | `/restaurant/tables` |
| | `/restaurant/menu` |
| | `/restaurant/orders` |
| | `/restaurant/order-items` |
| | `/restaurant/kitchen-queue` |
| | `/restaurant/delivery` |

---

### 8. **INVENTORY** (Stock Manager)
**Access Level:** Stock management ONLY

| Section | Routes |
|---------|--------|
| Dashboard | `/dashboard` (Inventory Dashboard) |
| Stock Management | `/stock/items` |
| | `/stock/movements` |
| | `/stock/suppliers` |
| | `/stock/orders` |
| | `/stock/usage-logs` |
| | `/stock/alerts` |

---

### 9. **ACCOUNTANT** (Financial Staff)
**Access Level:** Financial management ONLY

| Section | Routes |
|---------|--------|
| Dashboard | `/dashboard` (Accountant Dashboard) |
| Financial Management | `/financial/accounts` |
| | `/financial/account-linkage` |
| | `/financial/account-summary` |
| | `/financial/invoices` |
| Booking Management | `/bookings/booking-charges` (view only) |
| Reports | `/reports` |

---

### 10. **CLIENT** (Guest/External User)
**Access Level:** Limited guest features

| Section | Routes |
|---------|--------|
| Dashboard | `/dashboard` |
| Booking Management | Limited booking view |
| Guest Management | User's own requests/reviews |
| Settings | Personal settings |

---

## 🛣️ Complete Route Map

### Hotel Management Routes
```
/hotels/homestays              → List all homestays
/hotels/homestays/:id          → View homestay details
/hotels/homestays/:id/edit     → Edit homestay
/hotels/homestays/:id/stay-view → Stay view analysis
/hotels/homestays/create       → Create new homestay
/hotels/hms-users             → HMS user management
/hotels/room-types            → Room types management
/hotels/room-inventory        → Room inventory
/hotels/room-images           → Room images
/hotels/room-rates            → Room rates
/hotels/room-availability     → Room availability calendar
/hotels/room-status           → Room status log
/hotels/room-assignments      → Room assignments
```

### Booking Management Routes (Hotel Manager/Admin ONLY)
```
/bookings/bookings            → Bookings list
/bookings/room-bookings       → Room bookings
/bookings/multi-room-bookings → Multi-room bookings
/bookings/booking-guests      → Booking guests management
/bookings/booking-modifications → Booking modifications
/bookings/booking-charges     → Booking charges
/bookings/external-bookings   → External bookings
```

### Front Desk Routes (Receptionist)
```
/front-desk/bookings          → Booking list (MAIN)
/front-desk/upcoming-arrivals → Today's arrivals
/front-desk/in-house-guests   → Currently checked-in guests
/front-desk/check-out         → Check-out management
/front-desk/room-status       → Room status overview
/front-desk/walk-in-booking   → Create walk-in bookings
/front-desk/guest-folio       → Guest account details
```

### Guest Management Routes
```
/guests/guest-profiles        → Guest profiles
/guests/guest-requests        → Guest requests
/guests/guest-complaints      → Guest complaints
/guests/guest-reviews         → Guest reviews
/guests/user-favorites        → User favorites
```

### Financial Management Routes
```
/financial/accounts           → Financial accounts
/financial/account-linkage    → Account linkage
/financial/account-summary    → Account summary
/financial/invoices           → Invoices
```

### Housekeeping Routes
```
/housekeeping/dashboard       → Housekeeping dashboard
/housekeeping/tasks           → All tasks
/housekeeping/my-tasks        → Assigned tasks
/housekeeping/pending         → Pending tasks
/housekeeping/completed       → Completed tasks
```

### Maintenance Routes
```
/maintenance/dashboard        → Maintenance dashboard
/maintenance/requests         → Maintenance requests
/maintenance/assets           → Maintenance assets
```

### Restaurant Routes
```
/restaurant/tables            → Restaurant tables
/restaurant/menu              → Menu management
/restaurant/orders            → Restaurant orders
/restaurant/order-items       → Order items
/restaurant/kitchen-queue     → Kitchen queue
/restaurant/delivery          → Order delivery
```

### Stock Management Routes
```
/stock/items                  → Stock items
/stock/movements              → Stock movements
/stock/suppliers              → Suppliers
/stock/orders                 → Purchase orders
/stock/usage-logs             → Usage logs
/stock/alerts                 → Inventory alerts
```

### Dashboard Routes
```
/dashboard                    → Role-based dashboard router
                              → Redirects to appropriate dashboard:
                              →  Receptionist → ReceptionistDashboard
                              →  Housekeeping → HousekeepingDashboard
                              →  Manager → ManagerDashboard
                              →  etc.
```

### Other Routes
```
/reports                      → Reports
/settings                      → Settings
/login                        → Login page
/register                     → Registration page
```

---

## 🔐 Key Navigation Rules

### 1. Role-Based Filtering
- Each role only sees navigation items they're allowed to access
- Hidden items are removed from sidebar automatically
- Unauthorized route access redirects to dashboard

### 2. Receptionist Special Rules
- **CAN see:** Front Desk, Guest Management, limited hotel info
- **CANNOT see:** Booking Management (manager's section), Financial, Housekeeping, Maintenance, etc.
- **Cannot access:** `/bookings/*` routes (these are for managers)
- **Correct routes:** `/front-desk/*` (these are for receptionists)

### 3. Front Desk vs Booking Management
| Aspect | Front Desk | Booking Management |
|--------|-----------|-------------------|
| **URL Prefix** | `/front-desk/*` | `/bookings/*` |
| **User Role** | Receptionist | Manager/Admin |
| **Purpose** | Daily check-in operations | Advanced booking analysis |
| **Access** | Limited to current operations | Full booking data |
| **Main Route** | `/front-desk/bookings` | `/bookings/room-bookings` |

### 4. Multi-Vendor Scoping
All routes automatically filter data based on:
- User's assigned `homestay_id`
- User's assigned property
- Cannot see other properties' data

---

## 🔧 Configuration File

**Location:** `/frontend/src/config/rolePermissions.js`

This file defines:
- Which sections each role can access (`allowedSections`)
- Which specific items are allowed (`allowedItems`)
- Permissions checking functions

**To modify permissions:**
1. Edit `ROLE_PERMISSIONS` object
2. Add/remove sections to `allowedSections` array
3. Add/remove specific routes to `allowedItems` array
4. Test with each role

---

## 📝 Navigation Sidebar Structure

**File:** `/frontend/src/components/Sidebar.jsx`

The sidebar is organized as:
1. Dashboard (root)
2. Collapsible sections (with children items)
3. Single menu items

**Current Sections:**
- Hotel Management (collapsible)
- Booking Management (collapsible)
- Financial Management (collapsible)
- Guest Management (collapsible)
- Front Desk (collapsible)
- Housekeeping (collapsible)
- Maintenance (collapsible)
- Restaurant & Kitchen (collapsible)
- Stock Management (collapsible)
- Reports (single item)
- Settings (single item)

---

## 🎯 Common Navigation Scenarios

### Scenario 1: Receptionist Logs In
```
1. User logs in with receptionist role
2. Redirected to /dashboard
3. ReceptionistDashboard loads with today's arrivals/departures
4. Sidebar shows:
   - Dashboard
   - Guest Management
   - Front Desk ← Main navigation
5. Clicking "Front Desk" expands to show:
   - Bookings List
   - Upcoming Arrivals
   - In-House Guests
   - Check-Out
   - Room Status
   - Walk-In Booking
   - Guest Folio
```

### Scenario 2: Manager Logs In
```
1. User logs in with manager role
2. Redirected to /dashboard
3. ManagerDashboard loads
4. Sidebar shows all sections:
   - Hotel Management
   - Booking Management ← For advanced booking operations
   - Financial Management
   - Guest Management
   - Front Desk
   - Housekeeping
   - Maintenance
   - Restaurant & Kitchen
   - Stock Management
```

### Scenario 3: Accessing Unauthorized Route
```
1. Receptionist tries to access /bookings/room-bookings directly
2. Component checks user role via JWT
3. Access denied (role check fails)
4. Redirected to /dashboard
5. Toast warning shown
```

---

## ✅ Navigation Checklist

Before deploying, verify:

- [ ] Receptionists can only see `/front-desk/*` routes
- [ ] Managers can only see `/bookings/*` routes (not receptionists)
- [ ] Each role's dashboard is correct
- [ ] Sidebar sections match allowed sections
- [ ] No duplicate navigation items
- [ ] All URLs follow the pattern: `/module/feature`
- [ ] Role permissions are in `rolePermissions.js`
- [ ] Unauthorized access redirects properly
- [ ] Multi-vendor scoping works (homestay_id filtering)
- [ ] Mobile sidebar works correctly

---

## 🚀 Deployment Checklist

### Testing
- [ ] Test each role's navigation
- [ ] Test route access restrictions
- [ ] Test sidebar on mobile
- [ ] Test back button after unauthorized redirect
- [ ] Test role switching (if applicable)

### Documentation
- [ ] Update team wiki with navigation changes
- [ ] Document any custom role permissions
- [ ] Provide role-specific access guides

### Monitoring
- [ ] Monitor unauthorized access attempts
- [ ] Check error logs for routing issues
- [ ] Verify multi-vendor scoping works

---

## 📞 Support

For navigation issues:
1. Check user's role in database
2. Verify role permissions in `rolePermissions.js`
3. Check browser console for errors
4. Check JWT token contains correct role
5. Verify database user role matches frontend role

---

**Last Updated:** January 15, 2025
**Version:** 1.1
**Status:** Navigation structure clarified and fixed ✅