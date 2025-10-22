import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw,
  Calendar,
  User,
  FileText,
  X,
  Save
} from 'lucide-react';

export const BookingCharges = () => {
  const [charges, setCharges] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    booking_id: '',
    charge_type: 'other',
    description: '',
    quantity: 1,
    unit_price: '',
    tax_amount: 0,
    notes: ''
  });

  const chargeTypes = [
    { value: 'room', label: 'Room Charge' },
    { value: 'minibar', label: 'Minibar' },
    { value: 'room_service', label: 'Room Service' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'phone', label: 'Phone' },
    { value: 'parking', label: 'Parking' },
    { value: 'extra_bed', label: 'Extra Bed' },
    { value: 'early_checkin', label: 'Early Check-in' },
    { value: 'late_checkout', label: 'Late Checkout' },
    { value: 'damage', label: 'Damage' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchCharges();
    fetchBookings();
  }, []);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/booking-charges', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setCharges(result.data);
      } else {
        console.error('Failed to fetch charges:', result.message);
      }
    } catch (error) {
      console.error('Error fetching charges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/bookings?service_type=room,homestay&status=confirmed', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setBookings(result.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('hms_token');
      const url = editingCharge 
        ? `http://localhost:3001/api/booking-charges/${editingCharge.charge_id}`
        : 'http://localhost:3001/api/booking-charges';
      
      const method = editingCharge ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        fetchCharges();
        handleCloseModal();
      } else {
        alert(result.message || 'Failed to save charge');
      }
    } catch (error) {
      console.error('Error saving charge:', error);
      alert('Error saving charge');
    }
  };

  const handleDelete = async (chargeId) => {
    if (!confirm('Are you sure you want to delete this charge?')) return;

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`http://localhost:3001/api/booking-charges/${chargeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        fetchCharges();
      } else {
        alert(result.message || 'Failed to delete charge');
      }
    } catch (error) {
      console.error('Error deleting charge:', error);
      alert('Error deleting charge');
    }
  };

  const handleEdit = (charge) => {
    setEditingCharge(charge);
    setFormData({
      booking_id: charge.booking_id,
      charge_type: charge.charge_type,
      description: charge.description,
      quantity: charge.quantity,
      unit_price: charge.unit_price,
      tax_amount: charge.tax_amount || 0,
      notes: charge.notes || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCharge(null);
    setFormData({
      booking_id: '',
      charge_type: 'other',
      description: '',
      quantity: 1,
      unit_price: '',
      tax_amount: 0,
      notes: ''
    });
  };

  const calculateTotal = () => {
    const unitPrice = parseFloat(formData.unit_price) || 0;
    const quantity = parseInt(formData.quantity) || 1;
    const taxAmount = parseFloat(formData.tax_amount) || 0;
    return (unitPrice * quantity + taxAmount).toFixed(2);
  };

  const filteredCharges = charges.filter(charge => {
    const searchLower = searchTerm.toLowerCase();
    return (
      charge.description?.toLowerCase().includes(searchLower) ||
      charge.charge_type?.toLowerCase().includes(searchLower) ||
      charge.booking?.booking_reference?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Charges</h1>
          <p className="text-gray-600">Manage additional charges for bookings</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchCharges}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Charge
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search charges by description, type, or booking reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Charges Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Charge Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Charged At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Loading charges...</p>
                  </td>
                </tr>
              ) : filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-500">No charges found</p>
                  </td>
                </tr>
              ) : (
                filteredCharges.map((charge) => (
                  <tr key={charge.charge_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {charge.booking?.booking_reference || `#${charge.booking_id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {charge.charge_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{charge.description}</div>
                      {charge.notes && (
                        <div className="text-xs text-gray-500 mt-1">{charge.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {charge.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(charge.unit_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(charge.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(charge.charged_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(charge)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(charge.charge_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCharge ? 'Edit Charge' : 'Add New Charge'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Booking Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking *
                  </label>
                  <select
                    value={formData.booking_id}
                    onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a booking</option>
                    {bookings.map((booking) => (
                      <option key={booking.booking_id} value={booking.booking_id}>
                        {booking.booking_reference || `#${booking.booking_id}`} - {booking.service_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Charge Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charge Type *
                  </label>
                  <select
                    value={formData.charge_type}
                    onChange={(e) => setFormData({ ...formData, charge_type: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {chargeTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Tax Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.tax_amount}
                    onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Total Display */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCharge ? 'Update' : 'Create'} Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};