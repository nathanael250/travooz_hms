const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/database');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Generate invoice for a booking
router.post('/generate/:booking_id', async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    
    const { booking_id } = req.params;
    const { 
      tax_rate = 18, // Default 18% VAT
      service_charge_rate = 0,
      discount_amount = 0,
      payment_terms = 'Due on receipt',
      notes = '',
      generated_by = null
    } = req.body;

    // Check if invoice already exists for this booking
    const existingInvoice = await sequelize.query(
      'SELECT invoice_id FROM invoices WHERE booking_id = ?',
      { 
        replacements: [booking_id],
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (existingInvoice.length > 0) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Invoice already exists for this booking',
        invoice_id: existingInvoice[0].invoice_id
      });
    }

    // Get booking details from room_bookings joined with bookings
    const bookings = await sequelize.query(`
      SELECT b.*, rb.*, 
             rb.guest_name, rb.guest_email, rb.guest_phone,
             rb.check_in_date, rb.check_out_date, rb.nights,
             rb.final_amount as total_price,
             h.name as homestay_name, h.address, h.phone as homestay_phone,
             r.unit_number as room_number, rt.name as room_type
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN room_inventory r ON rb.inventory_id = r.inventory_id
      LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
      WHERE b.booking_id = ?
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (bookings.length === 0) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookings[0];
    
    // Get invoice settings for logo
    const settings = await sequelize.query(`
      SELECT logo_url FROM invoice_settings WHERE homestay_id = ? AND is_active = 1
    `, {
      replacements: [booking.homestay_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });
    
    const logoUrl = settings.length > 0 ? settings[0].logo_url : null;
    
    // Calculate room charges (nights * rate)
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomCharge = parseFloat(booking.total_price) || 0;

    // Get booking charges (minibar, laundry, etc.)
    const bookingCharges = await sequelize.query(`
      SELECT charge_type, description, quantity, unit_price, total_amount, tax_amount
      FROM booking_charges
      WHERE booking_id = ?
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    // Get restaurant orders for this booking
    const restaurantOrders = await sequelize.query(`
      SELECT hoi.order_item_id, hoi.quantity, hoi.price_at_time,
             hoi.special_instructions, hm.name as item_name,
             (hoi.quantity * hoi.price_at_time) as total_price
      FROM hotel_order_items hoi
      LEFT JOIN hotel_menu hm ON hoi.menu_id = hm.menu_id
      WHERE hoi.booking_id = ?
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    // Get guest request charges for this booking
    const guestRequestCharges = await sequelize.query(`
      SELECT request_id, request_type, description, additional_charges, status
      FROM guest_requests
      WHERE booking_id = ? AND additional_charges > 0 AND status = 'completed'
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    // Generate invoice number
    const invoiceDate = new Date();
    const year = invoiceDate.getFullYear();
    const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
    
    const lastInvoice = await sequelize.query(
      `SELECT invoice_number FROM invoices 
       WHERE invoice_number LIKE ? 
       ORDER BY invoice_id DESC LIMIT 1`,
      {
        replacements: [`INV-${year}${month}-%`],
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    let invoiceNumber;
    if (lastInvoice.length > 0) {
      const lastNum = parseInt(lastInvoice[0].invoice_number.split('-')[2]);
      invoiceNumber = `INV-${year}${month}-${String(lastNum + 1).padStart(4, '0')}`;
    } else {
      invoiceNumber = `INV-${year}${month}-0001`;
    }

    // Calculate subtotal
    let subtotal = roomCharge;
    
    // Add booking charges
    bookingCharges.forEach(charge => {
      subtotal += parseFloat(charge.total_amount);
    });

    // Add restaurant charges
    restaurantOrders.forEach(order => {
      subtotal += parseFloat(order.total_price || 0);
    });

    // Add guest request charges
    guestRequestCharges.forEach(request => {
      subtotal += parseFloat(request.additional_charges || 0);
    });

    // Calculate tax and service charge
    const taxAmount = (subtotal * tax_rate) / 100;
    const serviceCharge = (subtotal * service_charge_rate) / 100;
    const totalAmount = subtotal + taxAmount + serviceCharge - parseFloat(discount_amount);

    // Create invoice
    const invoiceReplacements = [
      booking_id, invoiceNumber, invoiceDate, invoiceDate,
      subtotal, taxAmount, serviceCharge, discount_amount,
      totalAmount, 0, totalAmount, 'draft', payment_terms, notes, generated_by, logoUrl
    ];
    
    console.log('Invoice replacements:', invoiceReplacements);
    console.log('Number of replacements:', invoiceReplacements.length);
    
    const [invoiceId] = await sequelize.query(`
      INSERT INTO invoices (
        booking_id, invoice_number, invoice_date, due_date,
        subtotal, tax_amount, service_charge, discount_amount,
        total_amount, amount_paid, balance_due, status,
        payment_terms, notes, generated_by, logo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: invoiceReplacements,
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Add invoice items
    const invoiceItems = [];

    // Room charge item
    if (roomCharge > 0) {
      invoiceItems.push([
        invoiceId,
        `Room ${booking.room_number} - ${booking.room_type} (${nights} night${nights > 1 ? 's' : ''})`,
        nights,
        roomCharge / nights,
        roomCharge,
        0
      ]);
    }

    // Booking charges items
    bookingCharges.forEach(charge => {
      invoiceItems.push([
        invoiceId,
        `${charge.charge_type.replace('_', ' ').toUpperCase()} - ${charge.description}`,
        charge.quantity,
        charge.unit_price,
        charge.total_amount,
        charge.tax_amount || 0
      ]);
    });

    // Restaurant items
    restaurantOrders.forEach(item => {
      if (item.item_name) {
        invoiceItems.push([
          invoiceId,
          `Restaurant - ${item.item_name}${item.special_instructions ? ' (' + item.special_instructions + ')' : ''}`,
          item.quantity,
          item.price_at_time,
          item.total_price,
          0
        ]);
      }
    });

    // Guest request charges items
    guestRequestCharges.forEach(request => {
      invoiceItems.push([
        invoiceId,
        `${request.request_type.replace('_', ' ').toUpperCase()} - ${request.description}`,
        1,
        request.additional_charges,
        request.additional_charges,
        0
      ]);
    });

    // Insert all invoice items
    if (invoiceItems.length > 0) {
      const placeholders = invoiceItems.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
      const flatValues = invoiceItems.flat();
      await sequelize.query(`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, total_price, tax_amount
        ) VALUES ${placeholders}
      `, {
        replacements: flatValues,
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
    }

    await t.commit();

    // Fetch complete invoice data
    const invoice = await sequelize.query(`
      SELECT i.*, b.booking_reference, 
             rb.check_in_date, rb.check_out_date,
             rb.guest_name as first_name, rb.guest_email as email, rb.guest_phone as phone,
             h.name as homestay_name, h.address as homestay_address,
             h.phone as homestay_phone, h.email as homestay_email
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE i.invoice_id = ?
    `, {
      replacements: [invoiceId],
      type: sequelize.QueryTypes.SELECT
    });

    const items = await sequelize.query(`
      SELECT * FROM invoice_items WHERE invoice_id = ?
    `, {
      replacements: [invoiceId],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      message: 'Invoice generated successfully',
      invoice: {
        ...invoice[0],
        items
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error generating invoice:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate invoice',
      error: error.message,
      details: error.stack
    });
  }
});

// Get all invoices with filters
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      homestay_id, 
      from_date, 
      to_date,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    let query = `
      SELECT i.*, b.booking_reference, 
             rb.check_in_date, rb.check_out_date,
             rb.guest_name as first_name, '' as last_name, rb.guest_email as email,
             h.name as homestay_name
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE 1=1
    `;
    
    const params = [];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (homestay_id) {
      query += ' AND rb.homestay_id = ?';
      params.push(homestay_id);
    }

    if (from_date) {
      query += ' AND i.invoice_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND i.invoice_date <= ?';
      params.push(to_date);
    }

    if (search) {
      query += ` AND (i.invoice_number LIKE ? OR b.booking_reference LIKE ? 
                 OR rb.guest_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY i.invoice_date DESC, i.invoice_id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const invoices = await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: invoices
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invoices',
      error: error.message 
    });
  }
});

