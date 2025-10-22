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
  Eye,
  AlertTriangle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const GuestComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    booking_id: '',
    guest_id: '',
    complaint_type: 'room_condition',
    description: '',
    severity: 'moderate',
    status: 'reported',
    resolved_by: '',
    resolution_notes: '',
    compensation_offered: '',
    resolved_at: ''
  });

  const complaintTypes = [
    { value: 'room_condition', label: 'Room Condition' },
    { value: 'service', label: 'Service' },
    { value: 'noise', label: 'Noise' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'staff_behavior', label: 'Staff Behavior' },
    { value: 'amenities', label: 'Amenities' },
    { value: 'billing', label: 'Billing' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'minor', label: 'Minor' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'serious', label: 'Serious' },
    { value: 'critical', label: 'Critical' }
  ];

  const statusOptions = [
    { value: 'reported', label: 'Reported' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'escalated', label: 'Escalated' },
    { value: 'closed', label: 'Closed' }
  ];

  useEffect(() => {
    fetchComplaints();
    fetchGuests();
    fetchBookings();
    fetchStaff();
    fetchStatistics();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-complaints`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users?role=staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-complaints/summary/statistics`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingComplaint
        ? `${API_URL}/guest-complaints/${editingComplaint.complaint_id}`
        : `${API_URL}/guest-complaints`;
      
      const method = editingComplaint ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchComplaints();
        fetchStatistics();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving complaint:', error);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-complaints/${complaintId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchComplaints();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
    }
  };

  const handleEdit = (complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      booking_id: complaint.booking_id || '',
      guest_id: complaint.guest_id || '',
      complaint_type: complaint.complaint_type || 'room_condition',
      description: complaint.description || '',
      severity: complaint.severity || 'moderate',
      status: complaint.status || 'reported',
      resolved_by: complaint.resolved_by || '',
      resolution_notes: complaint.resolution_notes || '',
      compensation_offered: complaint.compensation_offered || '',
      resolved_at: complaint.resolved_at ? complaint.resolved_at.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleView = (complaint) => {
    setViewingComplaint(complaint);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingComplaint(null);
    setFormData({
      booking_id: '',
      guest_id: '',
      complaint_type: 'room_condition',
      description: '',
      severity: 'moderate',
      status: 'reported',
      resolved_by: '',
      resolution_notes: '',
      compensation_offered: '',
      resolved_at: ''
    });
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setViewingComplaint(null);
  };

  const getSeverityBadgeColor = (severity) => {
    const colors = {
      minor: 'bg-gray-100 text-gray-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      serious: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      reported: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      escalated: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.guest?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || complaint.status === filterStatus;
    const matchesSeverity = !filterSeverity || complaint.severity === filterSeverity;
    const matchesType = !filterType || complaint.complaint_type === filterType;
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Guest Complaints</h1>
        <p className="text-gray-600">Log and resolve guest complaints</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold">{statistics.total || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reported</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.reported || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Investigating</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.investigating || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{statistics.resolved || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{statistics.critical || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severity</option>
            {severityLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {complaintTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Log Complaint
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.complaint_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {complaint.guest?.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {complaint.guest?.phone || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {complaintTypes.find(t => t.value === complaint.complaint_type)?.label || complaint.complaint_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {complaint.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityBadgeColor(complaint.severity)}`}>
                        {complaint.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(complaint)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(complaint)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(complaint.complaint_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingComplaint ? 'Edit Complaint' : 'Log New Complaint'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest *
                  </label>
                  <select
                    value={formData.guest_id}
                    onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Guest</option>
                    {Array.isArray(guests) && guests.map(guest => (
                      <option key={guest.guest_id} value={guest.guest_id}>
                        {guest.full_name} - {guest.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking (Optional)
                  </label>
                  <select
                    value={formData.booking_id}
                    onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Booking</option>
                    {Array.isArray(bookings) && bookings.map(booking => (
                      <option key={booking.booking_id} value={booking.booking_id}>
                        Booking #{booking.booking_id} - {booking.homestay?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint Type *
                  </label>
                  <select
                    value={formData.complaint_type}
                    onChange={(e) => setFormData({ ...formData, complaint_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {complaintTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <select
                    value={formData.resolved_by}
                    onChange={(e) => setFormData({ ...formData, resolved_by: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Staff</option>
                    {Array.isArray(staff) && staff.map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.full_name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Notes
                  </label>
                  <textarea
                    value={formData.resolution_notes}
                    onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compensation Offered
                  </label>
                  <input
                    type="text"
                    value={formData.compensation_offered}
                    onChange={(e) => setFormData({ ...formData, compensation_offered: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Free night, Discount, Upgrade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolved Date
                  </label>
                  <input
                    type="date"
                    value={formData.resolved_at}
                    onChange={(e) => setFormData({ ...formData, resolved_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingComplaint ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && viewingComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Complaint Details</h2>
              <button onClick={handleCloseDetailsModal} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Guest</p>
                  <p className="font-medium">{viewingComplaint.guest?.full_name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{viewingComplaint.guest?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking</p>
                  <p className="font-medium">
                    {viewingComplaint.booking ? `#${viewingComplaint.booking_id}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">
                    {complaintTypes.find(t => t.value === viewingComplaint.complaint_type)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityBadgeColor(viewingComplaint.severity)}`}>
                    {viewingComplaint.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(viewingComplaint.status)}`}>
                    {viewingComplaint.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reported Date</p>
                  <p className="font-medium">
                    {new Date(viewingComplaint.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="font-medium bg-gray-50 p-3 rounded">{viewingComplaint.description}</p>
              </div>
              {viewingComplaint.resolution_notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resolution Notes</p>
                  <p className="font-medium bg-green-50 p-3 rounded">{viewingComplaint.resolution_notes}</p>
                </div>
              )}
              {viewingComplaint.compensation_offered && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Compensation Offered</p>
                  <p className="font-medium bg-blue-50 p-3 rounded">{viewingComplaint.compensation_offered}</p>
                </div>
              )}
              {viewingComplaint.resolved_by && (
                <div>
                  <p className="text-sm text-gray-600">Resolved By</p>
                  <p className="font-medium">{viewingComplaint.resolver?.full_name || `User #${viewingComplaint.resolved_by}`}</p>
                </div>
              )}
              {viewingComplaint.resolved_at && (
                <div>
                  <p className="text-sm text-gray-600">Resolved Date</p>
                  <p className="font-medium">
                    {new Date(viewingComplaint.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestComplaints;