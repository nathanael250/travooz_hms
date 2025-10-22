import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Box, AlertTriangle, PackageX, Search } from 'lucide-react';
import * as stockService from '../../services/stockService';
import apiClient from '../../services/apiClient';

const StockItems = () => {
  const [items, setItems] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterHomestay, setFilterHomestay] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    homestay_id: '',
    name: '',
    description: '',
    category: '',
    unit: '',
    quantity: 0,
    reorder_level: 0,
    default_supplier_id: '',
    account_id: ''
  });

  const categories = [
    'Housekeeping',
    'Restaurant',
    'Kitchen',
    'Maintenance',
    'Laundry',
    'Office Supplies',
    'Toiletries',
    'Linen',
    'Cleaning Supplies',
    'Food & Beverage',
    'Other'
  ];

  const units = ['pieces', 'kg', 'liters', 'boxes', 'bottles', 'packs', 'units'];

  useEffect(() => {
    fetchItems();
    fetchHomestays();
    fetchSuppliers();
    fetchAccounts();
  }, [filterCategory, filterHomestay]);

  const fetchItems = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterHomestay) params.homestay_id = filterHomestay;

      const response = await stockService.getStockItems(params);
      setItems(response.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomestays = async () => {
    try {
      const response = await apiClient.get('/homestays');
      // Handle both array response and object with homestays property
      const data = response.data;
      if (Array.isArray(data)) {
        setHomestays(data);
      } else if (data.homestays && Array.isArray(data.homestays)) {
        setHomestays(data.homestays);
      } else if (data.data && Array.isArray(data.data)) {
        setHomestays(data.data);
      } else {
        setHomestays([]);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
      setHomestays([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const params = {};
      if (filterHomestay) params.homestay_id = filterHomestay;

      const response = await stockService.getSuppliers(params);
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const params = filterHomestay ? `?homestay_id=${filterHomestay}` : '';
      const response = await apiClient.get(`/financial/accounts${params}`);
      setAccounts(response.data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean form data - convert empty strings to null for optional fields
      const cleanedData = {
        ...formData,
        homestay_id: formData.homestay_id || null,
        default_supplier_id: formData.default_supplier_id || null,
        account_id: formData.account_id || null,
        quantity: formData.quantity || 0,
        reorder_level: formData.reorder_level || 0
      };

      if (editingItem) {
        await stockService.updateStockItem(editingItem.item_id, cleanedData);
      } else {
        await stockService.createStockItem(cleanedData);
      }
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await stockService.deleteStockItem(id);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      homestay_id: '',
      name: '',
      description: '',
      category: '',
      unit: '',
      quantity: 0,
      reorder_level: 0,
      default_supplier_id: '',
      account_id: ''
    });
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      homestay_id: item.homestay_id || '',
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      unit: item.unit || '',
      quantity: item.quantity || 0,
      reorder_level: item.reorder_level || 0,
      default_supplier_id: item.default_supplier_id || '',
      account_id: item.account_id || ''
    });
    setShowModal(true);
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: PackageX };
    } else if (item.quantity <= item.reorder_level) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: Box };
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Box className="inline mr-2 mb-1" size={32} />
          Stock Items
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Stock Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterHomestay}
            onChange={(e) => setFilterHomestay(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Homestays</option>
            {homestays.map(h => (
              <option key={h.homestay_id} value={h.homestay_id}>{h.name}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Total Items: <span className="font-bold ml-2">{filteredItems.length}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No stock items found
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const status = getStockStatus(item);
                const StatusIcon = status.icon;
                return (
                  <tr key={item.item_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description?.substring(0, 50)}{item.description?.length > 50 ? '...' : ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {item.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.reorder_level} {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.supplier?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.item_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
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
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Stock Item' : 'New Stock Item'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Hand Towels, Dish Soap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Alert when stock reaches this level"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Homestay</label>
                  <select
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Supplier</label>
                  <select
                    value={formData.default_supplier_id}
                    onChange={(e) => setFormData({ ...formData, default_supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(s => (
                      <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Financial Account</label>
                  <select
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select account</option>
                    {accounts.map(a => (
                      <option key={a.account_id} value={a.account_id}>{a.account_name}</option>
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
                    placeholder="Additional details about the item"
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
                  {editingItem ? 'Update' : 'Create'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockItems;
