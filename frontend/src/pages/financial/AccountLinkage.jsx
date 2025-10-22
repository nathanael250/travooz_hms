import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Unlink,
  Search,
  Save,
  AlertCircle,
  CheckCircle,
  Bed,
  UtensilsCrossed,
  Shirt,
  Package
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AccountLinkage = () => {
  const [accounts, setAccounts] = useState([]);
  const [roomRates, setRoomRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms');
  const [searchTerm, setSearchTerm] = useState('');
  const [homestayFilter, setHomestayFilter] = useState('');
  const [homestays, setHomestays] = useState([]);

  // Linkage state for different modules
  const [linkages, setLinkages] = useState({
    rooms: [],
    restaurant: [],
    laundry: [],
    stock: []
  });

  useEffect(() => {
    fetchAccounts();
    fetchHomestays();
    fetchRoomRates();
  }, [homestayFilter]);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();
      if (homestayFilter) params.append('homestay_id', homestayFilter);
      params.append('status', 'active');

      const response = await fetch(`${API_URL}/financial-accounts/active?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchHomestays = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/homestays`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setHomestays(data);
        } else if (data && Array.isArray(data.homestays)) {
          setHomestays(data.homestays);
        } else {
          setHomestays([]);
        }
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
      setHomestays([]);
    }
  };

  const fetchRoomRates = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/room-rates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomRates(data);

        // Initialize linkages with existing data if available
        const roomLinkages = data.map(rate => ({
          id: rate.rate_id,
          name: `${rate.room_type || 'Room'} - ${rate.rate_name}`,
          type: 'room_rate',
          linkedAccountId: rate.account_id || '',
          homestay_id: rate.homestay_id
        }));

        setLinkages(prev => ({ ...prev, rooms: roomLinkages }));
      }
    } catch (error) {
      console.error('Error fetching room rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkageChange = (itemId, accountId) => {
    setLinkages(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(item =>
        item.id === itemId ? { ...item, linkedAccountId: accountId } : item
      )
    }));
  };

  const handleSaveLinkages = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('hms_token');
      const currentLinkages = linkages[activeTab];

      // Save linkages for each item
      for (const item of currentLinkages) {
        if (!item.linkedAccountId) continue;

        // Save based on type
        if (item.type === 'room_rate') {
          await fetch(`${API_URL}/room-rates/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              account_id: item.linkedAccountId || null
            })
          });
        }
        // Add similar logic for other types (restaurant, laundry, stock)
      }

      alert('Account linkages saved successfully!');
    } catch (error) {
      console.error('Error saving linkages:', error);
      alert('Error saving linkages');
    } finally {
      setSaving(false);
    }
  };

  const getLinkedAccountName = (accountId) => {
    const account = accounts.find(acc => acc.account_id === parseInt(accountId));
    return account ? account.account_name : 'Not linked';
  };

  const filterItems = (items) => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHomestay = !homestayFilter || item.homestay_id === parseInt(homestayFilter);
      return matchesSearch && matchesHomestay;
    });
  };

  const tabs = [
    { id: 'rooms', label: 'Room Rates', icon: Bed, description: 'Link accounts to room rates' },
    { id: 'restaurant', label: 'Restaurant Menu', icon: UtensilsCrossed, description: 'Link accounts to menu items' },
    { id: 'laundry', label: 'Laundry Services', icon: Shirt, description: 'Link accounts to laundry services' },
    { id: 'stock', label: 'Stock Items', icon: Package, description: 'Link accounts to inventory items' }
  ];

  const activeItems = filterItems(linkages[activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading account linkages...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Linkage</h1>
        <p className="text-gray-600">Link financial accounts to operational modules for revenue and expense tracking</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-1">About Account Linkage</h3>
          <p className="text-sm text-blue-800">
            Link financial accounts to services, items, and operations to enable automatic revenue and expense tracking.
            This helps in generating accurate financial reports per account.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={homestayFilter}
            onChange={(e) => setHomestayFilter(e.target.value)}
          >
            <option value="">All Homestays</option>
            {homestays.map((homestay) => (
              <option key={homestay.homestay_id} value={homestay.homestay_id}>
                {homestay.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-gray-600">
                {tabs.find(t => t.id === activeTab)?.description}
              </p>
            </div>
            <button
              onClick={handleSaveLinkages}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Linkages'}
            </button>
          </div>

          {/* Linkage Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item / Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Homestay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linked Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No items found</p>
                      <p className="text-sm">Try adjusting your filters or add items in the respective modules</p>
                    </td>
                  </tr>
                ) : (
                  activeItems.map((item) => {
                    const homestay = homestays.find(h => h.homestay_id === item.homestay_id);
                    const isLinked = !!item.linkedAccountId;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {homestay?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={item.linkedAccountId}
                            onChange={(e) => handleLinkageChange(item.id, e.target.value)}
                          >
                            <option value="">Select Account</option>
                            {accounts
                              .filter(acc => !homestayFilter || acc.homestay_id === parseInt(homestayFilter))
                              .map((account) => (
                                <option key={account.account_id} value={account.account_id}>
                                  {account.account_name} ({account.account_type})
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isLinked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <LinkIcon className="w-3 h-3" />
                              Linked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              <Unlink className="w-3 h-3" />
                              Not Linked
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {activeItems.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Total Items: <span className="font-medium text-gray-900">{activeItems.length}</span>
                </span>
                <span className="text-gray-600">
                  Linked: <span className="font-medium text-green-600">
                    {activeItems.filter(item => item.linkedAccountId).length}
                  </span>
                </span>
                <span className="text-gray-600">
                  Not Linked: <span className="font-medium text-gray-900">
                    {activeItems.filter(item => !item.linkedAccountId).length}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">How Account Linkage Works</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <p>
              <strong>Room Rates:</strong> Link accounts to track room booking revenue. Each booking will be attributed to the linked account.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <p>
              <strong>Restaurant Menu:</strong> Link accounts to track restaurant revenue from food and beverage sales.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <p>
              <strong>Laundry Services:</strong> Link accounts to track laundry service revenue.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <p>
              <strong>Stock Items:</strong> Link accounts to track inventory expenses when stock is purchased or used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLinkage;
