import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  ChefHat,
  Clock,
  CheckCircle,
  Loader2,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export const RestaurantDashboard = () => {
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
    activeOrdersCount: 12,
    ordersInKitchen: 8,
    completedToday: 45,
    revenueToday: 4500000,
    activeOrders: [
      { id: 1, table: 'Table 5', items: 3, status: 'preparing', orderTime: '10 min ago', total: 125000 },
      { id: 2, table: 'Room 302', items: 2, status: 'ready', orderTime: '5 min ago', total: 85000 },
      { id: 3, table: 'Table 12', items: 5, status: 'preparing', orderTime: '15 min ago', total: 250000 },
      { id: 4, table: 'Room 105', items: 1, status: 'new', orderTime: '2 min ago', total: 45000 },
    ],
    kitchenQueue: [
      { id: 1, item: 'Grilled Tilapia', quantity: 2, table: 'Table 5', priority: 'high', prepTime: '15 min' },
      { id: 2, item: 'Chicken Curry', quantity: 1, table: 'Room 302', priority: 'medium', prepTime: '20 min' },
      { id: 3, item: 'Ubugali & Stew', quantity: 3, table: 'Table 12', priority: 'high', prepTime: '25 min' },
    ],
    tableStatus: {
      occupied: 18,
      available: 7,
      reserved: 3,
      total: 28
    },
    popularItems: [
      { name: 'Ubugali & Stew', orders: 23, revenue: 575000 },
      { name: 'Grilled Tilapia', orders: 18, revenue: 720000 },
      { name: 'Chicken Curry', orders: 15, revenue: 525000 },
      { name: 'Beef Brochettes', orders: 12, revenue: 480000 },
    ],
    recentActivity: [
      { action: 'Order completed', detail: 'Table 8 - 3 items', time: '2 min ago', type: 'success' },
      { action: 'New order', detail: 'Room 105 - Room service', time: '2 min ago', type: 'info' },
      { action: 'Order cancelled', detail: 'Table 3 - Customer left', time: '15 min ago', type: 'warning' },
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Restaurant & Kitchen Dashboard</h1>
            <p className="text-purple-100 mt-1 text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Welcome</p>
            <p className="font-semibold">{user?.name || 'Restaurant Staff'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 bg-gray-50">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Orders"
            value={dashboardData.activeOrdersCount}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="In Kitchen"
            value={dashboardData.ordersInKitchen}
            icon={ChefHat}
            color="orange"
          />
          <StatCard
            title="Completed Today"
            value={dashboardData.completedToday}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Revenue Today"
            value={`RWF ${(dashboardData.revenueToday / 1000).toFixed(0)}k`}
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Active Orders
          </h3>
          <div className="space-y-3">
            {dashboardData.activeOrders.map((order) => (
              <div key={order.id} className={`p-3 rounded-lg border-l-4 ${
                order.status === 'new'
                  ? 'bg-blue-50 border-blue-500'
                  : order.status === 'preparing'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-900">{order.table}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'new'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'preparing'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">RWF {order.total.toLocaleString()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Items: <span className="font-medium">{order.items}</span></div>
                  <div>Ordered: <span className="font-medium">{order.orderTime}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kitchen Queue */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-600" />
              Kitchen Queue
            </h3>
            <div className="space-y-3">
              {dashboardData.kitchenQueue.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{item.item}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>Qty: <span className="font-medium">{item.quantity}</span></div>
                    <div>Table: <span className="font-medium">{item.table}</span></div>
                    <div>Time: <span className="font-medium">{item.prepTime}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Items */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Popular Items Today
            </h3>
            <div className="space-y-3">
              {dashboardData.popularItems.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm font-semibold text-green-600">
                      RWF {item.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Orders: <span className="font-medium">{item.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Status Overview */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Table Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{dashboardData.tableStatus.occupied}</div>
              <div className="text-sm text-red-700">Occupied</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{dashboardData.tableStatus.available}</div>
              <div className="text-sm text-green-700">Available</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.tableStatus.reserved}</div>
              <div className="text-sm text-blue-700">Reserved</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{dashboardData.tableStatus.total}</div>
              <div className="text-sm text-gray-700">Total Tables</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.detail}</div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm p-4 border border-purple-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Today's Performance
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-900">{dashboardData.completedToday}</div>
              <div className="text-sm text-purple-700">Orders Served</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">RWF {(dashboardData.revenueToday / 1000).toFixed(0)}k</div>
              <div className="text-sm text-purple-700">Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">18 min</div>
              <div className="text-sm text-purple-700">Avg. Prep Time</div>
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
