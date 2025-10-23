import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  Edit3,
  Save,
  X,
  Calendar,
  CreditCard,
  Star,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Crown,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const GuestProfile = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      // Load initial guest list or show search
    } else {
      console.warn('⚠️ No token available. User may need to login.');
    }
  }, []);

  const searchGuests = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      toast.error('Search term must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/guests/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.data?.success) {
        setGuests(response.data.data.guests);
        console.log('✅ Guests found:', response.data.data.guests.length);
      } else {
        setGuests([]);
        toast.error('No guests found');
      }
    } catch (error) {
      console.error('❌ Error searching guests:', error);
      toast.error('Failed to search guests');
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestProfile = async (guestId) => {
    try {
      setLoading(true);
      console.log('📋 Fetching profile for guest:', guestId);
      const response = await apiClient.get(`/guests/${guestId}`);
      
      if (response.data?.success) {
        setGuestData(response.data.data);
        console.log('✅ Guest profile received:', response.data.data);
      } else {
        console.error('❌ API returned unsuccessful response:', response.data);
        setGuestData(null);
        toast.error('Failed to load guest profile');
      }
    } catch (error) {
      console.error('❌ Error fetching guest profile:', error);
      setGuestData(null);
      toast.error('Failed to load guest profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGuest = (guest) => {
    setSelectedGuest(guest);
    fetchGuestProfile(guest.guest_id);
  };

  const handleEdit = () => {
    setEditing(true);
    setEditForm({
      first_name: guestData?.profile?.first_name || '',
      last_name: guestData?.profile?.last_name || '',
      email: guestData?.profile?.email || '',
      phone: guestData?.profile?.phone || '',
      country: guestData?.profile?.country || '',
      city: guestData?.profile?.city || '',
      address: guestData?.profile?.address || '',
      date_of_birth: guestData?.profile?.date_of_birth || '',
      nationality: guestData?.profile?.nationality || '',
      id_type: guestData?.profile?.id_type || '',
      id_number: guestData?.profile?.id_number || '',
      id_expiry_date: guestData?.profile?.id_expiry_date || '',
      passport_number: guestData?.profile?.passport_number || '',
      passport_expiry_date: guestData?.profile?.passport_expiry_date || '',
      preferences: guestData?.profile?.preferences || '',
      notes: guestData?.profile?.notes || ''
    });
  };

  const handleSave = async () => {
    try {
      const response = await apiClient.put(`/guests/${selectedGuest.guest_id}`, editForm);
      
      if (response.data?.success) {
        toast.success('Guest profile updated successfully!');
        setEditing(false);
        // Refresh guest data
        fetchGuestProfile(selectedGuest.guest_id);
      } else {
        toast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'RWF 0';
    return `RWF ${parseFloat(amount).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyColor = (status) => {
    switch (status) {
      case 'VIP': return 'text-purple-600';
      case 'Gold': return 'text-yellow-600';
      case 'Silver': return 'text-gray-600';
      case 'Bronze': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Guest Profile Management</h1>
        <p className="text-gray-600">Search and manage guest profiles, booking history, and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Guests</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchGuests()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={searchGuests}
              disabled={loading || !searchTerm}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search Guests
            </button>

            {/* Search Results */}
            <div className="mt-4 max-h-[600px] overflow-y-auto">
              {guests.length > 0 ? (
                guests.map(guest => (
                  <div
                    key={guest.guest_id}
                    onClick={() => handleSelectGuest(guest)}
                    className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                      selectedGuest?.guest_id === guest.guest_id
                        ? 'bg-blue-50 border-2 border-blue-600'
                        : 'bg-gray-50 border-2 border-transparent hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{guest.full_name}</span>
                      {guest.vip_status && (
                        <Crown className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">{guest.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {guest.total_bookings} bookings • {formatCurrency(guest.total_spent)}
                    </div>
                  </div>
                ))
              ) : searchTerm ? (
                <div className="p-8 text-center text-gray-500">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm">No guests found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm">Search for guests</p>
                  <p className="text-xs text-gray-400 mt-1">Enter name, email, or phone number</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="lg:col-span-2">
          {!selectedGuest ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a guest to view their profile</p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading guest profile...</p>
            </div>
          ) : !guestData ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Failed to load guest profile</p>
              <p className="text-sm text-gray-400">Please try selecting the guest again</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Guest Header */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {guestData.profile.full_name}
                        {guestData.profile.vip_status && (
                          <Crown className="w-5 h-5 text-purple-600" />
                        )}
                      </h2>
                      <p className="text-sm text-gray-600">{guestData.profile.email}</p>
                      <p className="text-xs text-gray-500">
                        {guestData.statistics.loyaltyStatus} Member • {guestData.statistics.totalBookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-600 mb-1">Total Bookings</p>
                    <p className="text-xl font-bold text-blue-900">{guestData.statistics.totalBookings}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-600 mb-1">Total Spent</p>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(guestData.statistics.totalSpent)}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-sm text-yellow-600 mb-1">Average Rating</p>
                    <p className="text-xl font-bold text-yellow-900">
                      {guestData.statistics.averageRating > 0 ? guestData.statistics.averageRating.toFixed(1) : '-'}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-purple-600 mb-1">Loyalty Status</p>
                    <p className={`text-xl font-bold ${getLoyaltyColor(guestData.statistics.loyaltyStatus)}`}>
                      {guestData.statistics.loyaltyStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'profile', label: 'Profile', icon: User },
                      { id: 'bookings', label: 'Bookings', icon: Calendar },
                      { id: 'payments', label: 'Payments', icon: CreditCard },
                      { id: 'reviews', label: 'Reviews', icon: Star },
                      { id: 'complaints', label: 'Complaints', icon: AlertTriangle }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500">Full Name</label>
                                {editing ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editForm.first_name}
                                      onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="First name"
                                    />
                                    <input
                                      type="text"
                                      value={editForm.last_name}
                                      onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="Last name"
                                    />
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-900">{guestData.profile.full_name}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500">Email</label>
                                {editing ? (
                                  <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{guestData.profile.email}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500">Phone</label>
                                {editing ? (
                                  <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{guestData.profile.phone || '-'}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500">Address</label>
                                {editing ? (
                                  <textarea
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    rows={2}
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{guestData.profile.address || '-'}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Identification */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <IdCard className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500">Nationality</label>
                                {editing ? (
                                  <input
                                    type="text"
                                    value={editForm.nationality}
                                    onChange={(e) => setEditForm({...editForm, nationality: e.target.value})}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{guestData.profile.nationality || '-'}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <IdCard className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500">ID Type</label>
                                {editing ? (
                                  <select
                                    value={editForm.id_type}
                                    onChange={(e) => setEditForm({...editForm, id_type: e.target.value})}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select ID Type</option>
                                    <option value="passport">Passport</option>
                                    <option value="national_id">National ID</option>
                                    <option value="driver_license">Driver's License</option>
                                    <option value="other">Other</option>
                                  </select>
                                ) : (
                                  <p className="text-sm text-gray-900">{guestData.profile.id_type || '-'}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <IdCard className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500">ID Number</label>
                                {editing ? (
                                  <input
                                    type="text"
                                    value={editForm.id_number}
                                    onChange={(e) => setEditForm({...editForm, id_number: e.target.value})}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{guestData.profile.id_number || '-'}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preferences and Notes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                          {editing ? (
                            <textarea
                              value={editForm.preferences}
                              onChange={(e) => setEditForm({...editForm, preferences: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={4}
                              placeholder="Guest preferences..."
                            />
                          ) : (
                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                              {guestData.profile.preferences || 'No preferences recorded'}
                            </p>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                          {editing ? (
                            <textarea
                              value={editForm.notes}
                              onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={4}
                              placeholder="Staff notes..."
                            />
                          ) : (
                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                              {guestData.profile.notes || 'No notes recorded'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bookings Tab */}
                  {activeTab === 'bookings' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking History</h3>
                      {guestData.bookingHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking Ref</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {guestData.bookingHistory.map(booking => (
                                <tr key={booking.booking_id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{booking.booking_reference}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {booking.room_number} ({booking.room_type})
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {formatCurrency(booking.total_amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>No booking history found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payments Tab */}
                  {activeTab === 'payments' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                      {guestData.paymentHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {guestData.paymentHistory.map(payment => (
                                <tr key={payment.transaction_id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(payment.payment_date)}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                      {payment.payment_method}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{payment.reference_number || '-'}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{payment.booking_reference || '-'}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                                    {formatCurrency(payment.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>No payment history found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews & Ratings</h3>
                      {guestData.reviews.length > 0 ? (
                        <div className="space-y-4">
                          {guestData.reviews.map(review => (
                            <div key={review.review_id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{review.rating}/5</span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                              <p className="text-xs text-gray-500">{review.homestay_name}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>No reviews found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complaints Tab */}
                  {activeTab === 'complaints' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints & Issues</h3>
                      {guestData.complaints.length > 0 ? (
                        <div className="space-y-4">
                          {guestData.complaints.map(complaint => (
                            <div key={complaint.complaint_id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                  <span className="text-sm font-medium text-red-900">
                                    {complaint.category || 'General Complaint'}
                                  </span>
                                </div>
                                <span className="text-xs text-red-600">{formatDate(complaint.created_at)}</span>
                              </div>
                              <p className="text-sm text-red-800 mb-2">{complaint.description}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-red-600">{complaint.homestay_name}</p>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  complaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {complaint.status || 'pending'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                          <p>No complaints found</p>
                          <p className="text-sm text-gray-400">This guest has no recorded complaints</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestProfile;
