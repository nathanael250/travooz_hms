import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Bed,
  AlertCircle,
  UserCheck,
  Key,
  Phone,
  Mail,
  Loader2,
  TrendingUp,
  Bell,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    upcomingCheckIns: 0,
    upcomingCheckOuts: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    pendingRequests: 0,
    todayArrivals: [],
    todayDepartures: [],
    roomStatus: {
      clean: 0,
      dirty: 0,
      occupied: 0,
      maintenance: 0
    },
    recentMessages: []
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming arrivals
      const arrivalsResponse = await apiClient.get('/front-desk/upcoming-arrivals');
      
      // Fetch bookings for today and tomorrow to separate arrivals and departures
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const bookingsResponse = await apiClient.get('/room-bookings', {
        params: {
          start_date: todayStr,
          end_date: tomorrowStr,
          limit: 100
        }
      });

      if (arrivalsResponse.data.success && bookingsResponse.data.success) {
        const bookings = bookingsResponse.data.data?.bookings || [];
        
        // Separate arrivals and departures
        const todayArrivals = bookings.filter(b => 
          b.check_in_date && new Date(b.check_in_date).toISOString().split('T')[0] === todayStr
        ).slice(0, 10);
        
        const todayDepartures = bookings.filter(b => 
          b.check_out_date && new Date(b.check_out_date).toISOString().split('T')[0] === todayStr
        ).slice(0, 10);
        
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        const checkedInBookings = bookings.filter(b => b.status === 'checked_in');
        
        setDashboardData(prev => ({
          ...prev,
          upcomingCheckIns: todayArrivals.length,
          upcomingCheckOuts: todayDepartures.length,
          pendingRequests: confirmedBookings.filter(b => !b.room_assigned).length,
          todayArrivals: todayArrivals.map((b, idx) => ({
            id: idx + 1,
            guestName: b.guest_name,
            room: b.room_number || 'TBD',
            bookingRef: b.booking_reference,
            status: b.status === 'checked_in' ? 'checked-in' : 'pending'
          })),
          todayDepartures: todayDepartures.map((b, idx) => ({
            id: idx + 1,
            guestName: b.guest_name,
            room: b.room_number || 'TBD',
            bookingRef: b.booking_reference,
            status: b.status === 'checked_out' ? 'checked-out' : 'pending'
          }))
        }));
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Front Desk Dashboard</h1>
            <p className="text-blue-100 mt-1 text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-right">
              <p className="text-sm text-blue-100">Welcome</p>
              <p className="font-semibold">{user?.name || 'Receptionist'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 bg-gray-50">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Check-ins"
            value={dashboardData.upcomingCheckIns}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Today's Check-outs"
            value={dashboardData.upcomingCheckOuts}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Available Rooms"
            value={dashboardData.availableRooms}
            icon={Bed}
            color="blue"
          />
          <StatCard
            title="Pending Requests"
            value={dashboardData.pendingRequests}
            icon={Bell}
            color="red"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Arrivals */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Today's Arrivals
            </h3>
            <div className="space-y-3">
              {dashboardData.todayArrivals.map((arrival) => (
                <div key={arrival.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{arrival.guestName}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      arrival.status === 'checked-in'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {arrival.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>Room: <span className="font-medium">{arrival.room}</span></div>
                    <div>Time: <span className="font-medium">{arrival.time}</span></div>
                    <div>Ref: <span className="font-medium text-xs">{arrival.bookingRef}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Departures */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Today's Departures
            </h3>
            <div className="space-y-3">
              {dashboardData.todayDepartures.map((departure) => (
                <div key={departure.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{departure.guestName}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      departure.status === 'checked-out'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {departure.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>Room: <span className="font-medium">{departure.room}</span></div>
                    <div>Time: <span className="font-medium">{departure.time}</span></div>
                    <div>Ref: <span className="font-medium text-xs">{departure.bookingRef}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Room Status Overview */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="h-5 w-5 text-blue-600" />
            Room Status Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{dashboardData.roomStatus.clean}</div>
              <div className="text-sm text-green-700">Clean & Ready</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.roomStatus.occupied}</div>
              <div className="text-sm text-blue-700">Occupied</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{dashboardData.roomStatus.dirty}</div>
              <div className="text-sm text-orange-700">Needs Cleaning</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{dashboardData.roomStatus.maintenance}</div>
              <div className="text-sm text-red-700">Maintenance</div>
            </div>
          </div>
        </div>

        {/* Recent Messages/Requests */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            Recent Guest Requests
          </h3>
          <div className="space-y-3">
            {dashboardData.recentMessages.map((message) => (
              <div key={message.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{message.from}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        message.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : message.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {message.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{message.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-200' },
    green: { bg: 'bg-green-500', border: 'border-green-200' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-200' },
    red: { bg: 'bg-red-500', border: 'border-red-200' }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 ${colorClasses[color].border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color].bg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
};
