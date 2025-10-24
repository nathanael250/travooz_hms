import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Building,
  Bed,
  Users,
  Calendar,
  UserCheck,
  ClipboardList,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Hotel,
  MapPin,
  Grid3X3,
  Package,
  Image,
  DollarSign,
  CalendarX,
  Activity,
  UserPlus,
  User,
  Edit,
  ExternalLink,
  CreditCard,
  Link as LinkIcon,
  PieChart,
  UserCircle,
  Bell,
  AlertCircle,
  Star,
  Heart,
  Sparkles,
  CheckCircle,
  Clock,
  ListChecks,
  Wrench,
  Package as PackageIcon,
  AlertTriangle,
  UtensilsCrossed,
  Table as TableIcon,
  BookOpen,
  ShoppingCart,
  List as ListIcon,
  ChefHat,
  Truck,
  Box,
  TrendingUp,
  Boxes,
  ClipboardCheck,
  ShoppingBag,
  FileText,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const getNavigation = (t, role) => {
  // Comprehensive navigation for vendor/manager/admin roles
  if (['vendor', 'manager', 'admin'].includes(role)) {
    return [
      { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
      { 
        name: 'Hotel Management', 
        icon: Hotel, 
        children: [
          { name: 'Homestays', href: '/hotels/homestays', icon: Building },
          { name: 'Room Types', href: '/hotels/room-types', icon: Grid3X3 },
          { name: 'Room Inventory', href: '/hotels/room-inventory', icon: Package },
          { name: 'Room Images', href: '/hotels/room-images', icon: Image },
          { name: 'Room Rates', href: '/hotels/room-rates', icon: DollarSign },
          { name: 'Room Availability', href: '/hotels/room-availability', icon: CalendarX },
          { name: 'Room Status Log', href: '/hotels/room-status', icon: Activity },
          { name: 'Room Assignments', href: '/hotels/room-assignments', icon: UserPlus },
          { name: 'HMS User Management', href: '/hotels/hms-users', icon: Users },
        ]
      },
      {
        name: 'Booking Management',
        icon: Calendar,
        children: [
          { name: 'Room Bookings', href: '/bookings/room-bookings', icon: Bed },
          { name: 'Multi-Room Bookings', href: '/bookings/multi-room-bookings', icon: Users },
          { name: 'Booking Guests', href: '/bookings/booking-guests', icon: User },
          { name: 'Booking Modifications', href: '/bookings/booking-modifications', icon: Edit },
          { name: 'Booking Charges', href: '/bookings/booking-charges', icon: DollarSign },
          { name: 'External Bookings', href: '/bookings/external-bookings', icon: ExternalLink },
        ]
      },
      {
        name: 'Financial Management',
        icon: CreditCard,
        children: [
          { name: 'Invoices', href: '/financial/invoices', icon: FileText },
          { name: 'Accounts', href: '/financial/accounts', icon: CreditCard },
          { name: 'Account Linkage', href: '/financial/account-linkage', icon: LinkIcon },
          { name: 'Account Summary', href: '/financial/account-summary', icon: PieChart },
        ]
      },
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
        ]
      },
      {
        name: 'Housekeeping',
        icon: Sparkles,
        children: [
          { name: 'Housekeeping Tasks', href: '/housekeeping/tasks', icon: ListChecks },
        ]
      },
      {
        name: 'Staff Dashboard',
        icon: Users,
        children: [
          { name: 'My Tasks', href: '/staff/my-tasks', icon: CheckCircle },
        ]
      },
      {
        name: 'Maintenance',
        icon: Wrench,
        children: [
          { name: 'Maintenance Requests', href: '/maintenance/requests', icon: AlertTriangle },
        ]
      },
      {
        name: 'Restaurant & Kitchen',
        icon: UtensilsCrossed,
        children: [
          { name: 'Restaurant Tables', href: '/restaurant/tables', icon: TableIcon },
          { name: 'Menu Management', href: '/restaurant/menu', icon: BookOpen },
          { name: 'Restaurant Orders', href: '/restaurant/orders', icon: ShoppingCart },
          { name: 'Order Items', href: '/restaurant/order-items', icon: ListIcon },
          { name: 'Kitchen Queue', href: '/restaurant/kitchen-queue', icon: ChefHat },
          { name: 'Order Delivery Info', href: '/restaurant/delivery', icon: Truck },
        ]
      },
      {
        name: 'Stock Management',
        icon: Boxes,
        children: [
          { name: 'Stock Items', href: '/stock/items', icon: Box },
          { name: 'Stock Movements', href: '/stock/movements', icon: TrendingUp },
          { name: 'Suppliers', href: '/stock/suppliers', icon: Truck },
          { name: 'Purchase Orders', href: '/stock/orders', icon: ShoppingBag },
          { name: 'Usage Logs', href: '/stock/usage-logs', icon: ClipboardCheck },
          { name: 'Inventory Alerts', href: '/stock/alerts', icon: AlertTriangle },
        ]
      },
      { name: t('navigation.reports'), href: '/reports', icon: BarChart3 },
      { name: t('navigation.settings'), href: '/settings', icon: Settings },
    ];
  }

  // Role-specific navigation for other roles
  switch (role) {
    case 'receptionist':
      return [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
        { name: 'Bookings List', href: '/front-desk/bookings', icon: ClipboardList },
        { name: 'Upcoming Arrivals', href: '/front-desk/upcoming-arrivals', icon: Calendar },
        { name: 'In-House Guests', href: '/front-desk/in-house-guests', icon: Users },
        { name: 'Check-Out', href: '/front-desk/check-out', icon: LogOut },
        { name: 'Room Status', href: '/front-desk/room-status', icon: Activity },
        { name: 'Walk-In Booking', href: '/front-desk/walk-in-booking', icon: UserPlus },
        { name: 'Guest Folio', href: '/front-desk/guest-folio', icon: FileText },
        { name: 'Guest Profiles', href: '/front-desk/guest-profiles', icon: UserCircle },
      ];

    case 'housekeeping':
      return [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
        { name: 'Housekeeping Tasks', href: '/housekeeping/tasks', icon: ListChecks },
        { name: 'My Tasks', href: '/housekeeping/my-tasks', icon: CheckCircle },
      ];

    case 'maintenance':
      return [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
        { name: 'Maintenance Requests', href: '/maintenance/requests', icon: AlertTriangle },
        { name: 'My Tasks', href: '/maintenance/my-tasks', icon: CheckCircle },
      ];

    case 'restaurant':
      return [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
        { name: 'Restaurant Tables', href: '/restaurant/tables', icon: TableIcon },
        { name: 'Menu Management', href: '/restaurant/menu', icon: BookOpen },
        { name: 'Restaurant Orders', href: '/restaurant/orders', icon: ShoppingCart },
        { name: 'Order Items', href: '/restaurant/order-items', icon: ListIcon },
        { name: 'Kitchen Queue', href: '/restaurant/kitchen-queue', icon: ChefHat },
        { name: 'Order Delivery Info', href: '/restaurant/delivery', icon: Truck },
      ];

    case 'inventory':
      return [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
        { name: 'Stock Items', href: '/stock/items', icon: Box },
        { name: 'Stock Movements', href: '/stock/movements', icon: TrendingUp },
        { name: 'Suppliers', href: '/stock/suppliers', icon: Truck },
        { name: 'Purchase Orders', href: '/stock/orders', icon: ShoppingBag },
        { name: 'Usage Logs', href: '/stock/usage-logs', icon: ClipboardCheck },
        { name: 'Inventory Alerts', href: '/stock/alerts', icon: AlertTriangle },
      ];

    case 'accountant':
      return [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
        { name: 'Invoices', href: '/financial/invoices', icon: FileText },
        { name: 'Accounts', href: '/financial/accounts', icon: CreditCard },
        { name: 'Account Linkage', href: '/financial/account-linkage', icon: LinkIcon },
        { name: 'Account Summary', href: '/financial/account-summary', icon: PieChart },
      ];

    case 'storekeeper':
      return [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
        { name: 'Stock Items', href: '/storekeeper/stock-items', icon: Box },
        { name: 'Stock Balance', href: '/storekeeper/stock-balance', icon: BarChart3 },
        { name: 'Suppliers', href: '/storekeeper/suppliers', icon: Truck },
        { name: 'Purchase Orders', href: '/storekeeper/purchase-orders', icon: ShoppingBag },
        { name: 'Delivery Notes', href: '/storekeeper/delivery-notes', icon: ClipboardCheck },
        { name: 'Cost Reports', href: '/storekeeper/cost-reports', icon: TrendingUp },
        { name: 'Supplier Reports', href: '/storekeeper/supplier-reports', icon: PieChart },
        { name: 'Stock Units', href: '/storekeeper/stock-units', icon: Boxes },
        { name: 'Item List', href: '/storekeeper/item-list', icon: ListIcon },
        { name: 'Categories', href: '/storekeeper/categories', icon: PackageIcon },
      ];

    default:
      return [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
      ];
  }
};

