const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');
const Booking = require('../models/booking.model');

/**
 * ADMIN CONTROLLER
 * Advanced admin-level operations including rate overrides and confirmations
 * All operations are logged and audited for compliance
 */

/**
 * Apply Rate Override for Checkout
 * Admin can override final checkout amount with audit trail
 * 
 * POST /api/admin/checkout/override
 * Body:
 * - booking_id: ID of booking to override
 * - final_amount: new final amount
 * - reason: reason for override (mandatory)
 * - override_type: 'rate_override', 'discount', 'waiver', etc.
 */
exports.applyRateOverride = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { booking_id, final_amount, reason, override_type = 'rate_override' } = req.body;
    const admin_id = req.user?.hms_user_id || req.user?.user_id;

    // Validation
    if (!booking_id || !final_amount || !reason) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'booking_id, final_amount, and reason are required'
      });
    }

    if (typeof final_amount !== 'number' || final_amount < 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'final_amount must be a valid positive number'
      });
    }

    // Fetch booking
    const booking = await Booking.findByPk(booking_id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only allow overrides for checked_out or completed bookings
    if (!['completed', 'checked_out'].includes(booking.status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot override rate for booking with status: ${booking.status}`
      });
    }

    const originalAmount = booking.total_amount || booking.final_amount || 0;
    const difference = final_amount - originalAmount;

    // Create admin override record
    const result = await sequelize.query(`
      INSERT INTO admin_overrides (
        booking_id, admin_user_id, override_type, 
        original_final_amount, overridden_final_amount, 
        difference_amount, override_reason, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'applied', NOW())
    `, {
      replacements: [
        booking_id,
        admin_id,
        override_type,
        originalAmount,
        final_amount,
        difference,
        reason
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    const overrideId = result[0];

    // Update booking with new final amount
    await booking.update({
      final_amount,
      total_amount: final_amount,
      updated_at: new Date()
    }, { transaction: t });

    // Create audit log
    await sequelize.query(`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, {
      replacements: [
        admin_id,
        'ADMIN_RATE_OVERRIDE',
        'bookings',
        booking_id,
        JSON.stringify({ final_amount: originalAmount }),
        JSON.stringify({ 
          final_amount, 
          override_reason: reason,
          override_type
        }),
        req.ip || null,
        req.get('user-agent') || null
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Rate override applied successfully',
      data: {
        override_id: overrideId,
        booking_id,
        original_amount: originalAmount,
        new_amount: final_amount,
        difference,
        override_reason: reason,
        override_type
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Error applying rate override:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply rate override',
      error: error.message
    });
  }
};

/**
 * Confirm Checkout Rate
 * Admin confirms current calculated rate (no changes)
 * Used for compliance when admin reviews and approves standard checkout
 * 
 * POST /api/admin/checkout/confirm-rate
 * Body:
 * - booking_id: ID of booking
 * - final_amount: amount being confirmed
 * - confirmation_note: optional notes
 */
exports.confirmCheckoutRate = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { booking_id, final_amount, confirmation_note = '' } = req.body;
    const admin_id = req.user?.hms_user_id || req.user?.user_id;

    if (!booking_id || final_amount === undefined) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'booking_id and final_amount are required'
      });
    }

    const booking = await Booking.findByPk(booking_id, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create confirmation record
    await sequelize.query(`
      INSERT INTO checkout_confirmations (
        booking_id, confirmed_by, final_amount, confirmation_note, created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `, {
      replacements: [booking_id, admin_id, final_amount, confirmation_note],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Update booking with confirmation info
    await booking.update({
      rate_confirmed_by: admin_id,
      rate_confirmed_at: new Date()
    }, { transaction: t });

    // Create audit log
    await sequelize.query(`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, {
      replacements: [
        admin_id,
        'ADMIN_CONFIRM_RATE',
        'bookings',
        booking_id,
        JSON.stringify({ rate_confirmed: false }),
        JSON.stringify({ 
          rate_confirmed: true,
          rate_confirmed_by: admin_id,
          final_amount,
          confirmation_note
        }),
        req.ip || null,
        req.get('user-agent') || null
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Checkout rate confirmed successfully',
      data: {
        booking_id,
        final_amount,
        confirmed_by: admin_id,
        confirmation_note
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Error confirming checkout rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm checkout rate',
      error: error.message
    });
  }
};

/**
 * Get Admin Overrides History
 * List all rate overrides with filters
 * 
 * GET /api/admin/overrides?status=applied&page=1&limit=20
 */
exports.getOverridesHistory = async (req, res) => {
  try {
    const { status, override_type, page = 1, limit = 20, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const replacements = [];

    if (status) {
      whereClause += ' AND ao.status = ?';
      replacements.push(status);
    }

    if (override_type) {
      whereClause += ' AND ao.override_type = ?';
      replacements.push(override_type);
    }

    if (start_date && end_date) {
      whereClause += ' AND ao.created_at BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    const [overrides, [{ total }]] = await Promise.all([
      sequelize.query(`
        SELECT 
          ao.id, ao.booking_id, ao.override_type, 
          ao.original_final_amount, ao.overridden_final_amount, 
          ao.difference_amount, ao.override_reason, ao.status,
          u.name as admin_name, u.email as admin_email,
          b.booking_reference, b.guest_name, b.total_amount,
          ao.created_at
        FROM admin_overrides ao
        JOIN users u ON ao.admin_user_id = u.id
        JOIN bookings b ON ao.booking_id = b.id
        WHERE 1=1 ${whereClause}
        ORDER BY ao.created_at DESC
        LIMIT ? OFFSET ?
      `, {
        replacements: [...replacements, limit, offset],
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(`
        SELECT COUNT(*) as total FROM admin_overrides ao
        WHERE 1=1 ${whereClause}
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      })
    ]);

    res.json({
      success: true,
      data: overrides,
      pagination: {
        total: total.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total.total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching overrides history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overrides history',
      error: error.message
    });
  }
};

