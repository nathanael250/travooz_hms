// Script to fix missing homestay_id values in room_bookings table
const { sequelize } = require('../../config/database');

(async () => {
  try {
    console.log('\n=== FIXING MISSING HOMESTAY_ID VALUES ===\n');
    
    // Step 1: Find bookings with missing homestay_id
    const bookingsWithMissingHomestay = await sequelize.query(`
      SELECT 
        rb.booking_id,
        b.booking_reference,
        rb.guest_name,
        rb.inventory_id,
        ri.unit_number,
        rt.homestay_id
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      INNER JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      INNER JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      WHERE rb.homestay_id IS NULL
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`Found ${bookingsWithMissingHomestay.length} room bookings with missing homestay_id\n`);
    
    if (bookingsWithMissingHomestay.length === 0) {
      console.log('✅ No missing homestay_id values found. All bookings are properly configured.');
      await sequelize.close();
      return;
    }
    
    // Step 2: Display what will be updated
    console.log('Bookings to be updated:\n');
    bookingsWithMissingHomestay.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.booking_reference}`);
      console.log(`   Guest: ${booking.guest_name}`);
      console.log(`   Room: ${booking.unit_number}`);
      console.log(`   Will set homestay_id to: ${booking.homestay_id}`);
      console.log('');
    });
    
    // Step 3: Update the missing homestay_id values
    console.log('Updating room_bookings table...\n');
    
    const updateResult = await sequelize.query(`
      UPDATE room_bookings rb
      INNER JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      INNER JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      SET rb.homestay_id = rt.homestay_id
      WHERE rb.homestay_id IS NULL
    `, {
      type: sequelize.QueryTypes.UPDATE
    });
    
    console.log(`✅ Successfully updated ${bookingsWithMissingHomestay.length} room bookings`);
    
    // Step 4: Verify the update
    const remainingMissing = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM room_bookings
      WHERE homestay_id IS NULL
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`\nVerification: ${remainingMissing[0].count} room bookings still have missing homestay_id`);
    
    if (remainingMissing[0].count === 0) {
      console.log('\n✅ All room bookings now have valid homestay_id values!');
    } else {
      console.log('\n⚠️  Some room bookings still have missing homestay_id. Manual intervention may be required.');
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();