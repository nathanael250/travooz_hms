const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { GuestReview, GuestProfile, Booking, Homestay, RoomInventory } = require('../models');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/guest-reviews - List all reviews
router.get('/', [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'flagged']),
  query('homestay_id').optional().isInt(),
  query('guest_id').optional().isInt(),
  query('booking_id').optional().isInt(),
  query('min_rating').optional().isInt({ min: 1, max: 5 }),
  query('verified_stay').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const { status, homestay_id, guest_id, booking_id, min_rating, verified_stay } = req.query;

    const whereClause = {};

    if (status) whereClause.status = status;
    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (guest_id) whereClause.guest_id = guest_id;
    if (booking_id) whereClause.booking_id = booking_id;
    if (min_rating) whereClause.overall_rating = { [Op.gte]: min_rating };
    if (verified_stay !== undefined) whereClause.verified_stay = verified_stay === 'true';

    const reviews = await GuestReview.findAll({
      where: whereClause,
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: ['guest_id', 'first_name', 'last_name', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status', 'created_at']
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name', 'location']
        },
        {
          model: RoomInventory,
          as: 'room',
          attributes: ['inventory_id', 'room_number']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching guest reviews:', error);
    res.status(500).json({ message: 'Error fetching guest reviews', error: error.message });
  }
});

// GET /api/guest-reviews/:review_id - Get specific review
router.get('/:review_id', [
  param('review_id').isInt()
], validate, async (req, res) => {
  try {
    const { review_id } = req.params;

    const review = await GuestReview.findByPk(review_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: ['guest_id', 'first_name', 'last_name', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status', 'created_at']
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name', 'location']
        },
        {
          model: RoomInventory,
          as: 'room',
          attributes: ['inventory_id', 'room_number']
        }
      ]
    });

    if (!review) {
      return res.status(404).json({ message: 'Guest review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching guest review:', error);
    res.status(500).json({ message: 'Error fetching guest review', error: error.message });
  }
});

// POST /api/guest-reviews - Create new review
router.post('/', [
  body('booking_id').isInt().withMessage('Booking ID is required'),
  body('guest_id').optional().isInt(),
  body('homestay_id').isInt().withMessage('Homestay ID is required'),
  body('inventory_id').optional().isInt(),
  body('overall_rating').isInt({ min: 1, max: 5 }).withMessage('Overall rating (1-5) is required'),
  body('cleanliness_rating').optional().isInt({ min: 1, max: 5 }),
  body('service_rating').optional().isInt({ min: 1, max: 5 }),
  body('location_rating').optional().isInt({ min: 1, max: 5 }),
  body('value_rating').optional().isInt({ min: 1, max: 5 }),
  body('amenities_rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().isString(),
  body('review_text').optional().isString(),
  body('pros').optional().isString(),
  body('cons').optional().isString(),
  body('would_recommend').optional().isBoolean(),
  body('stay_type').optional().isIn(['business', 'leisure', 'family', 'couple', 'solo', 'group'])
], validate, async (req, res) => {
  try {
    const reviewData = req.body;

    // Verify booking exists
    const booking = await Booking.findByPk(reviewData.booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify homestay exists
    const homestay = await Homestay.findByPk(reviewData.homestay_id);
    if (!homestay) {
      return res.status(404).json({ message: 'Homestay not found' });
    }

    const review = await GuestReview.create(reviewData);

    // Fetch the created review with associations
    const createdReview = await GuestReview.findByPk(review.review_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: ['guest_id', 'first_name', 'last_name', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status', 'created_at']
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name', 'location']
        }
      ]
    });

    res.status(201).json({
      message: 'Guest review created successfully',
      review: createdReview
    });
  } catch (error) {
    console.error('Error creating guest review:', error);
    res.status(500).json({ message: 'Error creating guest review', error: error.message });
  }
});

