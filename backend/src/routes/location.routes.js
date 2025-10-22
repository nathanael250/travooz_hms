const express = require('express');
const router = express.Router();
const { getAllLocations, getLocationById } = require('../controllers/location.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/', getAllLocations);
router.get('/:id', getLocationById);

module.exports = router;