import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users,
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw,
  Star,
  X,
  Save,
  UserCheck
} from 'lucide-react';

export const BookingGuests = () => {
  const [bookingGuests, setBookingGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    booking_id: '',
    guest_id: '',
    is_primary: false,
    room_assignment: ''
  });

  useEffect(() => {
    fetchBookingGuests();
    fetchBookings();
    fetchGuests();
  }, []);

  const fetchBookingGuests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/booking-guests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setBookingGuests(result.data);
      } else {
        console.error('Failed to fetch booking guests:', result.message);
      }
    } catch (error) {
      console.error('Error fetching booking guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/bookings?service_type=room,homestay', {
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

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/booking-guests/guest-profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setGuests(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('hms_token');
      const url = editingGuest 
        ? `http://localhost:3001/api/booking-guests/${editingGuest.id}`
        : 'http://localhost:3001/api/booking-guests';
      
      const method = editingGuest ? 'PUT' : 'POST';

      // Prepare data - only send room_assignment if it has a value
      const dataToSend = {
        booking_id: formData.booking_id,
        guest_id: formData.guest_id,
        is_primary: formData.is_primary
      };
      
      if (formData.room_assignment) {
        dataToSend.room_assignment = formData.room_assignment;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (result.success) {
        fetchBookingGuests();
        handleCloseModal();
      } else {
        alert(result.message || 'Failed to save booking guest');
      }
    } catch (error) {
      console.error('Error saving booking guest:', error);
      alert('Error saving booking guest');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this guest from the booking?')) return;

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`http://localhost:3001/api/booking-guests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        fetchBookingGuests();
      } else {
        alert(result.message || 'Failed to remove guest');
      }
    } catch (error) {
      console.error('Error removing guest:', error);
      alert('Error removing guest');
    }
  };

  const handleEdit = (bookingGuest) => {
    setEditingGuest(bookingGuest);
    setFormData({
      booking_id: bookingGuest.booking_id,
      guest_id: bookingGuest.guest_id,
      is_primary: bookingGuest.is_primary || false,
      room_assignment: bookingGuest.room_assignment || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGuest(null);
    setFormData({
      booking_id: '',
      guest_id: '',
      is_primary: false,
      room_assignment: ''
    });
  };

  const filteredBookingGuests = bookingGuests.filter(bg => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bg.guest?.first_name?.toLowerCase().includes(searchLower) ||
      bg.guest?.last_name?.toLowerCase().includes(searchLower) ||
      bg.guest?.email?.toLowerCase().includes(searchLower) ||
      bg.booking?.booking_reference?.toLowerCase().includes(searchLower) ||
      bg.room_assignment?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Guests</h1>
          <p className="text-gray-600">Manage guest associations with bookings</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchBookingGuests}
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
            Add Guest to Booking
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by guest name, email, booking reference, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Booking Guests Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Primary Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added On
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Loading booking guests...</p>
                  </td>
                </tr>
              ) : filteredBookingGuests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-500">No booking guests found</p>
                  </td>
                </tr>
              ) : (
                filteredBookingGuests.map((bg) => (
                  <tr key={bg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bg.booking?.booking_reference || `#${bg.booking_id}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {bg.booking?.service_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {bg.guest?.first_name} {bg.guest?.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {bg.guest_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{bg.guest?.email}</div>
                      <div className="text-xs text-gray-500">{bg.guest?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bg.room_assignment ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {bg.room_assignment}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bg.is_primary ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Primary
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(bg)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bg.id)}
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
                {editingGuest ? 'Edit Booking Guest' : 'Add Guest to Booking'}
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

                {/* Guest Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest *
                  </label>
                  <select
                    value={formData.guest_id}
                    onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a guest</option>
                    {guests.map((guest) => (
                      <option key={guest.guest_id} value={guest.guest_id}>
                        {guest.first_name} {guest.last_name} - {guest.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Assignment
                  </label>
                  <input
                    type="text"
                    value={formData.room_assignment}
                    onChange={(e) => setFormData({ ...formData, room_assignment: e.target.value })}
                    placeholder="e.g., Room 101"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Primary Guest */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={formData.is_primary}
                    onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-900">
                    Mark as Primary Guest
                  </label>
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
                  {editingGuest ? 'Update' : 'Add'} Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};