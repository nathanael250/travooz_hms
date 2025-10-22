const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { sequelize } = require('../../config/database');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/user-favorites - List all favorites for a guest
router.get('/', [
  query('guest_id').isInt().withMessage('Guest ID is required'),
  query('favorite_type').optional().isIn(['homestay', 'room', 'menu_item', 'service', 'activity'])
], validate, async (req, res) => {
  try {
    const { guest_id, favorite_type } = req.query;

    let whereClause = { guest_id };
    if (favorite_type) whereClause.favorite_type = favorite_type;

    const [favorites] = await sequelize.query(`
      SELECT 
        uf.*,
        CASE 
          WHEN uf.favorite_type = 'homestay' THEN h.name
          WHEN uf.favorite_type = 'room' THEN CONCAT('Room ', ri.room_number)
          ELSE NULL
        END as item_name,
        CASE 
          WHEN uf.favorite_type = 'homestay' THEN h.location
          WHEN uf.favorite_type = 'room' THEN h2.name
          ELSE NULL
        END as item_details
      FROM user_favorites uf
      LEFT JOIN homestays h ON uf.favorite_type = 'homestay' AND uf.reference_id = h.homestay_id
      LEFT JOIN room_inventory ri ON uf.favorite_type = 'room' AND uf.reference_id = ri.inventory_id
      LEFT JOIN homestays h2 ON ri.homestay_id = h2.homestay_id
      WHERE uf.guest_id = :guest_id
      ${favorite_type ? 'AND uf.favorite_type = :favorite_type' : ''}
      ORDER BY uf.created_at DESC
    `, {
      replacements: { guest_id, favorite_type },
      type: sequelize.QueryTypes.SELECT
    });

    res.json(favorites);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ message: 'Error fetching user favorites', error: error.message });
  }
});

// GET /api/user-favorites/:favorite_id - Get specific favorite
router.get('/:favorite_id', [
  param('favorite_id').isInt()
], validate, async (req, res) => {
  try {
    const { favorite_id } = req.params;

    const [favorites] = await sequelize.query(`
      SELECT 
        uf.*,
        CASE 
          WHEN uf.favorite_type = 'homestay' THEN h.name
          WHEN uf.favorite_type = 'room' THEN CONCAT('Room ', ri.room_number)
          ELSE NULL
        END as item_name,
        CASE 
          WHEN uf.favorite_type = 'homestay' THEN h.location
          WHEN uf.favorite_type = 'room' THEN h2.name
          ELSE NULL
        END as item_details
      FROM user_favorites uf
      LEFT JOIN homestays h ON uf.favorite_type = 'homestay' AND uf.reference_id = h.homestay_id
      LEFT JOIN room_inventory ri ON uf.favorite_type = 'room' AND uf.reference_id = ri.inventory_id
      LEFT JOIN homestays h2 ON ri.homestay_id = h2.homestay_id
      WHERE uf.favorite_id = :favorite_id
    `, {
      replacements: { favorite_id },
      type: sequelize.QueryTypes.SELECT
    });

    if (!favorites || favorites.length === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json(favorites[0]);
  } catch (error) {
    console.error('Error fetching favorite:', error);
    res.status(500).json({ message: 'Error fetching favorite', error: error.message });
  }
});

// POST /api/user-favorites - Add new favorite
router.post('/', [
  body('guest_id').isInt().withMessage('Guest ID is required'),
  body('favorite_type').isIn(['homestay', 'room', 'menu_item', 'service', 'activity']).withMessage('Valid favorite type is required'),
  body('reference_id').isInt().withMessage('Reference ID is required'),
  body('notes').optional().isString()
], validate, async (req, res) => {
  try {
    const { guest_id, favorite_type, reference_id, notes } = req.body;

    // Check if favorite already exists
    const [existing] = await sequelize.query(`
      SELECT * FROM user_favorites 
      WHERE guest_id = :guest_id 
      AND favorite_type = :favorite_type 
      AND reference_id = :reference_id
    `, {
      replacements: { guest_id, favorite_type, reference_id },
      type: sequelize.QueryTypes.SELECT
    });

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'This item is already in favorites' });
    }

    // Insert new favorite
    await sequelize.query(`
      INSERT INTO user_favorites (guest_id, favorite_type, reference_id, notes, created_at)
      VALUES (:guest_id, :favorite_type, :reference_id, :notes, NOW())
    `, {
      replacements: { guest_id, favorite_type, reference_id, notes: notes || null },
      type: sequelize.QueryTypes.INSERT
    });

    // Fetch the created favorite
    const [created] = await sequelize.query(`
      SELECT 
        uf.*,
        CASE 
          WHEN uf.favorite_type = 'homestay' THEN h.name
          WHEN uf.favorite_type = 'room' THEN CONCAT('Room ', ri.room_number)
          ELSE NULL
        END as item_name
      FROM user_favorites uf
      LEFT JOIN homestays h ON uf.favorite_type = 'homestay' AND uf.reference_id = h.homestay_id
      LEFT JOIN room_inventory ri ON uf.favorite_type = 'room' AND uf.reference_id = ri.inventory_id
      WHERE uf.guest_id = :guest_id 
      AND uf.favorite_type = :favorite_type 
      AND uf.reference_id = :reference_id
    `, {
      replacements: { guest_id, favorite_type, reference_id },
      type: sequelize.QueryTypes.SELECT
    });

    res.status(201).json({
      message: 'Favorite added successfully',
      favorite: created[0]
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Error adding favorite', error: error.message });
  }
});

