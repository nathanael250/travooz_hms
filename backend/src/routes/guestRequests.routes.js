const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { GuestRequest, GuestProfile, Booking, User } = require('../models');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/guest-requests - List all guest requests
router.get('/', [
  query('status').optional().isIn(['pending', 'acknowledged', 'in_progress', 'completed', 'cancelled']),
  query('request_type').optional().isString(),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  query('booking_id').optional().isInt(),
  query('guest_id').optional().isInt(),
  query('assigned_to').optional().isInt()
], validate, async (req, res) => {
  try {
    const { status, request_type, priority, booking_id, guest_id, assigned_to } = req.query;

    const whereClause = {};

    if (status) whereClause.status = status;
    if (request_type) whereClause.request_type = request_type;
    if (priority) whereClause.priority = priority;
    if (booking_id) whereClause.booking_id = booking_id;
    if (guest_id) whereClause.guest_id = guest_id;
    if (assigned_to) whereClause.assigned_to = assigned_to;

    const requests = await GuestRequest.findAll({
      where: whereClause,
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: ['guest_id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status', 'created_at']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['requested_time', 'DESC']
      ]
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching guest requests:', error);
    res.status(500).json({ message: 'Error fetching guest requests', error: error.message });
  }
});

// GET /api/guest-requests/:request_id - Get specific request
router.get('/:request_id', [
  param('request_id').isInt()
], validate, async (req, res) => {
  try {
    const { request_id } = req.params;

    const request = await GuestRequest.findByPk(request_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: ['guest_id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status', 'created_at']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Guest request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching guest request:', error);
    res.status(500).json({ message: 'Error fetching guest request', error: error.message });
  }
});

// POST /api/guest-requests - Create new request
router.post('/', [
  body('booking_id').isInt().withMessage('Booking ID is required'),
  body('guest_id').optional().isInt(),
  body('request_type').isIn(['room_service', 'housekeeping', 'maintenance', 'amenity', 'wake_up_call', 'transportation', 'concierge', 'other']).withMessage('Valid request type is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('scheduled_time').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const requestData = req.body;

    // Verify booking exists
    const booking = await Booking.findByPk(requestData.booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const request = await GuestRequest.create(requestData);

    // Fetch the created request with associations
    const createdRequest = await GuestRequest.findByPk(request.request_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: ['guest_id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status', 'created_at']
        }
      ]
    });

    res.status(201).json({
      message: 'Guest request created successfully',
      request: createdRequest
    });
  } catch (error) {
    console.error('Error creating guest request:', error);
    res.status(500).json({ message: 'Error creating guest request', error: error.message });
  }
});

// PUT /api/guest-requests/:request_id - Update request
router.put('/:request_id', [
  param('request_id').isInt(),
  body('status').optional().isIn(['pending', 'acknowledged', 'in_progress', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('assigned_to').optional().isInt(),
  body('scheduled_time').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const { request_id } = req.params;
    const updateData = req.body;

    const request = await GuestRequest.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ message: 'Guest request not found' });
    }

    // If status is being changed to completed, set completed_time
    if (updateData.status === 'completed' && request.status !== 'completed') {
      updateData.completed_time = new Date();
    }

    await request.update(updateData);

    // Fetch updated request with associations
    const updatedRequest = await GuestRequest.findByPk(request_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: ['guest_id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status', 'created_at']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Guest request updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating guest request:', error);
    res.status(500).json({ message: 'Error updating guest request', error: error.message });
  }
});

// DELETE /api/guest-requests/:request_id - Delete request
router.delete('/:request_id', [
  param('request_id').isInt()
], validate, async (req, res) => {
  try {
    const { request_id } = req.params;

    const request = await GuestRequest.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ message: 'Guest request not found' });
    }

    await request.destroy();

    res.json({
      message: 'Guest request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting guest request:', error);
    res.status(500).json({ message: 'Error deleting guest request', error: error.message });
  }
});

// GET /api/guest-requests/summary/statistics - Get request statistics
router.get('/summary/statistics', async (req, res) => {
  try {
    const totalRequests = await GuestRequest.count();
    const pendingRequests = await GuestRequest.count({ where: { status: 'pending' } });
    const inProgressRequests = await GuestRequest.count({ where: { status: 'in_progress' } });
    const completedRequests = await GuestRequest.count({ where: { status: 'completed' } });
    const urgentRequests = await GuestRequest.count({ where: { priority: 'urgent', status: { [Op.notIn]: ['completed', 'cancelled'] } } });

    // Request types breakdown
    const requestTypes = await GuestRequest.findAll({
      attributes: [
        'request_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('request_id')), 'count']
      ],
      group: ['request_type'],
      raw: true
    });

    res.json({
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      urgentRequests,
      requestTypes
    });
  } catch (error) {
    console.error('Error fetching request statistics:', error);
    res.status(500).json({ message: 'Error fetching request statistics', error: error.message });
  }
});

module.exports = router;