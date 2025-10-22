const express = require('express');
const { Booking, Guest, Payment } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get occupancy report
router.get('/occupancy', async (req, res) => {
  try {
    const { startDate, endDate, hotelId } = req.query;
    
    let where = {};
    if (hotelId) where.hotelId = hotelId;
    
    if (startDate && endDate) {
      where.checkInDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const occupancyData = await Booking.findAll({
      where,
      attributes: [
        'checkInDate',
        'checkOutDate',
        'status'
      ],
      order: [['checkInDate', 'ASC']]
    });

    // Calculate occupancy rate
    const occupiedNights = occupancyData.filter(b => b.status === 'CheckedIn').length;

    res.json({
      success: true,
      data: {
        occupancyData,
        occupiedRooms: occupiedNights
      }
    });
  } catch (error) {
    console.error('Occupancy report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate occupancy report',
      error: error.message
    });
  }
});

// Get revenue report
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, hotelId } = req.query;
    
    let where = {};
    if (hotelId) where.hotelId = hotelId;
    
    if (startDate && endDate) {
      where.checkInDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const revenueData = await Booking.findAll({
      where,
      attributes: [
        'totalAmount',
        'paidAmount',
        'taxAmount',
        'discountAmount',
        'checkInDate',
        'status'
      ],
      include: [
        {
          model: Payment,
          as: 'payments',
          attributes: ['amount', 'paymentMethod', 'paymentDate', 'paymentStatus']
        }
      ]
    });

    const totalRevenue = revenueData.reduce((sum, booking) => sum + parseFloat(booking.totalAmount || 0), 0);
    const totalPaid = revenueData.reduce((sum, booking) => sum + parseFloat(booking.paidAmount || 0), 0);
    const totalTax = revenueData.reduce((sum, booking) => sum + parseFloat(booking.taxAmount || 0), 0);
    const totalDiscount = revenueData.reduce((sum, booking) => sum + parseFloat(booking.discountAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        totalTax: totalTax.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        outstanding: (totalRevenue - totalPaid).toFixed(2),
        revenueData
      }
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate revenue report',
      error: error.message
    });
  }
});

// Get guest statistics
router.get('/guests', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    const guestStats = {
      totalGuests: await Guest.count(),
      newGuests: await Guest.count({ where }),
      vipGuests: await Guest.count({ where: { vipStatus: true } }),
      blacklistedGuests: await Guest.count({ where: { isBlacklisted: true } })
    };

    // Top guests by booking count
    const topGuests = await Guest.findAll({
      attributes: [
        'id', 'firstName', 'lastName', 'email',
        [require('sequelize').fn('COUNT', require('sequelize').col('bookings.id')), 'bookingCount']
      ],
      include: [
        {
          model: Booking,
          as: 'bookings',
          attributes: []
        }
      ],
      group: ['Guest.id'],
      order: [[require('sequelize').literal('bookingCount'), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        guestStats,
        topGuests
      }
    });
  } catch (error) {
    console.error('Guest statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate guest statistics',
      error: error.message
    });
  }
});

module.exports = router;