// Get single invoice with items
router.get('/:invoice_id', async (req, res) => {
  try {
    const { invoice_id } = req.params;

    const invoices = await sequelize.query(`
      SELECT i.*, b.booking_reference, 
             rb.check_in_date, rb.check_out_date,
             rb.guest_name as first_name, '' as last_name, 
             rb.guest_email as email, rb.guest_phone as phone, '' as address,
             rb.homestay_id, rb.inventory_id as room_id,
             h.name as homestay_name, h.address as homestay_address,
             h.phone as homestay_phone, h.email as homestay_email,
             r.unit_number as room_number, rt.name as room_type
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN room_inventory r ON rb.inventory_id = r.inventory_id
      LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
      WHERE i.invoice_id = ?
    `, {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (invoices.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    const items = await sequelize.query(`
      SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY item_id
    `, {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        ...invoices[0],
        items
      }
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invoice',
      error: error.message 
    });
  }
});

// Update invoice status
router.patch('/:invoice_id/status', async (req, res) => {
  try {
    const { invoice_id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const updateData = { status };
    
    if (status === 'sent') {
      updateData.sent_at = new Date();
    } else if (status === 'paid') {
      updateData.paid_at = new Date();
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), invoice_id];

    await sequelize.query(
      `UPDATE invoices SET ${fields} WHERE invoice_id = ?`,
      {
        replacements: values,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      success: true,
      message: 'Invoice status updated successfully'
    });

  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update invoice status',
      error: error.message 
    });
  }
});

