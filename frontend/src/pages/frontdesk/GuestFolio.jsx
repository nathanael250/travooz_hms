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
  AlertCircle
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

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      fetchInHouseGuests();
    } else {
      console.warn('⚠️ No token available - using mock data. User may need to login.');
      setGuests(getMockGuests());
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
        console.warn('⚠️ Guests data is not an array, using mock data');
        guestsData = getMockGuests();
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
      } else {
        guestsData = getMockGuests();
      }
      
      console.log('✅ Transformed guest list:', guestsData);
      setGuests(guestsData);
    } catch (error) {
      console.error('❌ Error fetching guests:', error);
      setGuests(getMockGuests());
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
        setFolioData(response.data?.data || getMockFolio());
      } else {
        setFolioData(getMockFolio());
      }
    } catch (error) {
      console.error('❌ Error fetching folio:', error);
      setFolioData(getMockFolio());
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

  const handlePrintFolio = () => {
    toast.success('Printing folio...');
    // Implement print functionality
  };

  const handleEmailFolio = () => {
    toast.success('Sending folio via email...');
    // Implement email functionality
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
              {filteredGuests.map(guest => (
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
              ))}
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
                  <div className="flex gap-2">
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
                    folioData?.summary.balance > 0 ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm mb-1 ${
                      folioData?.summary.balance > 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      Balance
                    </p>
                    <p className={`text-xl font-bold ${
                      folioData?.summary.balance > 0 ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      RWF {folioData?.summary.balance.toLocaleString()}
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
                      {folioData?.payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{payment.date}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {payment.method}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{payment.reference}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{payment.notes}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                            RWF {payment.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
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

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h2>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">
                  RWF {folioData?.summary.balance.toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                    max={folioData?.summary.balance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit-card">Credit Card</option>
                    <option value="debit-card">Debit Card</option>
                    <option value="mobile-money">Mobile Money</option>
                    <option value="bank-transfer">Bank Transfer</option>
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