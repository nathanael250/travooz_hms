# 📋 Booking API Testing Guide with Postman

## 🚀 Server Setup
Your backend server is running on: **http://localhost:3001**

## 🔐 Authentication Required
All booking endpoints require authentication. You need to login first to get a token.

### Step 1: Import Postman Collection
1. Open Postman
2. Click **Import** button
3. Select the file: `Travooz_HMS_Booking_API.postman_collection.json`
4. Collection will be imported with all pre-configured requests

### Step 2: Login to Get Auth Token
**Endpoint:** `POST http://localhost:3001/api/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@travooz.com",
  "password": "hashedpassword123"
}
```

**Response:** Copy the `token` from response and set it in Collection Variables:
- Variable name: `authToken`
- Value: `your_actual_token_here`

## 📝 Creating Bookings

### Method 1: Simple Booking (NISHIMWE Noel)
**Endpoint:** `POST http://localhost:3001/api/bookings`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {{authToken}}`

**Body:**
```json
{
  "service_type": "homestay",
  "user_id": 1,
  "total_amount": 250.00,
  "status": "pending",
  "payment_status": "pending",
  "booking_source": "website",
  "booking_reference": "BK001NOEL",
  "special_requests": "Please prepare room for early arrival"
}
```

### Method 2: Room Booking with Details (NISHIMWE Noel)
**Endpoint:** `POST http://localhost:3001/api/bookings`

**Body:**
```json
{
  "service_type": "room",
  "user_id": 1,
  "total_amount": 320.00,
  "status": "confirmed",
  "payment_status": "paid",
  "booking_source": "website",
  "booking_reference": "BK001NOEL",
  "special_requests": "High floor room preferred, quiet area",
  "room_booking": {
    "inventory_id": 1,
    "check_in_date": "2025-10-20",
    "check_out_date": "2025-10-23",
    "nights": 3,
    "room_price_per_night": 85.00,
    "total_room_amount": 255.00,
    "homestay_id": 1,
    "guest_name": "NISHIMWE Noel",
    "guest_email": "nishimwe.noel@email.com",
    "guest_phone": "+250788123456",
    "guest_id_type": "passport",
    "guest_id_number": "P12345678",
    "number_of_adults": 2,
    "number_of_children": 1,
    "tax_amount": 38.25,
    "service_charge": 25.50,
    "final_amount": 320.00,
    "deposit_amount": 96.00,
    "deposit_paid": true,
    "special_requests": "Extra bed for child, late arrival around 10 PM"
  }
}
```

### Method 3: Room Booking (NIYO Nathanael)
**Body:**
```json
{
  "service_type": "homestay",
  "user_id": 1,
  "total_amount": 450.00,
  "status": "pending",
  "payment_status": "pending",
  "booking_source": "phone",
  "booking_reference": "BK002NIYO",
  "special_requests": "Business traveler, need WiFi and workspace",
  "room_booking": {
    "inventory_id": 2,
    "check_in_date": "2025-10-25",
    "check_out_date": "2025-10-28",
    "nights": 3,
    "room_price_per_night": 120.00,
    "total_room_amount": 360.00,
    "homestay_id": 2,
    "guest_name": "NIYO Nathanael",
    "guest_email": "niyo.nathanael@email.com",
    "guest_phone": "+250788654321",
    "guest_id_type": "national_id",
    "guest_id_number": "1199712345678901",
    "number_of_adults": 1,
    "number_of_children": 0,
    "tax_amount": 54.00,
    "service_charge": 36.00,
    "final_amount": 450.00,
    "deposit_amount": 135.00,
    "deposit_paid": false,
    "special_requests": "Need early check-in at 12 PM, traveling for business"
  }
}
```

## 📊 Testing Other Endpoints

### Get All Bookings
```
GET http://localhost:3001/api/bookings?page=1&limit=10
```

### Get Specific Booking
```
GET http://localhost:3001/api/bookings/1
```

### Filter Bookings
```
GET http://localhost:3001/api/bookings?status=confirmed&page=1&limit=5
```

### Update Booking Status
```
PATCH http://localhost:3001/api/bookings/1
Content-Type: application/json

{
  "status": "confirmed",
  "payment_status": "paid"
}
```

### Check-in Guest
```
PATCH http://localhost:3001/api/bookings/1/checkin
```

### Check-out Guest
```
PATCH http://localhost:3001/api/bookings/1/checkout
```

## 📋 Required Fields for Booking Creation

### Main Booking Fields:
- `service_type`: "homestay", "room", "restaurant_table", "tour_package", "car_rental", "activity"
- `user_id`: Integer (user creating the booking)
- `total_amount`: Decimal (total booking amount)
- `status`: "pending", "confirmed", "cancelled", "completed"
- `payment_status`: "pending", "paid", "refunded"
- `booking_source`: "website", "mobile_app", "phone", "email", "walk_in", "agent", "ota"

### Optional Fields:
- `booking_reference`: String (unique reference)
- `special_requests`: Text
- `cancellation_reason`: Text (if cancelled)

### Room Booking Additional Fields:
- `inventory_id`: Integer (room inventory ID)
- `check_in_date`: Date (YYYY-MM-DD)
- `check_out_date`: Date (YYYY-MM-DD)
- `guest_name`: String (guest full name)
- `guest_email`: String (guest email)
- `guest_phone`: String (guest phone)
- `number_of_adults`: Integer
- `number_of_children`: Integer

## 🎯 Success Response Example
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "booking_id": 1,
      "service_type": "homestay",
      "booking_reference": "BK001NOEL",
      "status": "pending",
      "total_amount": "250.00",
      "created_at": "2025-10-13T...",
      // ... other booking details
    }
  }
}
```

## 🚨 Common Error Responses
- **401 Unauthorized**: Missing or invalid auth token
- **400 Bad Request**: Validation errors (missing required fields)
- **404 Not Found**: Booking not found
- **500 Internal Server Error**: Server/database error

## 💡 Tips for Testing
1. Always login first to get the auth token
2. Use the Collection Variables in Postman for baseUrl and authToken
3. Check the current database seed data for valid inventory_id and homestay_id values
4. Dates should be in YYYY-MM-DD format
5. Phone numbers can include country codes (+250...)

Happy testing! 🎉