/**
 * HOUSEKEEPING TASK SERVICE
 * Handles housekeeping task logic and guest request conversion
 */

const { sequelize } = require('../../config/database');
const HousekeepingTask = require('../models/housekeepingTask.model');
const GuestRequest = require('../models/guestRequest.model');

/**
 * Maps guest request descriptions to housekeeping task types
 * @param {string} description - Guest request description
 * @param {string} requestType - Guest request type
 * @returns {string} Housekeeping task type
 */
function mapGuestRequestToTaskType(description, requestType) {
  const desc = description?.toLowerCase() || '';
  
  if (desc.includes('change') || desc.includes('linen') || desc.includes('sheet')) {
    return 'linen_change';
  }
  if (desc.includes('deep') || desc.includes('deep clean') || desc.includes('thorough')) {
    return 'deep_cleaning';
  }
  if (desc.includes('clean')) {
    return 'cleaning';
  }
  if (desc.includes('inspect') || desc.includes('inspection')) {
    return 'inspection';
  }
  if (desc.includes('maintain') || desc.includes('maintenance')) {
    return 'maintenance';
  }
  if (desc.includes('turndown')) {
    return 'turndown_service';
  }
  if (desc.includes('laundry') || desc.includes('wash')) {
    return 'laundry';
  }
  if (desc.includes('minibar') || desc.includes('restock') || desc.includes('supplies')) {
    return 'minibar_restock';
  }
  
  return 'cleaning'; // default
}

/**
 * Create a housekeeping task from a guest request
 * @param {number} guestRequestId - Guest request ID
 * @returns {Promise<Object>} Created housekeeping task
 */
