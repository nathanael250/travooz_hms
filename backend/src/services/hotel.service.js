const { Hotel, Room, User, Booking } = require('../models');
const { Op } = require('sequelize');

class HotelService {
  // Create new hotel
  async createHotel(hotelData) {
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      website,
      check_in_time,
      check_out_time,
      amenities,
      policies
    } = hotelData;

    // Check if hotel with same name exists
    const existingHotel = await Hotel.findOne({
      where: {
        name: { [Op.iLike]: name },
        city: { [Op.iLike]: city }
      }
    });

    if (existingHotel) {
      throw new Error('Hotel with this name already exists in this city');
    }

    const hotel = await Hotel.create({
      name,
      description,
      address,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      website,
      check_in_time: check_in_time || '15:00',
      check_out_time: check_out_time || '11:00',
      amenities: amenities || [],
      policies: policies || {},
      isActive: true
    });

    return hotel;
  }

  // Get all hotels with optional filters
  async getHotels(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      state,
      country,
      isActive
    } = filters;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (city) where.city = { [Op.iLike]: city };
    if (state) where.state = { [Op.iLike]: state };
    if (country) where.country = { [Op.iLike]: country };
    if (isActive !== undefined) where.isActive = isActive;

    const { count, rows } = await Hotel.findAndCountAll({
      where,
      include: [
        {
          model: Room,
          as: 'rooms',
          attributes: ['id', 'room_number', 'type', 'status'],
          required: false
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'first_name', 'last_name', 'role'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      hotels: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Get hotel by ID
  async getHotelById(hotelId) {
    const hotel = await Hotel.findByPk(hotelId, {
      include: [
        {
          model: Room,
          as: 'rooms',
          include: [
            {
              model: Booking,
              as: 'bookings',
              where: {
                status: { [Op.in]: ['confirmed', 'checked_in'] }
              },
              required: false
            }
          ]
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'first_name', 'last_name', 'role', 'email', 'phone']
        }
      ]
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    return hotel;
  }

  // Update hotel
  async updateHotel(hotelId, updateData) {
    const hotel = await Hotel.findByPk(hotelId);
    
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Check if name is being changed and if it conflicts
    if (updateData.name && updateData.name !== hotel.name) {
      const existingHotel = await Hotel.findOne({
        where: {
          name: { [Op.iLike]: updateData.name },
          city: { [Op.iLike]: updateData.city || hotel.city },
          id: { [Op.ne]: hotelId }
        }
      });

      if (existingHotel) {
        throw new Error('Hotel with this name already exists in this city');
      }
    }

    await hotel.update(updateData);

    return await this.getHotelById(hotelId);
  }

  // Delete hotel (soft delete)
  async deleteHotel(hotelId) {
    const hotel = await Hotel.findByPk(hotelId);
    
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Check if hotel has active bookings
    const activeBookings = await Booking.count({
      include: [
        {
          model: Room,
          as: 'room',
          where: { hotel_id: hotelId }
        }
      ],
      where: {
        status: { [Op.in]: ['confirmed', 'checked_in'] }
      }
    });

    if (activeBookings > 0) {
      throw new Error('Cannot delete hotel with active bookings');
    }

    await hotel.update({ isActive: false });

    return { message: 'Hotel deactivated successfully' };
  }

  // Get hotel statistics
  async getHotelStats(hotelId) {
    const hotel = await Hotel.findByPk(hotelId);
    
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Get room statistics
    const totalRooms = await Room.count({
      where: { hotel_id: hotelId }
    });

    const occupiedRooms = await Room.count({
      where: {
        hotel_id: hotelId,
        status: 'occupied'
      }
    });

    const availableRooms = await Room.count({
      where: {
        hotel_id: hotelId,
        status: 'available'
      }
    });

    const maintenanceRooms = await Room.count({
      where: {
        hotel_id: hotelId,
        status: { [Op.in]: ['maintenance', 'out_of_order'] }
      }
    });

    // Get booking statistics for current month
    const currentMonth = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyBookings = await Booking.count({
      include: [
        {
          model: Room,
          as: 'room',
          where: { hotel_id: hotelId }
        }
      ],
      where: {
        created_at: {
          [Op.between]: [firstDay, lastDay]
        }
      }
    });

    const monthlyRevenue = await Booking.sum('total_amount', {
      include: [
        {
          model: Room,
          as: 'room',
          where: { hotel_id: hotelId }
        }
      ],
      where: {
        created_at: {
          [Op.between]: [firstDay, lastDay]
        },
        status: { [Op.in]: ['confirmed', 'checked_in', 'checked_out'] }
      }
    });

    // Get staff count
    const staffCount = await User.count({
      where: { hotelId: hotelId, isActive: true }
    });

    return {
      hotel: {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city
      },
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        available: availableRooms,
        maintenance: maintenanceRooms,
        occupancy_rate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0
      },
      monthly: {
        bookings: monthlyBookings,
        revenue: monthlyRevenue || 0
      },
      staff: staffCount
    };
  }

  // Get hotels for dropdown/select
  async getHotelsForSelect() {
    const hotels = await Hotel.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'city'],
      order: [['name', 'ASC']]
    });

    return hotels;
  }

  // Update hotel amenities
  async updateHotelAmenities(hotelId, amenities) {
    const hotel = await Hotel.findByPk(hotelId);
    
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    await hotel.update({ amenities });

    return hotel;
  }

  // Update hotel policies
  async updateHotelPolicies(hotelId, policies) {
    const hotel = await Hotel.findByPk(hotelId);
    
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    await hotel.update({ policies });

    return hotel;
  }
}

module.exports = new HotelService();