# ✅ Deployment Checklist - Housekeeping Module & Booking Flow

## Pre-Deployment Verification

Use this checklist to ensure everything is ready for production deployment.

---

## 🗄️ Database Verification

### Tables Exist
- [ ] `housekeeping_tasks` table exists
- [ ] `bookings` table exists
- [ ] `room_bookings` table exists
- [ ] `booking_guests` table exists
- [ ] `guest_profiles` table exists
- [ ] `payment_transactions` table exists
- [ ] `room_availability` table exists
- [ ] `room_inventory` table exists
- [ ] `room_types` table exists
- [ ] `homestays` table exists

### Sample Data
- [ ] At least one homestay exists
- [ ] At least one room type exists
- [ ] At least one room in inventory
- [ ] Room availability records exist
- [ ] At least one user account (for testing)

### Verification Query
```sql
-- Run this to verify all tables
SELECT 
  'housekeeping_tasks' as table_name, COUNT(*) as count FROM housekeeping_tasks
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'room_bookings', COUNT(*) FROM room_bookings
UNION ALL
SELECT 'guest_profiles', COUNT(*) FROM guest_profiles
UNION ALL
SELECT 'payment_transactions', COUNT(*) FROM payment_transactions
UNION ALL
SELECT 'room_availability', COUNT(*) FROM room_availability
UNION ALL
SELECT 'room_inventory', COUNT(*) FROM room_inventory
UNION ALL
SELECT 'room_types', COUNT(*) FROM room_types
UNION ALL
SELECT 'homestays', COUNT(*) FROM homestays;
```

---

## 🔧 Backend Verification

### API Endpoints Working
- [ ] `GET /api/housekeeping/tasks` - List tasks
- [ ] `POST /api/housekeeping/tasks` - Create task
- [ ] `PUT /api/housekeeping/tasks/:id` - Update task
- [ ] `DELETE /api/housekeeping/tasks/:id` - Delete task
- [ ] `PATCH /api/housekeeping/tasks/:id/assign` - Assign task
- [ ] `PATCH /api/housekeeping/tasks/:id/start` - Start task
- [ ] `PATCH /api/housekeeping/tasks/:id/complete` - Complete task
- [ ] `GET /api/housekeeping/dashboard` - Dashboard stats
- [ ] `GET /api/housekeeping/my-tasks` - Staff tasks
- [ ] `GET /api/room-availability/calendar` - Room availability
- [ ] `POST /api/room-bookings` - Create booking
- [ ] `POST /api/guest-profiles` - Create guest
- [ ] `POST /api/payment-transactions` - Record payment

### Test Commands
```bash
# Test housekeeping endpoints
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/housekeeping/tasks
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/housekeeping/dashboard

# Test booking endpoints
curl -H "Authorization: Bearer TOKEN" "http://localhost:3001/api/room-availability/calendar?start_date=2025-02-01&end_date=2025-02-05"
```

### Server Configuration
- [ ] Backend server starts without errors
- [ ] Database connection successful
- [ ] JWT authentication working
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Port 3001 accessible

---

## 🎨 Frontend Verification

### Components Load
- [ ] `/housekeeping/dashboard` loads without errors
- [ ] `/housekeeping/tasks` loads without errors
- [ ] `/housekeeping/my-tasks` loads without errors
- [ ] No console errors in browser
- [ ] All icons display correctly
- [ ] Styling looks correct

### Functionality Works
- [ ] Can create a new task
- [ ] Can edit existing task
- [ ] Can delete a task
- [ ] Can assign task to staff
- [ ] Can start a task
- [ ] Can complete a task
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Dashboard shows statistics
- [ ] Staff performance displays

### Responsive Design
- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## 🧪 Testing

### Automated Tests
- [ ] Run `./test-booking-flow.sh` successfully
- [ ] All tests pass
- [ ] No errors in output
- [ ] Database records created correctly

### Manual Testing - Housekeeping

#### Create Task Flow
- [ ] Navigate to `/housekeeping/tasks`
- [ ] Click "Create Task"
- [ ] Select homestay
- [ ] Select room (loads dynamically)
- [ ] Select task type
- [ ] Set priority
- [ ] Set scheduled date
- [ ] Add notes
- [ ] Submit form
- [ ] Task appears in list
- [ ] Database record created

#### Assign Task Flow
- [ ] Find pending task
- [ ] Click "Assign" button
- [ ] Select staff member
- [ ] Confirm assignment
- [ ] Task status changes to "assigned"
- [ ] Database updated

#### Complete Task Flow
- [ ] Go to `/housekeeping/my-tasks`
- [ ] Find assigned task
- [ ] Click "Start Task"
- [ ] Timer starts
- [ ] Click "Complete"
- [ ] Rate quality (1-5 stars)
- [ ] Add completion notes
- [ ] Submit
- [ ] Task status changes to "completed"
- [ ] Duration calculated correctly

### Manual Testing - Booking Flow

#### Browse Rooms
- [ ] Search for available rooms
- [ ] Filter by date range
- [ ] Filter by homestay
- [ ] Results display correctly
- [ ] Room details show

#### Create Booking
- [ ] Select a room
- [ ] Enter guest information
- [ ] Set check-in/check-out dates
- [ ] Review pricing
- [ ] Confirm booking
- [ ] Booking reference generated
- [ ] Database records created

#### Process Payment
- [ ] Enter payment details
- [ ] Select payment method
- [ ] Submit payment
- [ ] Payment recorded
- [ ] Booking status updated
- [ ] Confirmation displayed

---

