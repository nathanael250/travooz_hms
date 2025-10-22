import React from 'react';
import { 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Mail,
  FileText,
  Wifi,
  Car,
  Heart,
  Waves,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Coffee,
  Wind,
  Shirt,
  Plane,
  Users,
  Cigarette,
  ChefHat,
  ChefHat as Kitchen,
  Building2,
  Trees,
  Waves as Ocean,
  Accessibility,
  Presentation,
  Shield
} from 'lucide-react';
import { PhoneInput } from '../../common/PhoneInput';
import { ImageUpload } from '../../common/ImageUpload';
import { LocationSelector } from '../LocationSelector';
import { GoogleMapsPicker } from '../GoogleMapsPicker';

export const HomestayInfoStep = ({ data, onUpdateField, onUpdateAmenity, images, onImagesChange }) => {
  const amenities = [
    { key: 'free_wifi', label: 'Free WiFi', icon: Wifi },
    { key: 'parking_available', label: 'Parking Available', icon: Car },
    { key: 'pet_friendly', label: 'Pet Friendly', icon: Heart },
    { key: 'swimming_pool', label: 'Swimming Pool', icon: Waves },
    { key: 'spa', label: 'Spa', icon: Sparkles },
    { key: 'fitness_center', label: 'Fitness Center', icon: Dumbbell },
    { key: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
    { key: 'bar_lounge', label: 'Bar/Lounge', icon: Coffee },
    { key: 'air_conditioning', label: 'Air Conditioning', icon: Wind },
    { key: 'room_service', label: 'Room Service', icon: UtensilsCrossed },
    { key: 'laundry_service', label: 'Laundry Service', icon: Shirt },
    { key: 'airport_shuttle', label: 'Airport Shuttle', icon: Plane },
    { key: 'family_rooms', label: 'Family Rooms', icon: Users },
    { key: 'non_smoking_rooms', label: 'Non-Smoking Rooms', icon: Cigarette },
    { key: 'breakfast_included', label: 'Breakfast Included', icon: ChefHat },
    { key: 'kitchen_facilities', label: 'Kitchen Facilities', icon: Kitchen },
    { key: 'balcony', label: 'Balcony', icon: Building2 },
    { key: 'ocean_view', label: 'Ocean View', icon: Ocean },
    { key: 'garden_view', label: 'Garden View', icon: Trees },
    { key: 'wheelchair_accessible', label: 'Wheelchair Accessible', icon: Accessibility },
    { key: 'meeting_rooms', label: 'Meeting Rooms', icon: Presentation },
    { key: 'conference_facilities', label: 'Conference Facilities', icon: Presentation },
    { key: 'security_24h', label: '24h Security', icon: Shield }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Homestay Information</h3>
        
        {/* Basic Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Homestay Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Homestay Name *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onUpdateField('name', e.target.value)}
              placeholder="Enter homestay name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Location Selector */}
          <div className="md:col-span-2">
            <LocationSelector
              selectedLocationId={data.location_id}
              onLocationSelect={(location) => {
                onUpdateField('location_id', location.location_id);
                onUpdateField('location_name', location.location_name);
              }}
            />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="inline h-4 w-4 mr-1" />
              Star Rating
            </label>
            <select
              value={data.star_rating}
              onChange={(e) => onUpdateField('star_rating', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </div>

          {/* Check-in Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Check-in Time
            </label>
            <input
              type="time"
              value={data.check_in_time}
              onChange={(e) => onUpdateField('check_in_time', e.target.value)}
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
              value={data.check_out_time}
              onChange={(e) => onUpdateField('check_out_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <PhoneInput
              value={data.phone}
              onChange={(value) => onUpdateField('phone', value)}
              placeholder="123 456 789"
              label="Phone Number"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onUpdateField('email', e.target.value)}
              placeholder="contact@homestay.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onUpdateField('description', e.target.value)}
            placeholder="Describe your homestay, its unique features, and what makes it special..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Google Maps Location Picker */}
        <div className="mb-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
          <GoogleMapsPicker
            initialLat={data.latitude}
            initialLng={data.longitude}
            onLocationSelect={(location) => {
              onUpdateField('latitude', location.latitude);
              onUpdateField('longitude', location.longitude);
              onUpdateField('address', location.address);
            }}
          />
        </div>

        {/* Policies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Policy
            </label>
            <textarea
              value={data.cancellation_policy}
              onChange={(e) => onUpdateField('cancellation_policy', e.target.value)}
              placeholder="Free cancellation before 24 hours..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child Policy
            </label>
            <textarea
              value={data.child_policy}
              onChange={(e) => onUpdateField('child_policy', e.target.value)}
              placeholder="Children under 12 stay free..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet Policy
            </label>
            <textarea
              value={data.pet_policy}
              onChange={(e) => onUpdateField('pet_policy', e.target.value)}
              placeholder="Pets are welcome with prior notice..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <ImageUpload
            label="Homestay Images"
            name="homestay_images"
            images={images || []}
            onImagesChange={onImagesChange}
            maxImages={10}
            required={true}
          />
        </div>

        {/* Amenities */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Amenities & Facilities</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {amenities.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={data.amenities?.[key] || false}
                  onChange={() => {
                    try {
                      const currentValue = data.amenities?.[key] || false;
                      onUpdateAmenity(key, !currentValue);
                    } catch (error) {
                      console.error('Error in amenity change:', error);
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};