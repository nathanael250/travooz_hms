import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  PlayCircle,
  Calendar,
  MapPin,
  AlertCircle,
  FileText,
  Star
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import * as housekeepingService from '../../services/housekeepingService';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionData, setCompletionData] = useState({
    completion_notes: '',
    quality_rating: 5,
    issues_found: ''
  });

  const statuses = [
    { value: '', label: 'All Tasks' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  useEffect(() => {
    fetchMyTasks();
  }, [filterStatus]);

  const fetchMyTasks = async () => {
    try {
      const response = await housekeepingService.getMyTasks(filterStatus);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (taskId) => {
    if (!confirm('Start this task now?')) return;

    try {
      await housekeepingService.startHousekeepingTask(taskId);
      fetchMyTasks();
      alert('Task started! Timer is running.');
    } catch (error) {
      console.error('Error starting task:', error);
      alert(error.response?.data?.message || 'Error starting task');
    }
  };

  const openCompleteModal = (task) => {
    setSelectedTask(task);
    setShowCompleteModal(true);
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();

    try {
      await housekeepingService.completeHousekeepingTask(selectedTask.task_id, completionData);
      fetchMyTasks();
      setShowCompleteModal(false);
      setCompletionData({
        completion_notes: '',
        quality_rating: 5,
        issues_found: ''
      });
      alert('Task completed successfully!');
    } catch (error) {
      console.error('Error completing task:', error);
      alert(error.response?.data?.message || 'Error completing task');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
      in_progress: { color: 'bg-indigo-100 text-indigo-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
    };

    const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800', label: priority };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTaskTypeLabel = (type) => {
    const types = {
      cleaning: 'Standard Cleaning',
      deep_clean: 'Deep Clean',
      linen_change: 'Linen Change',
      maintenance: 'Maintenance',
      inspection: 'Inspection',
      setup: 'Room Setup',
      turndown_service: 'Turndown Service',
      laundry: 'Laundry',
      restocking: 'Restocking'
    };
    return types[type] || type;
  };

  const calculateDuration = (startTime) => {
    if (!startTime) return null;
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your tasks...</div>
      </div>
    );
  }

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.scheduled_date).toDateString();
    const today = new Date().toDateString();
    return taskDate === today && task.status !== 'completed';
  });

  const upcomingTasks = tasks.filter(task => {
    const taskDate = new Date(task.scheduled_date);
    const today = new Date();
    return taskDate > today && task.status !== 'completed';
  });

  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Tasks sdsd</h1>
        <p className="text-gray-600">Your assigned housekeeping tasks</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Tasks</p>
              <p className="text-3xl font-bold text-blue-600">{todayTasks.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-indigo-600">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayTasks.map(task => (
              <TaskCard
                key={task.task_id}
                task={task}
                onStart={handleStartTask}
                onComplete={openCompleteModal}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                getTaskTypeLabel={getTaskTypeLabel}
                calculateDuration={calculateDuration}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTasks.map(task => (
              <TaskCard
                key={task.task_id}
                task={task}
                onStart={handleStartTask}
                onComplete={openCompleteModal}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                getTaskTypeLabel={getTaskTypeLabel}
                calculateDuration={calculateDuration}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.map(task => (
              <TaskCard
                key={task.task_id}
                task={task}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                getTaskTypeLabel={getTaskTypeLabel}
                calculateDuration={calculateDuration}
              />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No tasks assigned yet</p>
        </div>
      )}

      {/* Complete Task Modal */}
      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Complete Task</h2>
            <form onSubmit={handleCompleteTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task: {getTaskTypeLabel(selectedTask.task_type)}
                </label>
                <p className="text-sm text-gray-600">
                  Room: {selectedTask.room?.unit_number || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCompletionData({ ...completionData, quality_rating: rating })}
                      className={`p-2 rounded ${
                        completionData.quality_rating >= rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-8 h-8" fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={completionData.completion_notes}
                  onChange={(e) => setCompletionData({ ...completionData, completion_notes: e.target.value })}
                  placeholder="Any notes about the completed task..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issues Found
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  value={completionData.issues_found}
                  onChange={(e) => setCompletionData({ ...completionData, issues_found: e.target.value })}
                  placeholder="Any issues or maintenance needed..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setCompletionData({ completion_notes: '', quality_rating: 5, issues_found: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Complete Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onStart, onComplete, getStatusBadge, getPriorityBadge, getTaskTypeLabel, calculateDuration }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {getTaskTypeLabel(task.task_type)}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{task.homestay?.name}</span>
          </div>
        </div>
        {getPriorityBadge(task.priority)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(task.scheduled_date).toLocaleDateString()}</span>
          {task.scheduled_time && (
            <>
              <Clock className="w-4 h-4 ml-2" />
              <span>{task.scheduled_time}</span>
            </>
          )}
        </div>

        {task.room && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Room: {task.room.unit_number}</span>
          </div>
        )}

        {task.notes && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4 mt-0.5" />
            <span className="line-clamp-2">{task.notes}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {getStatusBadge(task.status)}
        
        {task.status === 'in_progress' && task.start_time && (
          <div className="flex items-center gap-1 text-sm text-indigo-600">
            <Clock className="w-4 h-4" />
            <span>{calculateDuration(task.start_time)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {task.status === 'assigned' && onStart && (
          <button
            onClick={() => onStart(task.task_id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlayCircle className="w-4 h-4" />
            Start Task
          </button>
        )}

        {task.status === 'in_progress' && onComplete && (
          <button
            onClick={() => onComplete(task)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4" />
            Complete
          </button>
        )}

        {task.status === 'completed' && task.quality_rating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < task.quality_rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;