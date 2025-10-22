const rateLimit = require('express-rate-limit');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // More lenient in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDevelopment && req.ip === '::1' || req.ip === '127.0.0.1', // Skip localhost in dev
});

// Strict limiter for authentication endpoints (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // More lenient in development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// API limiter for general API calls
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 2000 : 200, // Much more lenient in development
  message: {
    success: false,
    message: 'Too many API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1')) {
      return true;
    }
    return false;
  },
});

// Very lenient limiter for profile/user info endpoints
const profileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDevelopment ? 1000 : 100, // Very high limit
  message: {
    success: false,
    message: 'Too many profile requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDevelopment, // Skip entirely in development
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  profileLimiter
};