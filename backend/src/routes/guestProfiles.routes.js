const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { GuestProfile, Booking, BookingGuest, GuestRequest, GuestComplaint, GuestReview } = require('../models');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/guest-profiles - List all guest profiles
router.get('/', [
  query('search').optional().isString(),
  query('vip_status').optional().isBoolean(),
  query('blacklisted').optional().isBoolean(),
  query('nationality').optional().isString()
], validate, async (req, res) => {
  try {
    const { search, vip_status, blacklisted, nationality } = req.query;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { id_number: { [Op.like]: `%${search}%` } }
      ];
    }

    if (vip_status !== undefined) {
      whereClause.vip_status = vip_status === 'true';
    }

    if (blacklisted !== undefined) {
      whereClause.blacklisted = blacklisted === 'true';
    }

    if (nationality) {
      whereClause.nationality = nationality;
    }

    const guests = await GuestProfile.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json(guests);
  } catch (error) {
    console.error('Error fetching guest profiles:', error);
    res.status(500).json({ message: 'Error fetching guest profiles', error: error.message });
  }
});

// GET /api/guest-profiles/:guest_id - Get specific guest profile
router.get('/:guest_id', [
  param('guest_id').isInt()
], validate, async (req, res) => {
  try {
    const { guest_id } = req.params;

    const guest = await GuestProfile.findByPk(guest_id, {
      include: [
        {
          model: BookingGuest,
          as: 'bookings',
          include: [{
            model: Booking,
            as: 'booking'
          }]
        },
        {
          model: GuestRequest,
          as: 'requests',
          limit: 10,
          order: [['requested_time', 'DESC']]
        },
        {
          model: GuestComplaint,
          as: 'complaints',
          limit: 10,
          order: [['reported_at', 'DESC']]
        },
        {
          model: GuestReview,
          as: 'reviews',
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!guest) {
      return res.status(404).json({ message: 'Guest profile not found' });
    }

    res.json(guest);
  } catch (error) {
    console.error('Error fetching guest profile:', error);
    res.status(500).json({ message: 'Error fetching guest profile', error: error.message });
  }
});

// POST /api/guest-profiles - Create new guest profile
router.post('/', [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('country').optional().isString(),
  body('city').optional().isString(),
  body('nationality').optional().isString(),
  body('id_type').optional().isString(),
  body('id_number').optional().isString()
], validate, async (req, res) => {
  try {
    const guestData = req.body;

    // Check for duplicate email
    const existingGuest = await GuestProfile.findOne({
      where: { email: guestData.email }
    });

    if (existingGuest) {
      return res.status(400).json({ message: 'Guest with this email already exists' });
    }

    const guest = await GuestProfile.create(guestData);

    res.status(201).json({
      message: 'Guest profile created successfully',
      guest
    });
  } catch (error) {
    console.error('Error creating guest profile:', error);
    res.status(500).json({ message: 'Error creating guest profile', error: error.message });
  }
});

// PUT /api/guest-profiles/:guest_id - Update guest profile
router.put('/:guest_id', [
  param('guest_id').isInt(),
  body('email').optional().isEmail()
], validate, async (req, res) => {
  try {
    const { guest_id } = req.params;
    const updateData = req.body;

    const guest = await GuestProfile.findByPk(guest_id);

    if (!guest) {
      return res.status(404).json({ message: 'Guest profile not found' });
    }

    // Check for duplicate email if email is being updated
    if (updateData.email && updateData.email !== guest.email) {
      const existingGuest = await GuestProfile.findOne({
        where: {
          email: updateData.email,
          guest_id: { [Op.ne]: guest_id }
        }
      });

      if (existingGuest) {
        return res.status(400).json({ message: 'Guest with this email already exists' });
      }
    }

    await guest.update(updateData);

    res.json({
      message: 'Guest profile updated successfully',
      guest
    });
  } catch (error) {
    console.error('Error updating guest profile:', error);
    res.status(500).json({ message: 'Error updating guest profile', error: error.message });
  }
});

// DELETE /api/guest-profiles/:guest_id - Delete guest profile
router.delete('/:guest_id', [
  param('guest_id').isInt()
], validate, async (req, res) => {
  try {
    const { guest_id } = req.params;

    const guest = await GuestProfile.findByPk(guest_id);

    if (!guest) {
      return res.status(404).json({ message: 'Guest profile not found' });
    }

    await guest.destroy();

    res.json({
      message: 'Guest profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting guest profile:', error);

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: 'Cannot delete guest with existing bookings or records'
      });
    }

    res.status(500).json({ message: 'Error deleting guest profile', error: error.message });
  }
});

// GET /api/guest-profiles/statistics/summary - Get guest statistics
router.get('/summary/statistics', async (req, res) => {
  try {
    const totalGuests = await GuestProfile.count();
    const vipGuests = await GuestProfile.count({ where: { vip_status: true } });
    const blacklistedGuests = await GuestProfile.count({ where: { blacklisted: true } });

    // Top nationalities
    const nationalityStats = await GuestProfile.findAll({
      attributes: [
        'nationality',
        [require('sequelize').fn('COUNT', require('sequelize').col('guest_id')), 'count']
      ],
      where: {
        nationality: { [Op.ne]: null }
      },
      group: ['nationality'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('guest_id')), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      totalGuests,
      vipGuests,
      blacklistedGuests,
      activeGuests: totalGuests - blacklistedGuests,
      topNationalities: nationalityStats
    });
  } catch (error) {
    console.error('Error fetching guest statistics:', error);
    res.status(500).json({ message: 'Error fetching guest statistics', error: error.message });
  }
});

module.exports = router;
