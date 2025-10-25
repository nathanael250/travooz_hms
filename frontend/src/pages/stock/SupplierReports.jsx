import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Eye,
  FileText,
  Star,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

const SupplierReports = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report data
  const [supplierData, setSupplierData] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalOrders: 0,
    totalValue: 0,
    averageOrderValue: 0,
    deliverySuccessRate: 0,
    supplierPerformance: [],
    orderTrends: [],
    deliveryPerformance: [],
    supplierRankings: []
  });
  
  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [performanceFilter, setPerformanceFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [dateRange, performanceFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch supplier performance data
      const [performanceResponse, ordersResponse, suppliersResponse] = await Promise.allSettled([
        apiClient.get('/supplier-performance', {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        }),
        apiClient.get('/stock/orders'),
        apiClient.get('/stock/suppliers')
      ]);

      // Process supplier performance data
      if (performanceResponse.status === 'fulfilled') {
        const data = performanceResponse.value.data?.data || performanceResponse.value.data || {};
        setSupplierData(data);
      } else {
        console.warn('Failed to fetch supplier performance:', performanceResponse.reason);
        // Set mock data for demonstration
        setSupplierData({
          totalSuppliers: 8,
          activeSuppliers: 6,
          totalOrders: 45,
          totalValue: 125000,
          averageOrderValue: 2777.78,
          deliverySuccessRate: 87.5,
          supplierPerformance: generateMockSupplierPerformance(),
          orderTrends: generateMockOrderTrends(),
          deliveryPerformance: generateMockDeliveryPerformance(),
          supplierRankings: generateMockSupplierRankings()
        });
      }

    } catch (err) {
      console.error('Error fetching supplier data:', err);
      setError('Failed to load supplier reports');
      // Set mock data for demonstration
      setSupplierData({
        totalSuppliers: 8,
        activeSuppliers: 6,
        totalOrders: 45,
        totalValue: 125000,
        averageOrderValue: 2777.78,
        deliverySuccessRate: 87.5,
        supplierPerformance: generateMockSupplierPerformance(),
        orderTrends: generateMockOrderTrends(),
        deliveryPerformance: generateMockDeliveryPerformance(),
        supplierRankings: generateMockSupplierRankings()
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators
  const generateMockSupplierPerformance = () => [
    { name: 'Hotel Supplies Co.', orders: 15, value: 45000, successRate: 93.3, avgDeliveryTime: 2.5 },
    { name: 'Kitchen Essentials Ltd.', orders: 12, value: 35000, successRate: 91.7, avgDeliveryTime: 3.2 },
    { name: 'Luxury Amenities Inc.', orders: 10, value: 30000, successRate: 90.0, avgDeliveryTime: 2.8 },
    { name: 'Maintenance Solutions', orders: 8, value: 15000, successRate: 87.5, avgDeliveryTime: 4.1 }
  ];

  const generateMockOrderTrends = () => [
    { month: 'Jan', orders: 8, value: 20000 },
    { month: 'Feb', orders: 12, value: 30000 },
    { month: 'Mar', orders: 15, value: 35000 },
    { month: 'Apr', orders: 10, value: 25000 },
    { month: 'May', orders: 18, value: 40000 },
    { month: 'Jun', orders: 20, value: 45000 }
  ];

  const generateMockDeliveryPerformance = () => [
    { name: 'On Time', value: 35, color: '#82ca9d' },
    { name: 'Early', value: 8, color: '#8884d8' },
    { name: 'Late', value: 5, color: '#ffc658' },
    { name: 'Delayed', value: 2, color: '#ff7300' }
  ];

  const generateMockSupplierRankings = () => [
    { name: 'Hotel Supplies Co.', score: 95, rating: 5, orders: 15, value: 45000 },
    { name: 'Kitchen Essentials Ltd.', score: 92, rating: 5, orders: 12, value: 35000 },
    { name: 'Luxury Amenities Inc.', score: 88, rating: 4, orders: 10, value: 30000 },
    { name: 'Maintenance Solutions', score: 85, rating: 4, orders: 8, value: 15000 },
    { name: 'Office Supplies Pro', score: 78, rating: 3, orders: 5, value: 8000 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading supplier reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                <Users className="h-8 w-8 text-blue-600" />
                Supplier Reports & Performance
              </h1>
              <p className="text-gray-600 mt-1">
                Analyze supplier performance, delivery metrics, and procurement insights
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => toast.success('Export feature coming soon!')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Performance</option>
              <option value="excellent">Excellent (90%+)</option>
              <option value="good">Good (80-89%)</option>
              <option value="average">Average (70-79%)</option>
                <option value="poor">Poor (&lt;70%)</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supplierData.totalSuppliers}
                </p>
                <p className="text-xs text-gray-500">
                  {supplierData.activeSuppliers} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supplierData.totalOrders}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(supplierData.totalValue)} value
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(supplierData.averageOrderValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivery Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {supplierData.deliverySuccessRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Trends (6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={supplierData.orderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'value' ? formatCurrency(value) : value,
                  name === 'value' ? 'Value' : 'Orders'
                ]} />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} name="Orders" />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} name="Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Delivery Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={supplierData.deliveryPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {supplierData.deliveryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierData.supplierPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'value' ? formatCurrency(value) : value,
                name === 'value' ? 'Value' : name === 'successRate' ? 'Success Rate (%)' : name
              ]} />
              <Bar dataKey="orders" fill="#8884d8" name="Orders" />
              <Bar dataKey="successRate" fill="#82ca9d" name="Success Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier Rankings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Supplier Rankings & Ratings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplierData.supplierRankings.map((supplier, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-semibold ${getPerformanceColor(supplier.score)}`}>
                          {supplier.score}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRatingStars(supplier.rating)}
                        <span className="text-xs text-gray-500 ml-1">({supplier.rating}/5)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(supplier.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toast.success(`Viewing details for ${supplier.name}`)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                        <button
                          onClick={() => toast.success(`Generating report for ${supplier.name}`)}
                          className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded text-xs flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Report
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
    </div>
  );
};

export default SupplierReports;
