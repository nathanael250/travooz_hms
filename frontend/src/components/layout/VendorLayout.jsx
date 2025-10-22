import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import images from '../assets/images/images';
import { 
  Search, 
  LayoutDashboard, 
  CheckSquare, 
  Package, 
  Tag, 
  MapPin, 
  FileText, 
  Puzzle, 
  BarChart3, 
  Users, 
  Settings, 
  CreditCard, 
  ChevronDown,
  ChevronRight,
  Menu,
  Sun,
  Mail,
  Globe,
  Moon,
  ArrowLeftRight,
  BedDouble,
  Building2,
  Key,
  UserCheck,
  ClipboardList,
  DollarSign,
  Bed
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getVendorSubscription } from '../services/vendorService';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

function getIcon(label) {
  switch (label) {
    case 'Dashboard': return <LayoutDashboard className="w-5 h-5" />;
    case 'Restaurants': return <Package className="w-5 h-5" />;
    case 'Menus': return <Tag className="w-5 h-5" />;
    case 'Table Bookings': return <CheckSquare className="w-5 h-5" />;
    case 'Revenue': return <BarChart3 className="w-5 h-5" />;
    case 'Tour Packages': return <Package className="w-5 h-5" />;
    case 'My Packages': return <Puzzle className="w-5 h-5" />;
    case 'Bookings': return <FileText className="w-5 h-5" />;
    case 'Hotels': return <BedDouble className="w-5 h-5" />;
    case 'My Hotels': return <Building2 className="w-5 h-5" />;
    case 'Room Inventory': return <Bed className="w-5 h-5" />;
    case 'Front Desk Dashboard': return <LayoutDashboard className="w-5 h-5" />;
    case 'Front Desk Operations': return <Key className="w-5 h-5" />;
    case 'Guest Management': return <Users className="w-5 h-5" />;
    case 'Housekeeping': return <ClipboardList className="w-5 h-5" />;
    case 'Pricing & Rates': return <DollarSign className="w-5 h-5" />;
    case 'Guest Profiles': return <UserCheck className="w-5 h-5" />;
    case 'Rooms': return <Bed className="w-5 h-5" />;
    case 'Activities': return <Puzzle className="w-5 h-5" />;
    case 'My Activities': return <Puzzle className="w-5 h-5" />;
    case 'Notifications': return <Mail className="w-5 h-5" />;
    case 'Settings': return <Settings className="w-5 h-5" />;
    case 'Subscription': return <CreditCard className="w-5 h-5" />;
    default: return <MapPin className="w-5 h-5" />;
  }
}

