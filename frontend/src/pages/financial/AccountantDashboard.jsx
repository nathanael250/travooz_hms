import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Download,
  Calculator,
  PieChart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const AccountantDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalBookings: 0,
    occupancyRate: 0,
    averageBookingValue: 0,
    recentTransactions: [],
    topRevenueSources: [],
    paymentStatusBreakdown: [],
    monthlyTrends: []
  });
  const [error, setError] = useState(null);
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState('30'); // days
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(fetchDashboardData, 300000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(refreshInterval);
    };
  }, [timeFilter, statusFilter, paymentFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        bookingsResponse,
        invoicesResponse,
        paymentsResponse,
        revenueResponse
      ] = await Promise.all([
        apiClient.get('/bookings/room-bookings'),
        apiClient.get('/invoices'),
        apiClient.get('/payments'),
        apiClient.get('/reports/revenue', { params: { period: timeFilter } })
      ]);

      const bookings = bookingsResponse.data || [];
      const invoices = invoicesResponse.data || [];
      const payments = paymentsResponse.data || [];
      const revenue = revenueResponse.data || {};

      // Calculate dashboard metrics
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

      const totalBookings = bookings.length;
      const occupancyRate = bookings.filter(booking => 
        booking.status === 'checked_in' || booking.status === 'completed'
      ).length / Math.max(totalBookings, 1) * 100;

      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Recent transactions (last 10 bookings)
      const recentTransactions = bookings
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      // Payment status breakdown
      const paymentStatusBreakdown = bookings.reduce((acc, booking) => {
        const status = booking.payment_status || 'pending';
        if (!acc[status]) {
          acc[status] = { count: 0, amount: 0 };
        }
        acc[status].count++;
        acc[status].amount += parseFloat(booking.final_amount) || 0;
        return acc;
      }, {});

      // Top revenue sources (by booking source)
      const topRevenueSources = bookings.reduce((acc, booking) => {
        const source = booking.source || 'Direct';
        if (!acc[source]) {
          acc[source] = { count: 0, revenue: 0 };
        }
        acc[source].count++;
        acc[source].revenue += parseFloat(booking.final_amount) || 0;
        return acc;
      }, {});

      setDashboardData({
        totalRevenue,
        monthlyRevenue,
        pendingInvoices,
        overdueInvoices,
        totalBookings,
        occupancyRate,
        averageBookingValue,
        recentTransactions,
        topRevenueSources: Object.entries(topRevenueSources)
          .map(([source, data]) => ({ source, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
        paymentStatusBreakdown: Object.entries(paymentStatusBreakdown)
          .map(([status, data]) => ({ status, ...data })),
        monthlyTrends: [] // Could be implemented with historical data
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (bookingId) => {
    try {
      const response = await apiClient.post(`/invoices/generate/${bookingId}`);
      
      if (response.data.success) {
        toast.success('Invoice generated successfully');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const handleRecordPayment = async (bookingId, amount, method) => {
    try {
      const response = await apiClient.post('/payments', {
        booking_id: bookingId,
        amount: amount,
        payment_method: method,
        notes: 'Payment recorded from dashboard'
      });
      
      if (response.data.success) {
        toast.success('Payment recorded successfully');
        setShowPaymentModal(false);
        setSelectedBooking(null);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading && dashboardData.totalBookings === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accountant dashboard...</p>
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
                <Calculator className="h-8 w-8 text-green-600" />
                Accountant Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Financial overview, invoicing, and payment management
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
                onClick={() => setShowInvoiceModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Overview Cards */}
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
                <TrendingUp className="h-6 w-6 text-blue-600" />
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
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <Receipt className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  RWF {dashboardData.averageBookingValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Transactions
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentTransactions.map((booking) => (
                      <tr key={booking.booking_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{booking.booking_reference}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.guest_name}</div>
                          <div className="text-sm text-gray-500">{booking.guest_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            RWF {parseFloat(booking.final_amount).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
                            {booking.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.payment_status)}`}>
                            {booking.payment_status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowPaymentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleGenerateInvoice(booking.booking_id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Payment Status
                </h3>
              </div>
              <div className="p-6">
                {dashboardData.paymentStatusBreakdown.map((status) => (
                  <div key={status.status} className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        status.status === 'paid' ? 'bg-green-500' :
                        status.status === 'pending' ? 'bg-yellow-500' :
                        status.status === 'overdue' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {status.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {status.count}
                      </div>
                      <div className="text-xs text-gray-500">
                        RWF {status.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Revenue Sources */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Top Revenue Sources
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.topRevenueSources.map((source) => (
                  <div key={source.source} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{source.source}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        Bookings: <span className="font-medium">{source.count}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Revenue: <span className="font-medium">RWF {source.revenue.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Booking: #{selectedBooking.booking_reference}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Amount: RWF {parseFloat(selectedBooking.final_amount).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRecordPayment(
                  selectedBooking.booking_id, 
                  selectedBooking.final_amount, 
                  'cash'
                )}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantDashboard;
