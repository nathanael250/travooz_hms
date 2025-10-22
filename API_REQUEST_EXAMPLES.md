# API Request Examples - Room Booking System

## 1. CREATE BOOKING

### Endpoint
```
POST /api/room-bookings/create
```

### Complete Request Example (All Fields)

```json
{
  "room_type_id": 1,
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+250788123456",
  "number_of_adults": 2,
  "number_of_children": 1,
  "guest_id_type": "passport",
  "guest_id_number": "AB123456",
  "special_requests": "High floor, quiet room, city view",
  "early_checkin": true,
  "late_checkout": true,
  "extra_bed_count": 1,
  "payment_method": "card",
  "booking_source": "website",
  "user_id": 123
}
```

### Minimal Request Example (Required Fields Only)

```json
{
  "room_type_id": 1,
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+250788123456",
  "number_of_adults": 2
}
```

### Field Descriptions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `room_type_id` | Integer | ✅ Yes | - | ID of the room type to book |
| `check_in_date` | Date (YYYY-MM-DD) | ✅ Yes | - | Check-in date |
| `check_out_date` | Date (YYYY-MM-DD) | ✅ Yes | - | Check-out date |
| `guest_name` | String | ✅ Yes | - | Full name of the guest |
| `guest_email` | Email | ✅ Yes | - | Guest email address |
| `guest_phone` | String | ✅ Yes | - | Guest phone number |
| `number_of_adults` | Integer (min: 1) | ✅ Yes | - | Number of adults |
| `number_of_children` | Integer (min: 0) | ❌ No | 0 | Number of children |
| `guest_id_type` | String | ❌ No | null | passport, national_id, driving_license |
| `guest_id_number` | String | ❌ No | null | ID document number |
| `special_requests` | String | ❌ No | null | Special requests or preferences |
| `early_checkin` | Boolean | ❌ No | false | Request early check-in (adds 50% of room rate) |
| `late_checkout` | Boolean | ❌ No | false | Request late checkout (adds 50% of room rate) |
| `extra_bed_count` | Integer (min: 0) | ❌ No | 0 | Number of extra beds (10,000 RWF per bed per night) |
| `payment_method` | String | ❌ No | null | card, paypal, stripe, bank_transfer, mobile_money |
| `booking_source` | String | ❌ No | 'website' | website, mobile_app, phone, walk_in |
| `user_id` | Integer | ❌ No | null | User ID if logged in |

### Success Response (201 Created)

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
    "room": {
      "room_number": null,
      "room_type": "Deluxe Room",
      "homestay_name": "Kigali Heights Hotel"
    },
    "dates": {
      "check_in_date": "2024-01-15",
      "check_out_date": "2024-01-20",
      "nights": 5
    },
    "guest": {
      "guest_id": 789,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+250788123456"
    },
    "pricing": {
      "room_price_per_night": 50000,
      "total_room_amount": 250000,
      "early_checkin_fee": 25000,
      "late_checkout_fee": 25000,
      "extra_bed_fee": 50000,
      "subtotal": 350000,
      "tax_amount": 63000,
      "service_charge": 17500,
      "final_amount": 430500,
      "currency": "RWF"
    },
    "payment": {
      "transaction_id": 999,
      "status": "pending",
      "message": "Please proceed with payment to confirm your booking"
    }
  }
}
```

---

## 2. CONFIRM PAYMENT

### Endpoint
```
POST /api/room-bookings/payment/:transaction_id
```

### Request Example

```json
{
  "payment_gateway_id": "stripe_ch_1234567890",
  "gateway_response": {
    "status": "succeeded",
    "amount": 430500,
    "currency": "RWF",
    "payment_method": "card_visa",
    "last4": "4242",
    "receipt_url": "https://stripe.com/receipt/xyz"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `payment_gateway_id` | String | ❌ No | Transaction ID from payment gateway |
| `gateway_response` | Object | ❌ No | Full response from payment gateway |

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transaction_id": 999,
    "booking_id": 456,
    "booking_reference": "TRV-12345678ABCD",
    "payment_status": "completed",
    "booking_status": "confirmed",
    "amount": 430500,
    "currency": "RWF"
  }
}
```

---

## 3. COMPLETE WORKFLOW EXAMPLE

### Step 1: Create Booking

```bash
curl -X POST http://localhost:3000/api/room-bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "room_type_id": 1,
    "check_in_date": "2024-02-01",
    "check_out_date": "2024-02-05",
    "guest_name": "Jane Smith",
    "guest_email": "jane@example.com",
    "guest_phone": "+250788999888",
    "number_of_adults": 2,
    "number_of_children": 1,
    "special_requests": "High floor, city view",
    "payment_method": "card"
  }'
