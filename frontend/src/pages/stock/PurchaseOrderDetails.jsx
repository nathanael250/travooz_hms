import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({});
  const [reportSettings, setReportSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    fetchCompanyInfo();
    fetchReportSettings();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/stock/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      // Fetch both invoice settings and report settings
      const [invoiceResponse, reportResponse] = await Promise.all([
        apiClient.get('/invoice-settings'),
        apiClient.get('/report-settings')
      ]);

      let invoiceSettings = {};
      let reportSettings = {};

      if (invoiceResponse.data?.success) {
        invoiceSettings = invoiceResponse.data.data;
      }

      if (reportResponse.data?.success) {
        reportSettings = reportResponse.data.data;
      }

      setCompanyInfo({
        company_name: invoiceSettings.company_name || 'Your Company Name',
        tagline: invoiceSettings.tagline || '',
        address: invoiceSettings.address || 'Your Address',
        phone: invoiceSettings.invoice_phone || 'Your Phone',
        email: invoiceSettings.invoice_email || 'Your Email',
        tax_id: invoiceSettings.tax_id || 'Your TIN',
        logo_url: reportSettings.header_logo_url || invoiceSettings.logo_url || ''
      });
    } catch (error) {
      console.error('Error fetching company info:', error);
      // Use default values if API fails
      setCompanyInfo({
        company_name: 'Your Company Name',
        tagline: '',
        address: 'Your Address',
        phone: 'Your Phone',
        email: 'Your Email',
        tax_id: 'Your TIN',
        logo_url: ''
      });
    }
  };

  const fetchReportSettings = async () => {
    try {
      const response = await apiClient.get('/report-settings');
      if (response.data?.success) {
        setReportSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report settings:', error);
      // Use default values if API fails
      setReportSettings({
        default_page_orientation: 'portrait',
        report_font_family: 'Arial',
        report_font_size: 12,
        report_line_height: 1.4,
        report_primary_color: '#2563EB',
        table_border_style: 'solid',
        table_border_width: 1,
        table_border_color: '#000000',
        table_header_background: '#F5F5F5',
        table_cell_padding: 8
      });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Verification';
      case 'verified': return 'Verified - Pending Approval';
      case 'approved': return 'Approved - Ready to Send';
      case 'sent': return 'Sent to Supplier';
      case 'received': return 'Received';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-indigo-100 text-indigo-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    // Use browser's built-in print functionality directly
    window.print();
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    toast.success('PDF export functionality coming soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading purchase order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The purchase order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/stock/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Purchase Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles - Global */}
      <style jsx global>{`
        @media print {
          /* Hide everything except print content */
          body * {
            visibility: hidden !important;
          }
          
          .print-only, .print-only * {
            visibility: visible !important;
          }
          
          .print-only {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            font-family: ${reportSettings.report_font_family || 'Arial'}, sans-serif !important;
            font-size: ${reportSettings.report_font_size || 12}px !important;
            line-height: ${reportSettings.report_line_height || 1.4} !important;
          }
          
          .print-page { 
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          .print-header { 
            margin-bottom: 30px !important;
            text-align: center !important;
          }
          
          .print-header img {
            height: 60px !important;
            margin-bottom: 10px !important;
          }
          
          .print-header h1 {
            font-size: 24px !important;
            font-weight: bold !important;
            margin: 10px 0 !important;
          }
          
          .print-header p {
            margin: 2px 0 !important;
            font-size: 11px !important;
          }
          
          .print-content { 
            margin-bottom: 20px !important;
          }
          
          .print-table { 
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 20px 0 !important;
          }
          
          .print-table th, .print-table td {
            border: ${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'} !important;
            padding: ${reportSettings.table_cell_padding || 8}px !important;
            text-align: left !important;
            background: white !important;
          }
          
          .print-table th {
            background-color: ${reportSettings.table_header_background || '#F5F5F5'} !important;
            font-weight: bold !important;
          }
          
          .print-signatures {
            margin-top: 40px !important;
            display: flex !important;
            justify-content: space-between !important;
          }
          
          .print-signature-box {
            width: 200px !important;
            text-align: center !important;
          }
          
          .print-signature-line {
            border-bottom: 1px solid #000 !important;
            margin-top: 30px !important;
            height: 20px !important;
          }
        }
      `}</style>

      {/* Regular Web Content */}
      <div className="min-h-screen bg-gray-50">
        {/* Regular Web Content */}
        <div className="no-print">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/stock/orders')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Purchase Order Details
                    </h1>
                    <p className="text-gray-600">
                      {order.order_number || `PO-${order.order_id}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Order Number:</span> {order.order_number || `PO-${order.order_id}`}</p>
                  <p><span className="font-medium">Supplier:</span> {order.supplier?.name || 'Unknown Supplier'}</p>
                  <p><span className="font-medium">Order Date:</span> {new Date(order.order_date || order.created_at).toLocaleDateString()}</p>
                  <p><span className="font-medium">Expected Delivery:</span> {order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Total Amount:</span> RWF {parseFloat(order.total_amount || 0).toLocaleString()}</p>
                  <p><span className="font-medium">Items Count:</span> {order.items?.length || 0} items</p>
                  <p><span className="font-medium">Status:</span> {getStatusText(order.status)}</p>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.notes}</p>
              </div>
            )}

            {/* Items Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.item?.name || item.item_name || 'Unknown Item'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.item?.unit || 'pcs'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(item.quantity_ordered || item.quantity || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          RWF {parseFloat(item.unit_price || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          RWF {parseFloat(item.total_price || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="px-6 py-4 text-right text-sm font-bold text-gray-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        RWF {parseFloat(order.total_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className="print-only print-page">
        {/* Company Header */}
        <div className="print-header text-center">
          {companyInfo.logo_url && (
            <div className="mb-4">
              <img 
                src={companyInfo.logo_url.startsWith('http') ? companyInfo.logo_url : `http://localhost:3001${companyInfo.logo_url}`} 
                alt="Company Logo" 
                className="h-16 mx-auto" 
              />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-2">{companyInfo.company_name}</h1>
          {companyInfo.tagline && <p className="text-sm text-gray-600 mb-4">{companyInfo.tagline}</p>}
          <div className="text-sm text-gray-600">
            <p>{companyInfo.address}</p>
            <p>TIN/VAT Number: {companyInfo.tax_id}</p>
            <p>Phone: {companyInfo.phone}</p>
            <p>Email: {companyInfo.email}</p>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">LOCAL PURCHASE ORDER</h2>
        </div>

        {/* Order Details */}
        <div className="print-content mb-6">
          <div className="flex justify-between items-center mb-4">
            <p><strong>LPO Number:</strong> {order.order_number || `PO-${order.order_id}`}</p>
            <p><strong>DATE:</strong> {new Date(order.order_date || order.created_at).toLocaleDateString()}</p>
          </div>
          <p><strong>Supplier:</strong> {order.supplier?.name || 'Unknown Supplier'}</p>
        </div>

        {/* Items Table */}
          <table 
            className="print-table"
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`
            }}
          >
            <thead>
              <tr style={{ backgroundColor: reportSettings.table_header_background || '#F5F5F5' }}>
                <th style={{ 
                  border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                  padding: `${reportSettings.table_cell_padding || 8}px`
                }}>#</th>
                <th style={{ 
                  border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                  padding: `${reportSettings.table_cell_padding || 8}px`
                }}>Item</th>
                <th style={{ 
                  border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                  padding: `${reportSettings.table_cell_padding || 8}px`
                }}>QTY</th>
                <th style={{ 
                  border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                  padding: `${reportSettings.table_cell_padding || 8}px`
                }}>U.P</th>
                <th style={{ 
                  border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                  padding: `${reportSettings.table_cell_padding || 8}px`
                }}>T.P</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td style={{ 
                    border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                    padding: `${reportSettings.table_cell_padding || 8}px`
                  }}>{index + 1}</td>
                  <td style={{ 
                    border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                    padding: `${reportSettings.table_cell_padding || 8}px`
                  }}>{item.item?.name || item.item_name || 'Unknown Item'}</td>
                  <td style={{ 
                    border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                    padding: `${reportSettings.table_cell_padding || 8}px`
                  }}>{parseFloat(item.quantity_ordered || item.quantity || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td style={{ 
                    border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                    padding: `${reportSettings.table_cell_padding || 8}px`
                  }}>{parseFloat(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td style={{ 
                    border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                    padding: `${reportSettings.table_cell_padding || 8}px`
                  }}>{parseFloat(item.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="4" className="text-right font-bold" style={{ 
                  border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                  padding: `${reportSettings.table_cell_padding || 8}px`
                }}>Total</td>
                <td className="font-bold" style={{ 
                  border: `${reportSettings.table_border_width || 1}px ${reportSettings.table_border_style || 'solid'} ${reportSettings.table_border_color || '#000000'}`,
                  padding: `${reportSettings.table_cell_padding || 8}px`
                }}>{parseFloat(order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
              </tr>
            </tbody>
          </table>

        {/* Signatures */}
        <div className="print-signatures">
          <div className="print-signature-box">
            <p className="font-bold">Store Keeper</p>
            <p className="text-sm">Ordered by: {order.creator?.name || 'Administrator'}</p>
            <div className="print-signature-line"></div>
            <p className="text-sm mt-2">Signature ....................</p>
          </div>
          <div className="print-signature-box">
            <p className="font-bold">Controller</p>
            <p className="text-sm">Verified by: ....................</p>
            <div className="print-signature-line"></div>
            <p className="text-sm mt-2">Signature ....................</p>
          </div>
          <div className="print-signature-box">
            <p className="font-bold">DAF</p>
            <p className="text-sm">Verified by: ....................</p>
            <div className="print-signature-line"></div>
            <p className="text-sm mt-2">Signature ....................</p>
          </div>
          <div className="print-signature-box">
            <p className="font-bold">Managing Director</p>
            <p className="text-sm">Approved: ....................</p>
            <div className="print-signature-line"></div>
            <p className="text-sm mt-2">Signature ....................</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default PurchaseOrderDetails;

