import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  RectangleStackIcon,
  StarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const RoomTypes = () => {
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

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
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (detailResponse.ok) {
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

  const RoomTypeCard = ({ roomType }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Room Type Images */}
      <div className="relative h-48 bg-gray-200">
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
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {roomType.images && roomType.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
            +{roomType.images.length - 1} more
          </div>
        )}
      </div>

      {/* Room Type Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3>
          <span className="text-lg font-bold text-green-600">
            RWF {roomType.price?.toLocaleString()}/night
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {roomType.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            Max {roomType.max_people} guests
          </div>
          {roomType.size_sqm && (
            <div className="flex items-center text-sm text-gray-500">
              <RectangleStackIcon className="h-4 w-4 mr-1" />
              {roomType.size_sqm} m²
            </div>
          )}
        </div>

        {/* Amenities Preview */}
        {roomType.amenities && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {Object.entries(roomType.amenities).slice(0, 6).map(([key, value]) => 
                value ? (
                  <span key={key} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ) : null
              ).filter(Boolean)}
            </div>
          </div>
        )}

        {roomType.included && (
          <div className="text-sm text-gray-600">
            <strong>Included:</strong> {roomType.included}
          </div>
        )}
      </div>
    </div>
  );

  const HomestayPanel = ({ homestay }) => (
    <div className="space-y-6">
      {/* Homestay Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{homestay.name}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPinIcon className="h-5 w-5 mr-2" />
              {homestay.location}
            </div>
            <p className="text-gray-700">{homestay.description}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              homestay.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {homestay.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Room Types Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Room Types</h3>
          <span className="text-sm text-gray-500">
            {homestay.roomTypes?.length || 0} room type(s)
          </span>
        </div>

        {homestay.roomTypes && homestay.roomTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homestay.roomTypes.map((roomType) => (
              <RoomTypeCard key={roomType.room_type_id} roomType={roomType} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No room types</h3>
            <p className="mt-1 text-sm text-gray-500">
              This homestay doesn't have any room types configured yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Types Management sdsd</h1>
          <p className="text-gray-600">
            Manage room types across all your homestays
          </p>
        </div>

        {homestays.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No homestays found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first homestay to start managing room types.
            </p>
          </div>
        ) : (
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
              {homestays.map((homestay, index) => (
                <Tab
                  key={homestay.homestay_id}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-700'
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    <span className="truncate">{homestay.name}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {homestay.roomTypes?.length || 0}
                    </span>
                  </div>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {homestays.map((homestay) => (
                <Tab.Panel
                  key={homestay.homestay_id}
                  className={classNames(
                    'rounded-xl bg-white p-6',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                  )}
                >
                  <HomestayPanel homestay={homestay} />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
    </div>
  );
};

export default RoomTypes;