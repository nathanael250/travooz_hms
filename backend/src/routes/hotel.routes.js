const express = require('express');
const hotelController = require('../controllers/hotel.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Public hotel routes (for all authenticated users)
router.get('/select', hotelController.getHotelsForSelect);
router.get('/my-hotel', hotelController.getMyHotel);
router.get('/my-hotel/stats', hotelController.getMyHotelStats);

// Hotel management routes (admin only)
router.get('/', adminMiddleware, hotelController.getHotels);
router.post('/', adminMiddleware, hotelController.createHotel);
router.get('/:id', adminMiddleware, hotelController.getHotelById);
router.put('/:id', adminMiddleware, hotelController.updateHotel);
router.delete('/:id', adminMiddleware, hotelController.deleteHotel);

// Hotel statistics (admin only)
router.get('/:id/stats', adminMiddleware, hotelController.getHotelStats);

// Hotel amenities and policies (admin only)
router.put('/:id/amenities', adminMiddleware, hotelController.updateHotelAmenities);
router.put('/:id/policies', adminMiddleware, hotelController.updateHotelPolicies);

module.exports = router;
