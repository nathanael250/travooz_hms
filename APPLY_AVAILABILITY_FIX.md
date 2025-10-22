# How to Apply the Room Availability Fix

## 🎯 What This Fix Does

This fix resolves the critical issue where the availability endpoint and booking creation endpoint were returning inconsistent results. The problem was caused by a flawed database view that could only show ONE booking per room, causing rooms to appear available when they were actually fully booked.

## 📋 Prerequisites

- MySQL/MariaDB database access
- Database user with CREATE, DROP, and INDEX privileges
- Backup of your database (recommended)

---

## 🚀 Step-by-Step Application

### Step 1: Backup Your Database (IMPORTANT!)

```bash
# Create a backup before making changes
mysqldump -u your_user -p travooz_hms > travooz_hms_backup_$(date +%Y%m%d).sql
```

### Step 2: Connect to Your Database

```bash
mysql -u your_user -p travooz_hms
```

### Step 3: Run the Migration

```sql
-- Run the migration file
source /home/nathanadmin/Projects/MOPAS/travooz_hms/backend/migrations/fix_room_availability_view.sql
```

**OR** if you prefer to run it from the command line:

```bash
mysql -u your_user -p travooz_hms < /home/nathanadmin/Projects/MOPAS/travooz_hms/backend/migrations/fix_room_availability_view.sql
```

### Step 4: Verify the Migration

```sql
-- 1. Check that the function was created
SHOW FUNCTION STATUS WHERE Name = 'is_room_available';

-- 2. Check that the views were created
SHOW FULL TABLES WHERE Table_type = 'VIEW';
-- Should show: room_current_status_view, room_type_availability_summary

-- 3. Check that indexes were created
SHOW INDEX FROM room_bookings WHERE Key_name = 'idx_room_bookings_inventory_dates';
SHOW INDEX FROM room_inventory WHERE Key_name = 'idx_room_inventory_type_status';
SHOW INDEX FROM bookings WHERE Key_name = 'idx_bookings_status';

-- 4. Test the function
SELECT is_room_available(6, '2025-12-01', '2025-12-02') as is_available;
-- Should return 0 or 1

-- 5. Test the views
SELECT * FROM room_current_status_view LIMIT 5;
SELECT * FROM room_type_availability_summary LIMIT 5;
```

### Step 5: Restart Your Application (if needed)

```bash
# If using PM2
pm2 restart travooz-hms

# If using systemd
sudo systemctl restart travooz-hms

# If running manually
# Stop the current process and restart
node server.js
```

---

## ✅ Verification Tests

### Test 1: Check Function Works

```sql
-- Test with a known room and date range
SELECT 
    ri.inventory_id,
    ri.unit_number,
    is_room_available(ri.inventory_id, '2025-12-01', '2025-12-02') as is_available
FROM room_inventory ri
WHERE ri.room_type_id = 8
LIMIT 5;
```

### Test 2: Check Current Status View

```sql
-- Should show current status of all rooms
SELECT 
    inventory_id,
    unit_number,
    room_type,
    current_status,
    current_booking_checkin,
    current_booking_checkout
FROM room_current_status_view
WHERE homestay_id = 1
ORDER BY floor, unit_number;
```

### Test 3: Check Room Type Summary

```sql
-- Should show availability summary by room type
SELECT 
    room_type,
    homestay_name,
    total_rooms,
    available_rooms,
    occupied_rooms,
    reserved_rooms
FROM room_type_availability_summary
ORDER BY homestay_name, room_type;
```

### Test 4: Test Endpoint Consistency

```bash
# Test the availability endpoint
curl -X GET "http://localhost:3000/api/room-availability/available-rooms?room_type_id=8&check_in_date=2025-12-01&check_out_date=2025-12-02"

# Test booking creation with same parameters
curl -X POST "http://localhost:3000/api/room-bookings/create" \
  -H "Content-Type: application/json" \
  -d '{
    "room_type_id": 8,
    "check_in_date": "2025-12-01",
    "check_out_date": "2025-12-02",
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "guest_phone": "+250788123456",
    "number_of_adults": 2
  }'

# Both should return consistent results:
# - If availability shows 0 rooms, booking should fail
# - If availability shows N rooms, booking should succeed
```

---

## 🔍 Troubleshooting

### Issue 1: Function Already Exists Error

```sql
-- If you get "function already exists" error
DROP FUNCTION IF EXISTS is_room_available;
-- Then re-run the migration
```

### Issue 2: View Already Exists Error

```sql
-- If you get "view already exists" error
DROP VIEW IF EXISTS room_availability_view;
DROP VIEW IF EXISTS room_current_status_view;
DROP VIEW IF EXISTS room_type_availability_summary;
-- Then re-run the migration
```

