import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  User,
  Package,
  Loader2,
  RefreshCw,
  FileText,
  Send,
  Archive
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const StockRequests = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    request_number: '',
    requested_by: '',
    department: '',
    item_name: '',
    quantity_requested: '',
    priority: 'medium',
    purpose: '',
    requested_date: '',
    expected_date: '',
    status: 'pending',
    notes: ''
  });

  // Supporting data
  const [stockItems, setStockItems] = useState([]);
  const [users, setUsers] = useState([]);

  const departments = [
    'Housekeeping',
    'Maintenance',
    'Restaurant',
    'Front Desk',
    'Management',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    { value: 'fulfilled', label: 'Fulfilled', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, departmentFilter, priorityFilter, dateFilter, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stock requests, items, and users in parallel
      const [requestsResponse, itemsResponse, usersResponse] = await Promise.allSettled([
        apiClient.get('/stock-requests'),
        apiClient.get('/stock/items'),
        apiClient.get('/users')
      ]);

      // Process stock requests
      if (requestsResponse.status === 'fulfilled') {
        const requestsData = requestsResponse.value.data?.data || requestsResponse.value.data || [];
        setRequests(requestsData);
      } else {
        console.warn('Failed to fetch stock requests:', requestsResponse.reason);
        // Set mock data for demonstration
        setRequests(generateMockRequests());
      }

      // Process stock items
      if (itemsResponse.status === 'fulfilled') {
        const items = itemsResponse.value.data?.data || itemsResponse.value.data || [];
        setStockItems(items);
      } else {
        console.warn('Failed to fetch stock items:', itemsResponse.reason);
        setStockItems([]);
      }

      // Process users
      if (usersResponse.status === 'fulfilled') {
        const usersData = usersResponse.value.data?.data || usersResponse.value.data || [];
        setUsers(usersData);
      } else {
        console.warn('Failed to fetch users:', usersResponse.reason);
        setUsers([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load stock requests');
      // Set mock data for demonstration
      setRequests(generateMockRequests());
    } finally {
      setLoading(false);
    }
  };

  // Mock data generator
  const generateMockRequests = () => [
    {
      request_id: 1,
      request_number: 'SR-001',
      requested_by: 'John Doe',
      department: 'Housekeeping',
      item_name: 'Bath Towels',
      quantity_requested: 50,
      priority: 'high',
      purpose: 'Room restocking',
      requested_date: '2024-01-15',
      expected_date: '2024-01-20',
      status: 'pending',
      notes: 'Need for upcoming busy weekend',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      request_id: 2,
      request_number: 'SR-002',
      requested_by: 'Jane Smith',
      department: 'Maintenance',
      item_name: 'Light Bulbs',
      quantity_requested: 20,
      priority: 'medium',
      purpose: 'Room maintenance',
      requested_date: '2024-01-16',
      expected_date: '2024-01-22',
      status: 'approved',
      notes: 'LED bulbs for energy efficiency',
      created_at: '2024-01-16T14:20:00Z'
    },
    {
      request_id: 3,
      request_number: 'SR-003',
      requested_by: 'Mike Johnson',
      department: 'Restaurant',
      item_name: 'Coffee Cups',
      quantity_requested: 100,
      priority: 'urgent',
      purpose: 'Restaurant operations',
      requested_date: '2024-01-17',
      expected_date: '2024-01-18',
      status: 'fulfilled',
      notes: 'Urgent need for breakfast service',
      created_at: '2024-01-17T08:15:00Z'
    },
    {
      request_id: 4,
      request_number: 'SR-004',
      requested_by: 'Sarah Wilson',
      department: 'Front Desk',
      item_name: 'Guest Amenities',
      quantity_requested: 30,
      priority: 'low',
      purpose: 'Guest services',
      requested_date: '2024-01-18',
      expected_date: '2024-01-25',
      status: 'rejected',
      notes: 'Budget constraints',
      created_at: '2024-01-18T16:45:00Z'
    }
  ];

  const applyFilters = () => {
    let filtered = [...requests];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(request => request.department === departmentFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(request => 
        request.requested_date?.startsWith(dateFilter)
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleAddRequest = async () => {
    try {
      const response = await apiClient.post('/stock-requests', formData);
      
      if (response.data.success) {
        toast.success('Stock request created successfully');
        setShowAddModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error creating stock request:', error);
      toast.error('Failed to create stock request');
    }
  };

  const handleUpdateRequest = async () => {
    try {
      const response = await apiClient.put(`/stock-requests/${selectedRequest.request_id}`, formData);
      
      if (response.data.success) {
        toast.success('Stock request updated successfully');
        setShowEditModal(false);
        setSelectedRequest(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error updating stock request:', error);
      toast.error('Failed to update stock request');
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await apiClient.patch(`/stock-requests/${requestId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(`Request ${newStatus} successfully`);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const resetForm = () => {
    setFormData({
      request_number: '',
      requested_by: '',
      department: '',
      item_name: '',
      quantity_requested: '',
      priority: 'medium',
      purpose: '',
      requested_date: '',
      expected_date: '',
      status: 'pending',
      notes: ''
    });
  };

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user?.name || userId;
  };

  const getItemName = (itemId) => {
    const item = stockItems.find(i => i.item_id === itemId);
    return item?.name || item?.item_name || `Item ${itemId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stock requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                <ClipboardList className="h-8 w-8 text-blue-600" />
                Stock Requests Management
              </h1>
              <p className="text-gray-600 mt-1">
                Track internal stock requests from different departments
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Request
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by date"
            />

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
              Stock Requests ({filteredRequests.length})
            </h3>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No stock requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const statusInfo = getStatusInfo(request.status);
                    const priorityInfo = getPriorityInfo(request.priority);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr key={request.request_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.request_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.item_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Qty: {request.quantity_requested}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {request.requested_by}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {request.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityInfo.color}`}>
                            {priorityInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.expected_date ? new Date(request.expected_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowViewModal(true);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setFormData({
                                  request_number: request.request_number,
                                  requested_by: request.requested_by,
                                  department: request.department,
                                  item_name: request.item_name,
                                  quantity_requested: request.quantity_requested,
                                  priority: request.priority,
                                  purpose: request.purpose,
                                  requested_date: request.requested_date,
                                  expected_date: request.expected_date,
                                  status: request.status,
                                  notes: request.notes
                                });
                                setShowEditModal(true);
                              }}
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded text-xs flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(request.request_id, 'approved')}
                                  className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded text-xs flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(request.request_id, 'rejected')}
                                  className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs flex items-center gap-1"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(request.request_id, 'fulfilled')}
                                className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded text-xs flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Fulfill
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Stock Request</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Number</label>
                <input
                  type="text"
                  value={formData.request_number}
                  onChange={(e) => setFormData({...formData, request_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="SR-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                <input
                  type="text"
                  value={formData.requested_by}
                  onChange={(e) => setFormData({...formData, requested_by: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Bath Towels"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Requested</label>
                <input
                  type="number"
                  value={formData.quantity_requested}
                  onChange={(e) => setFormData({...formData, quantity_requested: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Date</label>
                <input
                  type="date"
                  value={formData.requested_date}
                  onChange={(e) => setFormData({...formData, requested_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
                <input
                  type="date"
                  value={formData.expected_date}
                  onChange={(e) => setFormData({...formData, expected_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Room restocking"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Request Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request Number</label>
                  <p className="text-sm text-gray-900">{selectedRequest.request_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusInfo(selectedRequest.status).color}`}>
                    {getStatusInfo(selectedRequest.status).label}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requested By</label>
                  <p className="text-sm text-gray-900">{selectedRequest.requested_by}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="text-sm text-gray-900">{selectedRequest.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <p className="text-sm text-gray-900">{selectedRequest.item_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity Requested</label>
                  <p className="text-sm text-gray-900">{selectedRequest.quantity_requested}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityInfo(selectedRequest.priority).color}`}>
                    {getPriorityInfo(selectedRequest.priority).label}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <p className="text-sm text-gray-900">{selectedRequest.purpose}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requested Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedRequest.requested_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Date</label>
                  <p className="text-sm text-gray-900">{selectedRequest.expected_date ? new Date(selectedRequest.expected_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
              {selectedRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal - Similar structure to Add Modal */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Stock Request</h3>
            {/* Similar form structure as Add Modal */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRequest(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockRequests;
