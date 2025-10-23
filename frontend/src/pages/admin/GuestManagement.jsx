import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const GuestManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const guestsPerPage = 10;

  useEffect(() => {
    fetchGuests();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    filterGuests();
  }, [guests, searchTerm, statusFilter]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/guests');
      if (response.data && response.data.success) {
        setGuests(response.data.data || []);
        setTotalPages(Math.ceil((response.data.data || []).length / guestsPerPage));
      } else {
        // Fallback to mock data
        setGuests(getMockGuests());
        setTotalPages(Math.ceil(getMockGuests().length / guestsPerPage));
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to load guests');
      // Use mock data as fallback
      setGuests(getMockGuests());
      setTotalPages(Math.ceil(getMockGuests().length / guestsPerPage));
    } finally {
      setLoading(false);
    }
  };

  const getMockGuests = () => [
    {
      guest_id: 1,
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@email.com',
      phone: '+250 788 123 456',
      nationality: 'American',
      id_number: '123456789',
      address: '123 Main St, New York',
      status: 'active',
      total_bookings: 5,
      total_spent: 2500000,
      last_visit: '2024-01-15',
      created_at: '2023-06-15',
      preferences: ['Non-smoking', 'High floor'],
      vip_status: 'gold'
    },
    {
      guest_id: 2,
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+250 789 234 567',
      nationality: 'British',
      id_number: '987654321',
      address: '456 Oak Ave, London',
      status: 'active',
      total_bookings: 12,
      total_spent: 4800000,
      last_visit: '2024-01-20',
      created_at: '2023-03-10',
      preferences: ['Breakfast included', 'Airport shuttle'],
      vip_status: 'platinum'
    },
    {
      guest_id: 3,
      first_name: 'Michael',
      last_name: 'Wilson',
      email: 'mike.wilson@email.com',
      phone: '+250 790 345 678',
      nationality: 'Canadian',
      id_number: '456789123',
      address: '789 Pine St, Toronto',
      status: 'inactive',
      total_bookings: 2,
      total_spent: 800000,
      last_visit: '2023-11-30',
      created_at: '2023-08-20',
      preferences: ['Business center access'],
      vip_status: 'silver'
    },
    {
      guest_id: 4,
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'emily.davis@email.com',
      phone: '+250 791 456 789',
      nationality: 'Australian',
      id_number: '789123456',
      address: '321 Maple Dr, Sydney',
      status: 'active',
      total_bookings: 8,
      total_spent: 3200000,
      last_visit: '2024-01-18',
      created_at: '2023-05-05',
      preferences: ['Pool access', 'Late checkout'],
      vip_status: 'gold'
    },
    {
      guest_id: 5,
      first_name: 'David',
      last_name: 'Brown',
      email: 'david.brown@email.com',
      phone: '+250 792 567 890',
      nationality: 'German',
      id_number: '321654987',
      address: '654 Elm St, Berlin',
      status: 'active',
      total_bookings: 3,
      total_spent: 1200000,
      last_visit: '2024-01-10',
      created_at: '2023-09-15',
      preferences: ['Vegetarian meals'],
      vip_status: 'bronze'
    }
  ];

  const filterGuests = () => {
    let filtered = [...guests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(guest => 
        `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(guest => guest.status === statusFilter);
    }

    setFilteredGuests(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVipStatusColor = (vipStatus) => {
    switch (vipStatus) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewGuest = (guest) => {
    setSelectedGuest(guest);
    setShowGuestModal(true);
  };

  const handleEditGuest = (guest) => {
    // TODO: Implement edit functionality
    toast.success('Edit functionality coming soon');
  };

  const handleDeleteGuest = (guestId) => {
    // TODO: Implement delete functionality
    toast.success('Delete functionality coming soon');
  };

  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * guestsPerPage,
    currentPage * guestsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Guest Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage guest profiles, preferences, and booking history
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Guest
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="last_name-asc">Name A-Z</option>
              <option value="last_name-desc">Name Z-A</option>
              <option value="total_spent-desc">Highest Spent</option>
              <option value="total_spent-asc">Lowest Spent</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-2xl font-bold text-gray-900">{guests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Guests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {guests.filter(g => g.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">VIP Guests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {guests.filter(g => g.vip_status && g.vip_status !== 'bronze').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {guests.filter(g => {
                    const lastVisit = new Date(g.last_visit);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return lastVisit >= thirtyDaysAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guests Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                    VIP Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedGuests.map((guest) => (
                  <tr key={guest.guest_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {guest.first_name} {guest.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {guest.nationality}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.email}</div>
                      <div className="text-sm text-gray-500">{guest.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(guest.status)}`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVipStatusColor(guest.vip_status)}`}>
                        {guest.vip_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.total_bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RWF {guest.total_spent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(guest.last_visit).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewGuest(guest)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditGuest(guest)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Guest"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.guest_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Guest"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * guestsPerPage + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * guestsPerPage, filteredGuests.length)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{filteredGuests.length}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guest Details Modal */}
      {showGuestModal && selectedGuest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Guest Details - {selectedGuest.first_name} {selectedGuest.last_name}
                </h3>
                <button
                  onClick={() => setShowGuestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedGuest.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedGuest.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedGuest.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Nationality:</span>
                      <span className="text-sm text-gray-600">{selectedGuest.nationality}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">ID Number:</span>
                      <span className="text-sm text-gray-600">{selectedGuest.id_number}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Booking History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Total Bookings:</span>
                      <span className="text-sm text-gray-600">{selectedGuest.total_bookings}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Total Spent:</span>
                      <span className="text-sm text-gray-600">RWF {selectedGuest.total_spent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Last Visit: {new Date(selectedGuest.last_visit).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">VIP Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVipStatusColor(selectedGuest.vip_status)}`}>
                        {selectedGuest.vip_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedGuest.preferences && selectedGuest.preferences.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuest.preferences.map((preference, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {preference}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManagement;