/**
 * Get Checkout Confirmations History
 * List all admin rate confirmations
 * 
 * GET /api/admin/confirmations?page=1&limit=20
 */
exports.getConfirmationsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const replacements = [];

    if (start_date && end_date) {
      whereClause = ' AND cc.created_at BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    const [confirmations, [{ total }]] = await Promise.all([
      sequelize.query(`
        SELECT 
          cc.id, cc.booking_id, cc.final_amount, cc.confirmation_note,
          u.name as confirmed_by_name, u.email as confirmed_by_email,
          b.booking_reference, b.guest_name,
          cc.created_at
        FROM checkout_confirmations cc
        JOIN users u ON cc.confirmed_by = u.id
        JOIN bookings b ON cc.booking_id = b.id
        WHERE 1=1 ${whereClause}
        ORDER BY cc.created_at DESC
        LIMIT ? OFFSET ?
      `, {
        replacements: [...replacements, limit, offset],
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(`
        SELECT COUNT(*) as total FROM checkout_confirmations cc
        WHERE 1=1 ${whereClause}
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      })
    ]);

    res.json({
      success: true,
      data: confirmations,
      pagination: {
        total: total.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total.total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching confirmations history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch confirmations history',
      error: error.message
    });
  }
};

/**
 * Reverse an Override
 * Admin can reverse a previously applied override
 * 
 * POST /api/admin/overrides/:override_id/reverse
 * Body:
 * - reversal_reason: reason for reversal (mandatory)
 */
exports.reverseOverride = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { override_id } = req.params;
    const { reversal_reason } = req.body;
    const admin_id = req.user?.hms_user_id || req.user?.user_id;

    if (!reversal_reason) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'reversal_reason is required'
      });
    }

    // Fetch override
    const [override] = await sequelize.query(`
      SELECT * FROM admin_overrides WHERE id = ?
    `, {
      replacements: [override_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!override) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Override not found'
      });
    }

    // Update override status to reversed
    await sequelize.query(`
      UPDATE admin_overrides 
      SET status = 'reversed', updated_at = NOW()
      WHERE id = ?
    `, {
      replacements: [override_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    // Restore original booking amount
    await sequelize.query(`
      UPDATE bookings 
      SET final_amount = ?, total_amount = ?, updated_at = NOW()
      WHERE id = ?
    `, {
      replacements: [override.original_final_amount, override.original_final_amount, override.booking_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    // Create audit log
    await sequelize.query(`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, {
      replacements: [
        admin_id,
        'ADMIN_REVERSE_OVERRIDE',
        'admin_overrides',
        override_id,
        JSON.stringify({ status: 'applied' }),
        JSON.stringify({ 
          status: 'reversed',
          reversal_reason
        }),
        req.ip || null,
        req.get('user-agent') || null
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Override reversed successfully',
      data: {
        override_id,
        booking_id: override.booking_id,
        original_amount: override.original_final_amount,
        reversal_reason
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('❌ Error reversing override:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse override',
      error: error.message
    });
  }
};