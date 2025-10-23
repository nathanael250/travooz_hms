import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Check,
  X,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [acceptNotes, setAcceptNotes] = useState('');
  const [completeData, setCompleteData] = useState({
    notes: '',
    rating: '',
    feedback: ''
  });

  useEffect(() => {
    fetchMyTasks();
  }, [statusFilter]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await apiClient.get(`/guest-requests/my-tasks${params}`);
      
      if (response.data.success) {
        setTasks(response.data.data.tasks);
        setStaff(response.data.data.staff);
      } else {
        toast.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await apiClient.patch(`/guest-requests/${selectedTask.request_id}/accept`, {
        notes: acceptNotes
      });

      if (response.data.success) {
        toast.success('Task accepted successfully');
        setShowAcceptModal(false);
        setAcceptNotes('');
        await fetchMyTasks();
      } else {
        toast.error(response.data.message || 'Failed to accept task');
      }
    } catch (error) {
      console.error('Error accepting task:', error);
      toast.error('Failed to accept task');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    try {
      const response = await apiClient.patch(`/guest-requests/${selectedTask.request_id}/complete`, {
        notes: completeData.notes,
        rating: completeData.rating ? parseInt(completeData.rating) : null,
        feedback: completeData.feedback
      });

      if (response.data.success) {
        toast.success('Task completed successfully');
        setShowCompleteModal(false);
        setCompleteData({ notes: '', rating: '', feedback: '' });
        await fetchMyTasks();
      } else {
        toast.error(response.data.message || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'acknowledged':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canAcceptTask = (task) => {
    return task.status === 'pending';
  };

  const canCompleteTask = (task) => {
    return task.status === 'in_progress';
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          My Tasks Dashboard
        </h1>
        {staff && (
          <p className="text-gray-600">
            Welcome, <span className="font-medium">{staff.name}</span> ({staff.role})
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          onClick={fetchMyTasks}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
          <p className="text-gray-500">You don't have any tasks assigned to you at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.request_id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.request_type.replace('_', ' ').toUpperCase()}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{task.status}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{task.guest_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{task.requested_time ? new Date(task.requested_time).toLocaleDateString() : 'Not specified'}</span>
                    </div>
                    {/* Show charges only for roles that should see financial information */}
                    {task.additional_charges > 0 && ['manager', 'vendor', 'admin', 'receptionist', 'accountant'].includes(user?.role?.toLowerCase()) && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>RWF {parseFloat(task.additional_charges).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Notes */}
              {task.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {task.notes}
                  </p>
                </div>
              )}

              {/* Staff Notes */}
              {task.staff_notes && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Staff Notes:</strong> {task.staff_notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {canAcceptTask(task) && (
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowAcceptModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Accept Task
                  </button>
                )}
                {canCompleteTask(task) && (
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowCompleteModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Task Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accept Task</h3>
            <p className="text-gray-600 mb-4">
              Are you ready to work on this task?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={acceptNotes}
                onChange={(e) => setAcceptNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any notes about accepting this task..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Accept Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Task Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes
                </label>
                <textarea
                  value={completeData.notes}
                  onChange={(e) => setCompleteData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what was done..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <select
                  value={completeData.rating}
                  onChange={(e) => setCompleteData(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={completeData.feedback}
                  onChange={(e) => setCompleteData(prev => ({ ...prev, feedback: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Any additional feedback..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteTask}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
