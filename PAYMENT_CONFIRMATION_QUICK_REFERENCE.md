# Payment Confirmation - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### **Step 1: Create Booking**
```bash
POST /api/room-bookings/create
```
**Save the `transaction_id` from response!**

---

### **Step 2: Process Payment with Gateway**
Use Stripe, PayPal, Mobile Money, etc.

---

### **Step 3: Confirm in System**
```bash
POST /api/room-bookings/payment/:transaction_id
```

**Body (all optional):**
```json
{
  "payment_gateway_id": "gateway_transaction_id",
  "gateway_response": { "status": "succeeded", ... }
}
```

---

## 📋 Complete Examples

### **Example 1: Card Payment (Stripe)**

```javascript
// 1. Create booking
const bookingResponse = await fetch('/api/room-bookings/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    room_type_id: 1,
    check_in_date: "2024-02-01",
    check_out_date: "2024-02-05",
    guest_name: "John Doe",
    guest_email: "john@example.com",
    guest_phone: "+250788123456",
    number_of_adults: 2,
    payment_method: "card"
  })
});

const booking = await bookingResponse.json();
const transactionId = booking.data.payment.transaction_id; // Save this!

// 2. Process with Stripe
const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});

// 3. Confirm in system
const confirmResponse = await fetch(`/api/room-bookings/payment/${transactionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_gateway_id: paymentIntent.id,
    gateway_response: {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }
  })
});

const result = await confirmResponse.json();
// result.success === true means booking is confirmed!
```

---

### **Example 2: Cash Payment (Walk-in)**

```javascript
// 1. Create booking (same as above)
const transactionId = 123; // From booking creation

// 2. No gateway processing needed for cash

// 3. Confirm cash payment
const confirmResponse = await fetch(`/api/room-bookings/payment/${transactionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_gateway_id: null,
    gateway_response: {
      status: "completed",
      payment_method: "cash",
      amount: 430500,
      currency: "RWF",
      received_by: "receptionist_id_123",
      receipt_number: "CASH-2024-001"
    }
  })
});
```

---

### **Example 3: Mobile Money (MTN/Airtel)**

```javascript
// 1. Create booking
const transactionId = 123;

// 2. Process with mobile money gateway
const mobileMoneyResponse = await processMobileMoneyPayment({
  phone: "+250788123456",
  amount: 430500
});

// 3. Confirm in system
const confirmResponse = await fetch(`/api/room-bookings/payment/${transactionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_gateway_id: mobileMoneyResponse.transactionId,
    gateway_response: {
      status: mobileMoneyResponse.status,
      phone_number: mobileMoneyResponse.phoneNumber,
      amount: mobileMoneyResponse.amount,
      currency: "RWF",
      provider: "MTN"
    }
  })
});
```

---

## 🧪 Testing with cURL

```bash
# 1. Create booking
curl -X POST http://localhost:3000/api/room-bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "room_type_id": 1,
    "check_in_date": "2024-02-01",
    "check_out_date": "2024-02-05",
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "guest_phone": "+250788123456",
    "number_of_adults": 2,
    "payment_method": "card"
  }'

# Response will include: "transaction_id": 123

# 2. Confirm payment
curl -X POST http://localhost:3000/api/room-bookings/payment/123 \
  -H "Content-Type: application/json" \
  -d '{
    "payment_gateway_id": "test_payment_123",
    "gateway_response": {
      "status": "succeeded",
      "amount": 430500,
      "currency": "RWF"
    }
  }'
```

---

## ✅ Success Response

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transaction_id": 123,
    "booking_id": 456,
    "booking_reference": "TRV-12345678ABCD",
    "status": "confirmed",
    "payment_status": "paid"
  }
}
```

---

## ❌ Error Responses

### **Transaction Not Found (404)**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```
**Fix:** Check the `transaction_id` is correct

---

### **Already Paid (400)**
```json
{
  "success": false,
  "message": "Payment already completed"
}
```
**Fix:** This payment was already confirmed - check booking status

---

## 🔍 What Happens After Confirmation?

| Table | Field | Before | After |
|-------|-------|--------|-------|
| `payment_transactions` | `status` | `'pending'` | `'completed'` |
| `bookings` | `status` | `'pending'` | `'confirmed'` |
| `bookings` | `payment_status` | `'pending'` | `'paid'` |
| `bookings` | `confirmed_at` | `NULL` | `NOW()` |

**Note:** Room assignment (`inventory_id`) remains `NULL` until guest arrives!

---

## 🎯 Key Points

1. ✅ **Both parameters are optional** - You can send empty body `{}`
2. ✅ **Transaction ID comes from booking creation** - Save it!
3. ✅ **One payment per transaction** - Can't confirm twice
4. ✅ **Room assigned later** - Not automatic on payment
5. ✅ **Works with any payment method** - Card, cash, mobile money, etc.

---

## 🔐 Security Best Practices

### **DO:**
- ✅ Verify payment with gateway before confirming
- ✅ Use webhooks for production
- ✅ Implement retry logic for failed confirmations
- ✅ Log all payment attempts
- ✅ Validate amounts match

### **DON'T:**
- ❌ Trust client-side payment status
- ❌ Confirm without gateway verification
- ❌ Expose transaction IDs publicly
- ❌ Skip error handling
- ❌ Allow amount manipulation

---

## 📚 Full Documentation

For complete details, see: **`HOW_TO_CONFIRM_PAYMENT.md`**

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Transaction not found" | Verify `transaction_id` from booking creation |
| "Payment already completed" | Check if payment was already confirmed |
| Gateway succeeds but confirmation fails | Implement retry logic with exponential backoff |
| Amount mismatch | Verify amount matches booking total |
| Network timeout | Increase timeout, implement retry |

---

**Quick Help:**
- Booking Flow: `BOOKING_AND_PAYMENT_FLOW.md`
- Payment Details: `HOW_TO_CONFIRM_PAYMENT.md`
- API Reference: `/backend/src/routes/roomBooking.routes.js` (line 460)