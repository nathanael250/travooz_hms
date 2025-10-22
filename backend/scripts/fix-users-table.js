const { sequelize } = require('../config/database');
require('dotenv').config();

const fixUsersTable = async () => {
  try {
    console.log('🔧 Fixing users table indexes...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Drop all indexes on users table except PRIMARY
    await sequelize.query(`
      SELECT CONCAT('DROP INDEX \`', index_name, '\` ON \`users\`;') as drop_statement
      FROM information_schema.statistics 
      WHERE table_schema = '${process.env.DB_NAME}' 
      AND table_name = 'users' 
      AND index_name != 'PRIMARY'
      GROUP BY index_name;
    `);
    
    // Get all non-primary indexes
    const [results] = await sequelize.query(`
      SELECT DISTINCT index_name
      FROM information_schema.statistics 
      WHERE table_schema = '${process.env.DB_NAME}' 
      AND table_name = 'users' 
      AND index_name != 'PRIMARY';
    `);
    
    console.log(`📊 Found ${results.length} non-primary indexes to drop`);
    
    // Drop each index
    for (const result of results) {
      try {
        await sequelize.query(`DROP INDEX \`${result.index_name}\` ON \`users\``);
        console.log(`✅ Dropped index: ${result.index_name}`);
      } catch (error) {
        console.log(`⚠️  Could not drop index ${result.index_name}:`, error.message);
      }
    }
    
    // Now recreate only the necessary unique index for email
    try {
      await sequelize.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`users_email_unique\` (\`email\`)`);
      console.log('✅ Recreated email unique index');
    } catch (error) {
      console.log('⚠️  Email index might already exist:', error.message);
    }
    
    console.log('🎉 Users table fixed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing users table:', error);
    process.exit(1);
  }
};

fixUsersTable();