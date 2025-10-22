const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User } = require('../src/models');

async function createTestUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: 'admin@travooz.com' }
    });

    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      // Update the user
      await existingUser.update({
        password_hash: hashedPassword,
        is_active: true
      });
      
      console.log('✅ User password updated successfully!');
      console.log('📧 Email: admin@travooz.com');
      console.log('🔑 Password: admin123');
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 12);

      // Create test user
      const user = await User.create({
        email: 'admin@travooz.com',
        password_hash: hashedPassword,
        name: 'Vendor',
        role: 'vendor',
        phone: '+1234567890',
        address: '123 Test Street',
        gender: 'male',
        is_active: true,
        email_verified: true
      });

      console.log('✅ Test user created successfully!');
      console.log('📧 Email: admin@travooz.com');
      console.log('🔑 Password: admin123');
      console.log('👤 User ID:', user.user_id);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();