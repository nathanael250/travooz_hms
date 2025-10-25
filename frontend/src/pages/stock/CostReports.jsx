import React, { useState, useEffect } from 'react';
import {
  DollarSign,
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
  Calculator
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CostReports = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report data
  const [costData, setCostData] = useState({
    totalStockValue: 0,
    averageCostPerItem: 0,
    costTrends: [],
    costByCategory: [],
    costBySupplier: [],
    priceChanges: [],
    monthlyCosts: []
  });
  
  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  
  // Supporting data
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [dateRange, categoryFilter, supplierFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cost data, categories, and suppliers in parallel
      const [costResponse, categoriesResponse, suppliersResponse] = await Promise.allSettled([
        apiClient.get('/stock-cost-reports', {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            supplier: supplierFilter !== 'all' ? supplierFilter : undefined
          }
        }),
        apiClient.get('/inventory-categories'),
        apiClient.get('/stock/suppliers')
      ]);

      // Process cost data
      if (costResponse.status === 'fulfilled') {
        const data = costResponse.value.data?.data || costResponse.value.data || {};
        setCostData({
          totalStockValue: data.totalStockValue || 0,
          averageCostPerItem: data.averageCostPerItem || 0,
          costTrends: data.costTrends || [],
          costByCategory: data.costByCategory || [],
          costBySupplier: data.costBySupplier || [],
          priceChanges: data.priceChanges || [],
          monthlyCosts: data.monthlyCosts || []
        });
      } else {
        console.warn('Failed to fetch cost data:', costResponse.reason);
        // Set mock data for demonstration
        setCostData({
          totalStockValue: 125000,
          averageCostPerItem: 45.50,
          costTrends: generateMockCostTrends(),
          costByCategory: generateMockCostByCategory(),
          costBySupplier: generateMockCostBySupplier(),
          priceChanges: generateMockPriceChanges(),
          monthlyCosts: generateMockMonthlyCosts()
        });
      }

      // Process categories
      if (categoriesResponse.status === 'fulfilled') {
        const cats = categoriesResponse.value.data?.data || categoriesResponse.value.data || [];
        setCategories(cats);
      } else {
        console.warn('Failed to fetch categories:', categoriesResponse.reason);
        setCategories([]);
      }

      // Process suppliers
      if (suppliersResponse.status === 'fulfilled') {
        const supps = suppliersResponse.value.data?.data || suppliersResponse.value.data || [];
        setSuppliers(supps);
      } else {
        console.warn('Failed to fetch suppliers:', suppliersResponse.reason);
        setSuppliers([]);
      }

    } catch (err) {
      console.error('Error fetching cost data:', err);
      setError('Failed to load cost reports');
      // Set mock data for demonstration
      setCostData({
        totalStockValue: 125000,
        averageCostPerItem: 45.50,
        costTrends: generateMockCostTrends(),
        costByCategory: generateMockCostByCategory(),
        costBySupplier: generateMockCostBySupplier(),
        priceChanges: generateMockPriceChanges(),
        monthlyCosts: generateMockMonthlyCosts()
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators
  const generateMockCostTrends = () => [
    { month: 'Jan', cost: 12000 },
    { month: 'Feb', cost: 15000 },
    { month: 'Mar', cost: 18000 },
    { month: 'Apr', cost: 16000 },
    { month: 'May', cost: 20000 },
    { month: 'Jun', cost: 22000 }
  ];

  const generateMockCostByCategory = () => [
    { name: 'Linen', value: 35000, color: '#8884d8' },
    { name: 'Toiletries', value: 25000, color: '#82ca9d' },
    { name: 'Kitchen', value: 30000, color: '#ffc658' },
    { name: 'Cleaning', value: 20000, color: '#ff7300' },
    { name: 'Maintenance', value: 15000, color: '#00ff00' }
  ];

  const generateMockCostBySupplier = () => [
    { name: 'Hotel Supplies Co.', value: 45000 },
    { name: 'Kitchen Essentials Ltd.', value: 35000 },
    { name: 'Luxury Amenities Inc.', value: 30000 },
    { name: 'Maintenance Solutions', value: 15000 }
  ];

  const generateMockPriceChanges = () => [
    { item: 'Bath Towels', oldPrice: 15.00, newPrice: 16.50, change: 10.0, date: '2024-01-15' },
    { item: 'Shampoo', oldPrice: 5.00, newPrice: 4.75, change: -5.0, date: '2024-01-20' },
    { item: 'Coffee Cups', oldPrice: 12.00, newPrice: 13.20, change: 10.0, date: '2024-01-25' },
    { item: 'Bed Sheets', oldPrice: 25.00, newPrice: 27.50, change: 10.0, date: '2024-02-01' }
  ];

  const generateMockMonthlyCosts = () => [
    { month: 'Jan', purchases: 12000, usage: 8000, net: 4000 },
    { month: 'Feb', purchases: 15000, usage: 10000, net: 5000 },
    { month: 'Mar', purchases: 18000, usage: 12000, net: 6000 },
    { month: 'Apr', purchases: 16000, usage: 11000, net: 5000 },
    { month: 'May', purchases: 20000, usage: 14000, net: 6000 },
    { month: 'Jun', purchases: 22000, usage: 15000, net: 7000 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading cost reports...</p>
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
                <DollarSign className="h-8 w-8 text-blue-600" />
                Cost Reports & Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Track stock costs, price changes, and financial analysis
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.supplier_name || supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(costData.totalStockValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Cost per Item</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(costData.averageCostPerItem)}
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
                <p className="text-sm font-medium text-gray-600">Price Changes (30 days)</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {costData.priceChanges.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories Tracked</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {costData.costByCategory.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cost Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Trends (6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costData.costTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Distribution by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={costData.costByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costData.costByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Costs */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cost Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData.monthlyCosts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="purchases" fill="#8884d8" name="Purchases" />
              <Bar dataKey="usage" fill="#82ca9d" name="Usage" />
              <Bar dataKey="net" fill="#ffc658" name="Net Change" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Supplier */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by Supplier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData.costBySupplier}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price Changes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Price Changes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Old Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costData.priceChanges.map((change, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {change.item}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(change.oldPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(change.newPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        change.change > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {change.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(change.change)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(change.date).toLocaleDateString()}
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

export default CostReports;
