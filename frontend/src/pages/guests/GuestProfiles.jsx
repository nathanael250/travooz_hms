import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Award
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const GuestProfiles = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVIP, setFilterVIP] = useState('');
  const [filterBlacklisted, setFilterBlacklisted] = useState('');
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    date_of_birth: '',
    nationality: '',
    id_type: 'passport',
    id_number: '',
    id_expiry_date: '',
    passport_number: '',
    passport_expiry_date: '',
    preferences: '',
    vip_status: false,
    notes: ''
  });

  useEffect(() => {
    fetchGuests();
    fetchStatistics();
  }, [searchTerm, filterVIP, filterBlacklisted]);

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (filterVIP) params.append('vip_status', filterVIP);
      if (filterBlacklisted) params.append('blacklisted', filterBlacklisted);

      const response = await fetch(`${API_URL}/guest-profiles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/guest-profiles/summary/statistics`, {
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

  const fetchGuestDetails = async (guestId) => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/guest-profiles/${guestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedGuest(data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching guest details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('hms_token');
      const url = editingGuest
        ? `${API_URL}/guest-profiles/${editingGuest.guest_id}`
        : `${API_URL}/guest-profiles`;

      const method = editingGuest ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchGuests();
        fetchStatistics();
        handleCloseModal();
        alert(editingGuest ? 'Guest updated successfully!' : 'Guest created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save guest');
      }
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Error saving guest');
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone || '',
      country: guest.country || '',
      city: guest.city || '',
      address: guest.address || '',
      date_of_birth: guest.date_of_birth || '',
      nationality: guest.nationality || '',
      id_type: guest.id_type || 'passport',
      id_number: guest.id_number || '',
      id_expiry_date: guest.id_expiry_date || '',
      passport_number: guest.passport_number || '',
      passport_expiry_date: guest.passport_expiry_date || '',
      preferences: guest.preferences || '',
      vip_status: guest.vip_status || false,
      notes: guest.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (guestId) => {
    if (!confirm('Are you sure you want to delete this guest profile? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/guest-profiles/${guestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchGuests();
        fetchStatistics();
        alert('Guest deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete guest');
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Error deleting guest');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGuest(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      address: '',
      date_of_birth: '',
      nationality: '',
      id_type: 'passport',
      id_number: '',
      id_expiry_date: '',
      passport_number: '',
      passport_expiry_date: '',
      preferences: '',
      vip_status: false,
      notes: ''
    });
  };

  const resetFilters = () => {
    setFilterVIP('');
    setFilterBlacklisted('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading guest profiles...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Guest Profiles</h1>
        <p className="text-gray-600">Manage guest information, preferences, and history</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Guests</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalGuests}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">VIP Guests</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.vipGuests}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Guests</p>
                <p className="text-2xl font-bold text-green-600">{statistics.activeGuests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blacklisted</p>
                <p className="text-2xl font-bold text-red-600">{statistics.blacklistedGuests}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search guests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterVIP}
            onChange={(e) => setFilterVIP(e.target.value)}
          >
            <option value="">All Guests</option>
            <option value="true">VIP Only</option>
            <option value="false">Regular Only</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterBlacklisted}
            onChange={(e) => setFilterBlacklisted(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Blacklisted</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Guest
            </button>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No guests found
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.guest_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {guest.first_name} {guest.last_name}
                            {guest.vip_status && (
                              <Award className="w-4 h-4 text-yellow-500" title="VIP Guest" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{guest.nationality || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {guest.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {guest.phone || 'N/A'}
                      </div>
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.blacklisted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Blacklisted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.total_bookings || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchGuestDetails(guest.guest_id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(guest)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.guest_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingGuest ? 'Edit Guest Profile' : 'Add New Guest'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    />
                  </div>

                  {/* ID Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.id_type}
                      onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                    >
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID</option>
                      <option value="drivers_license">Driver's License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.id_number}
                      onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special notes or preferences..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.vip_status}
                        onChange={(e) => setFormData({ ...formData, vip_status: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700">VIP Guest</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingGuest ? 'Update Guest' : 'Create Guest'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Guest Details Modal */}
      {showDetailsModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Guest Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedGuest.first_name} {selectedGuest.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedGuest.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedGuest.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nationality</p>
                      <p className="font-medium">{selectedGuest.nationality || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Booking History */}
                {selectedGuest.bookings && selectedGuest.bookings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
                    <div className="space-y-2">
                      {selectedGuest.bookings.slice(0, 5).map((booking) => (
                        <div key={booking.booking_guest_id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">Booking #{booking.booking?.booking_reference}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.booking?.check_in_date).toLocaleDateString()} - {new Date(booking.booking?.check_out_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedGuest.total_bookings || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Loyalty Points</p>
                    <p className="text-2xl font-bold text-green-600">{selectedGuest.loyalty_points || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedGuest.total_spent ? `$${parseFloat(selectedGuest.total_spent).toFixed(2)}` : '$0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestProfiles;