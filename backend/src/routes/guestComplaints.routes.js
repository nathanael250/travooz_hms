const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { GuestComplaint, GuestProfile, Booking, HMSUser } = require('../models');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/guest-complaints - List all complaints
router.get('/', [
  query('status').optional().isIn(['reported', 'investigating', 'resolved', 'escalated', 'closed']),
  query('complaint_type').optional().isString(),
  query('severity').optional().isIn(['minor', 'moderate', 'serious', 'critical']),
  query('booking_id').optional().isInt(),
  query('guest_id').optional().isInt(),
  query('assigned_to').optional().isInt()
], validate, async (req, res) => {
  try {
    const { status, complaint_type, severity, booking_id, guest_id, assigned_to } = req.query;

    const whereClause = {};

    if (status) whereClause.status = status;
    if (complaint_type) whereClause.complaint_type = complaint_type;
    if (severity) whereClause.severity = severity;
    if (booking_id) whereClause.booking_id = booking_id;
    if (guest_id) whereClause.guest_id = guest_id;
    if (assigned_to) whereClause.assigned_to = assigned_to;

    const complaints = await GuestComplaint.findAll({
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
          model: HMSUser,
          as: 'assignedStaff',
          attributes: ['hms_user_id', 'name', 'email']
        }
      ],
      order: [
        ['severity', 'DESC'],
        ['reported_at', 'DESC']
      ]
    });

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching guest complaints:', error);
    res.status(500).json({ message: 'Error fetching guest complaints', error: error.message });
  }
});

// GET /api/guest-complaints/:complaint_id - Get specific complaint
router.get('/:complaint_id', [
  param('complaint_id').isInt()
], validate, async (req, res) => {
  try {
    const { complaint_id } = req.params;

    const complaint = await GuestComplaint.findByPk(complaint_id, {
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
          model: HMSUser,
          as: 'assignedStaff',
          attributes: ['hms_user_id', 'name', 'email']
        }
      ]
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Guest complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Error fetching guest complaint:', error);
    res.status(500).json({ message: 'Error fetching guest complaint', error: error.message });
  }
});

// POST /api/guest-complaints - Create new complaint
router.post('/', [
  body('booking_id').isInt().withMessage('Booking ID is required'),
  body('guest_id').optional().isInt(),
  body('complaint_type').isIn(['room_condition', 'service', 'noise', 'cleanliness', 'staff_behavior', 'amenities', 'billing', 'other']).withMessage('Valid complaint type is required'),
  body('severity').optional().isIn(['minor', 'moderate', 'serious', 'critical']),
  body('description').notEmpty().withMessage('Description is required')
], validate, async (req, res) => {
  try {
    const complaintData = req.body;

    // Verify booking exists
    const booking = await Booking.findByPk(complaintData.booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const complaint = await GuestComplaint.create(complaintData);

    // Fetch the created complaint with associations
    const createdComplaint = await GuestComplaint.findByPk(complaint.complaint_id, {
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
      message: 'Guest complaint created successfully',
      complaint: createdComplaint
    });
  } catch (error) {
    console.error('Error creating guest complaint:', error);
    res.status(500).json({ message: 'Error creating guest complaint', error: error.message });
  }
});

// PUT /api/guest-complaints/:complaint_id - Update complaint
router.put('/:complaint_id', [
  param('complaint_id').isInt(),
  body('status').optional().isIn(['reported', 'investigating', 'resolved', 'escalated', 'closed']),
  body('severity').optional().isIn(['minor', 'moderate', 'serious', 'critical']),
  body('assigned_to').optional().isInt(),
  body('resolution').optional().isString(),
  body('compensation_offered').optional().isString(),
  body('compensation_amount').optional().isDecimal(),
  body('guest_satisfied').optional().isBoolean(),
  body('follow_up_required').optional().isBoolean(),
  body('follow_up_notes').optional().isString()
], validate, async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const updateData = req.body;

    const complaint = await GuestComplaint.findByPk(complaint_id);

    if (!complaint) {
      return res.status(404).json({ message: 'Guest complaint not found' });
    }

    // If status is being changed to resolved or closed, set resolved_at
    if ((updateData.status === 'resolved' || updateData.status === 'closed') && 
        complaint.status !== 'resolved' && complaint.status !== 'closed') {
      updateData.resolved_at = new Date();
    }

    await complaint.update(updateData);

    // Fetch updated complaint with associations
    const updatedComplaint = await GuestComplaint.findByPk(complaint_id, {
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
          model: HMSUser,
          as: 'assignedStaff',
          attributes: ['hms_user_id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Guest complaint updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Error updating guest complaint:', error);
    res.status(500).json({ message: 'Error updating guest complaint', error: error.message });
  }
});

// DELETE /api/guest-complaints/:complaint_id - Delete complaint
router.delete('/:complaint_id', [
  param('complaint_id').isInt()
], validate, async (req, res) => {
  try {
    const { complaint_id } = req.params;

    const complaint = await GuestComplaint.findByPk(complaint_id);

    if (!complaint) {
      return res.status(404).json({ message: 'Guest complaint not found' });
    }

    await complaint.destroy();

    res.json({
      message: 'Guest complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting guest complaint:', error);
    res.status(500).json({ message: 'Error deleting guest complaint', error: error.message });
  }
});

// GET /api/guest-complaints/summary/statistics - Get complaint statistics
router.get('/summary/statistics', async (req, res) => {
  try {
    const totalComplaints = await GuestComplaint.count();
    const reportedComplaints = await GuestComplaint.count({ where: { status: 'reported' } });
    const investigatingComplaints = await GuestComplaint.count({ where: { status: 'investigating' } });
    const resolvedComplaints = await GuestComplaint.count({ where: { status: 'resolved' } });
    const criticalComplaints = await GuestComplaint.count({ 
      where: { 
        severity: 'critical', 
        status: { [Op.notIn]: ['resolved', 'closed'] } 
      } 
    });

    // Complaint types breakdown
    const complaintTypes = await GuestComplaint.findAll({
      attributes: [
        'complaint_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('complaint_id')), 'count']
      ],
      group: ['complaint_type'],
      raw: true
    });

    // Severity breakdown
    const severityBreakdown = await GuestComplaint.findAll({
      attributes: [
        'severity',
        [require('sequelize').fn('COUNT', require('sequelize').col('complaint_id')), 'count']
      ],
      group: ['severity'],
      raw: true
    });

    res.json({
      totalComplaints,
      reportedComplaints,
      investigatingComplaints,
      resolvedComplaints,
      criticalComplaints,
      complaintTypes,
      severityBreakdown
    });
  } catch (error) {
    console.error('Error fetching complaint statistics:', error);
    res.status(500).json({ message: 'Error fetching complaint statistics', error: error.message });
  }
});

module.exports = router;