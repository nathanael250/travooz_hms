import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Mail,
  Lock
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ROLES = [
  { value: 'manager', label: 'Manager' },
  { value: 'receptionist', label: 'Front Desk / Receptionist' },
  { value: 'housekeeping', label: 'Housekeeping Staff' },
  { value: 'accountant', label: 'Accountant / Finance Officer' },
  { value: 'restaurant', label: 'Restaurant Staff' },
  { value: 'maintenance', label: 'Maintenance Staff' },
  { value: 'inventory', label: 'Inventory Staff' }
];

const STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800' }
];

export const HMSUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'receptionist',
    status: 'active'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordModal, setPasswordModal] = useState({ open: false, userId: null, newPassword: '', showPass: false });
  const [homestays, setHomestays] = useState([]);
  const [selectedHomestayId, setSelectedHomestayId] = useState(localStorage.getItem('selected_homestay_id') || '');

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchHomestays();
  }, []);

  useEffect(() => {
    // Update localStorage when hotel is selected
    if (selectedHomestayId) {
      localStorage.setItem('selected_homestay_id', selectedHomestayId);
      setCurrentPage(0);
      fetchHMSUsers();
    }
  }, [selectedHomestayId]);

  useEffect(() => {
    if (selectedHomestayId) {
      fetchHMSUsers();
    }
  }, [searchTerm, roleFilter, statusFilter, currentPage]);

  const fetchHomestays = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/homestays?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch homestays');
      }

      const data = await response.json();
      setHomestays(data.homestays || []);
      
      // If no hotel is currently selected, select the first one
      if (!selectedHomestayId && data.homestays && data.homestays.length > 0) {
        const firstHomestayId = String(data.homestays[0].homestay_id);
        setSelectedHomestayId(firstHomestayId);
        localStorage.setItem('selected_homestay_id', firstHomestayId);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
      toast.error('Failed to load hotels');
    }
  };

  const fetchHMSUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hms_token');

      if (!token) {
        console.warn('No token found in localStorage');
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      if (!selectedHomestayId) {
        console.warn('No hotel selected');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        assigned_hotel_id: selectedHomestayId,
        limit: ITEMS_PER_PAGE,
        offset: currentPage * ITEMS_PER_PAGE
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${API_BASE_URL}/api/hms-users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch HMS users');
      }

      const data = await response.json();
      setUsers(data.data || []);
      setTotalPages(Math.ceil(data.pagination.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching HMS users:', error);
      toast.error('Failed to load HMS users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: '',
        role: user.role,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'receptionist',
        status: 'active'
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'receptionist',
      status: 'active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      const token = localStorage.getItem('hms_token');

      // Debug logging
      console.log('=== HMS USER FORM SUBMISSION ===');
      console.log('Token:', token ? 'Present' : 'MISSING');
      if (token) {
        const parts = token.split('.');
        console.log('Token parts:', parts.length, '(should be 3)');
        console.log('Token preview:', `${token.substring(0, 30)}...`);
      }
      console.log('Homestay ID:', selectedHomestayId);
      console.log('=====================================');

      if (!token) {
        console.error('Token is null/undefined in localStorage');
        toast.error('❌ Authentication token not found. Please log in again.');
        return;
      }

      if (!selectedHomestayId) {
        console.error('Hotel ID not selected');
        toast.error('❌ Hotel not selected. Please select a hotel first.');
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        role: formData.role,
        status: formData.status,
        assigned_hotel_id: parseInt(selectedHomestayId)
      };

      if (!editingUser) {
        payload.password = formData.password;
      }

      const url = editingUser 
        ? `${API_BASE_URL}/api/hms-users/${editingUser.hms_user_id}`
        : `${API_BASE_URL}/api/hms-users`;

      const method = editingUser ? 'PUT' : 'POST';

      console.log('Request URL:', url);
      console.log('Request method:', method);
      console.log('Request payload:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingUser ? 'update' : 'create'} HMS user`);
      }

      toast.success(`HMS user ${editingUser ? 'updated' : 'created'} successfully`);
      handleCloseModal();
      fetchHMSUsers();
    } catch (error) {
      console.error('Error saving HMS user:', error);
      toast.error(error.message || 'Failed to save HMS user');
    }
  };

  const handleDelete = async (hmsUserId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/hms-users/${hmsUserId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete HMS user');
      }

      toast.success('HMS user deleted successfully');
      fetchHMSUsers();
    } catch (error) {
      console.error('Error deleting HMS user:', error);
      toast.error('Failed to delete HMS user');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordModal.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (passwordModal.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/hms-users/${passwordModal.userId}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: passwordModal.newPassword })
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      toast.success('Password changed successfully');
      setPasswordModal({ open: false, userId: null, newPassword: '', showPass: false });
      fetchHMSUsers();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const getRoleLabel = (role) => {
    return ROLES.find(r => r.value === role)?.label || role;
  };

  const getStatusColor = (status) => {
    return STATUSES.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              HMS User Management
            </h1>
          </div>
          <p className="text-gray-600">Manage hotel staff members and their roles</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Hotel Filter */}
            <select
              value={selectedHomestayId}
              onChange={(e) => setSelectedHomestayId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium bg-blue-50"
            >
              <option value="">-- Select Hotel --</option>
              {homestays.map(homestay => (
                <option key={homestay.homestay_id} value={String(homestay.homestay_id)}>
                  {homestay.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Add Button */}
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-600">No HMS users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.hms_user_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setPasswordModal({ open: true, userId: user.hms_user_id, newPassword: '', showPass: false })}
                          className="inline-flex items-center px-2 py-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100"
                          title="Change Password"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="inline-flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.hms_user_id)}
                          className="inline-flex items-center px-2 py-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 rounded-md text-sm font-medium ${
                      currentPage === i
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingUser ? 'Edit HMS User' : 'Add New HMS User'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={editingUser}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="user@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Password - Only for create */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Enter password (min. 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status - Only for editing */}
                {editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {passwordModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={passwordModal.showPass ? 'text' : 'password'}
                      value={passwordModal.newPassword}
                      onChange={(e) => setPasswordModal(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Enter new password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordModal(prev => ({ ...prev, showPass: !prev.showPass }))}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {passwordModal.showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPasswordModal({ open: false, userId: null, newPassword: '', showPass: false })}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                  >
                    Change Password
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