import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  BarChart3, 
  Clock, 
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const InventoryDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    monthlyUsage: 0,
    pendingOrders: 0,
    recentMovements: [],
    lowStockAlerts: [],
    categoryBreakdown: [],
    monthlyTrends: []
  });
  const [error, setError] = useState(null);
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState('30'); // days
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [homestayFilter, setHomestayFilter] = useState('all');
  
  // Modal states
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
  }, [timeFilter, categoryFilter, homestayFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        itemsResponse,
        alertsResponse,
        movementsResponse,
        ordersResponse,
        usageResponse
      ] = await Promise.all([
        apiClient.get('/stock/items'),
        apiClient.get('/stock/alerts'),
        apiClient.get('/stock/movements', { params: { limit: 10 } }),
        apiClient.get('/stock/orders', { params: { status: 'pending' } }),
        apiClient.get('/stock/usage-logs', { params: { days: timeFilter } })
      ]);

      const items = itemsResponse.data || [];
      const alerts = alertsResponse.data || [];
      const movements = movementsResponse.data || [];
      const orders = ordersResponse.data || [];
      const usageLogs = usageResponse.data || [];

      // Calculate dashboard metrics
      const totalItems = items.length;
      const lowStockItems = alerts.filter(alert => alert.alert_status === 'low_stock').length;
      const outOfStockItems = alerts.filter(alert => alert.alert_status === 'out_of_stock').length;
      
      // Calculate total inventory value
      const totalValue = items.reduce((sum, item) => {
        return sum + (item.quantity * (item.unit_cost || 0));
      }, 0);

      // Calculate monthly usage
      const monthlyUsage = usageLogs.reduce((sum, log) => sum + log.quantity, 0);

      // Category breakdown
      const categoryBreakdown = items.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { count: 0, value: 0, quantity: 0 };
        }
        acc[category].count++;
        acc[category].quantity += item.quantity;
        acc[category].value += item.quantity * (item.unit_cost || 0);
        return acc;
      }, {});

      // Recent movements (last 10)
      const recentMovements = movements.slice(0, 10);

      setDashboardData({
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue,
        monthlyUsage,
        pendingOrders: orders.length,
        recentMovements,
        lowStockAlerts: alerts.slice(0, 5), // Top 5 alerts
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          ...data
        })),
        monthlyTrends: [] // Could be implemented with historical data
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReorder = async (item) => {
    try {
      const response = await apiClient.post('/stock/orders', {
        supplier_id: item.default_supplier_id,
        items: [{
          item_id: item.item_id,
          quantity_ordered: item.reorder_level * 2, // Order 2x reorder level
          unit_price: item.unit_cost || 0
        }],
        notes: `Quick reorder for ${item.name} - Low stock alert`
      });

      if (response.data.success) {
        toast.success(`Purchase order created for ${item.name}`);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error('Failed to create purchase order');
    }
  };

  const handleStockAdjustment = async (itemId, adjustmentType, quantity, reason) => {
    try {
      const response = await apiClient.post('/stock/movements', {
        item_id: itemId,
        movement_type: adjustmentType,
        quantity: quantity,
        notes: reason
      });

      if (response.data.success) {
        toast.success('Stock adjustment recorded successfully');
        setShowAdjustmentModal(false);
        setSelectedItem(null);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error recording stock adjustment:', error);
      toast.error('Failed to record stock adjustment');
    }
  };

  const getAlertColor = (status) => {
    switch (status) {
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'purchase': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'usage': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment': return <Package className="h-4 w-4 text-blue-600" />;
      case 'transfer': return <Users className="h-4 w-4 text-purple-600" />;
      case 'return': return <CheckCircle className="h-4 w-4 text-orange-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading && dashboardData.totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory dashboard...</p>
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
                <Package className="h-8 w-8 text-blue-600" />
                Inventory Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Complete stock management and purchase order tracking
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
                onClick={() => setShowQuickOrderModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Quick Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.outOfStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  RWF {dashboardData.totalValue.toLocaleString()}
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Toiletries">Toiletries</option>
              <option value="Linen">Linen</option>
            </select>

            <select
              value={homestayFilter}
              onChange={(e) => setHomestayFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {/* Add homestay options here */}
            </select>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Low Stock Alerts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Low Stock Alerts
                </h3>
              </div>
              <div className="p-6">
                {dashboardData.lowStockAlerts.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-500">No low stock alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.lowStockAlerts.map((alert) => (
                      <div key={alert.item_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{alert.name}</p>
                          <p className="text-sm text-gray-600">
                            {alert.current_quantity} {alert.unit} remaining
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAlertColor(alert.alert_status)}`}>
                            {alert.alert_status.replace('_', ' ').toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleQuickReorder(alert)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Reorder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Movements */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Recent Stock Movements
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentMovements.map((movement) => (
                      <tr key={movement.movement_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {movement.item?.name || 'Unknown Item'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.movement_type)}
                            <span className="text-sm text-gray-900 capitalize">
                              {movement.movement_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            movement.movement_type === 'purchase' || movement.movement_type === 'return' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {movement.movement_type === 'purchase' || movement.movement_type === 'return' ? '+' : '-'}
                            {movement.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Category Breakdown
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.categoryBreakdown.map((category) => (
                  <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{category.category}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        Items: <span className="font-medium">{category.count}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: <span className="font-medium">{category.quantity}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Value: <span className="font-medium">RWF {category.value.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Order Modal */}
      {showQuickOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Quick Purchase Order</h3>
            <p className="text-gray-600 mb-4">
              Create a purchase order for low stock items
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowQuickOrderModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Implement quick order logic
                  setShowQuickOrderModal(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
