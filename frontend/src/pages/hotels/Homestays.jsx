import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Search, Filter, Edit, Eye, Trash2, Home, AlertCircle, X } from 'lucide-react';

export const Homestays = () => {
  const navigate = useNavigate();
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    homestayId: null,
    homestayName: null,
    relatedRooms: [],
    hasRelatedRooms: false,
    totalRooms: 0,
    isDeleting: false
  });

  useEffect(() => {
    fetchHomestays();
  }, []);

  const fetchHomestays = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/homestays', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHomestays(data.homestays || []);
      } else {
        setHomestays([]);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
      setHomestays([]);
    } finally {
      setLoading(false);
    }
  };

  // Check for dependencies before showing delete modal
  const handleDeleteClick = async (homestayId, homestayName) => {
    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      
      const response = await fetch(`/api/homestays/${homestayId}/check-dependencies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Show modal with information about related rooms
        setDeleteModal({
          isOpen: true,
          homestayId,
          homestayName: data.homestayName,
          relatedRooms: data.relatedRooms || [],
          hasRelatedRooms: data.hasRelatedRooms || false,
          totalRooms: data.totalRooms || 0,
          isDeleting: false
        });
      } else {
        alert('Error checking homestay: ' + (data.message || 'Unknown error'));
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('Error checking homestay:', error);
      alert('Error checking homestay: ' + error.message);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));

      const response = await fetch(`/api/homestays/${deleteModal.homestayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmed: deleteModal.hasRelatedRooms // Only needed if there are related rooms
        })
      });

      if (response.ok) {
        // Remove the deleted homestay from the list
        setHomestays(prev => prev.filter(h => h.homestay_id !== deleteModal.homestayId));
        setDeleteModal({
          isOpen: false,
          homestayId: null,
          homestayName: null,
          relatedRooms: [],
          hasRelatedRooms: false,
          totalRooms: 0,
          isDeleting: false
        });
        alert('Homestay and all related properties deleted successfully');
      } else {
        const error = await response.json();
        alert('Error deleting homestay: ' + (error.message || 'Unknown error'));
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('Error deleting homestay:', error);
      alert('Error deleting homestay: ' + error.message);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        homestayId: null,
        homestayName: null,
        relatedRooms: [],
        hasRelatedRooms: false,
        totalRooms: 0,
        isDeleting: false
      });
    }
  };



  const filteredHomestays = homestays.filter(homestay =>
    homestay.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    homestay.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Home className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No homestays found</h3>
      <p className="text-gray-600 mb-6">
        Get started by creating your first homestay property. You can add rooms and restaurant all in one go!
      </p>
      <button
        onClick={() => navigate('/hotels/homestays/create')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Plus className="h-5 w-5" />
        Create Your First Homestay
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="h-7 w-7 text-primary-600" />
            Homestays Management
          </h1>
          <p className="text-gray-600 mt-1">Create and manage homestay properties</p>
        </div>
        {homestays.length === 0 && (
          <button 
            onClick={() => navigate('/hotels/homestays/create')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Homestay
          </button>
        )}
      </div>

      {homestays.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EmptyState />
        </div>
      ) : (
        <>
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search homestays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Homestays List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Homestays ({filteredHomestays.length})
              </h2>
            </div>
            
            {filteredHomestays.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No homestays match your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Homestay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Rooms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
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
                    {filteredHomestays.map((homestay) => (
                      <tr key={homestay.homestay_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                <Building className="h-5 w-5 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{homestay.name}</div>
                              <div className="text-sm text-gray-500">{homestay.description?.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {homestay.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {homestay.total_rooms}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1">{homestay.star_rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            homestay.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : homestay.status === 'inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {homestay.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => navigate(`/hotels/homestays/${homestay.homestay_id}`)}
                              className="text-gray-600 hover:text-primary-600 p-1 rounded transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => navigate(`/hotels/homestays/${homestay.homestay_id}/edit`)}
                              className="text-gray-600 hover:text-primary-600 p-1 rounded transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(homestay.homestay_id, homestay.name)}
                              className="text-gray-600 hover:text-red-600 p-1 rounded transition-colors"
                              disabled={deleteModal.isDeleting}
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Homestay</h3>
              </div>
              <button
                onClick={closeDeleteModal}
                disabled={deleteModal.isDeleting}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-900 font-medium mb-1">
                  Are you sure you want to delete "<span className="font-bold">{deleteModal.homestayName}</span>"?
                </p>
                <p className="text-gray-600 text-sm">
                  This action cannot be undone.
                </p>
              </div>

              {deleteModal.hasRelatedRooms && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Properties will also be deleted:
                  </p>
                  <div className="space-y-1 mb-3">
                    {deleteModal.relatedRooms.map((room, idx) => (
                      <div key={idx} className="text-sm text-red-800 flex justify-between">
                        <span>{room.type_name}</span>
                        <span className="text-red-600 font-medium">
                          {room.total_rooms} {room.total_rooms == 1 ? 'room' : 'rooms'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-red-700 font-medium border-t border-red-200 pt-2 mt-2">
                    Total: {deleteModal.totalRooms} {deleteModal.totalRooms == 1 ? 'property' : 'properties'} will be permanently deleted
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeDeleteModal}
                disabled={deleteModal.isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteModal.isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {deleteModal.isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};