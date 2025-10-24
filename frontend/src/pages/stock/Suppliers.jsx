import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Package,
  Loader2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const Suppliers = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    categories_supplied: '',
    preferred_items: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [suppliers, statusFilter, searchTerm]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/stock-suppliers');
      const suppliersData = response.data?.data || response.data || [];
      
      setSuppliers(suppliersData);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...suppliers];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.categories_supplied?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSuppliers(filtered);
  };

  const handleAddSupplier = async () => {
    try {
      const response = await apiClient.post('/stock-suppliers', formData);
      
      if (response.data.success) {
        toast.success('Supplier added successfully');
        setShowAddModal(false);
        setFormData({
          supplier_name: '',
          contact_email: '',
          contact_phone: '',
          address: '',
          categories_supplied: '',
          preferred_items: '',
          status: 'active',
          notes: ''
        });
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Failed to add supplier');
    }
  };

  const handleEditSupplier = async () => {
    try {
      const response = await apiClient.put(`/stock-suppliers/${selectedSupplier.supplier_id}`, formData);
      
      if (response.data.success) {
        toast.success('Supplier updated successfully');
        setShowEditModal(false);
        setSelectedSupplier(null);
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Failed to update supplier');
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await apiClient.delete(`/stock-suppliers/${supplierId}`);
        
        if (response.data.success) {
          toast.success('Supplier deleted successfully');
          fetchSuppliers();
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast.error('Failed to delete supplier');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'suspended': return 'Suspended';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchSuppliers}
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
                <Users className="h-8 w-8 text-blue-600" />
                Suppliers Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage supplier information and relationships
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Suppliers ({filteredSuppliers.length})
            </h3>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No suppliers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categories
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
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.supplier_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {supplier.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1 mb-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {supplier.contact_email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {supplier.contact_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.categories_supplied}
                        </div>
                        <div className="text-xs text-gray-500">
                          {supplier.preferred_items}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                          {getStatusText(supplier.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setShowViewModal(true);
                            }}
                            className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setFormData({
                                supplier_name: supplier.supplier_name,
                                contact_email: supplier.contact_email,
                                contact_phone: supplier.contact_phone,
                                address: supplier.address,
                                categories_supplied: supplier.categories_supplied,
                                preferred_items: supplier.preferred_items,
                                status: supplier.status,
                                notes: supplier.notes
                              });
                              setShowEditModal(true);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(supplier.supplier_id)}
                            className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs"
                          >
                            Delete
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

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Supplier</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories Supplied</label>
                <input
                  type="text"
                  value={formData.categories_supplied}
                  onChange={(e) => setFormData({...formData, categories_supplied: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Linen, Toiletries, Kitchen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Items</label>
                <input
                  type="text"
                  value={formData.preferred_items}
                  onChange={(e) => setFormData({...formData, preferred_items: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Towels, Soap, Plates"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                onClick={handleAddSupplier}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Supplier</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories Supplied</label>
                <input
                  type="text"
                  value={formData.categories_supplied}
                  onChange={(e) => setFormData({...formData, categories_supplied: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Items</label>
                <input
                  type="text"
                  value={formData.preferred_items}
                  onChange={(e) => setFormData({...formData, preferred_items: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
                onClick={handleEditSupplier}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Supplier Modal */}
      {showViewModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Supplier Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedSupplier.supplier_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSupplier.status)}`}>
                    {getStatusText(selectedSupplier.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedSupplier.contact_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedSupplier.contact_phone}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="text-sm text-gray-900">{selectedSupplier.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categories Supplied</label>
                <p className="text-sm text-gray-900">{selectedSupplier.categories_supplied}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Items</label>
                <p className="text-sm text-gray-900">{selectedSupplier.preferred_items}</p>
              </div>
              {selectedSupplier.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900">{selectedSupplier.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;