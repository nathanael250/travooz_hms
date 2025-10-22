import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - can add breadcrumbs or page title here if needed */}
          <div className="flex-1">
            {/* Empty for now - pages will have their own titles */}
          </div>
          
          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {t('vendor')}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="h-9 w-9 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={t('logout')}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};