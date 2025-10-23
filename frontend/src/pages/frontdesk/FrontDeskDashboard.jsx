import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Package,
  Bell,
  UserCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const FrontDeskDashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todayCheckIns: 0,
    todayCheckOuts: 0,
    pendingBookings: 0,
    totalGuests: 0,
    roomOccupancy: 0,
    guestRequests: 0,
    recentBookings: [],
    roomStatus: [],
    upcomingCheckIns: [],
    upcomingCheckOuts: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    const refreshInterval = setInterval(fetchDashboardData, 300000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        bookingsResponse,
        roomStatusResponse,
        guestRequestsResponse
      ] = await Promise.all([
        apiClient.get('/room-bookings'),
        apiClient.get('/front-desk/room-status'),
        apiClient.get('/guest-requests')
      ]);

      const bookings = bookingsResponse.data?.data?.bookings || [];
      const rooms = roomStatusResponse.data?.data?.rooms || [];
      const requests = guestRequestsResponse.data?.data?.requests || [];

      // Calculate metrics
      const today = new Date().toDateString();
      const todayCheckIns = bookings.filter(booking => 
        new Date(booking.check_in_date).toDateString() === today &&
        booking.status === 'checked_in'
      ).length;

      const todayCheckOuts = bookings.filter(booking => 
        new Date(booking.check_out_date).toDateString() === today &&
        booking.status === 'checked_out'
      ).length;

      const pendingBookings = bookings.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'pending'
      ).length;

      const occupiedRooms = rooms.filter(room => 
        room.status === 'occupied-clean' || room.status === 'occupied-dirty'
      ).length;

      const roomOccupancy = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;

      const guestRequests = requests.filter(request => 
        request.status === 'pending' || request.status === 'acknowledged'
      ).length;

      // Calculate total unique guests from bookings
      const uniqueGuests = new Set(bookings.map(booking => booking.guest_email)).size;

      // Recent bookings (last 10)
      const recentBookings = bookings
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      // Upcoming check-ins (next 24 hours)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const upcomingCheckIns = bookings.filter(booking => {
        const checkInDate = new Date(booking.check_in_date);
        return checkInDate >= new Date() && checkInDate <= tomorrow && 
               booking.status === 'confirmed';
      }).slice(0, 5);

      // Upcoming check-outs (next 24 hours)
      const upcomingCheckOuts = bookings.filter(booking => {
        const checkOutDate = new Date(booking.check_out_date);
        return checkOutDate >= new Date() && checkOutDate <= tomorrow && 
               booking.status === 'checked_in';
      }).slice(0, 5);

      setDashboardData({
        todayCheckIns,
        todayCheckOuts,
        pendingBookings,
        totalGuests: uniqueGuests,
        roomOccupancy,
        guestRequests,
        recentBookings,
        roomStatus: rooms.slice(0, 10),
        upcomingCheckIns,
        upcomingCheckOuts
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && dashboardData.totalGuests === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading front desk dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-blue-600" />
                Front Desk Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.name}! Manage bookings, guests, and room operations
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Time</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.todayCheckIns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Check-outs</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.todayCheckOuts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Room Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.roomOccupancy.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalGuests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Guest Requests</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.guestRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Package className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.roomStatus.filter(room => room.status === 'vacant-clean').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Check-ins */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Upcoming Check-ins
              </h3>
            </div>
            <div className="p-6">
              {dashboardData.upcomingCheckIns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming check-ins</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.upcomingCheckIns.map((booking) => (
                    <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.guest_name}</p>
                        <p className="text-sm text-gray-600">
                          Room: {booking.room_number} • {new Date(booking.check_in_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {new Date(booking.check_in_date).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Check-outs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Upcoming Check-outs
              </h3>
            </div>
            <div className="p-6">
              {dashboardData.upcomingCheckOuts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming check-outs</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.upcomingCheckOuts.map((booking) => (
                    <div key={booking.booking_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.guest_name}</p>
                        <p className="text-sm text-gray-600">
                          Room: {booking.room_number} • {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {new Date(booking.check_out_date).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Recent Bookings
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentBookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                        <div className="text-sm text-gray-500">{booking.guest_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.room_number || 'TBD'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.check_in_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                          booking.status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        RWF {parseFloat(booking.final_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontDeskDashboard;
