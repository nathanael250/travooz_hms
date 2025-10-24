import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Filter, 
  Search,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const MaintenanceMyTasks = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  
  // Form states
  const [completionNote, setCompletionNote] = useState('');
  const [taskNote, setTaskNote] = useState('');

  useEffect(() => {
    fetchMyTasks();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Refresh tasks every 30 seconds
    const refreshInterval = setInterval(fetchMyTasks, 30000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, statusFilter, priorityFilter, searchTerm]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch maintenance requests assigned to current user
      const response = await apiClient.get('/maintenance/requests', {
        params: {
          assigned_to: user?.hms_user_id || user?.user_id
        }
      });
      
      let maintenanceTasks = [];
      if (response.data && response.data.success) {
        maintenanceTasks = response.data.data?.requests || response.data.requests || [];
      } else {
        // Fallback: try to fetch from guest-requests and filter
        const fallbackResponse = await apiClient.get('/guest-requests');
        if (fallbackResponse.data && fallbackResponse.data.data) {
          const allRequests = fallbackResponse.data.data.requests || [];
          
          // Filter for maintenance-related requests assigned to current user
          maintenanceTasks = allRequests.filter(request => 
            (request.assigned_to === user?.hms_user_id || request.assigned_to === user?.user_id) &&
            (['ac_repair', 'plumbing', 'electrical', 'tv_issue', 'wifi_issue', 'heating', 'cooling', 'maintenance', 'repair'].includes(request.request_type) ||
            request.description?.toLowerCase().includes('repair') ||
            request.description?.toLowerCase().includes('fix') ||
            request.description?.toLowerCase().includes('broken') ||
            request.description?.toLowerCase().includes('not working'))
          );
        }
      }

      setTasks(maintenanceTasks);
    } catch (err) {
      console.error('Error fetching my tasks:', err);
      setError('Failed to load my tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.request_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.room?.unit_number || task.room_number)?.toString().includes(searchTerm)
      );
    }

    setFilteredTasks(filtered);
  };

  const handleCompleteTask = async () => {
    try {
      const response = await apiClient.patch(`/maintenance/requests/${selectedTask.request_id}`, {
        status: 'completed',
        completion_notes: completionNote
      });
      
      if (response.data.success) {
        toast.success('Task completed successfully');
        setShowCompleteModal(false);
        setSelectedTask(null);
        setCompletionNote('');
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleAddNote = async () => {
    try {
      const response = await apiClient.patch(`/maintenance/requests/${selectedTask.request_id}`, {
        notes: taskNote
      });
      
      if (response.data.success) {
        toast.success('Note added successfully');
        setShowNoteModal(false);
        setSelectedTask(null);
        setTaskNote('');
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'plumbing': return '🚿';
      case 'electrical': return '⚡';
      case 'hvac': return '❄️';
      case 'furniture': return '🪑';
      case 'appliance': return '🔌';
      case 'structural': return '🏗️';
      case 'safety': return '⚠️';
      case 'other': return '🔧';
      // Legacy guest request types
      case 'ac_repair': return '❄️';
      case 'tv_issue': return '📺';
      case 'wifi_issue': return '📶';
      case 'heating': return '🔥';
      case 'cooling': return '❄️';
      default: return '🔧';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading my tasks...</p>
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
            onClick={fetchMyTasks}
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
                <CheckCircle className="h-8 w-8 text-green-600" />
                My Maintenance Tasks
              </h1>
              <p className="text-gray-600 mt-1">
                Tasks assigned to you for maintenance and repairs
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
                  {tasks.filter(t => t.status === 'pending').length}
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
                  {tasks.filter(t => t.status === 'in_progress').length}
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'completed').length}
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
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
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
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="on_hold">On Hold</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              My Tasks ({filteredTasks.length})
            </h3>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks assigned to you</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getRequestTypeIcon(task.category || task.request_type)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {task.title || task.request_type?.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {task.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          {task.room?.unit_number || task.room_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTimeAgo(task.reported_date || task.requested_time || task.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowDetailsModal(true);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowCompleteModal(true);
                            }}
                            disabled={task.status === 'completed'}
                            className={`px-3 py-1 rounded text-xs ${
                              task.status === 'completed' 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowNoteModal(true);
                            }}
                            className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-xs"
                          >
                            Note
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

      {/* Task Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Task Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm text-gray-900">{selectedTask.title || selectedTask.request_type?.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room</label>
                  <p className="text-sm text-gray-900">{selectedTask.room?.unit_number || selectedTask.room_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority?.toUpperCase() || 'MEDIUM'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{selectedTask.description}</p>
              </div>
              {selectedTask.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900">{selectedTask.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Task Modal */}
      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Complete Task</h3>
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
                onClick={handleCompleteTask}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Complete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={taskNote}
                onChange={(e) => setTaskNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add a note about this task..."
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
    </div>
  );
};

export default MaintenanceMyTasks;
