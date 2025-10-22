// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Get comprehensive dashboard data
router.get('/', dashboardController.getDashboardData);
router.get('/data', dashboardController.getDashboardData);

// Get booking statistics
router.get('/bookings/stats', dashboardController.getBookingStats);

// Get revenue statistics
router.get('/revenue/stats', dashboardController.getRevenueStats);

module.exports = router;