```

**Response:** You'll receive `transaction_id: 999` in the response

### Step 2: Process Payment

```bash
curl -X POST http://localhost:3000/api/room-bookings/payment/999 \
  -H "Content-Type: application/json" \
  -d '{
    "payment_gateway_id": "stripe_ch_abc123",
    "gateway_response": {
      "status": "succeeded",
      "amount": 430500,
      "currency": "RWF"
    }
  }'
```

**Result:** Booking is now confirmed, room will be assigned when guest arrives

---

## 4. IMPORTANT NOTES

### ✅ What Happens
1. Booking is created with `room_type_id` (e.g., "Deluxe Room")
2. `inventory_id` is always NULL (no specific room assigned)
3. Payment is processed and booking is confirmed
4. Staff assigns specific room when guest arrives via Room Assignment interface

### ❌ What Does NOT Happen
- No specific room (inventory_id) is assigned at booking time
- No automatic room assignment on payment confirmation
- No need to send `inventory_id` in the request (it will be ignored)

### 💰 Pricing Calculation
```
Base Amount = room_price_per_night × nights
Early Check-in Fee = room_price_per_night × 0.5 (if requested)
Late Checkout Fee = room_price_per_night × 0.5 (if requested)
Extra Bed Fee = 10,000 × extra_bed_count × nights

Subtotal = Base Amount + All Fees
Tax (18% VAT) = Subtotal × 0.18
Service Charge (5%) = Subtotal × 0.05

Final Amount = Subtotal + Tax + Service Charge
```

### 📋 Validation Rules
- `check_out_date` must be after `check_in_date`
- `number_of_adults` must be at least 1
- Total guests (adults + children) must not exceed room type's `max_people`
- `guest_email` must be a valid email format
- `payment_method` must be one of: card, paypal, stripe, bank_transfer, mobile_money
- **Availability check**: System verifies there are available rooms of the requested type for the dates
  - Prevents overbooking by checking room inventory capacity
  - Counts existing bookings with overlapping dates
  - Rejects booking if all rooms of that type are already booked

---

## 5. ERROR RESPONSES

### Missing Required Field
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Room type ID is required and must be an integer",
      "param": "room_type_id",
      "location": "body"
    }
  ]
}
```

### Invalid Email
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Valid email is required",
      "param": "guest_email",
      "location": "body"
    }
  ]
}
```

### Room Type Not Found
```json
{
  "success": false,
  "message": "Room type not found or cannot accommodate the number of guests"
}
```

### No Rooms Available (Overbooking Prevention)
```json
{
  "success": false,
  "message": "No rooms available for Deluxe Room from 2024-01-15 to 2024-01-20. All 5 rooms are already booked.",
  "details": {
    "room_type": "Deluxe Room",
    "total_rooms": 5,
    "booked_rooms": 5,
    "available_rooms": 0
  }
}
```

### Invalid Dates
```json
{
  "success": false,
  "message": "Check-out date must be after check-in date"
}
```

### Payment Already Completed
```json
{
  "success": false,
  "message": "Payment already completed"
}
```

### Transaction Not Found
```json
{
  "success": false,
  "message": "Transaction not found"
}
```