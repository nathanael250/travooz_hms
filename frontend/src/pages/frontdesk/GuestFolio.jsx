import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Trash2,
  Printer,
  Mail,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Home,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const GuestFolio = () => {
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [folioData, setFolioData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [chargeForm, setChargeForm] = useState({
    category: '',
    description: '',
    amount: 0,
    quantity: 1,
    date: new Date().toISOString().split('T')[0]
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash',
    reference: '',
    notes: ''
  });
  const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
  const [showGenerateInvoiceModal, setShowGenerateInvoiceModal] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    tax_rate: 18,
    service_charge_rate: 0,
    discount_amount: 0,
    payment_terms: 'Due on receipt',
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      fetchInHouseGuests();
    } else {
      console.warn('⚠️ No token available. User may need to login.');
      setGuests([]);
      setLoading(false);
    }
  }, []);

  const fetchInHouseGuests = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching guests using apiClient...');
      const response = await apiClient.get('/front-desk/in-house-guests');
      
      // API returns { data: { guests: [...], total: ... } }
      let guestsData = response.data?.data?.guests || [];
      
      if (!Array.isArray(guestsData)) {
        console.warn('⚠️ Guests data is not an array');
        guestsData = [];
      } else if (guestsData.length > 0) {
        // Transform API response to match expected format
        guestsData = guestsData.map(guest => ({
          id: guest.booking_id || guest.id,
          bookingId: guest.booking_reference || guest.bookingId,
          guestName: guest.guest_name || guest.guestName || 'Unknown',
          roomNumber: guest.room_number || guest.unit_number || guest.roomNumber || '',
          checkInDate: guest.check_in_date || guest.checkInDate,
          checkOutDate: guest.check_out_date || guest.checkOutDate
        }));
      }
      
      console.log('✅ Transformed guest list:', guestsData);
      setGuests(guestsData);
    } catch (error) {
      console.error('❌ Error fetching guests:', error);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  const getMockGuests = () => [
    {
      id: 1,
      bookingId: 'BK-2024-101',
      guestName: 'Michael Anderson',
      roomNumber: '305',
      checkInDate: '2024-01-10',
      checkOutDate: '2024-01-20'
    },
    {
      id: 2,
      bookingId: 'BK-2024-102',
      guestName: 'Sophie Martin',
      roomNumber: '208',
      checkInDate: '2024-01-12',
      checkOutDate: '2024-01-18'
    }
  ];

  const fetchGuestFolio = async (guestId) => {
    try {
      setLoading(true);
      console.log('📋 Fetching folio for guest:', guestId);
      const response = await apiClient.get(`/front-desk/folio/${guestId}`);
      
      if (response.data?.success) {
        setFolioData(response.data?.data);
        console.log('✅ Folio data received:', response.data?.data);
      } else {
        console.error('❌ API returned unsuccessful response:', response.data);
        setFolioData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching folio:', error);
      setFolioData(null);
    } finally {
      setLoading(false);
    }
  };

  const getMockFolio = () => ({
    charges: [
      { id: 1, date: '2024-01-10', category: 'Room', description: 'Room Charge - Night 1', amount: 150000, quantity: 1 },
      { id: 2, date: '2024-01-11', category: 'Room', description: 'Room Charge - Night 2', amount: 150000, quantity: 1 },
      { id: 3, date: '2024-01-11', category: 'Restaurant', description: 'Dinner', amount: 45000, quantity: 1 },
      { id: 4, date: '2024-01-12', category: 'Minibar', description: 'Beverages', amount: 15000, quantity: 1 },
      { id: 5, date: '2024-01-12', category: 'Laundry', description: 'Laundry Service', amount: 25000, quantity: 1 }
    ],
    payments: [
      { id: 1, date: '2024-01-10', method: 'Credit Card', amount: 300000, reference: 'CC-001', notes: 'Advance payment' },
      { id: 2, date: '2024-01-12', method: 'Cash', amount: 50000, reference: 'CASH-001', notes: 'Partial payment' }
    ],
    summary: {
      totalCharges: 535000,
      totalPayments: 350000,
      balance: 185000
    }
  });

  const handleSelectGuest = (guest) => {
    setSelectedGuest(guest);
    fetchGuestFolio(guest.id);
  };

  const handleAddCharge = async () => {
    try {
      if (!selectedGuest) return;
      
      console.log('💰 Adding charge for guest:', selectedGuest.id);
      const response = await apiClient.post(
        `/front-desk/folio/${selectedGuest.id}/charge`,
        chargeForm
      );

      if (response.data?.success) {
        toast.success('Charge added successfully!');
        setShowAddChargeModal(false);
        fetchGuestFolio(selectedGuest.id);
        setChargeForm({
          category: '',
          description: '',
          amount: 0,
          quantity: 1,
          date: new Date().toISOString().split('T')[0]
        });
      } else {
        toast.error(response.data?.message || 'Failed to add charge');
      }
    } catch (error) {
      console.error('❌ Error adding charge:', error);
      toast.error(error.response?.data?.message || 'Failed to add charge');
    }
  };

  const handleAddPayment = async () => {
    try {
      if (!selectedGuest) return;
      
      console.log('💳 Recording payment for guest:', selectedGuest.id);
      const response = await apiClient.post(
        `/front-desk/folio/${selectedGuest.id}/payment`,
        paymentForm
      );

      if (response.data?.success) {
        toast.success('Payment recorded successfully!');
        setShowPaymentModal(false);
        fetchGuestFolio(selectedGuest.id);
        setPaymentForm({
          amount: 0,
          method: 'cash',
          reference: '',
          notes: ''
        });
      } else {
        toast.error(response.data?.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('❌ Error adding payment:', error);
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const handlePrintFolio = async () => {
    try {
      if (!selectedGuest) {
        toast.error('No guest selected');
        return;
      }

      // Check if invoice exists for this booking
      try {
        const response = await apiClient.get(`/invoices/booking/${selectedGuest.id}`);
        
        if (response.data?.success && response.data?.data) {
          const invoice = response.data.data;
          // Fetch PDF with authentication
          await printInvoicePDF(invoice.invoice_id);
          return;
        }
      } catch (error) {
        // Invoice doesn't exist, continue to generate one
        console.log('No existing invoice found, will generate one');
      }

      // Generate invoice first, then print
      toast.info('Generating invoice first...');
      
      try {
        await handleGenerateInvoice();
        
        // Wait a moment for invoice generation to complete, then try to print
        setTimeout(async () => {
          try {
            const invoiceResponse = await apiClient.get(`/invoices/booking/${selectedGuest.id}`);
            if (invoiceResponse.data?.success && invoiceResponse.data?.data) {
              const invoice = invoiceResponse.data.data;
              await printInvoicePDF(invoice.invoice_id);
            } else {
              toast.error('Failed to generate invoice for printing');
            }
          } catch (error) {
            console.error('Error fetching generated invoice:', error);
            toast.error('Failed to open invoice for printing');
          }
        }, 2000); // Reduced timeout since we handle the error gracefully now
      } catch (error) {
        // If invoice generation fails (e.g., already exists), try to print existing invoice
        if (error.response?.data?.message?.includes('Invoice already exists')) {
          try {
            const invoiceResponse = await apiClient.get(`/invoices/booking/${selectedGuest.id}`);
            if (invoiceResponse.data?.success && invoiceResponse.data?.data) {
              const invoice = invoiceResponse.data.data;
              await printInvoicePDF(invoice.invoice_id);
            }
          } catch (fetchError) {
            console.error('Error fetching existing invoice:', fetchError);
            toast.error('Failed to open invoice for printing');
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    } catch (error) {
      console.error('Error printing folio:', error);
      toast.error('Failed to print folio');
    }
  };

  const printInvoicePDF = async (invoiceId) => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`http://localhost:3001/api/invoices/${invoiceId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open PDF in new tab for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
        toast.success('Invoice opened for printing');
      } else {
        toast.error('Please allow popups to print invoices');
      }
      
      // Clean up the URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error('Error printing PDF:', error);
      toast.error('Failed to print invoice');
    }
  };

  const handleEmailFolio = () => {
    toast.success('Sending folio via email...');
    // Implement email functionality
  };

  const handlePreviewInvoice = async () => {
    try {
      if (!selectedGuest) return;
      
      setLoadingInvoice(true);
      console.log('🔍 Previewing invoice for booking:', selectedGuest.id);
      
      const response = await apiClient.get(
        `/receptionist/invoices/preview/${selectedGuest.id}`
      );

      if (response.data?.success) {
        setInvoicePreview(response.data.data);
        setShowInvoicePreviewModal(true);
        toast.success('Invoice preview loaded');
      } else {
        toast.error(response.data?.message || 'Failed to load invoice preview');
      }
    } catch (error) {
      console.error('❌ Error previewing invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to preview invoice');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      if (!selectedGuest) return;
      
      setLoadingInvoice(true);
      console.log('📋 Generating invoice for booking:', selectedGuest.id);
      
      const response = await apiClient.post(
        `/receptionist/invoices/generate/${selectedGuest.id}`,
        invoiceForm
      );

      if (response.data?.success) {
        toast.success('Invoice generated successfully!');
        setShowGenerateInvoiceModal(false);
        
        // Fetch the generated invoice for preview
        await fetchInvoicePreview(selectedGuest.id);
        
        setInvoiceForm({
          tax_rate: 18,
          service_charge_rate: 0,
          discount_amount: 0,
          paymentTerms: 'Due on receipt',
          notes: ''
        });
        // Refresh the folio to show any updates
        fetchGuestFolio(selectedGuest.id);
      } else {
        toast.error(response.data?.message || 'Failed to generate invoice');
      }
    } catch (error) {
      // Handle specific error cases more gracefully
      if (error.response?.data?.message?.includes('Invoice already exists')) {
        toast.info('Invoice already exists for this booking. Opening existing invoice...');
        setShowGenerateInvoiceModal(false);
        // Fetch the existing invoice for preview
        await fetchInvoicePreview(selectedGuest.id);
      } else {
        console.error('❌ Error generating invoice:', error);
        toast.error(error.response?.data?.message || 'Failed to generate invoice');
      }
    } finally {
      setLoadingInvoice(false);
    }
  };

  const fetchInvoicePreview = async (bookingId) => {
    try {
      const response = await apiClient.get(`/invoices/booking/${bookingId}`);
      if (response.data?.success && response.data?.data) {
        setInvoicePreview(response.data.data);
        setShowInvoicePreviewModal(true);
      }
    } catch (error) {
      console.error('Error fetching invoice preview:', error);
      toast.error('Failed to load invoice preview');
    }
  };

  const filteredGuests = guests.filter(guest =>
    guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.roomNumber.includes(searchTerm) ||
    guest.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Receipt className="w-7 h-7 text-blue-600" />
          Guest Folio Management
        </h1>
        <p className="text-gray-600 mt-1">View and manage guest charges and payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">In-House Guests</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredGuests.length > 0 ? (
                filteredGuests.map(guest => (
                  <div
                    key={guest.id}
                    onClick={() => handleSelectGuest(guest)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedGuest?.id === guest.id
                        ? 'bg-blue-50 border-2 border-blue-600'
                        : 'bg-gray-50 border-2 border-transparent hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{guest.guestName}</span>
                      <span className="text-sm font-semibold text-blue-600">Room {guest.roomNumber}</span>
                    </div>
                    <div className="text-xs text-gray-600">{guest.bookingId}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {guest.checkInDate} - {guest.checkOutDate}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm">No in-house guests found</p>
                  <p className="text-xs text-gray-400 mt-1">Check if guests have checked in</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Folio Details */}
        <div className="lg:col-span-2">
          {!selectedGuest ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a guest to view their folio</p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading folio...</p>
            </div>
          ) : !folioData ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Failed to load folio data</p>
              <p className="text-sm text-gray-400">Please try selecting the guest again</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Guest Info Header */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedGuest.guestName}</h2>
                    <p className="text-sm text-gray-600">
                      Room {selectedGuest.roomNumber} • {selectedGuest.bookingId}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handlePreviewInvoice}
                      disabled={loadingInvoice}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Invoice
                    </button>
                    <button
                      onClick={() => setShowGenerateInvoiceModal(true)}
                      disabled={loadingInvoice}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      Generate Invoice
                    </button>
                    <button
                      onClick={() => fetchInvoicePreview(selectedGuest.id)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Invoice
                    </button>
                    <button
                      onClick={handlePrintFolio}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={handleEmailFolio}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-600 mb-1">Total Charges</p>
                    <p className="text-xl font-bold text-blue-900">
                      RWF {folioData?.summary.totalCharges.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-600 mb-1">Total Payments</p>
                    <p className="text-xl font-bold text-green-900">
                      RWF {folioData?.summary.totalPayments.toLocaleString()}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${
                    folioData?.summary.balance > 0 ? 'bg-red-50' : 
                    folioData?.summary.balance < 0 ? 'bg-yellow-50' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm mb-1 ${
                      folioData?.summary.balance > 0 ? 'text-red-600' : 
                      folioData?.summary.balance < 0 ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {folioData?.summary.balance > 0 ? 'Balance Due' : 
                       folioData?.summary.balance < 0 ? 'Refund Due' : 'Paid in Full'}
                    </p>
                    <p className={`text-xl font-bold ${
                      folioData?.summary.balance > 0 ? 'text-red-900' : 
                      folioData?.summary.balance < 0 ? 'text-yellow-900' : 'text-gray-900'
                    }`}>
                      RWF {Math.abs(folioData?.summary.balance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charges Section */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Charges</h3>
                  <button
                    onClick={() => setShowAddChargeModal(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Charge
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {folioData?.charges.map(charge => (
                        <tr key={charge.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{charge.date}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {charge.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{charge.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{charge.quantity}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            RWF {charge.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Section */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Record Payment
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {folioData?.payments && folioData.payments.length > 0 ? (
                        folioData.payments.map(payment => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded capitalize">
                                {payment.method.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{payment.reference || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{payment.notes || '-'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                              RWF {payment.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </div>
                              <p className="text-sm">No payments recorded yet</p>
                              <p className="text-xs text-gray-400">Click "Record Payment" to add one</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Charge Modal */}
      {showAddChargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Charge</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={chargeForm.category}
                    onChange={(e) => setChargeForm({...chargeForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Room">Room</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Minibar">Minibar</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Spa">Spa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={chargeForm.description}
                    onChange={(e) => setChargeForm({...chargeForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Charge description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF)</label>
                    <input
                      type="number"
                      value={chargeForm.amount}
                      onChange={(e) => setChargeForm({...chargeForm, amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={chargeForm.quantity}
                      onChange={(e) => setChargeForm({...chargeForm, quantity: parseInt(e.target.value) || 1})}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={chargeForm.date}
                    onChange={(e) => setChargeForm({...chargeForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCharge}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Charge
                </button>
                <button
                  onClick={() => setShowAddChargeModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showInvoicePreviewModal && invoicePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Invoice Preview
              </h2>

              {/* Invoice Header */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                {/* Company Logo */}
                {invoicePreview.logo_url && (
                  <div className="mb-4 text-center">
                    <img
                      src={`http://localhost:3001${invoicePreview.logo_url}`}
                      alt="Company Logo"
                      className="h-20 w-auto object-contain border border-gray-200 rounded bg-white p-2 mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking Reference</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {invoicePreview.booking?.booking_reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {invoicePreview.booking?.check_in_date}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Guest Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {invoicePreview.booking?.guest_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {invoicePreview.booking?.check_out_date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charges Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Charges</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoicePreview.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            RWF {parseFloat(item.unit_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            RWF {parseFloat(item.total_price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      RWF {parseFloat(invoicePreview.summary?.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium text-gray-900">
                      RWF {parseFloat(invoicePreview.summary?.tax_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total Due</span>
                    <span className="font-bold text-lg text-blue-600">
                      RWF {parseFloat(invoicePreview.summary?.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGenerateInvoiceModal(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Proceed to Generate
                </button>
                <button
                  onClick={handlePrintFolio}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
                <button
                  onClick={() => setShowInvoicePreviewModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showGenerateInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Invoice</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={invoiceForm.tax_rate}
                    onChange={(e) => setInvoiceForm({...invoiceForm, tax_rate: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="18"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (%)</label>
                  <input
                    type="number"
                    value={invoiceForm.service_charge_rate}
                    onChange={(e) => setInvoiceForm({...invoiceForm, service_charge_rate: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount (RWF)</label>
                  <input
                    type="number"
                    value={invoiceForm.discount_amount}
                    onChange={(e) => setInvoiceForm({...invoiceForm, discount_amount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={invoiceForm.payment_terms}
                    onChange={(e) => setInvoiceForm({...invoiceForm, payment_terms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Due on receipt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Invoice notes (optional)..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleGenerateInvoice}
                  disabled={loadingInvoice}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingInvoice && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loadingInvoice ? 'Generating...' : 'Generate Invoice'}
                </button>
                <button
                  onClick={() => setShowGenerateInvoiceModal(false)}
                  disabled={loadingInvoice}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h2>
              
              <div className={`rounded-lg p-3 mb-4 ${
                folioData?.summary.balance > 0 ? 'bg-red-50' : 
                folioData?.summary.balance < 0 ? 'bg-yellow-50' : 'bg-green-50'
              }`}>
                <p className={`text-sm ${
                  folioData?.summary.balance > 0 ? 'text-red-600' : 
                  folioData?.summary.balance < 0 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {folioData?.summary.balance > 0 ? 'Outstanding Balance' : 
                   folioData?.summary.balance < 0 ? 'Refund Due' : 'Paid in Full'}
                </p>
                <p className={`text-2xl font-bold ${
                  folioData?.summary.balance > 0 ? 'text-red-900' : 
                  folioData?.summary.balance < 0 ? 'text-yellow-900' : 'text-green-900'
                }`}>
                  RWF {Math.abs(folioData?.summary.balance || 0).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {folioData?.summary.balance > 0 ? 'Payment Amount (RWF)' : 
                     folioData?.summary.balance < 0 ? 'Refund Amount (RWF)' : 'Amount (RWF)'}
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                    max={folioData?.summary.balance > 0 ? folioData?.summary.balance : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    disabled={folioData?.summary.balance < 0}
                  />
                  {folioData?.summary.balance < 0 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Guest has overpaid. Consider processing a refund instead.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                    <option value="check">Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Transaction reference"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Payment notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Record Payment
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestFolio;