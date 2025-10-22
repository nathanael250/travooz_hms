import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import * as restaurantService from '../../services/restaurantService';
import apiClient from '../../services/apiClient';
import { ImageUpload } from '../../components/common/ImageUpload';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    homestay_id: '',
    name: '',
    description: '',
    price: '',
    preparation_time: '',
    is_available: true,
    dietary_info: '',
    image_url: ''
  });
  const [menuImages, setMenuImages] = useState([]); // For image upload

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchHomestays();
  }, [filterCategory]);

  const fetchMenuItems = async () => {
    try {
      const params = {};
      if (filterCategory) params.category_id = filterCategory;
      const response = await restaurantService.getMenuItems(params);
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await restaurantService.getMenuCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchHomestays = async () => {
    try {
      const response = await apiClient.get('/homestays');
      console.log('Homestays response:', response.data); // Debug log
      setHomestays(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare FormData for image upload
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key]);
      });
      if (menuImages.length > 0 && menuImages[0].file) {
        dataToSend.append('image', menuImages[0].file);
      }
      if (editingItem) {
        await restaurantService.updateMenuItem(editingItem.item_id, dataToSend);
      } else {
        await restaurantService.createMenuItem(dataToSend);
      }
      setShowModal(false);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await restaurantService.deleteMenuItem(id);
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const resetForm = () => {
    setFormData({
      homestay_id: '',
      name: '',
      description: '',
      price: '',
      preparation_time: '',
      is_available: true,
      dietary_info: '',
      image_url: ''
    });
    setMenuImages([]);
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      homestay_id: item.homestay_id || '',
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      preparation_time: item.preparation_time || '',
      is_available: item.is_available !== undefined ? item.is_available : true,
      dietary_info: item.dietary_info || '',
      image_url: item.image_url || ''
    });
    setMenuImages(item.image_url ? [{ preview: item.image_url, id: 0 }] : []);
    setShowModal(true);
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
          <BookOpen className="inline mr-2 mb-1" size={32} />
          Menu Management
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Menu Item
        </button>
      </div>

      {/* Filter by Category */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.category_id} value={c.category_id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Homestay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prep Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No menu items found
                </td>
              </tr>
            ) : (
              menuItems.map((item) => (
                <tr key={item.item_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.description?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.homestay?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{parseFloat(item.price).toLocaleString('en-RW')} RWF</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.preparation_time ? `${item.preparation_time} min` : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
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
              {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Homestay *</label>
                  <select
                    required
                    value={formData.homestay_id}
                    onChange={e => setFormData({ ...formData, homestay_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select homestay</option>
                    {homestays.map(h => (
                      <option key={h.homestay_id} value={h.homestay_id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (RWF) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 5000"
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">RWF</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Info</label>
                  <input
                    type="text"
                    value={formData.dietary_info}
                    onChange={(e) => setFormData({ ...formData, dietary_info: e.target.value })}
                    placeholder="e.g., Vegan, Gluten-Free"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                  <ImageUpload
                    images={menuImages}
                    onImagesChange={setMenuImages}
                    maxImages={1}
                    required={false}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Available</span>
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

export default MenuManagement;
