import React, { useEffect, useState } from 'react';
import {
  Boxes,
  Package,
  AlertTriangle,
  TrendingUp,
  Loader2,
  ShoppingBag,
  Truck,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export const InventoryDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - replace with API call
  const dashboardData = {
    totalItems: 1250,
    lowStockItems: 8,
    totalValue: 182100000,
    pendingOrders: 5,
    lowStockAlerts: [
      { id: 1, item: 'Bed Sheets (Queen)', category: 'Linens', current: 32, minimum: 40, unit: 'pcs', status: 'critical' },
      { id: 2, item: 'Toilet Paper', category: 'Toiletries', current: 28, minimum: 50, unit: 'rolls', status: 'critical' },
      { id: 3, item: 'Bath Towels', category: 'Linens', current: 45, minimum: 50, unit: 'pcs', status: 'low' },
      { id: 4, item: 'Coffee Beans', category: 'Food', current: 15, minimum: 20, unit: 'kg', status: 'low' },
      { id: 5, item: 'Disinfectant Spray', category: 'Cleaning', current: 18, minimum: 25, unit: 'bottles', status: 'low' },
    ],
    categoryBreakdown: {
      linens: { count: 450, value: 56250000, lowStock: 2 },
      toiletries: { count: 320, value: 16000000, lowStock: 3 },
      food: { count: 180, value: 44500000, lowStock: 1 },
      beverages: { count: 150, value: 35625000, lowStock: 1 },
      cleaning: { count: 100, value: 19000000, lowStock: 1 },
      other: { count: 50, value: 10725000, lowStock: 0 }
    },
    recentMovements: [
      { id: 1, item: 'Bath Towels', type: 'out', quantity: 12, department: 'Housekeeping', time: '10 min ago' },
      { id: 2, item: 'Coffee Beans', type: 'in', quantity: 25, supplier: 'Java Supplies', time: '1 hour ago' },
      { id: 3, item: 'Disinfectant', type: 'out', quantity: 5, department: 'Maintenance', time: '2 hours ago' },
      { id: 4, item: 'Bed Sheets', type: 'in', quantity: 50, supplier: 'LinenMax', time: '3 hours ago' },
    ],
    pendingPurchaseOrders: [
      { id: 1, supplier: 'CleanCorp', items: 15, total: 4500000, status: 'pending', deliveryDate: '2025-01-20' },
      { id: 2, supplier: 'LinenMax', items: 8, total: 6200000, status: 'approved', deliveryDate: '2025-01-22' },
      { id: 3, supplier: 'Java Supplies', items: 12, total: 3800000, status: 'pending', deliveryDate: '2025-01-25' },
    ],
    topConsumption: [
      { item: 'Towels', consumed: 85, trend: 'up' },
      { item: 'Bed Sheets', consumed: 62, trend: 'up' },
      { item: 'Toiletries', consumed: 120, trend: 'stable' },
      { item: 'Cleaning Supplies', consumed: 45, trend: 'down' },
    ]
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
            <h1 className="text-xl font-bold">Inventory & Stock Dashboard</h1>
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
            <p className="font-semibold">{user?.name || 'Inventory Staff'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 bg-gray-50">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Items"
            value={dashboardData.totalItems.toLocaleString()}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Low Stock Items"
            value={dashboardData.lowStockItems}
            icon={AlertTriangle}
            color="orange"
          />
          <StatCard
            title="Total Value"
            value={`RWF ${(dashboardData.totalValue / 1000000).toFixed(1)}M`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Pending Orders"
            value={dashboardData.pendingOrders}
            icon={ShoppingBag}
            color="purple"
          />
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-orange-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Low Stock Alerts ({dashboardData.lowStockAlerts.length})
          </h3>
          <div className="space-y-3">
            {dashboardData.lowStockAlerts.map((item) => (
              <div key={item.id} className={`p-3 rounded-lg border-l-4 ${
                item.status === 'critical'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{item.item}</div>
                    <div className="text-sm text-gray-600">{item.category}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>Current: <span className="font-medium text-red-600">{item.current} {item.unit}</span></div>
                  <div>Minimum: <span className="font-medium">{item.minimum} {item.unit}</span></div>
                  <div>Shortage: <span className="font-medium text-red-600">{item.minimum - item.current} {item.unit}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Stock by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(dashboardData.categoryBreakdown).map(([key, categoryData]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">{key}</span>
                  {categoryData.lowStock > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                      {categoryData.lowStock} low
                    </span>
                  )}
                </div>
                <div className="mb-1">
                  <div className="text-2xl font-bold text-blue-600">{categoryData.count}</div>
                  <div className="text-xs text-gray-600">items</div>
                </div>
                <div className="text-sm font-semibold text-green-600">
                  RWF {(categoryData.value / 1000000).toFixed(1)}M
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Movements */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Recent Stock Movements
            </h3>
            <div className="space-y-3">
              {dashboardData.recentMovements.map((movement) => (
                <div key={movement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{movement.item}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      movement.type === 'in'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>Qty: <span className="font-medium">{movement.quantity}</span></div>
                    <div className="col-span-2">
                      {movement.type === 'in' ? 'Supplier' : 'Dept'}:
                      <span className="font-medium ml-1">
                        {movement.type === 'in' ? movement.supplier : movement.department}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{movement.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Purchase Orders */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-600" />
              Pending Purchase Orders
            </h3>
            <div className="space-y-3">
              {dashboardData.pendingPurchaseOrders.map((order) => (
                <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{order.supplier}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="text-sm font-semibold text-purple-600">
                      RWF {order.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Items: <span className="font-medium">{order.items}</span></div>
                    <div>Delivery: <span className="font-medium">{order.deliveryDate}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Consumption */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            Top Consumption (This Week)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData.topConsumption.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{item.consumed}</div>
                <div className="text-sm text-gray-900 font-medium mt-1">{item.item}</div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className={`h-3 w-3 ${
                    item.trend === 'up' ? 'text-red-500' :
                    item.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    item.trend === 'up' ? 'text-red-600' :
                    item.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-4 border border-blue-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Boxes className="h-5 w-5 text-blue-600" />
            Inventory Summary
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-900">{dashboardData.totalItems.toLocaleString()}</div>
              <div className="text-sm text-blue-700">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">RWF {(dashboardData.totalValue / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-blue-700">Stock Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">6</div>
              <div className="text-sm text-blue-700">Categories</div>
            </div>
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
    purple: { bg: 'bg-purple-500', border: 'border-purple-200' }
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
