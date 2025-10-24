import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Package,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const StockBalance = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Export state
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStockBalance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stockData, categoryFilter, supplierFilter, searchTerm, statusFilter]);

  const fetchStockBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/stock-items');
      const stockItems = response.data?.data || response.data || [];
      
      // Process stock balance data
      const balanceData = stockItems.map(item => ({
        ...item,
        stock_value: parseFloat(item.current_quantity || 0) * parseFloat(item.unit_price || 0),
        stock_status: getStockStatus(item),
        days_since_update: getDaysSinceUpdate(item.updated_at || item.created_at)
      }));
      
      setStockData(balanceData);
    } catch (err) {
      console.error('Error fetching stock balance:', err);
      setError('Failed to load stock balance data');
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stockData];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(item => item.supplier_id === supplierFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.stock_status === statusFilter);
    }

    setFilteredData(filtered);
  };

  const getStockStatus = (item) => {
    const quantity = parseFloat(item.current_quantity || 0);
    const threshold = parseFloat(item.reorder_threshold || 0);
    
    if (quantity <= threshold) return 'low';
    if (quantity <= threshold * 1.5) return 'medium';
    return 'good';
  };

  const getDaysSinceUpdate = (dateString) => {
    if (!dateString) return 0;
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = now - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'good': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'low': return 'Low Stock';
      case 'medium': return 'Medium Stock';
      case 'good': return 'Good Stock';
      default: return 'Unknown';
    }
  };

  const getCategories = () => {
    const categories = [...new Set(stockData.map(item => item.category).filter(Boolean))];
    return categories;
  };

  const getSuppliers = () => {
    const suppliers = [...new Set(stockData.map(item => item.supplier_id).filter(Boolean))];
    return suppliers;
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      
      const csvData = filteredData.map(item => ({
        'Item Name': item.item_name,
        'Category': item.category,
        'Current Quantity': item.current_quantity,
        'Unit': item.unit,
        'Unit Price': item.unit_price,
        'Stock Value': item.stock_value,
        'Reorder Threshold': item.reorder_threshold,
        'Stock Status': getStatusText(item.stock_status),
        'Days Since Update': item.days_since_update,
        'Description': item.description
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock-balance-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Stock balance exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const calculateTotals = () => {
    const totalItems = filteredData.length;
    const totalValue = filteredData.reduce((sum, item) => sum + item.stock_value, 0);
    const lowStockItems = filteredData.filter(item => item.stock_status === 'low').length;
    const averageValue = totalItems > 0 ? totalValue / totalItems : 0;

    return {
      totalItems,
      totalValue,
      lowStockItems,
      averageValue
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stock balance...</p>
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
            onClick={fetchStockBalance}
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
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Stock Balance Report
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time quantity tracking and stock value analysis
              </p>
            </div>
            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totals.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  RWF {(totals.totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{totals.lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  RWF {(totals.averageValue / 1000).toFixed(1)}K
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Suppliers</option>
              {getSuppliers().map(supplier => (
                <option key={supplier} value={supplier}>Supplier {supplier}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="low">Low Stock</option>
              <option value="medium">Medium Stock</option>
              <option value="good">Good Stock</option>
            </select>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Balance Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Stock Balance ({filteredData.length} items)
            </h3>
          </div>

          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.item_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.item_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.current_quantity} {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Threshold: {item.reorder_threshold}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RWF {parseFloat(item.unit_price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        RWF {item.stock_value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.stock_status)}`}>
                          {getStatusText(item.stock_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.days_since_update} days ago
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockBalance;