## 🔐 Security Verification

### Authentication
- [ ] JWT tokens required for protected routes
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected
- [ ] Role-based access control working

### Authorization
- [ ] Admin can access all features
- [ ] Vendor sees only their homestays
- [ ] Staff sees only assigned tasks
- [ ] Guests cannot access housekeeping

### Data Validation
- [ ] Required fields enforced
- [ ] Email format validated
- [ ] Phone number format validated
- [ ] Date ranges validated
- [ ] Amount calculations validated
- [ ] SQL injection prevented
- [ ] XSS attacks prevented

---

## 📊 Performance Verification

### Response Times
- [ ] Room search < 500ms
- [ ] Task list load < 1 second
- [ ] Dashboard load < 2 seconds
- [ ] Booking creation < 3 seconds
- [ ] Payment processing < 3 seconds

### Load Testing
- [ ] 10 concurrent users
- [ ] 50 concurrent users
- [ ] 100 concurrent users
- [ ] No database deadlocks
- [ ] No memory leaks

---

## 📝 Documentation

### Files Complete
- [ ] `HOUSEKEEPING_QUICK_START.md` exists
- [ ] `BOOKING_FLOW_TEST_GUIDE.md` exists
- [ ] `BOOKING_FLOW_DIAGRAM.md` exists
- [ ] `IMPLEMENTATION_SUMMARY.md` exists
- [ ] `README_HOUSEKEEPING_AND_BOOKING.md` exists
- [ ] `DEPLOYMENT_CHECKLIST.md` (this file) exists
- [ ] `test-booking-flow.sh` exists and is executable

### Code Documentation
- [ ] Component files have comments
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] Environment variables documented

---

## 🚀 Deployment Steps

### 1. Backup Current System
```bash
# Backup database
mysqldump -u root -p travooz_hms > backup_$(date +%Y%m%d).sql

# Backup code
tar -czf code_backup_$(date +%Y%m%d).tar.gz /path/to/travooz_hms
```

### 2. Deploy Backend
```bash
cd backend
git pull origin main
npm install
npm run build  # if applicable
pm2 restart travooz-backend  # or your process manager
```

### 3. Deploy Frontend
```bash
cd frontend
git pull origin main
npm install
npm run build
# Copy build folder to web server
```

### 4. Run Database Migrations
```bash
mysql -u root -p travooz_hms < migrations/create_housekeeping_tasks_table.sql
# Run any other pending migrations
```

### 5. Verify Deployment
```bash
# Test backend
curl http://your-domain.com/api/health

# Test frontend
curl http://your-domain.com

# Run automated tests
./test-booking-flow.sh
```

### 6. Monitor Logs
```bash
# Backend logs
pm2 logs travooz-backend

# Frontend logs (if applicable)
pm2 logs travooz-frontend

# Database logs
tail -f /var/log/mysql/error.log
```

---

## 🔍 Post-Deployment Verification

### Smoke Tests
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays
- [ ] Housekeeping pages accessible
- [ ] Can create a test task
- [ ] Can create a test booking
- [ ] No errors in logs

### User Acceptance Testing
- [ ] Admin can manage all tasks
- [ ] Vendor can manage their tasks
- [ ] Staff can view assigned tasks
- [ ] Guests can make bookings
- [ ] Payments process correctly

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors
- [ ] Monitor database performance

---

## 🐛 Rollback Plan

### If Issues Occur

1. **Stop Services**
   ```bash
   pm2 stop travooz-backend
   pm2 stop travooz-frontend
   ```

2. **Restore Database**
   ```bash
   mysql -u root -p travooz_hms < backup_YYYYMMDD.sql
   ```

3. **Restore Code**
   ```bash
   tar -xzf code_backup_YYYYMMDD.tar.gz
   ```

4. **Restart Services**
   ```bash
   pm2 start travooz-backend
   pm2 start travooz-frontend
   ```

5. **Verify Rollback**
   - Test critical functionality
   - Check logs for errors
   - Notify users if needed

---

## 📞 Support Contacts

### Technical Team
- Backend Developer: [Contact Info]
- Frontend Developer: [Contact Info]
- Database Admin: [Contact Info]
- DevOps Engineer: [Contact Info]

### Escalation Path
1. Check documentation
2. Review logs
3. Contact technical team
4. Escalate to senior developer
5. Emergency rollback if critical

---

## ✅ Final Checklist

### Before Going Live
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Backup created
- [ ] Team notified
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Support team briefed

### After Going Live
- [ ] Monitor for 1 hour
- [ ] Check error logs
- [ ] Verify user feedback
- [ ] Document any issues
- [ ] Update documentation if needed

---

## 📈 Success Criteria

### Technical Metrics
- ✅ 99.9% uptime
- ✅ < 2 second average response time
- ✅ 0 critical errors
- ✅ 0 data loss incidents
- ✅ 100% test coverage

### Business Metrics
- ✅ Users can create tasks
- ✅ Users can make bookings
- ✅ Payments process successfully
- ✅ Staff can complete tasks
- ✅ Dashboard shows accurate data

### User Satisfaction
- ✅ Positive user feedback
- ✅ No major complaints
- ✅ Feature adoption rate > 80%
- ✅ Support tickets < 5 per week

---

## 🎉 Deployment Complete!

Once all items are checked:
1. Mark deployment as successful
2. Notify stakeholders
3. Update project status
4. Celebrate! 🎊

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Verified By**: _______________
**Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete | ⬜ Rolled Back

---

*Use this checklist for every deployment to ensure consistency and quality.*