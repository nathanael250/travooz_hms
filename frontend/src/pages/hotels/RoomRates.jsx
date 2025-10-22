import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3,
  Trash2,
  Search,
  Filter,
  Calendar,
  Percent,
  TrendingUp,
  Building2,
  Bed,
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const RoomRates = () => {
  const [roomRates, setRoomRates] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [filters, setFilters] = useState({
    homestay_id: '',
    room_type_id: '',
    rate_type: '',
    is_active: ''
  });

  useEffect(() => {
    fetchRoomRates();
    fetchHomestays();
  }, [filters]);

  const fetchRoomRates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hms_token');
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const response = await fetch(`${API_BASE_URL}/api/room-rates?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomRates(data.data?.room_rates || []);
      }
    } catch (error) {
      console.error('Error fetching room rates:', error);
      toast.error('Failed to fetch room rates');
    } finally {
      setLoading(false);
    }
  };

  const fetchHomestays = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/homestays`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHomestays(data.homestays || []);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const fetchRoomTypes = async (homestayId) => {
    if (!homestayId) {
      setRoomTypes([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/homestays/${homestayId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data.homestay?.room_types || []);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
      setRoomTypes([]);
    }
  };

  const deleteRoomRate = async (rateId) => {
    if (!confirm('Are you sure you want to delete this room rate?')) return;
    
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/room-rates/${rateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Room rate deleted successfully');
        fetchRoomRates();
      } else {
        toast.error('Failed to delete room rate');
      }
    } catch (error) {
      console.error('Error deleting room rate:', error);
      toast.error('Failed to delete room rate');
    }
  };

  const toggleRateActive = async (rateId) => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/room-rates/${rateId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Room rate status updated successfully');
        fetchRoomRates();
      } else {
        toast.error('Failed to update room rate status');
      }
    } catch (error) {
      console.error('Error toggling room rate status:', error);
      toast.error('Failed to update room rate status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (key === 'homestay_id') {
      fetchRoomTypes(value);
      setFilters(prev => ({ ...prev, room_type_id: '' }));
    }
  };

  const getRateTypeColor = (rateType) => {
    switch (rateType) {
      case 'base':
        return 'bg-blue-100 text-blue-800';
      case 'seasonal':
        return 'bg-green-100 text-green-800';
      case 'weekend':
        return 'bg-purple-100 text-purple-800';
      case 'holiday':
        return 'bg-yellow-100 text-yellow-800';
      case 'promotional':
        return 'bg-red-100 text-red-800';
      case 'last_minute':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary-600" />
            Room Rates Management
          </h1>
          <p className="text-gray-600 mt-1">Set base and seasonal pricing for rooms</p>
        </div>
        <button
          onClick={() => {
            setEditingRate(null);
            setShowCreateModal(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Room Rate
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.homestay_id}
            onChange={(e) => handleFilterChange('homestay_id', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Homestays</option>
            {homestays.map(homestay => (
              <option key={homestay.homestay_id} value={homestay.homestay_id}>
                {homestay.name}
              </option>
            ))}
          </select>

          <select
            value={filters.room_type_id}
            onChange={(e) => handleFilterChange('room_type_id', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            disabled={!filters.homestay_id}
          >
            <option value="">All Room Types</option>
            {roomTypes.map(type => (
              <option key={type.room_type_id} value={type.room_type_id}>
                {type.name}
              </option>
            ))}
          </select>

          <select
            value={filters.rate_type}
            onChange={(e) => handleFilterChange('rate_type', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Rate Types</option>
            <option value="base">Base</option>
            <option value="seasonal">Seasonal</option>
            <option value="weekend">Weekend</option>
            <option value="holiday">Holiday</option>
            <option value="promotional">Promotional</option>
            <option value="last_minute">Last Minute</option>
          </select>

          <select
            value={filters.is_active}
            onChange={(e) => handleFilterChange('is_active', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Room Rates List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading room rates...</p>
          </div>
        ) : roomRates.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Room Rates Found</h3>
            <p className="text-gray-600 mb-4">Start by creating your first room rate.</p>
            <button
              onClick={() => {
                setEditingRate(null);
                setShowCreateModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add First Room Rate
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price & Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roomRates.map((rate) => (
                  <tr key={rate.rate_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{rate.rate_name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRateTypeColor(rate.rate_type)}`}>
                            {rate.rate_type}
                          </span>
                          <span className="text-xs text-gray-500">Priority: {rate.priority}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{rate.homestay_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Bed className="h-4 w-4" />
                          <span className="truncate">{rate.room_type_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-green-600">
                          {rate.price_per_night.toLocaleString()} RWF/night
                        </div>
                        {rate.discount_percentage > 0 && (
                          <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                            <Percent className="h-3 w-3" />
                            <span>{rate.discount_percentage}% discount</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Base: {rate.base_price.toLocaleString()} RWF
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(rate.start_date)} - {formatDate(rate.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{rate.min_nights} - {rate.max_nights || '∞'} nights</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRateActive(rate.rate_id)}
                        className="flex items-center gap-2"
                      >
                        {rate.is_active ? (
                          <>
                            <ToggleRight className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingRate(rate);
                            setShowCreateModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteRoomRate(rate.rate_id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateRateModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRate(null);
          }}
          rate={editingRate}
          homestays={homestays}
          onSuccess={() => {
            fetchRoomRates();
            setShowCreateModal(false);
            setEditingRate(null);
          }}
        />
      )}
    </div>
  );
};

const CreateRateModal = ({ isOpen, onClose, rate = null, homestays, onSuccess }) => {
  const [formData, setFormData] = useState({
    homestay_id: '',
    room_type_id: '',
    rate_name: '',
    rate_type: 'base',
    price_per_night: '',
    start_date: '',
    end_date: '',
    min_nights: '1',
    max_nights: '',
    days_of_week: '',
    discount_percentage: '0',
    is_active: true,
    priority: '0'
  });
  const [roomTypes, setRoomTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (rate) {
        setFormData({
          homestay_id: rate.homestay_id || '',
          room_type_id: rate.room_type_id || '',
          rate_name: rate.rate_name || '',
          rate_type: rate.rate_type || 'base',
          price_per_night: rate.price_per_night || '',
          start_date: rate.start_date || '',
          end_date: rate.end_date || '',
          min_nights: rate.min_nights || '1',
          max_nights: rate.max_nights || '',
          days_of_week: rate.days_of_week || '',
          discount_percentage: rate.discount_percentage || '0',
          is_active: rate.is_active !== false,
          priority: rate.priority || '0'
        });
        if (rate.homestay_id) {
          fetchModalRoomTypes(rate.homestay_id);
        }
      } else {
        setFormData({
          homestay_id: '',
          room_type_id: '',
          rate_name: '',
          rate_type: 'base',
          price_per_night: '',
          start_date: '',
          end_date: '',
          min_nights: '1',
          max_nights: '',
          days_of_week: '',
          discount_percentage: '0',
          is_active: true,
          priority: '0'
        });
        setRoomTypes([]);
      }
    }
  }, [isOpen, rate]);

  const fetchModalRoomTypes = async (homestayId) => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/homestays/${homestayId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data.homestay?.room_types || []);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
      setRoomTypes([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'homestay_id') {
      fetchModalRoomTypes(value);
      setFormData(prev => ({ ...prev, room_type_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('hms_token');
      const url = rate 
        ? `${API_BASE_URL}/api/room-rates/${rate.rate_id}`
        : `${API_BASE_URL}/api/room-rates`;
      
      const method = rate ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        price_per_night: parseFloat(formData.price_per_night),
        min_nights: parseInt(formData.min_nights),
        max_nights: formData.max_nights ? parseInt(formData.max_nights) : null,
        discount_percentage: parseFloat(formData.discount_percentage),
        priority: parseInt(formData.priority)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(`Room rate ${rate ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${rate ? 'update' : 'create'} room rate`);
      }
    } catch (error) {
      console.error('Error saving room rate:', error);
      toast.error(`Failed to ${rate ? 'update' : 'create'} room rate`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {rate ? 'Edit Room Rate' : 'Add New Room Rate'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Homestay *
              </label>
              <select
                value={formData.homestay_id}
                onChange={(e) => handleInputChange('homestay_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                Room Type *
              </label>
              <select
                value={formData.room_type_id}
                onChange={(e) => handleInputChange('room_type_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={!formData.homestay_id}
                required
              >
                <option value="">Select Room Type</option>
                {roomTypes.map(type => (
                  <option key={type.room_type_id} value={type.room_type_id}>
                    {type.name} (Base: {type.price} RWF)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate Name *
              </label>
              <input
                type="text"
                value={formData.rate_name}
                onChange={(e) => handleInputChange('rate_name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., Summer 2024, Weekend Rate"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate Type *
              </label>
              <select
                value={formData.rate_type}
                onChange={(e) => handleInputChange('rate_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="base">Base</option>
                <option value="seasonal">Seasonal</option>
                <option value="weekend">Weekend</option>
                <option value="holiday">Holiday</option>
                <option value="promotional">Promotional</option>
                <option value="last_minute">Last Minute</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Night (RWF) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_night}
                onChange={(e) => handleInputChange('price_per_night', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.discount_percentage}
                onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Nights *
              </label>
              <input
                type="number"
                min="1"
                value={formData.min_nights}
                onChange={(e) => handleInputChange('min_nights', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Nights
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_nights}
                onChange={(e) => handleInputChange('max_nights', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="No limit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days of Week (optional)
            </label>
            <input
              type="text"
              value={formData.days_of_week}
              onChange={(e) => handleInputChange('days_of_week', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., MON,TUE,WED,THU,FRI for weekdays"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated days: MON,TUE,WED,THU,FRI,SAT,SUN
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active rate
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (rate ? 'Update Rate' : 'Create Rate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};