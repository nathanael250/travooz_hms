import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  User,
  Heart,
  Home,
  Bed,
  Utensils,
  Briefcase,
  Activity,
  Filter,
  Eye
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const UserFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [guests, setGuests] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterGuest, setFilterGuest] = useState('');
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    guest_id: '',
    favorite_type: 'homestay',
    reference_id: '',
    notes: ''
  });

  const favoriteTypes = [
    { value: 'homestay', label: 'Homestay', icon: Home },
    { value: 'room', label: 'Room', icon: Bed },
    { value: 'menu_item', label: 'Menu Item', icon: Utensils },
    { value: 'service', label: 'Service', icon: Briefcase },
    { value: 'activity', label: 'Activity', icon: Activity }
  ];

  useEffect(() => {
    fetchFavorites();
    fetchGuests();
    fetchHomestays();
    fetchStatistics();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user-favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const fetchHomestays = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/homestays`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHomestays(data);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user-favorites/summary/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user-favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchFavorites();
        fetchStatistics();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const handleDelete = async (favoriteId) => {
    if (!window.confirm('Are you sure you want to remove this favorite?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user-favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchFavorites();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting favorite:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      guest_id: '',
      favorite_type: 'homestay',
      reference_id: '',
      notes: ''
    });
  };

  const getTypeIcon = (type) => {
    const typeObj = favoriteTypes.find(t => t.value === type);
    if (!typeObj) return Home;
    return typeObj.icon;
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      homestay: 'bg-blue-100 text-blue-800',
      room: 'bg-purple-100 text-purple-800',
      menu_item: 'bg-orange-100 text-orange-800',
      service: 'bg-green-100 text-green-800',
      activity: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = 
      favorite.guest?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.reference_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      favorite.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || favorite.favorite_type === filterType;
    const matchesGuest = !filterGuest || favorite.guest_id === parseInt(filterGuest);
    
    return matchesSearch && matchesType && matchesGuest;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading favorites...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Favorites</h1>
        <p className="text-gray-600">Track guest preferences for personalized service</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Favorites</p>
                <p className="text-2xl font-bold">{statistics.total || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Homestays</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.homestays || 0}</p>
              </div>
              <Home className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rooms</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.rooms || 0}</p>
              </div>
              <Bed className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menu Items</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.menu_items || 0}</p>
              </div>
              <Utensils className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Services</p>
                <p className="text-2xl font-bold text-green-600">{statistics.services || 0}</p>
              </div>
              <Briefcase className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-pink-600">{statistics.activities || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {favoriteTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={filterGuest}
            onChange={(e) => setFilterGuest(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Guests</option>
            {Array.isArray(guests) && guests.map(guest => (
              <option key={guest.guest_id} value={guest.guest_id}>
                {guest.full_name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Favorite
          </button>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFavorites.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No favorites found
          </div>
        ) : (
          filteredFavorites.map((favorite) => {
            const IconComponent = getTypeIcon(favorite.favorite_type);
            return (
              <div key={favorite.favorite_id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(favorite.favorite_type)}`}>
                      {favoriteTypes.find(t => t.value === favorite.favorite_type)?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(favorite.favorite_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {favorite.guest?.full_name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-gray-700">
                      {favorite.reference_name || `ID: ${favorite.reference_id}`}
                    </span>
                  </div>
                </div>
                {favorite.notes && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {favorite.notes}
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-400">
                  Added {new Date(favorite.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Favorite</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest *
                  </label>
                  <select
                    value={formData.guest_id}
                    onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Guest</option>
                    {Array.isArray(guests) && guests.map(guest => (
                      <option key={guest.guest_id} value={guest.guest_id}>
                        {guest.full_name} - {guest.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favorite Type *
                  </label>
                  <select
                    value={formData.favorite_type}
                    onChange={(e) => setFormData({ ...formData, favorite_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {favoriteTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference ID *
                  </label>
                  <input
                    type="number"
                    value={formData.reference_id}
                    onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the ID of the item"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the ID of the {formData.favorite_type} being favorited
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Optional notes about this preference"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Favorite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFavorites;