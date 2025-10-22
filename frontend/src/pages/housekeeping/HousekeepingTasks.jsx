import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  User,
  Calendar,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import * as housekeepingService from '../../services/housekeepingService';

const HousekeepingTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedHomestay, setSelectedHomestay] = useState('');

  const [formData, setFormData] = useState({
    homestay_id: '',
    inventory_id: '',
    task_type: 'cleaning',
    priority: 'normal',
    scheduled_date: '',
    scheduled_time: '',
    assigned_to: '',
    notes: '',
    booking_id: ''
  });

  const taskTypes = [
    { value: 'cleaning', label: 'Standard Cleaning' },
    { value: 'deep_clean', label: 'Deep Clean' },
    { value: 'linen_change', label: 'Linen Change' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'setup', label: 'Room Setup' },
    { value: 'turndown_service', label: 'Turndown Service' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'restocking', label: 'Restocking' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'normal', label: 'Normal', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'assigned', label: 'Assigned', color: 'blue' },
    { value: 'in_progress', label: 'In Progress', color: 'indigo' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchHomestays();
    fetchStaff();
  }, [filterStatus, filterType, filterPriority, selectedHomestay]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.task_type = filterType;
      if (filterPriority) params.priority = filterPriority;
      if (selectedHomestay) params.homestay_id = selectedHomestay;

      const response = await housekeepingService.getHousekeepingTasks(params);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomestays = async () => {
    try {
      const response = await apiClient.get('/homestays');
      setHomestays(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching homestays:', error);
      setHomestays([]);
    }
  };

  const fetchRooms = async (homestayId) => {
    if (!homestayId) {
      setRooms([]);
      return;
    }
    try {
      const response = await apiClient.get(`/room-inventory?homestay_id=${homestayId}`);
      setRooms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/auth/users');
      setStaff(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTask) {
        await housekeepingService.updateHousekeepingTask(editingTask.task_id, formData);
        alert('Task updated successfully!');
      } else {
        await housekeepingService.createHousekeepingTask(formData);
        alert('Task created successfully!');
      }
      fetchTasks();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving task:', error);
      alert(error.response?.data?.message || 'Error saving task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      homestay_id: task.homestay_id,
      inventory_id: task.inventory_id || '',
      task_type: task.task_type,
      priority: task.priority,
      scheduled_date: task.scheduled_date ? task.scheduled_date.split('T')[0] : '',
      scheduled_time: task.scheduled_time || '',
      assigned_to: task.assigned_to || '',
      notes: task.notes || '',
      booking_id: task.booking_id || ''
    });
    fetchRooms(task.homestay_id);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await housekeepingService.deleteHousekeepingTask(taskId);
      fetchTasks();
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Error deleting task');
    }
  };

  const handleAssign = async (taskId, staffId) => {
    try {
      await housekeepingService.assignHousekeepingTask(taskId, staffId);
      fetchTasks();
      alert('Task assigned successfully!');
    } catch (error) {
      console.error('Error assigning task:', error);
      alert(error.response?.data?.message || 'Error assigning task');
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      await housekeepingService.startHousekeepingTask(taskId);
      fetchTasks();
      alert('Task started!');
    } catch (error) {
      console.error('Error starting task:', error);
      alert(error.response?.data?.message || 'Error starting task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    const notes = prompt('Completion notes (optional):');
    const rating = prompt('Quality rating (1-5):');

    try {
      await housekeepingService.completeHousekeepingTask(taskId, {
        completion_notes: notes || '',
        quality_rating: rating ? parseInt(rating) : null
      });
      fetchTasks();
      alert('Task completed!');
    } catch (error) {
      console.error('Error completing task:', error);
      alert(error.response?.data?.message || 'Error completing task');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      homestay_id: '',
      inventory_id: '',
      task_type: 'cleaning',
      priority: 'normal',
      scheduled_date: '',
      scheduled_time: '',
      assigned_to: '',
      notes: '',
      booking_id: ''
    });
    setRooms([]);
  };

  const handleHomestayChange = (homestayId) => {
    setFormData({ ...formData, homestay_id: homestayId, inventory_id: '' });
    fetchRooms(homestayId);
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

  const getTaskTypeLabel = (type) => {
    const taskType = taskTypes.find(t => t.value === type);
    return taskType ? taskType.label : type;
  };

  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    return (
      task.room?.unit_number?.toLowerCase().includes(searchLower) ||
      task.homestay?.name?.toLowerCase().includes(searchLower) ||
      task.assignedStaff?.name?.toLowerCase().includes(searchLower) ||
      task.task_type?.toLowerCase().includes(searchLower)
    );
  });

  const resetFilters = () => {
    setFilterStatus('');
    setFilterType('');
    setFilterPriority('');
    setSelectedHomestay('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading housekeeping tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Housekeeping Tasks</h1>
          <p className="text-gray-600">Create, assign, and monitor cleaning tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedHomestay}
            onChange={(e) => setSelectedHomestay(e.target.value)}
          >
            <option value="">All Homestays</option>
            {homestays.map(homestay => (
              <option key={homestay.homestay_id} value={homestay.homestay_id}>
                {homestay.name}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {taskTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No tasks found
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.task_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getTaskTypeLabel(task.task_type)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.homestay?.name}
                        </div>
                        {task.notes && (
                          <div className="text-xs text-gray-400 mt-1">
                            {task.notes.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.room?.unit_number || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {task.room?.room_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.scheduled_date).toLocaleDateString()}
                      </div>
                      {task.scheduled_time && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {task.scheduled_time}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.assignedStaff ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {task.assignedStaff.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {task.assignedStaff.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {task.status === 'assigned' && (
                          <button
                            onClick={() => handleStartTask(task.task_id)}
                            className="text-green-600 hover:text-green-900"
                            title="Start Task"
                          >
                            <PlayCircle className="w-5 h-5" />
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button
                            onClick={() => handleCompleteTask(task.task_id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Complete Task"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.task_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homestay *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.homestay_id}
                    onChange={(e) => handleHomestayChange(e.target.value)}
                    required
                  >
                    <option value="">Select Homestay</option>
                    {homestays.map(homestay => (
                      <option key={homestay.homestay_id} value={homestay.homestay_id}>
                        {homestay.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.inventory_id}
                    onChange={(e) => setFormData({ ...formData, inventory_id: e.target.value })}
                  >
                    <option value="">Select Room (Optional)</option>
                    {rooms.map(room => (
                      <option key={room.inventory_id} value={room.inventory_id}>
                        {room.unit_number} - {room.room_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.task_type}
                    onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                    required
                  >
                    {taskTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {staff.map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking ID (Optional)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.booking_id}
                    onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    placeholder="Link to booking"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional instructions or notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingTasks;