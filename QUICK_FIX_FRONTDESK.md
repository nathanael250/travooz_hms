# ⚡ Quick Fix: "User is not associated with any hotel"

## Problem
```
Hotel manager gets error: "User is not associated with any hotel."
```

## Root Cause
Manager's `assigned_hotel_id` is NULL in database

## Solution (Pick One)

### 🚀 Fastest Way (Automated Script)
```bash
cd /home/nathanadmin/Projects/MOPAS/travooz_hms
./fix-hotel-assignment.sh
# Follow the prompts (2 minutes)
```

### 🔧 Manual API Way (3 commands)
```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login-hms \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","password":"admin123"}' | jq -r '.data.token')

# 2. Find users needing fix
curl -X GET http://localhost:3001/api/hms-users/diagnose/missing-hotel \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Apply fix (replace hotel_id with your hotel ID)
curl -X POST http://localhost:3001/api/hms-users/bulk/assign-hotel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": 1, "role": "manager"}'
```

### 📊 SQL Way (Direct Database)
```sql
-- See which users need fixing
SELECT hms_user_id, name, email, assigned_hotel_id FROM hms_users 
WHERE assigned_hotel_id IS NULL;

-- Fix all managers
UPDATE hms_users SET assigned_hotel_id = 1 
WHERE role = 'manager' AND assigned_hotel_id IS NULL;

-- Verify
SELECT * FROM hms_users WHERE role = 'manager';
```

## Verify It Works
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login-hms \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@hotel.com","password":"password"}' | jq -r '.data.token')

curl -X GET http://localhost:3001/api/front-desk/checkouts \
  -H "Authorization: Bearer $TOKEN"
```

✅ Should see: `{"success": true, "data": {"total": 0, "checkouts": []}}`

## Files Updated
- ✅ `hmsUser.controller.js` - Added diagnostic functions
- ✅ `hmsUser.routes.js` - Added API endpoints
- ✅ Created fix script + guides

## Next Time
When creating HMS users, always include `assigned_hotel_id`:
```bash
curl -X POST http://localhost:3001/api/hms-users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager Name",
    "email": "manager@hotel.com",
    "password": "password",
    "role": "manager",
    "assigned_hotel_id": 1
  }'
```

---

📖 **For detailed info:** See `FRONTDESK_ACCESS_FIX.md` or `FRONTDESK_ACCESS_ISSUE_SUMMARY.md`