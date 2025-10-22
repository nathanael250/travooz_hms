import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle,
  Filter, User, Calendar, Wrench, DollarSign
} from 'lucide-react';
import * as maintenanceService from '../../services/maintenanceService';
import apiClient from '../../services/apiClient';

const MaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedHomestay, setSelectedHomestay] = useState('');

  const [formData, setFormData] = useState({
    homestay_id: '',
    room_id: '',
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    scheduled_date: '',
    assigned_to: '',
    estimated_cost: '',
    notes: ''
  });

  const categories = [
    { value: 'plumbing', label: 'Plumbing', icon: '🚰' },
    { value: 'electrical', label: 'Electrical', icon: '⚡' },
    { value: 'hvac', label: 'HVAC', icon: '❄️' },
    { value: 'furniture', label: 'Furniture', icon: '🪑' },
    { value: 'appliance', label: 'Appliance', icon: '📺' },
    { value: 'structural', label: 'Structural', icon: '🏗️' },
    { value: 'safety', label: 'Safety', icon: '🚨' },
    { value: 'other', label: 'Other', icon: '🔧' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'blue' },
    { value: 'in_progress', label: 'In Progress', color: 'indigo' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
    { value: 'on_hold', label: 'On Hold', color: 'gray' }
  ];

  useEffect(() => {
    fetchRequests();
    fetchHomestays();
    fetchStaff();
  }, [filterStatus, filterPriority, filterCategory, selectedHomestay]);

  const fetchRequests = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterCategory) params.category = filterCategory;
      if (selectedHomestay) params.homestay_id = selectedHomestay;

      const response = await maintenanceService.getMaintenanceRequests(params);
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
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
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/users');
      setStaff(Array.isArray(response.data) ? response.data : response.data.users || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchRooms = async (homestayId) => {
    try {
      const response = await apiClient.get(`/rooms?homestay_id=${homestayId}`);
      setRooms(Array.isArray(response.data) ? response.data : response.data.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRequest) {
        await maintenanceService.updateMaintenanceRequest(editingRequest.request_id, formData);
      } else {
        await maintenanceService.createMaintenanceRequest(formData);
      }
      setShowModal(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Error saving request:', error);
      alert('Failed to save maintenance request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance request?')) return;
    try {
      await maintenanceService.deleteMaintenanceRequest(id);
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete maintenance request');
    }
  };

  const handleAssign = async (requestId, staffId) => {
    try {
      await maintenanceService.assignMaintenanceRequest(requestId, staffId);
      fetchRequests();
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('Failed to assign maintenance request');
    }
  };

  const handleComplete = async (requestId) => {
    const completionNotes = prompt('Enter completion notes (optional):');
    const actualCost = prompt('Enter actual cost (optional):');
    try {
      await maintenanceService.completeMaintenanceRequest(requestId, {
        completion_notes: completionNotes,
        actual_cost: actualCost ? parseFloat(actualCost) : undefined
      });
      fetchRequests();
    } catch (error) {
      console.error('Error completing request:', error);
      alert('Failed to complete maintenance request');
    }
  };

  const resetForm = () => {
    setFormData({
      homestay_id: '',
      room_id: '',
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      scheduled_date: '',
      assigned_to: '',
      estimated_cost: '',
      notes: ''
    });
    setEditingRequest(null);
  };

  const openEditModal = (request) => {
    setEditingRequest(request);
    setFormData({
      homestay_id: request.homestay_id || '',
      room_id: request.room_id || '',
      title: request.title || '',
      description: request.description || '',
      category: request.category || 'other',
      priority: request.priority || 'medium',
      scheduled_date: request.scheduled_date ? request.scheduled_date.split('T')[0] : '',
      assigned_to: request.assigned_to || '',
      estimated_cost: request.estimated_cost || '',
      notes: request.notes || ''
    });
    if (request.homestay_id) {
      fetchRooms(request.homestay_id);
    }
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = statuses.find(s => s.value === status) || statuses[0];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
        {statusConfig.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = priorities.find(p => p.value === priority) || priorities[0];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${priorityConfig.color}-100 text-${priorityConfig.color}-800`}>
        {priorityConfig.label}
      </span>
    );
  };

  const filteredRequests = requests.filter(request =>
    searchTerm === '' ||
    request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <Wrench className="inline mr-2 mb-1" size={32} />
          Maintenance Requests
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedHomestay}
            onChange={(e) => setSelectedHomestay(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Homestays</option>
            {homestays.map(h => (
              <option key={h.homestay_id} value={h.homestay_id}>{h.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priority</option>
            {priorities.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No maintenance requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.request_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{request.title}</div>
                    <div className="text-sm text-gray-500">{request.homestay?.name}</div>
                    {request.room && <div className="text-xs text-gray-400">Room: {request.room.unit_number}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {categories.find(c => c.value === request.category)?.icon} {categories.find(c => c.value === request.category)?.label}
                  </td>
                  <td className="px-6 py-4">{getPriorityBadge(request.priority)}</td>
                  <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {request.assignedStaff?.name || <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {request.scheduled_date ? new Date(request.scheduled_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {request.estimated_cost ? `$${parseFloat(request.estimated_cost).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 size={18} />
                      </button>
                      {request.status !== 'completed' && (
                        <button
                          onClick={() => handleComplete(request.request_id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(request.request_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingRequest ? 'Edit Maintenance Request' : 'New Maintenance Request'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Homestay *</label>
                  <select
                    required
                    value={formData.homestay_id}
                    onChange={(e) => {
                      setFormData({ ...formData, homestay_id: e.target.value, room_id: '' });
                      fetchRooms(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select homestay</option>
                    {homestays.map(h => (
                      <option key={h.homestay_id} value={h.homestay_id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <select
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select room (optional)</option>
                    {rooms.map(r => (
                      <option key={r.inventory_id} value={r.inventory_id}>
                        {r.unit_number} - {r.room_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {priorities.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select staff (optional)</option>
                    {staff.map(s => (
                      <option key={s.user_id} value={s.user_id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRequest ? 'Update' : 'Create'} Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequests;
