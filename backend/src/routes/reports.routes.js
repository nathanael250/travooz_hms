const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ==========================================
// 1. FRONT DESK REPORT
// ==========================================
router.get('/front-desk', async (req, res) => {
  try {
    const { start_date, end_date, homestay_id } = req.query;

    let whereClause = '';
    const replacements = [];

    if (start_date && end_date) {
      whereClause += ' AND DATE(rb.check_in_date) BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    if (homestay_id) {
      whereClause += ' AND rb.homestay_id = ?';
      replacements.push(homestay_id);
    }

    // Daily summary
    const summary = await sequelize.query(`
      SELECT 
        DATE(rb.check_in_date) as report_date,
        COUNT(DISTINCT CASE WHEN DATE(rb.check_in_date) = CURDATE() THEN b.booking_id END) as total_checkins_today,
        COUNT(DISTINCT CASE WHEN DATE(rb.check_out_date) = CURDATE() THEN b.booking_id END) as total_checkouts_today,
        COUNT(DISTINCT CASE WHEN b.booking_source = 'walk_in' THEN b.booking_id END) as walk_in_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'no_show' THEN b.booking_id END) as no_shows,
        COUNT(DISTINCT CASE WHEN ri.status = 'available' THEN ri.inventory_id END) as available_rooms,
        COUNT(DISTINCT CASE WHEN ri.status = 'occupied' THEN ri.inventory_id END) as occupied_rooms,
        COUNT(DISTINCT CASE WHEN ri.status = 'vacant_dirty' THEN ri.inventory_id END) as cleaning_rooms
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      WHERE 1=1 ${whereClause}
      GROUP BY DATE(rb.check_in_date)
      ORDER BY report_date DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Detailed check-ins/check-outs
    const details = await sequelize.query(`
      SELECT 
        b.booking_reference,
        rb.guest_name,
        rb.check_in_date,
        rb.check_out_date,
        b.status,
        b.booking_source,
        ri.unit_number as room_number,
        rt.name as room_type,
        h.name as homestay_name
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN room_inventory ri ON rb.inventory_id = ri.inventory_id
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE 1=1 ${whereClause}
      ORDER BY rb.check_in_date DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        summary,
        details
      }
    });

  } catch (error) {
    console.error('Error generating front desk report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate front desk report',
      error: error.message
    });
  }
});

// ==========================================
// 2. ROOM OCCUPANCY REPORT
// ==========================================
router.get('/room-occupancy', async (req, res) => {
  try {
    const { homestay_id, status, date } = req.query;

    let whereClause = '';
    const replacements = [];

    if (homestay_id) {
      whereClause += ' AND ri.homestay_id = ?';
      replacements.push(homestay_id);
    }

    if (status) {
      whereClause += ' AND ri.status = ?';
      replacements.push(status);
    }

    const reportDate = date || new Date().toISOString().split('T')[0];

    const occupancyData = await sequelize.query(`
      SELECT 
        ri.inventory_id,
        ri.unit_number as room_number,
        rt.name as room_type,
        ri.status,
        h.name as homestay_name,
        rb.guest_name,
        rb.check_in_date,
        rb.check_out_date,
        b.booking_reference,
        b.booking_source,
        CASE 
          WHEN ri.status = 'occupied' THEN 'Occupied'
          WHEN ri.status = 'available' THEN 'Available'
          WHEN ri.status = 'vacant_dirty' THEN 'Needs Cleaning'
          WHEN ri.status = 'maintenance' THEN 'Under Maintenance'
          ELSE 'Unknown'
        END as status_label
      FROM room_inventory ri
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON ri.homestay_id = h.homestay_id
      LEFT JOIN room_bookings rb ON ri.inventory_id = rb.inventory_id 
        AND ? BETWEEN DATE(rb.check_in_date) AND DATE(rb.check_out_date)
      LEFT JOIN bookings b ON rb.booking_id = b.booking_id
      WHERE 1=1 ${whereClause}
      ORDER BY h.name, ri.unit_number
    `, {
      replacements: [reportDate, ...replacements],
      type: sequelize.QueryTypes.SELECT
    });

    // Summary statistics
    const summary = await sequelize.query(`
      SELECT 
        COUNT(*) as total_rooms,
        COUNT(CASE WHEN ri.status = 'occupied' THEN 1 END) as occupied,
        COUNT(CASE WHEN ri.status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN ri.status = 'vacant_dirty' THEN 1 END) as needs_cleaning,
        COUNT(CASE WHEN ri.status = 'maintenance' THEN 1 END) as maintenance,
        ROUND((COUNT(CASE WHEN ri.status = 'occupied' THEN 1 END) * 100.0 / COUNT(*)), 2) as occupancy_rate
      FROM room_inventory ri
      WHERE 1=1 ${whereClause}
    `, {
      replacements: replacements.slice(1), // Skip reportDate
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        summary: summary[0],
        rooms: occupancyData,
        report_date: reportDate
      }
    });

  } catch (error) {
    console.error('Error generating room occupancy report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate room occupancy report',
      error: error.message
    });
  }
});

// ==========================================
// 3. REVENUE REPORT
// ==========================================
router.get('/revenue', async (req, res) => {
  try {
    const { start_date, end_date, homestay_id } = req.query;

    let whereClause = '';
    const replacements = [];

    if (start_date && end_date) {
      whereClause += ' AND DATE(rb.check_in_date) BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    if (homestay_id) {
      whereClause += ' AND rb.homestay_id = ?';
      replacements.push(homestay_id);
    }

    // Room revenue
    const roomRevenue = await sequelize.query(`
      SELECT 
        COALESCE(SUM(rb.total_room_amount), 0) as room_revenue,
        COALESCE(SUM(rb.tax_amount), 0) as room_tax,
        COALESCE(SUM(rb.service_charge), 0) as room_service_charge,
        COALESCE(SUM(rb.discount_amount), 0) as room_discounts,
        COALESCE(SUM(rb.final_amount), 0) as room_total,
        COUNT(DISTINCT b.booking_id) as total_bookings
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE b.status IN ('confirmed', 'checked_in', 'checked_out') ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Restaurant revenue
    const restaurantRevenue = await sequelize.query(`
      SELECT 
        COALESCE(SUM(roi.total_price), 0) as restaurant_revenue,
        COUNT(DISTINCT ro.order_id) as total_orders,
        COUNT(roi.order_item_id) as total_items
      FROM restaurant_orders ro
      INNER JOIN restaurant_order_items roi ON ro.order_id = roi.order_id
      WHERE ro.status != 'cancelled' 
        ${start_date && end_date ? 'AND DATE(ro.order_date) BETWEEN ? AND ?' : ''}
        ${homestay_id ? 'AND ro.homestay_id = ?' : ''}
    `, {
      replacements: start_date && end_date 
        ? (homestay_id ? [start_date, end_date, homestay_id] : [start_date, end_date])
        : (homestay_id ? [homestay_id] : []),
      type: sequelize.QueryTypes.SELECT
    });

    // Booking charges (minibar, laundry, etc.)
    const serviceRevenue = await sequelize.query(`
      SELECT 
        COALESCE(SUM(bc.total_amount), 0) as service_revenue,
        COALESCE(SUM(bc.tax_amount), 0) as service_tax,
        COUNT(*) as total_charges,
        bc.charge_type,
        COUNT(*) as charge_count
      FROM booking_charges bc
      INNER JOIN bookings b ON bc.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE 1=1 ${whereClause}
      GROUP BY bc.charge_type
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Payment methods breakdown
    const paymentMethods = await sequelize.query(`
      SELECT 
        i.payment_method,
        COUNT(*) as transaction_count,
        COALESCE(SUM(i.amount_paid), 0) as total_amount
      FROM invoices i
      INNER JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE i.status IN ('paid', 'partially_paid') ${whereClause}
      GROUP BY i.payment_method
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Deposits
    const deposits = await sequelize.query(`
      SELECT 
        COALESCE(SUM(rb.deposit_amount), 0) as total_deposits_expected,
        COALESCE(SUM(CASE WHEN rb.deposit_paid = 1 THEN rb.deposit_amount ELSE 0 END), 0) as total_deposits_received
      FROM room_bookings rb
      INNER JOIN bookings b ON rb.booking_id = b.booking_id
      WHERE 1=1 ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Calculate totals
    const totalRevenue = 
      parseFloat(roomRevenue[0].room_total || 0) +
      parseFloat(restaurantRevenue[0].restaurant_revenue || 0) +
      serviceRevenue.reduce((sum, s) => sum + parseFloat(s.service_revenue || 0), 0);

    const totalTax = 
      parseFloat(roomRevenue[0].room_tax || 0) +
      serviceRevenue.reduce((sum, s) => sum + parseFloat(s.service_tax || 0), 0);

    res.json({
      success: true,
      data: {
        summary: {
          total_revenue: totalRevenue,
          total_tax: totalTax,
          room_revenue: roomRevenue[0],
          restaurant_revenue: restaurantRevenue[0],
          service_revenue_total: serviceRevenue.reduce((sum, s) => sum + parseFloat(s.service_revenue || 0), 0),
          deposits: deposits[0]
        },
        service_breakdown: serviceRevenue,
        payment_methods: paymentMethods
      }
    });

  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate revenue report',
      error: error.message
    });
  }
});

// ==========================================
// 4. RESTAURANT REPORT
// ==========================================
router.get('/restaurant', async (req, res) => {
  try {
    const { start_date, end_date, homestay_id, order_type } = req.query;

    let whereClause = '';
    const replacements = [];

    if (start_date && end_date) {
      whereClause += ' AND DATE(ro.order_date) BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    if (homestay_id) {
      whereClause += ' AND ro.homestay_id = ?';
      replacements.push(homestay_id);
    }

    if (order_type) {
      whereClause += ' AND ro.order_type = ?';
      replacements.push(order_type);
    }

    // Summary
    const summary = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT ro.order_id) as total_orders,
        COUNT(roi.order_item_id) as total_items,
        COALESCE(SUM(roi.total_price), 0) as total_revenue,
        COALESCE(AVG(roi.total_price), 0) as average_order_value,
        COUNT(DISTINCT CASE WHEN ro.order_type = 'dine_in' THEN ro.order_id END) as dine_in_orders,
        COUNT(DISTINCT CASE WHEN ro.order_type = 'room_service' THEN ro.order_id END) as room_service_orders,
        COUNT(DISTINCT CASE WHEN ro.order_type = 'takeaway' THEN ro.order_id END) as takeaway_orders
      FROM restaurant_orders ro
      INNER JOIN restaurant_order_items roi ON ro.order_id = roi.order_id
      WHERE ro.status != 'cancelled' ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Most ordered items
    const topItems = await sequelize.query(`
      SELECT 
        mi.item_name,
        mc.name as category,
        COUNT(roi.order_item_id) as order_count,
        SUM(roi.quantity) as total_quantity,
        COALESCE(SUM(roi.total_price), 0) as total_revenue
      FROM restaurant_order_items roi
      INNER JOIN restaurant_orders ro ON roi.order_id = ro.order_id
      INNER JOIN menu_items mi ON roi.item_id = mi.item_id
      LEFT JOIN menu_categories mc ON mi.category_id = mc.category_id
      WHERE ro.status != 'cancelled' ${whereClause}
      GROUP BY mi.item_id, mi.item_name, mc.name
      ORDER BY order_count DESC
      LIMIT 10
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Revenue by order type
    const revenueByType = await sequelize.query(`
      SELECT 
        ro.order_type,
        COUNT(DISTINCT ro.order_id) as order_count,
        COALESCE(SUM(roi.total_price), 0) as revenue
      FROM restaurant_orders ro
      INNER JOIN restaurant_order_items roi ON ro.order_id = roi.order_id
      WHERE ro.status != 'cancelled' ${whereClause}
      GROUP BY ro.order_type
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Daily revenue trend
    const dailyTrend = await sequelize.query(`
      SELECT 
        DATE(ro.order_date) as order_date,
        COUNT(DISTINCT ro.order_id) as orders,
        COALESCE(SUM(roi.total_price), 0) as revenue
      FROM restaurant_orders ro
      INNER JOIN restaurant_order_items roi ON ro.order_id = roi.order_id
      WHERE ro.status != 'cancelled' ${whereClause}
      GROUP BY DATE(ro.order_date)
      ORDER BY order_date DESC
      LIMIT 30
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        summary: summary[0],
        top_items: topItems,
        revenue_by_type: revenueByType,
        daily_trend: dailyTrend
      }
    });

  } catch (error) {
    console.error('Error generating restaurant report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate restaurant report',
      error: error.message
    });
  }
});

// ==========================================
// 5. INVOICE & PAYMENT REPORT
// ==========================================
router.get('/invoices', async (req, res) => {
  try {
    const { start_date, end_date, homestay_id, status } = req.query;

    let whereClause = '';
    const replacements = [];

    if (start_date && end_date) {
      whereClause += ' AND DATE(i.invoice_date) BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    if (homestay_id) {
      whereClause += ' AND rb.homestay_id = ?';
      replacements.push(homestay_id);
    }

    if (status) {
      whereClause += ' AND i.status = ?';
      replacements.push(status);
    }

    // Summary
    const summary = await sequelize.query(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(i.total_amount), 0) as total_billed,
        COALESCE(SUM(i.amount_paid), 0) as total_paid,
        COALESCE(SUM(i.balance_due), 0) as total_outstanding,
        COUNT(CASE WHEN i.status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN i.status = 'partially_paid' THEN 1 END) as partially_paid_invoices,
        COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) as overdue_invoices
      FROM invoices i
      INNER JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE 1=1 ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Detailed invoices
    const invoices = await sequelize.query(`
      SELECT 
        i.invoice_id,
        i.invoice_number,
        i.invoice_date,
        i.total_amount,
        i.amount_paid,
        i.balance_due,
        i.status,
        i.payment_method,
        b.booking_reference,
        rb.guest_name,
        h.name as homestay_name
      FROM invoices i
      INNER JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE 1=1 ${whereClause}
      ORDER BY i.invoice_date DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Payment methods breakdown
    const paymentMethods = await sequelize.query(`
      SELECT 
        i.payment_method,
        COUNT(*) as count,
        COALESCE(SUM(i.amount_paid), 0) as total_amount
      FROM invoices i
      INNER JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE i.status IN ('paid', 'partially_paid') ${whereClause}
      GROUP BY i.payment_method
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        summary: summary[0],
        invoices,
        payment_methods: paymentMethods
      }
    });

  } catch (error) {
    console.error('Error generating invoice report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice report',
      error: error.message
    });
  }
});

// ==========================================
// 6. HOUSEKEEPING REPORT
// ==========================================
router.get('/housekeeping', async (req, res) => {
  try {
    const { start_date, end_date, homestay_id, status } = req.query;

    let whereClause = '';
    const replacements = [];

    if (start_date && end_date) {
      whereClause += ' AND DATE(ht.created_at) BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    if (homestay_id) {
      whereClause += ' AND ri.homestay_id = ?';
      replacements.push(homestay_id);
    }

    if (status) {
      whereClause += ' AND ht.status = ?';
      replacements.push(status);
    }

    // Summary
    const summary = await sequelize.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN ht.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN ht.status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN ht.status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(DISTINCT ht.assigned_to) as active_staff
      FROM housekeeping_tasks ht
      INNER JOIN room_inventory ri ON ht.room_id = ri.inventory_id
      WHERE 1=1 ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Detailed tasks
    const tasks = await sequelize.query(`
      SELECT 
        ht.task_id,
        ri.unit_number as room_number,
        rt.name as room_type,
        ht.task_type,
        ht.status,
        ht.priority,
        ht.assigned_to,
        u.username as assigned_staff_name,
        ht.created_at,
        ht.completed_at,
        h.name as homestay_name
      FROM housekeeping_tasks ht
      INNER JOIN room_inventory ri ON ht.room_id = ri.inventory_id
      LEFT JOIN room_types rt ON ri.room_type_id = rt.room_type_id
      LEFT JOIN homestays h ON ri.homestay_id = h.homestay_id
      LEFT JOIN users u ON ht.assigned_to = u.user_id
      WHERE 1=1 ${whereClause}
      ORDER BY ht.created_at DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Staff performance
    const staffPerformance = await sequelize.query(`
      SELECT 
        u.username as staff_name,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN ht.status = 'completed' THEN 1 END) as completed_tasks,
        AVG(TIMESTAMPDIFF(MINUTE, ht.created_at, ht.completed_at)) as avg_completion_time_minutes
      FROM housekeeping_tasks ht
      INNER JOIN users u ON ht.assigned_to = u.user_id
      INNER JOIN room_inventory ri ON ht.room_id = ri.inventory_id
      WHERE ht.status = 'completed' ${whereClause}
      GROUP BY u.user_id, u.username
      ORDER BY completed_tasks DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        summary: summary[0],
        tasks,
        staff_performance: staffPerformance
      }
    });

  } catch (error) {
    console.error('Error generating housekeeping report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate housekeeping report',
      error: error.message
    });
  }
});

// ==========================================
// 7. GUEST ACTIVITY REPORT
// ==========================================
router.get('/guest-activity', async (req, res) => {
  try {
    const { start_date, end_date, guest_email } = req.query;

    let whereClause = '';
    const replacements = [];

    if (start_date && end_date) {
      whereClause += ' AND DATE(rb.check_in_date) BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    if (guest_email) {
      whereClause += ' AND rb.guest_email = ?';
      replacements.push(guest_email);
    }

    // Guest summary
    const guestSummary = await sequelize.query(`
      SELECT 
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        COUNT(DISTINCT b.booking_id) as total_stays,
        MIN(rb.check_in_date) as first_stay,
        MAX(rb.check_in_date) as last_stay,
        COALESCE(SUM(rb.final_amount), 0) as total_spent
      FROM room_bookings rb
      INNER JOIN bookings b ON rb.booking_id = b.booking_id
      WHERE b.status IN ('confirmed', 'checked_in', 'checked_out') ${whereClause}
      GROUP BY rb.guest_email, rb.guest_name, rb.guest_phone
      ORDER BY total_stays DESC
      LIMIT 100
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Services used (if specific guest)
    let servicesUsed = [];
    if (guest_email) {
      servicesUsed = await sequelize.query(`
        SELECT 
          bc.charge_type,
          COUNT(*) as usage_count,
          COALESCE(SUM(bc.total_amount), 0) as total_amount
        FROM booking_charges bc
        INNER JOIN bookings b ON bc.booking_id = b.booking_id
        INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
        WHERE rb.guest_email = ?
        GROUP BY bc.charge_type
      `, {
        replacements: [guest_email],
        type: sequelize.QueryTypes.SELECT
      });
    }

    // Restaurant orders (if specific guest)
    let restaurantOrders = [];
    if (guest_email) {
      restaurantOrders = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT ro.order_id) as total_orders,
          COALESCE(SUM(roi.total_price), 0) as total_spent
        FROM restaurant_orders ro
        INNER JOIN restaurant_order_items roi ON ro.order_id = roi.order_id
        INNER JOIN bookings b ON ro.booking_id = b.booking_id
        INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
        WHERE rb.guest_email = ? AND ro.status != 'cancelled'
      `, {
        replacements: [guest_email],
        type: sequelize.QueryTypes.SELECT
      });
    }

    res.json({
      success: true,
      data: {
        guests: guestSummary,
        services_used: servicesUsed,
        restaurant_activity: restaurantOrders[0] || null
      }
    });

  } catch (error) {
    console.error('Error generating guest activity report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate guest activity report',
      error: error.message
    });
  }
});

// ==========================================
// 8. BOOKING SOURCE REPORT
// ==========================================
router.get('/booking-source', async (req, res) => {
  try {
    const { start_date, end_date, homestay_id } = req.query;

    let whereClause = '';
    const replacements = [];

    if (start_date && end_date) {
      whereClause += ' AND DATE(b.created_at) BETWEEN ? AND ?';
      replacements.push(start_date, end_date);
    }

    if (homestay_id) {
      whereClause += ' AND rb.homestay_id = ?';
      replacements.push(homestay_id);
    }

    // Booking source breakdown
    const sourceBreakdown = await sequelize.query(`
      SELECT 
        b.booking_source,
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN b.status = 'no_show' THEN 1 END) as no_shows,
        COALESCE(SUM(rb.final_amount), 0) as total_revenue,
        ROUND((COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*)), 2) as cancellation_rate
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE 1=1 ${whereClause}
      GROUP BY b.booking_source
      ORDER BY total_bookings DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // Monthly trend
    const monthlyTrend = await sequelize.query(`
      SELECT 
        DATE_FORMAT(b.created_at, '%Y-%m') as month,
        b.booking_source,
        COUNT(*) as bookings,
        COALESCE(SUM(rb.final_amount), 0) as revenue
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      WHERE 1=1 ${whereClause}
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m'), b.booking_source
      ORDER BY month DESC, bookings DESC
      LIMIT 50
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        source_breakdown: sourceBreakdown,
        monthly_trend: monthlyTrend
      }
    });

  } catch (error) {
    console.error('Error generating booking source report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate booking source report',
      error: error.message
    });
  }
});

// ==========================================
// EXPORT TO PDF
// ==========================================
router.get('/export/pdf/:report_type', async (req, res) => {
  try {
    const { report_type } = req.params;
    
    // This is a placeholder - you would call the appropriate report endpoint
    // and format the data into a PDF
    
    res.status(501).json({
      success: false,
      message: 'PDF export not yet implemented'
    });

  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
});

// ==========================================
// EXPORT TO EXCEL
// ==========================================
router.get('/export/excel/:report_type', async (req, res) => {
  try {
    const { report_type } = req.params;
    
    // This is a placeholder - you would call the appropriate report endpoint
    // and format the data into an Excel file
    
    res.status(501).json({
      success: false,
      message: 'Excel export not yet implemented'
    });

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
});

module.exports = router;