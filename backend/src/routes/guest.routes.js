const express = require('express');
const { Guest } = require('../models');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all guests
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (search) {
      where = {
        [require('sequelize').Op.or]: [
          { firstName: { [require('sequelize').Op.like]: `%${search}%` } },
          { lastName: { [require('sequelize').Op.like]: `%${search}%` } },
          { email: { [require('sequelize').Op.like]: `%${search}%` } },
          { phone: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: guests } = await Guest.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        guests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Fetch guests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guests',
      error: error.message
    });
  }
});

// Get guest by ID
router.get('/:id', async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id, {
      include: [
        {
          model: require('../models').Booking,
          as: 'bookings',
          include: [
            {
              model: require('../models').Room,
              as: 'room',
              include: [{
                model: require('../models').Hotel,
                as: 'hotel',
                attributes: ['id', 'name']
              }]
            }
          ]
        }
      ]
    });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.json({
      success: true,
      data: { guest }
    });
  } catch (error) {
    console.error('Fetch guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest',
      error: error.message
    });
  }
});

// Create guest
router.post('/', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
], handleValidationErrors, async (req, res) => {
  try {
    const guest = await Guest.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Guest created successfully',
      data: { guest }
    });
  } catch (error) {
    console.error('Create guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create guest',
      error: error.message
    });
  }
});

// Update guest
router.put('/:id', async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    await guest.update(req.body);

    res.json({
      success: true,
      message: 'Guest updated successfully',
      data: { guest }
    });
  } catch (error) {
    console.error('Update guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update guest',
      error: error.message
    });
  }
});

module.exports = router;