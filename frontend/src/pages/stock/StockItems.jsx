import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Archive,
  AlertTriangle,
  CheckCircle,
  Eye,
  Minus,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const StockItems = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    item_name: '',
    unit: '',
    current_quantity: '',
    category: '',
    supplier_id: '',
    reorder_threshold: '',
    unit_price: '',
    description: ''
  });
  const [deductQuantity, setDeductQuantity] = useState('');

  useEffect(() => {
    fetchStockItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, categoryFilter, supplierFilter, searchTerm, lowStockFilter]);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/stock-items');
      const stockItems = response.data?.data || response.data || [];
      
      setItems(stockItems);
    } catch (err) {
      console.error('Error fetching stock items:', err);
      setError('Failed to load stock items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(item => item.supplier_id === supplierFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Low stock filter
    if (lowStockFilter) {
      filtered = filtered.filter(item => 
        parseFloat(item.current_quantity || 0) <= parseFloat(item.reorder_threshold || 0)
      );
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = async () => {
    try {
      const response = await apiClient.post('/stock-items', formData);
      
      if (response.data.success) {
        toast.success('Item added successfully');
        setShowAddModal(false);
        setFormData({
          item_name: '',
          unit: '',
          current_quantity: '',
          category: '',
          supplier_id: '',
          reorder_threshold: '',
          unit_price: '',
          description: ''
        });
        fetchStockItems();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleEditItem = async () => {
    try {
      const response = await apiClient.put(`/stock-items/${selectedItem.item_id}`, formData);
      
      if (response.data.success) {
        toast.success('Item updated successfully');
        setShowEditModal(false);
        setSelectedItem(null);
        fetchStockItems();
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeductQuantity = async () => {
    try {
      const newQuantity = parseFloat(selectedItem.current_quantity) - parseFloat(deductQuantity);
      
      if (newQuantity < 0) {
        toast.error('Cannot deduct more than available quantity');
        return;
      }

      const response = await apiClient.patch(`/stock-items/${selectedItem.item_id}`, {
        current_quantity: newQuantity
      });
      
      if (response.data.success) {
        toast.success('Quantity deducted successfully');
        setShowDeductModal(false);
        setSelectedItem(null);
        setDeductQuantity('');
        fetchStockItems();
      }
    } catch (error) {
      console.error('Error deducting quantity:', error);
      toast.error('Failed to deduct quantity');
    }
  };

  const handleArchiveItem = async (itemId) => {
    try {
      const response = await apiClient.patch(`/stock-items/${itemId}`, {
        status: 'archived'
      });
      
      if (response.data.success) {
        toast.success('Item archived successfully');
        fetchStockItems();
      }
    } catch (error) {
      console.error('Error archiving item:', error);
      toast.error('Failed to archive item');
    }
  };

  const getCategories = () => {
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    return categories;
  };

  const getSuppliers = () => {
    const suppliers = [...new Set(items.map(item => item.supplier_id).filter(Boolean))];
    return suppliers;
  };

  const getStatusColor = (item) => {
    const quantity = parseFloat(item.current_quantity || 0);
    const threshold = parseFloat(item.reorder_threshold || 0);
    
    if (quantity <= threshold) return 'bg-red-100 text-red-800';
    if (quantity <= threshold * 1.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (item) => {
    const quantity = parseFloat(item.current_quantity || 0);
    const threshold = parseFloat(item.reorder_threshold || 0);
    
    if (quantity <= threshold) return 'Low Stock';
    if (quantity <= threshold * 1.5) return 'Medium Stock';
    return 'Good Stock';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stock items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchStockItems}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                <Package className="h-8 w-8 text-blue-600" />
                Stock Items Management
        </h1>
              <p className="text-gray-600 mt-1">
                Manage inventory items, quantities, and stock levels
              </p>
            </div>
        <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
              <Plus className="h-4 w-4" />
              Add Item
        </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Suppliers</option>
              {getSuppliers().map(supplier => (
                <option key={supplier} value={supplier}>Supplier {supplier}</option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Low Stock Only</span>
            </label>

            <div className="flex-1 min-w-64">
          <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Stock Items ({filteredItems.length})
            </h3>
      </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                  <tr key={item.item_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.item_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {item.category}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.current_quantity} {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Threshold: {item.reorder_threshold}
                        </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item)}`}>
                          {getStatusText(item)}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RWF {parseFloat(item.unit_price || 0).toLocaleString()}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setFormData({
                                item_name: item.item_name,
                                unit: item.unit,
                                current_quantity: item.current_quantity,
                                category: item.category,
                                supplier_id: item.supplier_id,
                                reorder_threshold: item.reorder_threshold,
                                unit_price: item.unit_price,
                                description: item.description
                              });
                              setShowEditModal(true);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs"
                          >
                            Edit
                          </button>
                      <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeductModal(true);
                            }}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded text-xs"
                          >
                            Deduct
                      </button>
                      <button
                            onClick={() => handleArchiveItem(item.item_id)}
                            className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-xs"
                      >
                            Archive
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

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData({...formData, current_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    value={formData.reorder_threshold}
                    onChange={(e) => setFormData({...formData, reorder_threshold: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.item_name}
                  onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData({...formData, current_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    value={formData.reorder_threshold}
                    onChange={(e) => setFormData({...formData, reorder_threshold: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deduct Quantity Modal */}
      {showDeductModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Deduct Quantity</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Item: <span className="font-medium">{selectedItem.item_name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Current Quantity: <span className="font-medium">{selectedItem.current_quantity} {selectedItem.unit}</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Deduct
              </label>
              <input
                type="number"
                value={deductQuantity}
                onChange={(e) => setDeductQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity to deduct"
              />
            </div>
            <div className="flex justify-end space-x-3">
                <button
                onClick={() => setShowDeductModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                onClick={handleDeductQuantity}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                Deduct Quantity
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockItems;