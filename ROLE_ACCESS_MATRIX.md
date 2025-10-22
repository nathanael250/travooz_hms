# Role Access Control Matrix

## Quick Reference Guide

### User Types & Tables

| User Type | Table | ID Field | Status Field | User Types |
|-----------|-------|----------|--------------|------------|
| Regular | `users` | `user_id` | `is_active` | admin, vendor, client |
| HMS Staff | `hms_users` | `hms_user_id` | `status` | manager, receptionist, housekeeping, maintenance, restaurant, inventory, accountant |

---

## Access Matrix

Legend: ✅ Full Access | 🔸 Partial Access | ❌ No Access

### Regular Users (users table)

| Section | Admin | Vendor | Client |
|---------|-------|--------|--------|
| Dashboard | ✅ | ✅ | ✅ |
| Hotel Management | ✅ | ✅ | ❌ |
| ├─ Homestays | ✅ | ✅ | ❌ |
| ├─ Room Types | ✅ | ✅ | ❌ |
| ├─ Room Inventory | ✅ | ✅ | ❌ |
| ├─ Room Images | ✅ | ✅ | ❌ |
| ├─ Room Rates | ✅ | ✅ | ❌ |
| ├─ Room Availability | ✅ | ✅ | ❌ |
| ├─ Room Status | ✅ | ✅ | ❌ |
| ├─ Room Assignments | ✅ | ✅ | ❌ |
| └─ HMS Users | ✅ | ✅ | ❌ |
| Booking Management | ✅ | ✅ | ✅ |
| Financial Management | ✅ | ✅ | ❌ |
| Guest Management | ✅ | ✅ | ✅ |
| Front Desk | ✅ | ✅ | ❌ |
| Housekeeping | ✅ | ✅ | ❌ |
| Maintenance | ✅ | ✅ | ❌ |
| Restaurant & Kitchen | ✅ | ✅ | ❌ |
| Stock Management | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ |
| Settings | ✅ | ✅ | ✅ |

---

### HMS Users (hms_users table)

| Section | Manager | Receptionist | Housekeeping | Maintenance | Restaurant | Inventory | Accountant |
|---------|---------|--------------|--------------|-------------|------------|-----------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Hotel Management** | ✅ | 🔸 | 🔸 | 🔸 | ❌ | ❌ | ❌ |
| ├─ Homestays | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ├─ Room Types | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ├─ Room Inventory | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ├─ Room Images | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ├─ Room Rates | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ├─ Room Availability | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ├─ Room Status | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| ├─ Room Assignments | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| └─ HMS Users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Booking Management** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | 🔸 |
| ├─ Room Bookings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| ├─ Multi-Room Bookings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| ├─ Booking Guests | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| ├─ Booking Modifications | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| ├─ Booking Charges | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| └─ External Bookings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Financial Management** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Guest Management** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Front Desk** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Housekeeping** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Maintenance** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Restaurant & Kitchen** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Stock Management** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Reports** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Settings** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Role Descriptions

### Regular Users

**Admin (users.role = 'admin')**
- Full system access
- Can create/manage vendors
- System-wide configuration

**Vendor (users.role = 'vendor')**
- Hotel owner/operator
- Manages their hotel properties
- Creates and manages HMS staff
- Full access to hotel operations

**Client (users.role = 'client')**
- Hotel guests/customers
- Can make bookings
- View their booking history
- Manage their profile

---

### HMS Users (Hotel Staff)

**Manager (hms_users.role = 'manager')**
- Hotel-level administrator
- Access to most hotel operations
- Cannot manage HMS users (vendor only)
- Oversees all departments

**Receptionist (hms_users.role = 'receptionist')**
- Front desk operations
- Guest check-in/check-out
- Booking management
- Guest services
- Room availability checking

**Housekeeping (hms_users.role = 'housekeeping')**
- Room cleaning tasks
- Room status updates
- Housekeeping schedules
- Inventory for cleaning supplies

**Maintenance (hms_users.role = 'maintenance')**
- Maintenance requests
- Asset management
- Room status (for maintenance)
- Work order tracking

**Restaurant (hms_users.role = 'restaurant')**
- Restaurant table management
- Menu management
- Order processing
- Kitchen queue
- Delivery tracking

**Inventory (hms_users.role = 'inventory')**
- Stock items management
- Stock movements
- Supplier management
- Purchase orders
- Usage logs
- Inventory alerts

**Accountant (hms_users.role = 'accountant')**
- Financial reports
- Invoicing
- Account management
- Booking charges
- Payment tracking

---

## Key Implementation Details

### Token Structure
```javascript
{
  id: <user_id or hms_user_id>,
  email: "user@example.com",
  role: "receptionist",
  userType: "regular" | "hms"  // Critical for table selection
}
```

### Login Flow
1. User enters credentials
2. System checks `users` table
3. If not found, checks `hms_users` table
4. Generates JWT with `userType`
5. Returns user object with role
6. Frontend filters navigation

### Permissions Configuration
Location: `frontend/src/config/rolePermissions.js`

```javascript
ROLE_PERMISSIONS = {
  receptionist: {
    allowedSections: ['dashboard', 'Booking Management', ...],
    allowedItems: ['/hotels/room-availability', ...]
  }
}
```

---

## Usage Examples

### Creating HMS Staff
Only `admin` and `vendor` roles can access `/hotels/hms-users`

### Login
Same login page for all users: `/login`
- System auto-detects which table to use
- No need to specify user type

### Navigation
- Automatically filtered based on logged-in user's role
- Hidden items are not accessible even via direct URL (if using RoleProtectedRoute)

### API Authorization
All API calls include JWT in header:
```
Authorization: Bearer <token>
```
Middleware extracts `userType` and queries appropriate table.

---

## Notes

1. **HMS users are hotel-specific** - They are assigned to `assigned_hotel_id`
2. **Vendors can have multiple hotels** - But HMS users belong to one hotel
3. **Admin override** - Admin role has `canAccessAll: true`
4. **Status fields differ** - `is_active` (users) vs `status` (hms_users)
5. **Navigation filtering is client-side** - Use RoleProtectedRoute for security

---

Last Updated: 2025-10-21
