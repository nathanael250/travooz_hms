import { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  UserCheck,
  Key,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  Bed,
  DollarSign,
  Phone,
  Mail,
  X,
  MapPin,
  CreditCard,
  LogOut
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

export const FrontDeskBookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });

  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Check-out form state
  const [checkOutData, setCheckOutData] = useState({
    deposit_returned: 0,
    additional_charges: 0,
    payment_method: '',
    notes: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) params.delete(key);
      });

      const response = await apiClient.get(`/receptionist/bookings?${params.toString()}`);

      if (response.data.success) {
        setBookings(response.data.data);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
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
        fetchBookings();
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
        fetchBookings();
      } else {
        toast.error(response.data.message || 'Failed to check in guest');
      }
    } catch (error) {
      console.error('Error checking in guest:', error);
      toast.error(error.response?.data?.message || 'Failed to check in guest');
    }
  };

  const handleCheckOutClick = (booking) => {
    setSelectedBooking(booking);
    setCheckOutData({
      deposit_returned: 0,
      additional_charges: 0,
      payment_method: '',
      notes: ''
    });
    setShowCheckOutModal(true);
  };

  const handleCheckOutConfirm = async () => {
    try {
      const response = await apiClient.post(`/receptionist/check-out/${selectedBooking.booking_id}`, {
        deposit_returned: parseFloat(checkOutData.deposit_returned) || 0,
        additional_charges: parseFloat(checkOutData.additional_charges) || 0,
        payment_method: checkOutData.payment_method || null,
        notes: checkOutData.notes || null
      });

      if (response.data.success) {
        toast.success('Guest checked out successfully!');
        setShowCheckOutModal(false);
        setCheckOutData({
          deposit_returned: 0,
          additional_charges: 0,
          payment_method: '',
          notes: ''
        });
        fetchBookings();
      } else {
        toast.error(response.data.message || 'Failed to check out guest');
      }
    } catch (error) {
      console.error('Error checking out guest:', error);
      toast.error(error.response?.data?.message || 'Failed to check out guest');
    }
  };

  const closeAllModals = () => {
    setShowDetailsModal(false);
    setShowAssignRoomModal(false);
    setShowCheckInModal(false);
    setShowCheckOutModal(false);
    setSelectedBooking(null);
    setSelectedRoom(null);
    setAvailableRooms([]);
    setCheckOutData({
      deposit_returned: 0,
      additional_charges: 0,
      payment_method: '',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
      completed: { color: 'bg-green-100 text-green-800', icon: UserCheck, label: 'In-House' },
      checked_in: { color: 'bg-green-100 text-green-800', icon: UserCheck, label: 'Checked In' },
      checked_out: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Checked Out' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Pending' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
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

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management sdsd</h1>
        <p className="text-gray-600 mt-1">View and manage all property bookings</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Guest name or booking ref..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">In-House</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in From
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in To
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilters({ status: '', start_date: '', end_date: '', search: '' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-gray-50">
                    {/* Booking Info */}
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{booking.booking_reference}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(booking.created_at)}
                        </div>
                      </div>
                    </td>

                    {/* Guest Info */}
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{booking.guest_name}</div>
                        {booking.guest_email && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {booking.guest_email}
                          </div>
                        )}
                        {booking.guest_phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {booking.guest_phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="h-3 w-3" />
                          {formatDate(booking.check_in_date)}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(booking.check_out_date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.nights} night{booking.nights !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                          <Bed className="h-3 w-3" />
                          {booking.room_number}
                        </div>
                        <div className="text-sm text-gray-500">{booking.room_type}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3" />
                          {booking.adults} Adult{booking.adults !== 1 ? 's' : ''}
                          {booking.children > 0 && `, ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}`}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {getStatusBadge(booking.status)}
                        <div>{getPaymentStatusBadge(booking.payment_status)}</div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(booking.total_amount)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {booking.can_assign_room && (
                          <button
                            onClick={() => handleAssignRoom(booking)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="Assign Room"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                        )}

                        {booking.can_check_in && (
                          <button
                            onClick={() => handleCheckInClick(booking)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Check In"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}

                        {booking.status === 'completed' && (
                          <button
                            onClick={() => handleCheckOutClick(booking)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="Check Out"
                          >
                            <LogOut className="h-4 w-4" />
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

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.total_pages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={closeAllModals}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Booking Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Reference</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.booking_reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Date</label>
                    <p className="text-gray-900">{formatDate(selectedBooking.created_at)}</p>
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

              {/* Guest Information */}
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
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedBooking.guest_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guests</label>
                    <p className="text-gray-900">
                      {selectedBooking.adults} Adult{selectedBooking.adults !== 1 ? 's' : ''}
                      {selectedBooking.children > 0 && `, ${selectedBooking.children} Child${selectedBooking.children !== 1 ? 'ren' : ''}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room & Stay Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room & Stay Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Room Type</label>
                    <p className="text-gray-900">{selectedBooking.room_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Room Number</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.room_number}</p>
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

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-gray-900 font-bold text-lg">{formatCurrency(selectedBooking.total_amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedBooking.payment_status)}</div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedBooking.special_requests}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeAllModals}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
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
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Assign Room</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Booking: {selectedBooking.booking_reference}
                </p>
              </div>
              <button
                onClick={closeAllModals}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Available Room
                </label>
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
                          selectedRoom === room.room_id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
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

              {/* Guest & Booking Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Guest:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedBooking.guest_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {selectedBooking.nights} night{selectedBooking.nights !== 1 ? 's' : ''}
                    </span>
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

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeAllModals}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
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
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confirm Check-In</h2>
              <button
                onClick={closeAllModals}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  Are you sure you want to check in this guest?
                </p>
              </div>

              {/* Booking Summary */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guest</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.guest_name}</p>
                    {selectedBooking.guest_email && (
                      <p className="text-sm text-gray-600">{selectedBooking.guest_email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Bed className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Room</label>
                    <p className="text-gray-900 font-medium">
                      {selectedBooking.room_number} - {selectedBooking.room_type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stay Duration</label>
                    <p className="text-gray-900">
                      {formatDate(selectedBooking.check_in_date)} - {formatDate(selectedBooking.check_out_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.nights} night{selectedBooking.nights !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-gray-900 font-bold text-lg">{formatCurrency(selectedBooking.total_amount)}</p>
                    <div className="mt-1">{getPaymentStatusBadge(selectedBooking.payment_status)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeAllModals}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckInConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-Out Confirmation Modal */}
      {showCheckOutModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Guest Check-Out</h2>
              <button
                onClick={closeAllModals}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800">
                  Process guest check-out and record any charges or deposits.
                </p>
              </div>

              {/* Booking Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guest</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.guest_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  <Bed className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Room</label>
                    <p className="text-gray-900 font-medium">
                      {selectedBooking.room_number} - {selectedBooking.room_type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Check-Out Form */}
              <div className="space-y-4">
                {/* Deposit Returned */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit Returned
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={checkOutData.deposit_returned}
                    onChange={(e) => setCheckOutData(prev => ({ ...prev, deposit_returned: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Additional Charges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Charges
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={checkOutData.additional_charges}
                    onChange={(e) => setCheckOutData(prev => ({ ...prev, additional_charges: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method (Optional)
                  </label>
                  <select
                    value={checkOutData.payment_method}
                    onChange={(e) => setCheckOutData(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any additional notes about the check-out..."
                    value={checkOutData.notes}
                    onChange={(e) => setCheckOutData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeAllModals}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOutConfirm}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Confirm Check-Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
