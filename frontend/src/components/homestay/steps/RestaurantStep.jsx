import React from 'react';
import { 
  UtensilsCrossed, 
  Clock, 
  Mail, 
  FileText,
  ChefHat
} from 'lucide-react';
import { PhoneInput } from '../../common/PhoneInput';
import { ImageUpload } from '../../common/ImageUpload';

export const RestaurantStep = ({ data, onUpdate, restaurantImages, onRestaurantImagesChange }) => {
  const cuisineTypes = [
    'International',
    'African',
    'Rwandan',
    'Continental',
    'Chinese',
    'Indian',
    'Italian',
    'French',
    'American',
    'Mediterranean',
    'Vegetarian',
    'Vegan',
    'Seafood',
    'BBQ',
    'Fast Food',
    'Other'
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Restaurant Setup</h3>
        
        {/* Restaurant Option */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <input
              type="checkbox"
              id="has_restaurant"
              checked={data.has_restaurant}
              onChange={(e) => onUpdate('has_restaurant', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="has_restaurant" className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <UtensilsCrossed className="h-5 w-5 text-primary-600" />
              This homestay has a restaurant
            </label>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Check this option if your homestay includes dining services or an on-site restaurant.
          </p>
        </div>

        {data.has_restaurant && (
          <div className="space-y-6">
            {/* Restaurant Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => onUpdate('name', e.target.value)}
                  placeholder="Enter restaurant name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ChefHat className="inline h-4 w-4 mr-1" />
                  Cuisine Type
                </label>
                <select
                  value={data.cuisine_type}
                  onChange={(e) => onUpdate('cuisine_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select cuisine type</option>
                  {cuisineTypes.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Restaurant Email
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => onUpdate('email', e.target.value)}
                  placeholder="restaurant@homestay.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Opening Time
                </label>
                <input
                  type="time"
                  value={data.opening_time}
                  onChange={(e) => onUpdate('opening_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Closing Time
                </label>
                <input
                  type="time"
                  value={data.closing_time}
                  onChange={(e) => onUpdate('closing_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <PhoneInput
                  value={data.contact_number}
                  onChange={(value) => onUpdate('contact_number', value)}
                  placeholder="123 456 789"
                  label="Restaurant Contact Number"
                />
              </div>
            </div>

            {/* Restaurant Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Restaurant Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => onUpdate('description', e.target.value)}
                placeholder="Describe your restaurant, specialties, dining atmosphere, and unique features..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Restaurant Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Images
              </label>
              <p className="text-sm text-gray-600 mb-3">Add photos of your restaurant, dining area, and ambiance</p>
              <ImageUpload
                images={restaurantImages || []}
                onImagesChange={onRestaurantImagesChange}
                maxImages={15}
                acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
              />
            </div>

            {/* Operating Hours Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-blue-900 mb-2">Operating Hours Preview</h5>
              <p className="text-sm text-blue-800">
                {data.opening_time && data.closing_time ? (
                  <>Open daily from {data.opening_time} to {data.closing_time}</>
                ) : (
                  'Set opening and closing times to preview operating hours'
                )}
              </p>
            </div>
          </div>
        )}

        {!data.has_restaurant && (
          <div className="text-center py-12 text-gray-500">
            <UtensilsCrossed className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No restaurant selected</p>
            <p className="text-sm">Check the option above if your homestay includes dining services.</p>
          </div>
        )}
      </div>
    </div>
  );
};