// PUT /api/guest-reviews/:review_id - Update review
router.put('/:review_id', [
  param('review_id').isInt(),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'flagged']),
  body('vendor_response').optional().isString()
], validate, async (req, res) => {
  try {
    const { review_id } = req.params;
    const updateData = req.body;

    const review = await GuestReview.findByPk(review_id);

    if (!review) {
      return res.status(404).json({ message: 'Guest review not found' });
    }

    // If vendor is responding, set responded_at timestamp
    if (updateData.vendor_response && !review.vendor_response) {
      updateData.vendor_responded_at = new Date();
    }

    await review.update(updateData);

    // Fetch updated review with associations
    const updatedReview = await GuestReview.findByPk(review_id, {
      include: [
        {
          model: GuestProfile,
          as: 'guest',
          attributes: ['guest_id', 'first_name', 'last_name', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['booking_id', 'booking_reference', 'status', 'created_at']
        },
        {
          model: Homestay,
          as: 'homestay',
          attributes: ['homestay_id', 'name', 'location']
        }
      ]
    });

    res.json({
      message: 'Guest review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating guest review:', error);
    res.status(500).json({ message: 'Error updating guest review', error: error.message });
  }
});

// PATCH /api/guest-reviews/:review_id/helpful - Mark review as helpful
router.patch('/:review_id/helpful', [
  param('review_id').isInt(),
  body('helpful').isBoolean().withMessage('Helpful flag is required')
], validate, async (req, res) => {
  try {
    const { review_id } = req.params;
    const { helpful } = req.body;

    const review = await GuestReview.findByPk(review_id);

    if (!review) {
      return res.status(404).json({ message: 'Guest review not found' });
    }

    if (helpful) {
      await review.increment('helpful_count');
    } else {
      await review.increment('not_helpful_count');
    }

    await review.reload();

    res.json({
      message: 'Review feedback recorded',
      review
    });
  } catch (error) {
    console.error('Error updating review feedback:', error);
    res.status(500).json({ message: 'Error updating review feedback', error: error.message });
  }
});

// DELETE /api/guest-reviews/:review_id - Delete review
router.delete('/:review_id', [
  param('review_id').isInt()
], validate, async (req, res) => {
  try {
    const { review_id } = req.params;

    const review = await GuestReview.findByPk(review_id);

    if (!review) {
      return res.status(404).json({ message: 'Guest review not found' });
    }

    await review.destroy();

    res.json({
      message: 'Guest review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting guest review:', error);
    res.status(500).json({ message: 'Error deleting guest review', error: error.message });
  }
});

// GET /api/guest-reviews/summary/statistics - Get review statistics
router.get('/summary/statistics', async (req, res) => {
  try {
    const { homestay_id } = req.query;
    
    const whereClause = {};
    if (homestay_id) whereClause.homestay_id = homestay_id;

    const totalReviews = await GuestReview.count({ where: whereClause });
    const pendingReviews = await GuestReview.count({ where: { ...whereClause, status: 'pending' } });
    const approvedReviews = await GuestReview.count({ where: { ...whereClause, status: 'approved' } });
    
    // Average ratings
    const avgRatings = await GuestReview.findOne({
      where: { ...whereClause, status: 'approved' },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('overall_rating')), 'avg_overall'],
        [require('sequelize').fn('AVG', require('sequelize').col('cleanliness_rating')), 'avg_cleanliness'],
        [require('sequelize').fn('AVG', require('sequelize').col('service_rating')), 'avg_service'],
        [require('sequelize').fn('AVG', require('sequelize').col('location_rating')), 'avg_location'],
        [require('sequelize').fn('AVG', require('sequelize').col('value_rating')), 'avg_value'],
        [require('sequelize').fn('AVG', require('sequelize').col('amenities_rating')), 'avg_amenities']
      ],
      raw: true
    });

    // Rating distribution
    const ratingDistribution = await GuestReview.findAll({
      where: { ...whereClause, status: 'approved' },
      attributes: [
        'overall_rating',
        [require('sequelize').fn('COUNT', require('sequelize').col('review_id')), 'count']
      ],
      group: ['overall_rating'],
      order: [['overall_rating', 'DESC']],
      raw: true
    });

    res.json({
      totalReviews,
      pendingReviews,
      approvedReviews,
      averageRatings: avgRatings,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ message: 'Error fetching review statistics', error: error.message });
  }
});

module.exports = router;