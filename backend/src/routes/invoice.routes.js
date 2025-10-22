const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/database');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

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

    // Calculate tax and service charge
    const taxAmount = (subtotal * tax_rate) / 100;
    const serviceCharge = (subtotal * service_charge_rate) / 100;
    const totalAmount = subtotal + taxAmount + serviceCharge - parseFloat(discount_amount);

    // Create invoice
    const invoiceReplacements = [
      booking_id, invoiceNumber, invoiceDate, invoiceDate,
      subtotal, taxAmount, serviceCharge, discount_amount,
      totalAmount, 0, totalAmount, 'draft', payment_terms, notes, generated_by
    ];
    
    console.log('Invoice replacements:', invoiceReplacements);
    console.log('Number of replacements:', invoiceReplacements.length);
    
    const [invoiceId] = await sequelize.query(`
      INSERT INTO invoices (
        booking_id, invoice_number, invoice_date, due_date,
        subtotal, tax_amount, service_charge, discount_amount,
        total_amount, amount_paid, balance_due, status,
        payment_terms, notes, generated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

// Record payment
router.post('/:invoice_id/payment', async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { invoice_id } = req.params;
    const { amount, payment_method, payment_reference, notes } = req.body;

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
    const newAmountPaid = parseFloat(invoice.amount_paid) + parseFloat(amount);
    const newBalanceDue = parseFloat(invoice.total_amount) - newAmountPaid;

    let newStatus = invoice.status;
    if (newBalanceDue <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partially_paid';
    }

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

    // Record payment transaction (if you have a payments table)
    // This is optional - you can create a payments table to track individual payments

    await t.commit();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: newStatus
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

// Generate PDF for invoice
router.get('/:invoice_id/pdf', async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoice = invoices[0];

    const items = await sequelize.query(`
      SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY item_id
    `, {
      replacements: [invoice_id],
      type: sequelize.QueryTypes.SELECT
    });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(invoice.homestay_name, { align: 'left' });
    doc.fontSize(10)
      .text(invoice.homestay_address || '')
      .text(`Phone: ${invoice.homestay_phone || ''}`)
      .text(`Email: ${invoice.homestay_email || ''}`);

    doc.moveDown();

    doc.fontSize(10)
      .text(`Invoice #: ${invoice.invoice_number}`, { align: 'right' })
      .text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, { align: 'right' })
      .text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, { align: 'right' });

    doc.moveDown();

    doc.fontSize(12).text('Bill To:', { underline: true });
    doc.fontSize(10)
      .text(`${invoice.first_name} ${invoice.last_name}`)
      .text(invoice.email || '')
      .text(invoice.phone || '')
      .text(invoice.address || '');

    doc.moveDown();

    doc.fontSize(10)
      .text(`Booking Reference: ${invoice.booking_reference}`)
      .text(`Check-in: ${new Date(invoice.check_in_date).toLocaleDateString()}`)
      .text(`Check-out: ${new Date(invoice.check_out_date).toLocaleDateString()}`);
    
    if (invoice.room_number) {
      doc.text(`Room: ${invoice.room_number} (${invoice.room_type || ''})`);
    }

    doc.moveDown(2);

    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 300;
    const col3X = 380;
    const col4X = 460;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', col1X, tableTop);
    doc.text('Qty', col2X, tableTop);
    doc.text('Price', col3X, tableTop);
    doc.text('Total', col4X, tableTop);
    
    doc.moveTo(col1X, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    doc.font('Helvetica');
    let yPosition = tableTop + 25;

    items.forEach((item) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fontSize(9)
        .text(item.description, col1X, yPosition, { width: 240 })
        .text(item.quantity.toString(), col2X, yPosition)
        .text(`RWF ${parseFloat(item.unit_price).toLocaleString()}`, col3X, yPosition)
        .text(`RWF ${parseFloat(item.total_price).toLocaleString()}`, col4X, yPosition);
      
      yPosition += 25;
    });

    doc.moveTo(col1X, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 15;

    const totalStartX = 400;
    doc.fontSize(10);
    doc.text('Subtotal:', totalStartX, yPosition);
    doc.text(`RWF ${parseFloat(invoice.subtotal).toLocaleString()}`, col4X, yPosition);
    yPosition += 20;

    if (parseFloat(invoice.tax_amount) > 0) {
      doc.text('Tax (18%):', totalStartX, yPosition);
      doc.text(`RWF ${parseFloat(invoice.tax_amount).toLocaleString()}`, col4X, yPosition);
      yPosition += 20;
    }

    if (parseFloat(invoice.service_charge) > 0) {
      doc.text('Service Charge:', totalStartX, yPosition);
      doc.text(`RWF ${parseFloat(invoice.service_charge).toLocaleString()}`, col4X, yPosition);
      yPosition += 20;
    }

    if (parseFloat(invoice.discount_amount) > 0) {
      doc.text('Discount:', totalStartX, yPosition);
      doc.text(`-RWF ${parseFloat(invoice.discount_amount).toLocaleString()}`, col4X, yPosition);
      yPosition += 20;
    }

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total Amount:', totalStartX, yPosition);
    doc.text(`RWF ${parseFloat(invoice.total_amount).toLocaleString()}`, col4X, yPosition);
    yPosition += 20;

    if (parseFloat(invoice.amount_paid) > 0) {
      doc.font('Helvetica').fontSize(10);
      doc.text('Amount Paid:', totalStartX, yPosition);
      doc.text(`RWF ${parseFloat(invoice.amount_paid).toLocaleString()}`, col4X, yPosition);
      yPosition += 20;
    }

    if (parseFloat(invoice.balance_due) > 0) {
      doc.font('Helvetica-Bold');
      doc.text('Balance Due:', totalStartX, yPosition);
      doc.text(`RWF ${parseFloat(invoice.balance_due).toLocaleString()}`, col4X, yPosition);
      yPosition += 20;
    }

    if (invoice.notes) {
      yPosition += 30;
      doc.font('Helvetica').fontSize(10);
      doc.text('Notes:', 50, yPosition, { underline: true });
      yPosition += 15;
      doc.text(invoice.notes, 50, yPosition, { width: 500 });
    }

    if (invoice.payment_terms) {
      yPosition += 30;
      doc.text('Payment Terms:', 50, yPosition, { underline: true });
      yPosition += 15;
      doc.text(invoice.payment_terms, 50, yPosition);
    }

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