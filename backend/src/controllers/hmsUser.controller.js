const { sequelize } = require('../../config/database');
const bcrypt = require('bcryptjs');
const HMSUser = require('../models/hmsUser.model');

// Create new HMS User
exports.createHMSUser = async (req, res) => {
  try {
    const { name, email, password, role, assigned_hotel_id, status, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !assigned_hotel_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, password, role, assigned_hotel_id' 
      });
    }

    // Check if email already exists
    const existingUser = await HMSUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const hmsUser = await HMSUser.create({
      name,
      email,
      password_hash,
      role,
      assigned_hotel_id,
      phone: phone || null,
      status: status || 'active'
    });

    res.status(201).json({
      message: 'HMS User created successfully',
      data: {
        hms_user_id: hmsUser.hms_user_id,
        name: hmsUser.name,
        email: hmsUser.email,
        role: hmsUser.role,
        assigned_hotel_id: hmsUser.assigned_hotel_id,
        status: hmsUser.status
      }
    });
  } catch (error) {
    console.error('Error creating HMS user:', error);
    res.status(500).json({ 
      message: 'Error creating HMS user', 
      error: error.message 
    });
  }
};

// Get all HMS Users for a hotel
exports.getHMSUsers = async (req, res) => {
  try {
    const { assigned_hotel_id, role, status, search, limit = 50, offset = 0 } = req.query;

    let whereClause = {};

    if (assigned_hotel_id) {
      whereClause.assigned_hotel_id = assigned_hotel_id;
    }

    if (role) {
      whereClause.role = role;
    }

    if (status) {
      whereClause.status = status;
    }

    let sql = `
      SELECT hms_user_id, name, email, role, assigned_hotel_id, phone, status, created_at, updated_at
      FROM hms_users
      WHERE 1=1
    `;

    const params = [];

    if (assigned_hotel_id) {
      sql += ' AND assigned_hotel_id = ?';
      params.push(assigned_hotel_id);
    }

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await sequelize.query(sql, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM hms_users WHERE 1=1';
    const countParams = [];

    if (assigned_hotel_id) {
      countSql += ' AND assigned_hotel_id = ?';
      countParams.push(assigned_hotel_id);
    }

    if (role) {
      countSql += ' AND role = ?';
      countParams.push(role);
    }

    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    if (search) {
      countSql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    const [{ total }] = await sequelize.query(countSql, {
      replacements: countParams,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      data: users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching HMS users:', error);
    res.status(500).json({ 
      message: 'Error fetching HMS users', 
      error: error.message 
    });
  }
};

// Get single HMS User
exports.getHMSUserById = async (req, res) => {
  try {
    const { hms_user_id } = req.params;

    const user = await HMSUser.findOne({
      where: { hms_user_id },
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'HMS User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching HMS user:', error);
    res.status(500).json({ 
      message: 'Error fetching HMS user', 
      error: error.message 
    });
  }
};

// Update HMS User
exports.updateHMSUser = async (req, res) => {
  try {
    const { hms_user_id } = req.params;
    const { name, email, role, status, phone, assigned_hotel_id } = req.body;

    const user = await HMSUser.findOne({ where: { hms_user_id } });

    if (!user) {
      return res.status(404).json({ message: 'HMS User not found' });
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== user.email) {
      const existingUser = await HMSUser.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (phone !== undefined) user.phone = phone;
    if (assigned_hotel_id) user.assigned_hotel_id = assigned_hotel_id; // ✅ FIX: Allow updating assigned_hotel_id

    await user.save();

    res.json({
      message: 'HMS User updated successfully',
      data: {
        hms_user_id: user.hms_user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        assigned_hotel_id: user.assigned_hotel_id, // ✅ Include in response
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error updating HMS user:', error);
    res.status(500).json({ 
      message: 'Error updating HMS user', 
      error: error.message 
    });
  }
};

// Change password for HMS User
exports.changeHMSUserPassword = async (req, res) => {
  try {
    const { hms_user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const user = await HMSUser.findOne({ where: { hms_user_id } });

    if (!user) {
      return res.status(404).json({ message: 'HMS User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);

    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      message: 'Error changing password', 
      error: error.message 
    });
  }
};

// Deactivate HMS User
exports.deactivateHMSUser = async (req, res) => {
  try {
    const { hms_user_id } = req.params;

    const user = await HMSUser.findOne({ where: { hms_user_id } });

    if (!user) {
      return res.status(404).json({ message: 'HMS User not found' });
    }

    user.status = 'inactive';
    await user.save();

    res.json({ message: 'HMS User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating HMS user:', error);
    res.status(500).json({ 
      message: 'Error deactivating HMS user', 
      error: error.message 
    });
  }
};

// Delete HMS User
exports.deleteHMSUser = async (req, res) => {
  try {
    const { hms_user_id } = req.params;

    const user = await HMSUser.findOne({ where: { hms_user_id } });

    if (!user) {
      return res.status(404).json({ message: 'HMS User not found' });
    }

    await user.destroy();

    res.json({ message: 'HMS User deleted successfully' });
  } catch (error) {
    console.error('Error deleting HMS user:', error);
    res.status(500).json({ 
      message: 'Error deleting HMS user', 
      error: error.message 
    });
  }
};

// ✅ NEW: Diagnose users with missing assigned_hotel_id
exports.diagnoseMissingHotelAssignment = async (req, res) => {
  try {
    const sql = `
      SELECT hms_user_id, name, email, role, assigned_hotel_id, status, created_at
      FROM hms_users
      WHERE assigned_hotel_id IS NULL OR assigned_hotel_id = 0
      ORDER BY created_at DESC
    `;

    const usersWithMissingHotel = await sequelize.query(sql, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      message: 'HMS Users with missing hotel assignment',
      count: usersWithMissingHotel.length,
      data: usersWithMissingHotel
    });
  } catch (error) {
    console.error('Error diagnosing HMS users:', error);
    res.status(500).json({ 
      message: 'Error diagnosing HMS users', 
      error: error.message 
    });
  }
};

// ✅ NEW: Bulk assign hotel to users by role
exports.bulkAssignHotel = async (req, res) => {
  try {
    const { hotel_id, role } = req.body;

    if (!hotel_id) {
      return res.status(400).json({ message: 'hotel_id is required' });
    }

    let whereClause = 'assigned_hotel_id IS NULL OR assigned_hotel_id = 0';
    const params = [hotel_id];

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const sql = `
      UPDATE hms_users
      SET assigned_hotel_id = ?
      WHERE ${whereClause}
    `;

    const result = await sequelize.query(sql, {
      replacements: params,
      type: sequelize.QueryTypes.UPDATE
    });

    const affectedRows = result[1]; // Sequelize returns [rows, count]

    res.json({
      message: `Successfully assigned hotel ${hotel_id} to ${affectedRows} users`,
      affectedRows: affectedRows,
      hotelId: hotel_id,
      role: role || 'all roles'
    });
  } catch (error) {
    console.error('Error bulk assigning hotel:', error);
    res.status(500).json({ 
      message: 'Error bulk assigning hotel', 
      error: error.message 
    });
  }
};