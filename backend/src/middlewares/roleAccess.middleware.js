/**
 * Role-Based Access Control Middleware
 * Restricts access to routes based on user role
 */

/**
 * Restrict access to specific roles
 * @param {string|array} allowedRoles - Single role or array of allowed roles
 * @returns {function} Middleware function
 */
const restrictToRoles = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Get role from both HMS and regular users
      const userRole = req.user.role || req.user.user_role;
      
      if (!roles.includes(userRole)) {
        console.log(`Role Access Denied - User role: ${userRole}, allowed roles: ${roles.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: `Access denied. Allowed roles: ${roles.join(', ')}. Your role: ${userRole}`
        });
      }

      console.log(`Role Access Granted - User role: ${userRole}`);
      next();
    } catch (error) {
      console.error('Role Access Middleware - Error:', error.message);
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
        error: error.message
      });
    }
  };
};

module.exports = {
  restrictToRoles
};