// Room Booking Lifecycle Service
// Handles complete booking process from initiation to database entry

const { Booking, RoomBooking, GuestProfile, Homestay, Room, BookingGuest, BookingCharge } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

class RoomBookingService {
  
  // 1. BOOKING INITIATION - Check availability and create booking session
  async initiateBooking(bookingData) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        service_type = 'room',
        check_in_date,
        check_out_date,
        number_of_guests,
        room_type_preference,
        booking_source = 'website',
        user_id,
        homestay_id
      } = bookingData;

      // Step 1: Validate dates
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      
      if (checkIn >= checkOut) {
        throw new Error('Check-out date must be after check-in date');
      }

      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      // Step 2: Check room availability
      const availableRooms = await this.checkRoomAvailability({
        check_in_date,
        check_out_date,
        room_type_preference,
        homestay_id,
        number_of_guests
      });

      if (availableRooms.length === 0) {
        throw new Error('No rooms available for selected dates');
      }

      // Step 3: Generate booking reference
      const booking_reference = await this.generateBookingReference();

      // Step 4: Create initial booking record
      const booking = await Booking.create({
        service_type,
        user_id,
        booking_reference,
        booking_source,
        status: 'pending',
        payment_status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        data: {
          booking,
          available_rooms: availableRooms,
          nights,
          booking_reference
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 2. AVAILABILITY CHECK - Query available rooms
  async checkRoomAvailability({ check_in_date, check_out_date, room_type_preference, homestay_id, number_of_guests }) {
    try {
      console.log('Checking availability with params:', { check_in_date, check_out_date, room_type_preference, homestay_id, number_of_guests });
      
      // Build the where clause for room inventory
      const whereClause = {
        ...(room_type_preference && { room_type_id: room_type_preference }),
        status: 'available' // Only available rooms
      };

      // Query available rooms
      const availableRooms = await Room.findAll({
        where: whereClause,
        attributes: ['inventory_id', 'room_type_id', 'unit_number', 'floor', 'status'],
        limit: 10, // Limit results for testing
        raw: true
      });

      console.log('Found rooms:', availableRooms.length);
      
      // If homestay_id filter is needed, we need to join with room_types
      // For now, return all available rooms matching the criteria
      return availableRooms;

    } catch (error) {
      console.error('Availability check error:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to check room availability: ${error.message}`);
    }
  }

  // 3. COMPLETE ROOM BOOKING - Full booking creation with all details
  async createCompleteRoomBooking(bookingData) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        // Booking details
        booking_id,
        service_type = 'room',
        user_id,
        booking_source = 'website',
        special_requests,
        
        // Room booking details
        inventory_id,
        check_in_date,
        check_out_date,
        homestay_id,
        
        // Guest details
        guest_name,
        first_name,
        last_name,
        guest_email,
        guest_phone,
        guest_id_type,
        guest_id_number,
        nationality,
        date_of_birth,
        number_of_adults = 1,
        number_of_children = 0,
        
        // Pricing details
        room_price_per_night,
        extra_services = [],
        tax_rate = 0.15,
        service_charge_rate = 0.10,
        discount_amount = 0
      } = bookingData;

      // Calculate pricing
      const nights = Math.ceil((new Date(check_out_date) - new Date(check_in_date)) / (1000 * 60 * 60 * 24));
      const room_total = room_price_per_night * nights;
      const tax_amount = room_total * tax_rate;
      const service_charge = room_total * service_charge_rate;
      const subtotal = room_total + tax_amount + service_charge - discount_amount;
      
      // Calculate extra services total
      const extra_services_total = extra_services.reduce((sum, service) => sum + (service.price * service.quantity), 0);
      const final_amount = subtotal + extra_services_total;

      // Step 1: Update or create main booking
      let booking;
      if (booking_id) {
        booking = await Booking.findByPk(booking_id, { transaction });
        await booking.update({
          total_amount: final_amount,
          special_requests,
          updated_at: new Date()
        }, { transaction });
      } else {
        const booking_reference = await this.generateBookingReference();
        booking = await Booking.create({
          service_type,
          user_id,
          total_amount: final_amount,
          status: 'confirmed',
          payment_status: 'pending',
          booking_reference,
          booking_source,
          special_requests,
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction });
      }

      // Step 2: Create room booking record
      const roomBooking = await RoomBooking.create({
        booking_id: booking.booking_id,
        inventory_id,
        check_in_date,
        check_out_date,
        guests: number_of_adults + number_of_children,
        nights,
        room_price_per_night,
        total_room_amount: room_total,
        homestay_id,
        guest_name,
        guest_email,
        guest_phone,
        guest_id_type,
        guest_id_number,
        number_of_adults,
        number_of_children,
        tax_amount,
        service_charge,
        discount_amount,
        final_amount,
        deposit_amount: final_amount * 0.3, // 30% deposit
        deposit_paid: false,
        special_requests,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      // Step 3: Create guest profile if not exists
      let guest = await GuestProfile.findOne({
        where: { email: guest_email }
      });

      if (!guest) {
        guest = await GuestProfile.create({
          first_name: first_name || guest_name.split(' ')[0] || 'Guest',
          last_name: last_name || guest_name.split(' ').slice(1).join(' ') || 'User',
          email: guest_email,
          phone: guest_phone,
          id_type: guest_id_type,
          id_number: guest_id_number,
          nationality: nationality || 'Unknown',
          date_of_birth: date_of_birth || null,
          created_at: new Date()
        }, { transaction });
      }

      // Step 4: Link guest to booking
      await BookingGuest.create({
        booking_id: booking.booking_id,
        guest_id: guest.guest_id,
        is_primary: true,
        created_at: new Date()
      }, { transaction });

      // Step 5: Create booking charges for extra services
      for (const service of extra_services) {
        await BookingCharge.create({
          booking_id: booking.booking_id,
          charge_type: service.type,
          description: service.description,
          unit_price: service.unit_price || service.price,
          quantity: service.quantity || 1,
          total_amount: (service.unit_price || service.price) * (service.quantity || 1)
        }, { transaction });
      }

      // Step 6: Create room assignment
      // TODO: Implement RoomAssignment model
      // await RoomAssignment.create({
      //   booking_id: booking.booking_id,
      //   inventory_id,
      //   homestay_id,
      //   guest_id: guest.guest_id,
      //   assignment_date: new Date(),
      //   assigned_by: user_id,
      //   check_in_date,
      //   check_out_date,
      //   status: 'assigned',
      //   created_at: new Date()
      // }, { transaction });

      // Step 7: Create audit log
      // TODO: Implement AuditLog model
      // await AuditLog.create({
      //   user_id,
      //   action: 'booking_created',
      //   table_name: 'bookings',
      //   record_id: booking.booking_id,
      //   old_values: null,
      //   new_values: JSON.stringify({
      //     booking_reference: booking.booking_reference,
      //     guest_name,
      //     check_in_date,
      //     check_out_date,
      //     total_amount: final_amount
      //   }),
      //   created_at: new Date()
      // }, { transaction });

      // Step 8: Update room inventory status
      await Room.update(
        { status: 'occupied', updated_at: new Date() },
        { 
          where: { inventory_id },
          transaction 
        }
      );

      // Commit the transaction before fetching related data
      await transaction.commit();

      // Return complete booking details (fetch after commit to avoid transaction issues)
      return {
        success: true,
        message: 'Room booking created successfully',
        data: {
          booking_id: booking.booking_id,
          booking_reference: booking.booking_reference,
          room_booking_id: roomBooking.booking_id,
          guest_id: guest.guest_id,
          guest_name: guest_name,
          check_in_date,
          check_out_date,
          total_amount: final_amount,
          status: booking.status,
          payment_status: booking.payment_status
        }
      };

    } catch (error) {
      // Only rollback if transaction hasn't been committed
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error('Complete room booking error:', error);
      if (error.stack) console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // 4. PAYMENT PROCESSING
  async processBookingPayment(bookingId, paymentData) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        payment_method,
        amount,
        payment_reference,
        user_id
      } = paymentData;

      // Find booking
      const booking = await Booking.findByPk(bookingId, { transaction });
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Create payment transaction
      // TODO: Implement PaymentTransaction model
      // const payment = await PaymentTransaction.create({
      //   booking_id: bookingId,
      //   payment_method,
      //   amount,
      //   payment_reference,
      //   status: 'completed',
      //   processed_by: user_id,
      //   created_at: new Date()
      // }, { transaction });

      // Update booking payment status
      // TODO: Calculate total paid from PaymentTransaction model
      // const totalPaid = await PaymentTransaction.sum('amount', {
      //   where: { booking_id: bookingId, status: 'completed' },
      //   transaction
      // });

      // For now, assume full payment
      const paymentStatus = 'paid';
      
      await booking.update({
        payment_status: paymentStatus,
        updated_at: new Date()
      }, { transaction });

      // Create audit log
      // TODO: Implement AuditLog model
      // await AuditLog.create({
      //   user_id,
      //   action: 'payment_processed',
      //   table_name: 'bookings',
      //   record_id: bookingId,
      //   new_values: JSON.stringify({
      //     payment_amount: amount,
      //     payment_method,
      //     payment_status: paymentStatus
      //   }),
      //   created_at: new Date()
      // }, { transaction });

      await transaction.commit();

      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          payment,
          booking_payment_status: paymentStatus,
          total_paid: totalPaid
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 5. CHECK-IN PROCESS
  async checkInGuest(bookingId, checkInData) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        user_id,
        actual_check_in_time = new Date(),
        room_key_issued = true,
        special_notes
      } = checkInData;

      // Find booking with room details
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: RoomBooking, as: 'room_booking' }
        ],
        transaction
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'confirmed') {
        throw new Error('Booking must be confirmed before check-in');
      }

      // Update booking status
      await booking.update({
        status: 'checked_in',
        updated_at: new Date()
      }, { transaction });

      // Update room assignment
      // TODO: Implement RoomAssignment model
      // if (booking.room_assignments && booking.room_assignments.length > 0) {
      //   await RoomAssignment.update({
      //     status: 'checked_in',
      //     actual_check_in: actual_check_in_time,
      //     updated_at: new Date()
      //   }, {
      //     where: { booking_id: bookingId },
      //     transaction
      //   });
      // }

      // Create audit log
      // TODO: Implement AuditLog model
      // await AuditLog.create({
      //   user_id,
      //   action: 'guest_checked_in',
      //   table_name: 'bookings',
      //   record_id: bookingId,
      //   new_values: JSON.stringify({
      //     status: 'checked_in',
      //     actual_check_in_time,
      //     room_key_issued,
      //     special_notes
      //   }),
      //   created_at: new Date()
      // }, { transaction });

      await transaction.commit();

      return {
        success: true,
        message: 'Guest checked in successfully',
        data: {
          booking,
          check_in_time: actual_check_in_time,
          room_key_issued
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 6. CHECK-OUT PROCESS
  async checkOutGuest(bookingId, checkOutData) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        user_id,
        actual_check_out_time = new Date(),
        final_charges = [],
        room_condition = 'good',
        cleaning_required = true
      } = checkOutData;

      // Find booking
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: RoomBooking, as: 'room_booking' }
        ],
        transaction
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'checked_in') {
        throw new Error('Guest must be checked in before check-out');
      }

      // Add final charges if any
      let additional_charges = 0;
      for (const charge of final_charges) {
        const bookingCharge = await BookingCharge.create({
          booking_id: bookingId,
          charge_type: charge.type,
          description: charge.description,
          amount: charge.amount,
          quantity: charge.quantity || 1,
          total_amount: charge.amount * (charge.quantity || 1),
          created_at: new Date()
        }, { transaction });
        
        additional_charges += bookingCharge.total_amount;
      }

      // Update booking status and total amount
      const updated_total = parseFloat(booking.total_amount) + additional_charges;
      
      await booking.update({
        status: 'checked_out',
        total_amount: updated_total,
        completed_at: actual_check_out_time,
        updated_at: new Date()
      }, { transaction });

      // Update room assignment
      // TODO: Implement RoomAssignment model
      // if (booking.room_assignments && booking.room_assignments.length > 0) {
      //   await RoomAssignment.update({
      //     status: 'checked_out',
      //     actual_check_out: actual_check_out_time,
      //     updated_at: new Date()
      //   }, {
      //     where: { booking_id: bookingId },
      //     transaction
      //   });

      //   // Update room inventory status
      //   const roomAssignment = booking.room_assignments[0];
      //   await Room.update({
      //     status: cleaning_required ? 'cleaning' : 'available',
      //     condition: room_condition,
      //     updated_at: new Date()
      //   }, {
      //     where: { inventory_id: roomAssignment.inventory_id },
      //     transaction
      //   });
      // }

      // Create audit log
      // TODO: Implement AuditLog model
      // await AuditLog.create({
      //   user_id,
      //   action: 'guest_checked_out',
      //   table_name: 'bookings',
      //   record_id: bookingId,
      //   new_values: JSON.stringify({
      //     status: 'checked_out',
      //     actual_check_out_time,
      //     additional_charges,
      //     final_total: updated_total,
      //     room_condition
      //   }),
      //   created_at: new Date()
      // }, { transaction });

      await transaction.commit();

      return {
        success: true,
        message: 'Guest checked out successfully',
        data: {
          booking,
          check_out_time: actual_check_out_time,
          additional_charges,
          final_total: updated_total
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Helper function to generate unique booking reference
  async generateBookingReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let reference;
    let exists = true;
    
    while (exists) {
      reference = 'BK';
      for (let i = 0; i < 6; i++) {
        reference += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const existingBooking = await Booking.findOne({
        where: { booking_reference: reference }
      });
      
      exists = !!existingBooking;
    }
    
    return reference;
  }

  // Get booking summary with all related data
  async getBookingSummary(bookingId) {
    try {
      const booking = await Booking.findByPk(bookingId, {
        include: [
          {
            model: RoomBooking,
            as: 'room_booking',
            include: [
              { model: Room, as: 'room_inventory' }
            ]
          },
          {
            model: BookingGuest,
            as: 'booking_guests',
            include: [{ model: Guest, as: 'guest' }]
          },
          {
            model: BookingCharge,
            as: 'booking_charges'
          },
          {
            model: PaymentTransaction,
            as: 'payment_transactions'
          }
        ]
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      return {
        success: true,
        data: { booking }
      };

    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RoomBookingService();