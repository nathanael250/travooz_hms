# 🔐 Admin Override System - Complete Guide

## Overview

The **Admin Override System** provides administrators with advanced capabilities to manage checkout rates, confirm pricing, and apply overrides with full audit trail compliance. All admin actions are logged and auditable.

---

## ✨ Features

### 1. **Rate Confirmation** ✅
Admins can confirm the calculated checkout rate without any changes
- Used for compliance and approval of standard rates
- Creates audit trail showing admin reviewed and approved the rate
- Marks booking as "rate_confirmed_by" specific admin

### 2. **Rate Override** 🔄
Admins can override the final checkout amount when needed
- Apply custom final amount different from calculated
- Mandatory reason for audit compliance
- Tracks original vs. overridden amount
- Creates audit log with difference calculation

### 3. **Audit Logging** 📋
All admin actions are automatically logged
- Who made the change and when
- What was changed and why
- Original values and new values
- Reversible with reason tracking

---

## 🎯 Frontend Usage

### CheckOut Component - Admin Controls

When an **admin user** opens the checkout modal, they'll see the **Admin Override Controls** section:

#### **Enable/Disable Override Button**
```
🔒 Admin Override Controls [Enable Override]
```

#### **Option 1: Confirm Rate (No Changes)**
```
☑ Confirm Current Rate (No Changes)
  - Use this to approve the standard calculated rate
  - Creates checkout_confirmation record
  - Marks booking as rate_confirmed
```

#### **Option 2: Override Amount**
```
Override Final Amount (RWF): [input field]
  - Enter custom amount
  - Automatically disabled when "Confirm Rate" is checked
  - Tracks original amount and difference
```

#### **Reason Field** (Always Required)
```
Reason for Override (Mandatory)*:
  - "Promotional discount applied"
  - "Corporate rate adjustment"
  - "VIP guest discount"
  - "System error correction"
  - etc.
```

#### **Visual Feedback**
- When override is active: Button turns **orange** with warning icon
- Final amount box turns **orange** with border
- Shows: "⚠️ Override Active: Original amount was RWF X, Difference: RWF Y"

---

## 📡 Backend API Endpoints

### 1. Apply Rate Override
```http
POST /api/admin/checkout/override
Authorization: Bearer {token}
Content-Type: application/json

{
  "booking_id": 123,
  "final_amount": 50000,
  "reason": "Promotional discount for returning guest",
  "override_type": "rate_override"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rate override applied successfully",
  "data": {
    "override_id": 456,
    "booking_id": 123,
    "original_amount": 75000,
    "new_amount": 50000,
    "difference": -25000,
    "override_reason": "Promotional discount for returning guest",
    "override_type": "rate_override"
  }
}
```

### 2. Confirm Checkout Rate
```http
POST /api/admin/checkout/confirm-rate
Authorization: Bearer {token}
Content-Type: application/json

{
  "booking_id": 123,
  "final_amount": 75000,
  "confirmation_note": "Reviewed and approved by manager"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checkout rate confirmed successfully",
  "data": {
    "booking_id": 123,
    "final_amount": 75000,
    "confirmed_by": 5,
    "confirmation_note": "Reviewed and approved by manager"
  }
}
```

### 3. Get Overrides History
```http
GET /api/admin/overrides?status=applied&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `applied`, `pending_approval`, `rejected`, `reversed`
- `override_type` (optional): `rate_override`, `discount`, `waiver`
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "booking_id": 123,
      "override_type": "rate_override",
      "original_final_amount": 75000,
      "overridden_final_amount": 50000,
      "difference_amount": -25000,
      "override_reason": "Promotional discount for returning guest",
      "status": "applied",
      "admin_name": "John Manager",
      "admin_email": "john@hotel.com",
      "booking_reference": "BK-2024-001",
      "guest_name": "Guest Name",
      "total_amount": 75000,
      "created_at": "2024-10-22T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### 4. Get Confirmations History
```http
GET /api/admin/confirmations?page=1&limit=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "booking_id": 123,
      "final_amount": 75000,
      "confirmation_note": "Reviewed and approved by manager",
      "confirmed_by_name": "John Manager",
      "confirmed_by_email": "john@hotel.com",
      "booking_reference": "BK-2024-001",
      "guest_name": "Guest Name",
      "created_at": "2024-10-22T10:35:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### 5. Reverse an Override
```http
POST /api/admin/overrides/{override_id}/reverse
Authorization: Bearer {token}
Content-Type: application/json

{
  "reversal_reason": "Incorrect amount was entered"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Override reversed successfully",
  "data": {
    "override_id": 456,
    "booking_id": 123,
    "original_amount": 75000,
    "reversal_reason": "Incorrect amount was entered"
  }
}
```

---

## 🗄️ Database Tables

### `admin_overrides`
Tracks all rate overrides with audit information

```sql
CREATE TABLE admin_overrides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  admin_user_id INT NOT NULL,
  override_type ENUM('rate_override', 'discount', 'waiver', 'rate_confirmation'),
  original_final_amount DECIMAL(10, 2),
  overridden_final_amount DECIMAL(10, 2),
  difference_amount DECIMAL(10, 2),
  override_reason TEXT NOT NULL,
  status ENUM('applied', 'pending_approval', 'rejected', 'reversed'),
  approval_admin_id INT,
  approval_timestamp TIMESTAMP NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (admin_user_id) REFERENCES users(id)
);
```

### `checkout_confirmations`
Tracks all rate confirmations (when admin approves without changes)

```sql
CREATE TABLE checkout_confirmations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL UNIQUE,
  confirmed_by INT NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  confirmation_note TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (confirmed_by) REFERENCES users(id)
);
```

### Enhanced `front_desk_logs`
Now tracks admin override associations:
- `admin_override_id` (FK) - Links to specific override record

### Enhanced `bookings`
Now tracks rate confirmations:
- `rate_confirmed_by` (FK) - Which admin confirmed
- `rate_confirmed_at` (TIMESTAMP) - When rate was confirmed

---

## 🔒 Security & Authorization

### Role-Based Access
- ✅ **Admin users only**: Can apply overrides and confirmations
- ❌ **Receptionists**: Cannot access override functions (UI not shown)
- ❌ **Other roles**: Cannot access override endpoints

### Backend Validation
```javascript
// In admin routes
router.post('/checkout/override', authenticateToken, adminOnly, controller);

// In checkout process
if (admin_override && userRole === 'admin') {
  // Apply override
}
```

### Audit Trail
Every admin action creates entries in:
1. **admin_overrides** table - Records the override
2. **front_desk_logs** - Links checkout to override
3. **audit_logs** - Complete change history with IP, user agent

---

## 📊 Checkout Flow with Admin Override

```
Guest Check-Out
    ↓
[Calculate Base Amount]
    ↓
[Admin Review]
    ↓
┌─────────────────────────────────────┐
│  Admin Decision:                     │
│  ✓ Confirm Rate (No Changes)       │
│  OR                                 │
│  ✓ Override Amount (With Reason)   │
└─────────────────────────────────────┘
    ↓
[Record in admin_overrides/confirmations]
    ↓
[Update Booking with Final Amount]
    ↓
[Create Audit Log]
    ↓
[Process Payment]
    ↓
✅ Checkout Complete
```

---

## 🧪 Testing Scenarios

### Scenario 1: Admin Confirms Standard Rate
1. Receptionist clicks "Check Out" button
2. Admin user sees override controls
3. Admin clicks "Confirm Rate (No Changes)"
4. Fills in optional reason
5. Clicks "Complete Check-Out"
6. System creates `checkout_confirmation` record
7. Booking marked as `rate_confirmed`

### Scenario 2: Admin Applies Discount Override
1. Receptionist processes checkout
2. Final amount shows: RWF 75,000
3. Admin enables override
4. Admin enters: RWF 50,000
5. Admin fills reason: "Promotional 30% discount"
6. Clicks "Confirm Override & Complete"
7. System creates `admin_override` with:
   - Original: 75,000
   - Override: 50,000
   - Difference: -25,000
