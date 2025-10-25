const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { sequelize, testConnection } = require('../config/database');

// Import middlewares
const authMiddleware = require('./middlewares/auth.middleware');
const adminMiddleware = require('./middlewares/admin.middleware');
const loggingMiddleware = require('./middlewares/logging.middleware');

// Import routes (only auth for now)
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const homestayRoutes = require('./routes/homestay.routes');
const roomRoutes = require('./routes/room.routes');
const roomRateRoutes = require('./routes/roomRate.routes');
const roomAvailabilityRoutes = require('./routes/roomAvailability.routes');
const roomStatusLogRoutes = require('./routes/roomStatusLog.routes');
const roomAssignmentRoutes = require('./routes/roomAssignment.routes');
const roomBookingRoutes = require('./routes/roomBooking.routes');
// const hotelRoutes = require('./routes/hotel.routes');
const guestRoutes = require('./routes/guest.routes');
const guestRequestsRoutes = require('./routes/guestRequests.routes');
const bookingRoutes = require('./routes/booking.routes');
const bookingManagementRoutes = require('./routes/bookingManagement.routes');
const bookingChargesRoutes = require('./routes/bookingCharges.routes');
const bookingGuestsRoutes = require('./routes/bookingGuests.routes');
const bookingModificationsRoutes = require('./routes/bookingModifications.routes');
const multiRoomBookingsRoutes = require('./routes/multiRoomBookings.routes');
const externalBookingsRoutes = require('./routes/externalBookings.routes');
const financialAccountRoutes = require('./routes/financialAccount.routes');
const guestProfilesRoutes = require('./routes/guestProfiles.routes');
const guestComplaintsRoutes = require('./routes/guestComplaints.routes');
const guestReviewsRoutes = require('./routes/guestReviews.routes');
const userFavoritesRoutes = require('./routes/userFavorites.routes');
const housekeepingRoutes = require('./routes/housekeeping.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const stockRoutes = require('./routes/stock.routes');
const stockManagementRoutes = require('./routes/stockManagement.routes');
const frontDeskRoutes = require('./routes/frontDesk.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const reportsRoutes = require('./routes/reports.routes');
const locationRoutes = require('./routes/location.routes');
const hmsUserRoutes = require('./routes/hmsUser.routes');
const receptionistRoutes = require('./routes/receptionist.routes');
const adminRoutes = require('./routes/admin.routes');
const invoiceSettingsRoutes = require('./routes/invoiceSettings.routes');
const reportSettingsRoutes = require('./routes/reportSettings.routes');
// const inventoryRoutes = require('./routes/housekeeping.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting - more lenient in development
const isDevelopment = process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100), // Very high limit in development
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3001", "http://localhost:5173"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(loggingMiddleware);

// Static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HMS Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes (only auth for now)
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/homestays', homestayRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-rates', authMiddleware, roomRateRoutes);
app.use('/api/room-availability', roomAvailabilityRoutes); // Public read, protected write
app.use('/api/room-status-logs', authMiddleware, roomStatusLogRoutes);
app.use('/api/room-assignment', roomAssignmentRoutes);
app.use('/api/room-assignments', roomAssignmentRoutes); // Alias for plural form
app.use('/api/room-booking', roomBookingRoutes);
app.use('/api/room-bookings', roomBookingRoutes); // Alias for plural form
// app.use('/api/hotels', hotelRoutes);
app.use('/api/guests', authMiddleware, guestRoutes);
app.use('/api/guest-requests', authMiddleware, guestRequestsRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
app.use('/api/booking-management', authMiddleware, bookingManagementRoutes);
app.use('/api/booking-charges', authMiddleware, bookingChargesRoutes);
app.use('/api/booking-guests', authMiddleware, bookingGuestsRoutes);
app.use('/api/booking-modifications', authMiddleware, bookingModificationsRoutes);
app.use('/api/multi-room-bookings', authMiddleware, multiRoomBookingsRoutes);
app.use('/api/external-bookings', authMiddleware, externalBookingsRoutes);
app.use('/api/financial-accounts', authMiddleware, financialAccountRoutes);
app.use('/api/financial/accounts', authMiddleware, financialAccountRoutes); // Alias for frontend
app.use('/api/guest-profiles', authMiddleware, guestProfilesRoutes);
app.use('/api/guest-requests', authMiddleware, guestRequestsRoutes);
app.use('/api/guest-complaints', authMiddleware, guestComplaintsRoutes);
app.use('/api/guest-reviews', authMiddleware, guestReviewsRoutes);
app.use('/api/user-favorites', authMiddleware, userFavoritesRoutes);
app.use('/api/housekeeping', authMiddleware, housekeepingRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);
app.use('/api/restaurant', authMiddleware, restaurantRoutes);
app.use('/api/stock', authMiddleware, stockRoutes);
app.use('/api', authMiddleware, stockManagementRoutes);
app.use('/api/front-desk', authMiddleware, frontDeskRoutes);
app.use('/api/invoices', authMiddleware, invoiceRoutes);
app.use('/api/invoice-settings', invoiceSettingsRoutes);
app.use('/api/report-settings', reportSettingsRoutes);
app.use('/api/reports', authMiddleware, reportsRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/hms-users', hmsUserRoutes);
app.use('/api/receptionist', authMiddleware, receptionistRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
// app.use('/api/inventory', authMiddleware, inventoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;