const adjustNavigationForRole = (navigation, role) => {
  // Create a deep copy to avoid mutating original
  return navigation.map(item => {
    // Transform Front Desk URLs for vendor/manager roles: /front-desk/* → /manager/front-desk/*
    if (item.name === 'Front Desk' && (role === 'manager' || role === 'vendor')) {
      return {
        ...item,
        children: item.children?.map(child => ({
          ...child,
          href: child.href.replace('/front-desk/', '/manager/front-desk/')
        }))
      };
    }
    return item;
  });
};

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const allNavigation = getNavigation(t, user?.role);
  // For now, show all navigation (we'll implement role filtering later)
  let navigation = allNavigation;
  // Adjust URLs for specific roles
  navigation = adjustNavigationForRole(navigation, user?.role);

  const isCurrentPage = (href) => {
    const currentPath = location.pathname;
    // Exact match
    if (currentPath === href || currentPath.startsWith(href + '/')) {
      return true;
    }
    // For vendor/manager roles accessing /manager/front-desk/*, also match /front-desk/* hrefs
    if ((user?.role === 'manager' || user?.role === 'vendor') && href.startsWith('/front-desk/')) {
      const managerHref = href.replace('/front-desk/', '/manager/front-desk/');
      return currentPath === managerHref || currentPath.startsWith(managerHref + '/');
    }
    return false;
  };

  const isMenuExpanded = (menuName) => {
    return expandedMenus[menuName] || navigation.some(item => 
      item.children && item.name === menuName && item.children.some(child => isCurrentPage(child.href))
    );
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent 
              navigation={navigation} 
              isCurrentPage={isCurrentPage} 
              user={user}
              isMenuExpanded={isMenuExpanded}
              toggleMenu={toggleMenu}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent 
            navigation={navigation} 
            isCurrentPage={isCurrentPage} 
            user={user}
            isMenuExpanded={isMenuExpanded}
            toggleMenu={toggleMenu}
          />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          className="fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

const SidebarContent = ({ navigation, isCurrentPage, user, isMenuExpanded, toggleMenu }) => (
  <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
    <div className="flex items-center flex-shrink-0 px-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">Travooz HMS</p>
          <p className="text-xs text-gray-500">Hotel Management</p>
        </div>
      </div>
    </div>
    <nav className="mt-8 flex-1 px-2 space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        
        // Handle items with children (expandable menus)
        if (item.children) {
          const expanded = isMenuExpanded(item.name);
          const hasActiveChild = item.children.some(child => isCurrentPage(child.href));
          
          return (
            <div key={item.name}>
              <button
                onClick={() => toggleMenu(item.name)}
                className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  hasActiveChild
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.name}</span>
                {expanded ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
              
              {expanded && (
                <div className="mt-1 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`group flex items-center pl-8 pr-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isCurrentPage(child.href)
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <ChildIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }
        
        // Handle regular menu items
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              isCurrentPage(item.href)
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </nav>
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
      </div>
    </div>
  </div>
);

export default Sidebar;