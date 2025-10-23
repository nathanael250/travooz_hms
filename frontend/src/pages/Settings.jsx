import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Settings as SettingsIcon,
  CreditCard,
  Mail,
  Globe,
  Database,
  Key,
  Monitor
} from 'lucide-react';
import InvoiceSettings from './settings/InvoiceSettings';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('invoice');

  const settingsTabs = [
    { 
      id: 'invoice', 
      name: 'Invoice Settings', 
      icon: FileText, 
      description: 'Customize invoice appearance and branding',
      component: InvoiceSettings
    },
    { 
      id: 'profile', 
      name: 'Profile Settings', 
      icon: User, 
      description: 'Manage your user profile and preferences',
      component: () => <div className="p-8 text-center text-gray-500">Profile settings coming soon...</div>
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: Bell, 
      description: 'Configure notification preferences',
      component: () => <div className="p-8 text-center text-gray-500">Notification settings coming soon...</div>
    },
    { 
      id: 'security', 
      name: 'Security', 
      icon: Shield, 
      description: 'Password and security settings',
      component: () => <div className="p-8 text-center text-gray-500">Security settings coming soon...</div>
    },
    { 
      id: 'appearance', 
      name: 'Appearance', 
      icon: Palette, 
      description: 'Theme and display preferences',
      component: () => <div className="p-8 text-center text-gray-500">Appearance settings coming soon...</div>
    },
    { 
      id: 'payment', 
      name: 'Payment Methods', 
      icon: CreditCard, 
      description: 'Manage payment methods and billing',
      component: () => <div className="p-8 text-center text-gray-500">Payment settings coming soon...</div>
    },
    { 
      id: 'email', 
      name: 'Email Settings', 
      icon: Mail, 
      description: 'Email templates and SMTP configuration',
      component: () => <div className="p-8 text-center text-gray-500">Email settings coming soon...</div>
    },
    { 
      id: 'localization', 
      name: 'Localization', 
      icon: Globe, 
      description: 'Language, timezone, and regional settings',
      component: () => <div className="p-8 text-center text-gray-500">Localization settings coming soon...</div>
    },
    { 
      id: 'database', 
      name: 'Database', 
      icon: Database, 
      description: 'Database backup and maintenance',
      component: () => <div className="p-8 text-center text-gray-500">Database settings coming soon...</div>
    },
    { 
      id: 'api', 
      name: 'API Keys', 
      icon: Key, 
      description: 'Manage API keys and integrations',
      component: () => <div className="p-8 text-center text-gray-500">API settings coming soon...</div>
    },
    { 
      id: 'system', 
      name: 'System Settings', 
      icon: Monitor, 
      description: 'System configuration and maintenance',
      component: () => <div className="p-8 text-center text-gray-500">System settings coming soon...</div>
    }
  ];

  const activeSetting = settingsTabs.find(tab => tab.id === activeTab);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          System settings and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Categories</h3>
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tab Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <activeSetting.icon className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{activeSetting.name}</h2>
                  <p className="text-gray-600 text-sm">{activeSetting.description}</p>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-0">
              <activeSetting.component />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};