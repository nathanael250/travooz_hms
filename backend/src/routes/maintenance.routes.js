const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { MaintenanceRequest, MaintenanceAsset, User, Room, Homestay } = require('../models');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ============================================
// MAINTENANCE REQUESTS ROUTES
// ============================================

// GET /api/maintenance/requests - List all maintenance requests
router.get('/requests', [
  query('status').optional().isIn(['pending', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('category').optional().isString(),
  query('homestay_id').optional().isInt(),
  query('assigned_to').optional().isInt()
], validate, async (req, res) => {
  try {
    const { status, priority, category, homestay_id, assigned_to, page = 1, limit = 50 } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (category) whereClause.category = category;
    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (assigned_to) whereClause.assigned_to = assigned_to;

    // Filter by user's homestays if vendor
    if (req.user && req.user.role === 'vendor') {
      const userHomestays = await Homestay.findAll({
        where: { vendor_id: req.user.user_id },
        attributes: ['homestay_id']
      });
      const homestayIds = userHomestays.map(h => h.homestay_id);
      whereClause.homestay_id = { [Op.in]: homestayIds };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: requests } = await MaintenanceRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'room_type', 'floor']
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name']
        },
        {
          model: User,
          as: 'reportedByUser',
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email', 'phone']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['reported_date', 'DESC']
      ],
      limit: parseInt(limit),
      offset
    });

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ 
      message: 'Error fetching maintenance requests', 
      error: error.message 
    });
  }
});

// GET /api/maintenance/requests/:request_id - Get specific request
router.get('/requests/:request_id', [
  param('request_id').isInt()
], validate, async (req, res) => {
  try {
    const { request_id } = req.params;

    const request = await MaintenanceRequest.findByPk(request_id, {
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'room_type', 'floor', 'building']
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name', 'address']
        },
        {
          model: User,
          as: 'reportedByUser',
          attributes: ['user_id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    res.status(500).json({ 
      message: 'Error fetching maintenance request', 
      error: error.message 
    });
  }
});

// POST /api/maintenance/requests - Create new maintenance request
router.post('/requests', [
  body('homestay_id').isInt().withMessage('Homestay ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('category').isIn([
    'plumbing', 'electrical', 'hvac', 'furniture', 'appliance', 'structural', 'safety', 'other'
  ]).withMessage('Valid category is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('room_id').optional().isInt(),
  body('assigned_to').optional().isInt(),
  body('scheduled_date').optional().isISO8601(),
  body('estimated_cost').optional().isDecimal(),
  body('notes').optional().isString()
], validate, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      reported_by: req.user ? req.user.user_id : null,
      reported_date: new Date()
    };

    const request = await MaintenanceRequest.create(requestData);

    // Fetch created request with associations
    const createdRequest = await MaintenanceRequest.findByPk(request.request_id, {
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'room_type']
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name']
        },
        {
          model: User,
          as: 'reportedByUser',
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Maintenance request created successfully',
      request: createdRequest
    });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ 
      message: 'Error creating maintenance request', 
      error: error.message 
    });
  }
});

// PUT /api/maintenance/requests/:request_id - Update request
router.put('/requests/:request_id', [
  param('request_id').isInt(),
  body('title').optional().notEmpty(),
  body('description').optional().isString(),
  body('category').optional().isIn([
    'plumbing', 'electrical', 'hvac', 'furniture', 'appliance', 'structural', 'safety', 'other'
  ]),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  body('assigned_to').optional().isInt(),
  body('scheduled_date').optional().isISO8601(),
  body('estimated_cost').optional().isDecimal(),
  body('actual_cost').optional().isDecimal(),
  body('notes').optional().isString(),
  body('completion_notes').optional().isString()
], validate, async (req, res) => {
  try {
    const { request_id } = req.params;
    const updateData = req.body;

    const request = await MaintenanceRequest.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Handle status transitions
    if (updateData.status) {
      if (updateData.status === 'in_progress' && request.status !== 'in_progress') {
        updateData.started_date = new Date();
      } else if (updateData.status === 'completed' && request.status !== 'completed') {
        updateData.completed_date = new Date();
      }
    }

    await request.update(updateData);

    // Fetch updated request with associations
    const updatedRequest = await MaintenanceRequest.findByPk(request_id, {
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'room_type']
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name']
        },
        {
          model: User,
          as: 'reportedByUser',
          attributes: ['user_id', 'name']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Maintenance request updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({ 
      message: 'Error updating maintenance request', 
      error: error.message 
    });
  }
});

// PATCH /api/maintenance/requests/:request_id/assign - Assign request to staff
router.patch('/requests/:request_id/assign', [
  param('request_id').isInt(),
  body('assigned_to').isInt().withMessage('Staff user ID is required')
], validate, async (req, res) => {
  try {
    const { request_id } = req.params;
    const { assigned_to } = req.body;

    const request = await MaintenanceRequest.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Verify staff user exists
    const staff = await User.findByPk(assigned_to);
    if (!staff) {
      return res.status(404).json({ message: 'Staff user not found' });
    }

    await request.update({
      assigned_to,
      status: request.status === 'pending' ? 'approved' : request.status
    });

    const updatedRequest = await MaintenanceRequest.findByPk(request_id, {
      include: [
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email', 'phone']
        },
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'room_type']
        }
      ]
    });

    res.json({
      message: 'Maintenance request assigned successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error assigning maintenance request:', error);
    res.status(500).json({ 
      message: 'Error assigning maintenance request', 
      error: error.message 
    });
  }
});

