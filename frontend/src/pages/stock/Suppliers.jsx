import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Truck, Phone, Mail, MapPin } from 'lucide-react';
import * as stockService from '../../services/stockService';
import apiClient from '../../services/apiClient';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    homestay_id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_info: '',
    payment_terms: '',
    is_active: true
  });

  useEffect(() => {
    fetchSuppliers();
    fetchHomestays();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await stockService.getSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomestays = async () => {
    try {
      const response = await apiClient.get('/homestays?limit=100');
      const data = response.data;
      if (Array.isArray(data)) {
        setHomestays(data);
      } else if (data.homestays && Array.isArray(data.homestays)) {
        setHomestays(data.homestays);
      } else {
        setHomestays([]);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
      setHomestays([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean form data - convert empty strings to null
      const cleanedData = {
        ...formData,
        homestay_id: formData.homestay_id || null
      };

      if (editingSupplier) {
        await stockService.updateSupplier(editingSupplier.supplier_id, cleanedData);
      } else {
        await stockService.createSupplier(cleanedData);
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await stockService.deleteSupplier(id);
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contact_info: '',
      payment_terms: '',
      is_active: true
    });
    setEditingSupplier(null);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      contact_info: supplier.contact_info || '',
      payment_terms: supplier.payment_terms || '',
      is_active: supplier.is_active !== undefined ? supplier.is_active : true
    });
    setShowModal(true);
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
          <Truck className="inline mr-2 mb-1" size={32} />
          Suppliers
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Supplier
        </button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No suppliers found
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div key={supplier.supplier_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Truck className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      supplier.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(supplier)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.supplier_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}
                {supplier.payment_terms && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Payment Terms:</p>
                    <p className="text-sm font-medium text-gray-700">{supplier.payment_terms}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ABC Supplies Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Homestay/Hotel</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="supplier@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Full address"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                  <textarea
                    value={formData.contact_info}
                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional contact details"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Net 30, Cash on Delivery"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Supplier</span>
                  </label>
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
                  {editingSupplier ? 'Update' : 'Create'} Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
