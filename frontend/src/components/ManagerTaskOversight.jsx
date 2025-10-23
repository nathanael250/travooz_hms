import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Eye,
  BarChart3
} from 'lucide-react';
import apiClient from '../services/apiClient';

/**
 * MANAGER TASK OVERSIGHT
 * Allows managers/supervisors to:
 * - View all guest requests across departments
 * - Filter by status, department, staff member
 * - Reassign tasks to different staff
 * - Cancel tasks if needed
 * - View task analytics
 */

const ManagerTaskOversight = () => {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    requestType: 'all',
    assignedTo: 'all'
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    acknowledged: 0,
    inProgress: 0,
    completed: 0,
    avgCompletionTime: '0h',
    completionRate: '0%'
  });
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTaskForReassign, setSelectedTaskForReassign] = useState(null);
  const [reassignToStaff, setReassignToStaff] = useState('');

  const requestTypes = [
    'all',
    'room_service',
    'housekeeping',
    'maintenance',
    'amenity',
    'wake_up_call',
    'transportation',
    'concierge',
    'other'
  ];

  useEffect(() => {
    fetchAllTasks();
    fetchStaff();
  }, [filters]);

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.requestType !== 'all') params.request_type = filters.requestType;
      if (filters.assignedTo !== 'all') params.assigned_to = filters.assignedTo;

      const response = await apiClient.get('/guest-requests', { params });

      if (response.data.success) {
        const { requests } = response.data.data;
        setTasks(requests);
        
        // Calculate statistics
        calculateStatistics(requests);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/guest-requests/staff');
      if (response.data.success) {
        setStaff(response.data.data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const calculateStatistics = (taskList) => {
    const stats = {
      total: taskList.length,
      pending: 0,
      acknowledged: 0,
      inProgress: 0,
      completed: 0,
      avgCompletionTime: '0h',
      completionRate: '0%'
    };

    let totalCompletionMinutes = 0;
    let completedCount = 0;

    taskList.forEach(task => {
      if (task.status === 'pending') stats.pending++;
      else if (task.status === 'acknowledged') stats.acknowledged++;
      else if (task.status === 'in_progress') stats.inProgress++;
      else if (task.status === 'completed') {
        stats.completed++;
        completedCount++;

        // Calculate completion time
        if (task.requested_time && task.completed_time) {
          const timeDiff = new Date(task.completed_time) - new Date(task.requested_time);
          totalCompletionMinutes += timeDiff / (1000 * 60);
        }
      }
    });

    if (completedCount > 0) {
      const avgMinutes = Math.round(totalCompletionMinutes / completedCount);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      stats.avgCompletionTime = `${hours}h ${minutes}m`;
      stats.completionRate = `${Math.round((completedCount / stats.total) * 100)}%`;
    }

    setStatistics(stats);
  };

  const handleReassignTask = async () => {
    if (!reassignToStaff) {
      alert('Please select a staff member');
      return;
    }

    try {
      // Update task assignment - this might need a new endpoint
      // For now, we'll show a message
      alert('Task reassignment feature coming soon. Please contact your administrator.');
      setShowReassignModal(false);
    } catch (error) {
      console.error('Error reassigning task:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending', icon: '⏳' },
      acknowledged: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Acknowledged', icon: '👀' },
      in_progress: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'In Progress', icon: '⚙️' },
      completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed', icon: '✅' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled', icon: '❌' }
    };
    return badges[status] || badges.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.normal;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTasks = tasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 size={28} />
              Task Management Overview
            </h2>
            <p className="text-purple-100 mt-1">Monitor and manage all staff tasks</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatBox label="Total Tasks" value={statistics.total} color="bg-blue-50 text-blue-700" />
        <StatBox label="Pending" value={statistics.pending} color="bg-yellow-50 text-yellow-700" />
        <StatBox label="In Progress" value={statistics.inProgress} color="bg-indigo-50 text-indigo-700" />
        <StatBox label="Completed" value={statistics.completed} color="bg-green-50 text-green-700" />
        <StatBox label="Avg Time" value={statistics.avgCompletionTime} color="bg-purple-50 text-purple-700" />
        <StatBox label="Completion Rate" value={statistics.completionRate} color="bg-emerald-50 text-emerald-700" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Filter size={18} />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Request Type Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Request Type</label>
            <select
              value={filters.requestType}
              onChange={(e) => setFilters({ ...filters, requestType: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            >
              {requestTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To Filter */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            >
              <option value="all">All Staff</option>
              {staff.map(member => (
                <option key={member.hms_user_id} value={member.hms_user_id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Tasks</h3>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <ManagerTaskCard
                key={task.request_id}
                task={task}
                isExpanded={expandedTaskId === task.request_id}
                onToggleExpand={() => setExpandedTaskId(
                  expandedTaskId === task.request_id ? null : task.request_id
                )}
                onReassign={() => {
                  setSelectedTaskForReassign(task);
                  setShowReassignModal(true);
                }}
                getStatusBadge={getStatusBadge}
                getPriorityColor={getPriorityColor}
                formatDate={formatDate}
                staff={staff}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedTaskForReassign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Reassign Task</h3>

            <div className="bg-gray-50 rounded p-3">
              <p className="text-sm font-semibold text-gray-600">
                {selectedTaskForReassign.request_type.replace(/_/g, ' ').toUpperCase()}
              </p>
              <p className="text-sm text-gray-700 mt-1">{selectedTaskForReassign.description}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign to Staff Member
              </label>
              <select
                value={reassignToStaff}
                onChange={(e) => setReassignToStaff(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              >
                <option value="">Select staff member...</option>
                {staff.map(member => (
                  <option key={member.hms_user_id} value={member.hms_user_id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedTaskForReassign(null);
                  setReassignToStaff('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignTask}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Statistics Box Component
const StatBox = ({ label, value, color }) => (
  <div className={`rounded-lg p-3 text-center ${color} border border-current border-opacity-20`}>
    <p className="text-xs font-semibold opacity-75">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

// Manager Task Card Component
const ManagerTaskCard = ({
  task,
  isExpanded,
  onToggleExpand,
  onReassign,
  getStatusBadge,
  getPriorityColor,
  formatDate,
  staff
}) => {
  const statusBadge = getStatusBadge(task.status);
  const assignedStaff = staff.find(s => s.hms_user_id === task.assigned_to);

  return (
    <div className={`border rounded-lg ${statusBadge.bg} transition`}>
      {/* Header */}
      <div
        onClick={onToggleExpand}
        className="p-4 cursor-pointer flex items-center justify-between hover:opacity-80 transition"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{statusBadge.icon}</span>
            <h4 className="font-semibold text-gray-800">
              {task.request_type.replace(/_/g, ' ').toUpperCase()}
            </h4>
            <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-700">{task.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
            <span>🏨 {task.homestay_name}</span>
            <span>👤 {task.guest_name}</span>
            {assignedStaff && <span>👨‍💼 {assignedStaff.name}</span>}
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700 ml-2">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t px-4 py-3 space-y-3 bg-white bg-opacity-50">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">Booking Reference</p>
              <p className="text-gray-800">{task.booking_reference}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Guest Email</p>
              <p className="text-gray-800">{task.guest_email}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Assigned To</p>
              <p className="text-gray-800">{assignedStaff?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Requested</p>
              <p className="text-gray-800">{formatDate(task.requested_time)}</p>
            </div>
          </div>

          {/* Guest Notes */}
          {task.notes && (
            <div className="bg-yellow-100 bg-opacity-50 rounded p-2">
              <p className="text-xs font-semibold text-yellow-800 mb-1">Guest Notes:</p>
              <p className="text-sm text-gray-700">{task.notes}</p>
            </div>
          )}

          {/* Staff Notes */}
          {task.staff_notes && (
            <div className="bg-blue-100 bg-opacity-50 rounded p-2">
              <p className="text-xs font-semibold text-blue-800 mb-1">Staff Notes:</p>
              <p className="text-sm text-gray-700">{task.staff_notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={onReassign}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold text-sm flex items-center justify-center gap-1 transition"
            >
              <Edit2 size={16} />
              Reassign
            </button>
            <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded font-semibold text-sm flex items-center justify-center gap-1 transition">
              <Eye size={16} />
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTaskOversight;