const { Booking, RoomBooking, User, Guest, Hotel } = require('../src/models');
const { Op } = require('sequelize');

// Helper function to generate random dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to generate booking reference
const generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Sample guest data
const sampleGuests = [
  { name: 'NISHIMWE Noel', email: 'nishimwe.noel@email.com', phone: '+250788123456' },
  { name: 'NIYO Nathanael', email: 'niyo.nathanael@email.com', phone: '+250788123457' },
  { name: 'UWIMANA Grace', email: 'uwimana.grace@email.com', phone: '+250788123458' },
  { name: 'MUGABO Patrick', email: 'mugabo.patrick@email.com', phone: '+250788123459' },
  { name: 'UWASE Marie', email: 'uwase.marie@email.com', phone: '+250788123460' },
  { name: 'BIZIMANA Jean', email: 'bizimana.jean@email.com', phone: '+250788123461' },
  { name: 'MUKAMANA Diane', email: 'mukamana.diane@email.com', phone: '+250788123462' },
  { name: 'HAKIZIMANA Eric', email: 'hakizimana.eric@email.com', phone: '+250788123463' },
  { name: 'UWIMANA Alice', email: 'uwimana.alice@email.com', phone: '+250788123464' },
  { name: 'NDAYAMBAJE Samuel', email: 'ndayambaje.samuel@email.com', phone: '+250788123465' }
];

// Sample booking data
const createBookingSeeds = async () => {
  try {
    console.log('🌱 Starting booking seed data creation...');

    // First, let's get or create some users if they don't exist
    let users = await User.findAll({ limit: 3 });
    if (users.length === 0) {
      // Create default users for testing
      users = await User.bulkCreate([
        {
          name: 'Admin User',
          email: 'admin@travooz.com',
          password: 'hashedpassword123',
          role: 'admin'
        },
        {
          name: 'Manager User',
          email: 'manager@travooz.com',
          password: 'hashedpassword123',
          role: 'manager'
        },
        {
          name: 'Staff User',
          email: 'staff@travooz.com',
          password: 'hashedpassword123',
          role: 'staff'
        }
      ]);
    }

    // Create booking data
    const bookingsData = [];
    const roomBookingsData = [];
    
    const today = new Date();
    const pastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    // Generate 20 bookings for focused testing
    for (let i = 0; i < 20; i++) {
      const guest = sampleGuests[Math.floor(Math.random() * sampleGuests.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      const serviceTypes = ['homestay', 'room', 'restaurant_table', 'tour_package', 'car_rental', 'activity'];
      const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      const paymentStatuses = ['pending', 'paid', 'refunded'];
      const bookingSources = ['website', 'mobile_app', 'phone', 'email', 'walk_in', 'agent', 'ota'];
      
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const bookingSource = bookingSources[Math.floor(Math.random() * bookingSources.length)];
      
      const createdAt = randomDate(pastMonth, today);
      const totalAmount = (Math.random() * 500 + 50).toFixed(2); // $50 - $550

      const bookingData = {
        booking_id: i + 1,
        service_type: serviceType,
        user_id: user.user_id,
        total_amount: totalAmount,
        status: status,
        payment_status: paymentStatus,
        booking_reference: generateBookingReference(),
        booking_source: bookingSource,
        special_requests: Math.random() > 0.7 ? 'Please prepare room early, arriving late due to flight delay' : null,
        created_at: createdAt,
        updated_at: createdAt,
        confirmed_at: status === 'confirmed' ? randomDate(createdAt, today) : null,
        completed_at: status === 'completed' ? randomDate(createdAt, today) : null,
        cancelled_at: status === 'cancelled' ? randomDate(createdAt, today) : null,
        cancellation_reason: status === 'cancelled' ? 'Guest cancelled due to personal reasons' : null
      };

      bookingsData.push(bookingData);

      // If it's a room or homestay booking, create room booking data
      if (serviceType === 'room' || serviceType === 'homestay') {
        const checkInDate = randomDate(today, nextMonth);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 nights
        
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const pricePerNight = (Math.random() * 200 + 80).toFixed(2); // $80-$280 per night
        const totalRoomAmount = (pricePerNight * nights).toFixed(2);
        
        const adults = Math.floor(Math.random() * 3) + 1; // 1-3 adults
        const children = Math.random() > 0.6 ? Math.floor(Math.random() * 2) : 0; // 0-2 children
        
        const roomBookingData = {
          booking_id: i + 1,
          inventory_id: Math.floor(Math.random() * 10) + 1, // Assuming 10 inventory items
          check_in_date: checkInDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          guests: adults + children,
          nights: nights,
          room_price_per_night: pricePerNight,
          total_room_amount: totalRoomAmount,
          homestay_id: Math.floor(Math.random() * 5) + 1, // Assuming 5 homestays
          guest_name: guest.name,
          guest_email: guest.email,
          guest_phone: guest.phone,
          guest_id_type: 'passport',
          guest_id_number: 'P' + Math.random().toString().substr(2, 8),
          number_of_adults: adults,
          number_of_children: children,
          early_checkin: Math.random() > 0.8,
          late_checkout: Math.random() > 0.8,
          early_checkin_fee: Math.random() > 0.8 ? (Math.random() * 50).toFixed(2) : 0,
          late_checkout_fee: Math.random() > 0.8 ? (Math.random() * 30).toFixed(2) : 0,
          extra_bed_count: Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0,
          extra_bed_fee: Math.random() > 0.7 ? (Math.random() * 25).toFixed(2) : 0,
          tax_amount: (totalRoomAmount * 0.15).toFixed(2), // 15% tax
          service_charge: (totalRoomAmount * 0.10).toFixed(2), // 10% service charge
          discount_amount: Math.random() > 0.8 ? (totalRoomAmount * 0.1).toFixed(2) : 0,
          final_amount: totalAmount,
          deposit_amount: (totalAmount * 0.3).toFixed(2), // 30% deposit
          deposit_paid: paymentStatus === 'paid' || Math.random() > 0.3,
          special_requests: Math.random() > 0.6 ? 'Late arrival, please keep keys at reception' : null,
          internal_notes: Math.random() > 0.7 ? 'VIP guest, provide complimentary upgrade if available' : null,
          created_at: createdAt,
          updated_at: createdAt
        };

        roomBookingsData.push(roomBookingData);
      }
    }

    // Insert booking data
    console.log('📝 Inserting booking data...');
    await Booking.bulkCreate(bookingsData, { 
      ignoreDuplicates: true,
      validate: true
    });

    // Insert room booking data
    console.log('🏨 Inserting room booking data...');
    if (roomBookingsData.length > 0) {
      await RoomBooking.bulkCreate(roomBookingsData, { 
        ignoreDuplicates: true,
        validate: true
      });
    }

    console.log('✅ Booking seed data created successfully!');
    console.log(`📊 Created ${bookingsData.length} bookings and ${roomBookingsData.length} room bookings`);
    
    // Display summary
    const bookingStats = {
      total: bookingsData.length,
      pending: bookingsData.filter(b => b.status === 'pending').length,
      confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
      cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
      completed: bookingsData.filter(b => b.status === 'completed').length,
      roomBookings: roomBookingsData.length
    };

    console.log('📈 Booking Statistics:');
    console.log(`   Total Bookings: ${bookingStats.total}`);
    console.log(`   Pending: ${bookingStats.pending}`);
    console.log(`   Confirmed: ${bookingStats.confirmed}`);
    console.log(`   Cancelled: ${bookingStats.cancelled}`);
    console.log(`   Completed: ${bookingStats.completed}`);
    console.log(`   Room Bookings: ${bookingStats.roomBookings}`);

  } catch (error) {
    console.error('❌ Error creating booking seed data:', error);
    throw error;
  }
};

// Function to clear existing booking data
const clearBookingData = async () => {
  try {
    console.log('🗑️  Clearing existing booking data...');
    await RoomBooking.destroy({ where: {} });
    await Booking.destroy({ where: {} });
    console.log('✅ Existing booking data cleared');
  } catch (error) {
    console.error('❌ Error clearing booking data:', error);
    throw error;
  }
};

module.exports = {
  createBookingSeeds,
  clearBookingData
};