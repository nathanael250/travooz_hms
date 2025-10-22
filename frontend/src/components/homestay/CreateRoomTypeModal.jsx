import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const CreateRoomTypeModal = ({ isOpen, onClose, homestayId, onRoomTypeCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    max_people: '',
    size_sqm: '',
    included: '',
    amenities: {
      wifi: false,
      tv: false,
      ac: false,
      heating: false,
      minibar: false,
      balcony: false,
      sea_view: false,
      mountain_view: false,
      garden_view: false,
      city_view: false,
      private_bathroom: false,
      shared_bathroom: false,
      hot_water: false,
      toiletries: false,
      towels: false,
      hairdryer: false,
      safe: false,
      work_desk: false,
      seating_area: false,
      wardrobe: false,
      blackout_curtains: false,
      soundproofing: false,
      daily_housekeeping: false,
      laundry_service: false
    }
  });

  const [roomImages, setRoomImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        setRoomImages(prev => [...prev, file]);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setRoomImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          formDataToSend.append('amenities', JSON.stringify(formData.amenities));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add room images
      roomImages.forEach((image, index) => {
        formDataToSend.append('roomImages', image);
      });

      const token = localStorage.getItem('hms_token');
      const response = await fetch(`${API_BASE_URL}/api/homestays/${homestayId}/room-types`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Room type created successfully!');
        onRoomTypeCreated();
        handleClose();
      } else {
        toast.error(data.message || 'Failed to create room type');
      }
    } catch (error) {
      console.error('Error creating room type:', error);
      toast.error('Failed to create room type');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      max_people: '',
      size_sqm: '',
      included: '',
      amenities: {
        wifi: false,
        tv: false,
        ac: false,
        heating: false,
        minibar: false,
        balcony: false,
        sea_view: false,
        mountain_view: false,
        garden_view: false,
        city_view: false,
        private_bathroom: false,
        shared_bathroom: false,
        hot_water: false,
        toiletries: false,
        towels: false,
        hairdryer: false,
        safe: false,
        work_desk: false,
        seating_area: false,
        wardrobe: false,
        blackout_curtains: false,
        soundproofing: false,
        daily_housekeeping: false,
        laundry_service: false
      }
    });
    setRoomImages([]);
    setImagePreviews([]);
    onClose();
  };

  const amenityCategories = {
    'Technology': ['wifi', 'tv'],
    'Climate': ['ac', 'heating'],
    'Amenities': ['minibar', 'balcony', 'safe'],
    'Views': ['sea_view', 'mountain_view', 'garden_view', 'city_view'],
    'Bathroom': ['private_bathroom', 'shared_bathroom', 'hot_water', 'toiletries', 'towels', 'hairdryer'],
    'Furniture': ['work_desk', 'seating_area', 'wardrobe'],
    'Comfort': ['blackout_curtains', 'soundproofing'],
    'Services': ['daily_housekeeping', 'laundry_service']
  };

  const formatAmenityName = (amenity) => {
    return amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create New Room Type
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Deluxe Double Room"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Night (RWF) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum People *
                      </label>
                      <input
                        type="number"
                        name="max_people"
                        value={formData.max_people}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size (m²)
                      </label>
                      <input
                        type="number"
                        name="size_sqm"
                        value={formData.size_sqm}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25.5"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe this room type..."
                    />
                  </div>

                  {/* What's Included */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's Included
                    </label>
                    <input
                      type="text"
                      name="included"
                      value={formData.included}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Breakfast, WiFi, Towels"
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Amenities
                    </label>
                    <div className="space-y-4">
                      {Object.entries(amenityCategories).map(([category, amenities]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">{category}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {amenities.map(amenity => (
                              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.amenities[amenity]}
                                  onChange={() => handleAmenityChange(amenity)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {formatAmenityName(amenity)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Images
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="room-images"
                      />
                      <label
                        htmlFor="room-images"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <span className="text-sm text-gray-600">
                          Click to upload room images
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          PNG, JPG up to 10MB each
                        </span>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={preview.id} className="relative">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Room Type'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateRoomTypeModal;