const express = require('express');
const router = express.Router();
const hmsUserController = require('../controllers/hmsUser.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware to check if user is authenticated
router.use(authMiddleware);

// Create new HMS User
router.post('/', hmsUserController.createHMSUser);

// Get all HMS Users (with filters)
router.get('/', hmsUserController.getHMSUsers);

// Get single HMS User
router.get('/:hms_user_id', hmsUserController.getHMSUserById);

// Update HMS User
router.put('/:hms_user_id', hmsUserController.updateHMSUser);

// Change password
router.post('/:hms_user_id/change-password', hmsUserController.changeHMSUserPassword);

// Deactivate HMS User
router.patch('/:hms_user_id/deactivate', hmsUserController.deactivateHMSUser);

// Delete HMS User
router.delete('/:hms_user_id', hmsUserController.deleteHMSUser);

// ✅ NEW: Diagnose users with missing hotel assignment
router.get('/diagnose/missing-hotel', hmsUserController.diagnoseMissingHotelAssignment);

// ✅ NEW: Bulk assign hotel to users
router.post('/bulk/assign-hotel', hmsUserController.bulkAssignHotel);

module.exports = router;