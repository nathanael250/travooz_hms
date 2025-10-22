import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  DollarSign
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const ExternalBookings = () => {
  const [externalBookings, setExternalBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [syncStatusFilter, setSyncStatusFilter] = useState('');
  const [externalStatusFilter, setExternalStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    platform: 'booking.com',
    external_booking_id: '',
    external_guest_name: '',
    external_status: 'confirmed',
    commission_percentage: 0,
    commission_amount: 0,
    notes: '',
    external_data: {}
  });
  const [syncFormData, setSyncFormData] = useState({
    inventory_id: '',
    check_in_date: '',
    check_out_date: '',
    adults: 1,
    children: 0,
    room_rate: 0,
    discount_amount: 0,
    tax_amount: 0
  });

  const platforms = [
    'booking.com',
    'airbnb',
    'expedia',
    'agoda',
    'hotels.com',
    'trivago',
    'priceline',
    'kayak',
    'other'
  ];

  useEffect(() => {
    fetchExternalBookings();
    fetchRooms();
  }, [platformFilter, syncStatusFilter, externalStatusFilter]);

  const fetchExternalBookings = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();
      if (platformFilter) params.append('platform', platformFilter);
      if (syncStatusFilter) params.append('sync_status', syncStatusFilter);
      if (externalStatusFilter) params.append('external_status', externalStatusFilter);

      const response = await fetch(`${API_URL}/external-bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setExternalBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching external bookings:', error);
      alert('Failed to fetch external bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/external-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert('External booking imported successfully');
        setShowModal(false);
        resetForm();
        fetchExternalBookings();
      } else {
        alert(data.message || 'Failed to import external booking');
      }
    } catch (error) {
      console.error('Error importing external booking:', error);
      alert('Failed to import external booking');
    }
  };

  const handleSync = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(
        `${API_URL}/external-bookings/${selectedBooking.external_booking_record_id}/sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(syncFormData)
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('External booking synchronized successfully');
        setShowSyncModal(false);
        setSelectedBooking(null);
        resetSyncForm();
        fetchExternalBookings();
      } else {
        alert(data.message || 'Failed to sync external booking');
      }
    } catch (error) {
      console.error('Error syncing external booking:', error);
      alert('Failed to sync external booking');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this external booking?')) return;

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/external-bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('External booking deleted successfully');
        fetchExternalBookings();
      } else {
        alert(data.message || 'Failed to delete external booking');
      }
    } catch (error) {
      console.error('Error deleting external booking:', error);
      alert('Failed to delete external booking');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(
        `${API_URL}/external-bookings/${selectedBooking.external_booking_record_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            external_status: formData.external_status,
            commission_percentage: formData.commission_percentage,
            commission_amount: formData.commission_amount,
            notes: formData.notes
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('External booking updated successfully');
        setShowModal(false);
        setSelectedBooking(null);
        resetForm();
        fetchExternalBookings();
      } else {
        alert(data.message || 'Failed to update external booking');
      }
    } catch (error) {
      console.error('Error updating external booking:', error);
      alert('Failed to update external booking');
    }
  };

  const openEditModal = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      platform: booking.platform,
      external_booking_id: booking.external_booking_id,
      external_guest_name: booking.external_guest_name,
      external_status: booking.external_status,
      commission_percentage: booking.commission_percentage || 0,
      commission_amount: booking.commission_amount || 0,
      notes: booking.notes || '',
      external_data: booking.external_data || {}
    });
    setShowModal(true);
  };

  const openSyncModal = (booking) => {
    setSelectedBooking(booking);
    setShowSyncModal(true);
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      platform: 'booking.com',
      external_booking_id: '',
      external_guest_name: '',
      external_status: 'confirmed',
      commission_percentage: 0,
      commission_amount: 0,
      notes: '',
      external_data: {}
    });
  };

  const resetSyncForm = () => {
    setSyncFormData({
      inventory_id: '',
      check_in_date: '',
      check_out_date: '',
      adults: 1,
      children: 0,
      room_rate: 0,
      discount_amount: 0,
      tax_amount: 0
    });
  };

  const getSyncStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      synced: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Synced' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Failed' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getExternalStatusBadge = (status) => {
    const badges = {
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const filteredBookings = externalBookings.filter(booking =>
    booking.external_guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.external_booking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.platform?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading external bookings...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ExternalLink className="mr-2" />
          External Bookings (OTA)
        </h1>
        <p className="text-gray-600 mt-1">Import and sync bookings from online travel agencies</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>

          <select
            value={syncStatusFilter}
            onChange={(e) => setSyncStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sync Status</option>
            <option value="pending">Pending</option>
            <option value="synced">Synced</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={externalStatusFilter}
            onChange={(e) => setExternalStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Booking Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={() => {
              setSelectedBooking(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Import Booking
          </button>
        </div>
      </div>

      {/* External Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  External ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sync Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internal Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No external bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.external_booking_record_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {booking.platform}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.external_booking_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.external_guest_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getExternalStatusBadge(booking.external_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSyncStatusBadge(booking.sync_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        {booking.commission_amount || 0} ({booking.commission_percentage || 0}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.internal_booking_id ? (
                        <span className="text-blue-600">#{booking.internal_booking_id}</span>
                      ) : (
                        <span className="text-gray-400">Not synced</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDetailsModal(booking)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {booking.sync_status === 'pending' && (
                          <button
                            onClick={() => openSyncModal(booking)}
                            className="text-green-600 hover:text-green-900"
                            title="Sync to Internal Booking"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(booking)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.external_booking_record_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Import/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedBooking ? 'Edit External Booking' : 'Import External Booking'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={selectedBooking ? handleUpdate : handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={selectedBooking}
                  >
                    {platforms.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External Booking ID *
                  </label>
                  <input
                    type="text"
                    value={formData.external_booking_id}
                    onChange={(e) => setFormData({ ...formData, external_booking_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={selectedBooking}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    value={formData.external_guest_name}
                    onChange={(e) => setFormData({ ...formData, external_guest_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={selectedBooking}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Status
                  </label>
                  <select
                    value={formData.external_status}
                    onChange={(e) => setFormData({ ...formData, external_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commission_amount}
                    onChange={(e) => setFormData({ ...formData, commission_amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBooking(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedBooking ? 'Update' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Sync to Internal Booking
              </h3>
              <button
                onClick={() => {
                  setShowSyncModal(false);
                  setSelectedBooking(null);
                  resetSyncForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>External Booking:</strong> {selectedBooking.external_booking_id} - {selectedBooking.external_guest_name}
              </p>
            </div>

            <form onSubmit={handleSync}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room *
                  </label>
                  <select
                    value={syncFormData.inventory_id}
                    onChange={(e) => setSyncFormData({ ...syncFormData, inventory_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.inventory_id} value={room.inventory_id}>
                        {room.unit_number} - {room.room_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={syncFormData.check_in_date}
                    onChange={(e) => setSyncFormData({ ...syncFormData, check_in_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={syncFormData.check_out_date}
                    onChange={(e) => setSyncFormData({ ...syncFormData, check_out_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adults *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={syncFormData.adults}
                    onChange={(e) => setSyncFormData({ ...syncFormData, adults: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={syncFormData.children}
                    onChange={(e) => setSyncFormData({ ...syncFormData, children: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Rate (per night) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={syncFormData.room_rate}
                    onChange={(e) => setSyncFormData({ ...syncFormData, room_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={syncFormData.discount_amount}
                    onChange={(e) => setSyncFormData({ ...syncFormData, discount_amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={syncFormData.tax_amount}
                    onChange={(e) => setSyncFormData({ ...syncFormData, tax_amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSyncModal(false);
                    setSelectedBooking(null);
                    resetSyncForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                External Booking Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Platform</p>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedBooking.platform}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">External Booking ID</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.external_booking_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Guest Name</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.external_guest_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Booking Status</p>
                  <p className="mt-1">{getExternalStatusBadge(selectedBooking.external_status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sync Status</p>
                  <p className="mt-1">{getSyncStatusBadge(selectedBooking.sync_status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Internal Booking ID</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.internal_booking_id ? (
                      <span className="text-blue-600">#{selectedBooking.internal_booking_id}</span>
                    ) : (
                      <span className="text-gray-400">Not synced</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Commission</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.commission_amount || 0} ({selectedBooking.commission_percentage || 0}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.external_data && Object.keys(selectedBooking.external_data).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Raw External Data</p>
                  <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-3 rounded-md overflow-auto max-h-64">
                    {JSON.stringify(selectedBooking.external_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedBooking.booking && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Internal Booking Information</p>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm"><strong>Booking Reference:</strong> {selectedBooking.booking.booking_reference}</p>
                    <p className="text-sm"><strong>Status:</strong> {selectedBooking.booking.status}</p>
                    <p className="text-sm"><strong>Total Amount:</strong> {selectedBooking.booking.total_amount}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};