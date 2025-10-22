const express = require('express');
const { User, Hotel, Booking, Guest } = require('../models');

const router = express.Router();

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      totalHotels: await Hotel.count({ where: { isActive: true } }),
      totalUsers: await User.count({ where: { isActive: true } }),
      totalGuests: await Guest.count(),
      totalBookings: await Booking.count(),
      activeBookings: await Booking.count({ where: { status: 'CheckedIn' } }),
      pendingBookings: await Booking.count({ where: { status: 'Pending' } })
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard',
      error: error.message
    });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { role, hotelId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (role) where.role = role;
    if (hotelId) where.hotelId = hotelId;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Hotel, as: 'hotel', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Create user (admin only)
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Update user (admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update(req.body);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Deactivate user (admin only)
router.patch('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isActive: false });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message
    });
  }
});

module.exports = router;