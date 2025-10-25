import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Package,
  Loader2,
  RefreshCw,
  Printer,
  Calendar,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const StockBalance = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  
  // Date range states - set to include existing stock movements
  const [fromDate, setFromDate] = useState('2025-10-25');
  const [toDate, setToDate] = useState('2025-10-25');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Company info state
  const [companyInfo, setCompanyInfo] = useState({
    logo_url: '',
    company_name: '',
    tagline: '',
    invoice_email: '',
    invoice_phone: '',
    tax_id: '',
    registration_number: ''
  });

  useEffect(() => {
    fetchStockBalance();
    fetchCompanyInfo();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stockData, searchTerm]);

  const applyFilters = () => {
    let filtered = [...stockData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const fetchStockBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters for date range
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);

      const response = await apiClient.get(`/stock/balance?${params.toString()}`);
      const responseData = response.data?.data || response.data || {};
      
      const balanceData = responseData.items || [];
      const summary = responseData.summary || {};
      
      // Process balance data
      const processedData = balanceData.map(item => ({
        ...item,
        item_name: item.item_name || item.name,
        stock_status: getStockStatus(item),
      }));
      
      setStockData(processedData);
    } catch (err) {
      console.error('Error fetching stock balance:', err);
      setError('Failed to load stock balance data');
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const response = await apiClient.get('/invoice-settings');
      if (response.data?.success) {
        const settings = response.data.data;
        setCompanyInfo({
          logo_url: settings.logo_url || '',
          company_name: settings.company_name || '',
          tagline: settings.tagline || '',
          invoice_email: settings.invoice_email || '',
          invoice_phone: settings.invoice_phone || '',
          tax_id: settings.tax_id || '',
          registration_number: settings.registration_number || ''
        });
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
      // Use default values if API fails
    }
  };

  const handleApplyFilters = () => {
    fetchStockBalance();
  };

  const getStockStatus = (item) => {
    const quantity = parseFloat(item.current_quantity || 0);
    const threshold = parseFloat(item.reorder_level || 0);
    
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= threshold) return 'low_stock';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'out_of_stock': return 'bg-red-500';
      case 'low_stock': return 'bg-yellow-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'out_of_stock': return 'Out of Stock';
      case 'low_stock': return 'Low Stock';
      case 'normal': return 'Normal';
      default: return 'Unknown';
    }
  };

  const calculateTotals = () => {
    const totalIn = filteredData.reduce((sum, item) => sum + item.stock_in, 0);
    const totalOut = filteredData.reduce((sum, item) => sum + item.stock_out, 0);
    const closingBalance = filteredData.reduce((sum, item) => sum + item.closing_balance, 0);
    
    // Get unique units to show in summary
    const units = [...new Set(filteredData.map(item => item.unit).filter(Boolean))];
    const unitText = units.length === 1 ? units[0] : `${units.length} units`;

    return {
      totalIn,
      totalOut,
      closingBalance,
      unitText,
      itemCount: filteredData.length
    };
  };

  const totals = calculateTotals();

  const handleApplyFilter = () => {
    // TODO: Implement date range filtering
    toast.success('Filter applied successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const headers = ['Item', 'Unit', 'Opening', 'In', 'Out', 'Balance', 'Price', 'Value', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        `"${item.item_name || ''}"`,
        `"${item.unit || ''}"`,
        item.opening_balance,
        item.stock_in,
        item.stock_out,
        item.closing_balance,
        item.unit_price,
        item.total_value,
        `"${getStatusText(item.stock_status)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-balance-${fromDate}-to-${toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Stock balance exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stock balance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchStockBalance}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-content, .printable-content * {
            visibility: visible;
          }
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            margin-bottom: 20px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          .print-table th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
        }
        .printable-content {
          display: none;
        }
        @media print {
          .printable-content {
            display: block !important;
          }
        }
      `}</style>

      {/* Print-Only Content */}
      <div className="printable-content hidden">
        {/* Print Header */}
        <div className="print-header">
          <div className="text-center mb-6">
            {/* Company Logo */}
            <div className="flex justify-center mb-4">
              {companyInfo.logo_url ? (
                <img
                  src={`http://localhost:3001${companyInfo.logo_url}`}
                  alt="Company Logo"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center ${companyInfo.logo_url ? 'hidden' : ''}`}>
                <span className="text-white font-bold text-xl">
                  {companyInfo.company_name ? companyInfo.company_name.charAt(0).toUpperCase() : 'SP'}
                </span>
              </div>
            </div>
            
            {/* Company Information */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {companyInfo.company_name || 'CENTRE SAINT PAUL'}
              </h1>
              {companyInfo.tagline && (
                <p className="text-lg text-blue-600 underline mb-2">{companyInfo.tagline}</p>
              )}
              {companyInfo.invoice_email && (
                <p className="text-sm text-gray-700 mb-1">Email: {companyInfo.invoice_email}</p>
              )}
              {companyInfo.invoice_phone && (
                <p className="text-sm text-gray-700 mb-1">Phone: {companyInfo.invoice_phone}</p>
              )}
              {companyInfo.tax_id && (
                <p className="text-sm text-gray-700 mb-1">TIN/VAT Number: {companyInfo.tax_id}</p>
              )}
              {companyInfo.registration_number && (
                <p className="text-sm text-gray-700 mb-4">Registration: {companyInfo.registration_number}</p>
              )}
              
              <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Table</h2>
              <p className="text-sm text-gray-600 mb-4">
                Period: {fromDate} to {toDate}
              </p>
            </div>
          </div>
        </div>

        {/* Print Table */}
        <table className="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Unit</th>
              <th>Opening</th>
              <th>In</th>
              <th>Out</th>
              <th>Balance</th>
              <th>Price</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.item_id}>
                <td>{index + 1}</td>
                <td>{item.item_name}</td>
                <td>{item.unit}</td>
                <td>{item.opening_balance.toFixed(2)} {item.unit}</td>
                <td className="text-green-600 font-medium">{item.stock_in.toFixed(2)} {item.unit}</td>
                <td className="text-red-600 font-medium">{item.stock_out.toFixed(2)} {item.unit}</td>
                <td className="font-bold">{item.closing_balance.toFixed(2)} {item.unit}</td>
                <td>{item.unit_price.toLocaleString()}</td>
                <td>{item.total_value.toLocaleString()}</td>
                <td>{getStatusText(item.stock_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Regular Web Content */}
      <div className="min-h-screen bg-gray-50 no-print">
          {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Store Inventory Balance
            </h1>
            <p className="text-gray-600 mt-1">
              {fromDate} to {toDate}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Report Section */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Report</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">FROM DATE</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">TO DATE</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Apply
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Table
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">TOTAL IN</p>
                <p className="text-3xl font-bold text-green-600">{totals.totalIn.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{totals.unitText}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">TOTAL OUT</p>
                <p className="text-3xl font-bold text-red-600">{totals.totalOut.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{totals.unitText}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CLOSING BALANCE</p>
                <p className="text-3xl font-bold text-gray-900">{totals.closingBalance.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{totals.unitText}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ITEM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UNIT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      OPENING
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      OUT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BALANCE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRICE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VALUE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.item_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.item_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.opening_balance.toFixed(2)} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {item.stock_in.toFixed(2)} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {item.stock_out.toFixed(2)} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.closing_balance.toFixed(2)} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RWF {item.unit_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        RWF {item.total_value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(item.stock_status)}`}></div>
                          <span className="text-sm text-gray-900">
                            {getStatusText(item.stock_status)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default StockBalance;