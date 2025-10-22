# Booking Management Test Data

This directory contains seed data and mock services for testing the booking management system.

## 🌱 Backend Seed Data

### Quick Start
```bash
# Navigate to backend directory
cd backend

# Run seeds with sample data
npm run seed

# Clear existing data and create new seeds
npm run seed:clear

# Force recreate (clears + creates new data)
npm run seed:force
```

### What gets created:
- **50 sample bookings** with various statuses, service types, and payment statuses
- **25+ room bookings** with realistic check-in/out dates, guest information
- **Sample users** (admin, manager, staff) for testing
- **Realistic booking references, guest names, and hotel data**

### Booking Data Includes:
- **Service Types**: homestay, room, restaurant_table, tour_package, car_rental, activity
- **Booking Statuses**: pending, confirmed, cancelled, completed
- **Payment Statuses**: pending, paid, refunded
- **Booking Sources**: website, mobile_app, phone, email, walk_in, agent, ota
- **Date Ranges**: Past month to next 2 months
- **Price Ranges**: $50 - $550 per booking

### Room Booking Data Includes:
- **Room Types**: single, double, suite, family, deluxe
- **Guest Information**: Names, emails, phone numbers, ID details
- **Stay Details**: Check-in/out dates, number of nights, adults/children
- **Pricing**: Room rates, taxes, service charges, discounts
- **Special Requests**: Realistic guest preferences and notes

## 🎭 Frontend Mock Data

### For Development/Testing Without Backend

The frontend includes a mock data service for testing components when the backend is not running.

```javascript
// Import in your component
import { mockBookingService } from '../../utils/mockBookingData';

// Use instead of real API calls
const result = await mockBookingService.getBookings(filters, page, limit);
const roomResult = await mockBookingService.getRoomBookings(filters);
```

### Current Implementation
Both `Bookings.jsx` and `RoomBookings.jsx` are currently using mock data. To switch to real API:

1. Comment out the mock service call
2. Uncomment the real API fetch call
3. Ensure backend is running with seed data

## 📊 Sample Data Statistics

After running seeds, you'll have:
- **~50 total bookings** across all service types
- **~25 room-specific bookings** with detailed information
- **Balanced distribution** of statuses and payment states
- **Realistic date ranges** for testing different scenarios
- **Diverse booking sources** to test filtering

## 🔧 Customization

### Modify Seed Data
Edit `booking-seed-data.js` to:
- Change the number of records generated
- Adjust date ranges
- Modify guest names and hotel names
- Update pricing ranges
- Add new service types or statuses

### Modify Mock Data
Edit `mockBookingData.js` to:
- Change mock data generation logic
- Add new filtering scenarios
- Adjust response delays
- Update sample names and data

## 🚀 Usage Examples

### Test Different Scenarios

1. **Filter by Status**
   - Navigate to Bookings page
   - Use status dropdown to filter pending/confirmed/cancelled bookings

2. **Search Functionality**
   - Search by booking reference (e.g., "BK123ABC")
   - Search by guest name
   - Search by email

3. **Room Booking Management**
   - View check-ins for today
   - Filter by room type
   - See occupied rooms count

4. **Date-based Filtering**
   - Filter room bookings by check-in date
   - View upcoming bookings

## 📋 Database Tables Populated

- `bookings` - Main booking records
- `room_bookings` - Room-specific booking details
- `users` - Sample users for testing (if not exists)

## 🔄 Reset Data

To start fresh:
```bash
npm run seed:force
```

This will:
1. Clear all existing booking data
2. Create fresh sample data
3. Display statistics of created records

## 📝 Notes

- Mock data simulates network delays (400-500ms) for realistic testing
- Seed data uses proper foreign key relationships
- All dates are generated relative to current date for relevance
- Booking references are unique and realistic
- Price calculations include taxes and service charges

Happy testing! 🎉