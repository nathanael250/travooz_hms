const app = require('./src/app');
const { testConnection, sequelize } = require('./config/database');

const PORT = process.env.PORT || 3001;

// Test database connection and sync models before starting server
const startServer = async () => {
  try {
    // Test connection
    await testConnection();
    
    // Skip model sync since we already have the database schema
    // await sequelize.sync({ force: false, alter: false });
    
    console.log('✅ Database connection established successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 HMS Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});