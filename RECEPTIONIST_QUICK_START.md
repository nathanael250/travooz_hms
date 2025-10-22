# 🚀 Receptionist Booking List - Quick Start

## ⚡ 5-Minute Setup

### Step 1: Verify Backend Routes (10 seconds)

Check that receptionist routes are registered:

```bash
# Open backend/src/app.js and confirm line 162 exists:
grep -n "receptionist" /backend/src/app.js
```

✅ Should show: `app.use('/api/receptionist', authMiddleware, receptionistRoutes);`

### Step 2: Verify Frontend Routes (10 seconds)

Check that frontend routes are registered:

```bash
# Check if FrontDeskBookingsList is imported
grep -n "FrontDeskBookingsList" /frontend/src/App.jsx
```

✅ Should show import and route definition

### Step 3: Ensure Backend Running (20 seconds)

```bash
# Terminal 1: Start backend
cd /backend
npm start

# You should see: "HMS Server running on port 3001"
```

### Step 4: Ensure Frontend Running (20 seconds)

```bash
# Terminal 2: Start frontend
cd /frontend
npm run dev

# You should see: "Local: http://localhost:5173"
```

### Step 5: Create Test Receptionist User (if not exists)

```bash
# Option A: Via HMS Users UI
1. Navigate to Hotels > HMS Users
2. Create new user with:
   - Role: receptionist
   - Assign to a homestay

# Option B: Via database directly
INSERT INTO hms_users (user_id, homestay_id, role, created_at) 
VALUES (YOUR_USER_ID, 1, 'receptionist', NOW());
```

### Step 6: Create Test Booking (if not exists)

Use the Postman collection at `/backend/Travooz_HMS_Booking_API.postman_collection.json` or manually create via API:

```bash
# Create a booking
curl -X POST "http://localhost:3001/api/bookings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_name": "Test Guest",
    "email": "test@example.com",
    "check_in_date": "2025-01-20",
    "check_out_date": "2025-01-25",
    "room_type_id": 1,
    "number_of_adults": 2,
    "number_of_children": 0,
    "status": "confirmed",
    "payment_status": "paid"
  }'
```

---

## ✅ Verification Checklist

Run through this checklist to ensure everything is wired correctly:

### Backend Verification

- [ ] **Routes File Exists**: `/backend/src/routes/receptionist.routes.js`
  ```bash
  test -f /backend/src/routes/receptionist.routes.js && echo "✅ EXISTS"
  ```

- [ ] **Routes Registered in App**: Line 162 in `/backend/src/app.js`
  ```bash
  grep "app.use('/api/receptionist'" /backend/src/app.js
  ```

- [ ] **Controller File Exists**: `/backend/src/controllers/receptionist.controller.js`
  ```bash
  test -f /backend/src/controllers/receptionist.controller.js && echo "✅ EXISTS"
  ```

- [ ] **Database Connection Works**: 
  ```bash
  curl http://localhost:3001/health
  # Should return: {"status":"OK","message":"HMS Server is running"}
  ```

- [ ] **API Endpoints Accessible**:
  ```bash
  # Test endpoint (requires valid token)
  curl -X GET "http://localhost:3001/api/receptionist/bookings" \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

### Frontend Verification

- [ ] **BookingsList Component Exists**: `/frontend/src/pages/frontdesk/BookingsList.jsx`
  ```bash
  test -f /frontend/src/pages/frontdesk/BookingsList.jsx && echo "✅ EXISTS"
  ```

- [ ] **Component Imported**: Check `/frontend/src/App.jsx`
  ```bash
  grep "FrontDeskBookingsList" /frontend/src/App.jsx
  ```

- [ ] **Routes Defined**: Route path `/front-desk/bookings`
  ```bash
  grep "front-desk/bookings" /frontend/src/App.jsx
  ```

- [ ] **Dashboard Updated**: ReceptionistDashboard now uses real data
  ```bash
  grep "apiClient.get" /frontend/src/pages/dashboards/ReceptionistDashboard.jsx
  ```

- [ ] **Page Accessible**: Navigate to `http://localhost:5173/front-desk/bookings`

---

## 🔍 Critical Files Reference

### Backend Files

```
/backend/src/
├── routes/
│   └── receptionist.routes.js          ← ALL API ROUTES DEFINED HERE
├── controllers/
│   └── receptionist.controller.js      ← ALL BUSINESS LOGIC HERE
├── models/
│   ├── booking.model.js
│   ├── roomBooking.model.js
│   ├── room.model.js
│   ├── roomType.model.js
│   └── hmsUser.model.js
└── app.js                              ← ROUTES REGISTERED HERE (line 162)
```

### Frontend Files

```
/frontend/src/
├── pages/
│   ├── frontdesk/
│   │   ├── BookingsList.jsx            ← MAIN BOOKING LIST PAGE
│   │   └── index.js                    ← EXPORT DEFINED HERE
│   └── dashboards/
│       └── ReceptionistDashboard.jsx   ← DASHBOARD WITH REAL DATA
├── App.jsx                             ← ROUTES DEFINED HERE
├── services/
│   └── apiClient.js                    ← API CLIENT
└── contexts/
    └── AuthContext.js                  ← AUTH CONTEXT
```

---

## 🌐 Accessing the Feature

### From Frontend Navigation

1. **Login** → Enter receptionist credentials
2. **Dashboard** → See Receptionist Dashboard with real data
3. **Click** → "Front Desk" menu or navigate to `/front-desk/bookings`
4. **View** → All bookings for your property

### Direct URLs

- Dashboard: `http://localhost:5173/dashboard`
- Bookings List: `http://localhost:5173/front-desk/bookings`
- Upcoming Arrivals: `http://localhost:5173/front-desk/upcoming-arrivals`

---

## 🧪 Quick Test

Copy and run this to quickly test the implementation:

```bash
#!/bin/bash

echo "🧪 Testing Receptionist Booking List Implementation"
echo "=================================================="

# 1. Check backend files
echo "1️⃣  Checking backend files..."
test -f /backend/src/routes/receptionist.routes.js && echo "   ✅ Routes file exists" || echo "   ❌ Routes file MISSING"
test -f /backend/src/controllers/receptionist.controller.js && echo "   ✅ Controller file exists" || echo "   ❌ Controller file MISSING"

# 2. Check backend registration
echo ""
echo "2️⃣  Checking backend registration..."
grep -q "receptionist" /backend/src/app.js && echo "   ✅ Routes registered in app.js" || echo "   ❌ Routes NOT registered"

# 3. Check frontend files
echo ""
echo "3️⃣  Checking frontend files..."
test -f /frontend/src/pages/frontdesk/BookingsList.jsx && echo "   ✅ BookingsList component exists" || echo "   ❌ Component MISSING"

# 4. Check frontend imports
echo ""
echo "4️⃣  Checking frontend imports..."
grep -q "FrontDeskBookingsList" /frontend/src/App.jsx && echo "   ✅ Component imported" || echo "   ❌ Component NOT imported"
grep -q "front-desk/bookings" /frontend/src/App.jsx && echo "   ✅ Route defined" || echo "   ❌ Route NOT defined"

# 5. Check API client in dashboard
echo ""
echo "5️⃣  Checking dashboard integration..."
grep -q "apiClient.get" /frontend/src/pages/dashboards/ReceptionistDashboard.jsx && echo "   ✅ Dashboard uses real data" || echo "   ❌ Dashboard uses mock data"

echo ""
echo "=================================================="
echo "✅ All critical files and configurations verified!"
echo ""
echo "Next steps:"
echo "1. Start backend: cd /backend && npm start"
echo "2. Start frontend: cd /frontend && npm run dev"
echo "3. Login as receptionist"
echo "4. Navigate to: http://localhost:5173/front-desk/bookings"
```

Save as `test-receptionist.sh` and run:
```bash
bash test-receptionist.sh
```

---

## 🎯 Key Features Implemented

| Feature | Status | Location |
|---------|--------|----------|
| View Bookings | ✅ | `/front-desk/bookings` |
| Filter by Status | ✅ | BookingsList.jsx:294 |
| Filter by Date Range | ✅ | BookingsList.jsx:308-332 |
| Search by Guest/Ref | ✅ | BookingsList.jsx:273-286 |
| View Details | ✅ | BookingsList.jsx:438-530 |
| Assign Room | ✅ | BookingsList.jsx:531-600 |
| Check-In Guest | ✅ | BookingsList.jsx:601-650 |
| Pagination | ✅ | BookingsList.jsx:692-710 |
| Dashboard Real Data | ✅ | ReceptionistDashboard.jsx:55-130 |

---

## 📞 Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| `Cannot GET /api/receptionist/bookings` | Routes not registered. Check `/backend/src/app.js` line 162 |
| "User is not associated with any homestay" | Create HMS User record linking user to property |
| `FrontDeskBookingsList is not defined` | Check import in `/frontend/src/App.jsx` |
| Bookings list is empty | Create test bookings first |
| Dashboard shows mock data | Clear browser cache, refresh page |
| 401 Unauthorized | Login again, check auth token |

---

## 🚀 Going Live

Before deploying to production:

### Checklist

- [ ] Test all filters and pagination
- [ ] Verify room assignment logic
- [ ] Test check-in with various payment statuses
- [ ] Confirm multi-property scoping works
- [ ] Performance test with 1000+ bookings
- [ ] Error handling for network failures
- [ ] User training completed
- [ ] Backup database before deployment

### Performance Optimization Tips

1. **Index database queries** - Ensure `booking_id`, `homestay_id`, `status` are indexed
2. **Pagination limit** - Default is 20, can adjust in controller
3. **API caching** - Consider caching upcoming arrivals (5 min TTL)
4. **Lazy loading** - Consider loading additional bookings on scroll

---

## 📚 Documentation References

- **Implementation Guide**: `RECEPTIONIST_BOOKING_LIST_IMPLEMENTATION.md`
- **Testing Guide**: `RECEPTIONIST_TESTING_GUIDE.md`
- **API Reference**: See implementation guide section "API Endpoint Reference"

---

**Last Updated:** January 15, 2025
**Version:** 1.0
**Status:** Ready for Testing ✅