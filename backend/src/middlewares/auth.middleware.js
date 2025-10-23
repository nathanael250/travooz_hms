const jwt = require('jsonwebtoken');
const { User } = require('../models');
const HMSUser = require('../models/hmsUser.model');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Request:', req.method, req.path);
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth Middleware - No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    console.log('Auth Middleware - Token received, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth Middleware - Token decoded, user ID:', decoded.id, 'userType:', decoded.userType);

    let user = null;
    const userType = decoded.userType || 'regular';

    // Check userType to determine which table to query
    if (userType === 'hms') {
      user = await HMSUser.findByPk(decoded.id);

      if (!user) {
        console.log('Auth Middleware - HMS User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }

      if (user.status !== 'active') {
        console.log('Auth Middleware - HMS User account is deactivated:', user.email);
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }
    } else {
      user = await User.findByPk(decoded.id);

      if (!user) {
        console.log('Auth Middleware - User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }

      if (!user.is_active) {
        console.log('Auth Middleware - User account is deactivated:', user.email);
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }
    }

    console.log('Auth Middleware - Authentication successful for user:', user.email, 'userType:', userType);
    req.user = user;
    req.userType = userType; // Add userType to request for downstream use
    next();
  } catch (error) {
    console.error('Auth Middleware - Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

/**
 * Admin-only middleware
 * Ensures user has admin role
 * Must be used after authMiddleware
 */
const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Check for admin role in both HMS and regular users
    const userRole = req.user.role || req.user.user_role;
    
    if (userRole !== 'admin') {
      console.log('Admin Middleware - Access denied. User role:', userRole);
      return res.status(403).json({
        success: false,
        message: `Access denied. Admin privileges required. Current role: ${userRole}`
      });
    }

    console.log('Admin Middleware - Access granted for admin user:', req.user.email);
    next();
  } catch (error) {
    console.error('Admin Middleware - Error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Access denied.',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
module.exports.authenticateToken = authMiddleware;