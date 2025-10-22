const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { sequelize } = require('../../config/database');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/users - List users (with optional role filter and search)
router.get('/', [
  query('role').optional().isIn(['admin', 'vendor', 'client', 'staff', 'customer']),
  query('is_active').optional().isBoolean(),
  query('search').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate, async (req, res) => {
  try {
    const { role, is_active, search, limit } = req.query;

    let sql = `
      SELECT user_id, name, email, role, phone, is_active, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    // Add role filter
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    // Add is_active filter (default to active users only)
    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    } else {
      sql += ' AND is_active = 1';
    }

    // Add search functionality
    if (search && search.length >= 2) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Add ordering
    sql += ' ORDER BY name ASC';

    // Add limit if specified
    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const users = await sequelize.query(sql, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET /api/users/:user_id - Get specific user
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const users = await sequelize.query(
      `SELECT user_id, name, email, role, phone, address, gender, is_active,
              email_verified, phone_verified, created_at, updated_at
       FROM users
       WHERE user_id = ?`,
      {
        replacements: [user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Error fetching user', 
      error: error.message 
    });
  }
});

module.exports = router;
