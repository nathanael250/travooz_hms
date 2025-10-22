const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const HMSUser = require('../models/hmsUser.model');
const { Op } = require('sequelize');

class AuthService {
  // Generate JWT token
  generateToken(user, userType = 'regular') {
    const payload = {
      id: user.user_id || user.hms_user_id,
      email: user.email,
      role: user.role,
      userType: userType // 'regular' or 'hms'
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  // Generate refresh token
  generateRefreshToken(user, userType = 'regular') {
    return jwt.sign(
      { 
        id: user.user_id || user.hms_user_id,
        userType: userType
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  async register(userData) {
    const { email, password, name, role, phone, address, gender } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      name,
      role: role || 'client',
      phone,
      address,
      gender,
      is_active: true
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return {
      user: userResponse,
      token: this.generateToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }

  // Login user (hybrid - check both regular users and HMS users)
  async login(email, password) {
    let user = null;
    let userType = 'regular';

    // First, try to find in regular users table
    user = await User.findOne({
      where: { email }
    });

    if (user) {
      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account is deactivated. Please contact administrator');
      }

      // Compare password
      const isPasswordValid = await this.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await user.update({
        last_login: new Date()
      });

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password_hash;
      userResponse.userType = userType; // Add userType to response

      return {
        user: userResponse,
        token: this.generateToken(user, userType),
        refreshToken: this.generateRefreshToken(user, userType)
      };
    }

    // If not found in regular users, try HMS users table
    user = await HMSUser.findOne({
      where: { email }
    });

    if (user) {
      userType = 'hms';

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error('Account is deactivated. Please contact administrator');
      }

      // Compare password
      const isPasswordValid = await this.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password_hash;
      userResponse.userType = userType; // Add userType to response

      return {
        user: userResponse,
        token: this.generateToken(user, userType),
        refreshToken: this.generateRefreshToken(user, userType)
      };
    }

    // User not found in either table
    throw new Error('Invalid email or password');
  }

  // Get user profile (supports both regular and HMS users)
  async getProfile(userId, userType = 'regular') {
    let user = null;

    if (userType === 'hms') {
      user = await HMSUser.findByPk(userId, {
        attributes: { exclude: ['password_hash'] }
      });
    } else {
      user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] }
      });
    }

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const { password, ...otherData } = updateData;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If password is being updated, hash it
    if (password) {
      otherData.password_hash = await this.hashPassword(password);
    }

    await user.update(otherData);

    // Return updated user without password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    return updatedUser;
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );

      let user = null;
      const userType = decoded.userType || 'regular';

      if (userType === 'hms') {
        user = await HMSUser.findByPk(decoded.id);
        if (!user || user.status !== 'active') {
          throw new Error('Invalid refresh token');
        }
      } else {
        user = await User.findByPk(decoded.id);
        if (!user || !user.is_active) {
          throw new Error('Invalid refresh token');
        }
      }

      return {
        token: this.generateToken(user, userType),
        refreshToken: this.generateRefreshToken(user, userType)
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Verify token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userType = decoded.userType || 'regular';
      let user = null;

      if (userType === 'hms') {
        user = await HMSUser.findByPk(decoded.id, {
          attributes: { exclude: ['password_hash'] }
        });
        if (!user || user.status !== 'active') {
          throw new Error('Invalid token');
        }
      } else {
        user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password_hash'] }
        });
        if (!user || !user.is_active) {
          throw new Error('Invalid token');
        }
      }

      return { decoded, user };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password and update
    const hashedNewPassword = await this.hashPassword(newPassword);
    await user.update({ password_hash: hashedNewPassword });

    return { message: 'Password changed successfully' };
  }

  // Logout user (for session management if needed)
  async logout(userId) {
    // Update last logout time
    await User.update(
      { last_logout: new Date() },
      { where: { user_id: userId } }
    );

    return { message: 'Logged out successfully' };
  }
}

module.exports = new AuthService();