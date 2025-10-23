import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  Flag
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

/**
 * STAFF TASK DASHBOARD
 * Allows staff members to view, accept, and complete assigned tasks
 * Features:
 * - View my pending/in-progress tasks
 * - Accept tasks (change status to acknowledged/in_progress)
 * - Complete tasks with notes
 * - Track task history
 */

const StaffTaskDashboard = ({ staffRole = 'housekeeping' }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('all');
  const [statistics, setStatistics] = useState({
    all: 0,
    pending: 0,
    acknowledged: 0,
    inProgress: 0,
    completed: 0
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    notes: '',
    rating: 5,
    feedback: ''
  });

  useEffect(() => {
    fetchMyTasks();
    // Refresh tasks every 30 seconds
    const interval = setInterval(fetchMyTasks, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await apiClient.get('/guest-requests/my-tasks', { params });
      
      if (response.data.success) {
        const { tasks } = response.data.data;
        setTasks(tasks);
        
        // Calculate statistics
        const stats = {
          all: tasks.length,
          pending: 0,
          acknowledged: 0,
          inProgress: 0,
          completed: 0
        };
        
        tasks.forEach(task => {
          if (task.status === 'pending') stats.pending++;
          else if (task.status === 'acknowledged') stats.acknowledged++;
          else if (task.status === 'in_progress') stats.inProgress++;
          else if (task.status === 'completed') stats.completed++;
        });
        
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      setActionLoading(prev => ({ ...prev, [taskId]: 'accepting' }));
      const response = await apiClient.patch(`/guest-requests/${taskId}/accept`);
      
      if (response.data.success) {
        setTasks(tasks.map(t => 
          t.request_id === taskId ? { ...t, status: 'acknowledged' } : t
        ));
        alert('Task accepted! You can now start working on it.');
      }
    } catch (error) {
      console.error('Error accepting task:', error);
      alert('Failed to accept task: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [taskId]: null }));
    }
  };

  const handleMarkInProgress = async (taskId) => {
    try {
      setActionLoading(prev => ({ ...prev, [taskId]: 'inprogress' }));
      const response = await apiClient.patch(`/guest-requests/${taskId}/accept`, {
        notes: 'Started working on this task'
      });
      
      if (response.data.success) {
        setTasks(tasks.map(t => 
          t.request_id === taskId ? { ...t, status: 'in_progress' } : t
        ));
        alert('Task marked as in progress');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [taskId]: null }));
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    try {
      setActionLoading(prev => ({ ...prev, [selectedTask.request_id]: 'completing' }));
      const response = await apiClient.patch(`/guest-requests/${selectedTask.request_id}/complete`, {
        notes: completeForm.notes,
        rating: completeForm.rating,
        feedback: completeForm.feedback
      });

      if (response.data.success) {
        setTasks(tasks.map(t => 
          t.request_id === selectedTask.request_id 
            ? { ...t, status: 'completed', completed_time: new Date().toISOString() } 
            : t
        ));
        setShowCompleteModal(false);
        setCompleteForm({ notes: '', rating: 5, feedback: '' });
        setSelectedTask(null);
        alert('Task completed successfully!');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedTask.request_id]: null }));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: '⏳ Pending' },
      acknowledged: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: '👀 Acknowledged' },
      in_progress: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', label: '⚙️ In Progress' },
      completed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: '✅ Completed' },
      cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: '❌ Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return badge;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600 bg-gray-50',
      normal: 'text-blue-600 bg-blue-50',
      high: 'text-orange-600 bg-orange-50',
      urgent: 'text-red-600 bg-red-50'
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

  const getTimeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="All Tasks"
          count={statistics.all}
          icon={FileText}
          color="slate"
          onClick={() => setFilter('all')}
          isActive={filter === 'all'}
        />
        <StatCard
          title="Pending"
          count={statistics.pending}
          icon={Clock}
          color="yellow"
          onClick={() => setFilter('pending')}
          isActive={filter === 'pending'}
        />
        <StatCard
          title="Acknowledged"
          count={statistics.acknowledged}
          icon={AlertCircle}
          color="blue"
          onClick={() => setFilter('acknowledged')}
          isActive={filter === 'acknowledged'}
        />
        <StatCard
          title="In Progress"
          count={statistics.inProgress}
          icon={FileText}
          color="indigo"
          onClick={() => setFilter('in_progress')}
          isActive={filter === 'in_progress'}
        />
        <StatCard
          title="Completed"
          count={statistics.completed}
          icon={CheckCircle}
          color="green"
          onClick={() => setFilter('completed')}
          isActive={filter === 'completed'}
        />
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {filter === 'all' ? 'All Tasks' : `${filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')} Tasks`}
          </h3>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No tasks in this status</p>
            <p className="text-sm text-gray-500">Great job! All caught up 🎉</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.request_id}
              task={task}
              isExpanded={expandedTaskId === task.request_id}
              onToggleExpand={() => setExpandedTaskId(
                expandedTaskId === task.request_id ? null : task.request_id
              )}
              onAccept={() => handleAcceptTask(task.request_id)}
              onMarkInProgress={() => handleMarkInProgress(task.request_id)}
              onComplete={() => {
                setSelectedTask(task);
                setShowCompleteModal(true);
              }}
              getStatusBadge={getStatusBadge}
              getPriorityColor={getPriorityColor}
              formatDate={formatDate}
              getTimeAgo={getTimeAgo}
              actionLoading={actionLoading[task.request_id]}
              user={user}
            />
          ))
        )}
      </div>

      {/* Complete Task Modal */}
      {showCompleteModal && selectedTask && (
        <CompleteTaskModal
          task={selectedTask}
          form={completeForm}
          setForm={setCompleteForm}
          onSubmit={handleCompleteTask}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedTask(null);
          }}
          loading={actionLoading[selectedTask.request_id]}
        />
      )}
    </div>
  );
};

