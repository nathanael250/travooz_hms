const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Op } = require('sequelize');
const BookingCharge = require('../models/bookingCharge.model');
const Booking = require('../models/booking.model');
const RoomBooking = require('../models/roomBooking.model');
const Room = require('../models/room.model');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all booking charges
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      booking_id,
      charge_type,
      charge_category,
      date_from,
      date_to,
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};

    if (booking_id) whereClause.booking_id = booking_id;
    if (charge_type) whereClause.charge_type = charge_type;
    if (charge_category) whereClause.charge_category = charge_category;

    if (date_from && date_to) {
      whereClause.charged_at = {
        [Op.between]: [date_from, date_to]
      };
    }

    const charges = await BookingCharge.findAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'guest_name', 'status'],
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room',
                  attributes: ['inventory_id', 'unit_number', 'floor', 'status']
                }
              ]
            }
          ]
        }
      ],
      order: [['charged_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: charges,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total_count: await BookingCharge.count({ where: whereClause })
      }
    });
  } catch (error) {
    console.error('Error fetching booking charges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking charges',
      error: error.message
    });
  }
});

// Get booking charge by ID
router.get('/:charge_id', authMiddleware, [
  param('charge_id').isInt({ min: 1 }).withMessage('Valid charge ID is required')
], async (req, res) => {
  try {
    const { charge_id } = req.params;

    const charge = await BookingCharge.findByPk(charge_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Booking charge not found'
      });
    }

    res.json({
      success: true,
      data: charge
    });
  } catch (error) {
    console.error('Error fetching booking charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking charge',
      error: error.message
    });
  }
});

// Create new booking charge
router.post('/', authMiddleware, [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
  body('charge_type').isIn(['room', 'minibar', 'room_service', 'laundry', 'phone', 'parking', 'extra_bed', 'early_checkin', 'late_checkout', 'damage', 'other'])
    .withMessage('Valid charge type is required'),
  body('description').notEmpty().withMessage('Charge description is required'),
  body('unit_price').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid unit price is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('tax_amount').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid tax amount is required')
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

    const {
      booking_id,
      charge_type,
      description,
      quantity = 1,
      unit_price,
      tax_amount = 0,
      notes
    } = req.body;

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Calculate total amount
    const totalAmount = (parseFloat(unit_price) * parseInt(quantity)) + parseFloat(tax_amount);

    // Create booking charge
    const charge = await BookingCharge.create({
      booking_id,
      charge_type,
      description,
      quantity,
      unit_price,
      tax_amount,
      total_amount: totalAmount,
      notes,
      charged_by: req.user.user_id,
      charged_at: new Date()
    });

    // Fetch complete charge data
    const completeCharge = await BookingCharge.findByPk(charge.charge_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room'
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Booking charge created successfully',
      data: completeCharge
    });
  } catch (error) {
    console.error('Error creating booking charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking charge',
      error: error.message
    });
  }
});

// Update booking charge
router.put('/:charge_id', authMiddleware, [
  param('charge_id').isInt({ min: 1 }).withMessage('Valid charge ID is required'),
  body('charge_type').optional().isIn(['room', 'minibar', 'room_service', 'laundry', 'phone', 'parking', 'extra_bed', 'early_checkin', 'late_checkout', 'damage', 'other'])
    .withMessage('Valid charge type is required'),
  body('description').optional().notEmpty().withMessage('Charge description cannot be empty'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('unit_price').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid unit price is required'),
  body('tax_amount').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid tax amount is required')
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

    const { charge_id } = req.params;
    const updateData = req.body;

    const charge = await BookingCharge.findByPk(charge_id);
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Booking charge not found'
      });
    }

    // Recalculate total amount if relevant fields are updated
    if (updateData.quantity || updateData.unit_price || updateData.tax_amount !== undefined) {
      const quantity = updateData.quantity || charge.quantity;
      const unitPrice = updateData.unit_price || charge.unit_price;
      const taxAmount = updateData.tax_amount !== undefined ? updateData.tax_amount : charge.tax_amount;

      updateData.total_amount = (parseFloat(unitPrice) * parseInt(quantity)) + parseFloat(taxAmount);
    }

    await charge.update(updateData);

    const updatedCharge = await BookingCharge.findByPk(charge_id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: RoomBooking,
              as: 'roomBooking',
              include: [
                {
                  model: Room,
                  as: 'room'
                }
              ]
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Booking charge updated successfully',
      data: updatedCharge
    });
  } catch (error) {
    console.error('Error updating booking charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking charge',
      error: error.message
    });
  }
});

// Delete booking charge
router.delete('/:charge_id', authMiddleware, [
  param('charge_id').isInt({ min: 1 }).withMessage('Valid charge ID is required')
], async (req, res) => {
  try {
    const { charge_id } = req.params;

    const charge = await BookingCharge.findByPk(charge_id);
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Booking charge not found'
      });
    }

    await charge.destroy();

    res.json({
      success: true,
      message: 'Booking charge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking charge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking charge',
      error: error.message
    });
  }
});

// Get charges by booking ID
router.get('/booking/:booking_id', authMiddleware, [
  param('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required')
], async (req, res) => {
  try {
    const { booking_id } = req.params;

    const charges = await BookingCharge.findAll({
      where: { booking_id },
      order: [['charged_at', 'DESC']]
    });

    // Calculate summary
    const summary = {
      total_charges: charges.length,
      total_amount: charges.reduce((sum, charge) => sum + parseFloat(charge.total_amount), 0),
      total_tax: charges.reduce((sum, charge) => sum + parseFloat(charge.tax_amount || 0), 0),
      charges_by_category: {}
    };

    // Group by category
    charges.forEach(charge => {
      if (!summary.charges_by_category[charge.charge_category]) {
        summary.charges_by_category[charge.charge_category] = {
          count: 0,
          amount: 0
        };
      }
      summary.charges_by_category[charge.charge_category].count++;
      summary.charges_by_category[charge.charge_category].amount += parseFloat(charge.total_amount);
    });

    res.json({
      success: true,
      data: {
        charges,
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching charges by booking ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch charges for booking',
      error: error.message
    });
  }
});

// Get charge statistics
router.get('/statistics/dashboard', authMiddleware, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateFilter = {};
    if (date_from && date_to) {
      dateFilter = {
        charged_at: {
          [Op.between]: [date_from, date_to]
        }
      };
    }

    // Revenue by charge type
    const typeStats = await BookingCharge.findAll({
      attributes: [
        'charge_type',
        [BookingCharge.sequelize.fn('COUNT', BookingCharge.sequelize.col('charge_id')), 'count'],
        [BookingCharge.sequelize.fn('SUM', BookingCharge.sequelize.col('total_amount')), 'total_amount']
      ],
      where: dateFilter,
      group: ['charge_type'],
      raw: true
    });

    // Revenue by charge category
    const categoryStats = await BookingCharge.findAll({
      attributes: [
        'charge_category',
        [BookingCharge.sequelize.fn('COUNT', BookingCharge.sequelize.col('charge_id')), 'count'],
        [BookingCharge.sequelize.fn('SUM', BookingCharge.sequelize.col('total_amount')), 'total_amount']
      ],
      where: dateFilter,
      group: ['charge_category'],
      raw: true
    });

    // Overall statistics
    const overallStats = await BookingCharge.findAll({
      attributes: [
        [BookingCharge.sequelize.fn('COUNT', BookingCharge.sequelize.col('charge_id')), 'total_charges'],
        [BookingCharge.sequelize.fn('SUM', BookingCharge.sequelize.col('total_amount')), 'total_revenue'],
        [BookingCharge.sequelize.fn('SUM', BookingCharge.sequelize.col('tax_amount')), 'total_tax'],
        [BookingCharge.sequelize.fn('AVG', BookingCharge.sequelize.col('total_amount')), 'avg_charge']
      ],
      where: dateFilter,
      raw: true
    });

    // Daily revenue trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await BookingCharge.findAll({
      attributes: [
        [BookingCharge.sequelize.fn('DATE', BookingCharge.sequelize.col('charged_at')), 'date'],
        [BookingCharge.sequelize.fn('SUM', BookingCharge.sequelize.col('total_amount')), 'daily_revenue'],
        [BookingCharge.sequelize.fn('COUNT', BookingCharge.sequelize.col('charge_id')), 'daily_count']
      ],
      where: {
        charged_at: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [BookingCharge.sequelize.fn('DATE', BookingCharge.sequelize.col('charged_at'))],
      order: [[BookingCharge.sequelize.fn('DATE', BookingCharge.sequelize.col('charged_at')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        type_distribution: typeStats,
        category_distribution: categoryStats,
        overall_statistics: overallStats[0] || { total_charges: 0, total_revenue: 0, total_tax: 0, avg_charge: 0 },
        daily_revenue_trend: dailyRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching charge statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch charge statistics',
      error: error.message
    });
  }
});

module.exports = router;