### Issue 3: Index Already Exists Error

```sql
-- Check if indexes exist
SHOW INDEX FROM room_bookings;
SHOW INDEX FROM room_inventory;
SHOW INDEX FROM bookings;

-- If they exist with different names, that's OK
-- The migration uses IF NOT EXISTS so it won't fail
```

### Issue 4: Permission Denied

```sql
-- Grant necessary privileges
GRANT CREATE, DROP, INDEX, CREATE ROUTINE, ALTER ROUTINE ON travooz_hms.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 5: Endpoints Still Returning Wrong Data

**Check if the endpoint code was updated:**

```bash
# Check the availability endpoint
grep -A 20 "router.get('/available-rooms'" /home/nathanadmin/Projects/MOPAS/travooz_hms/backend/src/routes/roomAvailability.routes.js
```

**Should see:**
- Direct query on `room_inventory`
- `NOT EXISTS` subquery checking `room_bookings`
- Date overlap logic: `rb.check_in_date < ?` and `rb.check_out_date > ?`

**If not updated, the endpoint code needs to be fixed** (see `AVAILABILITY_ENDPOINT_FIX.md`)

---

## 📊 Performance Check

After applying the fix, check query performance:

```sql
-- Enable query profiling
SET profiling = 1;

-- Run a typical availability query
SELECT ri.inventory_id
FROM room_inventory ri
WHERE ri.room_type_id = 8
  AND ri.status = 'available'
  AND NOT EXISTS (
    SELECT 1 
    FROM room_bookings rb
    JOIN bookings b ON rb.booking_id = b.booking_id
    WHERE rb.inventory_id = ri.inventory_id
      AND b.status IN ('confirmed', 'pending', 'checked_in')
      AND rb.check_in_date < '2025-12-02'
      AND rb.check_out_date > '2025-12-01'
  );

-- Check the query time
SHOW PROFILES;

-- Should be under 100ms for most queries
-- If slower, check that indexes were created properly
```

---

## 🎉 Success Indicators

You'll know the fix is working when:

1. ✅ **Function exists:** `SHOW FUNCTION STATUS` shows `is_room_available`
2. ✅ **Views exist:** `SHOW FULL TABLES` shows the new views
3. ✅ **Indexes exist:** `SHOW INDEX` shows the performance indexes
4. ✅ **Endpoints consistent:** Availability and booking return same results
5. ✅ **No false positives:** Rooms with multiple bookings show correctly as unavailable
6. ✅ **Performance good:** Queries complete in under 100ms

---

## 📝 What Changed

### Database Objects Created:

1. **Function:** `is_room_available(inventory_id, check_in, check_out)`
   - Returns 1 if room is available, 0 if booked
   - Checks ALL bookings for the room
   - Uses correct date overlap logic

2. **View:** `room_current_status_view`
   - Shows current status of each room (TODAY only)
   - Safe to use for dashboard and current status displays
   - DO NOT use for date range checking

3. **View:** `room_type_availability_summary`
   - Shows availability summary by room type (TODAY only)
   - Useful for dashboard statistics
   - DO NOT use for date range checking

4. **Indexes:**
   - `idx_room_bookings_inventory_dates` - For fast date range queries
   - `idx_room_inventory_type_status` - For fast room type filtering
   - `idx_bookings_status` - For fast status filtering

### Database Objects Removed:

1. **View:** `room_availability_view` (the flawed one)
   - Dropped because it used LEFT JOIN
   - Could only show ONE booking per room
   - Caused false positives

---

## 🔗 Next Steps

After applying this fix:

1. **Test thoroughly** - Use the verification tests above
2. **Monitor performance** - Check query times in production
3. **Update other endpoints** - 6 other endpoints still use the old view (see `ROOM_AVAILABILITY_VIEW_ANALYSIS.md`)
4. **Update documentation** - Ensure team knows to use new views correctly

---

## 📚 Related Documentation

- `ROOM_AVAILABILITY_VIEW_FIX.md` - Complete technical documentation
- `AVAILABILITY_ENDPOINT_FIX.md` - Details of the endpoint fix
- `ROOM_AVAILABILITY_VIEW_ANALYSIS.md` - Analysis of all affected endpoints
- `BOOKING_AND_PAYMENT_FLOW.md` - Updated booking flow documentation
- `OVERBOOKING_PREVENTION.md` - Overbooking prevention strategy

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review the migration file: `backend/migrations/fix_room_availability_view.sql`
3. Check application logs for errors
4. Verify database connection and permissions
5. Restore from backup if needed: `mysql -u user -p travooz_hms < backup.sql`