// DELETE /api/user-favorites/:favorite_id - Remove favorite
router.delete('/:favorite_id', [
  param('favorite_id').isInt()
], validate, async (req, res) => {
  try {
    const { favorite_id } = req.params;

    const [result] = await sequelize.query(`
      DELETE FROM user_favorites WHERE favorite_id = :favorite_id
    `, {
      replacements: { favorite_id },
      type: sequelize.QueryTypes.DELETE
    });

    res.json({
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Error removing favorite', error: error.message });
  }
});

// DELETE /api/user-favorites/remove/by-reference - Remove favorite by guest and reference
router.delete('/remove/by-reference', [
  query('guest_id').isInt().withMessage('Guest ID is required'),
  query('favorite_type').isIn(['homestay', 'room', 'menu_item', 'service', 'activity']).withMessage('Valid favorite type is required'),
  query('reference_id').isInt().withMessage('Reference ID is required')
], validate, async (req, res) => {
  try {
    const { guest_id, favorite_type, reference_id } = req.query;

    await sequelize.query(`
      DELETE FROM user_favorites 
      WHERE guest_id = :guest_id 
      AND favorite_type = :favorite_type 
      AND reference_id = :reference_id
    `, {
      replacements: { guest_id, favorite_type, reference_id },
      type: sequelize.QueryTypes.DELETE
    });

    res.json({
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Error removing favorite', error: error.message });
  }
});

// GET /api/user-favorites/summary/statistics - Get favorites statistics
router.get('/summary/statistics', [
  query('guest_id').optional().isInt()
], validate, async (req, res) => {
  try {
    const { guest_id } = req.query;

    const whereClause = guest_id ? 'WHERE guest_id = :guest_id' : '';

    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_favorites,
        SUM(CASE WHEN favorite_type = 'homestay' THEN 1 ELSE 0 END) as homestay_favorites,
        SUM(CASE WHEN favorite_type = 'room' THEN 1 ELSE 0 END) as room_favorites,
        SUM(CASE WHEN favorite_type = 'menu_item' THEN 1 ELSE 0 END) as menu_favorites,
        SUM(CASE WHEN favorite_type = 'service' THEN 1 ELSE 0 END) as service_favorites,
        SUM(CASE WHEN favorite_type = 'activity' THEN 1 ELSE 0 END) as activity_favorites
      FROM user_favorites
      ${whereClause}
    `, {
      replacements: { guest_id },
      type: sequelize.QueryTypes.SELECT
    });

    res.json(stats[0] || {
      total_favorites: 0,
      homestay_favorites: 0,
      room_favorites: 0,
      menu_favorites: 0,
      service_favorites: 0,
      activity_favorites: 0
    });
  } catch (error) {
    console.error('Error fetching favorites statistics:', error);
    res.status(500).json({ message: 'Error fetching favorites statistics', error: error.message });
  }
});

module.exports = router;