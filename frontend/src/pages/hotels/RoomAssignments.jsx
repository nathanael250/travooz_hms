import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Calendar,
  User,
  Bed,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  Eye,
  Settings,
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Download,
  Upload,
  History,
  Award,
  Target,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const RoomAssignments = () => {
  // State Management
  const [assignments, setAssignments] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAvailableRoomsModal, setShowAvailableRoomsModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [filters, setFilters] = useState({
    status: '',
    unassigned_only: false,
    check_in_date: '',
    check_out_date: '',
    room_type: '',
    floor: '',
    sort_by: 'check_in_date'
  });
  
  const [assignmentData, setAssignmentData] = useState({
    booking_id: '',
    inventory_id: '',
    assignment_type: 'manual',
    notes: ''
  });
  
  const [roomSearchParams, setRoomSearchParams] = useState({
    check_in_date: '',
    check_out_date: '',
    guests: 1,
    room_type_id: ''
  });

  // Configuration Objects
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: Clock, 
      label: 'Pending',
      gradient: 'from-yellow-50 to-yellow-100'
    },
    confirmed: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle, 
      label: 'Confirmed',
      gradient: 'from-green-50 to-green-100'
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle, 
      label: 'Cancelled',
      gradient: 'from-red-50 to-red-100'
    },
    completed: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: CheckCircle, 
      label: 'Completed',
      gradient: 'from-blue-50 to-blue-100'
    }
  };

  const roomStatusConfig = {
    available: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle, 
      label: 'Available',
      description: 'Ready for assignment'
    },
    occupied: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Users, 
      label: 'Occupied',
      description: 'Currently in use'
    },
    reserved: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: Calendar, 
      label: 'Reserved',
      description: 'Reserved for guest'
    },
    cleaning: { 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      icon: RefreshCw, 
      label: 'Cleaning',
      description: 'Being cleaned'
    },
    maintenance: { 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      icon: Settings, 
      label: 'Maintenance',
      description: 'Under maintenance'
    },
    out_of_order: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle, 
      label: 'Out of Order',
      description: 'Not available'
    }
  };

  // API Functions
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.unassigned_only) params.append('unassigned_only', 'true');
      if (filters.check_in_date) params.append('check_in_date', filters.check_in_date);
      if (filters.check_out_date) params.append('check_out_date', filters.check_out_date);
      
  const response = await axios.get(`${API_BASE_URL}/api/room-assignment?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch room assignments');
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('hms_token');
  const response = await axios.get(`${API_BASE_URL}/api/room-assignment/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const searchGuests = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem('hms_token');
      const response = await axios.get(
        `${API_BASE_URL}/api/room-assignments/search-guest?search=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Transform booking data to match the expected assignment structure
        const transformedResults = response.data.data.map(booking => ({
          booking_id: booking.booking_id,
          inventory_id: booking.roomBooking?.inventory_id || null,
          check_in_date: booking.roomBooking?.check_in_date,
          check_out_date: booking.roomBooking?.check_out_date,
          guests: booking.roomBooking?.guests || 1,
          guest_name: booking.roomBooking?.guest_name || booking.user?.name,
          guest_email: booking.roomBooking?.guest_email || booking.user?.email,
          room_price_per_night: booking.roomBooking?.room_price_per_night,
          total_room_amount: booking.roomBooking?.total_room_amount,
          booking: {
            booking_id: booking.booking_id,
            booking_reference: booking.booking_reference,
            status: booking.status,
            payment_status: booking.payment_status,
            user_id: booking.user_id
          },
          room: booking.roomBooking?.room || null,
          user: booking.user,
          roomAssignments: booking.roomAssignments || []
        }));
        setSearchResults(transformedResults);
      }
    } catch (error) {
      console.error('Error searching guests:', error);
      toast.error('Failed to search for guests');
    } finally {
      setIsSearching(false);
    }
  };

  const fetchAvailableRooms = async (searchParams) => {
    try {
      // Validate required parameters
      if (!searchParams.check_in_date || !searchParams.check_out_date) {
        console.warn('Cannot fetch available rooms: missing check-in or check-out date');
        return;
      }

      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

  const response = await axios.get(`${API_BASE_URL}/api/room-assignment/available-rooms?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAvailableRooms(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error('Failed to fetch available rooms');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAssignments(), fetchStatistics()]);
      setLoading(false);
    };
    loadData();
  }, [filters]);

  // Search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && searchTerm.trim().length >= 2) {
        searchGuests(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Assignment Handlers
  const handleAssignRoom = async (e) => {
    e.preventDefault();
    
    if (!assignmentData.booking_id || !assignmentData.inventory_id) {
      toast.error('Please select both booking and room');
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await axios.post(
  `${API_BASE_URL}/api/room-assignment/assign`,
        assignmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('✅ Room assigned successfully!');
        setShowAssignModal(false);
        setAssignmentData({
          booking_id: '',
          inventory_id: '',
          assignment_type: 'manual',
          notes: ''
        });
        fetchAssignments();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error assigning room:', error);
      toast.error(error.response?.data?.message || 'Failed to assign room');
    }
  };

  const handleAutoAssign = async (bookingId, preferences = {}) => {
    try {
      const token = localStorage.getItem('hms_token');
      
      // Show loading toast
      const loadingToast = toast.loading('🤖 Finding the best room...');
      
      const response = await axios.post(
  `${API_BASE_URL}/api/room-assignment/auto-assign`,
        { booking_id: bookingId, preferences },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success('✨ Room auto-assigned successfully!');
        fetchAssignments();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error auto-assigning room:', error);
      toast.error(error.response?.data?.message || 'Failed to auto-assign room');
    }
  };

  const handleUnassignRoom = async (bookingId, reason = '') => {
    if (!window.confirm('Are you sure you want to unassign this room?')) {
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await axios.post(
  `${API_BASE_URL}/api/room-assignment/unassign`,
        { booking_id: bookingId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Room unassigned successfully');
        fetchAssignments();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error unassigning room:', error);
      toast.error(error.response?.data?.message || 'Failed to unassign room');
    }
  };

  const handleBulkAutoAssign = async () => {
    if (selectedBookings.length === 0) {
      toast.error('Please select bookings to assign');
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const loadingToast = toast.loading(`🤖 Auto-assigning ${selectedBookings.length} bookings...`);
      
      const promises = selectedBookings.map(bookingId =>
        axios.post(
          `${API_BASE_URL}/api/room-assignment/auto-assign`,
          { booking_id: bookingId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);
      toast.dismiss(loadingToast);
      toast.success(`✨ Successfully assigned ${selectedBookings.length} rooms!`);
      
      setSelectedBookings([]);
      setShowBulkAssignModal(false);
      fetchAssignments();
      fetchStatistics();
    } catch (error) {
      console.error('Error bulk assigning:', error);
      toast.error('Some assignments failed. Please try again.');
    }
  };

  // Utility Functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `RWF ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const calculateRoomScore = (room, booking) => {
    let score = 100;
    // Add scoring logic based on preferences
    return score;
  };

  const openAvailableRooms = (booking) => {
    setSelectedBooking(booking);
    setRoomSearchParams({
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      guests: booking.guests,
      room_type_id: ''
    });
    fetchAvailableRooms({
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      guests: booking.guests
    });
    setShowAvailableRoomsModal(true);
  };

  const toggleBookingSelection = (bookingId) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  // When searching, show search results; otherwise show filtered assignments
  const displayedBookings = searchTerm && searchTerm.trim().length >= 2
    ? searchResults
    : assignments;

  const filteredAssignments = displayedBookings;

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading room assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4 shadow-lg">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                Room Assignments
              </h1>
              <p className="mt-2 text-gray-600 ml-16">
                Smart room allocation with manual and automatic assignment options
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {selectedBookings.length > 0 && (
                <button
                  onClick={() => setShowBulkAssignModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transition-all transform hover:scale-105"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Bulk Assign ({selectedBookings.length})
                </button>
              )}
              
              <button
                onClick={() => setShowAssignModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center shadow-lg transition-all transform hover:scale-105"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Assign Room
              </button>
              
              <button
                onClick={() => fetchAssignments()}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg flex items-center shadow border border-gray-200 transition-all"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {statistics.assignment_summary.total_bookings}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All room bookings</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Assigned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {statistics.assignment_summary.assigned_bookings}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Rooms allocated</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Unassigned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {statistics.assignment_summary.unassigned_bookings}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Needs attention</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Assignment Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {statistics.assignment_summary.assignment_rate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Efficiency score</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Guest Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center mb-3">
            <Search className="h-6 w-6 text-gray-700 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Quick Guest Search</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Search for a guest by name, email, phone, or booking reference to view and assign their room</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type guest name, email, phone, or booking reference..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
          {searchTerm && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-gray-700 text-sm">
                {isSearching ? (
                  'Searching...'
                ) : (
                  <>
                    Showing {filteredAssignments.length} result{filteredAssignments.length !== 1 ? 's' : ''} for "{searchTerm}"
                  </>
                )}
              </p>
              {searchTerm && !isSearching && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Filters & Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
              <input
                type="date"
                value={filters.check_in_date}
                onChange={(e) => setFilters(prev => ({ ...prev, check_in_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
              <input
                type="date"
                value={filters.check_out_date}
                onChange={(e) => setFilters(prev => ({ ...prev, check_out_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sort_by}
                onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="check_in_date">Check-in Date</option>
                <option value="booking_date">Booking Date</option>
                <option value="guest_name">Guest Name</option>
                <option value="amount">Amount</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.unassigned_only}
                  onChange={(e) => setFilters(prev => ({ ...prev, unassigned_only: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Unassigned Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => {
              const booking = assignment.booking;
              const room = assignment.room;
              const config = statusConfig[booking?.status] || statusConfig.pending;
              const roomConfig = room ? roomStatusConfig[room.status] || roomStatusConfig.available : null;
              const StatusIcon = config.icon;
              const isSelected = selectedBookings.includes(assignment.booking_id);
              
              return (
                <div
                  key={assignment.booking_id}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden border-2 ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${config.gradient} p-4 border-b`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBookingSelection(assignment.booking_id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Booking</p>
                          <p className="text-lg font-bold text-gray-900">
                            #{booking?.booking_reference || assignment.booking_id}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Guest Info */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-semibold text-gray-900">{assignment.guest_name || 'Guest'}</span>
                      </div>
                      {assignment.guest_email && (
                        <p className="text-sm text-gray-600 ml-6">{assignment.guest_email}</p>
                      )}
                      <div className="flex items-center mt-2 ml-6">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{assignment.guests} guests</span>
                      </div>
                    </div>

                    {/* Stay Period */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Check-in</p>
                          <p className="font-medium text-gray-900">{formatDate(assignment.check_in_date)}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Check-out</p>
                          <p className="font-medium text-gray-900">{formatDate(assignment.check_out_date)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {assignment.nights} night{assignment.nights !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Room Assignment */}
                    <div className="mb-4">
                      {room ? (
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Bed className="h-5 w-5 text-green-600 mr-2" />
                              <span className="font-bold text-gray-900">Room {room.unit_number}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roomConfig.color}`}>
                              {roomConfig.label}
                            </span>
                          </div>
                          {room.floor && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              Floor {room.floor}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                          <div className="flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="font-semibold text-red-800">Unassigned</span>
                          </div>
                          <p className="text-xs text-red-600 text-center mt-1">Needs room allocation</p>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(assignment.final_amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Per night</span>
                        <span className="text-sm text-gray-700">
                          {formatCurrency(assignment.room_price_per_night)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!room ? (
                        <>
                          <button
                            onClick={() => openAvailableRooms(assignment)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 shadow"
                          >
                            <Bed className="h-4 w-4 mr-2" />
                            Assign
                          </button>
                          <button
                            onClick={() => handleAutoAssign(assignment.booking_id)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 shadow"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Auto
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUnassignRoom(assignment.booking_id, 'Manual unassignment')}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 shadow"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Unassign
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookings(filteredAssignments.map(a => a.booking_id));
                          } else {
                            setSelectedBookings([]);
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stay Period
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Room Assignment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Guest Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => {
                    const booking = assignment.booking;
                    const room = assignment.room;
                    const config = statusConfig[booking?.status] || statusConfig.pending;
                    const roomConfig = room ? roomStatusConfig[room.status] || roomStatusConfig.available : null;
                    const isSelected = selectedBookings.includes(assignment.booking_id);
                    
                    return (
                      <tr 
                        key={assignment.booking_id} 
                        className={`hover:bg-blue-50 transition-colors ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBookingSelection(assignment.booking_id)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              #{booking?.booking_reference || assignment.booking_id}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 border ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              {formatDate(assignment.check_in_date)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              {formatDate(assignment.check_out_date)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {assignment.nights} night{assignment.nights !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {room ? (
                            <div>
                              <div className="flex items-center mb-1">
                                <Bed className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm font-semibold text-gray-900">
                                  Room {room.unit_number}
                                </span>
                              </div>
                              {room.floor && (
                                <div className="text-xs text-gray-500 mb-1">
                                  Floor {room.floor}
                                </div>
                              )}
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roomConfig.color}`}>
                                {roomConfig.label}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Unassigned
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center font-medium mb-1">
                              <User className="h-4 w-4 text-gray-400 mr-1" />
                              {assignment.guest_name || 'Guest'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {assignment.guests} guest{assignment.guests !== 1 ? 's' : ''}
                            </div>
                            {assignment.guest_email && (
                              <div className="text-xs text-gray-500 mt-1">
                                {assignment.guest_email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(assignment.final_amount)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(assignment.room_price_per_night)}/night
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {!room ? (
                              <>
                                <button
                                  onClick={() => openAvailableRooms(assignment)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center font-medium"
                                  title="Assign Room"
                                >
                                  <Bed className="h-4 w-4 mr-1" />
                                  Assign
                                </button>
                                <button
                                  onClick={() => handleAutoAssign(assignment.booking_id)}
                                  className="text-green-600 hover:text-green-900 flex items-center font-medium"
                                  title="Auto Assign"
                                >
                                  <Zap className="h-4 w-4 mr-1" />
                                  Auto
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleUnassignRoom(assignment.booking_id, 'Manual unassignment')}
                                className="text-red-600 hover:text-red-900 flex items-center font-medium"
                                title="Unassign Room"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Unassign
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredAssignments.length === 0 && (
                <div className="text-center py-16">
                  <UserPlus className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No room bookings found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm 
                      ? 'No bookings match your search criteria.' 
                      : 'No room bookings match your current filters.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Assign Room Manually</h3>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAssignRoom} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Booking ID *
                    </label>
                    <input
                      type="number"
                      value={assignmentData.booking_id}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, booking_id: e.target.value }))}
                      placeholder="Enter booking ID"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Room Inventory ID *
                    </label>
                    <input
                      type="number"
                      value={assignmentData.inventory_id}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, inventory_id: e.target.value }))}
                      placeholder="Enter room inventory ID"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assignment Type
                    </label>
                    <select
                      value={assignmentData.assignment_type}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, assignment_type: e.target.value }))}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="manual">Manual Assignment</option>
                      <option value="auto">Auto Assignment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={assignmentData.notes}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes about this assignment..."
                      rows={3}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border border-transparent rounded-lg text-sm font-semibold text-white transition-all shadow-lg transform hover:scale-105"
                  >
                    Assign Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Available Rooms Modal */}
        {showAvailableRoomsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Sparkles className="h-6 w-6 text-blue-600 mr-2" />
                      Available Rooms
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Booking #{selectedBooking.booking_id} • {formatDate(selectedBooking.check_in_date)} - {formatDate(selectedBooking.check_out_date)} • {selectedBooking.guests} guest{selectedBooking.guests !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAvailableRoomsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-7 w-7" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {availableRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {availableRooms.map((room) => {
                      const config = roomStatusConfig[room.status] || roomStatusConfig.available;
                      const RoomIcon = config.icon;
                      
                      return (
                        <div 
                          key={room.inventory_id} 
                          className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-xl transition-all transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg mr-2">
                                <Bed className="h-6 w-6 text-blue-600" />
                              </div>
                              <span className="text-lg font-bold text-gray-900">Room {room.unit_number}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                              <RoomIcon className="h-3 w-3 inline mr-1" />
                              {config.label}
                            </span>
                          </div>
                          
                          {room.floor && (
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              Floor {room.floor}
                            </div>
                          )}

                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Room Type</p>
                            <p className="font-semibold text-gray-900">{room.room_type_name || 'Standard Room'}</p>
                          </div>

                          <button
                            onClick={() => {
                              setAssignmentData({
                                booking_id: selectedBooking.booking_id,
                                inventory_id: room.inventory_id,
                                assignment_type: 'manual',
                                notes: `Assigned from available rooms selection`
                              });
                              handleAssignRoom({ preventDefault: () => {} });
                              setShowAvailableRoomsModal(false);
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-lg text-sm font-semibold flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign This Room
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Bed className="mx-auto h-20 w-20 text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No Available Rooms</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                      No rooms are available for the selected dates and criteria. Please try different dates or contact support.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Assignment Modal */}
        {showBulkAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Bulk Auto-Assign</h3>
                  </div>
                  <button
                    onClick={() => setShowBulkAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg mb-4">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-center text-gray-700 mb-2">
                    You are about to auto-assign <span className="font-bold text-purple-600">{selectedBookings.length}</span> booking{selectedBookings.length !== 1 ? 's' : ''}.
                  </p>
                  <p className="text-center text-sm text-gray-500">
                    The system will automatically find and assign the best available rooms based on preferences and availability.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBulkAssignModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAutoAssign}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border border-transparent rounded-lg text-sm font-semibold text-white transition-all shadow-lg transform hover:scale-105"
                  >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Auto-Assign All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};