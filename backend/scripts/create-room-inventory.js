const { Room } = require('../src/models');
const { sequelize } = require('../config/database');

const createRoomInventory = async () => {
  try {
    console.log('🏨 Creating room inventory...');

    // Sample room data
    const rooms = [
      {
        room_type_id: 1,
        unit_number: '101',
        floor: '1',
        status: 'available',
        notes: 'Standard single room'
      },
      {
        room_type_id: 1,
        unit_number: '102',
        floor: '1', 
        status: 'available',
        notes: 'Standard single room'
      },
      {
        room_type_id: 2,
        unit_number: '201',
        floor: '2',
        status: 'available',
        notes: 'Standard double room'
      },
      {
        room_type_id: 2,
        unit_number: '202',
        floor: '2',
        status: 'available',
        notes: 'Standard double room'
      },
      {
        room_type_id: 3,
        unit_number: '301',
        floor: '3',
        status: 'available',
        notes: 'Suite room'
      }
    ];

    // Delete existing rooms first
    await Room.destroy({ where: {} });
    console.log('🗑️ Cleared existing room inventory');

    // Create new rooms
    const createdRooms = await Room.bulkCreate(rooms);
    console.log(`✅ Created ${createdRooms.length} rooms`);

    // Display created rooms
    const allRooms = await Room.findAll();
    console.log('🏨 Current room inventory:');
    allRooms.forEach(room => {
      console.log(`  - Room ${room.unit_number} (Type: ${room.room_type_id}, Status: ${room.status})`);
    });

    console.log('✅ Room inventory setup complete!');
  } catch (error) {
    console.error('❌ Error creating room inventory:', error);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  createRoomInventory();
}

module.exports = createRoomInventory;