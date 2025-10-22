# Payment Confirmation Flow - Visual Guide

## 🎯 The Complete Flow (Visual)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: CREATE BOOKING                       │
└─────────────────────────────────────────────────────────────────┘

    POST /api/room-bookings/create
    
    📤 REQUEST:
    {
      "room_type_id": 1,
      "check_in_date": "2024-02-01",
      "check_out_date": "2024-02-05",
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "guest_phone": "+250788123456",
      "number_of_adults": 2,
      "payment_method": "card"
    }
    
    ⬇️
    
    📥 RESPONSE:
    {
      "success": true,
      "data": {
        "booking": {
          "booking_id": 456,
          "booking_reference": "TRV-12345678ABCD",
          "status": "pending" ⏳
        },
        "payment": {
          "transaction_id": 999,  ⭐ SAVE THIS!
          "status": "pending"
        },
        "pricing": {
          "final_amount": 430500
        }
      }
    }

┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: PROCESS WITH PAYMENT GATEWAY               │
└─────────────────────────────────────────────────────────────────┘

    Choose your payment method:
    
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   💳 CARD    │  │  📱 MOBILE   │  │  💵 CASH     │  │  🏦 BANK     │
    │   (Stripe)   │  │   MONEY      │  │  (Walk-in)   │  │  TRANSFER    │
    └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
          │                  │                  │                  │
          ⬇️                  ⬇️                  ⬇️                  ⬇️
    
    Process payment through gateway...
    
    ✅ Payment Successful!
    
    Gateway returns:
    - Transaction ID
    - Payment status
    - Amount confirmed
    - Payment details

┌─────────────────────────────────────────────────────────────────┐
│           STEP 3: CONFIRM PAYMENT IN YOUR SYSTEM                │
└─────────────────────────────────────────────────────────────────┘

    POST /api/room-bookings/payment/999  ⭐ Use transaction_id from Step 1
    
    📤 REQUEST:
    {
      "payment_gateway_id": "stripe_ch_1234567890",
      "gateway_response": {
        "status": "succeeded",
        "amount": 430500,
        "currency": "RWF"
      }
    }
    
    ⬇️
    
    📥 RESPONSE:
    {
      "success": true,
      "message": "Payment processed successfully",
      "data": {
        "transaction_id": 999,
        "booking_id": 456,
        "booking_reference": "TRV-12345678ABCD",
        "status": "confirmed", ✅
        "payment_status": "paid" ✅
      }
    }

┌─────────────────────────────────────────────────────────────────┐
│                    ✅ BOOKING CONFIRMED!                        │
└─────────────────────────────────────────────────────────────────┘

    Database Updates:
    
    bookings table:
    ┌──────────────┬────────────┬──────────────┐
    │ status       │ BEFORE     │ AFTER        │
    ├──────────────┼────────────┼──────────────┤
    │ status       │ pending ⏳ │ confirmed ✅ │
    │ payment_     │ pending ⏳ │ paid ✅      │
    │ confirmed_at │ NULL       │ NOW()        │
    └──────────────┴────────────┴──────────────┘
    
    payment_transactions table:
    ┌──────────────┬────────────┬──────────────┐
    │ Field        │ BEFORE     │ AFTER        │
    ├──────────────┼────────────┼──────────────┤
    │ status       │ pending ⏳ │ completed ✅ │
    │ gateway_id   │ NULL       │ stripe_ch... │
    │ gateway_resp │ NULL       │ {...}        │
    └──────────────┴────────────┴──────────────┘
    
    ⚠️ NOTE: Room assignment (inventory_id) remains NULL
             Staff will assign specific room when guest arrives
```

---

## 💳 Payment Method Examples

### **1. Card Payment (Stripe)**

```
┌─────────────────────────────────────────────────────────────────┐
│                      STRIPE CARD PAYMENT                        │
└─────────────────────────────────────────────────────────────────┘

Frontend:
┌──────────────────────────────────────────────────────────────┐
│  💳 Enter Card Details                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Card Number: 4242 4242 4242 4242                       │ │
│  │ Expiry: 12/25    CVV: 123                              │ │
│  └────────────────────────────────────────────────────────┘ │
│  [Pay 430,500 RWF]                                           │
└──────────────────────────────────────────────────────────────┘
         │
         ⬇️ stripe.confirmCardPayment()
         │
    ┌────────────────┐
    │  Stripe API    │
    │  Processing... │
    └────────────────┘
         │
         ⬇️ Success!
         │
    paymentIntent = {
      id: "stripe_ch_1234567890",
      status: "succeeded",
      amount: 430500,
      currency: "rwf"
    }
         │
         ⬇️ Confirm in your system
         │
    POST /api/room-bookings/payment/999
    {
      "payment_gateway_id": "stripe_ch_1234567890",
      "gateway_response": paymentIntent
    }
         │
         ⬇️
    ✅ Booking Confirmed!