// Get payment history for an invoice
router.get('/:invoice_id/payments', async (req, res) => {
  try {
    const { invoice_id } = req.params;

    // Get payment transactions for this invoice
    const payments = await sequelize.query(`
      SELECT 
        pt.transaction_id,
        pt.amount,
        pt.payment_method,
        pt.paid_by,
        pt.reference_number,
        pt.status,
        pt.created_at as payment_date
      FROM payment_transactions pt
      WHERE pt.invoice_id = ?
      ORDER BY pt.created_at DESC
    `, {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment history',
      error: error.message 
    });
  }
});

// Record payment
router.post('/:invoice_id/payment', async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { invoice_id } = req.params;
    const { amount, payment_method, payment_reference, notes } = req.body;
    const paid_by = req.user.full_name || req.user.email || 'Unknown User';

    // Validate required fields
    if (!amount || !payment_method) {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and payment method are required' 
      });
    }

    // Get current invoice
    const invoices = await sequelize.query(
      'SELECT * FROM invoices WHERE invoice_id = ?',
      {
        replacements: [invoice_id],
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (invoices.length === 0) {
      await t.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    const invoice = invoices[0];
    const paymentAmount = parseFloat(amount);
    const newAmountPaid = parseFloat(invoice.amount_paid) + paymentAmount;
    const newBalanceDue = parseFloat(invoice.total_amount) - newAmountPaid;

    // Determine new status
    let newStatus = invoice.status;
    if (newBalanceDue <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partially_paid';
    }

    // Record payment transaction
    const [transactionId] = await sequelize.query(`
      INSERT INTO payment_transactions (
        invoice_id, amount, payment_method, paid_by, reference_number, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'completed', NOW(), NOW())
    `, {
      replacements: [invoice_id, paymentAmount, payment_method, paid_by, payment_reference],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Update invoice
    await sequelize.query(`
      UPDATE invoices 
      SET amount_paid = ?, balance_due = ?, status = ?, paid_at = ?
      WHERE invoice_id = ?
    `, {
      replacements: [newAmountPaid, newBalanceDue, newStatus, newStatus === 'paid' ? new Date() : null, invoice_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    // Log staff activity (optional - staff_id can be null)
    try {
      await sequelize.query(`
        INSERT INTO staff_activity_logs (
          staff_id, action, table_name, record_id, timestamp
        ) VALUES (?, 'record_payment', 'invoices', ?, NOW())
      `, {
        replacements: [req.user.user_id || req.user.hms_user_id, invoice_id],
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
    } catch (logError) {
      console.log('Note: Could not log staff activity:', logError.message);
      // Continue without logging - this is not critical
    }

    await t.commit();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        transaction_id: transactionId,
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: newStatus,
        payment_amount: paymentAmount
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error recording payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record payment',
      error: error.message 
    });
  }
});

// Delete invoice (only drafts)
router.delete('/:invoice_id', async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { invoice_id } = req.params;

    // Check if invoice is draft
    const invoices = await sequelize.query(
      'SELECT status FROM invoices WHERE invoice_id = ?',
      {
        replacements: [invoice_id],
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (invoices.length === 0) {
      await t.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }

    if (invoices[0].status !== 'draft') {
      await t.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Only draft invoices can be deleted' 
      });
    }

    // Delete invoice items first
    await sequelize.query('DELETE FROM invoice_items WHERE invoice_id = ?', {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.DELETE,
      transaction: t
    });
    
    // Delete invoice
    await sequelize.query('DELETE FROM invoices WHERE invoice_id = ?', {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.DELETE,
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    await t.rollback();
    console.error('Error deleting invoice:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete invoice',
      error: error.message 
    });
  }
});

// Get invoice by booking ID
router.get('/booking/:booking_id', async (req, res) => {
  try {
    const { booking_id } = req.params;

    const invoices = await sequelize.query(`
      SELECT i.*, b.booking_reference, 
             rb.check_in_date, rb.check_out_date,
             rb.guest_name as first_name, '' as last_name, 
             rb.guest_email as email, rb.guest_phone as phone, '' as address,
             rb.homestay_id, rb.inventory_id as room_id,
             h.name as homestay_name, h.address as homestay_address,
             h.phone as homestay_phone, h.email as homestay_email,
             r.unit_number as room_number, rt.name as room_type
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN room_inventory r ON rb.inventory_id = r.inventory_id
      LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
      WHERE i.booking_id = ?
    `, {
      replacements: [booking_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (invoices.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No invoice found for this booking' 
      });
    }

    const invoice = invoices[0];

    // Get invoice items
    const items = await sequelize.query(`
      SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY item_id
    `, {
      replacements: [invoice.invoice_id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        ...invoice,
        items
      }
    });

  } catch (error) {
    console.error('Error fetching invoice by booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invoice',
      error: error.message 
    });
  }
});

// Generate PDF for invoice
router.get('/:invoice_id/pdf', async (req, res) => {
  try {
    const { invoice_id } = req.params;

    // Fetch invoice data with all related information
    const invoices = await sequelize.query(`
      SELECT i.*, b.booking_reference, 
             rb.check_in_date, rb.check_out_date,
             rb.guest_name as first_name, '' as last_name, 
             rb.guest_email as email, rb.guest_phone as phone, '' as address,
             rb.homestay_id, rb.inventory_id as room_id,
             h.name as homestay_name, h.address as homestay_address,
             h.phone as homestay_phone, h.email as homestay_email,
             r.unit_number as room_number, rt.name as room_type
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN room_inventory r ON rb.inventory_id = r.inventory_id
      LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
      WHERE i.invoice_id = ?
    `, {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (invoices.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoice = invoices[0];

    // Fetch invoice items
    const items = await sequelize.query(`
      SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY item_id
    `, {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.SELECT
    });

    // Get invoice settings for customization
    const settings = await sequelize.query(`
      SELECT * FROM invoice_settings WHERE homestay_id = ? AND is_active = 1
    `, {
      replacements: [invoice.homestay_id],
      type: sequelize.QueryTypes.SELECT
    });

    const customSettings = settings.length > 0 ? settings[0] : {};

    // Initialize PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      layout: 'portrait'
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
    
    doc.pipe(res);

    // Set colors from settings
    const primaryColor = customSettings.primary_color || '#2563EB';
    const secondaryColor = customSettings.secondary_color || '#1E40AF';
    const accentColor = customSettings.accent_color || '#3B82F6';

    // ==========================================
    // HEADER SECTION WITH COMPANY BRANDING
    // ==========================================
    doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
    
    // Company logo - use invoice logo first, then fallback to settings logo
    const logoUrl = invoice.logo_url || customSettings.logo_url;
    
    if (logoUrl) {
      try {
        // Check if it's a local file path
        if (logoUrl.startsWith('/uploads/logos/')) {
          const logoPath = path.join(__dirname, '../../', logoUrl);
          
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 20, { width: 100, height: 40 });
          } else {
            // Fallback to text if file doesn't exist
            doc.fillColor('white')
               .fontSize(16)
               .text('LOGO', 50, 20, { width: 100 });
          }
        } else {
          // For external URLs, show placeholder
          doc.fillColor('white')
             .fontSize(16)
             .text('LOGO', 50, 20, { width: 100 });
        }
      } catch (error) {
        console.error('Error loading logo:', error);
        // Fallback to text
        doc.fillColor('white')
           .fontSize(16)
           .text('LOGO', 50, 20, { width: 100 });
      }
    } else {
      // Show placeholder when no logo is configured
      doc.fillColor('white')
         .fontSize(16)
         .text('LOGO', 50, 20, { width: 100 });
    }

    // Company name and tagline
    const companyName = customSettings.company_name || invoice.homestay_name;
    const tagline = customSettings.tagline || '';
    
    doc.fillColor('white')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(companyName.toUpperCase(), 200, 20, { width: 300 });
    
    if (tagline) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(tagline, 200, 45, { width: 300 });
    }

    // "ORIGINAL" badge in top right
    doc.fillColor(accentColor)
       .rect(400, 15, 80, 20)
       .fill();
    
    doc.fillColor('white')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('ORIGINAL', 420, 22, { width: 40, align: 'center' });

    // ==========================================
    // INVOICE TITLE
    // ==========================================
    doc.fillColor('black')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('TAX INVOICE', 0, 100, { align: 'center' });

    // Draw line under title
    doc.moveTo(50, 130).lineTo(550, 130).stroke();

    // ==========================================
    // COMPANY AND CLIENT INFORMATION SECTION
    // ==========================================
    const infoY = 150;
    
    // Company Info Box (Left)
    doc.fillColor(secondaryColor)
       .rect(50, infoY, 250, 120)
       .fill();
    
    doc.fillColor('white')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('COMPANY INFO', 60, infoY + 10);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Name: ${companyName}`, 60, infoY + 30)
       .text(`Address: ${invoice.homestay_address || ''}`, 60, infoY + 45)
       .text(`TIN: ${customSettings.tax_id || 'N/A'}`, 60, infoY + 60)
       .text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 60, infoY + 75)
       .text(`Time: ${new Date(invoice.invoice_date).toLocaleTimeString()}`, 60, infoY + 90);

    // Client Info Box (Right)
    doc.fillColor(accentColor)
       .rect(320, infoY, 250, 120)
       .fill();
    
    doc.fillColor('white')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('CLIENT INFO', 330, infoY + 10);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Name: ${invoice.first_name} ${invoice.last_name}`, 330, infoY + 30)
       .text(`TIN: ${invoice.email || ''}`, 330, infoY + 45)
       .text(`Phone: ${invoice.phone || ''}`, 330, infoY + 60)
       .text(`Booking: ${invoice.booking_reference}`, 330, infoY + 75)
       .text(`Room: ${invoice.room_number || ''} (${invoice.room_type || ''})`, 330, infoY + 90);

    // ==========================================
    // ITEMS SECTION
    // ==========================================
    const itemsY = infoY + 140;
    
    doc.fillColor('black')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('ITEMS', 50, itemsY);

    // Items table header
    const tableY = itemsY + 20;
    const col1X = 50;   // Description
    const col2X = 280;  // Quantity
    const col3X = 350;  // Price
    const col4X = 420;  // Tax
    const col5X = 480;  // Total

    // Table header background
    doc.fillColor(primaryColor)
       .rect(col1X, tableY, 480, 20)
       .fill();
    
    // Table header text
    doc.fillColor('white')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Description', col1X + 5, tableY + 5)
       .text('Qty', col2X + 5, tableY + 5)
       .text('Price', col3X + 5, tableY + 5)
       .text('Tax', col4X + 5, tableY + 5)
       .text('Total', col5X + 5, tableY + 5);

    // Items rows
    let currentY = tableY + 25;
    items.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      // Alternating row colors
      doc.fillColor(index % 2 === 0 ? '#F8F9FA' : 'white')
         .rect(col1X, currentY - 5, 480, 20)
         .fill();

      // Item data
      doc.fillColor('black')
         .fontSize(9)
         .font('Helvetica')
         .text(item.description, col1X + 5, currentY, { width: 220 })
         .text(item.quantity.toString(), col2X + 5, currentY)
         .text(`${customSettings.currency_symbol || 'RWF'} ${parseFloat(item.unit_price).toLocaleString()}`, col3X + 5, currentY)
         .text('A', col4X + 5, currentY)
         .text(`${customSettings.currency_symbol || 'RWF'} ${parseFloat(item.total_price).toLocaleString()}`, col5X + 5, currentY, { width: 80 });
      
      currentY += 25;
    });

    // ==========================================
    // TOTALS SECTION
    // ==========================================
    const totalsY = currentY + 20;
    
    doc.fillColor('black')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('TOTALS', 50, totalsY);

    const totalsTableY = totalsY + 20;
    const totalStartX = 350;
    const totalEndX = 450; // Fixed position for numbers

    // Helper function to calculate text width and position
    const getTextWidth = (text, fontSize = 10) => {
      return doc.fontSize(fontSize).widthOfString(text);
    };

    doc.fontSize(10).font('Helvetica');
    
    // Subtotal
    const subtotalText = `${customSettings.currency_symbol || 'RWF'} ${parseFloat(invoice.subtotal).toLocaleString()}`;
    const subtotalWidth = getTextWidth(subtotalText);
    doc.text('Subtotal:', totalStartX, totalsTableY)
       .text(subtotalText, totalEndX - subtotalWidth, totalsTableY);

    // Tax (if applicable)
    if (parseFloat(invoice.tax_amount) > 0) {
      const taxText = `${customSettings.currency_symbol || 'RWF'} ${parseFloat(invoice.tax_amount).toLocaleString()}`;
      const taxWidth = getTextWidth(taxText);
      doc.text('Tax:', totalStartX, totalsTableY + 20)
         .text(taxText, totalEndX - taxWidth, totalsTableY + 20);
    }

    // Service Charge (if applicable)
    if (parseFloat(invoice.service_charge) > 0) {
      const serviceText = `${customSettings.currency_symbol || 'RWF'} ${parseFloat(invoice.service_charge).toLocaleString()}`;
      const serviceWidth = getTextWidth(serviceText);
      doc.text('Service Charge:', totalStartX, totalsTableY + 40)
         .text(serviceText, totalEndX - serviceWidth, totalsTableY + 40);
    }

    // Discount (if applicable)
    if (parseFloat(invoice.discount_amount) > 0) {
      const discountText = `-${customSettings.currency_symbol || 'RWF'} ${parseFloat(invoice.discount_amount).toLocaleString()}`;
      const discountWidth = getTextWidth(discountText);
      doc.text('Discount:', totalStartX, totalsTableY + 60)
         .text(discountText, totalEndX - discountWidth, totalsTableY + 60);
    }

    // Total Amount (Bold)
    doc.font('Helvetica-Bold').fontSize(12);
    const totalText = `${customSettings.currency_symbol || 'RWF'} ${parseFloat(invoice.total_amount).toLocaleString()}`;
    const totalWidth = getTextWidth(totalText, 12);
    doc.text('TOTAL:', totalStartX, totalsTableY + 80)
       .text(totalText, totalEndX - totalWidth, totalsTableY + 80);

    // Total Items Count
    doc.font('Helvetica').fontSize(10);
    doc.text(`Total Items: ${items.length}`, totalStartX, totalsTableY + 100);

    // ==========================================
    // PAYMENT INFORMATION
    // ==========================================
    if (customSettings.bank_name || customSettings.mobile_money_number) {
      const paymentY = totalsTableY + 130;
      
      doc.fillColor('black')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('PAYMENT INFORMATION', 50, paymentY);

      let paymentInfoY = paymentY + 20;
      
      if (customSettings.bank_name) {
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Bank: ${customSettings.bank_name}`, 50, paymentInfoY)
           .text(`Account: ${customSettings.bank_account_number || ''}`, 50, paymentInfoY + 15);
        paymentInfoY += 35;
      }

      if (customSettings.mobile_money_number) {
        doc.text(`Mobile Money: ${customSettings.mobile_money_number} (${customSettings.mobile_money_provider || ''})`, 50, paymentInfoY);
        paymentInfoY += 20;
      }
    }

    // ==========================================
    // TERMS AND CONDITIONS
    // ==========================================
    if (customSettings.payment_terms || customSettings.terms_and_conditions) {
      const termsY = totalsTableY + 200;
      
      doc.fillColor('black')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('TERMS & CONDITIONS', 50, termsY);

      let termsInfoY = termsY + 20;
      
      if (customSettings.payment_terms) {
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Payment Terms: ${customSettings.payment_terms}`, 50, termsInfoY);
        termsInfoY += 20;
      }

      if (customSettings.terms_and_conditions) {
        doc.text(customSettings.terms_and_conditions, 50, termsInfoY, { width: 500 });
      }
    }

    // ==========================================
    // FOOTER
    // ==========================================
    const footerY = doc.page.height - 100;
    
    // Footer background
    doc.fillColor('#F8F9FA')
       .rect(50, footerY, 500, 40)
       .fill();
    
    // Footer text
    doc.fillColor('black')
       .fontSize(10)
       .font('Helvetica')
       .text('=== END OF LEGAL RECEIPT ===', 50, footerY + 10, { align: 'center' })
       .text('Computer-generated. No signature required.', 50, footerY + 25, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate PDF',
        error: error.message 
      });
    }
  }
});

