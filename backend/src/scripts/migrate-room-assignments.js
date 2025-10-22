/**
 * Migration Script: Populate room_assignments table from existing room_bookings
 * 
 * This script creates room_assignment records for all existing room bookings
 * that have an inventory_id but no corresponding room_assignment record.
 */

const { sequelize } = require('../../config/database');

async function migrateRoomAssignments() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Starting room assignments migration...');
    
    // Find all room bookings with inventory_id but no room assignment
    const roomBookingsWithAssignments = await sequelize.query(`
      SELECT 
        rb.booking_id,
        rb.inventory_id,
        b.status as booking_status
      FROM room_bookings rb
      INNER JOIN bookings b ON rb.booking_id = b.booking_id
      WHERE rb.inventory_id IS NOT NULL
        AND b.service_type = 'room'
        AND b.status IN ('confirmed', 'pending', 'pre_registered')
        AND NOT EXISTS (
          SELECT 1 FROM room_assignments ra 
          WHERE ra.booking_id = rb.booking_id
        )
    `, {
      type: sequelize.QueryTypes.SELECT,
      transaction
    });

    console.log(`Found ${roomBookingsWithAssignments.length} room bookings needing migration`);

    if (roomBookingsWithAssignments.length === 0) {
      console.log('No bookings to migrate.');
      await transaction.commit();
      process.exit(0);
      return;
    }

    // Insert room assignments in bulk
    const insertQuery = `
      INSERT INTO room_assignments (booking_id, inventory_id, assigned_by, status, notes, assigned_at)
      VALUES ?
    `;

    const values = roomBookingsWithAssignments.map(rb => [
      rb.booking_id,
      rb.inventory_id,
      null, // assigned_by is NULL for migrated records
      'assigned',
      'Migrated from existing room_bookings data',
      new Date()
    ]);

    // Get the first admin/staff user to use as assigned_by for migrated records
    const [systemUser] = await sequelize.query(`
      SELECT user_id FROM users 
      WHERE role IN ('admin', 'staff', 'front_desk') 
      ORDER BY user_id ASC 
      LIMIT 1
    `, {
      type: sequelize.QueryTypes.SELECT,
      transaction
    });

    if (!systemUser) {
      throw new Error('No admin/staff user found in the system. Please create at least one admin user first.');
    }

    console.log(`Using user_id ${systemUser.user_id} as assigned_by for migrated records`);

    // Use raw query for bulk insert
    await sequelize.query(`
      INSERT INTO room_assignments (booking_id, inventory_id, assigned_by, status, notes, assigned_at)
      SELECT 
        rb.booking_id,
        rb.inventory_id,
        ? as assigned_by,
        'assigned' as status,
        'Migrated from existing room_bookings data' as notes,
        NOW() as assigned_at
      FROM room_bookings rb
      INNER JOIN bookings b ON rb.booking_id = b.booking_id
      WHERE rb.inventory_id IS NOT NULL
        AND b.service_type = 'room'
        AND b.status IN ('confirmed', 'pending', 'pre_registered')
        AND NOT EXISTS (
          SELECT 1 FROM room_assignments ra 
          WHERE ra.booking_id = rb.booking_id
        )
    `, {
      type: sequelize.QueryTypes.INSERT,
      replacements: [systemUser.user_id],
      transaction
    });

    await transaction.commit();

    console.log('\n=== Migration Complete ===');
    console.log(`New assignments created: ${roomBookingsWithAssignments.length}`);
    
    // Show the migrated assignments
    const migratedAssignments = await sequelize.query(`
      SELECT 
        ra.assignment_id,
        ra.booking_id,
        ra.inventory_id,
        ri.unit_number,
        b.booking_reference,
        ra.status
      FROM room_assignments ra
      INNER JOIN bookings b ON ra.booking_id = b.booking_id
      INNER JOIN room_inventory ri ON ra.inventory_id = ri.inventory_id
      WHERE ra.notes = 'Migrated from existing room_bookings data'
      ORDER BY ra.assignment_id
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('\nMigrated Assignments:');
    migratedAssignments.forEach(a => {
      console.log(`  - Booking ${a.booking_reference} -> Room ${a.unit_number} (Assignment ID: ${a.assignment_id})`);
    });
    
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error('Migration failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run migration
migrateRoomAssignments();