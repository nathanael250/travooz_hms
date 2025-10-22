import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign,
  Users,
  LayoutGrid,
  Star,
  Image,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import RoomTypeModal from '../../components/homestay/RoomTypeModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ITEMS_PER_PAGE = 6;

export const RoomTypes = () => {
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHomestayId, setSelectedHomestayId] = useState(null);
  const [selectedHomestayName, setSelectedHomestayName] = useState('');
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [currentPages, setCurrentPages] = useState({});

  useEffect(() => {
    fetchHomestaysWithRoomTypes();
  }, []);

  const fetchHomestaysWithRoomTypes = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/homestays?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch homestays');
      }

      const data = await response.json();
      
      // For each homestay, fetch detailed information including room types
      const homestaysWithRoomTypes = await Promise.all(
        data.homestays.map(async (homestay) => {
          try {
            const detailResponse = await fetch(`${API_BASE_URL}/api/homestays/${homestay.homestay_id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('hms_token')}`,
                'Content-Type': 'application/json'
              }
            });            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return {
                ...homestay,
                roomTypes: detailData.homestay.room_types || []
              };
            }
            return {
              ...homestay,
              roomTypes: []
            };
          } catch (error) {
            console.error(`Error fetching details for homestay ${homestay.homestay_id}:`, error);
            return {
              ...homestay,
              roomTypes: []
            };
          }
        })
      );

      setHomestays(homestaysWithRoomTypes);
    } catch (error) {
      console.error('Error fetching homestays:', error);
      toast.error('Failed to load homestays');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoomType = (homestayId, homestayName) => {
    setSelectedHomestayId(homestayId);
    setSelectedHomestayName(homestayName);
    setEditingRoomType(null);
    setIsModalOpen(true);
  };

  const handleEditRoomType = (homestayId, homestayName, roomType) => {
    setSelectedHomestayId(homestayId);
    setSelectedHomestayName(homestayName);
    setEditingRoomType(roomType);
    setIsModalOpen(true);
  };

  const handleDeleteRoomType = async (homestayId, roomTypeId, roomTypeName) => {
    if (!window.confirm(`Are you sure you want to delete "${roomTypeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/homestays/${homestayId}/room-types/${roomTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete room type');
      }

      toast.success('Room type deleted successfully');
      fetchHomestaysWithRoomTypes();
    } catch (error) {
      console.error('Error deleting room type:', error);
      toast.error('Failed to delete room type');
    }
  };

  const handleRoomTypeCreated = () => {
    // Refresh the homestays data
    fetchHomestaysWithRoomTypes();
    setEditingRoomType(null);
  };

  const RoomTypeCard = ({ roomType, homestayId, homestayName }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Room Type Images */}
      <div className="relative h-32 bg-gray-200">
        {roomType.images && roomType.images.length > 0 ? (
          <img
            src={`${API_BASE_URL}/${roomType.images[0].image_path}`}
            alt={roomType.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {roomType.images && roomType.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
            +{roomType.images.length - 1} more
          </div>
        )}
      </div>

      {/* Room Type Details */}
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{roomType.name}</h3>
          <span className="text-sm font-bold text-green-600 whitespace-nowrap ml-2">
            RWF {roomType.price?.toLocaleString()}/night
          </span>
        </div>

        <p className="text-gray-600 text-xs mb-2 line-clamp-1">
          {roomType.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
          <div className="flex items-center text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            Max {roomType.max_people}
          </div>
          {roomType.size_sqm && (
            <div className="flex items-center text-gray-500">
              <LayoutGrid className="h-3 w-3 mr-1" />
              {roomType.size_sqm}m²
            </div>
          )}
        </div>

        {/* Amenities Preview */}
        {roomType.amenities && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-0.5">
              {Object.entries(roomType.amenities).slice(0, 3).map(([key, value]) => 
                value ? (
                  <span key={key} className="inline-block bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ) : null
              ).filter(Boolean)}
            </div>
          </div>
        )}

        {roomType.included && (
          <div className="text-xs text-gray-600 mb-2 line-clamp-1">
            <strong>Included:</strong> {roomType.included}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1.5 pt-2 border-t border-gray-200">
          <button
            onClick={() => handleEditRoomType(homestayId, homestayName, roomType)}
            className="flex-1 inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Edit className="h-3.5 w-3.5 mr-0.5" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteRoomType(homestayId, roomType.room_type_id, roomType.name)}
            className="flex-1 inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <Trash2 className="h-3.5 w-3.5 mr-0.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const HomestayPanel = ({ homestay }) => {
    const currentPage = currentPages[homestay.homestay_id] || 0;
    const totalPages = Math.ceil((homestay.roomTypes?.length || 0) / ITEMS_PER_PAGE);
    const startIdx = currentPage * ITEMS_PER_PAGE;
    const paginatedRooms = homestay.roomTypes?.slice(startIdx, startIdx + ITEMS_PER_PAGE) || [];

    const handlePrevPage = () => {
      setCurrentPages(prev => ({
        ...prev,
        [homestay.homestay_id]: Math.max(0, currentPage - 1)
      }));
    };

    const handleNextPage = () => {
      setCurrentPages(prev => ({
        ...prev,
        [homestay.homestay_id]: Math.min(totalPages - 1, currentPage + 1)
      }));
    };

    return (
    <div className="space-y-4">
      {/* Room Types Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Room Types</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {homestay.roomTypes?.length || 0} room type(s)
            </span>
            <button
              onClick={() => handleAddRoomType(homestay.homestay_id, homestay.name)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Room Type
            </button>
          </div>
        </div>

        {homestay.roomTypes && homestay.roomTypes.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedRooms.map((roomType) => (
                <RoomTypeCard 
                  key={roomType.room_type_id} 
                  roomType={roomType} 
                  homestayId={homestay.homestay_id}
                  homestayName={homestay.name}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPages(prev => ({ ...prev, [homestay.homestay_id]: i }))}
                      className={`w-8 h-8 rounded-md text-sm font-medium ${
                        currentPage === i
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No room types</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              This homestay doesn't have any room types configured yet.
            </p>
            <button
              onClick={() => handleAddRoomType(homestay.homestay_id, homestay.name)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Room Type
            </button>
          </div>
        )}
      </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex space-x-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-32"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Types</h1>
          <p className="text-gray-600">
            Manage your room types and inventory
          </p>
        </div>

        {homestays.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No homestays found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first homestay to start managing room types.
            </p>
          </div>
        ) : (
          <div>
            {homestays.map((homestay) => (
              <HomestayPanel key={homestay.homestay_id} homestay={homestay} />
            ))}
          </div>
        )}

        {/* Create/Edit Room Type Modal */}
        <RoomTypeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRoomType(null);
          }}
          homestayId={selectedHomestayId}
          homestayName={selectedHomestayName}
          roomType={editingRoomType}
          onRoomTypeCreated={handleRoomTypeCreated}
        />
      </div>
    </div>
  );
};

export default RoomTypes;