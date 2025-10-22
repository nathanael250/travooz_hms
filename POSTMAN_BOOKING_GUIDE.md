# 🎯 Complete Room Booking API Guide for Postman

## Base URL
```
http://localhost:3001/api
```

---

## 📋 **STEP 1: Create a Room Booking**

### **Endpoint:**
```
POST http://localhost:3001/api/room-booking/create
```

### **Headers:**
```
Content-Type: application/json
```

### **Request Body (Basic Booking - No Extras):**
```json
{
  "inventory_id": 4,
  "check_in_date": "2025-02-15",
  "check_out_date": "2025-02-18",
  "guest_name": "John Doe",
  "guest_email": "john.doe@example.com",
  "guest_phone": "+250788123456",
  "number_of_adults": 2,
  "number_of_children": 0,
  "special_requests": "Late check-in expected around 10 PM",
  "payment_method": "mobile_money",
  "guest_id_type": "passport",
  "guest_id_number": "P123456789",
  "early_checkin": false,
  "late_checkout": false,
  "extra_bed_count": 0,
  "booking_source": "website"
}
```

### **Request Body (With All Extra Services):**
```json
{
  "inventory_id": 5,
  "check_in_date": "2025-02-20",
  "check_out_date": "2025-02-23",
  "guest_name": "Jane Smith",
  "guest_email": "jane.smith@example.com",
  "guest_phone": "+250788987654",
  "number_of_adults": 2,
  "number_of_children": 1,
  "special_requests": "Need a baby cot and extra towels. Vegetarian meals preferred.",
  "payment_method": "card",
  "guest_id_type": "national_id",
  "guest_id_number": "1199880012345678",
  "early_checkin": true,
  "late_checkout": true,
  "extra_bed_count": 1,
  "booking_source": "mobile_app"
}
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "booking_id": 1,
      "booking_reference": "TRV-12345678",
      "status": "pending",
      "payment_status": "pending"
    },
    "room": {
      "room_number": "104",
      "room_type": "Deluxe Room",
      "homestay_name": "Classic Resort Lodge"
    },
    "dates": {
      "check_in_date": "2025-02-15",
      "check_out_date": "2025-02-18",
      "nights": 3
    },
    "guest": {
      "guest_id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+250788123456"
    },
    "pricing": {
      "room_price_per_night": 30000,
      "total_room_amount": 90000,
      "early_checkin_fee": 0,
      "late_checkout_fee": 0,
      "extra_bed_fee": 0,
      "subtotal": 90000,
      "tax_amount": 16200,
      "service_charge": 4500,
      "final_amount": 110700,
      "currency": "RWF"
    },
    "payment": {
      "transaction_id": 1,
      "payment_method": "mobile_money",
      "status": "pending"
    },
    "next_steps": {
      "message": "Please proceed with payment to confirm your booking",
      "payment_url": "/api/room-bookings/payment/1"
    }
  }
}
```

---

## 💳 **STEP 2: Process Payment**

**IMPORTANT:** Copy the `transaction_id` from Step 1 response and use it in the URL below.

### **Endpoint:**
```
POST http://localhost:3001/api/room-booking/payment/{transaction_id}
```

Example:
```
POST http://localhost:3001/api/room-booking/payment/1
```

### **Headers:**
```
Content-Type: application/json
```

