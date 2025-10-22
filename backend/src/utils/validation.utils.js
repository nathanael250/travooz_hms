const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .withMessage('Valid email is required')
  .normalizeEmail();

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

const phoneValidation = body('phone')
  .optional()
  .isMobilePhone()
  .withMessage('Valid phone number required');

const idValidation = param('id')
  .isInt({ min: 1 })
  .withMessage('Valid ID is required');

const dateValidation = (field) => 
  body(field)
    .isISO8601()
    .withMessage(`Valid ${field} is required`)
    .toDate();

const priceValidation = (field) =>
  body(field)
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a positive number`);

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt()
];

// Hotel validation rules
const hotelValidationRules = [
  body('name').notEmpty().withMessage('Hotel name is required').trim(),
  body('address').notEmpty().withMessage('Address is required').trim(),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('country').notEmpty().withMessage('Country is required').trim(),
  body('starRating').optional().isInt({ min: 1, max: 5 }).withMessage('Star rating must be between 1 and 5'),
  emailValidation.optional(),
  phoneValidation
];

// Room validation rules
const roomValidationRules = [
  body('roomNumber').notEmpty().withMessage('Room number is required').trim(),
  body('roomType').isIn(['Single', 'Double', 'Twin', 'Suite', 'Deluxe', 'Executive', 'Presidential']).withMessage('Valid room type required'),
  body('hotelId').isInt().withMessage('Hotel ID is required'),
  priceValidation('basePrice'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('floor').optional().isInt().withMessage('Floor must be a number')
];

// Guest validation rules
const guestValidationRules = [
  body('firstName').notEmpty().withMessage('First name is required').trim(),
  body('lastName').notEmpty().withMessage('Last name is required').trim(),
  emailValidation.optional(),
  phoneValidation,
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required').toDate()
];

// Booking validation rules
const bookingValidationRules = [
  dateValidation('checkInDate'),
  dateValidation('checkOutDate'),
  body('roomId').isInt().withMessage('Room ID is required'),
  body('guestId').isInt().withMessage('Guest ID is required'),
  body('hotelId').isInt().withMessage('Hotel ID is required'),
  body('numberOfGuests').optional().isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
  priceValidation('roomRate'),
  priceValidation('totalAmount')
];

// User validation rules
const userValidationRules = [
  body('firstName').notEmpty().withMessage('First name is required').trim(),
  body('lastName').notEmpty().withMessage('Last name is required').trim(),
  emailValidation,
  passwordValidation,
  phoneValidation,
  body('role').optional().isIn(['super_admin', 'admin', 'hotel_manager', 'front_desk', 'housekeeping', 'staff']).withMessage('Valid role required')
];

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

// Specific validation schemas
const validateLogin = (data) => {
  const Joi = require('joi');
  
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Valid email is required',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  });

  return schema.validate(data);
};

const validateRegister = (data) => {
  const Joi = require('joi');
  
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
    last_name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Valid email is required',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().optional(),
    role: Joi.string().valid('super_admin', 'admin', 'hotel_manager', 'front_desk', 'housekeeping', 'staff').optional(),
    hotel_id: Joi.number().optional()
  });

  return schema.validate(data);
};

module.exports = {
  emailValidation,
  passwordValidation,
  phoneValidation,
  idValidation,
  dateValidation,
  priceValidation,
  paginationValidation,
  hotelValidationRules,
  roomValidationRules,
  guestValidationRules,
  bookingValidationRules,
  userValidationRules,
  validate,
  validateLogin,
  validateRegister
};