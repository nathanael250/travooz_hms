import React, { useState, useEffect } from 'react';
import {
  LogOut,
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  Key,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Printer,
  Mail,
  DollarSign,
  Home,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const CheckOut = () => {
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCheckout, setSelectedCheckout] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    roomInspection: '',
    damageCharges: 0,
    minibarCharges: 0,
    lateCheckoutFee: 0,
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      fetchCheckouts();
    } else {
      console.warn('⚠️ No token available. User needs to login.');
      setCheckouts([]);
      setLoading(false);
    }
  }, []);

  const fetchCheckouts = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching checkouts using apiClient...');
      const response = await apiClient.get('/front-desk/checkouts');
      
      // API returns { data: { checkouts: [...], total: ... } }
      let checkoutsData = response.data?.data?.checkouts || [];
      
      if (checkoutsData.length > 0) {
        checkoutsData = checkoutsData.map(checkout => ({
          id: checkout.booking_id || checkout.id,
          bookingId: checkout.booking_reference || checkout.bookingId,
          guestName: checkout.guest_name || checkout.guestName || '',
          roomNumber: checkout.room_number || checkout.roomNumber || '',
          roomType: checkout.room_type || checkout.roomType || 'Standard',
          checkInDate: checkout.check_in_date || checkout.checkInDate,
          checkOutDate: checkout.check_out_date || checkout.checkOutDate,
          scheduledCheckout: checkout.scheduled_checkout || checkout.scheduledCheckout || '11:00 AM',
          status: checkout.checkout_status || checkout.status || 'pending',
          totalBill: checkout.final_amount || checkout.total_amount || checkout.totalBill || 0,
          paidAmount: checkout.payment_status === 'paid' ? (checkout.final_amount || 0) : 0,
          balanceAmount: checkout.balance_amount || 0,
          isVip: checkout.is_vip || false,
          email: checkout.guest_email || checkout.email || '',
          phone: checkout.guest_phone || checkout.phone || ''
        }));
      }
      
      console.log('✅ Transformed checkout data:', checkoutsData);
      setCheckouts(checkoutsData);
    } catch (error) {
      console.error('❌ Error fetching checkouts:', error);
      toast.error('Failed to fetch checkout list');
      setCheckouts([]);
    } finally {
      setLoading(false);
    }
  };



  const handleCheckout = async (checkout) => {
    setSelectedCheckout(checkout);
    setShowCheckoutModal(true);
    setCheckoutForm({
      roomInspection: '',
      damageCharges: 0,
      minibarCharges: 0,
      lateCheckoutFee: 0,
      paymentMethod: 'cash',
      notes: ''
    });
  };

  const processCheckout = async () => {
    try {
      if (!selectedCheckout) return;
      
      console.log('💳 Processing checkout for booking:', selectedCheckout.id);
      const response = await apiClient.post(
        `/receptionist/check-out/${selectedCheckout.id}`,
        {
          deposit_returned: checkoutForm.damageCharges || 0,
          additional_charges: checkoutForm.minibarCharges + checkoutForm.lateCheckoutFee || 0,
          payment_method: checkoutForm.paymentMethod,
          notes: checkoutForm.notes
        }
      );

      if (response.data?.success || response.status === 200) {
        toast.success('Guest checked out successfully!');
        setShowCheckoutModal(false);
        fetchCheckouts();
      } else {
        toast.error(response.data?.message || 'Failed to process checkout');
      }
    } catch (error) {
      console.error('❌ Error processing checkout:', error);
      toast.error(error.response?.data?.message || 'Failed to process checkout');
    }
  };

  const filteredCheckouts = checkouts.filter(checkout => {
    const matchesSearch = checkout.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checkout.roomNumber.includes(searchTerm) ||
                         checkout.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || checkout.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'late-checkout': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LogOut className="w-7 h-7 text-blue-600" />
          Check-Out Management
        </h1>
        <p className="text-gray-600 mt-1">Process guest departures and settle bills</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by guest, room, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="late-checkout">Late Checkout</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's Checkouts
            </button>
          </div>
        </div>
      </div>

      {/* Checkouts List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCheckouts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Home className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">No checkouts available</p>
                      <p className="text-gray-400 text-sm">There are no guests scheduled for checkout</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCheckouts.map((checkout) => (
                  <tr key={checkout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {checkout.guestName}
                            {checkout.isVip && (
                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">VIP</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{checkout.bookingId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{checkout.roomNumber}</div>
                      <div className="text-sm text-gray-500">{checkout.roomType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{checkout.scheduledCheckout}</div>
                      <div className="text-sm text-gray-500">{checkout.checkOutDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">RWF {checkout.totalBill.toLocaleString()}</div>
                      {checkout.balanceAmount > 0 ? (
                        <div className="text-sm text-red-600">Due: RWF {checkout.balanceAmount.toLocaleString()}</div>
                      ) : (
                        <div className="text-sm text-green-600">Fully Paid</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(checkout.status)}`}>
                        {checkout.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCheckout(checkout)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Check Out
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                          <FileText className="w-4 h-4" />
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

      {/* Checkout Modal */}
      {showCheckoutModal && selectedCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Process Check-Out</h2>
              
              {/* Guest Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Guest Name</p>
                    <p className="font-medium">{selectedCheckout.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Number</p>
                    <p className="font-medium">{selectedCheckout.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Bill</p>
                    <p className="font-medium">RWF {selectedCheckout.totalBill.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Balance Due</p>
                    <p className={`font-medium ${selectedCheckout.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      RWF {selectedCheckout.balanceAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Inspection</label>
                  <select
                    value={checkoutForm.roomInspection}
                    onChange={(e) => setCheckoutForm({...checkoutForm, roomInspection: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="clean">Clean - No Issues</option>
                    <option value="minor-damage">Minor Damage</option>
                    <option value="major-damage">Major Damage</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Damage Charges (RWF)</label>
                    <input
                      type="number"
                      value={checkoutForm.damageCharges}
                      onChange={(e) => setCheckoutForm({...checkoutForm, damageCharges: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minibar Charges (RWF)</label>
                    <input
                      type="number"
                      value={checkoutForm.minibarCharges}
                      onChange={(e) => setCheckoutForm({...checkoutForm, minibarCharges: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Late Checkout Fee (RWF)</label>
                  <input
                    type="number"
                    value={checkoutForm.lateCheckoutFee}
                    onChange={(e) => setCheckoutForm({...checkoutForm, lateCheckoutFee: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={checkoutForm.paymentMethod}
                    onChange={(e) => setCheckoutForm({...checkoutForm, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile-money">Mobile Money</option>
                    <option value="bank-transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={checkoutForm.notes}
                    onChange={(e) => setCheckoutForm({...checkoutForm, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional notes..."
                  />
                </div>

                {/* Total Calculation */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Final Amount:</span>
                    <span className="text-xl font-bold text-blue-600">
                      RWF {(selectedCheckout.balanceAmount + checkoutForm.damageCharges + checkoutForm.minibarCharges + checkoutForm.lateCheckoutFee).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={processCheckout}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Complete Check-Out
                </button>
                <button
                  onClick={() => setShowCheckoutModal(false)}
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

export default CheckOut;