# How to Confirm Payment - Complete Guide

## Overview
This guide explains how to confirm payment for room bookings in the Travooz HMS system. The payment confirmation process updates the booking status from "pending" to "confirmed" after successful payment.

---

## Quick Start

### **Endpoint:**
```
POST /api/room-bookings/payment/:transaction_id
```

### **Simple Example:**
```bash
curl -X POST http://localhost:3000/api/room-bookings/payment/123 \
  -H "Content-Type: application/json" \
  -d '{
    "payment_gateway_id": "stripe_ch_1234567890",
    "gateway_response": {
      "status": "succeeded",
      "amount": 430500,
      "currency": "RWF"
    }
  }'
```

---

## Step-by-Step Process

### **Step 1: Create a Booking**

First, create a booking to get a `transaction_id`:

```bash
POST /api/room-bookings/create
```

**Request:**
```json
{
  "room_type_id": 1,
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+250788123456",
  "number_of_adults": 2,
  "payment_method": "card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "booking_id": 456,
      "booking_reference": "TRV-12345678ABCD",
      "status": "pending",
      "payment_status": "pending"
    },
    "payment": {
      "transaction_id": 999,  // ← YOU NEED THIS!
      "status": "pending",
      "message": "Please proceed with payment to confirm your booking"
    },
    "pricing": {
      "final_amount": 430500,
      "currency": "RWF"
    }
  }
}
```

**Save the `transaction_id` (999 in this example)**

---

### **Step 2: Process Payment with Gateway**

Process the payment through your payment gateway (Stripe, PayPal, Mobile Money, etc.)

**Example with Stripe:**
```javascript
// Frontend code example
const stripe = Stripe('your_publishable_key');

const paymentIntent = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
});

if (paymentIntent.status === 'succeeded') {
  // Payment successful - now confirm in your system
  const gatewayId = paymentIntent.id;
  const gatewayResponse = paymentIntent;
  
  // Proceed to Step 3
}
```

---

### **Step 3: Confirm Payment in Your System**

After successful payment with the gateway, confirm it in your system:

```bash
POST /api/room-bookings/payment/:transaction_id
```

**Request:**
```json
{
  "payment_gateway_id": "stripe_ch_1234567890",
  "gateway_response": {
    "status": "succeeded",
    "amount": 430500,
    "currency": "RWF",
    "payment_method": "card_visa",
    "last4": "4242"
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transaction_id": 999,
    "booking_id": 456,
    "booking_reference": "TRV-12345678ABCD",
    "status": "confirmed",
    "payment_status": "paid"
  }
}
```

---

## Request Parameters

### **URL Parameter:**
- `transaction_id` (required) - The transaction ID from the booking creation response

### **Body Parameters (all optional):**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `payment_gateway_id` | string | Transaction ID from payment gateway | `"stripe_ch_1234567890"` |
| `gateway_response` | object | Full response from payment gateway | `{"status": "succeeded", ...}` |

---

## Different Payment Methods

### **1. Card Payment (Stripe)**

```javascript
// After Stripe payment succeeds
const response = await fetch(`/api/room-bookings/payment/${transactionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_gateway_id: paymentIntent.id,
    gateway_response: {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_method: paymentIntent.payment_method_types[0],
      created: paymentIntent.created
    }
  })
});
```

### **2. PayPal**

```javascript
// After PayPal payment succeeds
const response = await fetch(`/api/room-bookings/payment/${transactionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_gateway_id: orderData.id,
    gateway_response: {
      status: orderData.status,
      payer_email: orderData.payer.email_address,
      payer_name: orderData.payer.name.given_name,
      amount: orderData.purchase_units[0].amount.value,
      currency: orderData.purchase_units[0].amount.currency_code
    }
  })
});
```

### **3. Mobile Money (MTN, Airtel)**

```javascript
// After mobile money payment succeeds
const response = await fetch(`/api/room-bookings/payment/${transactionId}`, {
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

### **4. Bank Transfer (Manual Confirmation)**

```javascript
// For manual bank transfer confirmation
const response = await fetch(`/api/room-bookings/payment/${transactionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_gateway_id: "BANK_REF_123456",
    gateway_response: {
      status: "completed",
      bank_name: "Bank of Kigali",
      reference_number: "BK123456789",
      amount: 430500,
      currency: "RWF",
      confirmed_by: "staff_user_id_123"
    }
  })
});
```

### **5. Cash Payment (Walk-in)**

```javascript
// For cash payment at reception
const response = await fetch(`/api/room-bookings/payment/${transactionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_gateway_id: null,
    gateway_response: {
      status: "completed",
      payment_method: "cash",
      amount: 430500,
      currency: "RWF",
      received_by: "receptionist_user_id_456",
      receipt_number: "CASH-2024-001"
    }
  })
});
```

---

## Error Responses

### **Transaction Not Found (404)**
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

**Cause:** Invalid `transaction_id` or transaction doesn't exist

**Solution:** Verify the `transaction_id` from the booking creation response

---

### **Payment Already Completed (400)**
```json
{
  "success": false,
  "message": "Payment already completed"
}
```

**Cause:** Trying to confirm a payment that's already been confirmed

**Solution:** Check the booking status first before attempting to confirm payment

---

## What Happens After Payment Confirmation?

### **Database Updates:**

1. **`payment_transactions` table:**
   - `status`: 'pending' → 'completed'
   - `payment_gateway_id`: Set to gateway transaction ID
   - `gateway_response`: Stores full gateway response as JSON
   - `updated_at`: Updated to current timestamp

2. **`bookings` table:**
   - `status`: 'pending' → 'confirmed'
   - `payment_status`: 'pending' → 'paid'
   - `confirmed_at`: Set to current timestamp
   - `updated_at`: Updated to current timestamp

3. **`room_bookings` table:**
   - No changes (room assignment happens later when guest arrives)
   - `inventory_id` remains NULL until staff assigns a specific room

---

## Frontend Integration Example

### **Complete React Example:**

```javascript
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('your_publishable_key');

