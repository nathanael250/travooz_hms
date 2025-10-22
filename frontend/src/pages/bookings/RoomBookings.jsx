import React, { useState, useEffect } from 'react';
import {
  Bed,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  CalendarCheck,
  Users,
  DollarSign,
  FileText,
  X,
  Key,
  UserCheck,
  Mail,
  Phone,
  CreditCard
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

export const RoomBookings = () => {
  const [roomBookings, setRoomBookings] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    room_type: '',
    homestay_id: '',
    check_in_date: '',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal states for action buttons
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchHomestays();
  }, []);

  useEffect(() => {
    fetchRoomBookings();
  }, [filters]);

  const fetchHomestays = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/homestays', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.homestays) {
        setHomestays(result.homestays);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const fetchRoomBookings = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );

      const token = localStorage.getItem('hms_token');

      // Use the dedicated room bookings endpoint
      const response = await fetch(`http://localhost:3001/api/room-bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setRoomBookings(result.data.bookings);
      } else {
        console.error('Failed to fetch room bookings:', result.message);
      }
    } catch (error) {
      console.error('Error fetching room bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (bookingId) => {
    if (!window.confirm('Generate invoice for this booking?')) return;

    try {
      const user = JSON.parse(localStorage.getItem('hms_user') || '{}');
      const response = await apiClient.post(`/invoices/generate/${bookingId}`, {
        generated_by: user.user_id
      });

      if (response.data.success) {
        alert('Invoice generated successfully!');
        window.open(`/financial/invoices`, '_blank');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        const invoiceId = error.response.data.invoice_id;
        if (window.confirm('Invoice already exists for this booking. Would you like to view it?')) {
          window.open(`/financial/invoices`, '_blank');
        }
      } else {
        alert('Failed to generate invoice: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      checked_in: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CalendarCheck },
      checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      no_show: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const calculateNights = (checkIn, checkOut) => {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return nights;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handler functions for action buttons
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleAssignRoom = async (booking) => {
    setSelectedBooking(booking);
    // Fetch available rooms for this booking
    try {
      const response = await apiClient.get(`/receptionist/available-rooms`, {
        params: {
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          room_type_id: booking.room_type_id
        }
      });
      if (response.data.success) {
        setAvailableRooms(response.data.data);
        setShowAssignRoomModal(true);
      } else {
        toast.error('Failed to fetch available rooms');
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch available rooms');
    }
  };

  const handleAssignRoomConfirm = async () => {
    if (!selectedRoom) {
      toast.error('Please select a room');
      return;
    }

    try {
      const response = await apiClient.post(`/receptionist/assign-room/${selectedBooking.booking_id}`, {
        room_id: selectedRoom
      });

      if (response.data.success) {
        toast.success('Room assigned successfully!');
        setShowAssignRoomModal(false);
        setSelectedRoom(null);
        fetchRoomBookings();
      } else {
        toast.error(response.data.message || 'Failed to assign room');
      }
    } catch (error) {
      console.error('Error assigning room:', error);
      toast.error(error.response?.data?.message || 'Failed to assign room');
    }
  };

  const handleCheckInClick = (booking) => {
    setSelectedBooking(booking);
    setShowCheckInModal(true);
  };

  const handleCheckInConfirm = async () => {
    try {
      const response = await apiClient.post(`/receptionist/check-in/${selectedBooking.booking_id}`, {
        actual_check_in_time: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Guest checked in successfully!');
        setShowCheckInModal(false);
        fetchRoomBookings();
      } else {
        toast.error(response.data.message || 'Failed to check in guest');
      }
    } catch (error) {
      console.error('Error checking in guest:', error);
      toast.error(error.response?.data?.message || 'Failed to check in guest');
    }
  };

  const closeAllModals = () => {
    setShowDetailsModal(false);
    setShowAssignRoomModal(false);
    setShowCheckInModal(false);
    setSelectedBooking(null);
    setSelectedRoom(null);
    setAvailableRooms([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `RWF ${(amount || 0).toLocaleString()}`;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      partial: { color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
      pending: { color: 'bg-orange-100 text-orange-800', label: 'Pending' },
      refunded: { color: 'bg-purple-100 text-purple-800', label: 'Refunded' }
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Bookings</h1>
          <p className="text-gray-600">Manage individual room reservations and check-ins</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchRoomBookings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Bed className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{roomBookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CalendarCheck className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Check-ins Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                4
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Occupied Rooms</p>
              <p className="text-2xl font-semibold text-gray-900">
                4
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                RWF {roomBookings
                  .filter(booking => 
                    new Date(booking.check_in_date).toDateString() === new Date().toDateString()
                  )
                  .reduce((sum, booking) => sum + parseFloat(booking.total_amount || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={() => setFilters({ status: '', room_type: '', homestay_id: '', check_in_date: '', search: '' })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          {/* Room Type Filter */}
          <select
            value={filters.room_type}
            onChange={(e) => handleFilterChange('room_type', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Room Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
            <option value="family">Family</option>
          </select>

          {/* Check-in Date Filter */}
          <input
            type="date"
            value={filters.check_in_date}
            onChange={(e) => handleFilterChange('check_in_date', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Homestay Filter */}
          <select
            value={filters.homestay_id}
            onChange={(e) => handleFilterChange('homestay_id', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Properties</option>
            {homestays.map((homestay) => (
              <option key={homestay.homestay_id} value={homestay.homestay_id}>
                {homestay.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                    <div className="flex flex-col items-center">
                      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                      <p className="mt-2 text-gray-500">Loading room bookings...</p>
                    </div>
                  </td>
                </tr>
              ) : roomBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Bed className="w-12 h-12 text-gray-400" />
                      <p className="mt-2 text-gray-500">No room bookings found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters or create a new booking</p>
                    </div>
                  </td>
                </tr>
              ) : (
                roomBookings.map((booking) => (
                  <tr key={booking.room_booking_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{booking.booking_reference}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.homestay_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.guest_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.guest_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.room_number ? `Room ${booking.room_number}` : 'Unassigned'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.room_type_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        RWF {parseFloat(booking.final_amount || booking.total_amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status === 'pending' ? 'Pending' : 'Unpaid'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!booking.room_number && booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleAssignRoom(booking)}
                            className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg"
                            title="Assign Room"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}

                        {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                          <button
                            onClick={() => handleCheckInClick(booking)}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg"
                            title="Check In"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded-lg" title="Edit Booking">
                          <Edit className="w-4 h-4" />
                        </button>

                        {(booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out' || booking.status === 'completed') && (
                          <button
                            className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded-lg"
                            title="Generate Invoice"
                            onClick={() => generateInvoice(booking.booking_id)}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button onClick={closeAllModals} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Reference</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.booking_reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Property</label>
                    <p className="text-gray-900">{selectedBooking.homestay_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedBooking.payment_status)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guest Name</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.guest_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedBooking.guest_email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room & Stay Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Room Type</label>
                    <p className="text-gray-900">{selectedBooking.room_type_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Room Number</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.room_number || 'Unassigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-in Date</label>
                    <p className="text-gray-900">{formatDate(selectedBooking.check_in_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-out Date</label>
                    <p className="text-gray-900">{formatDate(selectedBooking.check_out_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-gray-900">{selectedBooking.nights} night{selectedBooking.nights !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-gray-900 font-bold text-lg">{formatCurrency(selectedBooking.total_amount || selectedBooking.final_amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedBooking.payment_status)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button onClick={closeAllModals} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Room Modal */}
      {showAssignRoomModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Assign Room</h2>
                <p className="text-sm text-gray-600 mt-1">Booking: {selectedBooking.booking_reference}</p>
              </div>
              <button onClick={closeAllModals} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Available Room</label>
                {availableRooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bed className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No available rooms found for the selected dates and room type.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableRooms.map((room) => (
                      <label
                        key={room.room_id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedRoom === room.room_id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="room"
                            value={room.room_id}
                            checked={selectedRoom === room.room_id}
                            onChange={() => setSelectedRoom(room.room_id)}
                            className="h-4 w-4 text-purple-600"
                          />
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <Bed className="h-4 w-4" />
                              Room {room.room_number}
                            </div>
                            <div className="text-sm text-gray-500">{room.room_type_name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Floor {room.floor_number}
                          </div>
                          <div className="text-xs text-gray-500">{room.status}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Guest:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedBooking.guest_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedBooking.nights} night{selectedBooking.nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-in:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatDate(selectedBooking.check_in_date)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-out:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatDate(selectedBooking.check_out_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button onClick={closeAllModals} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleAssignRoomConfirm}
                disabled={!selectedRoom}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Assign Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Confirmation Modal */}
      {showCheckInModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confirm Check-In</h2>
              <button onClick={closeAllModals} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">Are you sure you want to check in this guest?</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guest</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.guest_name}</p>
                    {selectedBooking.guest_email && <p className="text-sm text-gray-600">{selectedBooking.guest_email}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Bed className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Room</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.room_number ? `Room ${selectedBooking.room_number}` : 'Unassigned'} - {selectedBooking.room_type_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stay Duration</label>
                    <p className="text-gray-900">{formatDate(selectedBooking.check_in_date)} - {formatDate(selectedBooking.check_out_date)}</p>
                    <p className="text-sm text-gray-600">{selectedBooking.nights} night{selectedBooking.nights !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-gray-900 font-bold text-lg">{formatCurrency(selectedBooking.total_amount || selectedBooking.final_amount)}</p>
                    <div className="mt-1">{getPaymentStatusBadge(selectedBooking.payment_status)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button onClick={closeAllModals} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleCheckInConfirm} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};