// PATCH /api/maintenance/requests/:request_id/complete - Mark request as complete
router.patch('/requests/:request_id/complete', [
  param('request_id').isInt(),
  body('completion_notes').optional().isString(),
  body('actual_cost').optional().isDecimal()
], validate, async (req, res) => {
  try {
    const { request_id } = req.params;
    const { completion_notes, actual_cost } = req.body;

    const request = await MaintenanceRequest.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    if (request.status === 'completed') {
      return res.status(400).json({ message: 'Request is already completed' });
    }

    await request.update({
      status: 'completed',
      completed_date: new Date(),
      completion_notes,
      actual_cost: actual_cost || request.actual_cost
    });

    const completedRequest = await MaintenanceRequest.findByPk(request_id, {
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'room_type']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name']
        }
      ]
    });

    res.json({
      message: 'Maintenance request completed successfully',
      request: completedRequest
    });
  } catch (error) {
    console.error('Error completing maintenance request:', error);
    res.status(500).json({ 
      message: 'Error completing maintenance request', 
      error: error.message 
    });
  }
});

// DELETE /api/maintenance/requests/:request_id - Delete request
router.delete('/requests/:request_id', [
  param('request_id').isInt()
], validate, async (req, res) => {
  try {
    const { request_id } = req.params;

    const request = await MaintenanceRequest.findByPk(request_id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Only allow deletion of pending or cancelled requests
    if (!['pending', 'cancelled'].includes(request.status)) {
      return res.status(400).json({ 
        message: 'Can only delete pending or cancelled requests' 
      });
    }

    await request.destroy();

    res.json({
      message: 'Maintenance request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    res.status(500).json({ 
      message: 'Error deleting maintenance request', 
      error: error.message 
    });
  }
});

// GET /api/maintenance/dashboard - Get maintenance statistics
router.get('/dashboard', async (req, res) => {
  try {
    const { homestay_id } = req.query;
    
    const whereClause = {};
    if (homestay_id) {
      whereClause.homestay_id = homestay_id;
    }

    // Filter by user's homestays if vendor
    if (req.user && req.user.role === 'vendor') {
      const userHomestays = await Homestay.findAll({
        where: { vendor_id: req.user.user_id },
        attributes: ['homestay_id']
      });
      const homestayIds = userHomestays.map(h => h.homestay_id);
      whereClause.homestay_id = { [Op.in]: homestayIds };
    }

    const totalRequests = await MaintenanceRequest.count({ where: whereClause });
    const pendingRequests = await MaintenanceRequest.count({ 
      where: { ...whereClause, status: 'pending' } 
    });
    const inProgressRequests = await MaintenanceRequest.count({ 
      where: { ...whereClause, status: 'in_progress' } 
    });
    const completedRequests = await MaintenanceRequest.count({ 
      where: { ...whereClause, status: 'completed' } 
    });
    const urgentRequests = await MaintenanceRequest.count({
      where: {
        ...whereClause,
        priority: 'urgent',
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      }
    });

    // Requests by category
    const requestsByCategory = await MaintenanceRequest.findAll({
      where: whereClause,
      attributes: [
        'category',
        [require('sequelize').fn('COUNT', require('sequelize').col('request_id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    // Requests by priority
    const requestsByPriority = await MaintenanceRequest.findAll({
      where: whereClause,
      attributes: [
        'priority',
        [require('sequelize').fn('COUNT', require('sequelize').col('request_id')), 'count']
      ],
      group: ['priority'],
      raw: true
    });

    // Total cost
    const costData = await MaintenanceRequest.findOne({
      where: { ...whereClause, status: 'completed' },
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('actual_cost')), 'total_cost'],
        [require('sequelize').fn('AVG', require('sequelize').col('actual_cost')), 'avg_cost']
      ],
      raw: true
    });

    res.json({
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      urgentRequests,
      requestsByCategory,
      requestsByPriority,
      totalCost: costData?.total_cost || 0,
      averageCost: costData?.avg_cost || 0
    });
  } catch (error) {
    console.error('Error fetching maintenance dashboard:', error);
    res.status(500).json({ 
      message: 'Error fetching maintenance dashboard', 
      error: error.message 
    });
  }
});

// ============================================
// MAINTENANCE ASSETS ROUTES
// ============================================

// GET /api/maintenance/assets - List all assets
router.get('/assets', [
  query('status').optional().isIn(['active', 'inactive', 'retired', 'under_maintenance']),
  query('asset_type').optional().isString(),
  query('homestay_id').optional().isInt()
], validate, async (req, res) => {
  try {
    const { status, asset_type, homestay_id, page = 1, limit = 50 } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (asset_type) whereClause.asset_type = asset_type;
    if (homestay_id) whereClause.homestay_id = homestay_id;

    // Filter by user's homestays if vendor
    if (req.user && req.user.role === 'vendor') {
      const userHomestays = await Homestay.findAll({
        where: { vendor_id: req.user.user_id },
        attributes: ['homestay_id']
      });
      const homestayIds = userHomestays.map(h => h.homestay_id);
      whereClause.homestay_id = { [Op.in]: homestayIds };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: assets } = await MaintenanceAsset.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name']
        }
      ],
      order: [['asset_name', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      assets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance assets:', error);
    res.status(500).json({ 
      message: 'Error fetching maintenance assets', 
      error: error.message 
    });
  }
});

// POST /api/maintenance/assets - Create new asset
router.post('/assets', [
  body('homestay_id').isInt().withMessage('Homestay ID is required'),
  body('asset_name').notEmpty().withMessage('Asset name is required'),
  body('asset_type').optional().isString(),
  body('location').optional().isString(),
  body('purchase_date').optional().isISO8601(),
  body('warranty_expiry').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const asset = await MaintenanceAsset.create(req.body);

    const createdAsset = await MaintenanceAsset.findByPk(asset.asset_id, {
      include: [
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name']
        }
      ]
    });

    res.status(201).json({
      message: 'Maintenance asset created successfully',
      asset: createdAsset
    });
  } catch (error) {
    console.error('Error creating maintenance asset:', error);
    res.status(500).json({ 
      message: 'Error creating maintenance asset', 
      error: error.message 
    });
  }
});

// PUT /api/maintenance/assets/:asset_id - Update asset
router.put('/assets/:asset_id', [
  param('asset_id').isInt()
], validate, async (req, res) => {
  try {
    const { asset_id } = req.params;

    const asset = await MaintenanceAsset.findByPk(asset_id);

    if (!asset) {
      return res.status(404).json({ message: 'Maintenance asset not found' });
    }

    await asset.update(req.body);

    const updatedAsset = await MaintenanceAsset.findByPk(asset_id, {
      include: [
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name']
        }
      ]
    });

    res.json({
      message: 'Maintenance asset updated successfully',
      asset: updatedAsset
    });
  } catch (error) {
    console.error('Error updating maintenance asset:', error);
    res.status(500).json({ 
      message: 'Error updating maintenance asset', 
      error: error.message 
    });
  }
});

// DELETE /api/maintenance/assets/:asset_id - Delete asset
router.delete('/assets/:asset_id', [
  param('asset_id').isInt()
], validate, async (req, res) => {
  try {
    const { asset_id } = req.params;

    const asset = await MaintenanceAsset.findByPk(asset_id);

    if (!asset) {
      return res.status(404).json({ message: 'Maintenance asset not found' });
    }

    await asset.destroy();

    res.json({
      message: 'Maintenance asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maintenance asset:', error);
    res.status(500).json({ 
      message: 'Error deleting maintenance asset', 
      error: error.message 
    });
  }
});

// GET /api/maintenance/my-tasks - Get maintenance requests assigned to current user
router.get('/my-tasks', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { status } = req.query;
    const whereClause = { assigned_to: req.user.user_id };
    
    if (status) {
      whereClause.status = status;
    } else {
      // Default: show only active tasks
      whereClause.status = { [Op.notIn]: ['completed', 'cancelled'] };
    }

    const requests = await MaintenanceRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'room_type'],
          required: false
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name', 'address'],
          required: false
        },
        {
          model: User,
          as: 'reportedByUser',
          attributes: ['user_id', 'name'],
          required: false
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['reported_date', 'ASC']
      ]
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching my maintenance tasks:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json([]);
  }
});

module.exports = router;
