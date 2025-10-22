const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Op } = require('sequelize');
const RoomStatusLog = require('../models/roomStatusLog.model');
const Room = require('../models/room.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all status logs with optional filtering
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { inventory_id, status, limit = 50, offset = 0 } = req.query;
    
    const whereClause = {};
    if (inventory_id) whereClause.inventory_id = inventory_id;
    if (status) whereClause.new_status = status;

    const statusLogs = await RoomStatusLog.findAll({
      where: whereClause,
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['inventory_id', 'unit_number', 'floor', 'status']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: statusLogs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await RoomStatusLog.count({ where: whereClause })
      }
    });
  } catch (error) {
    console.error('Error fetching status logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status logs',
      error: error.message
    });
  }
});

// Get status logs for a specific room
router.get('/room/:inventory_id', authMiddleware, [
  param('inventory_id').isInt({ min: 1 }).withMessage('Valid inventory ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { inventory_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Check if room exists
    const room = await Room.findByPk(inventory_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const statusLogs = await RoomStatusLog.findAll({
      where: { inventory_id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        room: {
          inventory_id: room.inventory_id,
          unit_number: room.unit_number,
          floor: room.floor,
          current_status: room.status
        },
        logs: statusLogs
      },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await RoomStatusLog.count({ where: { inventory_id } })
      }
    });
  } catch (error) {
    console.error('Error fetching room status logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room status logs',
      error: error.message
    });
  }
});

// Create a new status log entry and update room status
router.post('/', authMiddleware, [
  body('inventory_id')
    .isInt({ min: 1 })
    .withMessage('Valid inventory ID is required'),
  body('new_status')
    .isIn(['available', 'occupied', 'reserved', 'maintenance', 'out_of_order', 'cleaning'])
    .withMessage('Valid status is required'),
  body('reason')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Reason must not exceed 255 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { inventory_id, new_status, reason, notes } = req.body;
    const changed_by = req.user.id;

    // Get current room status
    const room = await Room.findByPk(inventory_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const previous_status = room.status;

    // Don't create log if status hasn't changed
    if (previous_status === new_status) {
      return res.status(400).json({
        success: false,
        message: 'Room is already in the specified status'
      });
    }

    // Start transaction
    const transaction = await RoomStatusLog.sequelize.transaction();

    try {
      // Create status log entry
      const statusLog = await RoomStatusLog.create({
        inventory_id,
        previous_status,
        new_status,
        changed_by,
        reason,
        notes
      }, { transaction });

      // Update room status
      await room.update({
        status: new_status,
        // Update maintenance/cleaning timestamps if relevant
        ...(new_status === 'cleaning' && { last_cleaned: new Date() }),
        ...(new_status === 'maintenance' && { last_maintenance: new Date() })
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Room status updated successfully',
        data: statusLog
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating status log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room status',
      error: error.message
    });
  }
});

// Get status change statistics
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const whereClause = {};
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // Get status distribution
    const statusStats = await RoomStatusLog.findAll({
      attributes: [
        'new_status',
        [RoomStatusLog.sequelize.fn('COUNT', RoomStatusLog.sequelize.col('log_id')), 'count']
      ],
      where: whereClause,
      group: ['new_status'],
      raw: true
    });

    // Get most active rooms
    const roomActivity = await RoomStatusLog.findAll({
      attributes: [
        'inventory_id',
        [RoomStatusLog.sequelize.fn('COUNT', RoomStatusLog.sequelize.col('log_id')), 'changes']
      ],
      where: whereClause,
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['unit_number', 'floor']
        }
      ],
      group: ['inventory_id'],
      order: [[RoomStatusLog.sequelize.literal('changes'), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        status_distribution: statusStats,
        most_active_rooms: roomActivity,
        period: { start_date, end_date }
      }
    });
  } catch (error) {
    console.error('Error fetching status statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status statistics',
      error: error.message
    });
  }
});

// Delete a status log entry (admin only)
router.delete('/:log_id', authMiddleware, [
  param('log_id').isInt({ min: 1 }).withMessage('Valid log ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { log_id } = req.params;

    const statusLog = await RoomStatusLog.findByPk(log_id);
    if (!statusLog) {
      return res.status(404).json({
        success: false,
        message: 'Status log entry not found'
      });
    }

    await statusLog.destroy();

    res.json({
      success: true,
      message: 'Status log entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting status log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete status log entry',
      error: error.message
    });
  }
});

module.exports = router;