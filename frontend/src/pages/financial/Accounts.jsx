import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Wallet,
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHomestay, setFilterHomestay] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    homestay_id: '',
    account_name: '',
    account_type: 'bank',
    bank_name: '',
    account_number: '',
    currency: 'RWF',
    status: 'active'
  });

  useEffect(() => {
    fetchAccounts();
    fetchHomestays();
    fetchStatistics();
  }, [filterHomestay, filterType, filterStatus, searchTerm]);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();

      if (filterHomestay) params.append('homestay_id', filterHomestay);
      if (filterType) params.append('account_type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_URL}/financial-accounts?${params}`, {
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
    } finally {
      setLoading(false);
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
          console.warn('Homestays data is not an array:', data);
          setHomestays([]);
        }
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
      setHomestays([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();
      if (filterHomestay) params.append('homestay_id', filterHomestay);

      const response = await fetch(`${API_URL}/financial-accounts/summary/statistics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('hms_token');
      const url = editingAccount
        ? `${API_URL}/financial-accounts/${editingAccount.account_id}`
        : `${API_URL}/financial-accounts`;

      const method = editingAccount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchAccounts();
        fetchStatistics();
        handleCloseModal();
        alert(editingAccount ? 'Account updated successfully!' : 'Account created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save account');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Error saving account');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      homestay_id: account.homestay_id,
      account_name: account.account_name,
      account_type: account.account_type,
      bank_name: account.bank_name || '',
      account_number: account.account_number || '',
      currency: account.currency,
      status: account.status
    });
    setShowModal(true);
  };

  const handleDelete = async (accountId) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/financial-accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAccounts();
        fetchStatistics();
        alert('Account deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    }
  };

  const handleToggleStatus = async (account) => {
    const newStatus = account.status === 'active' ? 'inactive' : 'active';

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/financial-accounts/${account.account_id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchAccounts();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({
      homestay_id: '',
      account_name: '',
      account_type: 'bank',
      bank_name: '',
      account_number: '',
      currency: 'RWF',
      status: 'active'
    });
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-4 h-4" />;
      case 'cash':
        return <Wallet className="w-4 h-4" />;
      case 'mobile_money':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    );
  };

  const resetFilters = () => {
    setFilterHomestay('');
    setFilterType('');
    setFilterStatus('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Accounts</h1>
        <p className="text-gray-600">Manage financial accounts for payments, expenses, and reporting</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalAccounts}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Accounts</p>
                <p className="text-2xl font-bold text-green-600">{statistics.activeAccounts}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bank Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.accountsByType?.bank || 0}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mobile Money</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.accountsByType?.mobile_money || 0}</p>
              </div>
              <Smartphone className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterHomestay}
            onChange={(e) => setFilterHomestay(e.target.value)}
          >
            <option value="">All Homestays</option>
            {Array.isArray(homestays) && homestays.map((homestay) => (
              <option key={homestay.homestay_id} value={homestay.homestay_id}>
                {homestay.name}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Homestay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank/Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No accounts found</p>
                    <p className="text-sm">Create your first financial account to get started</p>
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.account_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getAccountTypeIcon(account.account_type)}
                        <span className="font-medium text-gray-900">{account.account_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.homestay?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {account.account_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.bank_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.account_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {account.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(account)}
                        className="cursor-pointer"
                      >
                        {getStatusBadge(account.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account.account_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Homestay <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.homestay_id}
                      onChange={(e) => setFormData({ ...formData, homestay_id: e.target.value })}
                      disabled={!!editingAccount}
                    >
                      <option value="">Select Homestay</option>
                      {Array.isArray(homestays) && homestays.map((homestay) => (
                        <option key={homestay.homestay_id} value={homestay.homestay_id}>
                          {homestay.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      placeholder="e.g., Main Operating Account"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.account_type}
                      onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                    >
                      <option value="bank">Bank</option>
                      <option value="cash">Cash</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      <option value="RWF">RWF - Rwandan Franc</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>

                  {formData.account_type === 'bank' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                          placeholder="e.g., Bank of Kigali"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.account_number}
                          onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                          placeholder="e.g., 1234567890"
                        />
                      </div>
                    </>
                  )}

                  {formData.account_type === 'mobile_money' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Money Provider
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                          placeholder="e.g., MTN Mobile Money, Airtel Money"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.account_number}
                          onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                          placeholder="e.g., +250 788 123 456"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingAccount ? 'Update Account' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
