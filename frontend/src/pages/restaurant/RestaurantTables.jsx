import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Table as TableIcon } from 'lucide-react';
import * as restaurantService from '../../services/restaurantService';
import apiClient from '../../services/apiClient';

const RestaurantTables = () => {
  const [tables, setTables] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    homestay_id: '',
    table_number: '',
    capacity: 2,
    location: '',
    status: 'available',
    notes: ''
  });

  const statuses = [
    { value: 'available', label: 'Available', color: 'green' },
    { value: 'occupied', label: 'Occupied', color: 'red' },
    { value: 'reserved', label: 'Reserved', color: 'blue' },
    { value: 'maintenance', label: 'Maintenance', color: 'yellow' }
  ];

  useEffect(() => {
    fetchTables();
    fetchHomestays();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await restaurantService.getRestaurantTables();
      setTables(response.data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await restaurantService.updateRestaurantTable(editingTable.table_id, formData);
      } else {
        await restaurantService.createRestaurantTable(formData);
      }
      setShowModal(false);
      resetForm();
      fetchTables();
    } catch (error) {
      console.error('Error saving table:', error);
      alert('Failed to save table');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      await restaurantService.deleteRestaurantTable(id);
      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Failed to delete table');
    }
  };

  const resetForm = () => {
    setFormData({
      homestay_id: '',
      table_number: '',
      capacity: 2,
      location: '',
      status: 'available',
      notes: ''
    });
    setEditingTable(null);
  };

  const openEditModal = (table) => {
    setEditingTable(table);
    setFormData({
      homestay_id: table.homestay_id || '',
      table_number: table.table_number || '',
      capacity: table.capacity || 2,
      location: table.location || '',
      status: table.status || 'available',
      notes: table.notes || ''
    });
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <TableIcon className="inline mr-2 mb-1" size={32} />
          Restaurant Tables
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Table
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Homestay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tables.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No tables found. Click "New Table" to add one.
                </td>
              </tr>
            ) : (
              tables.map((table) => (
                <tr key={table.table_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{table.table_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{table.homestay?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{table.capacity} seats</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{table.location || '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(table.status)}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(table)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(table.table_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingTable ? 'Edit Table' : 'New Table'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Homestay *</label>
                  <select
                    required
                    value={formData.homestay_id}
                    onChange={(e) => setFormData({ ...formData, homestay_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select homestay</option>
                    {homestays.map(h => (
                      <option key={h.homestay_id} value={h.homestay_id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.table_number}
                    onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., T01, A1, VIP-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Indoor, Outdoor, Patio, VIP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
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
                  {editingTable ? 'Update' : 'Create'} Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantTables;