8. Final amount updated to 50,000
9. Booking completed

### Scenario 3: Admin Views Override History
1. Admin navigates to audit section
2. Calls `GET /api/admin/overrides`
3. Sees all overrides with filters
4. Can search by date, type, status
5. Can click on any override to see details

### Scenario 4: Admin Reverses Incorrect Override
1. Admin realizes wrong amount was entered
2. Goes to override history
3. Finds override ID 456
4. Calls `POST /api/admin/overrides/456/reverse`
5. Provides reason: "Incorrect amount"
6. System:
   - Marks override as `reversed`
   - Restores original booking amount
   - Creates audit entry

---

## 📝 Compliance & Audit Reports

All admin actions are auditable through:

1. **admin_overrides** table
   - What was changed
   - Who changed it
   - When it was changed
   - Why it was changed (mandatory reason)

2. **checkout_confirmations** table
   - Which confirmations were made
   - By whom and when
   - Final confirmed amount

3. **audit_logs** table
   - Complete action history
   - IP address and user agent
   - Original and new values

**Sample Audit Query:**
```sql
SELECT 
  ao.id,
  u.name as admin_name,
  ao.override_reason,
  ao.original_final_amount,
  ao.overridden_final_amount,
  ao.difference_amount,
  ao.status,
  ao.created_at
FROM admin_overrides ao
JOIN users u ON ao.admin_user_id = u.id
WHERE ao.created_at BETWEEN '2024-10-01' AND '2024-10-31'
ORDER BY ao.created_at DESC;
```

---

## 🚀 Implementation Checklist

- ✅ Frontend CheckOut component updated with admin controls
- ✅ Admin override UI with warnings and visual feedback
- ✅ Backend admin controller with all override functions
- ✅ Database migration with audit tables
- ✅ Admin routes with role-based protection
- ✅ Receptionist checkout endpoint updated to handle admin_override
- ✅ Audit logging for all admin actions
- ✅ Role-based authorization middleware
- ✅ Error handling and validation

---

## 🔧 Future Enhancements

1. **Approval Workflow**
   - Higher-level approvals for large overrides
   - Automatic alerts for overrides above threshold

2. **Analytics Dashboard**
   - Track override trends
   - Calculate average discount amounts
   - Identify pattern misuse

3. **Batch Operations**
   - Apply same override to multiple bookings
   - Bulk confirmations for end-of-day processing

4. **Integration with Financial Module**
   - Automatic reconciliation of overrides
   - Financial impact reporting
   - Revenue variance tracking

5. **Mobile App Support**
   - Override functionality on mobile checkout screens
   - Offline override capability with sync

---

## ❓ FAQ

**Q: Can receptionists see admin override controls?**
A: No. The UI is hidden for non-admin users. Only admin users see the override section.

**Q: What happens if admin override reason is empty?**
A: Frontend validation prevents submission. Error message: "Please provide a reason for the override"

**Q: Can admin override be applied after checkout is complete?**
A: No. Override must be applied during the checkout process. To correct after checkout, use the `reverse` endpoint.

**Q: Are all overrides reversible?**
A: Yes. Any override can be reversed with a reversal reason. System restores original amount automatically.

**Q: What if an admin applies override without proper authorization?**
A: Full audit trail records:
- Who applied it
- When
- Why (mandatory reason)
- From which IP address
- What changed
- Can be reviewed and reversed if improper

**Q: Can reports be generated from override data?**
A: Yes. Query `admin_overrides` and `checkout_confirmations` tables, or use future analytics dashboard.

---

## 📞 Support

For issues or questions about the Admin Override System:
1. Check the audit logs in `admin_overrides` table
2. Review the user's role and permissions
3. Ensure user has `admin` role
4. Check error messages in backend logs
5. Verify database migration has been applied

---

**Version:** 1.0  
**Last Updated:** October 22, 2024  
**Status:** ✅ Production Ready