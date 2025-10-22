const express = require('express');
const router = express.Router();
const homestayController = require('../controllers/homestay.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');

// Remove global auth middleware; protect individual routes as needed

// GET /api/homestays - Get all homestays for the current user  
router.get('/', homestayController.getHomestays);

// GET /api/homestays/:id - Get single homestay
router.get('/:id', homestayController.getHomestayById);

// POST /api/homestays - Create new homestay
router.post('/', uploadMiddleware.homestayCreation, homestayController.createHomestay);

// PUT /api/homestays/:id - Update homestay
router.put('/:id', homestayController.updateHomestay);

// GET /api/homestays/:id/check-dependencies - Check for related rooms before deletion
router.get('/:id/check-dependencies', homestayController.checkHomestayDependencies);

// DELETE /api/homestays/:id - Delete homestay
router.delete('/:id', homestayController.deleteHomestay);

// POST /api/homestays/:id/room-types - Create new room type for homestay
router.post('/:id/room-types', uploadMiddleware.homestayCreation, homestayController.createRoomType);

// GET /api/homestays/:id/room-types - Get room types for homestay
router.get('/:id/room-types', homestayController.getRoomTypes);

// PUT /api/homestays/:id/room-types/:roomTypeId - Update room type
router.put('/:id/room-types/:roomTypeId', uploadMiddleware.homestayCreation, homestayController.updateRoomType);

// DELETE /api/homestays/:id/room-types/:roomTypeId - Delete room type
router.delete('/:id/room-types/:roomTypeId', homestayController.deleteRoomType);

// GET /api/homestays/:id/stay-view - Get stay view data (bookings timeline)
router.get('/:id/stay-view', homestayController.getStayView);

// GET /api/homestays/:id/restaurants - Get restaurants for homestay
router.get('/:id/restaurants', async (req, res) => {
  try {
    const { sequelize } = require('../../config/database');
    const restaurants = await sequelize.query(
      'SELECT * FROM hotel_restaurants WHERE homestay_id = ? ORDER BY name ASC',
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
  }
});

module.exports = router;