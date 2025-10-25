import React, { useState, useEffect } from 'react';
import {
  Ruler,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Package,
  Calculator,
  Link,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const StockUnits = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    unit_name: '',
    unit_symbol: '',
    unit_type: 'count',
    base_unit_id: '',
    conversion_factor: 1.0000,
    description: ''
  });

  const unitTypes = [
    { value: 'count', label: 'Count', description: 'Individual items, pieces, sets' },
    { value: 'weight', label: 'Weight', description: 'Kilograms, grams, pounds' },
    { value: 'volume', label: 'Volume', description: 'Liters, milliliters, gallons' },
    { value: 'length', label: 'Length', description: 'Meters, centimeters, feet' },
    { value: 'area', label: 'Area', description: 'Square meters, square feet' },
    { value: 'time', label: 'Time', description: 'Hours, minutes, days' }
  ];

  useEffect(() => {
    fetchStockUnits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [units, typeFilter, searchTerm]);

  const fetchStockUnits = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/stock-units');
      const stockUnits = response.data?.data || response.data || [];
      
      setUnits(stockUnits);
    } catch (err) {
      console.error('Error fetching stock units:', err);
      setError('Failed to load stock units');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...units];

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(unit => unit.unit_type === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(unit =>
        unit.unit_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unit_symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUnits(filtered);
  };

  const handleAddUnit = async () => {
    try {
      const response = await apiClient.post('/stock-units', formData);
      
      if (response.data.success) {
        toast.success('Unit added successfully');
        setShowAddModal(false);
        resetForm();
        fetchStockUnits();
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Failed to add unit');
    }
  };

  const handleEditUnit = async () => {
    try {
      const response = await apiClient.put(`/stock-units/${selectedUnit.unit_id}`, formData);
      
      if (response.data.success) {
        toast.success('Unit updated successfully');
        setShowEditModal(false);
        setSelectedUnit(null);
        resetForm();
        fetchStockUnits();
      }
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Failed to update unit');
    }
  };

  const handleDeleteUnit = async () => {
    try {
      const response = await apiClient.delete(`/stock-units/${selectedUnit.unit_id}`);
      
      if (response.data.success) {
        toast.success('Unit deleted successfully');
        setShowDeleteModal(false);
        setSelectedUnit(null);
        fetchStockUnits();
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Failed to delete unit');
    }
  };

  const resetForm = () => {
    setFormData({
      unit_name: '',
      unit_symbol: '',
      unit_type: 'count',
      base_unit_id: '',
      conversion_factor: 1.0000,
      description: ''
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'count': return 'bg-blue-100 text-blue-800';
      case 'weight': return 'bg-green-100 text-green-800';
      case 'volume': return 'bg-yellow-100 text-yellow-800';
      case 'length': return 'bg-purple-100 text-purple-800';
      case 'area': return 'bg-pink-100 text-pink-800';
      case 'time': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBaseUnitName = (baseUnitId) => {
    if (!baseUnitId) return 'Base Unit';
    const baseUnit = units.find(u => u.unit_id === baseUnitId);
    return baseUnit?.unit_name || `Unit ${baseUnitId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stock units...</p>
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
            onClick={fetchStockUnits}
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
                <Ruler className="h-8 w-8 text-blue-600" />
                Stock Units Management
              </h1>
              <p className="text-gray-600 mt-1">
                Define measurement units, conversions, and standardization
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Unit
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {unitTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Units Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Stock Units ({filteredUnits.length})
            </h3>
          </div>

          {filteredUnits.length === 0 ? (
            <div className="text-center py-12">
              <Ruler className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No units found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Factor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.map((unit) => (
                    <tr key={unit.unit_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {unit.unit_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {unit.unit_symbol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(unit.unit_type)}`}>
                          {unitTypes.find(t => t.value === unit.unit_type)?.label || unit.unit_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getBaseUnitName(unit.base_unit_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {unit.conversion_factor}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {unit.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUnit(unit);
                              setFormData({
                                unit_name: unit.unit_name,
                                unit_symbol: unit.unit_symbol,
                                unit_type: unit.unit_type,
                                base_unit_id: unit.base_unit_id,
                                conversion_factor: unit.conversion_factor,
                                description: unit.description
                              });
                              setShowEditModal(true);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUnit(unit);
                              setShowDeleteModal(true);
                            }}
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

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Unit</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                  <input
                    type="text"
                    value={formData.unit_name}
                    onChange={(e) => setFormData({...formData, unit_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Kilogram"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={formData.unit_symbol}
                    onChange={(e) => setFormData({...formData, unit_symbol: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., kg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                <select
                  value={formData.unit_type}
                  onChange={(e) => setFormData({...formData, unit_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {unitTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {unitTypes.find(t => t.value === formData.unit_type)?.description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Unit</label>
                <select
                  value={formData.base_unit_id}
                  onChange={(e) => setFormData({...formData, base_unit_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Base Unit (No conversion)</option>
                  {units.filter(u => u.unit_type === formData.unit_type).map(unit => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name} ({unit.unit_symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Factor</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.conversion_factor}
                  onChange={(e) => setFormData({...formData, conversion_factor: parseFloat(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Factor to convert to base unit (e.g., 1000 for kg to g)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Unit description and usage notes..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUnit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {showEditModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Unit</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                  <input
                    type="text"
                    value={formData.unit_name}
                    onChange={(e) => setFormData({...formData, unit_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={formData.unit_symbol}
                    onChange={(e) => setFormData({...formData, unit_symbol: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                <select
                  value={formData.unit_type}
                  onChange={(e) => setFormData({...formData, unit_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {unitTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Unit</label>
                <select
                  value={formData.base_unit_id}
                  onChange={(e) => setFormData({...formData, base_unit_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Base Unit (No conversion)</option>
                  {units.filter(u => u.unit_type === formData.unit_type && u.unit_id !== selectedUnit.unit_id).map(unit => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name} ({unit.unit_symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Factor</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.conversion_factor}
                  onChange={(e) => setFormData({...formData, conversion_factor: parseFloat(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUnit(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUnit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Unit</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the unit "{selectedUnit.unit_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUnit(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUnit}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockUnits;
