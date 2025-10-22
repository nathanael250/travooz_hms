const authService = require('../services/auth.service');
const { sendResponse, sendError } = require('../utils/response.utils');
const { validateRegister, validateLogin } = require('../utils/validation.utils');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      // Validate input
      const { error } = validateRegister(req.body);
      if (error) {
        return sendError(res, 400, error.details[0].message);
      }

      const result = await authService.register(req.body);
      
      return sendResponse(res, 201, 'User registered successfully', result);
    } catch (error) {
      console.error('Register error:', error);
      return sendError(res, 400, error.message);
    }
  }

  // Login user
  async login(req, res) {
    try {
      // Validate input
      const { error } = validateLogin(req.body);
      if (error) {
        return sendError(res, 400, error.details[0].message);
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendResponse(res, 200, 'Login successful', {
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Login error:', error);
      return sendError(res, 401, error.message);
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      console.log('Get Profile - req.user:', req.user);
      const userId = req.user.user_id || req.user.hms_user_id || req.user.id;
      const userType = req.userType || 'regular';
      console.log('Get Profile - Using user ID:', userId, 'userType:', userType);
      const user = await authService.getProfile(userId, userType);
      return sendResponse(res, 200, 'Profile retrieved successfully', { user });
    } catch (error) {
      console.error('Get profile error:', error);
      return sendError(res, 404, error.message);
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      const updatedUser = await authService.updateProfile(userId, req.body);
      return sendResponse(res, 200, 'Profile updated successfully', { user: updatedUser });
    } catch (error) {
      console.error('Update profile error:', error);
      return sendError(res, 400, error.message);
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return sendError(res, 401, 'Refresh token not provided');
      }

      const result = await authService.refreshToken(refreshToken);

      // Set new refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendResponse(res, 200, 'Token refreshed successfully', {
        token: result.token
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      return sendError(res, 401, error.message);
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendError(res, 400, 'Current password and new password are required');
      }

      if (newPassword.length < 6) {
        return sendError(res, 400, 'New password must be at least 6 characters long');
      }

      const userId = req.user.user_id || req.user.id;
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      return sendResponse(res, 200, result.message);
    } catch (error) {
      console.error('Change password error:', error);
      return sendError(res, 400, error.message);
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const userId = req.user.user_id || req.user.id;
      await authService.logout(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return sendResponse(res, 200, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      return sendError(res, 500, 'Error during logout');
    }
  }

  // Verify token (for middleware or client-side verification)
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return sendError(res, 401, 'Token not provided');
      }

      const result = await authService.verifyToken(token);
      return sendResponse(res, 200, 'Token is valid', { user: result.user });
    } catch (error) {
      console.error('Verify token error:', error);
      return sendError(res, 401, error.message);
    }
  }

  // Get current user with minimal info (for header/navbar)
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.user_id || req.user.hms_user_id || req.user.id;
      const userType = req.userType || 'regular';
      const user = await authService.getProfile(userId, userType);

      // Return minimal user info for UI
      const minimalUser = {
        user_id: user.user_id || user.hms_user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        userType: userType,
        assigned_hotel_id: user.assigned_hotel_id // For HMS users
      };

      return sendResponse(res, 200, 'User info retrieved', { user: minimalUser });
    } catch (error) {
      console.error('Get current user error:', error);
      return sendError(res, 404, error.message);
    }
  }
}

module.exports = new AuthController();