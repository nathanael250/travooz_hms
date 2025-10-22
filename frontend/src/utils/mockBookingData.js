// Mock data service for testing booking components
// This can be used when backend is not running

// Helper functions
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Sample guest names
const guestNames = [
  'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Davis', 'James Wilson',
  'Lisa Garcia', 'David Miller', 'Jennifer Taylor', 'Robert Anderson', 'Ashley Thomas',
  'Christopher Lee', 'Amanda White', 'Daniel Martinez', 'Jessica Rodriguez', 'Matthew Clark'
];

// Sample hotel/homestay names
const homestayNames = [
  'Sunset Villa', 'Ocean View Resort', 'Mountain Lodge', 'City Center Hotel', 'Garden Paradise',
  'Beachfront Retreat', 'Heritage Manor', 'Modern Suites', 'Countryside Inn', 'Downtown Plaza'
];

// Generate mock booking data
const generateMockBookings = (count = 30) => {
  const bookings = [];
  const today = new Date();
  const pastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  const serviceTypes = ['homestay', 'room', 'restaurant_table', 'tour_package', 'car_rental', 'activity'];
  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  const paymentStatuses = ['pending', 'paid', 'refunded'];
  const bookingSources = ['website', 'mobile_app', 'phone', 'email', 'walk_in', 'agent', 'ota'];

  for (let i = 1; i <= count; i++) {
    const createdAt = randomDate(pastMonth, today);
    const guestName = guestNames[Math.floor(Math.random() * guestNames.length)];
    const email = guestName.toLowerCase().replace(' ', '.') + '@email.com';
    
    const booking = {
      booking_id: i,
      booking_reference: generateBookingReference(),
      service_type: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payment_status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      booking_source: bookingSources[Math.floor(Math.random() * bookingSources.length)],
      total_amount: (Math.random() * 500 + 50).toFixed(2),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      guest: {
        name: guestName,
        email: email,
        phone: '+1' + Math.floor(Math.random() * 9000000000 + 1000000000)
      },
      hotel: {
        id: Math.floor(Math.random() * 10) + 1,
        name: homestayNames[Math.floor(Math.random() * homestayNames.length)]
      },
      special_requests: Math.random() > 0.7 ? 'Late arrival, please keep keys at reception' : null
    };

    bookings.push(booking);
  }

  return bookings;
};

// Generate mock room booking data
const generateMockRoomBookings = (count = 25) => {
  const roomBookings = [];
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  
  const roomTypes = ['single', 'double', 'suite', 'family', 'deluxe'];
  const statuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];

  for (let i = 1; i <= count; i++) {
    const checkInDate = randomDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), nextMonth);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 7) + 1);
    
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const pricePerNight = Math.floor(Math.random() * 200 + 80);
    const totalAmount = (pricePerNight * nights * 1.25).toFixed(2); // Including taxes
    
    const adults = Math.floor(Math.random() * 3) + 1;
    const children = Math.random() > 0.6 ? Math.floor(Math.random() * 2) : 0;
    const guestName = guestNames[Math.floor(Math.random() * guestNames.length)];

    const roomBooking = {
      room_booking_id: i,
      booking_id: i,
      booking_reference: generateBookingReference(),
      check_in_date: checkInDate.toISOString().split('T')[0],
      check_out_date: checkOutDate.toISOString().split('T')[0],
      nights: nights,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      guest_name: guestName,
      guest_email: guestName.toLowerCase().replace(' ', '.') + '@email.com',
      guest_phone: '+1' + Math.floor(Math.random() * 9000000000 + 1000000000),
      adults: adults,
      children: children,
      room_price_per_night: pricePerNight,
      total_amount: totalAmount,
      homestay: {
        id: Math.floor(Math.random() * 10) + 1,
        name: homestayNames[Math.floor(Math.random() * homestayNames.length)]
      },
      room: {
        room_number: '10' + (Math.floor(Math.random() * 50) + 1),
        room_type: roomTypes[Math.floor(Math.random() * roomTypes.length)]
      },
      room_type: {
        name: roomTypes[Math.floor(Math.random() * roomTypes.length)]
      },
      special_requests: Math.random() > 0.6 ? 'High floor room preferred, non-smoking' : null,
      created_at: randomDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), today).toISOString()
    };

    roomBookings.push(roomBooking);
  }

  return roomBookings;
};

// Mock API responses
export const mockBookingService = {
  // Get all bookings with filters and pagination
  getBookings: (filters = {}, page = 1, limit = 10) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let bookings = generateMockBookings(50);
        
        // Apply filters
        if (filters.status) {
          bookings = bookings.filter(b => b.status === filters.status);
        }
        if (filters.service_type) {
          bookings = bookings.filter(b => b.service_type === filters.service_type);
        }
        if (filters.payment_status) {
          bookings = bookings.filter(b => b.payment_status === filters.payment_status);
        }
        if (filters.booking_source) {
          bookings = bookings.filter(b => b.booking_source === filters.booking_source);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          bookings = bookings.filter(b => 
            b.booking_reference.toLowerCase().includes(searchLower) ||
            b.guest.name.toLowerCase().includes(searchLower) ||
            b.guest.email.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBookings = bookings.slice(startIndex, endIndex);

        resolve({
          success: true,
          data: {
            bookings: paginatedBookings,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: bookings.length,
              pages: Math.ceil(bookings.length / limit)
            }
          }
        });
      }, 500); // Simulate network delay
    });
  },

  // Get room bookings with filters
  getRoomBookings: (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let roomBookings = generateMockRoomBookings(30);
        
        // Apply filters
        if (filters.status) {
          roomBookings = roomBookings.filter(b => b.status === filters.status);
        }
        if (filters.room_type) {
          roomBookings = roomBookings.filter(b => b.room.room_type === filters.room_type);
        }
        if (filters.homestay_id) {
          roomBookings = roomBookings.filter(b => b.homestay.id == filters.homestay_id);
        }
        if (filters.check_in_date) {
          roomBookings = roomBookings.filter(b => b.check_in_date === filters.check_in_date);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          roomBookings = roomBookings.filter(b => 
            b.booking_reference.toLowerCase().includes(searchLower) ||
            b.guest_name.toLowerCase().includes(searchLower) ||
            b.homestay.name.toLowerCase().includes(searchLower)
          );
        }

        resolve({
          success: true,
          data: roomBookings
        });
      }, 400);
    });
  }
};

// Instructions for using mock data
export const MOCK_DATA_INSTRUCTIONS = `
To use mock data for testing:

1. Import the mockBookingService in your component:
   import { mockBookingService } from './path/to/mockBookingData';

2. Replace your API calls:
   // Instead of: const response = await fetch('/api/bookings');
   const result = await mockBookingService.getBookings(filters, page, limit);

3. The mock service returns the same data structure as your real API.

To switch back to real API, just change the import and function calls.
`;