// Send invoice via email
router.post('/:invoice_id/send-email', async (req, res) => {
  try {
    const { invoice_id } = req.params;
    const { recipient_email, message } = req.body;

    const invoices = await sequelize.query(`
      SELECT i.*, b.booking_reference, 
             rb.check_in_date, rb.check_out_date,
             rb.guest_name as first_name, '' as last_name, 
             rb.guest_email as email, rb.guest_phone as phone,
             h.name as homestay_name, h.email as homestay_email
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.booking_id
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      WHERE i.invoice_id = ?
    `, {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.SELECT
    });

    if (invoices.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoice = invoices[0];
    const emailTo = recipient_email || invoice.email;

    if (!emailTo) {
      return res.status(400).json({ 
        success: false, 
        message: 'No recipient email provided' 
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-password'
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || invoice.homestay_email || 'noreply@travooz.com',
      to: emailTo,
      subject: `Invoice ${invoice.invoice_number} from ${invoice.homestay_name}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Invoice ${invoice.invoice_number}</h2>
              
              <p>Dear ${invoice.first_name} ${invoice.last_name},</p>
              
              ${message ? `<p>${message}</p>` : `<p>Please find attached your invoice for booking reference ${invoice.booking_reference}.</p>`}
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
                <p style="margin: 5px 0;"><strong>Invoice Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> RWF ${parseFloat(invoice.total_amount).toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Balance Due:</strong> RWF ${parseFloat(invoice.balance_due).toLocaleString()}</p>
              </div>
              
              <p>You can view and download your invoice by clicking the link below:</p>
              <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/financial/invoices" 
                     style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Invoice
              </a></p>
              
              <p style="margin-top: 30px;">Best regards,<br/>${invoice.homestay_name}</p>
              
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;"/>
              <p style="font-size: 12px; color: #666;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    await sequelize.query(
      `UPDATE invoices SET status = 'sent', sent_at = ? WHERE invoice_id = ?`,
      {
        replacements: [new Date(), invoice_id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      success: true,
      message: 'Invoice sent successfully via email'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send invoice email',
      error: error.message 
    });
  }
});

module.exports = router;