const hotelService = require('../services/hotel.service');
const { sendResponse, sendError } = require('../utils/response.utils');

class HotelController {
  // Create new hotel
  async createHotel(req, res) {
    try {
      const hotel = await hotelService.createHotel(req.body);
      return sendResponse(res, 201, 'Hotel created successfully', { hotel });
    } catch (error) {
      console.error('Create hotel error:', error);
      return sendError(res, 400, error.message);
    }
  }

  // Get all hotels with filters
  async getHotels(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        city: req.query.city,
        state: req.query.state,
        country: req.query.country,
        is_active: req.query.is_active
      };

      const result = await hotelService.getHotels(filters);
      return sendResponse(res, 200, 'Hotels retrieved successfully', result);
    } catch (error) {
      console.error('Get hotels error:', error);
      return sendError(res, 500, error.message);
    }
  }

  // Get hotel by ID
  async getHotelById(req, res) {
    try {
      const { id } = req.params;
      const hotel = await hotelService.getHotelById(id);
      return sendResponse(res, 200, 'Hotel retrieved successfully', { hotel });
    } catch (error) {
      console.error('Get hotel by ID error:', error);
      return sendError(res, 404, error.message);
    }
  }

  // Update hotel
  async updateHotel(req, res) {
    try {
      const { id } = req.params;
      const hotel = await hotelService.updateHotel(id, req.body);
      return sendResponse(res, 200, 'Hotel updated successfully', { hotel });
    } catch (error) {
      console.error('Update hotel error:', error);
      return sendError(res, 400, error.message);
    }
  }

  // Delete hotel (soft delete)
  async deleteHotel(req, res) {
    try {
      const { id } = req.params;
      const result = await hotelService.deleteHotel(id);
      return sendResponse(res, 200, result.message);
    } catch (error) {
      console.error('Delete hotel error:', error);
      return sendError(res, 400, error.message);
    }
  }

  // Get hotel statistics
  async getHotelStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await hotelService.getHotelStats(id);
      return sendResponse(res, 200, 'Hotel statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Get hotel stats error:', error);
      return sendError(res, 404, error.message);
    }
  }

  // Get hotels for dropdown/select
  async getHotelsForSelect(req, res) {
    try {
      const hotels = await hotelService.getHotelsForSelect();
      return sendResponse(res, 200, 'Hotels for select retrieved successfully', { hotels });
    } catch (error) {
      console.error('Get hotels for select error:', error);
      return sendError(res, 500, error.message);
    }
  }

  // Update hotel amenities
  async updateHotelAmenities(req, res) {
    try {
      const { id } = req.params;
      const { amenities } = req.body;
      
      if (!Array.isArray(amenities)) {
        return sendError(res, 400, 'Amenities must be an array');
      }

      const hotel = await hotelService.updateHotelAmenities(id, amenities);
      return sendResponse(res, 200, 'Hotel amenities updated successfully', { hotel });
    } catch (error) {
      console.error('Update hotel amenities error:', error);
      return sendError(res, 400, error.message);
    }
  }

  // Update hotel policies
  async updateHotelPolicies(req, res) {
    try {
      const { id } = req.params;
      const { policies } = req.body;
      
      if (typeof policies !== 'object' || policies === null) {
        return sendError(res, 400, 'Policies must be an object');
      }

      const hotel = await hotelService.updateHotelPolicies(id, policies);
      return sendResponse(res, 200, 'Hotel policies updated successfully', { hotel });
    } catch (error) {
      console.error('Update hotel policies error:', error);
      return sendError(res, 400, error.message);
    }
  }

  // Get my hotel (for hotel managers and staff)
  async getMyHotel(req, res) {
    try {
      if (!req.user.hotel_id) {
        return sendError(res, 400, 'User is not assigned to any hotel');
      }

      const hotel = await hotelService.getHotelById(req.user.hotel_id);
      return sendResponse(res, 200, 'Hotel retrieved successfully', { hotel });
    } catch (error) {
      console.error('Get my hotel error:', error);
      return sendError(res, 404, error.message);
    }
  }

  // Get my hotel stats (for hotel managers and staff)
  async getMyHotelStats(req, res) {
    try {
      if (!req.user.hotel_id) {
        return sendError(res, 400, 'User is not assigned to any hotel');
      }

      const stats = await hotelService.getHotelStats(req.user.hotel_id);
      return sendResponse(res, 200, 'Hotel statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Get my hotel stats error:', error);
      return sendError(res, 404, error.message);
    }
  }
}

module.exports = new HotelController();