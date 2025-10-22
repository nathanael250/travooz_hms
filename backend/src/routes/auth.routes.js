const express = require('express');
const authController = require('../controllers/auth.controller');
const { authLimiter, apiLimiter, profileLimiter } = require('../middlewares/rateLimiter.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { User } = require('../models');

const router = express.Router();

// Authentication routes with strict rate limiting
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.post('/verify-token', authLimiter, authController.verifyToken);

// User profile routes with lenient rate limiting (frequently accessed)
router.get('/profile', profileLimiter, authMiddleware, authController.getProfile);
router.put('/profile', profileLimiter, authMiddleware, authController.updateProfile);
router.get('/me', profileLimiter, authMiddleware, authController.getCurrentUser);

// Other protected routes
router.post('/logout', apiLimiter, authMiddleware, authController.logout);
router.post('/change-password', apiLimiter, authMiddleware, authController.changePassword);

// Get users (for staff assignment, etc.)
router.get('/users', apiLimiter, authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    
    const whereClause = { is_active: true };
    if (role) {
      whereClause.role = role;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['user_id', 'name', 'email', 'role', 'phone'],
      order: [['name', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
});

module.exports = router;
