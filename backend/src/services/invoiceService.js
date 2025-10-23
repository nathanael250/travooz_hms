/**
 * INVOICE SERVICE
 * Handles all invoice-related business logic and charge aggregation
 * Supports multi-vendor system with property-level isolation
 */

const { sequelize } = require('../../config/database');
const InvoiceSettings = require('../models/invoiceSettings.model');

/**
 * Aggregates all charges for a booking
 * Combines: Room charges, Restaurant orders, Laundry/Guest requests, and other charges
 * 
 * @param {number} bookingId - The booking ID
 * @returns {Promise<Object>} Aggregated charges object
 */
async function aggregateChargesForBooking(bookingId) {
  try {
    // 1. Get booking and room details
    const bookingData = await sequelize.query(`
      SELECT 
        b.booking_id,
        b.booking_reference,
        rb.check_in_date,
        rb.check_out_date,
        rb.nights,
        rb.guest_name,
        rb.guest_email,
        rb.guest_phone,
        rb.homestay_id,
        rb.inventory_id,
        rb.final_amount as room_total,
        h.name as homestay_name,
        h.address as homestay_address,
        h.phone as homestay_phone,
        h.email as homestay_email,
        r.unit_number as room_number,
        rt.name as room_type
      FROM bookings b
      INNER JOIN room_bookings rb ON b.booking_id = rb.booking_id
      LEFT JOIN homestays h ON rb.homestay_id = h.homestay_id
      LEFT JOIN room_inventory r ON rb.inventory_id = r.inventory_id
      LEFT JOIN room_types rt ON r.room_type_id = rt.room_type_id
      WHERE b.booking_id = ?
      LIMIT 1
    `, {
      replacements: [bookingId],
      type: sequelize.QueryTypes.SELECT
    });

    if (bookingData.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingData[0];
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomCharge = parseFloat(booking.room_total) || 0;

    // 2. Fetch booking charges (minibar, etc.)
    const bookingCharges = await sequelize.query(`
      SELECT
        charge_type,
        description,
        quantity,
        unit_price,
        total_amount,
        tax_amount
      FROM booking_charges
      WHERE booking_id = ?
      ORDER BY charged_at DESC
    `, {
      replacements: [bookingId],
      type: sequelize.QueryTypes.SELECT
    });

    // 3. Fetch restaurant orders
    const restaurantOrders = await sequelize.query(`
      SELECT 
        hoi.order_item_id,
        hoi.quantity,
        hoi.price_at_time,
        hoi.special_instructions,
        hm.name as item_name,
        (hoi.quantity * hoi.price_at_time) as total_price
      FROM hotel_order_items hoi
      LEFT JOIN hotel_menu hm ON hoi.menu_id = hm.menu_id
      WHERE hoi.booking_id = ?
      ORDER BY hoi.created_at DESC
    `, {
      replacements: [bookingId],
      type: sequelize.QueryTypes.SELECT
    });

    // 4. Fetch laundry and other guest requests with charges
    const guestRequests = await sequelize.query(`
      SELECT
        request_type,
        description,
        COUNT(*) as quantity,
        AVG(additional_charges) as unit_price,
        SUM(additional_charges) as total,
        MAX(requested_time) as latest_request_time
      FROM guest_requests
      WHERE booking_id = ? AND additional_charges > 0
      GROUP BY request_type, description
      ORDER BY latest_request_time DESC
    `, {
      replacements: [bookingId],
      type: sequelize.QueryTypes.SELECT
    });

    // 5. Compile all invoice items
    const invoiceItems = [];

    // Room charge item
    if (roomCharge > 0) {
      invoiceItems.push({
        description: `Room ${booking.room_number || 'N/A'} - ${booking.room_type || 'Standard'} (${nights} night${nights > 1 ? 's' : ''})`,
        quantity: nights,
        unit_price: roomCharge / nights,
        total_price: roomCharge,
        tax_amount: 0,
        category: 'room'
      });
    }

    // Booking charges (minibar, etc.)
    bookingCharges.forEach(charge => {
      invoiceItems.push({
        description: `${charge.charge_type.replace(/_/g, ' ').toUpperCase()} - ${charge.description}`,
        quantity: charge.quantity || 1,
        unit_price: parseFloat(charge.unit_price) || 0,
        total_price: parseFloat(charge.total_amount) || 0,
        tax_amount: parseFloat(charge.tax_amount) || 0,
        category: 'charge'
      });
    });

    // Restaurant items
    restaurantOrders.forEach(item => {
      if (item.item_name) {
        invoiceItems.push({
          description: `Restaurant - ${item.item_name}${item.special_instructions ? ' (' + item.special_instructions + ')' : ''}`,
          quantity: item.quantity || 1,
          unit_price: parseFloat(item.price_at_time) || 0,
          total_price: parseFloat(item.total_price) || 0,
          tax_amount: 0,
          category: 'restaurant'
        });
      }
    });

    // Guest requests (laundry, etc.)
    guestRequests.forEach(item => {
      invoiceItems.push({
        description: `${item.request_type.replace(/_/g, ' ').toUpperCase()} - ${item.description || item.request_type}`,
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        total_price: parseFloat(item.total) || 0,
        tax_amount: 0,
        category: 'service'
      });
    });

    // 6. Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

    return {
      booking,
      nights,
      invoiceItems,
      subtotal
    };
  } catch (error) {
    console.error('Error aggregating charges:', error);
    throw error;
  }
}

/**
 * Generate invoice number with format: INV-YYYYMM-XXXX
 * @returns {Promise<string>} Next invoice number
 */
async function generateInvoiceNumber() {
  try {
    const invoiceDate = new Date();
    const year = invoiceDate.getFullYear();
    const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');

    const lastInvoice = await sequelize.query(
      `SELECT invoice_number FROM invoices 
       WHERE invoice_number LIKE ? 
       ORDER BY invoice_id DESC LIMIT 1`,
      {
        replacements: [`INV-${year}${month}-%`],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (lastInvoice.length > 0) {
      const lastNum = parseInt(lastInvoice[0].invoice_number.split('-')[2]);
      return `INV-${year}${month}-${String(lastNum + 1).padStart(4, '0')}`;
    } else {
      return `INV-${year}${month}-0001`;
    }
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
}

/**
 * Create invoice with all items and return complete invoice object
 * 
 * @param {Object} params - Invoice parameters
 * @param {number} params.bookingId - Booking ID
 * @param {number} params.taxRate - Tax rate percentage (default 18)
 * @param {number} params.serviceChargeRate - Service charge rate percentage (default 0)
 * @param {number} params.discountAmount - Discount amount (default 0)
 * @param {string} params.paymentTerms - Payment terms
 * @param {string} params.notes - Invoice notes
 * @param {number} params.generatedBy - User ID who generated the invoice
 * @returns {Promise<Object>} Created invoice with items
 */
async function createInvoice(params) {
  const t = await sequelize.transaction();

  try {
    const {
      bookingId,
      taxRate = 18,
      serviceChargeRate = 0,
      discountAmount = 0,
      paymentTerms = 'Due on receipt',
      notes = '',
      generatedBy = null
    } = params;

    // Check if invoice already exists
    const existingInvoice = await sequelize.query(
      'SELECT invoice_id FROM invoices WHERE booking_id = ?',
      {
        replacements: [bookingId],
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (existingInvoice.length > 0) {
      await t.rollback();
      throw new Error(`Invoice already exists for booking ID ${bookingId}`);
    }

    // Aggregate all charges
    const { booking, nights, invoiceItems, subtotal } = await aggregateChargesForBooking(bookingId);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals
    const taxAmount = (subtotal * taxRate) / 100;
    const serviceCharge = (subtotal * serviceChargeRate) / 100;
    const totalAmount = subtotal + taxAmount + serviceCharge - parseFloat(discountAmount);
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30); // Default 30 days payment terms

    // Insert invoice
    const [invoiceId] = await sequelize.query(`
      INSERT INTO invoices (
        booking_id,
        invoice_number,
        invoice_date,
        invoce_logo,
        due_date,
        subtotal,
        tax_amount,
        service_charge,
        discount_amount,
        total_amount,
        amount_paid,
        balance_due,
        status,
        payment_terms,
        notes,
        generated_by,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        bookingId,
        invoiceNumber,
        invoiceDate,
        '', // invoce_logo - empty string as default
        dueDate,
        subtotal,
        taxAmount,
        serviceCharge,
        discountAmount,
        totalAmount,
        0, // amount_paid
        totalAmount, // balance_due
        'draft', // status
        paymentTerms,
        notes,
        generatedBy
      ],
      type: sequelize.QueryTypes.INSERT,
      transaction: t
    });

    // Insert invoice items
    if (invoiceItems.length > 0) {
      const itemPlaceholders = invoiceItems.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
      const flatValues = invoiceItems.flatMap(item => [
        invoiceId,
        item.description,
        item.quantity,
        item.unit_price,
        item.total_price,
        item.tax_amount
      ]);

      await sequelize.query(`
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          total_price,
          tax_amount
        ) VALUES ${itemPlaceholders}
      `, {
        replacements: flatValues,
        type: sequelize.QueryTypes.INSERT,
        transaction: t
      });
    }

    await t.commit();

    // Fetch and return complete invoice
    const createdInvoice = await sequelize.query(`
      SELECT i.*,
             b.booking_reference,
             rb.check_in_date,
             rb.check_out_date,
             rb.guest_name as first_name,
             rb.guest_email as email,
             rb.guest_phone as phone,
             rb.homestay_id,
             h.name as homestay_name,
             h.address as homestay_address,
             h.phone as homestay_phone,
             h.email as homestay_email
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
      SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY item_id
    `, {
      replacements: [invoiceId],
      type: sequelize.QueryTypes.SELECT
    });

    // Fetch invoice settings/branding for this hotel
    let branding = null;
    if (createdInvoice[0]?.homestay_id) {
      branding = await InvoiceSettings.findOne({
        where: { homestay_id: createdInvoice[0].homestay_id }
      });
    }

    return {
      success: true,
      invoice: {
        ...createdInvoice[0],
        items,
        branding: branding || null // Include branding settings with invoice
      }
    };

  } catch (error) {
    // Only rollback if transaction is still active
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error('Error creating invoice:', error);
    throw error;
  }
}

module.exports = {
  aggregateChargesForBooking,
  generateInvoiceNumber,
  createInvoice
};