const express = require('express');
const { sequelize } = require('../../config/database');
const authMiddleware = require('../middlewares/auth.middleware');
const housekeepingTaskService = require('../services/housekeepingTaskService');

const router = express.Router();

// Create a new guest request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      booking_id,
      guest_id,
      request_type,
      description,
      priority = 'normal',
      assigned_to,
      requested_time,
      additional_charges = 0,
      notes
    } = req.body;

    const user = req.user;

    // Validate required fields
    if (!booking_id || !request_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: booking_id, request_type, description'
      });
    }

    // Verify the booking exists and belongs to the user's hotel
    const booking = await sequelize.query(`
      SELECT b.booking_id, rb.homestay_id, rb.guest_name, rb.guest_email
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE b.booking_id = ? AND rb.homestay_id = ?
    `, {
      replacements: [booking_id, user.assigned_hotel_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or access denied'
      });
    }

    // Handle assigned_to field - now accepts actual staff IDs
    const assignedToValue = assigned_to ? parseInt(assigned_to) : null;

    // Debug: Log the values being inserted
    console.log('Creating guest request with values:', {
      booking_id,
      guest_id,
      request_type,
      description,
      priority,
      assignedToValue,
      requested_time,
      additional_charges,
      notes
    });

    // Insert the guest request
    const result = await sequelize.query(`
      INSERT INTO guest_requests (
        booking_id,
        guest_id,
        request_type,
        description,
        priority,
        assigned_to,
        requested_time,
        additional_charges,
        notes,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        booking_id,
        guest_id,
        request_type,
        description,
        priority,
        assignedToValue,
        requested_time || null,
        additional_charges || 0,
        notes || null,
        'pending'
      ],
      type: sequelize.QueryTypes.INSERT
    });

    const requestId = result[0];

    // If this is a housekeeping request, create a housekeeping task
    let linkedTaskId = null;
    if (request_type === 'housekeeping') {
      try {
        const taskResult = await housekeepingTaskService.createTaskFromGuestRequest(requestId);
        linkedTaskId = taskResult.taskId;
        console.log(`Housekeeping task ${linkedTaskId} created from guest request ${requestId}`);
      } catch (taskError) {
        console.warn('Failed to create housekeeping task from guest request:', taskError.message);
        // Don't fail the request, just log the warning
      }
    }

    // Log staff activity
    try {
      await sequelize.query(`
        INSERT INTO staff_activity_logs (
          staff_id,
          action,
          table_name,
          record_id,
          timestamp
        ) VALUES (?, 'create_guest_request', 'guest_requests', ?, NOW())
      `, {
        replacements: [user.hms_user_id, requestId],
        type: sequelize.QueryTypes.INSERT
      });
    } catch (logError) {
      console.warn('Failed to log staff activity:', logError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Guest request created successfully',
      data: {
        request_id: requestId,
        booking_id,
        guest_id,
        request_type,
        description,
        priority,
        assigned_to,
        requested_time,
        additional_charges,
        notes,
        status: 'pending',
        linked_task_id: linkedTaskId
      }
    });

  } catch (error) {
    console.error('Error creating guest request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create guest request',
      error: error.message
    });
  }
});

// Get all guest requests for a hotel
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { status, request_type, assigned_to, page = 1, limit = 20 } = req.query;

    let whereClause = 'WHERE rb.homestay_id = ?';
    let replacements = [user.assigned_hotel_id];

    if (status) {
      whereClause += ' AND gr.status = ?';
      replacements.push(status);
    }

    if (request_type) {
      whereClause += ' AND gr.request_type = ?';
      replacements.push(request_type);
    }

    if (assigned_to) {
      whereClause += ' AND gr.assigned_to = ?';
      replacements.push(assigned_to);
    }

    const offset = (page - 1) * limit;

    const requests = await sequelize.query(`
      SELECT
        gr.request_id,
        gr.booking_id,
        gr.guest_id,
        gr.request_type,
        gr.description,
        gr.priority,
        gr.status,
        gr.assigned_to,
        gr.requested_time,
        gr.scheduled_time,
        gr.completed_time,
        gr.additional_charges,
        gr.notes,
        gr.staff_notes,
        gr.rating,
        gr.feedback,
        rb.guest_name,
        rb.guest_email,
        b.booking_reference,
        h.name as homestay_name,
        hu.name as assigned_staff_name,
        hu.email as assigned_staff_email,
        hu.role as assigned_staff_role
      FROM guest_requests gr
      INNER JOIN bookings b ON gr.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN hms_users hu ON gr.assigned_to = hu.hms_user_id
      ${whereClause}
      ORDER BY gr.requested_time DESC
      LIMIT ? OFFSET ?
    `, {
      replacements: [...replacements, parseInt(limit), offset],
      type: sequelize.QueryTypes.SELECT
    });

    // Get total count
    const countResult = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM guest_requests gr
      INNER JOIN bookings b ON gr.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching guest requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest requests',
      error: error.message
    });
  }
});

// Get HMS staff by role for assignment
router.get('/staff/:role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.params;
    const user = req.user;

    // Validate role
    const validRoles = ['manager', 'receptionist', 'housekeeping', 'maintenance', 'restaurant', 'inventory', 'accountant'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    // Get staff by role and hotel
    const staff = await sequelize.query(`
      SELECT 
        hms_user_id,
        name,
        email,
        phone,
        role,
        status
      FROM hms_users
      WHERE role = ? AND assigned_hotel_id = ? AND status = 'active'
      ORDER BY name ASC
    `, {
      replacements: [role, user.assigned_hotel_id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        staff,
        role,
        count: staff.length
      }
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff',
      error: error.message
    });
  }
});

// Get tasks assigned to current staff member
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    // Validate user has a valid staff ID
    if (!user.hms_user_id) {
      return res.status(400).json({
        success: false,
        message: 'User is not a valid staff member'
      });
    }

    // Build where clause for filtering
    let whereClause = 'WHERE gr.assigned_to = ?';
    const replacements = [user.hms_user_id];

    if (status) {
      whereClause += ' AND gr.status = ?';
      replacements.push(status);
    }

    const offset = (page - 1) * limit;

    // Get assigned tasks
    const tasks = await sequelize.query(`
      SELECT
        gr.request_id,
        gr.booking_id,
        gr.guest_id,
        gr.request_type,
        gr.description,
        gr.priority,
        gr.status,
        gr.assigned_to,
        gr.requested_time,
        gr.scheduled_time,
        gr.completed_time,
        gr.additional_charges,
        gr.notes,
        gr.staff_notes,
        gr.rating,
        gr.feedback,
        rb.guest_name,
        rb.guest_email,
        b.booking_reference,
        h.name as homestay_name,
        hu.name as assigned_staff_name,
        hu.email as assigned_staff_email,
        hu.role as assigned_staff_role
      FROM guest_requests gr
      INNER JOIN bookings b ON gr.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN hms_users hu ON gr.assigned_to = hu.hms_user_id
      ${whereClause}
      ORDER BY 
        CASE gr.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'normal' THEN 3 
          WHEN 'low' THEN 4 
        END,
        gr.requested_time ASC
      LIMIT ? OFFSET ?
    `, {
      replacements: [...replacements, parseInt(limit), offset],
      type: sequelize.QueryTypes.SELECT
    });

    // Get total count
    const countResult = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM guest_requests gr
      ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        staff: {
          hms_user_id: user.hms_user_id,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Error fetching staff tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned tasks',
      error: error.message
    });
  }
});

// Accept a task (staff acknowledges the request)
router.patch('/:request_id/accept', authMiddleware, async (req, res) => {
  try {
    const { request_id } = req.params;
    const { notes } = req.body;
    const user = req.user;

    // Validate user has a valid staff ID
    if (!user.hms_user_id) {
      return res.status(400).json({
        success: false,
        message: 'User is not a valid staff member'
      });
    }

    // Check if task exists and is assigned to this staff member
    const existingRequest = await sequelize.query(`
      SELECT * FROM guest_requests 
      WHERE request_id = ? AND assigned_to = ?
    `, {
      replacements: [request_id, user.hms_user_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not assigned to you'
      });
    }

    // Update task status to in_progress
    await sequelize.query(`
      UPDATE guest_requests 
      SET status = 'in_progress', 
          staff_notes = COALESCE(CONCAT(staff_notes, '\\nAccepted by ', ?, ' at ', NOW()), CONCAT('Accepted by ', ?, ' at ', NOW()))
      WHERE request_id = ?
    `, {
      replacements: [user.name, user.name, request_id],
      type: sequelize.QueryTypes.UPDATE
    });

    res.json({
      success: true,
      message: 'Task accepted and started successfully',
      data: {
        request_id,
        status: 'in_progress',
        accepted_by: user.name,
        accepted_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error accepting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept task',
      error: error.message
    });
  }
});

// Complete a task (staff marks task as completed)
router.patch('/:request_id/complete', authMiddleware, async (req, res) => {
  try {
    const { request_id } = req.params;
    const { notes, rating, feedback } = req.body;
    const user = req.user;

    // Validate user has a valid staff ID
    if (!user.hms_user_id) {
      return res.status(400).json({
        success: false,
        message: 'User is not a valid staff member'
      });
    }

    // Check if task exists and is assigned to this staff member
    const existingRequest = await sequelize.query(`
      SELECT * FROM guest_requests 
      WHERE request_id = ? AND assigned_to = ?
    `, {
      replacements: [request_id, user.hms_user_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not assigned to you'
      });
    }

    const request = existingRequest[0];
    
    // Update task status to completed
    await sequelize.query(`
      UPDATE guest_requests 
      SET status = 'completed',
          completed_time = NOW(),
          staff_notes = COALESCE(CONCAT(staff_notes, '\\nCompleted by ', ?, ' at ', NOW(), CASE WHEN ? IS NOT NULL THEN CONCAT('\\nNotes: ', ?) ELSE '' END), CONCAT('Completed by ', ?, ' at ', NOW(), CASE WHEN ? IS NOT NULL THEN CONCAT('\\nNotes: ', ?) ELSE '' END)),
          rating = ?,
          feedback = ?
      WHERE request_id = ?
    `, {
      replacements: [user.name, notes, notes, user.name, notes, notes, rating || null, feedback || null, request_id],
      type: sequelize.QueryTypes.UPDATE
    });

    // If the request has additional charges, create a booking charge entry
    if (request.additional_charges && parseFloat(request.additional_charges) > 0) {
      try {
        // Map request type to booking charge type
        const chargeTypeMap = {
          'housekeeping': 'room_service',
          'laundry': 'laundry',
          'cleaning': 'room_service',
          'room_service': 'room_service',
          'extra_towels': 'room_service',
          'extra_pillows': 'room_service',
          'ironing': 'laundry',
          'maintenance': 'other',
          'amenity': 'other',
          'wake_up_call': 'other',
          'transportation': 'other',
          'concierge': 'other',
          'other': 'other'
        };

        const chargeType = chargeTypeMap[request.request_type] || 'other';
        
        await sequelize.query(`
          INSERT INTO booking_charges (
            booking_id,
            charge_type,
            description,
            quantity,
            unit_price,
            total_amount,
            tax_amount,
            charged_at,
            charged_by,
            notes
          ) VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), ?, ?)
        `, {
          replacements: [
            request.booking_id,
            chargeType,
            `${request.request_type.replace('_', ' ').toUpperCase()} - ${request.description}`,
            1,
            request.additional_charges,
            request.additional_charges,
            user.hms_user_id,
            notes || null
          ],
          type: sequelize.QueryTypes.INSERT
        });

        console.log(`✅ Booking charge created for request ${request_id}: RWF ${request.additional_charges}`);
      } catch (chargeError) {
        console.error('❌ Error creating booking charge:', chargeError.message);
        // Don't fail the completion, just log the error
      }
    }

    res.json({
      success: true,
      message: 'Task completed successfully',
      data: {
        request_id,
        status: 'completed',
        completed_by: user.name,
        completed_at: new Date().toISOString(),
        notes,
        rating,
        feedback
      }
    });

  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete task',
      error: error.message
    });
  }
});

// Get all HMS staff for assignment
router.get('/staff', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Get all active staff for the hotel
    const staff = await sequelize.query(`
      SELECT 
        hms_user_id,
        name,
        email,
        phone,
        role,
        status
      FROM hms_users
      WHERE assigned_hotel_id = ? AND status = 'active'
      ORDER BY role ASC, name ASC
    `, {
      replacements: [user.assigned_hotel_id],
      type: sequelize.QueryTypes.SELECT
    });

    // Group by role
    const staffByRole = staff.reduce((acc, member) => {
      if (!acc[member.role]) {
        acc[member.role] = [];
      }
      acc[member.role].push(member);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        staff,
        staffByRole,
        total: staff.length
      }
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff',
      error: error.message
    });
  }
});

// Get a specific guest request
router.get('/:request_id', authMiddleware, async (req, res) => {
  try {
    const { request_id } = req.params;
    const user = req.user;

    const requests = await sequelize.query(`
      SELECT 
        gr.*,
        rb.guest_name,
        rb.guest_email,
        b.booking_reference,
        h.name as homestay_name
      FROM guest_requests gr
      INNER JOIN bookings b ON gr.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      INNER JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE gr.request_id = ? AND rb.homestay_id = ?
    `, {
      replacements: [request_id, user.assigned_hotel_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guest request not found'
      });
    }

    res.json({
      success: true,
      data: requests[0]
    });

  } catch (error) {
    console.error('Error fetching guest request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest request',
      error: error.message
    });
  }
});

// Update guest request status
router.patch('/:request_id/status', authMiddleware, async (req, res) => {
  try {
    const { request_id } = req.params;
    const { status, staff_notes, rating, feedback } = req.body;
    const user = req.user;

    // Validate status
    const validStatuses = ['pending', 'acknowledged', 'in_progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Verify the request exists and belongs to the user's hotel
    const existingRequest = await sequelize.query(`
      SELECT gr.request_id, gr.status
      FROM guest_requests gr
      INNER JOIN bookings b ON gr.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE gr.request_id = ? AND rb.homestay_id = ?
    `, {
      replacements: [request_id, user.assigned_hotel_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guest request not found'
      });
    }

    // Prepare update fields
    let updateFields = ['status = ?'];
    let replacements = [status];

    if (staff_notes !== undefined) {
      updateFields.push('staff_notes = ?');
      replacements.push(staff_notes);
    }

    if (rating !== undefined) {
      updateFields.push('rating = ?');
      replacements.push(rating);
    }

    if (feedback !== undefined) {
      updateFields.push('feedback = ?');
      replacements.push(feedback);
    }

    // Add timestamp fields based on status
    if (status === 'in_progress') {
      updateFields.push('scheduled_time = NOW()');
    } else if (status === 'completed') {
      updateFields.push('completed_time = NOW()');
    }

    replacements.push(request_id);

    // Update the request
    await sequelize.query(`
      UPDATE guest_requests 
      SET ${updateFields.join(', ')}
      WHERE request_id = ?
    `, {
      replacements,
      type: sequelize.QueryTypes.UPDATE
    });

    // Log staff activity
    try {
      await sequelize.query(`
        INSERT INTO staff_activity_logs (
          staff_id,
          action,
          table_name,
          record_id,
          timestamp
        ) VALUES (?, 'update_request_status', 'guest_requests', ?, NOW())
      `, {
        replacements: [user.hms_user_id, request_id],
        type: sequelize.QueryTypes.INSERT
      });
    } catch (logError) {
      console.warn('Failed to log staff activity:', logError.message);
    }

    res.json({
      success: true,
      message: 'Request status updated successfully',
      data: {
        request_id,
        status,
        staff_notes,
        rating,
        feedback
      }
    });

  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status',
      error: error.message
    });
  }
});

// Assign request to staff
router.patch('/:request_id/assign', authMiddleware, async (req, res) => {
  try {
    const { request_id } = req.params;
    const { assigned_to } = req.body;
    const user = req.user;

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        message: 'assigned_to is required'
      });
    }

    // Verify the request exists and belongs to the user's hotel
    const existingRequest = await sequelize.query(`
      SELECT gr.request_id
      FROM guest_requests gr
      INNER JOIN bookings b ON gr.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE gr.request_id = ? AND rb.homestay_id = ?
    `, {
      replacements: [request_id, user.assigned_hotel_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guest request not found'
      });
    }

    // Handle string assignments - convert to null for now since assigned_to expects integer
    // In a real system, you'd have a staff table with department mappings
    const assignedToValue = (typeof assigned_to === 'string') ? null : assigned_to;

    // Update assignment
    await sequelize.query(`
      UPDATE guest_requests 
      SET assigned_to = ?
      WHERE request_id = ?
    `, {
      replacements: [assignedToValue, request_id],
      type: sequelize.QueryTypes.UPDATE
    });

    // Log staff activity
    try {
      await sequelize.query(`
        INSERT INTO staff_activity_logs (
          staff_id,
          action,
          table_name,
          record_id,
          timestamp
        ) VALUES (?, 'assign_request', 'guest_requests', ?, NOW())
      `, {
        replacements: [user.hms_user_id, request_id],
        type: sequelize.QueryTypes.INSERT
      });
    } catch (logError) {
      console.warn('Failed to log staff activity:', logError.message);
    }

    res.json({
      success: true,
      message: 'Request assigned successfully',
      data: {
        request_id,
        assigned_to: assigned_to // Return the original string for frontend display
      }
    });

  } catch (error) {
    console.error('Error assigning request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign request',
      error: error.message
    });
  }
});

// Update guest request (general update endpoint for notes, escalation, etc.)
router.patch('/:request_id/update', authMiddleware, async (req, res) => {
  try {
    const { request_id } = req.params;
    const { 
      status, 
      staff_notes, 
      escalated_to, 
      escalation_note,
      notes 
    } = req.body;
    const user = req.user;

    // Verify the request exists and belongs to the user's hotel
    const existingRequest = await sequelize.query(`
      SELECT gr.request_id, gr.status, gr.staff_notes
      FROM guest_requests gr
      INNER JOIN bookings b ON gr.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE gr.request_id = ? AND rb.homestay_id = ?
    `, {
      replacements: [request_id, user.assigned_hotel_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guest request not found'
      });
    }

    // Prepare update fields
    let updateFields = [];
    let replacements = [];

    if (status !== undefined) {
      const validStatuses = ['pending', 'acknowledged', 'in_progress', 'completed', 'cancelled', 'escalated'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }
      updateFields.push('status = ?');
      replacements.push(status);
    }

    if (staff_notes !== undefined) {
      // Append to existing notes or create new
      const existingNotes = existingRequest[0].staff_notes || '';
      const newNotes = existingNotes ? 
        `${existingNotes}\n${new Date().toISOString()}: ${staff_notes}` : 
        `${new Date().toISOString()}: ${staff_notes}`;
      
      updateFields.push('staff_notes = ?');
      replacements.push(newNotes);
    }

    if (notes !== undefined) {
      // This is for general notes (alias for staff_notes)
      const existingNotes = existingRequest[0].staff_notes || '';
      const newNotes = existingNotes ? 
        `${existingNotes}\n${new Date().toISOString()}: ${notes}` : 
        `${new Date().toISOString()}: ${notes}`;
      
      updateFields.push('staff_notes = ?');
      replacements.push(newNotes);
    }

    if (escalated_to !== undefined) {
      updateFields.push('escalated_to = ?');
      replacements.push(escalated_to);
    }

    if (escalation_note !== undefined) {
      updateFields.push('escalation_note = ?');
      replacements.push(escalation_note);
      
      // Also add escalation timestamp
      updateFields.push('escalated_at = NOW()');
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add request_id to replacements
    replacements.push(request_id);

    // Update the request
    await sequelize.query(`
      UPDATE guest_requests 
      SET ${updateFields.join(', ')}
      WHERE request_id = ?
    `, {
      replacements: replacements,
      type: sequelize.QueryTypes.UPDATE
    });

    res.json({
      success: true,
      message: 'Guest request updated successfully',
      data: {
        request_id,
        updated_fields: {
          status,
          staff_notes: staff_notes || notes,
          escalated_to,
          escalation_note
        }
      }
    });

  } catch (error) {
    console.error('Error updating guest request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update guest request',
      error: error.message
    });
  }
});

module.exports = router;