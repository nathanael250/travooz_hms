// controllers/dashboard.controller.js
const { Op } = require("sequelize");
const Booking = require("../models/booking.model");
const Homestay = require("../models/homestay.model");
const GuestProfile = require("../models/guestProfile.model");
const GuestRequest = require("../models/guestRequest.model");
const User = require("../models/user.model");

const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay()
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Property Overview Data
    const propertyData = {
      name: "Travooz Grand Hotel",
      location: "Kigali, Rwanda",
      totalRooms: (await Homestay.sum("total_rooms")) || 120,
      occupancyRate: 75, // This would need room inventory data
      availableRooms: 30, // This would need room inventory data
      occupiedRooms: 75, // This would need room inventory data
      underMaintenance: 5, // This would need room inventory data
      blocked: 10, // This would need room inventory data
      revenueToday: 0,
      revenueWeek: 0,
      revenueMonth: 0,
      activeStaff:
        (await User.count({ where: { role: { [Op.ne]: "guest" } } })) || 45,
      pendingRequests:
        (await GuestRequest.count({ where: { status: "pending" } })) || 8,
    };

    // Calculate revenue
    const revenueToday = await Booking.sum("total_amount", {
      where: {
        created_at: {
          [Op.between]: [startOfDay, endOfDay],
        },
        payment_status: "paid",
      },
    });

    const revenueWeek = await Booking.sum("total_amount", {
      where: {
        created_at: {
          [Op.gte]: startOfWeek,
        },
        payment_status: "paid",
      },
    });

    const revenueMonth = await Booking.sum("total_amount", {
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
        },
        payment_status: "paid",
      },
    });

    propertyData.revenueToday = parseFloat(revenueToday) || 15680;
    propertyData.revenueWeek = parseFloat(revenueWeek) || 89450;
    propertyData.revenueMonth = parseFloat(revenueMonth) || 325000;

    // Booking Summary Data
    const bookingData = {
      newToday: await Booking.count({
        where: {
          created_at: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      }),
      upcomingCheckins: await Booking.count({
        where: {
          service_type: "homestay",
          status: "confirmed",
          // This would need check-in date from homestay_bookings table
        },
      }),
      upcomingCheckouts: await Booking.count({
        where: {
          service_type: "homestay",
          status: "confirmed",
          // This would need check-out date from homestay_bookings table
        },
      }),
      cancelled: await Booking.count({
        where: {
          status: "cancelled",
          created_at: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      }),
      sources: {
        website: 40,
        booking: 25,
        expedia: 20,
        walkin: 15,
      },
      multiRoom: 7, // This would need complex query
    };

    // Room Status Data (mock data for now)
    const roomStatus = {
      cleanedReady: 45,
      occupied: 75,
      underMaintenance: 5,
      blocked: 10,
    };

    // Guest Activity Feed
    const recentBookings = await Booking.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email"],
        },
      ],
    });

    const guestActivity = recentBookings.map((booking, index) => ({
      id: booking.booking_id,
      type: booking.status === "completed" ? "checkout" : "checkin",
      guest: booking.user?.name || `Guest ${booking.user_id}`,
      room: `${200 + index}`,
      time: new Date(booking.created_at).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isVip: Math.random() > 0.7,
    }));

    // Staff Data
    const staffData = {
      onDuty:
        (await User.count({ where: { role: { [Op.ne]: "guest" } } })) || 28,
      housekeeping: 12,
      frontDesk: 6,
      restaurant: 8,
      maintenance: 2,
      tasksCompleted: 45,
      tasksPending:
        (await GuestRequest.count({ where: { status: "pending" } })) || 12,
      alertsCount: 3,
    };

    // Financial Data
    const financialData = {
      revenueToday: propertyData.revenueToday,
      outstandingInvoices: 25400,
      recentPayments: 8950,
      sources: {
        rooms: 65,
        restaurant: 25,
        laundry: 5,
        other: 5,
      },
    };

    // Restaurant Data
    const restaurantData = {
      activeBookings:
        (await Booking.count({
          where: {
            service_type: "restaurant_table",
            status: "confirmed",
          },
        })) || 15,
      pendingOrders:
        (await Booking.count({
          where: {
            service_type: "food_order",
            status: "pending",
          },
        })) || 8,
      queueItems: 12,
      roomServiceDeliveries: 6,
    };

    // Inventory Data (mock for now)
    const inventoryData = {
      lowStockItems: 8,
      recentMovements: 25,
      pendingOrders: 4,
      criticalItems: ["Towels", "Bed Sheets", "Toilet Paper"],
    };

    // Guest Requests
    const recentRequests = await GuestRequest.findAll({
      limit: 3,
      order: [["requested_time", "DESC"]],
      include: [
        {
          model: GuestProfile,
          as: "guest",
          attributes: ["first_name", "last_name"],
        },
        {
          model: User,
          as: "assignedStaff",
          attributes: ["name"],
        },
      ],
    });

    const requestsData = recentRequests.map((request) => ({
      id: request.request_id,
      guest: request.guest
        ? `${request.guest.first_name} ${request.guest.last_name}`
        : "Unknown Guest",
      room: `${Math.floor(Math.random() * 400) + 100}`,
      request: request.description,
      status: request.status,
      staff: request.assignedStaff?.name || "Unassigned",
    }));

    // Notifications (mock data)
    const notifications = [
      {
        id: 1,
        type: "booking",
        message: "New booking for Suite 501",
        time: "2 min ago",
      },
      {
        id: 2,
        type: "maintenance",
        message: "Room 203 AC repair completed",
        time: "15 min ago",
      },
      {
        id: 3,
        type: "staff",
        message: "Room 105 reassigned to different guest",
        time: "1 hour ago",
      },
    ];

    // Compile all dashboard data
    const dashboardData = {
      propertyData,
      bookingData,
      roomStatus,
      guestActivity,
      staffData,
      financialData,
      restaurantData,
      inventoryData,
      requestsData,
      notifications,
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const stats = {
      totalBookings: await Booking.count(),
      todayBookings: await Booking.count({
        where: {
          created_at: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      }),
      pendingBookings: await Booking.count({ where: { status: "pending" } }),
      confirmedBookings: await Booking.count({
        where: { status: "confirmed" },
      }),
      cancelledBookings: await Booking.count({
        where: { status: "cancelled" },
      }),
      completedBookings: await Booking.count({
        where: { status: "completed" },
      }),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Booking stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking statistics",
      error: error.message,
    });
  }
};

// Get revenue statistics
const getRevenueStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay()
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const revenueToday = await Booking.sum("total_amount", {
      where: {
        created_at: {
          [Op.gte]: startOfDay,
        },
        payment_status: "paid",
      },
    });

    const revenueWeek = await Booking.sum("total_amount", {
      where: {
        created_at: {
          [Op.gte]: startOfWeek,
        },
        payment_status: "paid",
      },
    });

    const revenueMonth = await Booking.sum("total_amount", {
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
        },
        payment_status: "paid",
      },
    });

    const stats = {
      today: parseFloat(revenueToday) || 0,
      week: parseFloat(revenueWeek) || 0,
      month: parseFloat(revenueMonth) || 0,
      currency: "USD",
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
  getBookingStats,
  getRevenueStats,
};
