/**
 * Verify Room Assignments Query
 * This script tests the room assignments endpoint to ensure it returns all bookings
 */

const sequelize = require('../../config/database');
const { Op } = require('sequelize');
const Booking = require('../models/booking.model');
const RoomBooking = require('../models/roomBooking.model');
const Room = require('../models/room.model');

async function verifyRoomAssignmentsQuery() {
  try {
    console.log('🔍 Testing Room Assignments Query...\n');

    // Test 1: Get ALL bookings (should show both assigned and unassigned)
    console.log('Test 1: Fetching ALL room bookings');
    const allBookings = await RoomBooking.findAll({
      include: [
        {
          model: Booking,
          as: 'booking',
          where: {
            service_type: 'room'
          },
          attributes: ['booking_id', 'booking_reference', 'status', 'payment_status']
        },
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'floor', 'status'],
          required: false
        }
      ],
      order: [['check_in_date', 'ASC']],
      limit: 50
    });

    console.log(`✅ Total bookings found: ${allBookings.length}`);
    console.log('\nBooking Details:');
    allBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.booking.booking_reference} - ${booking.guest_name}`);
      console.log(`   Check-in: ${booking.check_in_date}`);
      console.log(`   Inventory ID: ${booking.inventory_id || 'NOT ASSIGNED'}`);
      console.log(`   Room: ${booking.room ? booking.room.unit_number : 'NOT ASSIGNED'}`);
      console.log(`   Status: ${booking.booking.status}`);
      console.log('');
    });

    // Test 2: Get only UNASSIGNED bookings
    console.log('\n---\nTest 2: Fetching UNASSIGNED room bookings');
    const unassignedBookings = await RoomBooking.findAll({
      where: {
        inventory_id: { [Op.is]: null }
      },
      include: [
        {
          model: Booking,
          as: 'booking',
          where: {
            service_type: 'room'
          },
          attributes: ['booking_id', 'booking_reference', 'status', 'payment_status']
        }
      ],
      order: [['check_in_date', 'ASC']]
    });

    console.log(`✅ Unassigned bookings found: ${unassignedBookings.length}`);
    unassignedBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.booking.booking_reference} - ${booking.guest_name}`);
      console.log(`   Check-in: ${booking.check_in_date}`);
      console.log('');
    });

    // Test 3: Get only ASSIGNED bookings
    console.log('\n---\nTest 3: Fetching ASSIGNED room bookings');
    const assignedBookings = await RoomBooking.findAll({
      where: {
        inventory_id: { [Op.not]: null }
      },
      include: [
        {
          model: Booking,
          as: 'booking',
          where: {
            service_type: 'room'
          },
          attributes: ['booking_id', 'booking_reference', 'status', 'payment_status']
        },
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'floor', 'status'],
          required: false
        }
      ],
      order: [['check_in_date', 'ASC']]
    });

    console.log(`✅ Assigned bookings found: ${assignedBookings.length}`);
    assignedBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.booking.booking_reference} - ${booking.guest_name}`);
      console.log(`   Check-in: ${booking.check_in_date}`);
      console.log(`   Room: ${booking.room ? booking.room.unit_number : 'N/A'}`);
      console.log('');
    });

    console.log('\n✅ Verification Complete!');
    console.log(`\nSummary:`);
    console.log(`- Total Bookings: ${allBookings.length}`);
    console.log(`- Assigned: ${assignedBookings.length}`);
    console.log(`- Unassigned: ${unassignedBookings.length}`);
    console.log(`- Check: ${assignedBookings.length + unassignedBookings.length === allBookings.length ? '✅ PASS' : '❌ FAIL'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

verifyRoomAssignmentsQuery();