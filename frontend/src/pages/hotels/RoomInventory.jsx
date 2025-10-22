import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Building2, 
  Bed, 
  Users, 
  Edit3,
  Trash2,
  Search,
  Filter,
  MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const RoomInventory = () => {
  const [rooms, setRooms] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    homestay_id: '',
    room_type_id: '',
    status: '',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchHomestays();
    fetchRooms();
  }, []);

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

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hms_token');
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const response = await fetch(`${API_BASE_URL}/api/rooms?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.data?.rooms || []);
      } else {
        // If rooms endpoint doesn't exist, show empty state
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  useEffect(() => {
    fetchRoomTypes(filters.homestay_id);
  }, [filters.homestay_id]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      case 'out_of_order':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'cleaning':
        return 'Cleaning';
      case 'maintenance':
        return 'Maintenance';
      case 'out_of_order':
        return 'Out of Order';
      default:
        return 'Available';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Room deleted successfully');
        fetchRooms();
      } else {
        toast.error('Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const CreateRoomModal = ({ isOpen, onClose, room = null }) => {
    const [formData, setFormData] = useState({
      homestay_id: '',
      room_type_id: '',
      room_number: '',
      floor_number: '1',
      status: 'available',
      notes: ''
    });
    const [modalRoomTypes, setModalRoomTypes] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal opens or room changes
    useEffect(() => {
      if (isOpen) {
        if (room) {
          setFormData({
            homestay_id: room.homestay_id || '',
            room_type_id: room.room_type_id || '',
            room_number: room.room_number || '',
            floor_number: room.floor_number || '1',
            status: room.status || 'available',
            notes: room.notes || ''
          });
        } else {
          setFormData({
            homestay_id: '',
            room_type_id: '',
            room_number: '',
            floor_number: '1',
            status: 'available',
            notes: ''
          });
        }
        setModalRoomTypes([]);
      }
    }, [isOpen, room]);

    useEffect(() => {
      if (formData.homestay_id) {
        fetchModalRoomTypes(formData.homestay_id);
      } else {
        setModalRoomTypes([]);
      }
    }, [formData.homestay_id]);

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
          setModalRoomTypes(data.homestay?.room_types || []);
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
        setModalRoomTypes([]);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      
      try {
        const token = localStorage.getItem('hms_token');
        const url = room 
          ? `${API_BASE_URL}/api/rooms/${room.room_id}`
          : `${API_BASE_URL}/api/rooms`;
        
        const method = room ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          toast.success(`Room ${room ? 'updated' : 'created'} successfully`);
          fetchRooms();
          onClose();
        } else {
          const error = await response.json();
          toast.error(error.message || `Failed to ${room ? 'update' : 'create'} room`);
        }
      } catch (error) {
        console.error('Error saving room:', error);
        toast.error('Room creation/update will be available once the backend endpoints are set up');
      } finally {
        setSubmitting(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Homestay
              </label>
              <select
                value={formData.homestay_id}
                onChange={(e) => {
                  console.log('Homestay selected:', e.target.value);
                  setFormData(prev => ({ ...prev, homestay_id: e.target.value, room_type_id: '' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!room}
              >
                <option value="">Select Homestay ({homestays.length} available)</option>
                {homestays.map(homestay => (
                  <option key={homestay.homestay_id} value={homestay.homestay_id}>
                    {homestay.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <select
                value={formData.room_type_id}
                onChange={(e) => {
                  console.log('Room type selected:', e.target.value);
                  setFormData(prev => ({ ...prev, room_type_id: e.target.value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.homestay_id || !!room}
              >
                <option value="">Select Room Type ({modalRoomTypes.length} available)</option>
                {modalRoomTypes.map(roomType => (
                  <option key={roomType.room_type_id} value={roomType.room_type_id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, room_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="101"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <input
                  type="number"
                  value={formData.floor_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_order">Out of Order</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Optional notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-primary-600" />
            Room Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Manage physical rooms and link them to room types</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Homestay
            </label>
            <select
              value={filters.homestay_id}
              onChange={(e) => handleFilterChange('homestay_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Homestays</option>
              {homestays.map(homestay => (
                <option key={homestay.homestay_id} value={homestay.homestay_id}>
                  {homestay.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              value={filters.room_type_id}
              onChange={(e) => handleFilterChange('room_type_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!filters.homestay_id}
            >
              <option value="">All Room Types</option>
              {roomTypes.map(roomType => (
                <option key={roomType.room_type_id} value={roomType.room_type_id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_order">Out of Order</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Room number..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600 mb-4">
            {homestays.length === 0 
              ? "Create homestays first, then add room types, and finally create individual rooms."
              : "Start by creating individual rooms for your homestays and room types."
            }
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={homestays.length === 0}
          >
            <Plus className="h-4 w-4" />
            Add First Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div key={room.room_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bed className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Room {room.room_number}</h3>
                      <p className="text-sm text-gray-600">Floor {room.floor_number}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(room.status)}`}>
                    {getStatusDisplay(room.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{room.homestay_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bed className="h-4 w-4" />
                    <span className="truncate">{room.room_type_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Max {room.max_people} guests</span>
                  </div>
                  {room.size_sqm && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{room.size_sqm} sqm</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-bold text-sm">RWF</span>
                    <span className="font-semibold text-green-600">
                      {room.price_per_night ? `${room.price_per_night.toLocaleString()}/night` : 'Price not set'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingRoom(room);
                        setShowCreateModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteRoom(room.room_id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {room.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">{room.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateRoomModal 
        isOpen={showCreateModal} 
        onClose={() => {
          setShowCreateModal(false);
          setEditingRoom(null);
        }}
        room={editingRoom}
      />
    </div>
  );
};