import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Eye
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const GuestRequests = () => {
  const [requests, setRequests] = useState([]);
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    booking_id: '',
    guest_id: '',
    request_type: 'room_service',
    description: '',
    priority: 'normal',
    status: 'pending',
    assigned_to: '',
    scheduled_time: '',
    notes: ''
  });

  const requestTypes = [
    { value: 'room_service', label: 'Room Service' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'amenity', label: 'Amenity' },
    { value: 'wake_up_call', label: 'Wake-up Call' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'concierge', label: 'Concierge' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'normal', label: 'Normal', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'acknowledged', label: 'Acknowledged', color: 'blue' },
    { value: 'in_progress', label: 'In Progress', color: 'indigo' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  useEffect(() => {
    fetchRequests();
    fetchStatistics();
    fetchGuests();
    fetchBookings();
    fetchStaff();
  }, [filterStatus, filterType, filterPriority]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();

      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('request_type', filterType);
      if (filterPriority) params.append('priority', filterPriority);

      const response = await fetch(`${API_URL}/guest-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/guest-requests/summary/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/guest-profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      setGuests([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/bookings?status=confirmed,checked_in`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('hms_token');
      const url = editingRequest
        ? `${API_URL}/guest-requests/${editingRequest.request_id}`
        : `${API_URL}/guest-requests`;

      const method = editingRequest ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchRequests();
        fetchStatistics();
        handleCloseModal();
        alert(editingRequest ? 'Request updated successfully!' : 'Request created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save request');
      }
    } catch (error) {
      console.error('Error saving request:', error);
      alert('Error saving request');
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setFormData({
      booking_id: request.booking_id,
      guest_id: request.guest_id || '',
      request_type: request.request_type,
      description: request.description,
      priority: request.priority,
      status: request.status,
      assigned_to: request.assigned_to || '',
      scheduled_time: request.scheduled_time ? new Date(request.scheduled_time).toISOString().slice(0, 16) : '',
      notes: request.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_URL}/guest-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchRequests();
        fetchStatistics();
        alert('Request deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Error deleting request');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRequest(null);
    setFormData({
      booking_id: '',
      guest_id: '',
      request_type: 'room_service',
      description: '',
      priority: 'normal',
      status: 'pending',
      assigned_to: '',
      scheduled_time: '',
      notes: ''
    });
  };

  const getPriorityBadge = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    if (!priorityObj) return null;

    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 ${colorClasses[priorityObj.color]} rounded-full text-xs font-medium`}>
        {priorityObj.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    if (!statusObj) return null;

    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 ${colorClasses[statusObj.color]} rounded-full text-xs font-medium`}>
        {statusObj.label}
      </span>
    );
  };

  const resetFilters = () => {
    setFilterStatus('');
    setFilterType('');
    setFilterPriority('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading guest requests...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Guest Requests</h1>
        <p className="text-gray-600">Track and manage guest service requests</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.pendingRequests}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-indigo-600">{statistics.inProgressRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statistics.completedRequests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{statistics.urgentRequests}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {requestTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{request.request_id}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {request.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(request.requested_time).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.guest ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.guest.first_name} {request.guest.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{request.guest.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {requestTypes.find(t => t.value === request.request_type)?.label || request.request_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(request.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.assignedStaff ? (
                        <span className="text-sm text-gray-900">{request.assignedStaff.name}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(request)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(request.request_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingRequest ? 'Edit Request' : 'New Guest Request'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Booking <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.booking_id}
                      onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    >
                      <option value="">Select Booking</option>
                      {Array.isArray(bookings) && bookings.map((booking) => (
                        <option key={booking.booking_id} value={booking.booking_id}>
                          {booking.booking_reference} - {booking.guest_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.request_type}
                      onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                    >
                      {requestTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the request..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To Staff
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {Array.isArray(staff) && staff.map((member) => (
                        <option key={member.hms_user_id} value={member.hms_user_id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingRequest ? 'Update Request' : 'Create Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestRequests;