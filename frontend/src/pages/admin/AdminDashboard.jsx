import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  Wrench, 
  ChefHat, 
  Bell,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings,
  Home,
  CreditCard,
  FileText,
  UserCheck,
  Sparkles,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    // Financial Overview
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    
    // Booking & Guest Management
    totalBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: 0,
    totalGuests: 0,
    
    // Staff & Operations
    activeStaff: 0,
    pendingTasks: 0,
    completedTasks: 0,
    guestRequests: 0,
    
    // Inventory & Maintenance
    lowStockItems: 0,
    maintenanceRequests: 0,
    restaurantOrders: 0,
    
    // Recent Activity
    recentBookings: [],
    recentGuests: [],
    recentTasks: [],
    recentRequests: [],
    
    // Performance Metrics
    monthlyTrends: [],
    departmentPerformance: [],
    topRevenueSources: []
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

      // Fetch all dashboard data in parallel
      const [
        bookingsResponse,
        guestsResponse,
        invoicesResponse,
        staffResponse,
        tasksResponse,
        requestsResponse,
        inventoryResponse,
        maintenanceResponse,
        restaurantResponse
      ] = await Promise.all([
        apiClient.get('/bookings/room-bookings'),
        apiClient.get('/guests'),
        apiClient.get('/invoices'),
        apiClient.get('/hms-users'),
        apiClient.get('/guest-requests'),
        apiClient.get('/guest-requests'),
        apiClient.get('/stock/alerts'),
        apiClient.get('/maintenance/requests'),
        apiClient.get('/restaurant/orders')
      ]);

      const bookings = bookingsResponse.data || [];
      const guests = guestsResponse.data || [];
      const invoices = invoicesResponse.data || [];
      const staff = staffResponse.data || [];
      const tasks = tasksResponse.data || [];
      const requests = requestsResponse.data || [];
      const inventory = inventoryResponse.data || [];
      const maintenance = maintenanceResponse.data || [];
      const restaurant = restaurantResponse.data || [];

      // Calculate financial metrics
      const totalRevenue = bookings.reduce((sum, booking) => {
        return sum + (parseFloat(booking.final_amount) || 0);
      }, 0);

      const monthlyRevenue = bookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return bookingDate >= thirtyDaysAgo;
      }).reduce((sum, booking) => {
        return sum + (parseFloat(booking.final_amount) || 0);
      }, 0);

      const pendingInvoices = invoices.filter(invoice => 
        invoice.status === 'pending' || invoice.status === 'draft'
      ).length;

      const overdueInvoices = invoices.filter(invoice => {
        if (!invoice.due_date) return false;
        const dueDate = new Date(invoice.due_date);
        const today = new Date();
        return dueDate < today && invoice.status !== 'paid';
      }).length;

      // Calculate booking metrics
      const today = new Date().toDateString();
      const todayCheckIns = bookings.filter(booking => 
        new Date(booking.check_in_date).toDateString() === today &&
        booking.status === 'checked_in'
      ).length;

      const todayCheckOuts = bookings.filter(booking => 
        new Date(booking.check_out_date).toDateString() === today &&
        booking.status === 'checked_out'
      ).length;

      const occupiedBookings = bookings.filter(booking => 
        booking.status === 'checked_in' || booking.status === 'completed'
      ).length;

      const occupancyRate = bookings.length > 0 ? (occupiedBookings / bookings.length) * 100 : 0;

      // Calculate staff and task metrics
      const activeStaff = staff.filter(member => 
        member.status === 'active' || member.status === 'online'
      ).length;

      const pendingTasks = tasks.filter(task => 
        task.status === 'pending' || task.status === 'acknowledged'
      ).length;

      const completedTasks = tasks.filter(task => 
        task.status === 'completed'
      ).length;

      const guestRequests = requests.filter(request => 
        request.status === 'pending' || request.status === 'acknowledged'
      ).length;

      // Calculate operational metrics
      const lowStockItems = inventory.filter(item => 
        item.alert_status === 'low_stock' || item.alert_status === 'out_of_stock'
      ).length;

      const maintenanceRequests = maintenance.filter(request => 
        request.status === 'pending' || request.status === 'in_progress'
      ).length;

      const restaurantOrders = restaurant.filter(order => 
        order.status === 'pending' || order.status === 'preparing'
      ).length;

      // Recent activity (last 10 items)
      const recentBookings = bookings
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      const recentGuests = guests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      const recentTasks = tasks
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      const recentRequests = requests
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      // Department performance
      const departmentPerformance = [
        { department: 'Front Desk', tasks: pendingTasks, completed: completedTasks, efficiency: 85 },
        { department: 'Housekeeping', tasks: Math.floor(pendingTasks * 0.6), completed: Math.floor(completedTasks * 0.7), efficiency: 78 },
        { department: 'Maintenance', tasks: maintenanceRequests, completed: Math.floor(maintenanceRequests * 0.8), efficiency: 82 },
        { department: 'Restaurant', tasks: restaurantOrders, completed: Math.floor(restaurantOrders * 0.9), efficiency: 90 },
        { department: 'Inventory', tasks: lowStockItems, completed: Math.floor(lowStockItems * 0.5), efficiency: 75 }
      ];

      // Top revenue sources
      const revenueSources = bookings.reduce((acc, booking) => {
        const source = booking.source || 'Direct';
        if (!acc[source]) {
          acc[source] = { count: 0, revenue: 0 };
        }
        acc[source].count++;
        acc[source].revenue += parseFloat(booking.final_amount) || 0;
        return acc;
      }, {});

      const topRevenueSources = Object.entries(revenueSources)
        .map(([source, data]) => ({ source, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setDashboardData({
        totalRevenue,
        monthlyRevenue,
        pendingInvoices,
        overdueInvoices,
        totalBookings: bookings.length,
        todayCheckIns,
        todayCheckOuts,
        occupancyRate,
        totalGuests: guests.length,
        activeStaff,
        pendingTasks,
        completedTasks,
        guestRequests,
        lowStockItems,
        maintenanceRequests,
        restaurantOrders,
        recentBookings,
        recentGuests,
        recentTasks,
        recentRequests,
        monthlyTrends: [], // Could be implemented with historical data
        departmentPerformance,
        topRevenueSources
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && dashboardData.totalBookings === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
                <Settings className="h-8 w-8 text-purple-600" />
                Hotel Management Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.name}! Complete overview of your hotel operations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Time</div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={fetchDashboardData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'financial', name: 'Financial', icon: DollarSign },
              { id: 'operations', name: 'Operations', icon: Users },
              { id: 'staff', name: 'Staff', icon: UserCheck },
              { id: 'reports', name: 'Reports', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      RWF {dashboardData.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.occupancyRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
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
                    <UserCheck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Staff</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.activeStaff}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.todayCheckIns}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Users className="h-6 w-6 text-pink-600" />
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
                    <Bell className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingTasks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Guest Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.guestRequests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Department Performance
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.departmentPerformance.map((dept) => (
                      <div key={dept.department} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                            <span className="text-sm text-gray-500">{dept.efficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${dept.efficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Top Revenue Sources
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {dashboardData.topRevenueSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{source.source}</p>
                          <p className="text-sm text-gray-600">{source.count} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            RWF {source.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            RWF {parseFloat(booking.final_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-600" />
                    Recent Tasks
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {dashboardData.recentTasks.map((task) => (
                      <div key={task.request_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{task.request_type}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      RWF {dashboardData.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingInvoices}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.overdueInvoices}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      RWF {dashboardData.totalBookings > 0 ? (dashboardData.totalRevenue / dashboardData.totalBookings).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operations Tab */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.lowStockItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Maintenance Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.maintenanceRequests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChefHat className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Restaurant Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.restaurantOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.completedTasks}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
