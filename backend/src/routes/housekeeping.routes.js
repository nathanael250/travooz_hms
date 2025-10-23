const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { HousekeepingTask, User, Room, Homestay, Booking, RoomStatusLog } = require('../models');
const housekeepingTaskService = require('../services/housekeepingTaskService');
const { sequelize } = require('../../config/database');
const { Op } = require('sequelize');
const { restrictToRoles } = require('../middlewares/roleAccess.middleware');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/housekeeping/tasks - List all housekeeping tasks
// ACCESSIBLE TO: All authenticated users (Housekeeping can view assigned tasks)
router.get('/tasks', [
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  query('task_type').optional().isString(),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  query('inventory_id').optional().isInt(),
  query('assigned_to').optional().isInt(),
  query('scheduled_time').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const { 
      status, 
      task_type, 
      priority, 
      inventory_id, 
      assigned_to,
      page = 1,
      limit = 50
    } = req.query;

    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (task_type) whereClause.task_type = task_type;
    if (priority) whereClause.priority = priority;
    if (inventory_id) whereClause.inventory_id = inventory_id;
    if (assigned_to) whereClause.assigned_to = assigned_to;

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
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email', 'phone']
        }
      ],
      order: [
        ['priority', 'DESC'],
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

// GET /api/housekeeping/tasks/:task_id - Get specific task details
// ACCESSIBLE TO: All authenticated users (Housekeeping can view their assigned task details)
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
          attributes: ['inventory_id', 'unit_number', 'room_type', 'floor']
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email', 'phone']
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
// RESTRICTED: Only Front Desk and Admin can create tasks
router.post('/tasks', 
  restrictToRoles(['front_desk', 'admin', 'hotel_manager']),
  [
    body('inventory_id').isInt().withMessage('Room/Inventory ID is required'),
    body('task_type').isIn([
      'cleaning', 
      'deep_cleaning', 
      'inspection', 
      'maintenance', 
      'turndown_service', 
      'laundry', 
      'minibar_restock'
    ]).withMessage('Valid task type is required'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('scheduled_time').isISO8601().withMessage('Valid scheduled time is required'),
    body('assigned_to').optional().isInt(),
    body('notes').optional().isString(),
    body('estimated_duration').optional().isInt()
  ], 
  validate, 
  async (req, res) => {
  try {
    const taskData = {
      ...req.body
    };

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
// ACCESSIBLE TO: All authenticated users (Housekeeping can update their assigned tasks, change status, add notes)
router.put('/tasks/:task_id', [
  param('task_id').isInt(),
  body('task_type').optional().isIn([
    'cleaning', 
    'deep_cleaning', 
    'inspection', 
    'maintenance', 
    'turndown_service', 
    'laundry', 
    'minibar_restock'
  ]),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  body('assigned_to').optional().isInt(),
  body('scheduled_time').optional().isISO8601(),
  body('notes').optional().isString(),
  body('issues_found').optional().isString(),
  body('supplies_used').optional().isString(),
  body('quality_score').optional().isInt({ min: 1, max: 5 }),
  body('inspection_notes').optional().isString()
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
        updateData.started_at = new Date();
      } else if (updateData.status === 'completed' && task.status !== 'completed') {
        updateData.completed_at = new Date();
        
        // Calculate actual duration if started_at exists
        if (task.started_at) {
          const durationMs = new Date() - new Date(task.started_at);
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
          model: User,
          as: 'assignedStaff',
          attributes: ['user_id', 'name', 'email']
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
// RESTRICTED: Only Front Desk and Admin can reassign tasks
router.patch('/tasks/:task_id/assign', 
  restrictToRoles(['front_desk', 'admin', 'hotel_manager']),
  [
    param('task_id').isInt(),
    body('assigned_to').isInt().withMessage('Staff user ID is required')
  ], 
  validate, 
  async (req, res) => {
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
      started_at: new Date()
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
  body('issues_found').optional().isString(),
  body('supplies_used').optional().isString(),
  body('quality_score').optional().isInt({ min: 1, max: 5 }),
  body('inspection_notes').optional().isString()
], validate, async (req, res) => {
  try {
    const { task_id } = req.params;
    const { issues_found, supplies_used, quality_score, inspection_notes } = req.body;

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
      completed_at: completionTime,
      issues_found,
      supplies_used,
      quality_score,
      inspection_notes
    };

    // Calculate actual duration
    if (task.started_at) {
      const durationMs = completionTime - new Date(task.started_at);
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
// RESTRICTED: Only Front Desk and Admin can delete tasks
router.delete('/tasks/:task_id', 
  restrictToRoles(['front_desk', 'admin', 'hotel_manager']),
  [
    param('task_id').isInt()
  ], 
  validate, 
  async (req, res) => {
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

// GET /api/housekeeping/pending-confirmation - Get tasks pending staff confirmation from guest requests
router.get('/pending-confirmation', async (req, res) => {
  try {
    const { assigned_to } = req.query;
    
    const tasks = await housekeepingTaskService.getPendingConfirmationTasks(
      assigned_to ? parseInt(assigned_to) : null
    );

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching pending confirmation tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending confirmation tasks',
      error: error.message
    });
  }
});

// PATCH /api/housekeeping/tasks/:task_id/confirm - Staff confirm/acknowledge a task
// ACCESSIBLE TO: Housekeeping staff (Confirms receipt of task and marks as in_progress)
// PURPOSE: When housekeeping staff sees a task assigned by front desk, they confirm it
router.patch('/tasks/:task_id/confirm', [
  param('task_id').isInt(),
  body('notes').optional().isString()
], validate, async (req, res) => {
  try {
    const { task_id } = req.params;
    const { notes } = req.body;
    const staffId = req.user?.user_id || req.body.staff_id;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required'
      });
    }

    // Update task confirmation status
    const [updated] = await sequelize.query(`
      UPDATE housekeeping_tasks 
      SET 
        confirmation_status = 'acknowledged',
        confirmed_at = NOW(),
        assigned_to = COALESCE(assigned_to, ?),
        status = 'in_progress'
      WHERE task_id = ?
    `, {
      replacements: [staffId, task_id],
      type: sequelize.QueryTypes.UPDATE
    });

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Fetch updated task
    const [task] = await sequelize.query(`
      SELECT 
        ht.*,
        ri.unit_number,
        ri.room_type,
        rb.guest_name,
        rb.guest_email,
        gr.request_id as guest_request_id,
        u.name as assigned_staff_name
      FROM housekeeping_tasks ht
      LEFT JOIN room_inventory ri ON ht.inventory_id = ri.inventory_id
      LEFT JOIN guest_requests gr ON ht.guest_request_id = gr.request_id
      LEFT JOIN room_bookings rb ON gr.booking_id = rb.booking_id
      LEFT JOIN users u ON ht.assigned_to = u.user_id
      WHERE ht.task_id = ?
    `, {
      replacements: [task_id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      message: 'Task confirmed successfully',
      task: task[0]
    });
  } catch (error) {
    console.error('Error confirming task:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming task',
      error: error.message
    });
  }
});

module.exports = router;