### **Request Body (Mobile Money Payment):**
```json
{
  "payment_gateway_id": "MOMO_1234567890",
  "gateway_response": {
    "status": "success",
    "transaction_ref": "TXN1234567890",
    "payment_method": "MTN Mobile Money",
    "phone": "+250788123456",
    "amount": 110700,
    "currency": "RWF",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### **Request Body (Card Payment):**
```json
{
  "payment_gateway_id": "STRIPE_ch_1234567890",
  "gateway_response": {
    "status": "success",
    "transaction_ref": "ch_1234567890",
    "payment_method": "Visa Card",
    "card_last4": "4242",
    "amount": 110700,
    "currency": "RWF",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transaction_id": "1",
    "booking_id": 1,
    "booking_reference": "TRV-12345678",
    "status": "confirmed",
    "payment_status": "paid"
  }
}
```

---

## 📖 **STEP 3: View Booking Details**

**IMPORTANT:** Copy the `booking_id` from Step 1 response and use it in the URL below.

### **Endpoint:**
```
GET http://localhost:3001/api/room-booking/{booking_id}
```

Example:
```
GET http://localhost:3001/api/room-booking/1
```

### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "booking_id": 1,
      "booking_reference": "TRV-12345678",
      "status": "confirmed",
      "payment_status": "paid",
      "total_amount": "110700.00",
      "special_requests": "Late check-in expected around 10 PM",
      "created_at": "2025-01-15T10:00:00.000Z",
      "confirmed_at": "2025-01-15T10:30:00.000Z",
      "inventory_id": 4,
      "check_in_date": "2025-02-15",
      "check_out_date": "2025-02-18",
      "guests": 2,
      "nights": 3,
      "room_price_per_night": "30000.00",
      "total_room_amount": "90000.00",
      "guest_name": "John Doe",
      "guest_email": "john.doe@example.com",
      "guest_phone": "+250788123456",
      "number_of_adults": 2,
      "number_of_children": 0,
      "early_checkin": 0,
      "late_checkout": 0,
      "early_checkin_fee": "0.00",
      "late_checkout_fee": "0.00",
      "extra_bed_count": 0,
      "extra_bed_fee": "0.00",
      "tax_amount": "16200.00",
      "service_charge": "4500.00",
      "final_amount": "110700.00",
      "room_number": "104",
      "floor": "1",
      "room_type": "Deluxe Room",
      "room_description": "Spacious room featuring a private balcony...",
      "homestay_id": 13,
      "homestay_name": "Classic Resort Lodge",
      "homestay_address": "Nyungwe Forest, Rwanda",
      "homestay_phone": "+250788000000",
      "guest_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "transaction_id": 1,
      "payment_method": "mobile_money",
      "payment_transaction_status": "completed"
    }
  }
}
```

---

## ❌ **STEP 4: Cancel Booking (Optional)**

**IMPORTANT:** Copy the `booking_id` from Step 1 response and use it in the URL below.

### **Endpoint:**
```
PATCH http://localhost:3001/api/room-booking/{booking_id}/cancel
```

Example:
```
PATCH http://localhost:3001/api/room-booking/1/cancel
```

### **Headers:**
```
Content-Type: application/json
```

### **Request Body:**
```json
{
  "cancellation_reason": "Change of travel plans",
  "cancelled_by": 1
}
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking_id": "1",
    "status": "cancelled",
    "refund_status": "refunded"
  }
}
```

---

## 📊 **Field Descriptions**

### **Required Fields:**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `inventory_id` | integer | Room ID from available rooms | `4` |
| `check_in_date` | date | Check-in date (YYYY-MM-DD) | `"2025-02-15"` |
| `check_out_date` | date | Check-out date (YYYY-MM-DD) | `"2025-02-18"` |
| `guest_name` | string | Full name of guest | `"John Doe"` |
| `guest_email` | email | Valid email address | `"john@example.com"` |
| `guest_phone` | string | Phone with country code | `"+250788123456"` |
| `number_of_adults` | integer | Number of adults (min: 1) | `2` |

### **Optional Fields:**
| Field | Type | Description | Default | Example |
|-------|------|-------------|---------|---------|
| `number_of_children` | integer | Number of children | `0` | `1` |
| `special_requests` | string | Special requirements | `null` | `"Late check-in"` |
| `payment_method` | string | Payment method | `null` | `"mobile_money"` |
| `guest_id_type` | string | ID document type | `null` | `"passport"` |
| `guest_id_number` | string | ID document number | `null` | `"P123456789"` |
| `early_checkin` | boolean | Early check-in (adds 50% fee) | `false` | `true` |
| `late_checkout` | boolean | Late checkout (adds 50% fee) | `false` | `true` |
| `extra_bed_count` | integer | Number of extra beds | `0` | `1` |
| `booking_source` | string | Booking source | `"website"` | `"mobile_app"` |
| `user_id` | integer | Registered user ID | `null` | `5` |

### **Payment Methods:**
- `card` - Credit/Debit Card
- `paypal` - PayPal
- `stripe` - Stripe
- `bank_transfer` - Bank Transfer
- `mobile_money` - Mobile Money (MTN, Airtel, etc.)

### **ID Types:**
- `passport` - Passport
- `national_id` - National ID Card
- `driving_license` - Driving License

### **Booking Sources:**
- `website` - Website
- `mobile_app` - Mobile App
- `phone` - Phone Call
- `walk_in` - Walk-in

---

## 💰 **Pricing Calculation**

### **Example 1: Basic Booking (3 nights, no extras)**
```
Room Rate:        30,000 RWF × 3 nights = 90,000 RWF
Early Check-in:                         = 0 RWF
Late Checkout:                          = 0 RWF
Extra Bed:                              = 0 RWF
                                        ─────────
Subtotal:                               = 90,000 RWF
Tax (18%):                              = 16,200 RWF
Service Charge (5%):                    = 4,500 RWF
                                        ─────────
TOTAL:                                  = 110,700 RWF
```

### **Example 2: With All Extras (3 nights)**
```
Room Rate:        30,000 RWF × 3 nights = 90,000 RWF
Early Check-in:   30,000 × 50%          = 15,000 RWF
Late Checkout:    30,000 × 50%          = 15,000 RWF
Extra Bed:        10,000 × 3 nights     = 30,000 RWF
                                        ─────────
Subtotal:                               = 150,000 RWF
Tax (18%):                              = 27,000 RWF
Service Charge (5%):                    = 7,500 RWF
                                        ─────────
TOTAL:                                  = 184,500 RWF
```

---

## 🏨 **Available Rooms for Testing**

You can use any of these `inventory_id` values:

| ID | Room Number | Floor | Type | Price/Night | Max Guests | Hotel |
|----|-------------|-------|------|-------------|------------|-------|
| `4` | 104 | 1 | Deluxe Room | 30,000 RWF | 3 | Classic Resort Lodge |
| `5` | 201 | 2 | Deluxe Room | 30,000 RWF | 3 | Classic Resort Lodge |
| `6` | 202 | 2 | Deluxe Room | 30,000 RWF | 3 | Classic Resort Lodge |

**Hotel Details:**
- **Name:** Classic Resort Lodge
- **Location:** Nyungwe Forest, Rwanda
- **Homestay ID:** 13

---

## 🔄 **Complete Booking Flow**

```
1. User searches for available rooms
   ↓
2. User selects a room and fills booking form
   ↓
3. POST /api/room-booking/create
   → Creates booking with status='pending'
   → Creates guest profile (or updates existing)
   → Creates payment transaction
   → Returns booking_id and transaction_id
   ↓
4. User proceeds to payment
   ↓
5. POST /api/room-booking/payment/{transaction_id}
   → Updates payment status to 'completed'
   → Updates booking status to 'confirmed'
   → Sets confirmed_at timestamp
   ↓
6. User receives confirmation
   ↓
7. GET /api/room-booking/{booking_id}
   → View complete booking details
   ↓
8. (Optional) PATCH /api/room-booking/{booking_id}/cancel
   → Cancel booking and process refund
```

---

## ✅ **Testing Checklist**

- [ ] Create basic booking without extras
- [ ] Create booking with early check-in
- [ ] Create booking with late checkout
- [ ] Create booking with extra bed
- [ ] Create booking with all extras
- [ ] Process payment with mobile money
- [ ] Process payment with card
- [ ] View booking details
- [ ] Cancel unpaid booking
- [ ] Cancel paid booking (should refund)
- [ ] Try to cancel already cancelled booking (should fail)
- [ ] Try to book unavailable dates (should fail)
- [ ] Try to book with more guests than capacity (should fail)

---

## 🚨 **Common Errors**

### **400 Bad Request - Room Not Available**
```json
{
  "success": false,
  "message": "Room is not available or cannot accommodate the number of guests"
}
```
**Solution:** Check if room exists, is available, and has capacity for your guest count.

### **400 Bad Request - Date Conflict**
```json
{
  "success": false,
  "message": "Room is already booked for the selected dates"
}
```
**Solution:** Choose different dates or a different room.

### **400 Bad Request - Invalid Dates**
```json
{
  "success": false,
  "message": "Check-out date must be after check-in date"
}
```
**Solution:** Ensure check-out date is after check-in date.

### **404 Not Found - Transaction Not Found**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```
**Solution:** Verify the transaction_id is correct.

### **400 Bad Request - Payment Already Completed**
```json
{
  "success": false,
  "message": "Payment already completed"
}
```
**Solution:** This booking has already been paid. Cannot process payment again.

---

## 📝 **Notes**

1. **Guest Profiles:** The system automatically creates or updates guest profiles based on email address. Repeat customers will have their information updated.

2. **Booking Reference:** Each booking gets a unique reference code (format: `TRV-XXXXXXXX`) for easy tracking.

3. **Currency:** All prices are in Rwandan Francs (RWF).

4. **Taxes:** 18% VAT is automatically calculated and added to all bookings.

5. **Service Charge:** 5% service charge is automatically added to all bookings.

6. **Refunds:** When a paid booking is cancelled, the payment status is automatically updated to 'refunded'.

7. **Transaction Safety:** All booking operations use database transactions to ensure data consistency.

---

## 🎉 **Ready to Test!**

Copy the JSON examples above into Postman and start testing the complete booking flow. Make sure to:
1. Update the dates to future dates
2. Use valid email addresses
3. Copy the `booking_id` and `transaction_id` from responses to use in subsequent requests

Happy Testing! 🚀