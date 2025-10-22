# Stay View Test Data

This directory contains test data for the **Stay View** feature of the Travooz HMS system.

## 📋 Overview

The test data includes:
- **5 Room Types**: Standard Room, Deluxe Room, Family Suite, Executive Suite, Presidential Suite
- **12 Physical Rooms**: Distributed across 5 floors (inventory_id: 1-12)
- **16 Bookings**: With various statuses and dates (booking_id: 100-115)
- **Date Range**: Approximately 25 days (from 12 days ago to 14 days in the future)

## 📊 Booking Status Distribution

| Status | Count | Description |
|--------|-------|-------------|
| **Confirmed** | 10 | Paid bookings (past, current, and future) |
| **Pending** | 2 | Awaiting confirmation |
| **Completed** | 2 | Past stays that are finished |
| **Cancelled** | 2 | Cancelled and refunded bookings |

## 🏨 Room Inventory

### Floor 1 - Standard Rooms
- Room 101, 102, 103, 104 (50,000 RWF/night)

### Floor 2 - Deluxe Rooms
- Room 201, 202, 203 (75,000 RWF/night)

### Floor 3 - Family Suites
- Room 301, 302 (120,000 RWF/night)

### Floor 4 - Executive Suites
- Room 401, 402 (150,000 RWF/night)

### Floor 5 - Presidential Suite
- Room 501 (250,000 RWF/night)

## 🚀 Installation Methods

### Method 1: Using the Shell Script (Recommended)

```bash
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend/config
./load_test_data.sh
```

The script will:
1. Check if the SQL file exists
2. Test database connection
3. Show a summary of data to be loaded
4. Prompt for confirmation
5. Load the data into the database

### Method 2: Direct MySQL Import

```bash
cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend/config
mysql -u root -p travooz_hms < stay_view_test_data.sql
```

### Method 3: Using MySQL Workbench or phpMyAdmin

1. Open MySQL Workbench or phpMyAdmin
2. Select the `travooz_hms` database
3. Go to Import/Execute SQL
4. Select the file: `stay_view_test_data.sql`
5. Execute

## 📅 Sample Booking Timeline

Here's what you'll see in the Stay View:

```
Today's Date: [Current Date]

Room 101: [OCCUPIED] John Smith (Yesterday → +2 days)
          [CONFIRMED] Christopher Martin (+10 days → +13 days)

Room 102: [CONFIRMED] David Wilson (+2 days → +4 days)
          [CONFIRMED] Amanda Clark (+12 days → +14 days)

Room 103: [PENDING] Robert Taylor (+6 days → +7 days)

Room 104: [CANCELLED] Jennifer Lee (+1 day → +3 days)

Room 201: [OCCUPIED] Sarah Johnson (Today → +3 days)

Room 202: [PENDING] Lisa Martinez (+5 days → +7 days)

Room 203: [CONFIRMED] Maria Rodriguez (+8 days → +9 days)

Room 301: [CONFIRMED] Anderson Family (+3 days → +4 days)

Room 302: [CONFIRMED] Thompson Family (+4 days → +7 days)

Room 401: [COMPLETED] James Anderson (-8 days → -5 days)

Room 402: [CONFIRMED] Michael & Emma Brown (+1 day → +3 days)

Room 501: [CANCELLED] William Garcia (-3 days → -1 day)
          [CONFIRMED] Dr. Richard White (+7 days → +9 days)
```

## 🎨 Color Coding in Stay View

- 🟡 **Yellow**: Pending bookings
- 🟢 **Green**: Confirmed bookings
- 🔵 **Blue**: Completed bookings
- 🔴 **Red**: Cancelled bookings

## 🧪 Testing the Feature

1. **Start the backend server**:
   ```bash
   cd /home/nathanadmin/Projects/MOPAS/travooz_hms/backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd /home/nathanadmin/Projects/MOPAS/travooz_hms/frontend
   npm start
   ```

3. **Navigate to the homestay**:
   - Go to: `http://localhost:3000/hotels/homestays/1`
   - This will show the Urugero Hotel details page

4. **Open Stay View**:
   - Click the blue **"Stay View"** button (with calendar icon)
   - You'll see the timeline with all bookings

5. **Test interactions**:
   - Click on any booking bar to see detailed information
   - Use Previous/Next buttons to navigate through dates
   - Click "Today" to jump back to the current date
   - Scroll horizontally to see more dates

## 🔍 Verification Queries

After loading the data, you can verify it with these SQL queries:

```sql
-- Check room types
SELECT * FROM room_types WHERE homestay_id = 1;

-- Check room inventory
SELECT * FROM room_inventory 
WHERE room_type_id IN (SELECT room_type_id FROM room_types WHERE homestay_id = 1);

-- Check bookings
SELECT * FROM bookings WHERE booking_id BETWEEN 100 AND 115;

-- Check room bookings with details
SELECT 
    rb.booking_id,
    b.booking_reference,
    b.status,
    rb.guest_name,
    ri.unit_number as room_number,
    rb.check_in_date,
    rb.check_out_date,
    rb.nights
FROM room_bookings rb
JOIN bookings b ON rb.booking_id = b.booking_id
JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
WHERE rb.booking_id BETWEEN 100 AND 115
ORDER BY rb.check_in_date;
```

## 🗑️ Cleaning Up Test Data

If you want to remove the test data:

```sql
-- Remove room bookings
DELETE FROM room_bookings WHERE booking_id BETWEEN 100 AND 115;

-- Remove bookings
DELETE FROM bookings WHERE booking_id BETWEEN 100 AND 115;

-- Remove room inventory
DELETE FROM room_inventory WHERE inventory_id BETWEEN 1 AND 12;

-- Remove room types
DELETE FROM room_types WHERE room_type_id BETWEEN 1 AND 5;
```

## 📝 Notes

- The test data uses **homestay_id = 1** (Urugero Hotel)
- All dates are relative to `CURDATE()` so the data remains relevant
- Guest information is fictional but realistic
- Booking references follow the pattern: `TRV-000100` to `TRV-000115`
- All prices are in Rwandan Francs (RWF)

## 🐛 Troubleshooting

### Duplicate Key Errors
If you get duplicate key errors, it means the data already exists. You can either:
1. Clean up existing data first (see "Cleaning Up Test Data" section)
2. Modify the IDs in the SQL file

### Foreign Key Constraint Errors
Ensure that:
- The homestay with `homestay_id = 1` exists
- The user with `user_id = 4` exists
- The vendor with `vendor_id = 2` exists

### Data Not Showing in Stay View
Check:
1. Backend server is running
2. Frontend is running
3. You're logged in as the vendor who owns the homestay
4. The API endpoint `/api/homestays/1/stay-view` is accessible

## 📞 Support

If you encounter any issues with the test data, please check:
1. Database connection settings
2. Table structures match the schema
3. All required parent records exist
4. MySQL user has proper permissions

---

**Created for**: Travooz HMS - Stay View Feature  
**Version**: 1.0  
**Last Updated**: January 2025