import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  PieChart,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

export const AccountantDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    revenueToday: 0,
    revenueMonth: 0,
    outstandingInvoices: 0,
    pendingPayments: 0,
    recentTransactions: [],
    monthlyRevenue: [],
    revenueBySource: [],
    outstandingInvoicesList: [],
    expensesSummary: {},
    accountSummary: {}
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchFinancialData();
    return () => clearInterval(timer);
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple financial data sources in parallel
      const [
        invoicesResponse,
        paymentsResponse,
        accountsResponse
      ] = await Promise.allSettled([
        apiClient.get('/invoices'),
        apiClient.get('/reports/invoices'),
        apiClient.get('/financial-accounts')
      ]);

      // Process invoices data
      let invoices = [];
      if (invoicesResponse.status === 'fulfilled') {
        invoices = invoicesResponse.value.data?.data || invoicesResponse.value.data || [];
      }

      // Process payments data
      let payments = [];
      if (paymentsResponse.status === 'fulfilled') {
        payments = paymentsResponse.value.data?.data || paymentsResponse.value.data || [];
      }

      // Process accounts data
      let accounts = [];
      if (accountsResponse.status === 'fulfilled') {
        accounts = accountsResponse.value.data || [];
      }

      // Calculate financial metrics
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();

      // Calculate revenue today
      const revenueToday = payments
        .filter(payment => new Date(payment.payment_date || payment.created_at).toDateString() === today)
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

      // Calculate revenue this month
      const revenueMonth = payments
        .filter(payment => {
          const paymentDate = new Date(payment.payment_date || payment.created_at);
          return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
        })
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

      // Calculate outstanding invoices
      const outstandingInvoices = invoices
        .filter(invoice => invoice.status !== 'paid')
        .reduce((sum, invoice) => sum + (parseFloat(invoice.balance_due) || parseFloat(invoice.total_amount) || 0), 0);

      // Count pending payments
      const pendingPayments = payments.filter(payment => payment.status === 'pending').length;

      // Process recent transactions
      const recentTransactions = payments
        .slice(0, 4)
        .map(payment => ({
          id: payment.transaction_id || payment.id,
          type: 'payment',
          description: payment.reference_number || 'Payment Transaction',
          amount: parseFloat(payment.amount) || 0,
          status: payment.status || 'completed',
          time: getTimeAgo(payment.payment_date || payment.created_at)
        }));

      // Generate monthly revenue data (last 6 months)
      const monthlyRevenue = generateMonthlyRevenueData(payments);

      // Calculate revenue by source
      const revenueBySource = calculateRevenueBySource(payments);

      // Process outstanding invoices list
      const outstandingInvoicesList = invoices
        .filter(invoice => invoice.status !== 'paid')
        .slice(0, 3)
        .map(invoice => ({
          id: invoice.invoice_id,
          invoice: invoice.invoice_number || `INV-${invoice.invoice_id}`,
          guest: invoice.guest_name || 'Guest',
          amount: parseFloat(invoice.balance_due) || parseFloat(invoice.total_amount) || 0,
          dueDate: invoice.due_date || invoice.invoice_date,
          daysOverdue: calculateDaysOverdue(invoice.due_date || invoice.invoice_date)
        }));

      // Mock expenses summary (would need separate API)
      const expensesSummary = {
        salaries: 12000000,
        utilities: 3500000,
        supplies: 2800000,
        maintenance: 1900000,
        other: 1500000
      };

      // Calculate account summary
      const totalAssets = accounts.reduce((sum, account) => sum + (parseFloat(account.balance) || 0), 0);
      const totalLiabilities = 125000000; // Would need separate API
      const netProfit = revenueMonth - Object.values(expensesSummary).reduce((a, b) => a + b, 0);
      const profitMargin = revenueMonth > 0 ? (netProfit / revenueMonth) * 100 : 0;

      setDashboardData({
        revenueToday,
        revenueMonth,
        outstandingInvoices,
        pendingPayments,
        recentTransactions,
        monthlyRevenue,
        revenueBySource,
        outstandingInvoicesList,
        expensesSummary,
        accountSummary: {
          totalAssets,
          totalLiabilities,
          netProfit,
          profitMargin
        }
      });

    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to load financial data');
      
      // Set default empty data to prevent crashes
      setDashboardData({
        revenueToday: 0,
        revenueMonth: 0,
        outstandingInvoices: 0,
        pendingPayments: 0,
        recentTransactions: [],
        monthlyRevenue: [],
        revenueBySource: [],
        outstandingInvoicesList: [],
        expensesSummary: {},
        accountSummary: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const calculateDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const generateMonthlyRevenueData = (payments) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date || payment.created_at);
        return paymentDate.getMonth() === monthIndex;
      });
      
      const revenue = monthPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
      
      return {
        month,
        revenue,
        target: revenue * 1.1 // Mock target
      };
    });
  };

  const calculateRevenueBySource = (payments) => {
    const sources = {
      'Room Bookings': 0,
      'Restaurant': 0,
      'Laundry': 0,
      'Other Services': 0
    };

    payments.forEach(payment => {
      const amount = parseFloat(payment.amount) || 0;
      // Categorize based on payment description or type
      if (payment.description?.toLowerCase().includes('room') || payment.description?.toLowerCase().includes('booking')) {
        sources['Room Bookings'] += amount;
      } else if (payment.description?.toLowerCase().includes('restaurant') || payment.description?.toLowerCase().includes('food')) {
        sources['Restaurant'] += amount;
      } else if (payment.description?.toLowerCase().includes('laundry')) {
        sources['Laundry'] += amount;
      } else {
        sources['Other Services'] += amount;
      }
    });

    const total = Object.values(sources).reduce((a, b) => a + b, 0);
    
    return Object.entries(sources).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0
    }));
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchFinancialData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Financial Dashboard</h1>
            <p className="text-green-100 mt-1 text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">Welcome</p>
            <p className="font-semibold">{user?.name || 'Accountant'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 bg-gray-50">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Revenue Today"
            value={`RWF ${(dashboardData.revenueToday / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Revenue This Month"
            value={`RWF ${(dashboardData.revenueMonth / 1000000).toFixed(1)}M`}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Outstanding Invoices"
            value={`RWF ${(dashboardData.outstandingInvoices / 1000000).toFixed(1)}M`}
            icon={FileText}
            color="orange"
          />
          <StatCard
            title="Pending Payments"
            value={dashboardData.pendingPayments}
            icon={AlertCircle}
            color="red"
          />
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Monthly Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => `RWF ${(value / 1000000).toFixed(1)}M`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="target" fill="#93C5FD" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.type === 'payment'
                          ? 'bg-green-100 text-green-700'
                          : transaction.type === 'invoice'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {transaction.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      RWF {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-900 mb-1">{transaction.description}</div>
                  <div className="text-xs text-gray-500">{transaction.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Source */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              Revenue by Source
            </h3>
            <div className="space-y-3">
              {dashboardData.revenueBySource.map((source, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{source.name}</div>
                    <div className="text-sm font-semibold text-gray-600">{source.percentage}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      RWF {(source.amount / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-orange-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Outstanding Invoices
          </h3>
          <div className="space-y-3">
            {dashboardData.outstandingInvoicesList.map((invoice) => (
              <div key={invoice.id} className={`p-3 rounded-lg border-l-4 ${
                invoice.daysOverdue > 0
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{invoice.invoice}</div>
                    <div className="text-sm text-gray-600">{invoice.guest}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">
                      RWF {invoice.amount.toLocaleString()}
                    </div>
                    {invoice.daysOverdue > 0 && (
                      <div className="text-xs text-red-600 font-medium">
                        {invoice.daysOverdue} days overdue
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Due Date: <span className="font-medium">{invoice.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Summary & Account Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              Monthly Expenses
            </h3>
            <div className="space-y-3">
              {Object.entries(dashboardData.expensesSummary).map(([key, value], index) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900 capitalize">{key}</span>
                  <span className="font-semibold text-red-600">
                    RWF {(value / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-gray-900">Total Expenses</span>
                  <span className="text-red-600">
                    RWF {(Object.values(dashboardData.expensesSummary).reduce((a, b) => a + b, 0) / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm p-4 border border-green-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Account Summary
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total Assets</div>
                <div className="text-2xl font-bold text-blue-600">
                  RWF {(dashboardData.accountSummary.totalAssets / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total Liabilities</div>
                <div className="text-2xl font-bold text-red-600">
                  RWF {(dashboardData.accountSummary.totalLiabilities / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600">Net Profit (This Month)</div>
                <div className="text-2xl font-bold text-green-600">
                  RWF {(dashboardData.accountSummary.netProfit / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Profit Margin: {dashboardData.accountSummary.profitMargin}%
                </div>
              </div>
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
    red: { bg: 'bg-red-500', border: 'border-red-200' }
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
