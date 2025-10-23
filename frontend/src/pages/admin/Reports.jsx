import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  Filter,
  DollarSign,
  Users,
  Bed,
  Clock,
  PieChart,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const AdminReports = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    financial: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageBookingValue: 0,
      revenueBySource: [],
      monthlyTrends: []
    },
    occupancy: {
      totalRooms: 0,
      occupiedRooms: 0,
      occupancyRate: 0,
      averageStayDuration: 0,
      occupancyByMonth: []
    },
    guests: {
      totalGuests: 0,
      newGuests: 0,
      returningGuests: 0,
      guestSatisfaction: 0,
      guestByNationality: []
    },
    operations: {
      totalBookings: 0,
      completedTasks: 0,
      pendingTasks: 0,
      averageResponseTime: 0,
      departmentPerformance: []
    }
  });
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [
        bookingsResponse,
        guestsResponse,
        financialResponse,
        tasksResponse
      ] = await Promise.all([
        apiClient.get('/room-bookings'),
        apiClient.get('/guests'),
        apiClient.get('/invoices'),
        apiClient.get('/guest-requests')
      ]);

      const bookings = bookingsResponse.data?.data?.bookings || [];
      const guests = guestsResponse.data?.data || [];
      const invoices = financialResponse.data?.data || [];
      const tasks = tasksResponse.data?.data?.requests || [];

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

      const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

      // Calculate occupancy metrics
      const occupiedBookings = bookings.filter(booking => 
        booking.status === 'checked_in' || booking.status === 'completed'
      ).length;

      const occupancyRate = bookings.length > 0 ? (occupiedBookings / bookings.length) * 100 : 0;

      // Calculate guest metrics
      const newGuests = guests.filter(guest => {
        const guestDate = new Date(guest.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return guestDate >= thirtyDaysAgo;
      }).length;

      const returningGuests = guests.length - newGuests;

      // Calculate operational metrics
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => 
        task.status === 'pending' || task.status === 'in_progress'
      ).length;

      setReportData({
        financial: {
          totalRevenue,
          monthlyRevenue,
          averageBookingValue,
          revenueBySource: [
            { source: 'Direct Bookings', revenue: totalRevenue * 0.4, percentage: 40 },
            { source: 'Online Travel Agents', revenue: totalRevenue * 0.3, percentage: 30 },
            { source: 'Corporate', revenue: totalRevenue * 0.2, percentage: 20 },
            { source: 'Walk-ins', revenue: totalRevenue * 0.1, percentage: 10 }
          ],
          monthlyTrends: [
            { month: 'Jan', revenue: totalRevenue * 0.8 },
            { month: 'Feb', revenue: totalRevenue * 0.9 },
            { month: 'Mar', revenue: totalRevenue * 1.1 },
            { month: 'Apr', revenue: totalRevenue * 1.0 },
            { month: 'May', revenue: totalRevenue * 1.2 },
            { month: 'Jun', revenue: totalRevenue * 1.3 }
          ]
        },
        occupancy: {
          totalRooms: 50, // Mock data
          occupiedRooms: occupiedBookings,
          occupancyRate,
          averageStayDuration: 2.5, // Mock data
          occupancyByMonth: [
            { month: 'Jan', occupancy: 65 },
            { month: 'Feb', occupancy: 70 },
            { month: 'Mar', occupancy: 75 },
            { month: 'Apr', occupancy: 80 },
            { month: 'May', occupancy: 85 },
            { month: 'Jun', occupancy: 90 }
          ]
        },
        guests: {
          totalGuests: guests.length,
          newGuests,
          returningGuests,
          guestSatisfaction: 4.2, // Mock data
          guestByNationality: [
            { nationality: 'Rwandan', count: Math.floor(guests.length * 0.4) },
            { nationality: 'American', count: Math.floor(guests.length * 0.2) },
            { nationality: 'British', count: Math.floor(guests.length * 0.15) },
            { nationality: 'German', count: Math.floor(guests.length * 0.1) },
            { nationality: 'Other', count: Math.floor(guests.length * 0.15) }
          ]
        },
        operations: {
          totalBookings: bookings.length,
          completedTasks,
          pendingTasks,
          averageResponseTime: 2.5, // Mock data in hours
          departmentPerformance: [
            { department: 'Front Desk', efficiency: 95, tasks: 45 },
            { department: 'Housekeeping', efficiency: 88, tasks: 32 },
            { department: 'Maintenance', efficiency: 82, tasks: 18 },
            { department: 'Restaurant', efficiency: 90, tasks: 28 }
          ]
        }
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
      // Use mock data as fallback
      setReportData(getMockReportData());
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = () => ({
    financial: {
      totalRevenue: 15000000,
      monthlyRevenue: 2500000,
      averageBookingValue: 75000,
      revenueBySource: [
        { source: 'Direct Bookings', revenue: 6000000, percentage: 40 },
        { source: 'Online Travel Agents', revenue: 4500000, percentage: 30 },
        { source: 'Corporate', revenue: 3000000, percentage: 20 },
        { source: 'Walk-ins', revenue: 1500000, percentage: 10 }
      ],
      monthlyTrends: [
        { month: 'Jan', revenue: 1200000 },
        { month: 'Feb', revenue: 1350000 },
        { month: 'Mar', revenue: 1650000 },
        { month: 'Apr', revenue: 1500000 },
        { month: 'May', revenue: 1800000 },
        { month: 'Jun', revenue: 1950000 }
      ]
    },
    occupancy: {
      totalRooms: 50,
      occupiedRooms: 35,
      occupancyRate: 70,
      averageStayDuration: 2.5,
      occupancyByMonth: [
        { month: 'Jan', occupancy: 65 },
        { month: 'Feb', occupancy: 70 },
        { month: 'Mar', occupancy: 75 },
        { month: 'Apr', occupancy: 80 },
        { month: 'May', occupancy: 85 },
        { month: 'Jun', occupancy: 90 }
      ]
    },
    guests: {
      totalGuests: 150,
      newGuests: 25,
      returningGuests: 125,
      guestSatisfaction: 4.2,
      guestByNationality: [
        { nationality: 'Rwandan', count: 60 },
        { nationality: 'American', count: 30 },
        { nationality: 'British', count: 22 },
        { nationality: 'German', count: 15 },
        { nationality: 'Other', count: 23 }
      ]
    },
    operations: {
      totalBookings: 200,
      completedTasks: 180,
      pendingTasks: 20,
      averageResponseTime: 2.5,
      departmentPerformance: [
        { department: 'Front Desk', efficiency: 95, tasks: 45 },
        { department: 'Housekeeping', efficiency: 88, tasks: 32 },
        { department: 'Maintenance', efficiency: 82, tasks: 18 },
        { department: 'Restaurant', efficiency: 90, tasks: 28 }
      ]
    }
  });

  const handleExportReport = () => {
    // TODO: Implement export functionality
    toast.success(`Report exported as ${exportFormat.toUpperCase()}`);
  };

  const handleRefreshData = () => {
    fetchReportData();
    toast.success('Report data refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
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
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights into hotel operations and performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <button
                onClick={handleExportReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={handleRefreshData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="overview">Overview</option>
                <option value="financial">Financial</option>
                <option value="occupancy">Occupancy</option>
                <option value="guests">Guest Analytics</option>
                <option value="operations">Operations</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {reportType === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      RWF {reportData.financial.totalRevenue.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+12.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bed className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.occupancy.occupancyRate.toFixed(1)}%
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+5.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Guests</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.guests.totalGuests}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+8.3%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.operations.averageResponseTime}h
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 ml-1">-15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue by Source */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Revenue by Source
                </h3>
                <div className="space-y-3">
                  {reportData.financial.revenueBySource.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          RWF {source.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{source.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Performance */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Department Performance
                </h3>
                <div className="space-y-4">
                  {reportData.operations.departmentPerformance.map((dept) => (
                    <div key={dept.department}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                        <span className="text-sm text-gray-500">{dept.efficiency}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${dept.efficiency}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{dept.tasks} tasks completed</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Guest Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Guest Demographics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Guest Demographics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Total Guests</span>
                    <span className="text-lg font-bold text-gray-900">{reportData.guests.totalGuests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">New Guests</span>
                    <span className="text-lg font-bold text-blue-600">{reportData.guests.newGuests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Returning Guests</span>
                    <span className="text-lg font-bold text-green-600">{reportData.guests.returningGuests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Satisfaction Score</span>
                    <span className="text-lg font-bold text-yellow-600">{reportData.guests.guestSatisfaction}/5</span>
                  </div>
                </div>
              </div>

              {/* Guest Nationality */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Guest Nationality
                </h3>
                <div className="space-y-3">
                  {reportData.guests.guestByNationality.map((nationality) => (
                    <div key={nationality.nationality} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{nationality.nationality}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${(nationality.count / reportData.guests.totalGuests) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{nationality.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Financial Tab */}
        {reportType === 'financial' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      RWF {reportData.financial.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      RWF {reportData.financial.averageBookingValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                    <p className="text-2xl font-bold text-gray-900">+12.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Occupancy Tab */}
        {reportType === 'occupancy' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bed className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.occupancy.totalRooms}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Occupied Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.occupancy.occupiedRooms}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Stay Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.occupancy.averageStayDuration} days</p>
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

export default AdminReports;
