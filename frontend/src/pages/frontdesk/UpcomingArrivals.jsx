import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Users,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Bed,
  CheckCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  UserCheck,
  Building2,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';

export const UpcomingArrivals = () => {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    days: 7,
    status: 'all',
    date: ''
  });
  const [selectedArrival, setSelectedArrival] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [checkInData, setCheckInData] = useState({
    key_card_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchUpcomingArrivals();
  }, [filters]);

  const fetchUpcomingArrivals = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.date) {
        queryParams.append('date', filters.date);
      } else {
        queryParams.append('days', filters.days);
      }
      if (filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }

      const response = await apiClient.get(`/front-desk/upcoming-arrivals?${queryParams}`);
      console.log('✅ Upcoming Arrivals API Response:', response.data);
      
      // API returns nested structure: { success: true, data: { arrivals: [...], ... } }
      const arrivalsData = response.data?.data?.arrivals || [];
      console.log('✅ Transformed Arrivals:', arrivalsData);
      setArrivals(arrivalsData);
    } catch (error) {
      console.error('Error fetching arrivals:', error);
      toast.error('Failed to fetch upcoming arrivals');
      setArrivals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (booking_id) => {
    try {
      console.log('🔄 Processing check-in for booking:', booking_id, 'with data:', checkInData);
      
      const response = await apiClient.post(`/front-desk/check-in/${booking_id}`, checkInData);
      
      if (response.data?.success) {
        toast.success('Guest checked in successfully!');
        setShowCheckInModal(false);
        setCheckInData({ key_card_number: '', notes: '' });
        console.log('✅ Check-in successful:', response.data);
        fetchUpcomingArrivals(); // Refresh list
      } else {
        toast.error(response.data?.message || 'Failed to check in guest');
      }
    } catch (error) {
      console.error('❌ Error checking in guest:', error);
      toast.error(error.response?.data?.message || 'Failed to check in guest');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Confirmed' },
      pre_registered: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Pre-Registered' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </span>
    );
  };

  const getAssignmentStatusBadge = (status) => {
    if (!status) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertCircle className="h-3 w-3" />
          Not Assigned
        </span>
      );
    }
    
    const statusConfig = {
      assigned: { color: 'bg-blue-100 text-blue-800', text: 'Room Assigned' },
      checked_in: { color: 'bg-green-100 text-green-800', text: 'Checked In' },
      checked_out: { color: 'bg-gray-100 text-gray-800', text: 'Checked Out' }
    };
    
    const config = statusConfig[status] || statusConfig.assigned;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getDaysUntilArrival = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const groupedArrivals = arrivals.reduce((acc, arrival) => {
    const date = arrival.check_in_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(arrival);
    return acc;
  }, {});

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-primary-600" />
            Upcoming Arrivals
          </h1>
          <p className="text-gray-600 mt-1">Manage guest check-ins and room assignments</p>
        </div>
        <button
          onClick={fetchUpcomingArrivals}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.days}
            onChange={(e) => setFilters({ ...filters, days: e.target.value, date: '' })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            disabled={!!filters.date}
          >
            <option value="1">Next 1 Day</option>
            <option value="3">Next 3 Days</option>
            <option value="7">Next 7 Days</option>
            <option value="14">Next 14 Days</option>
            <option value="30">Next 30 Days</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">or</span>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pre_registered">Pre-Registered</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Arrivals</p>
              <p className="text-2xl font-bold text-gray-900">{arrivals.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {arrivals.filter(a => a.days_until_arrival === 0).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rooms Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {arrivals.filter(a => a.assignment_id).length}
              </p>
            </div>
            <Bed className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-gray-900">
                {arrivals.filter(a => a.assignment_status === 'checked_in').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Arrivals List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading arrivals...</p>
        </div>
      ) : arrivals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Arrivals</h3>
          <p className="text-gray-600">No guests are scheduled to arrive in the selected period.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedArrivals).map(([date, dateArrivals]) => (
            <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <span className="text-sm font-medium text-primary-600">
                    {getDaysUntilArrival(dateArrivals[0].days_until_arrival)} • {dateArrivals.length} arrival{dateArrivals.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {dateArrivals.map((arrival) => (
                  <div key={arrival.booking_id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {arrival.guest_name}
                          </h4>
                          {getStatusBadge(arrival.booking_status)}
                          {getAssignmentStatusBadge(arrival.assignment_status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4" />
                            <span>{arrival.homestay_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Bed className="h-4 w-4" />
                            <span>{arrival.room_type}</span>
                            {arrival.assigned_room_number && (
                              <span className="font-semibold text-primary-600">
                                • Room {arrival.assigned_room_number}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{arrival.number_of_adults} Adult{arrival.number_of_adults !== 1 ? 's' : ''}</span>
                            {arrival.number_of_children > 0 && (
                              <span>, {arrival.number_of_children} Child{arrival.number_of_children !== 1 ? 'ren' : ''}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{arrival.guest_phone}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{arrival.guest_email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CreditCard className="h-4 w-4" />
                            <span>{arrival.guest_id_type}: {arrival.guest_id_number}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            <strong>Booking Ref:</strong> {arrival.booking_reference}
                          </span>
                          <span className="text-gray-600">
                            <strong>Nights:</strong> {arrival.nights}
                          </span>
                          <span className="text-gray-600">
                            <strong>Check-out:</strong> {new Date(arrival.check_out_date).toLocaleDateString()}
                          </span>
                          <span className="text-gray-600">
                            <strong>Total:</strong> {arrival.total_amount.toLocaleString()} RWF
                          </span>
                        </div>
                        
                        {arrival.special_requests && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-900">
                              <strong>Special Requests:</strong> {arrival.special_requests}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setSelectedArrival(arrival);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Info className="h-4 w-4" />
                          Details
                        </button>
                        
                        {arrival.assignment_status === 'assigned' && arrival.days_until_arrival === 0 && (
                          <button
                            onClick={() => {
                              setSelectedArrival(arrival);
                              setShowCheckInModal(true);
                            }}
                            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                          >
                            <UserCheck className="h-4 w-4" />
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedArrival && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                <p className="text-sm text-gray-600 mt-1">Reference: {selectedArrival.booking_reference}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Guest Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-600" />
                  Guest Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedArrival.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedArrival.guest_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedArrival.guest_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID Type</p>
                    <p className="font-medium text-gray-900">{selectedArrival.guest_id_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID Number</p>
                    <p className="font-medium text-gray-900">{selectedArrival.guest_id_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-medium text-gray-900">
                      {selectedArrival.number_of_adults} Adult{selectedArrival.number_of_adults !== 1 ? 's' : ''}
                      {selectedArrival.number_of_children > 0 && `, ${selectedArrival.number_of_children} Child${selectedArrival.number_of_children !== 1 ? 'ren' : ''}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  Booking Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Check-in Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedArrival.check_in_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedArrival.check_out_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nights</p>
                    <p className="font-medium text-gray-900">{selectedArrival.nights} night{selectedArrival.nights !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Booking Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedArrival.booking_status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedArrival.payment_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium text-gray-900">{selectedArrival.total_amount.toLocaleString()} RWF</p>
                  </div>
                  {selectedArrival.early_checkin && (
                    <div className="col-span-2">
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Early Check-in Requested
                      </p>
                    </div>
                  )}
                  {selectedArrival.late_checkout && (
                    <div className="col-span-2">
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Late Check-out Requested
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Property & Room Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  Property & Room
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Property</p>
                    <p className="font-medium text-gray-900">{selectedArrival.homestay_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{selectedArrival.homestay_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Type</p>
                    <p className="font-medium text-gray-900">{selectedArrival.room_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Price</p>
                    <p className="font-medium text-gray-900">{selectedArrival.room_price.toLocaleString()} RWF/night</p>
                  </div>
                  {selectedArrival.assigned_room_number ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Assigned Room</p>
                        <p className="font-medium text-primary-600">Room {selectedArrival.assigned_room_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Floor</p>
                        <p className="font-medium text-gray-900">{selectedArrival.assigned_room_floor || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Room Status</p>
                        <p className="font-medium text-gray-900 capitalize">{selectedArrival.room_status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Assignment Status</p>
                        <div className="mt-1">
                          {getAssignmentStatusBadge(selectedArrival.assignment_status)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Room not yet assigned
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {selectedArrival.special_requests && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-900">{selectedArrival.special_requests}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      {showCheckInModal && selectedArrival && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Check In Guest</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedArrival.guest_name} • Room {selectedArrival.assigned_room_number}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Card Number
                </label>
                <input
                  type="text"
                  value={checkInData.key_card_number}
                  onChange={(e) => setCheckInData({ ...checkInData, key_card_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., KC-12345"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={checkInData.notes}
                  onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCheckInModal(false);
                  setCheckInData({ key_card_number: '', notes: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckIn(selectedArrival.booking_id)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingArrivals;