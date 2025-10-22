# Dual Authentication System - Implementation Guide

## Overview

The Travooz HMS now supports **dual-table authentication** with role-based access control (RBAC). Users can log in from either the `users` table (Admin/Vendor/Client) or the `hms_users` table (Hotel Staff), and are automatically redirected to role-appropriate dashboards with filtered navigation based on their permissions.

## Architecture

### Database Tables

1. **`users` table** - Main system users
   - `admin` - Full system access
   - `vendor` - Hotel owners/managers who manage properties
   - `client` - Customers who book hotels

2. **`hms_users` table** - Hotel staff members
   - `manager` - Hotel manager
   - `receptionist` - Front desk staff
   - `housekeeping` - Housekeeping staff
   - `maintenance` - Maintenance staff
   - `restaurant` - Restaurant/kitchen staff
   - `inventory` - Inventory/stock management staff
   - `accountant` - Finance/accounting staff

### Authentication Flow

```
Login Request (email + password)
        ↓
1. Check `users` table
   - Found? → Validate password → Generate token (userType: 'regular')
        ↓
2. Check `hms_users` table
   - Found? → Validate password → Generate token (userType: 'hms')
        ↓
3. Not found in either → Return error
        ↓
4. Return user data + JWT token (includes userType)
        ↓
5. Frontend stores token, redirects to dashboard
        ↓
6. Navigation filtered by role
```

## Implementation Details

### Backend Changes

#### 1. Auth Service ([auth.service.js:92-163](backend/src/services/auth.service.js#L92-L163))

The login method now:
- Searches `users` table first
- If not found, searches `hms_users` table
- Adds `userType` field to user response
- Generates tokens with `userType` payload

```javascript
// Token includes userType
{
  id: user.user_id || user.hms_user_id,
  email: user.email,
  role: user.role,
  userType: 'regular' | 'hms'  // ← This is key!
}
```

#### 2. Auth Middleware ([auth.middleware.js](backend/src/middlewares/auth.middleware.js))

Updated to:
- Extract `userType` from JWT token
- Query appropriate table based on `userType`
- Check appropriate status field (`is_active` for users, `status` for hms_users)
- Attach both `req.user` and `req.userType` for downstream use

#### 3. getProfile Method ([auth.service.js:164-182](backend/src/services/auth.service.js#L164-L182))

Now accepts `userType` parameter:
```javascript
async getProfile(userId, userType = 'regular')
```

#### 4. HMS User Model ([hmsUser.model.js:27](backend/src/models/hmsUser.model.js#L27))

Added 'inventory' role to match database schema:
```javascript
role: {
  type: DataTypes.ENUM('manager', 'receptionist', 'housekeeping', 'maintenance', 'restaurant', 'inventory', 'accountant'),
  allowNull: false
}
```

### Frontend Changes

#### 1. Role Permissions Configuration ([rolePermissions.js](frontend/src/config/rolePermissions.js))

Defines what each role can access:

**Regular Users:**
- `admin`: Full access to everything
- `vendor`: All hotel management features
- `client`: Limited to bookings and guest features

**HMS Users:**
- `manager`: Most sections except HMS user management
- `receptionist`: Front desk, bookings, guest management
- `housekeeping`: Housekeeping tasks and room status
- `maintenance`: Maintenance requests
- `restaurant`: Restaurant and kitchen features
- `inventory`: Stock management
- `accountant`: Financial reports and billing

#### 2. Sidebar Component ([Sidebar.jsx:169-171](frontend/src/components/Sidebar.jsx#L169-L171))

Navigation is now filtered based on user role:
```javascript
const navigation = user?.role ? filterNavigationByRole(allNavigation, user.role) : allNavigation;
```

#### 3. RoleProtectedRoute Component ([RoleProtectedRoute.jsx](frontend/src/components/RoleProtectedRoute.jsx))

New component for route-level protection:
```jsx
<RoleProtectedRoute requiredSection="Hotel Management">
  <HMSUsers />
</RoleProtectedRoute>
```

## Usage Instructions

### Creating HMS Users

Only admins and vendors can create HMS users through the HMS User Management interface at `/hotels/hms-users`.

**Required Fields:**
- Name
- Email (must be unique)
- Password (min 6 characters)
- Role (manager, receptionist, housekeeping, etc.)
- Assigned Hotel ID (automatically set to selected hotel)

**Example:**
```bash
POST /api/hms-users
{
  "name": "John Receptionist",
  "email": "john@hotel.com",
  "password": "password123",
  "role": "receptionist",
  "assigned_hotel_id": 1,
  "phone": "+1234567890"
}
```

### Login Process

1. User enters email and password on `/login` page
2. System checks both `users` and `hms_users` tables
3. On success:
   - JWT token stored in localStorage as `hms_token`
   - User object includes `userType` field
   - Redirected to `/dashboard`
4. Navigation automatically filtered based on role

**Test Login Credentials:**

*Regular User (Admin):*
- Check your database for admin user

*HMS User (Create one first):*
- Email: As created via HMS User Management
- Password: As set during creation

### Role-Based Access Control

#### Navigation Filtering

The sidebar automatically hides sections/items the user cannot access:

```javascript
// Receptionist will only see:
- Dashboard
- Booking Management
- Guest Management
- Front Desk
- Selected Hotel Management items (Room Availability, Room Status, Room Inventory)
```

#### Route Protection (Optional)

For additional security, wrap routes with `RoleProtectedRoute`:

```jsx
import { RoleProtectedRoute } from './components/RoleProtectedRoute';

<Route path="hotels/hms-users" element={
  <RoleProtectedRoute requiredSection="Hotel Management">
    <HMSUsers />
  </RoleProtectedRoute>
} />
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (checks both tables)
- `POST /api/auth/register` - Register regular user
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout

### HMS User Management
- `POST /api/hms-users` - Create HMS user (Admin/Vendor only)
- `GET /api/hms-users` - List HMS users
- `GET /api/hms-users/:id` - Get single HMS user
- `PUT /api/hms-users/:id` - Update HMS user
- `POST /api/hms-users/:id/change-password` - Change password
- `DELETE /api/hms-users/:id` - Delete HMS user

## Security Considerations

1. **JWT Tokens**: Include `userType` to prevent privilege escalation
2. **Middleware**: Always checks appropriate table based on `userType`
3. **Status Checking**:
   - Regular users: `is_active` must be true
   - HMS users: `status` must be 'active'
4. **Password Hashing**: bcrypt with salt rounds = 12
5. **Frontend Filtering**: Navigation hidden (but routes should also be protected)
6. **Backend Validation**: All HMS user operations verify permissions

## Troubleshooting

### Issue: HMS user can't login
**Check:**
1. User exists in `hms_users` table
2. `status` field is 'active'
3. `assigned_hotel_id` is valid
4. Password is correct

### Issue: User sees wrong navigation items
**Check:**
1. User `role` field is correctly set
2. Role exists in [rolePermissions.js](frontend/src/config/rolePermissions.js)
3. Frontend has been rebuilt (`npm run build`)

### Issue: "Invalid token" error
**Check:**
1. Token includes `userType` field
2. Backend middleware is updated
3. User still exists and is active in database

## Testing Checklist

- [ ] Admin can create HMS users
- [ ] HMS users can login
- [ ] Regular users can login
- [ ] Each role sees correct navigation items
- [ ] Receptionist cannot access Admin features
- [ ] Housekeeping staff only sees Housekeeping menu
- [ ] Manager sees most features
- [ ] Tokens work for both user types
- [ ] Password changes work for HMS users
- [ ] User deactivation prevents login

## Future Enhancements

1. **Dashboard Customization**: Different dashboard layouts per role
2. **Permission Granularity**: Add action-level permissions (view, create, edit, delete)
3. **Hotel-Specific Access**: HMS users only see data for their assigned hotel
4. **Audit Logging**: Track all actions by HMS users
5. **Multi-Hotel Support**: Managers can be assigned to multiple hotels

## Files Modified

### Backend
- [backend/src/services/auth.service.js](backend/src/services/auth.service.js)
- [backend/src/middlewares/auth.middleware.js](backend/src/middlewares/auth.middleware.js)
- [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js)
- [backend/src/models/hmsUser.model.js](backend/src/models/hmsUser.model.js)

### Frontend
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
- [frontend/src/config/rolePermissions.js](frontend/src/config/rolePermissions.js) *(NEW)*
- [frontend/src/components/RoleProtectedRoute.jsx](frontend/src/components/RoleProtectedRoute.jsx) *(NEW)*

## Summary

The dual authentication system is now fully implemented with:
✅ Single login page for all user types
✅ Automatic table detection (users vs hms_users)
✅ Role-based navigation filtering
✅ JWT tokens with userType field
✅ Middleware support for both user types
✅ Inventory role support
✅ Optional route-level protection

Users from both tables can now seamlessly log in and access features appropriate to their role!
