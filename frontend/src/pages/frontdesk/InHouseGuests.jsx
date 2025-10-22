import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Edit,
  Key,
  Bell,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  Home,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const InHouseGuests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [expandedGuest, setExpandedGuest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [requestForm, setRequestForm] = useState({
    type: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      fetchInHouseGuests();
    } else {
      console.warn('⚠️ No token available - using mock data. User may need to login.');
      setGuests(getMockGuests());
      setLoading(false);
    }
  }, []);

  const fetchInHouseGuests = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching in-house guests using apiClient...');
      const response = await apiClient.get('/front-desk/in-house-guests');
      
      // API returns { data: { guests: [...], total: ... } }
      let guestsData = response.data?.data?.guests || [];
      
      if (guestsData.length > 0) {
        guestsData = guestsData.map(guest => ({
          id: guest.booking_id || guest.id,
          bookingId: guest.booking_reference || guest.bookingId,
          guestName: guest.guest_name || guest.guestName || '',
          roomNumber: guest.room_number || guest.unit_number || guest.roomNumber || '',
          roomType: guest.room_type || guest.roomType || 'Standard',
          checkInDate: guest.check_in_date || guest.checkInDate,
          checkOutDate: guest.check_out_date || guest.checkOutDate,
          nights: guest.nights || 0,
          adults: guest.number_of_adults || guest.adults || 0,
          children: guest.number_of_children || guest.children || 0,
          isVip: guest.is_vip || false,
          email: guest.guest_email || guest.email || '',
          phone: guest.guest_phone || guest.phone || '',
          nationality: guest.nationality || '',
          purpose: guest.purpose || '',
          specialRequests: guest.special_requests || guest.specialRequests || [],
          totalBill: guest.total_amount || guest.totalBill || 0,
          paidAmount: guest.paid_amount || guest.paidAmount || 0,
          pendingRequests: guest.pending_requests || guest.pendingRequests || 0,
          lastActivity: guest.last_activity || guest.lastActivity || 'unknown'
        }));
      }
      
      console.log('✅ Transformed guest data:', guestsData);
      setGuests(guestsData.length > 0 ? guestsData : getMockGuests());
    } catch (error) {
      console.error('❌ Error fetching in-house guests:', error);
      setGuests(getMockGuests());
    } finally {
      setLoading(false);
    }
  };

  const getMockGuests = () => [
    {
      id: 1,
      bookingId: 'BK-2024-101',
      guestName: 'Michael Anderson',
      roomNumber: '305',
      roomType: 'Deluxe Suite',
      checkInDate: '2024-01-10',
      checkOutDate: '2024-01-20',
      nights: 10,
      adults: 2,
      children: 1,
      isVip: true,
      email: 'michael.a@email.com',
      phone: '+250788111222',
      nationality: 'USA',
      purpose: 'Business',
      specialRequests: ['Late checkout', 'Extra pillows'],
      totalBill: 1500000,
      paidAmount: 1000000,
      pendingRequests: 2,
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      bookingId: 'BK-2024-102',
      guestName: 'Sophie Martin',
      roomNumber: '208',
      roomType: 'Standard Room',
      checkInDate: '2024-01-12',
      checkOutDate: '2024-01-18',
      nights: 6,
      adults: 1,
      children: 0,
      isVip: false,
      email: 'sophie.m@email.com',
      phone: '+250788222333',
      nationality: 'France',
      purpose: 'Leisure',
      specialRequests: [],
      totalBill: 600000,
      paidAmount: 600000,
      pendingRequests: 0,
      lastActivity: '5 hours ago'
    },
    {
      id: 3,
      bookingId: 'BK-2024-103',
      guestName: 'David Chen',
      roomNumber: '412',
      roomType: 'Executive Suite',
      checkInDate: '2024-01-08',
      checkOutDate: '2024-01-22',
      nights: 14,
      adults: 2,
      children: 2,
      isVip: true,
      email: 'david.c@email.com',
      phone: '+250788333444',
      nationality: 'Singapore',
      purpose: 'Family Vacation',
      specialRequests: ['Baby cot', 'High floor'],
      totalBill: 2100000,
      paidAmount: 1500000,
      pendingRequests: 1,
      lastActivity: '30 minutes ago'
    }
  ];

  const handleAddRequest = (guest) => {
    setSelectedGuest(guest);
    setShowRequestModal(true);
    setRequestForm({
      type: '',
      description: '',
      priority: 'medium'
    });
  };

  const submitRequest = async () => {
    try {
      if (!selectedGuest) return;
      
      console.log('🔔 Submitting guest request for:', selectedGuest.id);
      const response = await apiClient.post('/front-desk/guest-request', {
        guestId: selectedGuest.id,
        ...requestForm
      });

      if (response.data?.success) {
        toast.success('Request submitted successfully!');
        setShowRequestModal(false);
        fetchInHouseGuests();
      } else {
        toast.error(response.data?.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('❌ Error submitting request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.roomNumber.includes(searchTerm) ||
                         guest.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRoom === 'all' || guest.roomType === filterRoom;
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (guestId) => {
    setExpandedGuest(expandedGuest === guestId ? null : guestId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-blue-600" />
          In-House Guests
        </h1>
        <p className="text-gray-600 mt-1">Currently staying guests - {guests.length} total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by guest, room, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Room Types</option>
              <option value="Standard Room">Standard Room</option>
              <option value="Deluxe Suite">Deluxe Suite</option>
              <option value="Executive Suite">Executive Suite</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              VIP Guests
            </button>
          </div>
        </div>
      </div>

      {/* Guests List */}
      <div className="space-y-4">
        {filteredGuests.map((guest) => (
          <div key={guest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Guest Header */}
            <div className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(guest.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{guest.guestName}</h3>
                      {guest.isVip && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          VIP
                        </span>
                      )}
                      {guest.pendingRequests > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                          {guest.pendingRequests} Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        Room {guest.roomNumber} - {guest.roomType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {guest.nights} nights
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {guest.lastActivity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    <div className="text-sm font-medium text-gray-900">
                      RWF {guest.totalBill.toLocaleString()}
                    </div>
                    {guest.totalBill > guest.paidAmount ? (
                      <div className="text-xs text-red-600">
                        Due: RWF {(guest.totalBill - guest.paidAmount).toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-xs text-green-600">Fully Paid</div>
                    )}
                  </div>
                  
                  {expandedGuest === guest.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedGuest === guest.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Contact Information</p>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {guest.email}
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {guest.phone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Stay Details</p>
                    <div className="space-y-1">
                      <p className="text-sm">Check-in: {guest.checkInDate}</p>
                      <p className="text-sm">Check-out: {guest.checkOutDate}</p>
                      <p className="text-sm">Guests: {guest.adults} Adults, {guest.children} Children</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Additional Info</p>
                    <div className="space-y-1">
                      <p className="text-sm">Nationality: {guest.nationality}</p>
                      <p className="text-sm">Purpose: {guest.purpose}</p>
                      <p className="text-sm">Booking ID: {guest.bookingId}</p>
                    </div>
                  </div>
                </div>

                {guest.specialRequests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Special Requests</p>
                    <div className="flex flex-wrap gap-2">
                      {guest.specialRequests.map((request, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {request}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddRequest(guest)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Add Request
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Reissue Key
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    View Folio
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Guest Request</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Guest: <span className="font-medium">{selectedGuest.guestName}</span></p>
                <p className="text-sm text-gray-600">Room: <span className="font-medium">{selectedGuest.roomNumber}</span></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                  <select
                    value={requestForm.type}
                    onChange={(e) => setRequestForm({...requestForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="room-service">Room Service</option>
                    <option value="concierge">Concierge</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the request..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm({...requestForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={submitRequest}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InHouseGuests;