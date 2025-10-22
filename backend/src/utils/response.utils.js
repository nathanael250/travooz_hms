// Standard API response format
const successResponse = (res, statusCode = 200, message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

// Error response format
const errorResponse = (res, statusCode = 500, message, error = null) => {
  const response = {
    success: false,
    message
  };
  
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }
  
  return res.status(statusCode).json(response);
};

// Validation error response
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};

// Not found response
const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`
  });
};

// Unauthorized response
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message
  });
};

// Forbidden response
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

// Pagination helper
const getPaginationData = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  getPaginationData,
  // Aliases for controller compatibility
  sendResponse: successResponse,
  sendError: errorResponse
};