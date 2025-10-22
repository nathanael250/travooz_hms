#!/usr/bin/env node

const { sequelize } = require('../config/database');
const { createBookingSeeds, clearBookingData } = require('./booking-seed-data');

async function runSeeds() {
  try {
    console.log('🚀 Starting seed process...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Get command line arguments
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear') || args.includes('-c');
    const shouldForce = args.includes('--force') || args.includes('-f');

    if (shouldClear || shouldForce) {
      await clearBookingData();
    }

    // Create booking seed data
    await createBookingSeeds();

    console.log('🎉 Seed process completed successfully!');
    
  } catch (error) {
    console.error('💥 Seed process failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the seeder
runSeeds();