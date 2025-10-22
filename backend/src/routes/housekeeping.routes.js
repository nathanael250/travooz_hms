const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { HousekeepingTask, User, Room, Homestay, Booking, RoomStatusLog } = require('../models');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/housekeeping/tasks - List all housekeeping tasks
router.get('/tasks', [
  query('status').optional().isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']),
  query('task_type').optional().isString(),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  query('homestay_id').optional().isInt(),
  query('inventory_id').optional().isInt(),
  query('assigned_to').optional().isInt(),
  query('scheduled_date').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const { 
      status, 
      task_type, 
      priority, 
      homestay_id, 
      inventory_id, 
      assigned_to,
      scheduled_date,
      page = 1,
      limit = 50
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (task_type) whereClause.task_type = task_type;
    if (priority) whereClause.priority = priority;
    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (inventory_id) whereClause.inventory_id = inventory_id;
    if (assigned_to) whereClause.assigned_to = assigned_to;
    if (scheduled_date) whereClause.scheduled_date = scheduled_date;

    // Filter by user's role and homestay access
    if (req.user && req.user.role === 'vendor') {
      // Vendors only see tasks for their homestays
      const userHomestays = await Homestay.findAll({
        where: { vendor_id: req.user.user_id },
        attributes: ['homestay_id']
      });
      const homestayIds = userHomestays.map(h => h.homestay_id);
      whereClause.homestay_id = { [Op.in]: homestayIds };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: tasks } = await HousekeepingTask.findAndCountAll({
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
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['user_id', 'name']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['scheduled_date', 'ASC'],
        ['scheduled_time', 'ASC']
      ],
      limit: parseInt(limit),
      offset
    });

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching housekeeping tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching housekeeping tasks', 
      error: error.message 
    });
  }
});

// GET /api/housekeeping/tasks/:task_id - Get specific task
router.get('/tasks/:task_id', [
  param('task_id').isInt()
], validate, async (req, res) => {
  try {
    const { task_id } = req.params;

    const task = await HousekeepingTask.findByPk(task_id, {
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
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['user_id', 'name']
        },
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['user_id', 'name']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching housekeeping task:', error);
    res.status(500).json({ 
      message: 'Error fetching housekeeping task', 
      error: error.message 
    });
  }
});

// POST /api/housekeeping/tasks - Create new housekeeping task
router.post('/tasks', [
  body('homestay_id').isInt().withMessage('Homestay ID is required'),
  body('inventory_id').optional().isInt(),
  body('task_type').isIn([
    'cleaning', 
    'deep_clean', 
    'linen_change', 
    'maintenance', 
    'inspection', 
    'setup', 
    'turndown_service', 
    'laundry', 
    'restocking'
  ]).withMessage('Valid task type is required'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('scheduled_date').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduled_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
  body('assigned_to').optional().isInt(),
  body('notes').optional().isString(),
  body('booking_id').optional().isInt()
], validate, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      assigned_by: req.user ? req.user.user_id : null
    };

    // If assigning to staff, set assignment time and status
    if (taskData.assigned_to) {
      taskData.assignment_time = new Date();
      taskData.status = 'assigned';
    }

    const task = await HousekeepingTask.create(taskData);

    // Fetch the created task with associations
    const createdTask = await HousekeepingTask.findByPk(task.task_id, {
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
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Housekeeping task created successfully',
      task: createdTask
    });
  } catch (error) {
    console.error('Error creating housekeeping task:', error);
    res.status(500).json({ 
      message: 'Error creating housekeeping task', 
      error: error.message 
    });
  }
});