function PaymentForm({ transactionId, amount, bookingReference }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Step 1: Create payment intent on your backend
      const intentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amount,
          transaction_id: transactionId 
        })
      });
      
      const { clientSecret } = await intentResponse.json();

      // Step 2: Confirm payment with Stripe
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Step 3: Confirm payment in your system
      const confirmResponse = await fetch(`/api/room-bookings/payment/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_gateway_id: paymentIntent.id,
          gateway_response: {
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            payment_method: paymentIntent.payment_method_types[0]
          }
        })
      });

      const confirmData = await confirmResponse.json();

      if (confirmData.success) {
        setSuccess(true);
        // Redirect to confirmation page
        window.location.href = `/booking-confirmation/${bookingReference}`;
      } else {
        setError(confirmData.message);
      }

    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>✅ Payment Successful!</h2>
        <p>Your booking {bookingReference} has been confirmed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Complete Payment</h3>
      <p>Amount: {amount.toLocaleString()} RWF</p>
      <p>Booking Reference: {bookingReference}</p>
      
      <CardElement />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function PaymentPage({ transactionId, amount, bookingReference }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        transactionId={transactionId}
        amount={amount}
        bookingReference={bookingReference}
      />
    </Elements>
  );
}
```

---

## Testing

### **Test with cURL:**

```bash
# 1. Create a booking
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

# Save the transaction_id from response (e.g., 123)

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

### **Test with Postman:**

1. **Create Booking:**
   - Method: POST
   - URL: `http://localhost:3000/api/room-bookings/create`
   - Body (JSON):
     ```json
     {
       "room_type_id": 1,
       "check_in_date": "2024-02-01",
       "check_out_date": "2024-02-05",
       "guest_name": "Test User",
       "guest_email": "test@example.com",
       "guest_phone": "+250788123456",
       "number_of_adults": 2,
       "payment_method": "card"
     }
     ```
   - Copy `transaction_id` from response

2. **Confirm Payment:**
   - Method: POST
   - URL: `http://localhost:3000/api/room-bookings/payment/{{transaction_id}}`
   - Body (JSON):
     ```json
     {
       "payment_gateway_id": "test_payment_123",
       "gateway_response": {
         "status": "succeeded",
         "amount": 430500,
         "currency": "RWF"
       }
     }
     ```

---

## Common Questions

### **Q: Can I confirm payment without gateway details?**
Yes! Both `payment_gateway_id` and `gateway_response` are optional. You can confirm payment with an empty body:

```bash
curl -X POST http://localhost:3000/api/room-bookings/payment/123 \
  -H "Content-Type: application/json" \
  -d '{}'
```

This is useful for manual confirmations or cash payments.

---

### **Q: What if the payment gateway succeeds but my confirmation fails?**
This is a critical scenario. You should:

1. **Log the gateway response** before calling the confirmation endpoint
2. **Implement retry logic** with exponential backoff
3. **Store pending confirmations** in a queue for manual review
4. **Send alerts** to administrators for failed confirmations

Example retry logic:
```javascript
async function confirmPaymentWithRetry(transactionId, gatewayData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`/api/room-bookings/payment/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gatewayData)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      
    } catch (error) {
      console.error(`Confirmation attempt ${i + 1} failed:`, error);
      
      if (i === maxRetries - 1) {
        // Last attempt failed - alert admin
        await alertAdmin({
          transactionId,
          gatewayData,
          error: error.message
        });
        throw error;
      }
    }
  }
}
```

---

### **Q: Can I confirm multiple payments at once?**
No, each payment must be confirmed individually using its unique `transaction_id`.

---

### **Q: What happens to the room assignment after payment?**
Nothing automatic. The room assignment happens later when the guest arrives at the property. Staff will use the Room Assignment interface to assign a specific room to the booking.

---

## Security Considerations

### **1. Validate Payment Gateway Response**
Always verify the payment with the gateway before confirming:

```javascript
// DON'T trust client-side payment status
// DO verify with gateway server-side

// Backend endpoint to create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, transaction_id } = req.body;
  
  // Verify transaction exists and amount matches
  const transaction = await getTransaction(transaction_id);
  
  if (transaction.amount !== amount) {
    return res.status(400).json({ error: 'Amount mismatch' });
  }
  
  // Create payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'rwf',
    metadata: { transaction_id }
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

### **2. Use Webhooks for Critical Confirmations**
For production, implement webhook handlers:

```javascript
// Stripe webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const transactionId = paymentIntent.metadata.transaction_id;
      
      // Confirm payment in your system
      await confirmPayment(transactionId, {
        payment_gateway_id: paymentIntent.id,
        gateway_response: paymentIntent
      });
    }
    
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

### **3. Prevent Double Confirmation**
The endpoint already checks if payment is completed and returns an error. Always handle this gracefully in your frontend.

---

## Related Documentation

- **Booking Creation:** See `BOOKING_AND_PAYMENT_FLOW.md` Section 2-4
- **Payment Flow:** See `BOOKING_AND_PAYMENT_FLOW.md` Section 5-6
- **Room Assignment:** See Room Assignment documentation (after guest arrives)
- **Database Schema:** See database schema documentation

---

## Support

If you encounter issues:

1. Check the transaction exists: Query `payment_transactions` table
2. Verify transaction status: Ensure it's 'pending' not 'completed'
3. Check server logs for detailed error messages
4. Verify payment gateway integration is working
5. Test with manual confirmation (empty body) to isolate gateway issues

---

**Last Updated:** January 2024  
**Version:** 1.0