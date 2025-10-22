import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus } from 'lucide-react';
import * as stockService from '../../services/stockService';

const UsageLogs = () => {
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [formData, setFormData] = useState({
    item_id: '',
    used_for: '',
    department: '',
    quantity: '',
    reference_id: '',
    notes: ''
  });

  const departments = [
    { value: 'room', label: 'Room Service', color: 'bg-blue-100 text-blue-800' },
    { value: 'restaurant', label: 'Restaurant', color: 'bg-purple-100 text-purple-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'housekeeping', label: 'Housekeeping', color: 'bg-green-100 text-green-800' },
    { value: 'laundry', label: 'Laundry', color: 'bg-pink-100 text-pink-800' },
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchLogs();
    fetchItems();
  }, [filterDepartment]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (filterDepartment) params.used_for = filterDepartment;

      const response = await stockService.getUsageLogs(params);
      setLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await stockService.getStockItems();
      setItems(response.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity)
      };

      await stockService.createUsageLog(payload);
      setShowModal(false);
      resetForm();
      fetchLogs();
      alert('Usage logged successfully!');
    } catch (error) {
      console.error('Error logging usage:', error);
      alert('Failed to log usage: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      item_id: '',
      used_for: '',
      department: '',
      quantity: '',
      reference_id: '',
      notes: ''
    });
  };

  const getDepartmentInfo = (usedFor) => {
    return departments.find(d => d.value === usedFor) || departments[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <ClipboardCheck className="inline mr-2 mb-1" size={32} />
          Usage Logs
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Log Usage
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.value} value={dept.value}>{dept.label}</option>
          ))}
        </select>
      </div>

      {/* Usage Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No usage logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const deptInfo = getDepartmentInfo(log.used_for);
                return (
                  <tr key={log.usage_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(log.usage_date || log.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {log.item?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${deptInfo.color}`}>
                        {deptInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {log.quantity} {log.item?.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.user?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.reference_id ? `#${log.reference_id}` : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Log Item Usage</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                  <select
                    required
                    value={formData.item_id}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select item</option>
                    {items.map(item => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.name} (Available: {item.quantity} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    required
                    value={formData.used_for}
                    onChange={(e) => setFormData({ ...formData, used_for: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Quantity used"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference ID</label>
                  <input
                    type="text"
                    value={formData.reference_id}
                    onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Booking ID, Order ID, etc."
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
                  Log Usage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageLogs;