// PUT /api/housekeeping/tasks/:task_id - Update task
router.put('/tasks/:task_id', [
  param('task_id').isInt(),
  body('task_type').optional().isIn([
    'cleaning', 
    'deep_clean', 
    'linen_change', 
    'maintenance', 
    'inspection', 
    'setup', 
    'turndown_service', 
    'laundry', 
    'restocking'
  ]),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']),
  body('assigned_to').optional().isInt(),
  body('scheduled_date').optional().isISO8601(),
  body('notes').optional().isString(),
  body('completion_notes').optional().isString(),
  body('issues_found').optional().isString(),
  body('quality_rating').optional().isInt({ min: 1, max: 5 })
], validate, async (req, res) => {
  try {
    const { task_id } = req.params;
    const updateData = req.body;

    const task = await HousekeepingTask.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    // Handle status transitions
    if (updateData.status) {
      if (updateData.status === 'in_progress' && task.status !== 'in_progress') {
        updateData.start_time = new Date();
      } else if (updateData.status === 'completed' && task.status !== 'completed') {
        updateData.completion_time = new Date();
        
        // Calculate actual duration if start_time exists
        if (task.start_time) {
          const durationMs = new Date() - new Date(task.start_time);
          updateData.actual_duration = Math.round(durationMs / (1000 * 60)); // minutes
        }

        // Update room status to cleaned if room is specified
        if (task.inventory_id) {
          await RoomStatusLog.create({
            inventory_id: task.inventory_id,
            status: 'cleaned',
            changed_by: req.user ? req.user.user_id : null,
            notes: `Housekeeping task #${task_id} completed`
          });
        }
      }
    }

    // Handle assignment
    if (updateData.assigned_to && updateData.assigned_to !== task.assigned_to) {
      updateData.assignment_time = new Date();
      updateData.assigned_by = req.user ? req.user.user_id : null;
      if (task.status === 'pending') {
        updateData.status = 'assigned';
      }
    }

    await task.update(updateData);

    // Fetch updated task with associations
    const updatedTask = await HousekeepingTask.findByPk(task_id, {
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
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['user_id', 'name']
        }
      ]
    });

    res.json({
      message: 'Housekeeping task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating housekeeping task:', error);
    res.status(500).json({ 
      message: 'Error updating housekeeping task', 
      error: error.message 
    });
  }
});

// PATCH /api/housekeeping/tasks/:task_id/assign - Assign task to staff
router.patch('/tasks/:task_id/assign', [
  param('task_id').isInt(),
  body('assigned_to').isInt().withMessage('Staff user ID is required')
], validate, async (req, res) => {
  try {
    const { task_id } = req.params;
    const { assigned_to } = req.body;

    const task = await HousekeepingTask.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    // Verify staff user exists
    const staff = await User.findByPk(assigned_to);
    if (!staff) {
      return res.status(404).json({ message: 'Staff user not found' });
    }

    await task.update({
      assigned_to,
      assigned_by: req.user ? req.user.user_id : null,
      assignment_time: new Date(),
      status: task.status === 'pending' ? 'assigned' : task.status
    });

    const updatedTask = await HousekeepingTask.findByPk(task_id, {
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
      message: 'Task assigned successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ 
      message: 'Error assigning task', 
      error: error.message 
    });
  }
});

// PATCH /api/housekeeping/tasks/:task_id/start - Start task
router.patch('/tasks/:task_id/start', [
  param('task_id').isInt()
], validate, async (req, res) => {
  try {
    const { task_id } = req.params;

    const task = await HousekeepingTask.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Cannot start a completed task' });
    }

    await task.update({
      status: 'in_progress',
      start_time: new Date()
    });

    res.json({
      message: 'Task started successfully',
      task
    });
  } catch (error) {
    console.error('Error starting task:', error);
    res.status(500).json({ 
      message: 'Error starting task', 
      error: error.message 
    });
  }
});

// PATCH /api/housekeeping/tasks/:task_id/complete - Complete task
router.patch('/tasks/:task_id/complete', [
  param('task_id').isInt(),
  body('completion_notes').optional().isString(),
  body('issues_found').optional().isString(),
  body('quality_rating').optional().isInt({ min: 1, max: 5 })
], validate, async (req, res) => {
  try {
    const { task_id } = req.params;
    const { completion_notes, issues_found, quality_rating } = req.body;

    const task = await HousekeepingTask.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Task is already completed' });
    }

    const completionTime = new Date();
    const updateData = {
      status: 'completed',
      completion_time: completionTime,
      completion_notes,
      issues_found,
      quality_rating
    };

    // Calculate actual duration
    if (task.start_time) {
      const durationMs = completionTime - new Date(task.start_time);
      updateData.actual_duration = Math.round(durationMs / (1000 * 60));
    }

    await task.update(updateData);

    // Update room status if room is specified
    if (task.inventory_id) {
      await RoomStatusLog.create({
        inventory_id: task.inventory_id,
        status: 'cleaned',
        changed_by: req.user ? req.user.user_id : null,
        notes: `Housekeeping task #${task_id} completed${completion_notes ? ': ' + completion_notes : ''}`
      });
    }

    const completedTask = await HousekeepingTask.findByPk(task_id, {
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
      message: 'Task completed successfully',
      task: completedTask
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ 
      message: 'Error completing task', 
      error: error.message 
    });
  }
});

