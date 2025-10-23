import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Filter, 
  Search,
  Plus,
  Eye,
  MessageSquare,
  ArrowUp,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const MaintenanceDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  
  // Form states
  const [completionNote, setCompletionNote] = useState('');
  const [escalationNote, setEscalationNote] = useState('');
  const [escalationTarget, setEscalationTarget] = useState('');
  const [requestNote, setRequestNote] = useState('');

  useEffect(() => {
    fetchMaintenanceRequests();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Refresh requests every 30 seconds
    const refreshInterval = setInterval(fetchMaintenanceRequests, 30000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, urgencyFilter, dateFilter, searchTerm]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch maintenance requests (technical issues)
      const response = await apiClient.get('/guest-requests');
      
      if (response.data && response.data.data) {
        const allRequests = response.data.data.requests || [];
        
        // Filter for maintenance-related requests
        const maintenanceRequests = allRequests.filter(request => 
          ['ac_repair', 'plumbing', 'electrical', 'tv_issue', 'wifi_issue', 'heating', 'cooling', 'maintenance', 'repair'].includes(request.request_type) ||
          request.description?.toLowerCase().includes('repair') ||
          request.description?.toLowerCase().includes('fix') ||
          request.description?.toLowerCase().includes('broken') ||
          request.description?.toLowerCase().includes('not working')
        );
        
        setRequests(maintenanceRequests);
      }
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
      setError('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Urgency filter (based on priority)
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === urgencyFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(request => 
            new Date(request.requested_time || request.created_at).toDateString() === today.toDateString()
          );
          break;
        case 'this_week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(request => 
            new Date(request.requested_time || request.created_at) >= weekAgo
          );
          break;
        case 'overdue':
          filtered = filtered.filter(request => {
            if (request.status === 'completed') return false;
            const requestDate = new Date(request.requested_time || request.created_at);
            const hoursSinceRequest = (today - requestDate) / (1000 * 60 * 60);
            return hoursSinceRequest > 24; // Overdue if more than 24 hours
          });
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.request_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.room_number?.toString().includes(searchTerm)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleAcceptRequest = async () => {
    try {
      const response = await apiClient.patch(`/guest-requests/${selectedRequest.request_id}/accept`);
      
      if (response.data.success) {
        toast.success('Request accepted successfully');
        setShowAcceptModal(false);
        setSelectedRequest(null);
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleCompleteRequest = async () => {
    try {
      const response = await apiClient.patch(`/guest-requests/${selectedRequest.request_id}/complete`, {
        notes: completionNote
      });
      
      if (response.data.success) {
        toast.success('Request completed successfully');
        setShowCompleteModal(false);
        setSelectedRequest(null);
        setCompletionNote('');
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error completing request:', error);
      toast.error('Failed to complete request');
    }
  };

  const handleAddNote = async () => {
    try {
      const response = await apiClient.patch(`/guest-requests/${selectedRequest.request_id}/update`, {
        staff_notes: requestNote
      });
      
      if (response.data.success) {
        toast.success('Note added successfully');
        setShowNoteModal(false);
        setSelectedRequest(null);
        setRequestNote('');
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleEscalateRequest = async () => {
    try {
      const response = await apiClient.patch(`/guest-requests/${selectedRequest.request_id}/update`, {
        status: 'escalated',
        escalated_to: escalationTarget,
        escalation_note: escalationNote
      });
      
      if (response.data.success) {
        toast.success('Request escalated successfully');
        setShowEscalateModal(false);
        setSelectedRequest(null);
        setEscalationNote('');
        setEscalationTarget('');
        fetchMaintenanceRequests();
      }
    } catch (error) {
      console.error('Error escalating request:', error);
      toast.error('Failed to escalate request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'ac_repair': return '❄️';
      case 'plumbing': return '🚿';
      case 'electrical': return '⚡';
      case 'tv_issue': return '📺';
      case 'wifi_issue': return '📶';
      case 'heating': return '🔥';
      case 'cooling': return '❄️';
      default: return '🔧';
    }
  };

  const canAcceptRequest = (request) => {
    return request.status === 'pending' && request.assigned_to === user?.hms_user_id;
  };

  const canCompleteRequest = (request) => {
    return request.status === 'in_progress' && request.assigned_to === user?.hms_user_id;
  };

  const canEscalateRequest = (request) => {
    return ['pending', 'in_progress'].includes(request.status);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchMaintenanceRequests}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
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
                <Wrench className="h-8 w-8 text-blue-600" />
                Maintenance Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage technical service requests and repairs
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Time</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
          </div>
        </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => 
                    r.status === 'completed' && 
                    new Date(r.completed_time).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
          </div>
        </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => {
                    if (r.status === 'completed') return false;
                    const hoursSinceRequest = (new Date() - new Date(r.requested_time || r.created_at)) / (1000 * 60 * 60);
                    return hoursSinceRequest > 24;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="escalated">Escalated</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="overdue">Overdue</option>
            </select>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Technical Service Requests ({filteredRequests.length})
            </h3>
      </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No maintenance requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getRequestTypeIcon(request.request_type)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.request_type?.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {request.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          {request.room_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.guest_name}</div>
                        <div className="text-sm text-gray-500">{request.guest_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.requested_time ? 
                          new Date(request.requested_time).toLocaleString() : 
                          'ASAP'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowAcceptModal(true);
                            }}
                            disabled={!canAcceptRequest(request)}
                            className={`px-3 py-1 rounded text-xs ${
                              canAcceptRequest(request) 
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowCompleteModal(true);
                            }}
                            disabled={!canCompleteRequest(request)}
                            className={`px-3 py-1 rounded text-xs ${
                              canCompleteRequest(request) 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowNoteModal(true);
                            }}
                            className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-xs"
                          >
                            Note
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowEscalateModal(true);
                            }}
                            disabled={!canEscalateRequest(request)}
                            className={`px-3 py-1 rounded text-xs ${
                              canEscalateRequest(request) 
                                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Escalate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Accept Request Modal */}
      {showAcceptModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Accept Request</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to accept this maintenance request?
            </p>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm font-medium">{selectedRequest.request_type?.replace('_', ' ').toUpperCase()}</p>
              <p className="text-sm text-gray-600">{selectedRequest.description}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Accept Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Request Modal */}
      {showCompleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Complete Request</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Notes
              </label>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe what was done to resolve the issue..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRequest}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Complete Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add a note about this request..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Request Modal */}
      {showEscalateModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Escalate Request</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escalate To
              </label>
              <select
                value={escalationTarget}
                onChange={(e) => setEscalationTarget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select escalation target</option>
                <option value="manager">Hotel Manager</option>
                <option value="vendor">Vendor</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escalation Reason
              </label>
              <textarea
                value={escalationNote}
                onChange={(e) => setEscalationNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Why is this request being escalated?"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateRequest}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Escalate Request
              </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default MaintenanceDashboard;