```

---

### **2. Mobile Money (MTN/Airtel)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE MONEY PAYMENT                         │
└─────────────────────────────────────────────────────────────────┘

Frontend:
┌──────────────────────────────────────────────────────────────┐
│  📱 Mobile Money Payment                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Provider: [MTN ▼]                                      │ │
│  │ Phone: +250 788 123 456                                │ │
│  └────────────────────────────────────────────────────────┘ │
│  [Pay 430,500 RWF]                                           │
└──────────────────────────────────────────────────────────────┘
         │
         ⬇️ Call mobile money API
         │
    ┌────────────────┐
    │   MTN MoMo     │
    │   Processing   │
    └────────────────┘
         │
         ⬇️ User enters PIN on phone
         │
    📱 *182*1*1*PIN#
         │
         ⬇️ Success!
         │
    mobileMoneyResponse = {
      transactionId: "MTN123456789",
      status: "completed",
      phoneNumber: "+250788123456",
      amount: 430500
    }
         │
         ⬇️ Confirm in your system
         │
    POST /api/room-bookings/payment/999
    {
      "payment_gateway_id": "MTN123456789",
      "gateway_response": {
        "status": "completed",
        "phone_number": "+250788123456",
        "amount": 430500,
        "provider": "MTN"
      }
    }
         │
         ⬇️
    ✅ Booking Confirmed!
```

---

### **3. Cash Payment (Walk-in)**

```
┌─────────────────────────────────────────────────────────────────┐
│                      CASH PAYMENT (WALK-IN)                     │
└─────────────────────────────────────────────────────────────────┘

Reception Desk:
┌──────────────────────────────────────────────────────────────┐
│  💵 Cash Payment                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Booking Reference: TRV-12345678ABCD                    │ │
│  │ Amount Due: 430,500 RWF                                │ │
│  │ Amount Received: 430,500 RWF                           │ │
│  │ Receipt Number: CASH-2024-001                          │ │
│  └────────────────────────────────────────────────────────┘ │
│  [Confirm Payment]                                           │
└──────────────────────────────────────────────────────────────┘
         │
         ⬇️ Receptionist clicks confirm
         │
    POST /api/room-bookings/payment/999
    {
      "payment_gateway_id": null,
      "gateway_response": {
        "status": "completed",
        "payment_method": "cash",
        "amount": 430500,
        "currency": "RWF",
        "received_by": "receptionist_id_123",
        "receipt_number": "CASH-2024-001"
      }
    }
         │
         ⬇️
    ✅ Booking Confirmed!
    
    Print receipt for guest
```

---

## 🔄 State Transitions

```
BOOKING LIFECYCLE:

┌──────────────┐
│   CREATED    │  ← POST /api/room-bookings/create
│  status:     │
│  'pending'   │
│  payment:    │
│  'pending'   │
└──────┬───────┘
       │
       │ Payment processed with gateway
       │ (Stripe, Mobile Money, Cash, etc.)
       │
       ⬇️
┌──────────────┐
│   PAYMENT    │  ← POST /api/room-bookings/payment/:transaction_id
│  CONFIRMED   │
│  status:     │
│  'confirmed' │
│  payment:    │
│  'paid'      │
└──────┬───────┘
       │
       │ Guest arrives at property
       │
       ⬇️
┌──────────────┐
│     ROOM     │  ← Staff assigns specific room
│   ASSIGNED   │
│  inventory_  │
│  id: 6       │
└──────┬───────┘
       │
       │ Guest checks in
       │
       ⬇️
┌──────────────┐
│  CHECKED IN  │
│  status:     │
│  'checked_in'│
└──────────────┘
```

---

## ⚠️ Error Handling Flow

```
POST /api/room-bookings/payment/999

┌─────────────────────────────────────────┐
│  Check: Does transaction exist?         │
└─────────────┬───────────────────────────┘
              │
         ┌────┴────┐
         │   NO    │
         └────┬────┘
              ⬇️
         ┌─────────────────────┐
         │  ❌ 404 Error       │
         │  "Transaction not   │
         │   found"            │
         └─────────────────────┘
              
         ┌────┴────┐
         │   YES   │
         └────┬────┘
              ⬇️
┌─────────────────────────────────────────┐
│  Check: Is payment already completed?   │
└─────────────┬───────────────────────────┘
              │
         ┌────┴────┐
         │   YES   │
         └────┬────┘
              ⬇️
         ┌─────────────────────┐
         │  ❌ 400 Error       │
         │  "Payment already   │
         │   completed"        │
         └─────────────────────┘
              
         ┌────┴────┐
         │   NO    │
         └────┬────┘
              ⬇️
┌─────────────────────────────────────────┐
│  Update payment_transactions table      │
│  - status: 'completed'                  │
│  - payment_gateway_id: from request     │
│  - gateway_response: from request       │
└─────────────┬───────────────────────────┘
              ⬇️
┌─────────────────────────────────────────┐
│  Update bookings table                  │
│  - status: 'confirmed'                  │
│  - payment_status: 'paid'               │
│  - confirmed_at: NOW()                  │
└─────────────┬───────────────────────────┘
              ⬇️
         ┌─────────────────────┐
         │  ✅ 200 Success     │
         │  "Payment processed │
         │   successfully"     │
         └─────────────────────┘
```

---

## 🧪 Testing Scenarios

### **Scenario 1: Happy Path**

```
1️⃣ Create booking
   ✅ Returns transaction_id: 999

2️⃣ Process payment with Stripe
   ✅ Payment succeeds

3️⃣ Confirm payment
   ✅ Booking status: confirmed
   ✅ Payment status: paid

Result: ✅ SUCCESS
```

### **Scenario 2: Payment Gateway Fails**

```
1️⃣ Create booking
   ✅ Returns transaction_id: 999

2️⃣ Process payment with Stripe
   ❌ Card declined

3️⃣ Don't confirm payment
   ⏳ Booking remains pending

Result: ⏳ PENDING (user can retry payment)
```

### **Scenario 3: Double Confirmation Attempt**

```
1️⃣ Create booking
   ✅ Returns transaction_id: 999

2️⃣ Confirm payment (first time)
   ✅ Success

3️⃣ Confirm payment (second time)
   ❌ Error: "Payment already completed"

Result: ✅ PROTECTED (no duplicate processing)
```

### **Scenario 4: Invalid Transaction ID**

```
1️⃣ Create booking
   ✅ Returns transaction_id: 999

2️⃣ Confirm with wrong ID (888)
   ❌ Error: "Transaction not found"

Result: ❌ ERROR (user needs correct transaction_id)
```

---

## 📊 Database State Visualization

### **Before Payment Confirmation:**

```
┌─────────────────────────────────────────────────────────────┐
│                      bookings table                         │
├─────────────┬───────────┬────────────────┬─────────────────┤
│ booking_id  │ status    │ payment_status │ confirmed_at    │
├─────────────┼───────────┼────────────────┼─────────────────┤
│ 456         │ pending ⏳│ pending ⏳     │ NULL            │
└─────────────┴───────────┴────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               payment_transactions table                    │
├──────────────┬────────┬──────────────────┬────────────────┤
│ transaction_ │ status │ payment_gateway_ │ gateway_       │
│ id           │        │ id               │ response       │
├──────────────┼────────┼──────────────────┼────────────────┤
│ 999          │pending │ NULL             │ NULL           │
│              │   ⏳   │                  │                │
└──────────────┴────────┴──────────────────┴────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   room_bookings table                       │
├─────────────┬──────────────┬─────────────┬────────────────┤
│ booking_id  │ room_type_id │ inventory_id│ final_amount   │
├─────────────┼──────────────┼─────────────┼────────────────┤
│ 456         │ 1            │ NULL ⏳     │ 430500         │
└─────────────┴──────────────┴─────────────┴────────────────┘
```

### **After Payment Confirmation:**

```
┌─────────────────────────────────────────────────────────────┐
│                      bookings table                         │
├─────────────┬───────────┬────────────────┬─────────────────┤
│ booking_id  │ status    │ payment_status │ confirmed_at    │
├─────────────┼───────────┼────────────────┼─────────────────┤
│ 456         │confirmed ✅│ paid ✅        │ 2024-01-10     │
│             │           │                │ 14:30:00        │
└─────────────┴───────────┴────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               payment_transactions table                    │
├──────────────┬────────┬──────────────────┬────────────────┤
│ transaction_ │ status │ payment_gateway_ │ gateway_       │
│ id           │        │ id               │ response       │
├──────────────┼────────┼──────────────────┼────────────────┤
│ 999          │complet │ stripe_ch_123... │ {"status":     │
│              │ed ✅   │                  │ "succeeded"}   │
└──────────────┴────────┴──────────────────┴────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   room_bookings table                       │
├─────────────┬──────────────┬─────────────┬────────────────┤
│ booking_id  │ room_type_id │ inventory_id│ final_amount   │
├─────────────┼──────────────┼─────────────┼────────────────┤
│ 456         │ 1            │ NULL ⏳     │ 430500         │
│             │              │ (assigned   │                │
│             │              │  on arrival)│                │
└─────────────┴──────────────┴─────────────┴────────────────┘
```

---

## 🎯 Key Takeaways

1. **Three Simple Steps:**
   - Create booking → Get `transaction_id`
   - Process payment with gateway
   - Confirm payment in your system

2. **Transaction ID is Critical:**
   - Save it from booking creation response
   - Use it to confirm payment
   - Don't lose it!

3. **Both Parameters are Optional:**
   - Can confirm with empty body `{}`
   - Useful for cash/manual payments

4. **Room Assignment Happens Later:**
   - Payment confirmation doesn't assign room
   - Staff assigns room when guest arrives

5. **Protected Against Duplicates:**
   - Can't confirm same payment twice
   - Returns error if already completed

---

**For complete details, see:**
- **Full Guide:** `HOW_TO_CONFIRM_PAYMENT.md`
- **Quick Reference:** `PAYMENT_CONFIRMATION_QUICK_REFERENCE.md`
- **Booking Flow:** `BOOKING_AND_PAYMENT_FLOW.md`