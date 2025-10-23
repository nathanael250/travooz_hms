import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { toast } from 'react-hot-toast';

export const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      totalGuests: 0,
      todayCheckIns: 0,
      todayCheckOuts: 0,
      monthlyRevenue: 0,
      occupancyRate: 0
    },
    recentBookings: [],
    upcomingArrivals: [],
    maintenanceRequests: [],
    guestRequests: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple data sources in parallel
      const [
        roomsResponse,
        bookingsResponse,
        arrivalsResponse,
        maintenanceResponse,
        requestsResponse
      ] = await Promise.allSettled([
        apiClient.get('/room-inventory'),
        apiClient.get('/room-bookings'),
        apiClient.get('/front-desk/upcoming-arrivals'),
        apiClient.get('/maintenance/requests'),
        apiClient.get('/guest-requests')
      ]);

      // Process rooms data
      let roomsData = { total: 0, occupied: 0, available: 0 };
      if (roomsResponse.status === 'fulfilled') {
        const rooms = roomsResponse.value.data?.data?.rooms || roomsResponse.value.data?.rooms || [];
        if (Array.isArray(rooms)) {
          roomsData = {
            total: rooms.length,
            occupied: rooms.filter(room => room.status === 'occupied').length,
            available: rooms.filter(room => room.status === 'available').length
          };
        }
      }

      // Process bookings data
      let recentBookings = [];
      if (bookingsResponse.status === 'fulfilled') {
        recentBookings = bookingsResponse.value.data?.data?.bookings || bookingsResponse.value.data?.bookings || [];
        if (!Array.isArray(recentBookings)) {
          recentBookings = [];
        }
      }

      // Process arrivals data
      let upcomingArrivals = [];
      if (arrivalsResponse.status === 'fulfilled') {
        upcomingArrivals = arrivalsResponse.value.data?.data?.arrivals || arrivalsResponse.value.data?.arrivals || [];
        if (!Array.isArray(upcomingArrivals)) {
          upcomingArrivals = [];
        }
      }

      // Process maintenance data
      let maintenanceRequests = [];
      if (maintenanceResponse.status === 'fulfilled') {
        maintenanceRequests = maintenanceResponse.value.data?.data?.requests || maintenanceResponse.value.data?.requests || [];
        if (!Array.isArray(maintenanceRequests)) {
          maintenanceRequests = [];
        }
      }

      // Process guest requests data
      let guestRequests = [];
      if (requestsResponse.status === 'fulfilled') {
        guestRequests = requestsResponse.value.data?.data?.requests || requestsResponse.value.data?.requests || [];
        if (!Array.isArray(guestRequests)) {
          guestRequests = [];
        }
      }

      // Calculate occupancy rate
      const occupancyRate = roomsData.total > 0 ? 
        Math.round((roomsData.occupied / roomsData.total) * 100) : 0;

      // Calculate monthly revenue (mock data for now)
      const monthlyRevenue = recentBookings.reduce((total, booking) => {
        return total + (booking.total_amount || 0);
      }, 0);

      setDashboardData({
        overview: {
          totalRooms: roomsData.total,
          occupiedRooms: roomsData.occupied,
          availableRooms: roomsData.available,
          totalGuests: upcomingArrivals.length + roomsData.occupied,
          todayCheckIns: upcomingArrivals.filter(arrival => 
            new Date(arrival.check_in_date).toDateString() === new Date().toDateString()
          ).length,
          todayCheckOuts: recentBookings.filter(booking => 
            new Date(booking.check_out_date).toDateString() === new Date().toDateString()
          ).length,
          monthlyRevenue,
          occupancyRate
        },
        recentBookings: recentBookings.slice(0, 5),
        upcomingArrivals: upcomingArrivals.slice(0, 5),
        maintenanceRequests: maintenanceRequests.slice(0, 5),
        guestRequests: guestRequests.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set default empty data to prevent crashes
      setDashboardData({
        overview: {
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          totalGuests: 0,
          todayCheckIns: 0,
          todayCheckOuts: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        },
        recentBookings: [],
        upcomingArrivals: [],
        maintenanceRequests: [],
        guestRequests: []
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500'
    };

    const changeIcon = changeType === 'increase' ? TrendingUp : TrendingDown;
    const changeColor = changeType === 'increase' ? 'text-green-600' : 'text-red-600';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center text-sm ${changeColor}`}>
                {React.createElement(changeIcon, { className: "h-4 w-4 mr-1" })}
                {change}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon: Icon, href, color }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 hover:bg-green-100',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
    };

    return (
      <a
        href={href}
        className={`block p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${colorClasses[color]}`}
      >
        <div className="flex items-center">
          <Icon className="h-8 w-8 mr-3" />
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm opacity-75">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto" />
        </div>
      </a>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hotel Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at your hotel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Rooms"
          value={dashboardData.overview.totalRooms}
          icon={Building}
          color="blue"
        />
        <StatCard
          title="Occupied Rooms"
          value={dashboardData.overview.occupiedRooms}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Available Rooms"
          value={dashboardData.overview.availableRooms}
          icon={CheckCircle}
          color="purple"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${dashboardData.overview.occupancyRate}%`}
          icon={BarChart3}
          color="indigo"
        />
        <StatCard
          title="Today's Check-ins"
          value={dashboardData.overview.todayCheckIns}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Today's Check-outs"
          value={dashboardData.overview.todayCheckOuts}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Monthly Revenue"
          value={`RWF ${dashboardData.overview.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Guests"
          value={dashboardData.overview.totalGuests}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="New Booking"
            description="Create a new room booking"
            icon={Plus}
            href="/bookings/room-bookings"
            color="blue"
          />
          <QuickActionCard
            title="Room Management"
            description="Manage room inventory and types"
            icon={Building}
            href="/hotels/room-inventory"
            color="green"
          />
          <QuickActionCard
            title="Guest Check-in"
            description="Process guest arrivals"
            icon={Users}
            href="/front-desk/upcoming-arrivals"
            color="purple"
          />
          <QuickActionCard
            title="Financial Reports"
            description="View revenue and financial data"
            icon={BarChart3}
            href="/financial/invoices"
            color="orange"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <a href="/bookings/room-bookings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guest_name || 'Guest'}</p>
                      <p className="text-sm text-gray-600">
                        {booking.check_in_date} - {booking.check_out_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        RWF {booking.total_amount?.toLocaleString() || '0'}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent bookings</p>
            )}
          </div>
        </div>

        {/* Upcoming Arrivals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Arrivals</h3>
              <a href="/front-desk/upcoming-arrivals" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.upcomingArrivals.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingArrivals.map((arrival, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">{arrival.guest_name || 'Guest'}</p>
                      <p className="text-sm text-gray-600">
                        Arriving: {arrival.check_in_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{arrival.room_type || 'Room'}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {arrival.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming arrivals</p>
            )}
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Requests</h3>
              <a href="/maintenance/requests" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.maintenanceRequests.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.maintenanceRequests.map((request, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">{request.request_type || 'Maintenance'}</p>
                      <p className="text-sm text-gray-600">Room {request.room_number || 'N/A'}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No maintenance requests</p>
            )}
          </div>
        </div>

        {/* Guest Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Guest Requests</h3>
              <a href="/guests/guest-requests" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.guestRequests.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.guestRequests.map((request, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-gray-900">{request.request_type || 'Request'}</p>
                      <p className="text-sm text-gray-600">{request.description || 'No description'}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No guest requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};