import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Package,
  Truck,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const DeliveryNoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deliveryNote, setDeliveryNote] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'Your Company Name',
    tagline: '',
    address: 'Your Address',
    phone: 'Your Phone',
    email: 'Your Email',
    tax_id: 'Your TIN',
    logo_url: ''
  });

  useEffect(() => {
    fetchDeliveryNote();
    fetchCompanyInfo();
  }, [id]);

  const fetchDeliveryNote = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/delivery-notes/${id}`);
      if (response.data?.success) {
        setDeliveryNote(response.data.data);
      } else {
        toast.error('Failed to fetch delivery note');
        navigate('/stock/delivery-notes');
      }
    } catch (error) {
      console.error('Error fetching delivery note:', error);
      toast.error('Failed to fetch delivery note');
      navigate('/stock/delivery-notes');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'damaged': return <AlertTriangle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'damaged': return 'text-red-600';
      case 'rejected': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'good': return 'text-green-600';
      case 'damaged': return 'text-red-600';
      case 'defective': return 'text-red-600';
      case 'expired': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery note...</p>
        </div>
      </div>
    );
  }

  if (!deliveryNote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Delivery note not found</p>
          <button
            onClick={() => navigate('/stock/delivery-notes')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Delivery Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/stock/delivery-notes')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Truck className="h-8 w-8 text-blue-600" />
                  Delivery Note Details
                </h1>
                <p className="text-gray-600 mt-1">
                  {deliveryNote.delivery_number}
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivery Number</p>
                <p className="text-lg font-semibold text-gray-900">{deliveryNote.delivery_number}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                {getStatusIcon(deliveryNote.delivery_status)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-lg font-semibold capitalize ${getStatusColor(deliveryNote.delivery_status)}`}>
                  {deliveryNote.delivery_status}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivery Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(deliveryNote.delivery_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Received By</p>
                <p className="text-lg font-semibold text-gray-900">
                  {deliveryNote.receiver?.name || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Delivery Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Reference</label>
                <p className="text-sm text-gray-900">{deliveryNote.order?.order_number || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <p className="text-sm text-gray-900">{deliveryNote.supplier?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items Expected</label>
                <p className="text-sm text-gray-900">{deliveryNote.total_items_expected || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items Received</label>
                <p className="text-sm text-gray-900">{deliveryNote.total_items_received || 0}</p>
              </div>
            </div>

            {deliveryNote.delivery_notes && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{deliveryNote.delivery_notes}</p>
              </div>
            )}

            {deliveryNote.condition_notes && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition Notes</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{deliveryNote.condition_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        {deliveryNote.items && deliveryNote.items.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Delivery Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Damaged</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveryNote.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.item?.name || 'Unknown Item'}</div>
                          <div className="text-sm text-gray-500">{item.item?.unit || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity_expected}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity_received}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity_damaged || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity_missing || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition_status)}`}>
                          {item.condition_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.condition_notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
          <h2 className="text-3xl font-bold mb-4">DELIVERY NOTE</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Delivery Number: {deliveryNote.delivery_number}</p>
              <p className="text-sm font-medium">Order Reference: {deliveryNote.order?.order_number || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Date: {new Date(deliveryNote.delivery_date).toLocaleDateString()}</p>
              <p className="text-sm font-medium">Supplier: {deliveryNote.supplier?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Delivery Items Table */}
        <div className="print-content">
          <table className="print-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Expected</th>
                <th>Received</th>
                <th>Damaged</th>
                <th>Missing</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {deliveryNote.items && deliveryNote.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.item?.name || 'Unknown Item'}</td>
                  <td>{item.quantity_expected}</td>
                  <td>{item.quantity_received}</td>
                  <td>{item.quantity_damaged || 0}</td>
                  <td>{item.quantity_missing || 0}</td>
                  <td>{item.condition_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Delivery Summary:</h4>
              <p>Total Items Expected: {deliveryNote.total_items_expected || 0}</p>
              <p>Total Items Received: {deliveryNote.total_items_received || 0}</p>
              <p>Delivery Status: {deliveryNote.delivery_status.toUpperCase()}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Received By:</h4>
              <p>Name: {deliveryNote.receiver?.name || 'Not specified'}</p>
              <p>Date: {new Date(deliveryNote.delivery_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(deliveryNote.delivery_notes || deliveryNote.condition_notes) && (
          <div className="mt-8">
            <h4 className="font-semibold mb-2">Notes:</h4>
            {deliveryNote.delivery_notes && (
              <p className="mb-2"><strong>Delivery Notes:</strong> {deliveryNote.delivery_notes}</p>
            )}
            {deliveryNote.condition_notes && (
              <p><strong>Condition Notes:</strong> {deliveryNote.condition_notes}</p>
            )}
          </div>
        )}

        {/* Signatures */}
        <div className="print-signatures mt-12">
          <div className="print-signature-box">
            <p className="font-semibold">Received By:</p>
            <div className="print-signature-line"></div>
            <p className="text-sm mt-2">Signature & Date</p>
          </div>
          <div className="print-signature-box">
            <p className="font-semibold">Delivered By:</p>
            <div className="print-signature-line"></div>
            <p className="text-sm mt-2">Signature & Date</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
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
            font-family: Arial, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
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
            border: 1px solid #000000 !important;
            padding: 8px !important;
            text-align: left !important;
            background: white !important;
          }
          
          .print-table th {
            background-color: #F5F5F5 !important;
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
    </div>
  );
};

export default DeliveryNoteDetails;