const VendorLayout = ({ sidebar = [], sidebarConfig, children }) => {
  // Support both prop names for backward compatibility
  const computedSidebar = sidebarConfig ?? sidebar;
  console.debug('[VendorLayout] computedSidebar:', computedSidebar);
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [hideBanner, setHideBanner] = useState(() => localStorage.getItem('hide_subscription_banner') === '1');
  const location = useLocation();

  useEffect(() => {
    // Refresh subscription when route changes (lightweight, reads localStorage)
    (async () => {
      const sub = await getVendorSubscription();
      setSubscription(sub);
    })();
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const shouldShowBanner = !hideBanner && (!subscription || subscription?.plan?.id === 'basic');

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className={`p-4  ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col items-center gap-3">
            <img src={images.cdc_logo} alt="logo" className='w-10 h-10 object-contain'/>
            {sidebarOpen && <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Travooz</span>}
          </div>
        </div>
        {/* Search */}
        {sidebarOpen && (
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder={t('common.search')}
                className={`w-full pl-10 pr-4 py-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' 
                    : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                } border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent`}
              />
            </div>
          </div>
        )}
        {/* Navigation - dynamic, supports nested children */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {/* Existing computed sidebar items */}
          {computedSidebar.map((item, idx) => (
            item.children ? (
              <div key={item.label}>
                <button
                  className={`flex items-center gap-3 w-full p-3 rounded-lg font-semibold transition-colors ${
                    expandedMenus[item.label]
                      ? (isDarkMode ? 'bg-gray-700 text-blue-300 border border-gray-600' : 'bg-blue-50 text-blue-700 border border-blue-200')
                      : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                  }`}
                  onClick={() => toggleMenu(item.label)}
                >
                  {getIcon(item.label)}
                  {sidebarOpen && <span>{item.label}</span>}
                  {sidebarOpen && (expandedMenus[item.label] ? <ChevronDown className="ml-auto w-4 h-4" /> : <ChevronRight className="ml-auto w-4 h-4" />)}
                </button>
                {expandedMenus[item.label] && sidebarOpen && (
                  <div className="ml-6 space-y-1">
                    {item.children.map(child => (
                      <NavLink key={child.label} to={child.path} end>
                        {({ isActive }) => (
                          <div className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isActive
                              ? (isDarkMode ? 'bg-gray-700 text-blue-300 border border-gray-600' : 'bg-blue-50 text-blue-700 border border-blue-200')
                              : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                          }`}>
                            {getIcon(child.label)}
                            <span className="text-sm font-medium">{child.label}</span>
                          </div>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={item.label} to={item.path} end>
                {({ isActive }) => (
                  <div className={`flex items-center gap-3 w-full p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? (isDarkMode ? 'bg-gray-700 text-blue-300 border border-gray-600' : 'bg-blue-50 text-blue-700 border border-blue-200')
                      : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                  }`}>
                    {getIcon(item.label)}
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                )}
              </NavLink>
            )
          ))}

        </nav>
        {/* Bottom action: Change Category pinned above version */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <NavLink to="/vendor/choose-category" end>
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 w-full p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? (isDarkMode ? 'bg-gray-700 text-blue-300 border border-gray-600' : 'bg-blue-50 text-blue-700 border border-blue-200')
                    : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                }`}
                title={t('common.changeCategory')}
              >
                <ArrowLeftRight className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm font-medium">{t('common.changeCategory')}</span>}
              </div>
            )}
          </NavLink>
        </div>
        {/* Sidebar version */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} text-xs`}>
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <span>{t('common.version')}</span>
              <span className="font-medium">v 1.1.0</span>
            </div>
          ) : (
            <div className="text-center">v1.1.0</div>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header (sticky) */}
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} sticky top-0 z-30 shadow-sm border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}
              >
                <Menu className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('common.dashboard')}</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Header Icons */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher isDarkMode={isDarkMode} />
                <button 
                  onClick={toggleDarkMode}
                  className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}>
                  <Mail className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <div className="relative">
                  <button
                    className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center focus:outline-none"
                    onClick={() => setShowDropdown((d) => !d)}
                    title={user?.name || user?.email || 'Account'}
                  >
                    <span className="text-white text-sm font-medium">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                    </span>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50 text-left">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="font-semibold text-gray-900">{user?.name || 'Account'}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                      <button
                        onClick={() => { logout(); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        {t('common.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content Area (independent scroll) */}
        <main className={`flex-1 overflow-y-auto p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {shouldShowBanner && (
            <div className={`mb-4 rounded-lg border p-4 ${isDarkMode ? 'bg-emerald-900/30 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">{t('subscription.upgradeYourPlan')}</div>
                  <div className="text-sm opacity-90">
                    {subscription ? (
                      <>{t('subscription.currentPlan')} <span className="font-medium">{subscription.plan?.name}</span>. {t('subscription.unlockFeatures')}</>
                    ) : (
                      <>{t('subscription.noActiveSub')}</>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Link to="/vendor/subscription" className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-sm">{t('subscription.viewPlans')}</Link>
                    <button
                      onClick={() => { setHideBanner(true); localStorage.setItem('hide_subscription_banner', '1'); }}
                      className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-800'}`}
                    >
                      {t('subscription.dismiss')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;