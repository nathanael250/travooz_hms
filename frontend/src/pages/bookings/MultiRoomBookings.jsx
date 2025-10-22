import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw,
  Star,
  X,
  Save,
  Bed,
  Calendar,
  DollarSign
} from 'lucide-react';

export const MultiRoomBookings = () => {
  const [multiRoomBookings, setMultiRoomBookings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    booking_id: '',
    room_booking_id: '',
    group_name: '',
    is_master_booking: false
  });

  useEffect(() => {
    fetchMultiRoomBookings();
    fetchBookings();
  }, []);

  const fetchMultiRoomBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/multi-room-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setMultiRoomBookings(result.data);
      } else {
        console.error('Failed to fetch multi-room bookings:', result.message);
      }
    } catch (error) {
      console.error('Error fetching multi-room bookings:', error);
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

  const fetchRoomBookings = async (bookingId) => {
    if (!bookingId) {
      setRoomBookings([]);
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`http://localhost:3001/api/room-booking?booking_id=${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setRoomBookings(Array.isArray(result.data) ? result.data : [result.data]);
      }
    } catch (error) {
      console.error('Error fetching room bookings:', error);
      setRoomBookings([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('hms_token');
      const url = editingBooking 
        ? `http://localhost:3001/api/multi-room-bookings/${editingBooking.group_booking_id}`
        : 'http://localhost:3001/api/multi-room-bookings';
      
      const method = editingBooking ? 'PUT' : 'POST';

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
        fetchMultiRoomBookings();
        handleCloseModal();
      } else {
        alert(result.message || 'Failed to save multi-room booking');
      }
    } catch (error) {
      console.error('Error saving multi-room booking:', error);
      alert('Error saving multi-room booking');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this room from the group booking?')) return;

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`http://localhost:3001/api/multi-room-bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        fetchMultiRoomBookings();
      } else {
        alert(result.message || 'Failed to remove room');
      }
    } catch (error) {
      console.error('Error removing room:', error);
      alert('Error removing room');
    }
  };

  const handleEdit = (multiRoomBooking) => {
    setEditingBooking(multiRoomBooking);
    setFormData({
      booking_id: multiRoomBooking.booking_id,
      room_booking_id: multiRoomBooking.room_booking_id,
      group_name: multiRoomBooking.group_name || '',
      is_master_booking: multiRoomBooking.is_master_booking || false
    });
    fetchRoomBookings(multiRoomBooking.booking_id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBooking(null);
    setFormData({
      booking_id: '',
      room_booking_id: '',
      group_name: '',
      is_master_booking: false
    });
    setRoomBookings([]);
  };

  const handleBookingChange = (bookingId) => {
    setFormData({ ...formData, booking_id: bookingId, room_booking_id: '' });
    fetchRoomBookings(bookingId);
  };

  // Group bookings by booking_id and group_name
  const groupedBookings = multiRoomBookings.reduce((acc, booking) => {
    const key = `${booking.booking_id}-${booking.group_name || 'Unnamed Group'}`;
    if (!acc[key]) {
      acc[key] = {
        booking_id: booking.booking_id,
        group_name: booking.group_name || 'Unnamed Group',
        booking_reference: booking.booking?.booking_reference,
        guest_name: booking.booking?.guest_name,
        rooms: []
      };
    }
    acc[key].rooms.push(booking);
    return acc;
  }, {});

  const filteredGroups = Object.values(groupedBookings).filter(group => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.group_name?.toLowerCase().includes(searchLower) ||
      group.booking_reference?.toLowerCase().includes(searchLower) ||
      group.guest_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Room Bookings</h1>
          <p className="text-gray-600">Manage group bookings with multiple rooms</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchMultiRoomBookings}
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
            Add Room to Group
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by group name, booking reference, or guest name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Multi-Room Bookings Groups */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading multi-room bookings...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-500">No multi-room bookings found</p>
          </div>
        ) : (
          filteredGroups.map((group, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Group Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.group_name}</h3>
                      <p className="text-sm text-gray-600">
                        Booking: {group.booking_reference || `#${group.booking_id}`} • Guest: {group.guest_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {group.rooms.length} {group.rooms.length === 1 ? 'Room' : 'Rooms'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rooms Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in / Check-out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Master
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.rooms.map((room) => (
                      <tr key={room.group_booking_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Bed className="w-5 h-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {room.roomBooking?.room?.unit_number || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Floor {room.roomBooking?.room?.floor || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {room.roomBooking?.check_in_date ? new Date(room.roomBooking.check_in_date).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {room.roomBooking?.check_out_date ? new Date(room.roomBooking.check_out_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {room.roomBooking?.adults || 0} Adults, {room.roomBooking?.children || 0} Children
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${parseFloat(room.roomBooking?.final_amount || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {room.is_master_booking ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Master
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(room)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room.group_booking_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        Total Amount:
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">
                        ${group.rooms.reduce((sum, room) => sum + parseFloat(room.roomBooking?.final_amount || 0), 0).toFixed(2)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingBooking ? 'Edit Multi-Room Booking' : 'Add Room to Group Booking'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Booking Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Booking *
                  </label>
                  <select
                    value={formData.booking_id}
                    onChange={(e) => handleBookingChange(e.target.value)}
                    required
                    disabled={editingBooking}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select a booking</option>
                    {bookings.map((booking) => (
                      <option key={booking.booking_id} value={booking.booking_id}>
                        {booking.booking_reference || `#${booking.booking_id}`} - {booking.guest_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Booking Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Booking *
                  </label>
                  <select
                    value={formData.room_booking_id}
                    onChange={(e) => setFormData({ ...formData, room_booking_id: e.target.value })}
                    required
                    disabled={!formData.booking_id || editingBooking}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select a room booking</option>
                    {roomBookings.map((rb) => (
                      <option key={rb.room_booking_id || rb.booking_id} value={rb.room_booking_id || rb.booking_id}>
                        Room {rb.room?.unit_number || 'N/A'} - {rb.check_in_date ? new Date(rb.check_in_date).toLocaleDateString() : 'N/A'}
                      </option>
                    ))}
                  </select>
                  {!formData.booking_id && (
                    <p className="text-xs text-gray-500 mt-1">Please select a booking first</p>
                  )}
                </div>

                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    placeholder="e.g., Smith Family Reunion"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Master Booking */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_master_booking"
                    checked={formData.is_master_booking}
                    onChange={(e) => setFormData({ ...formData, is_master_booking: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_master_booking" className="ml-2 block text-sm text-gray-900">
                    Mark as Master Booking (primary room for the group)
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
                  {editingBooking ? 'Update' : 'Add'} Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};