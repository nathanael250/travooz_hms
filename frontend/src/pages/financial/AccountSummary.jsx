import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  CreditCard,
  Building2,
  Wallet,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AccountSummary = () => {
  const [accounts, setAccounts] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomestay, setSelectedHomestay] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [statistics, setStatistics] = useState(null);

  // Mock transaction data (replace with actual API calls)
  const [accountSummaries, setAccountSummaries] = useState([]);

  useEffect(() => {
    fetchAccounts();
    fetchHomestays();
    fetchStatistics();
    fetchAccountSummaries();
  }, [selectedHomestay, selectedAccount, dateRange]);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();
      if (selectedHomestay) params.append('homestay_id', selectedHomestay);
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
      if (selectedHomestay) params.append('homestay_id', selectedHomestay);

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

  const fetchAccountSummaries = () => {
    // Mock data - replace with actual API calls to transactions
    // This would aggregate from booking_charges, payment_transactions, money_transactions, etc.
    const mockSummaries = accounts.map(account => ({
      account_id: account.account_id,
      account_name: account.account_name,
      account_type: account.account_type,
      currency: account.currency,
      total_inflow: Math.floor(Math.random() * 5000000) + 1000000,
      total_outflow: Math.floor(Math.random() * 2000000) + 500000,
      balance: 0, // Will be calculated
      transaction_count: Math.floor(Math.random() * 100) + 20,
      linked_services: Math.floor(Math.random() * 10) + 1,
      last_transaction_date: new Date().toISOString()
    }));

    // Calculate balance
    mockSummaries.forEach(summary => {
      summary.balance = summary.total_inflow - summary.total_outflow;
    });

    setAccountSummaries(mockSummaries);
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5" />;
      case 'cash':
        return <Wallet className="w-5 h-5" />;
      case 'mobile_money':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount, currency = 'RWF') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredSummaries = selectedAccount
    ? accountSummaries.filter(s => s.account_id === parseInt(selectedAccount))
    : accountSummaries;

  const totalInflow = filteredSummaries.reduce((sum, s) => sum + s.total_inflow, 0);
  const totalOutflow = filteredSummaries.reduce((sum, s) => sum + s.total_outflow, 0);
  const netFlow = totalInflow - totalOutflow;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading account summaries...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Summary</h1>
        <p className="text-gray-600">View financial activity and balances across all accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedHomestay}
            onChange={(e) => setSelectedHomestay(e.target.value)}
          >
            <option value="">All Homestays</option>
            {homestays.map((homestay) => (
              <option key={homestay.homestay_id} value={homestay.homestay_id}>
                {homestay.name}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.account_id} value={account.account_id}>
                {account.account_name}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Inflow</span>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalInflow)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Revenue & Receipts</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Outflow</span>
            <ArrowDownRight className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalOutflow)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Expenses & Payments</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Net Flow</span>
            {netFlow >= 0 ? (
              <TrendingUp className="w-5 h-5 text-blue-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-orange-500" />
            )}
          </div>
          <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatCurrency(netFlow)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Profit/Loss</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active Accounts</span>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {statistics?.activeAccounts || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Total: {statistics?.totalAccounts || 0}</p>
        </div>
      </div>

      {/* Account Summaries */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inflow
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outflow
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Linked Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No account data available</p>
                    <p className="text-sm">Create accounts and start tracking transactions</p>
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((summary) => (
                  <tr key={summary.account_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getAccountTypeIcon(summary.account_type)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{summary.account_name}</div>
                          <div className="text-xs text-gray-500">{summary.currency}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {summary.account_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-green-600">
                        +{formatCurrency(summary.total_inflow, summary.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-red-600">
                        -{formatCurrency(summary.total_outflow, summary.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${
                        summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {formatCurrency(summary.balance, summary.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {summary.transaction_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {summary.linked_services}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(summary.last_transaction_date)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Account Activity Tracking</h3>
            <p className="text-sm text-blue-800">
              Financial data is aggregated from booking charges, payment transactions, stock movements, and other
              operational activities linked to each account. Use the filters to analyze specific periods or accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
