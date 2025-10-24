import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Truck,
  ShoppingCart,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

export const StorekeeperDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStockValue: 0,
    lowStockAlerts: 0,
    recentDeliveries: 0,
    monthlyUsage: 0,
    totalItems: 0,
    activeSuppliers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockItems: [],
    recentDeliveriesList: [],
    monthlyUsageData: [],
    topSuppliers: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchStockData();
    
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(fetchStockData, 300000);
    
    return () => {
      clearInterval(timer);
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple stock data sources in parallel
      const [
        stockItemsResponse,
        suppliersResponse,
        purchaseOrdersResponse,
        usageLogsResponse
      ] = await Promise.allSettled([
        apiClient.get('/stock-items'),
        apiClient.get('/stock-suppliers'),
        apiClient.get('/stock-orders'),
        apiClient.get('/stock-usage-logs')
      ]);

      // Process stock items data
      let stockItems = [];
      if (stockItemsResponse.status === 'fulfilled') {
        stockItems = stockItemsResponse.value.data?.data || stockItemsResponse.value.data || [];
      }

      // Process suppliers data
      let suppliers = [];
      if (suppliersResponse.status === 'fulfilled') {
        suppliers = suppliersResponse.value.data?.data || suppliersResponse.value.data || [];
      }

      // Process purchase orders data
      let purchaseOrders = [];
      if (purchaseOrdersResponse.status === 'fulfilled') {
        purchaseOrders = purchaseOrdersResponse.value.data?.data || purchaseOrdersResponse.value.data || [];
      }

      // Process usage logs data
      let usageLogs = [];
      if (usageLogsResponse.status === 'fulfilled') {
        usageLogs = usageLogsResponse.value.data?.data || usageLogsResponse.value.data || [];
      }

      // Calculate dashboard metrics
      const totalStockValue = stockItems.reduce((sum, item) => {
        return sum + (parseFloat(item.current_quantity || 0) * parseFloat(item.unit_price || 0));
      }, 0);

      const lowStockItems = stockItems.filter(item => 
        parseFloat(item.current_quantity || 0) <= parseFloat(item.reorder_threshold || 0)
      );

      const lowStockAlerts = lowStockItems.length;

      // Calculate recent deliveries (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentDeliveries = purchaseOrders.filter(order => 
        order.status === 'received' && 
        new Date(order.delivery_date || order.created_at) >= sevenDaysAgo
      ).length;

      // Calculate monthly usage
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      
      const monthlyUsage = usageLogs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate.getMonth() === thisMonth && logDate.getFullYear() === thisYear;
      }).reduce((sum, log) => sum + parseFloat(log.quantity_used || 0), 0);

      const totalItems = stockItems.length;
      const activeSuppliers = suppliers.filter(supplier => supplier.status === 'active').length;
      const pendingOrders = purchaseOrders.filter(order => order.status === 'pending').length;
      const completedOrders = purchaseOrders.filter(order => order.status === 'received').length;

      // Process recent deliveries list
      const recentDeliveriesList = purchaseOrders
        .filter(order => order.status === 'received')
        .slice(0, 5)
        .map(order => ({
          id: order.order_id,
          supplier: order.supplier_name || 'Unknown Supplier',
          items: order.items_count || 0,
          date: order.delivery_date || order.created_at,
          status: order.status
        }));

      // Generate monthly usage data (last 6 months)
      const monthlyUsageData = generateMonthlyUsageData(usageLogs);

      // Calculate top suppliers
      const topSuppliers = calculateTopSuppliers(purchaseOrders, suppliers);

      setDashboardData({
        totalStockValue,
        lowStockAlerts,
        recentDeliveries,
        monthlyUsage,
        totalItems,
        activeSuppliers,
        pendingOrders,
        completedOrders,
        lowStockItems: lowStockItems.slice(0, 5),
        recentDeliveriesList,
        monthlyUsageData,
        topSuppliers
      });

    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to load stock dashboard data');
      
      // Set default empty data to prevent crashes
      setDashboardData({
        totalStockValue: 0,
        lowStockAlerts: 0,
        recentDeliveries: 0,
        monthlyUsage: 0,
        totalItems: 0,
        activeSuppliers: 0,
        pendingOrders: 0,
        completedOrders: 0,
        lowStockItems: [],
        recentDeliveriesList: [],
        monthlyUsageData: [],
        topSuppliers: []
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyUsageData = (usageLogs) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      const monthLogs = usageLogs.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate.getMonth() === monthIndex;
      });
      
      const usage = monthLogs.reduce((sum, log) => sum + parseFloat(log.quantity_used || 0), 0);
      
      return {
        month,
        usage
      };
    });
  };

  const calculateTopSuppliers = (purchaseOrders, suppliers) => {
    const supplierStats = {};
    
    purchaseOrders.forEach(order => {
      const supplierId = order.supplier_id;
      if (!supplierStats[supplierId]) {
        supplierStats[supplierId] = {
          id: supplierId,
          name: order.supplier_name || 'Unknown',
          orders: 0,
          totalValue: 0
        };
      }
      supplierStats[supplierId].orders += 1;
      supplierStats[supplierId].totalValue += parseFloat(order.total_amount || 0);
    });

    return Object.values(supplierStats)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stock dashboard...</p>
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
            onClick={fetchStockData}
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Stock Management Dashboard</h1>
            <p className="text-blue-100 mt-1 text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Welcome</p>
            <p className="font-semibold">{user?.name || 'Storekeeper'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Stock Value"
            value={`RWF ${(dashboardData.totalStockValue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Low Stock Alerts"
            value={dashboardData.lowStockAlerts}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Recent Deliveries"
            value={dashboardData.recentDeliveries}
            icon={Truck}
            color="blue"
          />
          <StatCard
            title="Monthly Usage"
            value={dashboardData.monthlyUsage}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Items"
            value={dashboardData.totalItems}
            icon={Package}
            color="indigo"
          />
          <StatCard
            title="Active Suppliers"
            value={dashboardData.activeSuppliers}
            icon={ShoppingCart}
            color="orange"
          />
          <StatCard
            title="Pending Orders"
            value={dashboardData.pendingOrders}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Completed Orders"
            value={dashboardData.completedOrders}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Low Stock Alerts
            </h3>
            <div className="space-y-3">
              {dashboardData.lowStockItems.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">No low stock alerts</p>
                </div>
              ) : (
                dashboardData.lowStockItems.map((item) => (
                  <div key={item.item_id} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      <div className="text-sm font-semibold text-red-600">
                        {item.current_quantity} {item.unit}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Threshold: {item.reorder_threshold} {item.unit}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Recent Deliveries
            </h3>
            <div className="space-y-3">
              {dashboardData.recentDeliveriesList.length === 0 ? (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No recent deliveries</p>
                </div>
              ) : (
                dashboardData.recentDeliveriesList.map((delivery) => (
                  <div key={delivery.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{delivery.supplier}</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {delivery.items} items
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {getTimeAgo(delivery.date)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Top Suppliers
          </h3>
          <div className="space-y-3">
            {dashboardData.topSuppliers.length === 0 ? (
              <div className="text-center py-4">
                <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No supplier data available</p>
              </div>
            ) : (
              dashboardData.topSuppliers.map((supplier, index) => (
                <div key={supplier.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600">#{index + 1}</span>
                      </div>
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                    </div>
                    <div className="text-sm font-semibold text-purple-600">
                      RWF {(supplier.totalValue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {supplier.orders} orders
                  </div>
                </div>
              ))
            )}
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
    red: { bg: 'bg-red-500', border: 'border-red-200' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-200' },
    indigo: { bg: 'bg-indigo-500', border: 'border-indigo-200' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-200' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-200' }
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