// DELETE /api/housekeeping/tasks/:task_id - Delete task
router.delete('/tasks/:task_id', [
  param('task_id').isInt()
], validate, async (req, res) => {
  try {
    const { task_id } = req.params;

    const task = await HousekeepingTask.findByPk(task_id);

    if (!task) {
      return res.status(404).json({ message: 'Housekeeping task not found' });
    }

    // Only allow deletion of pending or cancelled tasks
    if (!['pending', 'cancelled'].includes(task.status)) {
      return res.status(400).json({ 
        message: 'Can only delete pending or cancelled tasks' 
      });
    }

    await task.destroy();

    res.json({
      message: 'Housekeeping task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting housekeeping task:', error);
    res.status(500).json({ 
      message: 'Error deleting housekeeping task', 
      error: error.message 
    });
  }
});

// GET /api/housekeeping/dashboard - Get housekeeping dashboard statistics
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTasks = await HousekeepingTask.count({ where: whereClause });
    const pendingTasks = await HousekeepingTask.count({ 
      where: { ...whereClause, status: 'pending' } 
    });
    const assignedTasks = await HousekeepingTask.count({ 
      where: { ...whereClause, status: 'assigned' } 
    });
    const inProgressTasks = await HousekeepingTask.count({ 
      where: { ...whereClause, status: 'in_progress' } 
    });
    const completedToday = await HousekeepingTask.count({
      where: {
        ...whereClause,
        status: 'completed',
        completion_time: { [Op.gte]: today }
      }
    });
    const urgentTasks = await HousekeepingTask.count({
      where: {
        ...whereClause,
        priority: 'urgent',
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      }
    });
    const overdueTasks = await HousekeepingTask.count({
      where: {
        ...whereClause,
        scheduled_date: { [Op.lt]: today },
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      }
    });

    // Task types breakdown
    const taskTypes = await HousekeepingTask.findAll({
      where: whereClause,
      attributes: [
        'task_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('task_id')), 'count']
      ],
      group: ['task_type'],
      raw: true
    });

    // Staff performance (tasks completed today)
    const staffPerformance = await HousekeepingTask.findAll({
      where: {
        ...whereClause,
        status: 'completed',
        completion_time: { [Op.gte]: today }
      },
      attributes: [
        'assigned_to',
        [require('sequelize').fn('COUNT', require('sequelize').col('task_id')), 'completed_count'],
        [require('sequelize').fn('AVG', require('sequelize').col('actual_duration')), 'avg_duration']
      ],
      include: [
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name']
        }
      ],
      group: ['assigned_to', 'assignedStaff.user_id'],
      raw: false
    });

    res.json({
      totalTasks,
      pendingTasks,
      assignedTasks,
      inProgressTasks,
      completedToday,
      urgentTasks,
      overdueTasks,
      taskTypes,
      staffPerformance
    });
  } catch (error) {
    console.error('Error fetching housekeeping dashboard:', error);
    res.status(500).json({ 
      message: 'Error fetching housekeeping dashboard', 
      error: error.message 
    });
  }
});

// GET /api/housekeeping/my-tasks - Get tasks assigned to current user
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

    const tasks = await HousekeepingTask.findAll({
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
          attributes: ['homestay_id', 'name', 'address']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['scheduled_date', 'ASC'],
        ['scheduled_time', 'ASC']
      ]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching my tasks', 
      error: error.message 
    });
  }
});

module.exports = router;
