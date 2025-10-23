import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Bed, 
  Users, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Star,
  UserCheck,
  ClipboardList,
  Utensils,
  Package,
  MessageSquare,
  Bell,
  Plus,
  BarChart3,
  Wrench,
  Sparkles,
  ShieldAlert,
  CreditCard,
  Receipt,
  Truck,
  ChefHat,
  Cloud,
  Wifi,
  Eye,
  Loader2,
  Banknote
} from 'lucide-react';
// Custom RWF icon
const RwfIcon = (props) => (
  <Banknote {...props} />
);
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '../services/api.service';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, use mock data to prevent API issues from causing auth loops
        // TODO: Uncomment when backend is stable
        // const response = await dashboardService.getDashboardData();
        // if (response.success) {
        //   setDashboardData(response.data);
        // } else {
        //   throw new Error(response.message || 'Failed to fetch dashboard data');
        // }
        
        // Use mock data for now
        setDashboardData(getMockData());
        
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError(error.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
        
        // Use fallback mock data if API fails
        setDashboardData(getMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data fallback function
  const getMockData = () => ({
    property: {
      name: "Classic resort lodge",
      location: "Kigali, Rwanda",
      totalRooms: 20,
      occupancyRate: 75,
      availableRooms: 30,
      occupiedRooms: 75,
      underMaintenance: 5,
      blocked: 10,
      revenueToday: 596000,
      revenueWeek: 111812500,
      revenueMonth: 406250000,
      activeStaff: 45,
      pendingRequests: 8
    },
    bookings: {
      newToday: 12,
      upcomingCheckins: 18,
      upcomingCheckouts: 15,
      cancelled: 3,
      sources: {
        website: 40,
        booking: 25,
        expedia: 20,
        walkin: 15
      },
      multiRoom: 7
    },
    rooms: {
      cleanedReady: 0,
      occupied: 4,
      underMaintenance: 0,
      blocked: 0
    },
    guests: [
      { id: 1, type: 'checkin', guest: 'John Smith', room: '205', time: '14:30', isVip: false },
      { id: 2, type: 'checkout', guest: 'Sarah Johnson', room: '301', time: '11:15', isVip: true },
      { id: 3, type: 'complaint', guest: 'Mike Wilson', room: '412', issue: 'AC not working', time: '09:45', isVip: false },
      { id: 4, type: 'review', guest: 'Emily Davis', rating: 5, time: '16:20', isVip: false }
    ],
    staff: {
      onDuty: 28,
      housekeeping: 12,
      frontDesk: 6,
      restaurant: 8,
      maintenance: 2,
      tasksCompleted: 45,
      tasksPending: 12,
      alertsCount: 3
    },
    financial: {
      revenueToday: 19600000,
      outstandingInvoices: 31750000,
      recentPayments: 11187500,
      sources: {
        rooms: 65,
        restaurant: 25,
        services: 10
      },
      monthlyRevenue: [
        { month: 'Jan', revenue: 320000000, target: 300000000 },
        { month: 'Feb', revenue: 280000000, target: 300000000 },
        { month: 'Mar', revenue: 350000000, target: 300000000 },
        { month: 'Apr', revenue: 410000000, target: 350000000 },
        { month: 'May', revenue: 380000000, target: 350000000 },
        { month: 'Jun', revenue: 400000000, target: 400000000 }
      ]
    },
    restaurant: {
      tablesOccupied: 18,
      totalTables: 25,
      ordersToday: 145,
      revenueToday: 4900000,
      popularDishes: [
        { name: 'Ubugali & Stew', orders: 23 },
        { name: 'Grilled Tilapia', orders: 18 },
        { name: 'Chicken Curry', orders: 15 }
      ]
    },
    inventory: {
      lowStock: [
        { item: 'Toilet Paper', current: 15, minimum: 50, status: 'critical' },
        { item: 'Towels', current: 25, minimum: 30, status: 'low' },
        { item: 'Bed Sheets', current: 35, minimum: 40, status: 'low' }
      ],
      recentDeliveries: [
        { supplier: 'CleanCorp', items: 'Cleaning Supplies', date: '2024-01-15', status: 'delivered' },
        { supplier: 'LinenMax', items: 'Towels & Sheets', date: '2024-01-14', status: 'pending' }
      ]
    },
    requests: [
      { id: 1, guest: 'Room 304', type: 'housekeeping', request: 'Extra towels', time: '10:30', priority: 'medium', status: 'pending' },
      { id: 2, guest: 'Room 507', type: 'maintenance', request: 'Leaky faucet', time: '09:15', priority: 'high', status: 'in-progress' },
      { id: 3, guest: 'Room 201', type: 'room-service', request: 'Late checkout', time: '08:45', priority: 'low', status: 'completed' }
    ],
    notifications: [
      { id: 1, type: 'booking', message: 'New reservation for tomorrow', time: '2 minutes ago', priority: 'medium' },
      { id: 2, type: 'maintenance', message: 'HVAC system requires attention', time: '15 minutes ago', priority: 'high' },
      { id: 3, type: 'guest', message: 'VIP guest checking in at 3 PM', time: '1 hour ago', priority: 'high' }
    ],
    stockSummary: {
      totalValue: 182100000,
      totalItems: 1250,
      categories: {
        linens: { count: 450, value: 56250000, lowStock: 2 },
        toiletries: { count: 320, value: 16000000, lowStock: 3 },
        food: { count: 180, value: 44500000, lowStock: 1 },
        beverages: { count: 150, value: 35625000, lowStock: 1 },
        cleaning: { count: 100, value: 19000000, lowStock: 1 },
        other: { count: 50, value: 10725000, lowStock: 0 }
      },
      recentItems: [
        { id: 1, name: 'Bath Towels', category: 'Linens', quantity: 45, unit: 'pcs', value: 2812500, status: 'low', reorderPoint: 50 },
        { id: 2, name: 'Bed Sheets (Queen)', category: 'Linens', quantity: 32, unit: 'pcs', value: 4000000, status: 'critical', reorderPoint: 40 },
        { id: 3, name: 'Shampoo Bottles', category: 'Toiletries', quantity: 85, unit: 'bottles', value: 1062500, status: 'ok', reorderPoint: 30 },
        { id: 4, name: 'Toilet Paper', category: 'Toiletries', quantity: 28, unit: 'rolls', value: 350000, status: 'critical', reorderPoint: 50 },
        { id: 5, name: 'Coffee Beans', category: 'Food', quantity: 15, unit: 'kg', value: 937500, status: 'low', reorderPoint: 20 },
        { id: 6, name: 'Orange Juice', category: 'Beverages', quantity: 42, unit: 'liters', value: 525000, status: 'ok', reorderPoint: 25 },
        { id: 7, name: 'Disinfectant Spray', category: 'Cleaning', quantity: 18, unit: 'bottles', value: 450000, status: 'low', reorderPoint: 25 },
        { id: 8, name: 'Hand Soap', category: 'Toiletries', quantity: 95, unit: 'bottles', value: 593750, status: 'ok', reorderPoint: 40 }
      ]
    },
    chartData: {
      bookingTrends: [
        { day: 'Mon', bookings: 12, revenue: 15000000 },
        { day: 'Tue', bookings: 15, revenue: 18750000 },
        { day: 'Wed', bookings: 10, revenue: 12500000 },
        { day: 'Thu', bookings: 18, revenue: 22500000 },
        { day: 'Fri', bookings: 22, revenue: 27500000 },
        { day: 'Sat', bookings: 25, revenue: 31250000 },
        { day: 'Sun', bookings: 20, revenue: 25000000 }
      ],
      revenueBreakdown: [
        { name: 'Rooms', value: 65, amount: 127400000 },
        { name: 'Restaurant', value: 25, amount: 49000000 },
        { name: 'Laundry', value: 5, amount: 9800000 },
        { name: 'Other', value: 5, amount: 9800000 }
      ],
      roomOccupancy: [
        { name: 'Occupied', value: 75, color: '#3B82F6' },
        { name: 'Available', value: 30, color: '#10B981' },
        { name: 'Maintenance', value: 5, color: '#F59E0B' },
        { name: 'Blocked', value: 10, color: '#EF4444' }
      ],
      housekeepingTasks: [
        { status: 'Completed', count: 45 },
        { status: 'In Progress', count: 12 },
        { status: 'Pending', count: 8 }
      ],
      inventoryConsumption: [
        { item: 'Towels', consumed: 85 },
        { item: 'Bed Sheets', consumed: 62 },
        { item: 'Toiletries', consumed: 120 },
        { item: 'Cleaning Supplies', consumed: 45 },
        { item: 'Food Items', consumed: 95 }
      ],
      staffActivity: [
        { name: 'Housekeeping', tasks: 45 },
        { name: 'Front Desk', tasks: 32 },
        { name: 'Restaurant', tasks: 28 },
        { name: 'Maintenance', tasks: 15 }
      ]
    }
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  // Use real data if available, otherwise use mock data
  const data = dashboardData || getMockData();



  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header with Property Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Property Info */}
            <div className="col-span-1">
              <h1 className="text-lg sm:text-xl font-bold">{data.property.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-blue-100">
                <MapPin className="h-3 w-3" />
                <span className="text-xs sm:text-sm">{data.property.location}</span>
              </div>
              <p className="text-blue-100 mt-1 text-xs">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 col-span-1">
              <div>
                <div className="text-xl sm:text-2xl font-bold">{data.property.occupancyRate}%</div>
                <div className="text-blue-100 text-xs">Occupancy Today</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold">RWF {data.property.revenueToday.toLocaleString()}</div>
                <div className="text-blue-100 text-xs">Revenue</div>
              </div>
            </div>

            {/* Room Overview */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm col-span-1 sm:col-span-2 lg:col-span-1">
              <div>
                <div className="font-semibold text-base">{data.property.totalRooms}</div>
                <div className="text-blue-100 text-xs">Total Rooms</div>
              </div>
              <div>
                <div className="font-semibold text-base">{data.property.availableRooms}</div>
                <div className="text-blue-100 text-xs">Available</div>
              </div>
              <div>
                <div className="font-semibold text-base">{data.property.activeStaff}</div>
                <div className="text-blue-100 text-xs">Staff on Duty</div>
              </div>
              <div>
                <div className="font-semibold text-base">{data.property.pendingRequests}</div>
                <div className="text-blue-100 text-xs">Pending Requests</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container with Padding */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Booking Summary Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 sm:mb-4 uppercase tracking-wide">Booking Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="New Bookings Today"
          value={data.bookings.newToday}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Upcoming Check-ins"
          value={data.bookings.upcomingCheckins}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Upcoming Check-outs"
          value={data.bookings.upcomingCheckouts}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Cancelled Bookings"
          value={data.bookings.cancelled}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="Multi-Room Bookings"
          value={data.bookings.multiRoom}
          icon={Building}
          color="purple"
        />
          </div>
        </div>

        {/* Analytics & Charts Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 sm:mb-6 uppercase tracking-wide flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics & Insights
          </h2>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            
            {/* 1. Booking Trends Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Booking Trends (This Week)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chartData.bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bookings" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 2. Room Occupancy Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Bed className="h-4 w-4 text-blue-600" />
                Room Occupancy Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chartData.roomOccupancy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {data.chartData.roomOccupancy.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          {/* 3. Revenue Breakdown Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <RwfIcon className="h-4 w-4 text-green-600" />
                Revenue by Service Type
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chartData.revenueBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#10B981" radius={[0, 8, 8, 0]}>
                    {data.chartData.revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 4. Housekeeping Tasks Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-purple-600" />
                Housekeeping Task Status
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chartData.housekeepingTasks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 5. Inventory Consumption Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                Top 5 Consumed Items (This Week)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chartData.inventoryConsumption}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="item" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="consumed" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 6. Staff Activity Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Staff Activity Summary
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.chartData.staffActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasks" fill="#6366F1" radius={[8, 8, 0, 0]}>
                    {data.chartData.staffActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

      {/* Room Status & Financial Snapshot Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Room Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bed className="h-4 w-4 text-blue-600" />
            Room Status Snapshot
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-green-600">{data.rooms.cleanedReady}</div>
              <div className="text-xs text-green-700">Cleaned & Ready</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{data.rooms.occupied}</div>
              <div className="text-xs text-blue-700">Occupied</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{data.rooms.underMaintenance}</div>
              <div className="text-xs text-orange-700">Under Maintenance</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-red-600">{data.rooms.blocked}</div>
              <div className="text-xs text-red-700">Blocked</div>
            </div>
          </div>
          <button className="w-full mt-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
            View Housekeeping →
          </button>
        </div>

        {/* Financial Snapshot */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <RwfIcon className="h-4 w-4 text-green-600" />
            Financial Snapshot
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total Revenue Today</span>
              <span className="text-lg font-bold text-green-600">RWF {data.financial.revenueToday.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Outstanding Invoices</span>
              <span className="text-base font-semibold text-orange-600">RWF {data.financial.outstandingInvoices.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Recent Payments</span>
              <span className="text-base font-semibold text-blue-600">RWF {data.financial.recentPayments.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="text-xs font-medium text-gray-900 mb-2">Revenue Sources</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Rooms: {data.financial.sources.rooms}%</div>
                <div>Restaurant: {data.financial.sources.restaurant}%</div>
                <div>Services: {data.financial.sources.services}%</div>
              </div>
            </div>
          </div>
          <button className="w-full mt-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
            View Financial Reports →
          </button>
        </div>
      </div>

      {/* Main Content Grid - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Guest Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Guest Activity Feed
            </h3>
            <div className="space-y-2">
              {data.guests.map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${getActivityBgColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm">{activity.guest}</span>
                      {activity.isVip && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    </div>
                    <p className="text-xs text-gray-600">{getActivityText(activity)}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Overview */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              Staff Overview
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{data.staff.onDuty}</div>
                <div className="text-xs text-blue-700">Staff on Duty</div>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <div className="text-lg font-bold text-green-600">{data.staff.tasksCompleted}</div>
                <div className="text-xs text-green-700">Tasks Completed</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Housekeeping:</span>
                <span className="font-medium">{data.staff.housekeeping}</span>
              </div>
              <div className="flex justify-between">
                <span>Front Desk:</span>
                <span className="font-medium">{data.staff.frontDesk}</span>
              </div>
              <div className="flex justify-between">
                <span>Restaurant:</span>
                <span className="font-medium">{data.staff.restaurant}</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance:</span>
                <span className="font-medium">{data.staff.maintenance}</span>
              </div>
            </div>
            {data.staff.alertsCount > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{data.staff.alertsCount} Staff Alerts</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-4">
          {/* Restaurant & Orders */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-purple-600" />
              Restaurant & Orders
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{data.restaurant.tablesOccupied}</div>
                <div className="text-sm text-purple-700">Tables Occupied</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{data.restaurant.ordersToday}</div>
                <div className="text-sm text-orange-700">Orders Today</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Total Tables</span>
                </div>
                <span className="font-medium">{data.restaurant.totalTables} tables</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <RwfIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Revenue Today</span>
                </div>
                <span className="font-medium">RWF {data.restaurant.revenueToday.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-orange-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              Inventory Alerts
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Low Stock Items</span>
                </div>
                <span className="font-bold text-red-600">{data.inventory.lowStock.length}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">Critical Items:</div>
                <div className="flex flex-wrap gap-2">
                  {data.inventory.lowStock.filter(item => item.status === 'critical').map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      {item.item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg">{data.inventory.lowStock.length}</div>
                  <div className="text-gray-600">Low Stock Items</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{data.inventory.recentDeliveries.length}</div>
                  <div className="text-gray-600">Recent Deliveries</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Guest Requests & Complaints */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              Guest Requests
            </h3>
            <div className="space-y-3">
              {data.requests.map((request) => (
                <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{request.guest}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRequestStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{request.type}</p>
                  <p className="text-sm">{request.request}</p>
                  <p className="text-xs text-gray-500 mt-1">{request.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications & Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-yellow-600" />
              Recent Notifications
            </h3>
            <div className="space-y-3">
              {data.notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${getNotificationBgColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm p-4 border border-gray-300">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-700" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors">
                <Plus className="h-3 w-3" />
                <span className="text-xs font-medium">New Booking</span>
              </button>
              <button className="flex items-center gap-2 p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 transition-colors">
                <ClipboardList className="h-3 w-3" />
                <span className="text-xs font-medium">Assign Task</span>
              </button>
              <button className="flex items-center gap-2 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition-colors">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs font-medium">Guest Request</span>
              </button>
              <button className="flex items-center gap-2 p-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 transition-colors">
                <CreditCard className="h-3 w-3" />
                <span className="text-xs font-medium">Record Payment</span>
              </button>
              <button className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                <BarChart3 className="h-3 w-3" />
                <span className="text-xs font-medium">Generate Report</span>
              </button>
              <button className="flex items-center gap-2 p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 transition-colors">
                <Eye className="h-3 w-3" />
                <span className="text-xs font-medium">View Analytics</span>
              </button>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-sm p-4 text-white border-2 border-blue-300">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">Kigali Weather</h4>
                <p className="text-xl font-bold">24°C</p>
                <p className="text-blue-100 text-xs">Partly Cloudy</p>
              </div>
              <Cloud className="h-8 w-8 text-blue-200" />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Stock Summary Section */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-purple-200">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 sm:p-4 border-b border-purple-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 uppercase tracking-wide">Inventory Stock Summary</h2>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-white hover:bg-purple-50 rounded-lg border border-purple-200 whitespace-nowrap">
              View Full Inventory →
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <RwfIcon className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Total Stock Value</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">RWF {data.stockSummary.totalValue.toLocaleString()}</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Total Items</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{data.stockSummary.totalItems.toLocaleString()}</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Low Stock Alerts</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">{data.inventory.lowStock.length}</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Pending Orders</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{data.inventory.recentDeliveries.length}</div>
            </div>
          </div>

          {/* Category Breakdown & Item List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Breakdown */}
            <div className="xl:col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                Stock by Category
              </h3>
              <div className="space-y-2">
                {Object.entries(data.stockSummary.categories).map(([key, categoryData]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">{key}</span>
                      {categoryData.lowStock > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                          {categoryData.lowStock} low
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{categoryData.count} items</span>
                      <span className="font-semibold text-purple-600">RWF {categoryData.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Item List */}
            <div className="xl:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-purple-600" />
                Recent Stock Items
              </h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-xs sm:text-sm min-w-[600px]">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Item</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Category</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Quantity</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Value</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {staticStockSummary.recentItems.map((item) => (
                        <tr key={item.id} className="hover:bg-white transition-colors">
                          <td className="py-2 px-3 font-medium text-gray-900">{item.name}</td>
                          <td className="py-2 px-3 text-gray-600">{item.category}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`font-semibold ${
                              item.status === 'critical' ? 'text-red-600' : 
                              item.status === 'low' ? 'text-orange-600' : 
                              'text-gray-900'
                            }`}>
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-purple-600">
                            RWF {item.value.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {item.status === 'critical' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                <ShieldAlert className="h-3 w-3" />
                                Critical
                              </span>
                            )}
                            {item.status === 'low' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                                <AlertCircle className="h-3 w-3" />
                                Low
                              </span>
                            )}
                            {item.status === 'ok' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                <CheckCircle className="h-3 w-3" />
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, trendUp, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  const borderClasses = {
    blue: 'border-blue-200',
    green: 'border-green-200',
    purple: 'border-purple-200',
    orange: 'border-orange-200',
    red: 'border-red-200'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 ${borderClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trendUp ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
};

const QuickStatCard = ({ title, value, icon: Icon, iconColor, bgColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status) {
    case 'CheckedIn':
      return 'bg-green-100 text-green-800';
    case 'Confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTaskStatusClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getActivityBgColor = (type) => {
  switch (type) {
    case 'checkin':
      return 'bg-green-100';
    case 'checkout':
      return 'bg-blue-100';
    case 'complaint':
      return 'bg-red-100';
    case 'review':
      return 'bg-yellow-100';
    default:
      return 'bg-gray-100';
  }
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'checkin':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'checkout':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'complaint':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'review':
      return <Star className="h-4 w-4 text-yellow-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-600" />;
  }
};

const getActivityText = (activity) => {
  switch (activity.type) {
    case 'checkin':
      return `Checked into Room ${activity.room}`;
    case 'checkout':
      return `Checked out from Room ${activity.room}`;
    case 'complaint':
      return activity.issue;
    case 'review':
      return `Left a ${activity.rating}-star review`;
    default:
      return 'Activity update';
  }
};

const getRequestStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'assigned':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getNotificationBgColor = (type) => {
  switch (type) {
    case 'booking':
      return 'bg-blue-100';
    case 'maintenance':
      return 'bg-orange-100';
    case 'staff':
      return 'bg-purple-100';
    default:
      return 'bg-gray-100';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'booking':
      return <Calendar className="h-3 w-3 text-blue-600" />;
    case 'maintenance':
      return <Wrench className="h-3 w-3 text-orange-600" />;
    case 'staff':
      return <Users className="h-3 w-3 text-purple-600" />;
    default:
      return <Bell className="h-3 w-3 text-gray-600" />;
  }
};

// Add static stock data for display
const staticStockSummary = {
  recentItems: [
    {
      id: 1,
      name: 'Mineral Water 500ml',
      category: 'Beverages',
      quantity: 120,
      unit: 'bottles',
      value: 24000,
      status: 'ok'
    },
    {
      id: 2,
      name: 'Toilet Paper',
      category: 'Housekeeping',
      quantity: 30,
      unit: 'rolls',
      value: 6000,
      status: 'low'
    },
    {
      id: 3,
      name: 'Cooking Oil 5L',
      category: 'Kitchen',
      quantity: 2,
      unit: 'cans',
      value: 18000,
      status: 'critical'
    },
    {
      id: 4,
      name: 'Laundry Detergent',
      category: 'Housekeeping',
      quantity: 10,
      unit: 'kg',
      value: 15000,
      status: 'ok'
    }
  ]
};