async function createTaskFromGuestRequest(guestRequestId) {
  const t = await sequelize.transaction();
  
  try {
    // Fetch guest request with booking details
    const guestRequest = await sequelize.query(`
      SELECT 
        gr.request_id,
        gr.booking_id,
        gr.request_type,
        gr.description,
        gr.priority,
        gr.assigned_to,
        gr.scheduled_time,
        rb.inventory_id,
        rb.homestay_id
      FROM guest_requests gr
      INNER JOIN bookings b ON gr.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE gr.request_id = ? AND gr.request_type = 'housekeeping'
      LIMIT 1
    `, {
      replacements: [guestRequestId],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (guestRequest.length === 0) {
      throw new Error('Guest request not found or is not a housekeeping request');
    }

    const req = guestRequest[0];
    const taskType = mapGuestRequestToTaskType(req.description, req.request_type);

    // Create housekeeping task
    const [taskId] = await sequelize.query(`
      INSERT INTO housekeeping_tasks (
        inventory_id,
        guest_request_id,
        task_type,
        priority,
        status,
        assigned_to,
        scheduled_time,
        confirmation_status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        req.inventory_id,
        guestRequestId,
        taskType,
        req.priority,
        'pending',
        req.assigned_to,
        req.scheduled_time,
        'pending'
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Update guest request to link it to the task
    await sequelize.query(`
      UPDATE guest_requests 
      SET status = 'acknowledged', linked_task_id = ?
      WHERE request_id = ?
    `, {
      replacements: [taskId, guestRequestId],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await t.commit();

    console.log(`Created housekeeping task ${taskId} from guest request ${guestRequestId}`);

    return {
      taskId,
      type: taskType,
      guestRequestId,
      priority: req.priority
    };

  } catch (error) {
    await t.rollback();
    console.error('Error creating housekeeping task from guest request:', error);
    throw error;
  }
}

/**
 * Get all housekeeping tasks including those from guest requests
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Tasks with guest request context
 */
async function getAllTasksWithContext(filters = {}) {
  const whereClause = {};
  
  if (filters.status) whereClause.status = filters.status;
  if (filters.task_type) whereClause.task_type = filters.task_type;
  if (filters.priority) whereClause.priority = filters.priority;
  if (filters.assigned_to) whereClause.assigned_to = filters.assigned_to;
  if (filters.confirmation_status) whereClause.confirmation_status = filters.confirmation_status;

  try {
    const tasks = await sequelize.query(`
      SELECT 
        ht.*,
        ri.unit_number,
        ri.room_type,
        u.name as staff_name,
        u.email as staff_email,
        u.phone as staff_phone,
        gr.booking_id,
        gr.guest_id,
        rb.guest_name,
        rb.guest_email,
        rb.check_in_date,
        rb.check_out_date
      FROM housekeeping_tasks ht
      LEFT JOIN room_inventory ri ON ht.inventory_id = ri.inventory_id
      LEFT JOIN users u ON ht.assigned_to = u.user_id
      LEFT JOIN guest_requests gr ON ht.guest_request_id = gr.request_id
      LEFT JOIN room_bookings rb ON gr.booking_id = rb.booking_id
      WHERE 1=1
        ${filters.status ? 'AND ht.status = ?' : ''}
        ${filters.task_type ? 'AND ht.task_type = ?' : ''}
        ${filters.priority ? 'AND ht.priority = ?' : ''}
        ${filters.assigned_to ? 'AND ht.assigned_to = ?' : ''}
        ${filters.confirmation_status ? 'AND ht.confirmation_status = ?' : ''}
      ORDER BY 
        FIELD(ht.priority, 'urgent', 'high', 'normal', 'low'),
        ht.scheduled_time ASC,
        ht.task_id DESC
    `, {
      replacements: [
        filters.status,
        filters.task_type,
        filters.priority,
        filters.assigned_to,
        filters.confirmation_status
      ].filter(v => v !== undefined),
      type: sequelize.QueryTypes.SELECT
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks with context:', error);
    throw error;
  }
}

/**
 * Confirm/acknowledge a housekeeping task from guest request
 * @param {number} taskId - Task ID
 * @param {number} staffId - Staff user ID
 * @returns {Promise<Object>} Updated task
 */
async function confirmTask(taskId, staffId) {
  try {
    const now = new Date();
    
    const updated = await sequelize.query(`
      UPDATE housekeeping_tasks 
      SET 
        confirmation_status = 'acknowledged',
        confirmed_at = ?,
        assigned_to = COALESCE(assigned_to, ?),
        status = 'in_progress'
      WHERE task_id = ?
    `, {
      replacements: [now, staffId, taskId],
      type: sequelize.QueryTypes.UPDATE
    });

    // Fetch updated task
    const [task] = await sequelize.query(`
      SELECT ht.*, gr.request_id as guest_request_id
      FROM housekeeping_tasks ht
      LEFT JOIN guest_requests gr ON ht.guest_request_id = gr.request_id
      WHERE ht.task_id = ?
    `, {
      replacements: [taskId],
      type: sequelize.QueryTypes.SELECT
    });

    return task;
  } catch (error) {
    console.error('Error confirming task:', error);
    throw error;
  }
}

/**
 * Get tasks pending confirmation from guest requests
 * @param {number} staffId - Staff user ID (optional)
 * @returns {Promise<Array>} Pending confirmation tasks
 */
async function getPendingConfirmationTasks(staffId = null) {
  try {
    const tasks = await sequelize.query(`
      SELECT 
        ht.*,
        ri.unit_number,
        ri.room_type,
        rb.guest_name,
        rb.guest_email,
        gr.request_id as guest_request_id,
        gr.description as guest_request_description,
        u.name as assigned_staff_name
      FROM housekeeping_tasks ht
      INNER JOIN guest_requests gr ON ht.guest_request_id = gr.request_id
      LEFT JOIN room_inventory ri ON ht.inventory_id = ri.inventory_id
      LEFT JOIN room_bookings rb ON gr.booking_id = rb.booking_id
      LEFT JOIN users u ON ht.assigned_to = u.user_id
      WHERE ht.confirmation_status = 'pending'
        AND ht.guest_request_id IS NOT NULL
        ${staffId ? 'AND (ht.assigned_to = ? OR ht.assigned_to IS NULL)' : ''}
      ORDER BY 
        FIELD(ht.priority, 'urgent', 'high', 'normal', 'low'),
        ht.scheduled_time ASC
    `, {
      replacements: staffId ? [staffId] : [],
      type: sequelize.QueryTypes.SELECT
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching pending confirmation tasks:', error);
    throw error;
  }
}

module.exports = {
  createTaskFromGuestRequest,
  getAllTasksWithContext,
  confirmTask,
  getPendingConfirmationTasks,
  mapGuestRequestToTaskType
};