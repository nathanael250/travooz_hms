const Homestay = require('../models/homestay.model');

/**
 * Hotel Access Middleware
 *
 * This middleware ensures that both HMS users (receptionists, staff) and regular users (vendors/hotel managers)
 * have access to hotel-specific endpoints by populating the assigned_hotel_id.
 *
 * For HMS users: assigned_hotel_id is already present
 * For vendors: Fetches their owned hotels and assigns the first one (or specific one if hotel_id param exists)
 * For admins: Grants access to all hotels (can be filtered by hotel_id param)
 */
const hotelAccessMiddleware = async (req, res, next) => {
  try {
    const user = req.user;
    const userType = req.userType || 'regular';

    // If HMS user, they already have assigned_hotel_id
    if (userType === 'hms') {
      if (!user.assigned_hotel_id) {
        return res.status(403).json({
          success: false,
          message: 'HMS user is not associated with any hotel. Please contact administrator.'
        });
      }
      // HMS users can only access their assigned hotel
      req.hotelId = user.assigned_hotel_id;
      req.canAccessAllHotels = false;
      return next();
    }

    // For regular users (vendors, admins, clients)
    if (user.role === 'admin') {
      // Admins can access all hotels
      // If a specific hotel_id is provided in query/params, use it
      const hotelId = req.query.hotel_id || req.params.hotel_id || req.body.hotel_id;
      req.hotelId = hotelId ? parseInt(hotelId) : null;
      req.canAccessAllHotels = true;
      return next();
    }

    if (user.role === 'vendor') {
      // Vendors can access their own hotels
      const hotelId = req.query.hotel_id || req.params.hotel_id || req.body.hotel_id;

      if (hotelId) {
        // Verify the vendor owns this hotel
        const hotel = await Homestay.findOne({
          where: {
            homestay_id: hotelId,
            vendor_id: user.user_id
          }
        });

        if (!hotel) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to this hotel.'
          });
        }

        req.hotelId = parseInt(hotelId);
        req.canAccessAllHotels = false;
        // Also set assigned_hotel_id for backward compatibility with existing controller code
        user.assigned_hotel_id = parseInt(hotelId);
        return next();
      }

      // If no specific hotel_id is provided, get the vendor's first hotel
      const hotels = await Homestay.findAll({
        where: { vendor_id: user.user_id },
        attributes: ['homestay_id', 'name'],
        order: [['created_at', 'ASC']]
      });

      if (!hotels || hotels.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You are not associated with any hotel. Please add a hotel first.'
        });
      }

      // Use the first hotel by default
      req.hotelId = hotels[0].homestay_id;
      req.canAccessAllHotels = false;
      req.vendorHotels = hotels; // Pass all hotels for potential UI dropdown
      // Also set assigned_hotel_id for backward compatibility
      user.assigned_hotel_id = hotels[0].homestay_id;
      return next();
    }

    // Clients don't have access to hotel management endpoints
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.'
    });

  } catch (error) {
    console.error('Hotel Access Middleware - Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking hotel access',
      error: error.message
    });
  }
};

module.exports = hotelAccessMiddleware;
