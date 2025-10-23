import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  BarChart3,
  Bell,
  UserCheck,
  ClipboardList,
  Package,
  Wrench,
  ChefHat,
  ShoppingBag,
  Truck,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  Calculator,
  PieChart,
  Link as LinkIcon,
  ExternalLink,
  Edit,
  DollarSign,
  ListChecks,
  Sparkles,
  LogOut,
  Activity,
  UserPlus,
  UserCircle
} from 'lucide-react';

const RoleBasedSidebar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getRoleBasedNavigation = () => {
    const baseRole = user.role || user.userType;
    
    switch (baseRole) {
      case 'accountant':
        return [
          { name: 'Dashboard', href: '/accountant/dashboard', icon: Home },
          { name: 'Invoices', href: '/accountant/invoices', icon: FileText },
          { name: 'Payments', href: '/accountant/payments', icon: CreditCard },
          { name: 'Financial Reports', href: '/accountant/reports', icon: BarChart3 },
          { name: 'Accounts', href: '/accountant/accounts', icon: Calculator },
        ];

      case 'receptionist':
        return [
          { name: 'Dashboard', href: '/front-desk/dashboard', icon: Home },
          { 
            name: 'Front Desk', 
            icon: UserCheck, 
            children: [
              { name: 'Bookings List', href: '/front-desk/bookings', icon: ClipboardList },
              { name: 'Upcoming Arrivals', href: '/front-desk/upcoming-arrivals', icon: Calendar },
              { name: 'In-House Guests', href: '/front-desk/in-house-guests', icon: Users },
              { name: 'Check-Out', href: '/front-desk/check-out', icon: LogOut },
              { name: 'Room Status', href: '/front-desk/room-status', icon: Activity },
              { name: 'Walk-In Booking', href: '/front-desk/walk-in-booking', icon: UserPlus },
              { name: 'Guest Folio', href: '/front-desk/guest-folio', icon: FileText },
              { name: 'Guest Profiles', href: '/front-desk/guest-profiles', icon: UserCircle },
              { name: 'Guest Requests', href: '/front-desk/guest-requests', icon: Bell },
            ]
          },
        ];

      case 'housekeeping':
        return [
          { name: 'Dashboard', href: '/housekeeping/dashboard', icon: Home },
          { name: 'My Tasks', href: '/housekeeping/my-tasks', icon: ListChecks },
          { name: 'Room Cleaning', href: '/housekeeping/room-cleaning', icon: Sparkles },
          { name: 'Supply Requests', href: '/housekeeping/supply-requests', icon: Package },
        ];

      case 'maintenance':
        return [
          { name: 'Dashboard', href: '/maintenance/dashboard', icon: Home },
          { name: 'My Tasks', href: '/maintenance/my-tasks', icon: Wrench },
          { name: 'Maintenance Requests', href: '/maintenance/requests', icon: AlertTriangle },
          { name: 'Equipment Status', href: '/maintenance/equipment', icon: Package },
        ];

      case 'restaurant':
        return [
          { name: 'Dashboard', href: '/restaurant/dashboard', icon: Home },
          { name: 'Tables', href: '/restaurant/tables', icon: Calendar },
          { name: 'Orders', href: '/restaurant/orders', icon: ClipboardList },
          { name: 'Kitchen Queue', href: '/restaurant/kitchen-queue', icon: ChefHat },
          { name: 'Menu Management', href: '/restaurant/menu', icon: FileText },
        ];

      case 'inventory':
        return [
          { name: 'Dashboard', href: '/inventory/dashboard', icon: Home },
          { name: 'Stock Items', href: '/inventory/items', icon: Package },
          { name: 'Stock Movements', href: '/inventory/movements', icon: TrendingUp },
          { name: 'Purchase Orders', href: '/inventory/orders', icon: ShoppingBag },
          { name: 'Suppliers', href: '/inventory/suppliers', icon: Truck },
          { name: 'Usage Logs', href: '/inventory/usage-logs', icon: ClipboardCheck },
          { name: 'Alerts', href: '/inventory/alerts', icon: AlertTriangle },
        ];

      case 'manager':
      case 'vendor':
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
          { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
          { name: 'Guests', href: '/admin/guests', icon: Users },
          { name: 'Financial', href: '/admin/financial', icon: CreditCard },
          { name: 'Staff Management', href: '/admin/staff', icon: UserCheck },
          { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
          { name: 'Settings', href: '/admin/settings', icon: Settings },
          { name: 'Hotel Management', href: '/admin/hotels', icon: Home },
          { 
            name: 'Front Desk', 
            icon: UserCheck, 
            children: [
              { name: 'Dashboard', href: '/front-desk/dashboard', icon: Home },
              { name: 'Bookings List', href: '/front-desk/bookings', icon: ClipboardList },
              { name: 'Upcoming Arrivals', href: '/front-desk/upcoming-arrivals', icon: Calendar },
              { name: 'In-House Guests', href: '/front-desk/in-house-guests', icon: Users },
              { name: 'Check-Out', href: '/front-desk/check-out', icon: LogOut },
              { name: 'Room Status', href: '/front-desk/room-status', icon: Activity },
              { name: 'Walk-In Booking', href: '/front-desk/walk-in-booking', icon: UserPlus },
              { name: 'Guest Folio', href: '/front-desk/guest-folio', icon: FileText },
              { name: 'Guest Profiles', href: '/front-desk/guest-profiles', icon: UserCircle },
            ]
          },
          { name: 'Housekeeping', href: '/housekeeping/dashboard', icon: Sparkles },
          { name: 'Maintenance', href: '/maintenance/dashboard', icon: Wrench },
          { name: 'Restaurant', href: '/restaurant/dashboard', icon: ChefHat },
          { name: 'Inventory', href: '/inventory/dashboard', icon: Package },
        ];

      default:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: Home },
        ];
    }
  };

  const navigation = getRoleBasedNavigation();

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isSectionActive = (children) => {
    return children.some(child => isActive(child.href));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Travooz HMS</h1>
            <p className="text-xs text-gray-500">Hotel Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          if (item.children) {
            // Render section with children
            return (
              <div key={item.name} className="space-y-1">
                <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                  isSectionActive(item.children) ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.name}
                </div>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ml-2 ${
                      isActive(child.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <child.icon className="h-5 w-5 mr-3" />
                    {child.name}
                  </Link>
                ))}
              </div>
            );
          } else {
            // Render regular item
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          }
        })}
      </nav>

      {/* User Info */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role || user.userType}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedSidebar;