// Statistics Card Component
const StatCard = ({ title, count, icon: Icon, color, onClick, isActive }) => {
  const colorMap = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'bg-green-50 border-green-200 text-green-700'
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
        isActive ? colorMap[color] + ' border-current' : colorMap[color] + ' border-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{count}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({
  task,
  isExpanded,
  onToggleExpand,
  onAccept,
  onMarkInProgress,
  onComplete,
  getStatusBadge,
  getPriorityColor,
  formatDate,
  getTimeAgo,
  actionLoading,
  user
}) => {
  const statusBadge = getStatusBadge(task.status);

  return (
    <div className={`border rounded-lg transition ${statusBadge.border} ${statusBadge.bg}`}>
      {/* Header */}
      <div
        onClick={onToggleExpand}
        className="p-4 cursor-pointer flex items-start justify-between hover:opacity-80 transition"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-800">{task.request_type.replace(/_/g, ' ').toUpperCase()}</h4>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${statusBadge.text} bg-white`}>
              {statusBadge.label}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-1">{task.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
            <span>👤 {task.guest_name}</span>
            <span>⏰ {getTimeAgo(task.requested_time)}</span>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t px-4 py-3 space-y-3 bg-white">
          {/* Details */}
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
              <p className="text-gray-600 font-semibold">Requested Time</p>
              <p className="text-gray-800">{formatDate(task.requested_time)}</p>
            </div>
            {task.scheduled_time && (
              <div>
                <p className="text-gray-600 font-semibold">Scheduled Time</p>
                <p className="text-gray-800">{formatDate(task.scheduled_time)}</p>
              </div>
            )}
          </div>

          {/* Guest Notes */}
          {task.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Guest Notes:</p>
              <p className="text-sm text-gray-700">{task.notes}</p>
            </div>
          )}

          {/* Staff Notes */}
          {task.staff_notes && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Staff Notes:</p>
              <p className="text-sm text-gray-700">{task.staff_notes}</p>
            </div>
          )}

          {/* Additional Charges - Only visible to roles that should see financial information */}
          {task.additional_charges && parseFloat(task.additional_charges) > 0 && ['manager', 'vendor', 'admin', 'receptionist', 'accountant'].includes(user?.role?.toLowerCase()) && (
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <p className="text-sm font-semibold text-orange-700">
                💰 Additional Charge: RWF {parseFloat(task.additional_charges).toFixed(2)}
              </p>
            </div>
          )}

          {/* Completed Time */}
          {task.completed_time && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm font-semibold text-green-700">
                ✅ Completed: {formatDate(task.completed_time)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            {task.status === 'pending' && (
              <button
                onClick={onAccept}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Accept Task'
                )}
              </button>
            )}

            {task.status === 'acknowledged' && (
              <button
                onClick={onMarkInProgress}
                disabled={actionLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Start Working'
                )}
              </button>
            )}

            {(task.status === 'acknowledged' || task.status === 'in_progress') && (
              <button
                onClick={onComplete}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Mark Complete'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Complete Task Modal Component
const CompleteTaskModal = ({ task, form, setForm, onSubmit, onClose, loading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Complete Task</h3>

        <div className="bg-gray-50 rounded p-3">
          <p className="text-sm font-semibold text-gray-600">{task.request_type.replace(/_/g, ' ').toUpperCase()}</p>
          <p className="text-sm text-gray-700 mt-1">{task.description}</p>
        </div>

        {/* Completion Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Completion Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Describe what was done, any issues, etc."
            rows="4"
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            How satisfied are you with this task? (Optional)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setForm({ ...form, rating: star })}
                className={`p-2 rounded ${
                  form.rating >= star
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Star size={20} fill={form.rating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Feedback (Optional)
          </label>
          <textarea
            value={form.feedback}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            placeholder="Any feedback or suggestions..."
            rows="2"
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 py-2 rounded font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={18} />}
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffTaskDashboard;