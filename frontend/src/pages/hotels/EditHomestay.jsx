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
  Save,
  Wifi,
  Car,
  Heart,
  Shield,
  Coffee,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Bed,
  Users
} from 'lucide-react';
import { PhoneInput } from '../../components/common/PhoneInput';

export const EditHomestay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [homestay, setHomestay] = useState({
    name: '',
    description: '',
    location: '',
    star_rating: 3,
    check_in_time: '14:00',
    check_out_time: '11:00',
    phone: '',
    email: '',
    cancellation_policy: '',
    child_policy: '',
    pet_policy: '',
    amenities: {}
  });

  const amenitiesList = [
    { key: 'free_wifi', label: 'Free WiFi', icon: Wifi },
    { key: 'parking_available', label: 'Parking Available', icon: Car },
    { key: 'pet_friendly', label: 'Pet Friendly', icon: Heart },
    { key: 'swimming_pool', label: 'Swimming Pool', icon: Waves },
    { key: 'spa', label: 'Spa Services', icon: Shield },
    { key: 'fitness_center', label: 'Fitness Center', icon: Dumbbell },
    { key: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
    { key: 'bar_lounge', label: 'Bar/Lounge', icon: Coffee },
    { key: 'air_conditioning', label: 'Air Conditioning', icon: Shield },
    { key: 'room_service', label: 'Room Service', icon: Bed },
    { key: 'laundry_service', label: 'Laundry Service', icon: Shield },
    { key: 'airport_shuttle', label: 'Airport Shuttle', icon: Car },
    { key: 'family_rooms', label: 'Family Rooms', icon: Users },
    { key: 'non_smoking_rooms', label: 'Non-Smoking Rooms', icon: Shield },
    { key: 'breakfast_included', label: 'Breakfast Included', icon: Coffee },
    { key: 'kitchen_facilities', label: 'Kitchen Facilities', icon: UtensilsCrossed },
    { key: 'balcony', label: 'Balcony', icon: Building },
    { key: 'ocean_view', label: 'Ocean View', icon: Shield },
    { key: 'garden_view', label: 'Garden View', icon: Shield },
    { key: 'wheelchair_accessible', label: 'Wheelchair Accessible', icon: Shield },
    { key: 'meeting_rooms', label: 'Meeting Rooms', icon: Building },
    { key: 'conference_facilities', label: 'Conference Facilities', icon: Building },
    { key: 'security_24h', label: '24/7 Security', icon: Shield }
  ];

  useEffect(() => {
    fetchHomestay();
  }, [id]);

  const fetchHomestay = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/homestays/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const homestayData = data.homestay;
        setHomestay({
          name: homestayData.name || '',
          description: homestayData.description || '',
          location: homestayData.location || '',
          star_rating: homestayData.star_rating || 3,
          check_in_time: homestayData.check_in_time || '14:00',
          check_out_time: homestayData.check_out_time || '11:00',
          phone: homestayData.phone || '',
          email: homestayData.email || '',
          cancellation_policy: homestayData.cancellation_policy || '',
          child_policy: homestayData.child_policy || '',
          pet_policy: homestayData.pet_policy || '',
          amenities: homestayData.amenities || {}
        });
      } else {
        console.error('Failed to fetch homestay');
        navigate('/hotels/homestays');
      }
    } catch (error) {
      console.error('Error fetching homestay:', error);
      navigate('/hotels/homestays');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setHomestay(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityChange = (amenityKey, value) => {
    setHomestay(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenityKey]: value
      }
    }));
  };

  const handlePhoneChange = (phoneValue) => {
    setHomestay(prev => ({
      ...prev,
      phone: phoneValue
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/homestays/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
        },
        body: JSON.stringify(homestay)
      });

      if (response.ok) {
        alert('Homestay updated successfully!');
        navigate(`/hotels/homestays/${id}`);
      } else {
        const error = await response.json();
        alert('Error updating homestay: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating homestay:', error);
      alert('Error updating homestay: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/hotels/homestays/${id}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Details
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Edit Homestay</h1>
                  <p className="text-sm text-gray-600">Update basic homestay information</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Homestay Name *
                </label>
                <input
                  type="text"
                  value={homestay.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter homestay name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  value={homestay.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter full address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={homestay.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your homestay..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star className="inline h-4 w-4 mr-1" />
                  Star Rating
                </label>
                <select
                  value={homestay.star_rating}
                  onChange={(e) => handleInputChange('star_rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5].map(star => (
                    <option key={star} value={star}>{star} Star{star !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
               
                <PhoneInput
                  value={homestay.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={homestay.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Check-in Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={homestay.check_in_time}
                  onChange={(e) => handleInputChange('check_in_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Check-out Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={homestay.check_out_time}
                  onChange={(e) => handleInputChange('check_out_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Policies */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <textarea
                    value={homestay.cancellation_policy}
                    onChange={(e) => handleInputChange('cancellation_policy', e.target.value)}
                    placeholder="Describe your cancellation policy..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child Policy
                  </label>
                  <textarea
                    value={homestay.child_policy}
                    onChange={(e) => handleInputChange('child_policy', e.target.value)}
                    placeholder="Describe your child policy..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Policy
                  </label>
                  <textarea
                    value={homestay.pet_policy}
                    onChange={(e) => handleInputChange('pet_policy', e.target.value)}
                    placeholder="Describe your pet policy..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenitiesList.map(({ key, label }) => (
                  <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={homestay.amenities[key] || false}
                      onChange={(e) => handleAmenityChange(key, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
