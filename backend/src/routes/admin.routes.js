const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, adminOnly } = require('../middlewares/auth.middleware');

/**
 * ADMIN ROUTES
 * All routes require authentication and admin role
 * Routes for advanced admin operations including rate overrides and confirmations
 */

// Apply admin authentication middleware to all routes
router.use(authenticateToken);
router.use(adminOnly);

/**
 * Checkout Rate Overrides
 */

// Apply a rate override for checkout
router.post('/checkout/override', adminController.applyRateOverride);

// Confirm checkout rate (no override, just confirmation)
router.post('/checkout/confirm-rate', adminController.confirmCheckoutRate);

// Get history of all overrides
router.get('/overrides', adminController.getOverridesHistory);

// Get history of all confirmations
router.get('/confirmations', adminController.getConfirmationsHistory);

// Reverse a previously applied override
router.post('/overrides/:override_id/reverse', adminController.reverseOverride);

module.exports = router;