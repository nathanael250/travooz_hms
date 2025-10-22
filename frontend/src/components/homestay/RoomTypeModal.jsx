import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2,
  Plus,
  Minus,
  Package,
  Coffee,
  Shirt,
  ShoppingBag,
  Wind,
  Thermometer,
  Fan,
  Wifi,
  Tv,
  Speaker,
  Phone,
  Zap,
  Plug,
  Briefcase,
  Bath,
  ShirtIcon,
  Footprints,
  Sparkles,
  Scissors,
  Lamp,
  AlarmClock
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const RoomTypeModal = ({ isOpen, onClose, homestayId, homestayName, roomType, onRoomTypeCreated }) => {
  const [formData, setFormData] = useState({
    type_name: '',
    description: '',
    price: '',
    max_guests: '',
    size: '',
    included: '',
    room_count: ''
  });
  const [amenities, setAmenities] = useState({});
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inventoryMode, setInventoryMode] = useState('automatic'); // 'manual' or 'automatic'
  const [inventorySubMode, setInventorySubMode] = useState('default'); // 'default' or 'custom_start'
  const [customStartNumber, setCustomStartNumber] = useState('');
  const [manualRooms, setManualRooms] = useState([]);
  const [showInventorySection, setShowInventorySection] = useState(false);

  // Room type options
  const ROOM_TYPES = [
    'Single Room',
    'Double Room',
    'Twin Room',
    'Triple Room',
    'Deluxe Room',
    'Superior Room',
    'Executive Room',
    'Family Room',
    'Junior Suite',
    'Executive Suite',
    'Presidential Suite',
    'Studio Room',
    'Villa',
    'Bungalow',
    'Honeymoon Suite',
    'Accessible Room'
  ];

  // Populate form when editing
  useEffect(() => {
    if (roomType) {
      setFormData({
        type_name: roomType.name || '',
        description: roomType.description || '',
        price: roomType.price || '',
        max_guests: roomType.max_people || '',
        size: roomType.size_sqm || '',
        included: roomType.included || '',
        room_count: roomType.room_count || ''
      });
      setAmenities(roomType.amenities || {});
      setExistingImages(roomType.images || []);
    } else {
      resetForm();
    }
  }, [roomType, isOpen]);

  const roomAmenities = [
    { key: 'minibar', label: 'Minibar', icon: Package },
    { key: 'tea_coffee_facilities', label: 'Tea/Coffee', icon: Coffee },
    { key: 'wardrobe_hangers', label: 'Wardrobe', icon: Shirt },
    { key: 'luggage_rack', label: 'Luggage Rack', icon: ShoppingBag },
    { key: 'safe', label: 'Safe', icon: Package },
    { key: 'air_conditioner', label: 'AC', icon: Wind },
    { key: 'heater', label: 'Heater', icon: Thermometer },
    { key: 'fan', label: 'Fan', icon: Fan },
    { key: 'wifi', label: 'WiFi', icon: Wifi },
    { key: 'tv', label: 'TV', icon: Tv },
    { key: 'speaker', label: 'Speaker', icon: Speaker },
    { key: 'phone', label: 'Phone', icon: Phone },
    { key: 'usb_charging_points', label: 'USB Charging', icon: Zap },
    { key: 'power_adapters', label: 'Power Adapters', icon: Plug },
    { key: 'desk_workspace', label: 'Desk/Workspace', icon: Briefcase },
    { key: 'iron_ironing_board', label: 'Iron/Board', icon: Shirt },
    { key: 'hairdryer', label: 'Hair Dryer', icon: Wind },
    { key: 'towels', label: 'Towels', icon: Bath },
    { key: 'bathrobes', label: 'Bathrobes', icon: ShirtIcon },
    { key: 'slippers', label: 'Slippers', icon: Footprints },
    { key: 'toiletries', label: 'Toiletries', icon: Sparkles },
    { key: 'teeth_shaving_kits', label: 'Shaving Kits', icon: Scissors },
    { key: 'table_lamps', label: 'Table Lamps', icon: Lamp },
    { key: 'bedside_lamps', label: 'Bedside Lamps', icon: Lamp },
    { key: 'alarm_clock', label: 'Alarm Clock', icon: AlarmClock },
    { key: 'laundry_bag', label: 'Laundry Bag', icon: ShoppingBag }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (key) => {
    setAmenities(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const getGeneratedRoomNumbers = () => {
    const count = parseInt(formData.room_count) || 0;
    if (inventorySubMode === 'custom_start' && customStartNumber) {
      const start = parseInt(customStartNumber) || 1;
      return Array.from({ length: count }, (_, i) => start + i);
    }
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  const addManualRoom = () => {
    setManualRooms(prev => [
      ...prev,
      { id: Date.now(), roomNumber: '', notes: '' }
    ]);
  };

  const updateManualRoom = (roomId, field, value) => {
    setManualRooms(prev =>
      prev.map(r =>
        r.id === roomId ? { ...r, [field]: value } : r
      )
    );
  };

  const removeManualRoom = (roomId) => {
    setManualRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type_name.trim()) {
      toast.error('Room type name is required');
      return;
    }

    if (showInventorySection && !formData.room_count) {
      toast.error('Please enter the number of rooms');
      return;
    }

    if (showInventorySection && inventoryMode === 'manual' && manualRooms.length !== parseInt(formData.room_count)) {
      toast.error(`Please enter details for all ${formData.room_count} rooms`);
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add amenities as JSON string
      formDataToSend.append('amenities', JSON.stringify(amenities));
      
      // Add inventory data if room count is specified
      if (showInventorySection && formData.room_count) {
        const inventoryData = {
          mode: inventoryMode,
          inventoryMode: inventorySubMode,
          startingNumber: customStartNumber,
          manualRooms: manualRooms
        };
        formDataToSend.append('inventory', JSON.stringify(inventoryData));
      }
      
      // Add images
      images.forEach((image, index) => {
        formDataToSend.append('room_images', image.file);
      });

      const token = localStorage.getItem('hms_token');
      const isEditing = !!roomType;
      const url = isEditing 
        ? `${API_BASE_URL}/api/homestays/${homestayId}/room-types/${roomType.room_type_id}`
        : `${API_BASE_URL}/api/homestays/${homestayId}/room-types`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(isEditing ? 'Room type updated successfully!' : 'Room type created successfully!');
        onRoomTypeCreated();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} room type`);
      }
    } catch (error) {
      console.error(`Error ${roomType ? 'updating' : 'creating'} room type:`, error);
      toast.error(`Failed to ${roomType ? 'update' : 'create'} room type`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type_name: '',
      description: '',
      price: '',
      max_guests: '',
      size: '',
      included: '',
      room_count: ''
    });
    setAmenities({});
    images.forEach(image => URL.revokeObjectURL(image.preview));
    setImages([]);
    setExistingImages([]);
    setInventoryMode('automatic');
    setInventorySubMode('default');
    setCustomStartNumber('');
    setManualRooms([]);
    setShowInventorySection(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {roomType ? 'Edit' : 'Add New'} Room Type - {homestayName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Room Type Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type Name *
            </label>
            <select
              name="type_name"
              value={formData.type_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Room Type --</option>
              {ROOM_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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
              placeholder="Describe the room type..."
            />
          </div>

          {/* Price and Max Guests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Night
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Guests
              </label>
              <input
                type="number"
                name="max_guests"
                value={formData.max_guests}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2"
                min="1"
              />
            </div>
          </div>

          {/* Size and What's Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size (sqm)
              </label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 25"
                min="0"
              />
            </div>
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
                placeholder="e.g., Breakfast, WiFi, Parking"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Room Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {roomAmenities.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={amenities[key] || false}
                    onChange={(e) => {
                      const currentValue = amenities[key] || false;
                      handleAmenityToggle(key);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Images (Max 5)
            </label>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="room-images"
              />
              <label htmlFor="room-images" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF up to 5MB each
                </p>
              </label>
            </div>

            {/* Existing Images (when editing) */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((image) => (
                    <div key={image.image_id} className="relative group">
                      <img
                        src={`${API_BASE_URL}/${image.image_path}`}
                        alt="Room"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">New Images to Upload:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt="Room preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Room Inventory Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Create Room Inventory (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowInventorySection(!showInventorySection)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showInventorySection ? 'Hide' : 'Show'}
              </button>
            </div>

            {showInventorySection && (
              <div className="bg-purple-50 rounded-lg p-6 space-y-4 border border-purple-200">
                {/* Room Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms in this Type
                  </label>
                  <input
                    type="number"
                    value={formData.room_count}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, room_count: e.target.value }));
                      setManualRooms([]); // Reset manual rooms when count changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5"
                    min="1"
                  />
                </div>

                {formData.room_count && (
                  <>
                    {/* Mode Selection */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">How would you like to create room inventory?</p>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={inventoryMode === 'automatic'}
                            onChange={() => {
                              setInventoryMode('automatic');
                              setManualRooms([]);
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Auto-generate</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={inventoryMode === 'manual'}
                            onChange={() => setInventoryMode('manual')}
                            className="w-4 h-4 text-primary-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Manual entry</span>
                        </label>
                      </div>
                    </div>

                    {/* Automatic Mode */}
                    {inventoryMode === 'automatic' && (
                      <div className="bg-blue-100 rounded-lg p-4 space-y-4 border border-blue-200">
                        <p className="text-sm font-medium text-gray-700">Auto-generation Options:</p>
                        <div className="flex gap-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              checked={inventorySubMode === 'default'}
                              onChange={() => {
                                setInventorySubMode('default');
                                setCustomStartNumber('');
                              }}
                              className="w-4 h-4 text-primary-600 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Default (1 to {formData.room_count})</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              checked={inventorySubMode === 'custom_start'}
                              onChange={() => setInventorySubMode('custom_start')}
                              className="w-4 h-4 text-primary-600 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Custom start number</span>
                          </label>
                        </div>

                        {inventorySubMode === 'custom_start' && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Starting Room Number
                            </label>
                            <input
                              type="number"
                              value={customStartNumber}
                              onChange={(e) => setCustomStartNumber(e.target.value)}
                              placeholder="e.g., 101"
                              min="1"
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            {customStartNumber && (
                              <p className="text-xs text-gray-600 mt-2">
                                Will generate: {getGeneratedRoomNumbers().join(', ')}
                              </p>
                            )}
                          </div>
                        )}

                        {inventorySubMode === 'default' && (
                          <p className="text-xs text-gray-600 mt-2">
                            Will generate rooms: {getGeneratedRoomNumbers().join(', ')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Manual Mode */}
                    {inventoryMode === 'manual' && (
                      <div className="bg-purple-100 rounded-lg p-4 space-y-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700">Enter Room Details</p>
                          <span className="text-xs text-gray-500">
                            {manualRooms.length} / {formData.room_count} rooms
                          </span>
                        </div>

                        {manualRooms.map((manualRoom) => (
                          <div key={manualRoom.id} className="flex gap-2">
                            <input
                              type="text"
                              value={manualRoom.roomNumber}
                              onChange={(e) => updateManualRoom(manualRoom.id, 'roomNumber', e.target.value)}
                              placeholder="Room ID (e.g., 101)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                            <input
                              type="text"
                              value={manualRoom.notes}
                              onChange={(e) => updateManualRoom(manualRoom.id, 'notes', e.target.value)}
                              placeholder="Optional notes"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeManualRoom(manualRoom.id)}
                              className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        {manualRooms.length < parseInt(formData.room_count) && (
                          <button
                            type="button"
                            onClick={addManualRoom}
                            className="flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-800 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                          >
                            <Plus className="h-4 w-4" />
                            Add Room
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading 
                ? (roomType ? 'Updating...' : 'Creating...') 
                : (roomType ? 'Update Room Type' : 'Create Room Type')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomTypeModal;