import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Mail, 
  Bed,
  UtensilsCrossed,
  Wifi,
  Car,
  Heart,
  Shield,
  Coffee,
  Waves,
  Dumbbell,
  Edit,
  Calendar
} from 'lucide-react';

export const HomestayDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchHomestayDetails();
  }, [id]);

  const fetchHomestayDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/homestays/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHomestay(data.homestay);
      } else {
        console.error('Failed to fetch homestay details');
      }
    } catch (error) {
      console.error('Error fetching homestay details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenityKey) => {
    const iconMap = {
      free_wifi: Wifi,
      parking_available: Car,
      pet_friendly: Heart,
      swimming_pool: Waves,
      spa: Shield,
      fitness_center: Dumbbell,
      restaurant: UtensilsCrossed,
      bar_lounge: Coffee,
      room_service: Bed,
      breakfast_included: Coffee
    };
    return iconMap[amenityKey] || Shield;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Homestay not found</h2>
          <p className="text-gray-600 mb-4">The homestay you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/hotels/homestays')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Homestays
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/hotels/homestays')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Homestays
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{homestay.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {homestay.location}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium">{homestay.star_rating}</span>
              </div>
              <button
                onClick={() => navigate(`/hotels/homestays/${id}/stay-view`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Stay View
              </button>
              <button
                onClick={() => navigate(`/hotels/homestays/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                {homestay.images && homestay.images.length > 0 ? (
                  <>
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/${homestay.images[activeImageIndex]?.image_path}`}
                      alt={homestay.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {homestay.images.length > 1 && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex gap-2 overflow-x-auto">
                          {homestay.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveImageIndex(index)}
                              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 ${
                                index === activeImageIndex ? 'border-white' : 'border-transparent'
                              }`}
                            >
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/${image.image_path}`}
                                alt={`${homestay.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgN1YxN0MyMSAxN0MyMSAxNiAyMSAxNSAyMSAxNFY3SDNaIiBzdHJva2U9IiM5Q0E3QjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik04IDEyTDEwIDEwTDEzIDEzTDE2IDEwTDE5IDEzIiBzdHJva2U9IiM5Q0E3QjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this homestay</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{homestay.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">{homestay.total_rooms}</div>
                  <div className="text-xs text-gray-600">Total Rooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">{homestay.check_in_time}</div>
                  <div className="text-xs text-gray-600">Check-in</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">{homestay.check_out_time}</div>
                  <div className="text-xs text-gray-600">Check-out</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2 fill-current" />
                  <div className="text-sm font-medium text-gray-900">{homestay.star_rating}</div>
                  <div className="text-xs text-gray-600">Star Rating</div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {homestay.amenities && Object.keys(homestay.amenities).filter(key => homestay.amenities[key]).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(homestay.amenities || {})
                    .filter(([key, value]) => value)
                    .map(([key, value]) => {
                      const IconComponent = getAmenityIcon(key);
                      return (
                        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary-600" />
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {homestay.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{homestay.phone}</span>
                  </div>
                )}
                {homestay.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{homestay.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{homestay.location}</span>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies</h3>
              <div className="space-y-4">
                {homestay.cancellation_policy && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Cancellation Policy</h4>
                    <p className="text-sm text-gray-600">{homestay.cancellation_policy}</p>
                  </div>
                )}
                {homestay.child_policy && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Child Policy</h4>
                    <p className="text-sm text-gray-600">{homestay.child_policy}</p>
                  </div>
                )}
                {homestay.pet_policy && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Pet Policy</h4>
                    <p className="text-sm text-gray-600">{homestay.pet_policy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  homestay.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : homestay.status === 'inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {homestay.status}
                </span>
              </div>
              {homestay.created_at && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(homestay.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};