# ✅ Fix: Hotel Manager Front Desk Access Issue

## Problem
When hotel managers try to access Front Desk features (Check-Outs, Check-Ins, etc.), they get:
```json
{"success":false,"message":"User is not associated with any hotel."}
```

## Root Cause
The hotel manager's `assigned_hotel_id` field in the `hms_users` table is **NULL** or **0**.

All Front Desk operations require:
- ✅ Valid JWT token (user is authenticated)
- ✅ **`assigned_hotel_id` must be set** (user is assigned to a hotel)

---

## Solution: 3-Step Fix

### Step 1: Identify Users with Missing Hotel Assignment

**Using the API:**
```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login-hms \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","password":"password"}' | jq -r '.data.token')

# Check which users are missing hotel assignment
curl -X GET http://localhost:3001/api/hms-users/diagnose/missing-hotel \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "message": "HMS Users with missing hotel assignment",
  "count": 2,
  "data": [
    {
      "hms_user_id": 1,
      "name": "John Manager",
      "email": "manager@hotel.com",
      "role": "manager",
      "assigned_hotel_id": null,
      "status": "active",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Step 2: Find the Hotel ID

You need to know which hotel to assign the user to. Check the homestays table:

**Using the API:**
```bash
curl -X GET http://localhost:3001/api/homestays \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {homestay_id, name}'
```

**Or directly in database:**
```sql
SELECT homestay_id, name FROM homestays;
```

**Example output:**
```
homebay_id | name
-----------|-------------------
1          | Grand Hotel
2          | Sunset Resort
3          | Downtown Inn
```

### Step 3: Fix the Assignment

**Option A: Fix Individual User (via API)**

```bash
curl -X PUT http://localhost:3001/api/hms-users/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigned_hotel_id": 1
  }'
```

**Expected Response:**
```json
{
  "message": "HMS User updated successfully",
  "data": {
    "hms_user_id": 1,
    "name": "John Manager",
    "email": "manager@hotel.com",
    "role": "manager",
    "assigned_hotel_id": 1,
    "status": "active"
  }
}
```

**Option B: Fix All Managers in One Hotel (via API)**

```bash
curl -X POST http://localhost:3001/api/hms-users/bulk/assign-hotel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_id": 1,
    "role": "manager"
  }'
```

**Expected Response:**
```json
{
  "message": "Successfully assigned hotel 1 to 3 users",
  "affectedRows": 3,
  "hotelId": 1,
  "role": "manager"
}
```

**Option C: Direct Database Update (SQL)**

```sql
-- Fix specific manager
UPDATE hms_users 
SET assigned_hotel_id = 1 
WHERE hms_user_id = 1;

-- Fix all managers missing hotel assignment
UPDATE hms_users 
SET assigned_hotel_id = 1 
WHERE role = 'manager' AND (assigned_hotel_id IS NULL OR assigned_hotel_id = 0);

-- Fix all staff missing hotel assignment (all roles)
UPDATE hms_users 
SET assigned_hotel_id = 1 
WHERE assigned_hotel_id IS NULL OR assigned_hotel_id = 0;
```

---

## Verification

After fixing, verify the change:

**1. Check Database:**
```sql
SELECT hms_user_id, name, email, role, assigned_hotel_id 
FROM hms_users 
WHERE email = 'manager@hotel.com';
```

Should show: `assigned_hotel_id = 1` (not NULL)

**2. Test Front Desk Access:**
```bash
# Login with the manager account
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login-hms \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@hotel.com","password":"password"}' | jq -r '.data.token')

# Try to fetch check-outs
curl -X GET http://localhost:3001/api/front-desk/checkouts \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Success Response (should see check-outs list, even if empty):**
```json
{
  "success": true,
  "data": {
    "total": 0,
    "checkouts": []
  }
}
```

❌ **Still failing?** Should NOT see the "User is not associated with any hotel" error anymore

---

## What Was Changed (Code Updates)

### 1. HMS User Controller - `updateHMSUser`
- ✅ Now accepts `assigned_hotel_id` parameter
- ✅ Can now update a user's hotel assignment
- ✅ Returns `assigned_hotel_id` in response

### 2. HMS User Controller - New Endpoints
- ✅ `diagnoseMissingHotelAssignment()` - Find users with missing assignments
- ✅ `bulkAssignHotel()` - Assign multiple users to a hotel in one operation

### 3. HMS User Routes
- ✅ `GET /api/hms-users/diagnose/missing-hotel` - Diagnostic endpoint
- ✅ `POST /api/hms-users/bulk/assign-hotel` - Bulk fix endpoint

---

## Prevention: Ensure Hotel Assignment on User Creation

When creating new HMS users, **always provide `assigned_hotel_id`**:

```bash
curl -X POST http://localhost:3001/api/hms-users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Receptionist",
    "email": "jane@hotel.com",
    "password": "securePassword123",
    "role": "receptionist",
    "assigned_hotel_id": 1,
    "phone": "555-0123"
  }'
```

The `assigned_hotel_id` is **required** and cannot be NULL.

---

## Quick Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Front Desk access denied | `assigned_hotel_id` is NULL | Update user with valid hotel ID |
| Multiple users affected | Bulk creation without hotel ID | Use bulk assign endpoint |
| Same issue for other roles | Staff not assigned to hotel | Same fix works for all roles |

---

## Need Help?

1. **Check current status:**
   ```bash
   curl -X GET http://localhost:3001/api/hms-users/diagnose/missing-hotel \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **View all HMS users:**
   ```bash
   curl -X GET http://localhost:3001/api/hms-users \
     -H "Authorization: Bearer $TOKEN"
   ```

3. **View user details:**
   ```bash
   curl -X GET http://localhost:3001/api/hms-users/1 \
     -H "Authorization: Bearer $TOKEN"
   ```