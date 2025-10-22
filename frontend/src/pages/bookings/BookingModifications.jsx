import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Plus, 
  Search, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Calendar,
  DollarSign,
  User,
  FileText
} from 'lucide-react';

export const BookingModifications = () => {
  const [modifications, setModifications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedModification, setSelectedModification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    booking_id: '',
    modification_type: '',
    requested_changes: '',
    reason: '',
    original_values: {},
    new_values: {},
    financial_impact: 0
  });

  const modificationTypes = [
    { value: 'date_change', label: 'Date Change' },
    { value: 'room_change', label: 'Room Change' },
    { value: 'guest_change', label: 'Guest Change' },
    { value: 'cancellation', label: 'Cancellation' },
    { value: 'upgrade', label: 'Upgrade' },
    { value: 'downgrade', label: 'Downgrade' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchModifications();
    fetchBookings();
  }, [filterType, filterStatus]);

  const fetchModifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hms_token');
      let url = 'http://localhost:3001/api/booking-modifications?';
      
      if (filterType) url += `modification_type=${filterType}&`;
      if (filterStatus) url += `status=${filterStatus}&`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setModifications(result.data);
      } else {
        console.error('Failed to fetch modifications:', result.message);
      }
    } catch (error) {
      console.error('Error fetching modifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/bookings?service_type=room,homestay', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setBookings(result.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch('http://localhost:3001/api/booking-modifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        fetchModifications();
        handleCloseModal();
      } else {
        alert(result.message || 'Failed to create modification request');
      }
    } catch (error) {
      console.error('Error creating modification:', error);
      alert('Error creating modification request');
    }
  };

  const handleApprove = async (modificationId) => {
    if (!confirm('Are you sure you want to approve this modification?')) return;

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`http://localhost:3001/api/booking-modifications/${modificationId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approval_notes: 'Approved' })
      });

      const result = await response.json();

      if (result.success) {
        fetchModifications();
        alert('Modification approved successfully');
      } else {
        alert(result.message || 'Failed to approve modification');
      }
    } catch (error) {
      console.error('Error approving modification:', error);
      alert('Error approving modification');
    }
  };

  const handleReject = async (modificationId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`http://localhost:3001/api/booking-modifications/${modificationId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: reason })
      });

      const result = await response.json();

      if (result.success) {
        fetchModifications();
        alert('Modification rejected');
      } else {
        alert(result.message || 'Failed to reject modification');
      }
    } catch (error) {
      console.error('Error rejecting modification:', error);
      alert('Error rejecting modification');
    }
  };

  const handleViewDetails = (modification) => {
    setSelectedModification(modification);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      booking_id: '',
      modification_type: '',
      requested_changes: '',
      reason: '',
      original_values: {},
      new_values: {},
      financial_impact: 0
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const typeObj = modificationTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const filteredModifications = modifications.filter(mod => {
    const searchLower = searchTerm.toLowerCase();
    return (
      mod.booking?.booking_reference?.toLowerCase().includes(searchLower) ||
      mod.booking?.guest_name?.toLowerCase().includes(searchLower) ||
      mod.modification_type?.toLowerCase().includes(searchLower) ||
      mod.requested_changes?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Modifications</h1>
          <p className="text-gray-600">Track and manage booking change requests</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchModifications}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Modification
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search modifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {modificationTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Modifications Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changes Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
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
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Loading modifications...</p>
                  </td>
                </tr>
              ) : filteredModifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Edit className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-500">No modifications found</p>
                  </td>
                </tr>
              ) : (
                filteredModifications.map((mod) => (
                  <tr key={mod.modification_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {mod.booking?.booking_reference || `#${mod.booking_id}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mod.booking?.guest_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeLabel(mod.modification_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {mod.requested_changes}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${mod.financial_impact > 0 ? 'text-green-600' : mod.financial_impact < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {mod.financial_impact > 0 ? '+' : ''}${parseFloat(mod.financial_impact || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(mod.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(mod.requested_at || mod.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(mod)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {mod.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(mod.modification_id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(mod.modification_id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Request Booking Modification
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Booking Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking *
                  </label>
                  <select
                    value={formData.booking_id}
                    onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a booking</option>
                    {bookings.map((booking) => (
                      <option key={booking.booking_id} value={booking.booking_id}>
                        {booking.booking_reference || `#${booking.booking_id}`} - {booking.guest_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modification Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modification Type *
                  </label>
                  <select
                    value={formData.modification_type}
                    onChange={(e) => setFormData({ ...formData, modification_type: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select type</option>
                    {modificationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Requested Changes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requested Changes *
                  </label>
                  <textarea
                    value={formData.requested_changes}
                    onChange={(e) => setFormData({ ...formData, requested_changes: e.target.value })}
                    required
                    rows="3"
                    placeholder="Describe the changes requested..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Reason */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows="2"
                    placeholder="Reason for modification..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Financial Impact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Financial Impact ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.financial_impact}
                    onChange={(e) => setFormData({ ...formData, financial_impact: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Positive for additional charges, negative for refunds</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedModification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Modification Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking Reference</label>
                  <p className="text-sm text-gray-900">{selectedModification.booking?.booking_reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Guest Name</label>
                  <p className="text-sm text-gray-900">{selectedModification.booking?.guest_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Modification Type</label>
                  <p className="text-sm text-gray-900">{getTypeLabel(selectedModification.modification_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedModification.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Requested Changes</label>
                <p className="text-sm text-gray-900 mt-1">{selectedModification.requested_changes}</p>
              </div>

              {selectedModification.reason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedModification.reason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Financial Impact</label>
                  <p className={`text-sm font-medium mt-1 ${selectedModification.financial_impact > 0 ? 'text-green-600' : selectedModification.financial_impact < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {selectedModification.financial_impact > 0 ? '+' : ''}${parseFloat(selectedModification.financial_impact || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedModification.requested_at || selectedModification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedModification.status === 'approved' && (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-green-800">
                    Approved on {new Date(selectedModification.approved_at).toLocaleString()}
                  </p>
                  {selectedModification.approval_notes && (
                    <p className="text-sm text-green-700 mt-1">{selectedModification.approval_notes}</p>
                  )}
                </div>
              )}

              {selectedModification.status === 'rejected' && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-red-800">
                    Rejected on {new Date(selectedModification.rejected_at).toLocaleString()}
                  </p>
                  {selectedModification.rejection_reason && (
                    <p className="text-sm text-red-700 mt-1">{selectedModification.rejection_reason}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedModification.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApprove(selectedModification.modification_id);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleReject(selectedModification.modification_id);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};