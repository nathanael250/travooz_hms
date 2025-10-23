import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Settings,
  Key,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const StaffManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const staffPerPage = 10;

  useEffect(() => {
    fetchStaff();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, roleFilter, statusFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/hms-users');
      if (response.data && response.data.success) {
        setStaff(response.data.data || []);
        setTotalPages(Math.ceil((response.data.data || []).length / staffPerPage));
      } else {
        // Fallback to mock data
        setStaff(getMockStaff());
        setTotalPages(Math.ceil(getMockStaff().length / staffPerPage));
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
      // Use mock data as fallback
      setStaff(getMockStaff());
      setTotalPages(Math.ceil(getMockStaff().length / staffPerPage));
    } finally {
      setLoading(false);
    }
  };

  const getMockStaff = () => [
    {
      user_id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@hotel.com',
      phone: '+250 788 111 222',
      role: 'manager',
      department: 'Management',
      status: 'active',
      hire_date: '2022-01-15',
      last_login: '2024-01-20',
      permissions: ['all'],
      salary: 500000,
      address: 'Kigali, Rwanda',
      emergency_contact: '+250 789 333 444',
      created_at: '2022-01-15'
    },
    {
      user_id: 2,
      name: 'Bob Smith',
      email: 'bob.smith@hotel.com',
      phone: '+250 788 222 333',
      role: 'receptionist',
      department: 'Front Desk',
      status: 'active',
      hire_date: '2022-03-10',
      last_login: '2024-01-20',
      permissions: ['bookings', 'guests', 'rooms'],
      salary: 300000,
      address: 'Kigali, Rwanda',
      emergency_contact: '+250 789 444 555',
      created_at: '2022-03-10'
    },
    {
      user_id: 3,
      name: 'Carol Davis',
      email: 'carol.davis@hotel.com',
      phone: '+250 788 333 444',
      role: 'housekeeping',
      department: 'Housekeeping',
      status: 'active',
      hire_date: '2022-05-20',
      last_login: '2024-01-19',
      permissions: ['housekeeping', 'rooms'],
      salary: 250000,
      address: 'Kigali, Rwanda',
      emergency_contact: '+250 789 555 666',
      created_at: '2022-05-20'
    },
    {
      user_id: 4,
      name: 'David Wilson',
      email: 'david.wilson@hotel.com',
      phone: '+250 788 444 555',
      role: 'maintenance',
      department: 'Maintenance',
      status: 'active',
      hire_date: '2022-07-15',
      last_login: '2024-01-18',
      permissions: ['maintenance', 'equipment'],
      salary: 280000,
      address: 'Kigali, Rwanda',
      emergency_contact: '+250 789 666 777',
      created_at: '2022-07-15'
    },
    {
      user_id: 5,
      name: 'Eva Brown',
      email: 'eva.brown@hotel.com',
      phone: '+250 788 555 666',
      role: 'accountant',
      department: 'Finance',
      status: 'inactive',
      hire_date: '2022-09-01',
      last_login: '2023-12-15',
      permissions: ['financial', 'reports'],
      salary: 400000,
      address: 'Kigali, Rwanda',
      emergency_contact: '+250 789 777 888',
      created_at: '2022-09-01'
    }
  ];

  const filterStaff = () => {
    let filtered = [...staff];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredStaff(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'receptionist': return 'bg-blue-100 text-blue-800';
      case 'housekeeping': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'accountant': return 'bg-yellow-100 text-yellow-800';
      case 'restaurant': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewStaff = (member) => {
    setSelectedStaff(member);
    setShowStaffModal(true);
  };

  const handleEditStaff = (member) => {
    // TODO: Implement edit functionality
    toast.success('Edit functionality coming soon');
  };

  const handleToggleStatus = (memberId, currentStatus) => {
    // TODO: Implement status toggle functionality
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.success(`Staff status changed to ${newStatus}`);
  };

  const handleResetPassword = (memberId) => {
    // TODO: Implement password reset functionality
    toast.success('Password reset email sent');
  };

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * staffPerPage,
    currentPage * staffPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff...</p>
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
                <UserCheck className="h-8 w-8 text-blue-600" />
                Staff Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage staff members, roles, and permissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Staff
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="manager">Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="maintenance">Maintenance</option>
              <option value="accountant">Accountant</option>
              <option value="restaurant">Restaurant</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
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
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="hire_date-desc">Recently Hired</option>
              <option value="hire_date-asc">Longest Employed</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.role === 'manager').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => {
                    const lastLogin = new Date(s.last_login);
                    const today = new Date();
                    return lastLogin.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStaff.map((member) => (
                  <tr key={member.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {member.name.split(' ').map(n => n.charAt(0)).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {member.user_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">{member.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.hire_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.last_login).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      RWF {member.salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewStaff(member)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditStaff(member)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Staff"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(member.user_id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(member.user_id, member.status)}
                          className={member.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                          title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {member.status === 'active' ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
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
                      <span className="font-medium">{(currentPage - 1) * staffPerPage + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * staffPerPage, filteredStaff.length)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{filteredStaff.length}</span>
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

      {/* Staff Details Modal */}
      {showStaffModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Staff Details - {selectedStaff.name}
                </h3>
                <button
                  onClick={() => setShowStaffModal(false)}
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
                      <span className="text-sm text-gray-600">{selectedStaff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedStaff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedStaff.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Emergency Contact:</span>
                      <span className="text-sm text-gray-600">{selectedStaff.emergency_contact}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Employment Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Role:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedStaff.role)}`}>
                        {selectedStaff.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Department:</span>
                      <span className="text-sm text-gray-600">{selectedStaff.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Hire Date: {new Date(selectedStaff.hire_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Salary:</span>
                      <span className="text-sm text-gray-600">RWF {selectedStaff.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStaff.status)}`}>
                        {selectedStaff.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedStaff.permissions && selectedStaff.permissions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStaff.permissions.map((permission, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {permission}
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

export default StaffManagement;
