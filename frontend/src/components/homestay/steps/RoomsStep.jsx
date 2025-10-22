import React, { useState } from 'react';
import { 
  Bed, 
  Plus, 
  Minus, 
  Users, 
  DollarSign,
  Square,
  Package,
  Wifi,
  Tv,
  Wind,
  Thermometer,
  Fan,
  Coffee,
  Speaker,
  Phone,
  Zap,
  Plug,
  Briefcase,
  Shirt,
  Bath,
  ShirtIcon,
  Footprints,
  Sparkles,
  Scissors,
  Lamp,
  AlarmClock,
  ShoppingBag,
  Hash,
  ChevronDown
} from 'lucide-react';
import { ImageUpload } from '../../common/ImageUpload';

export const RoomsStep = ({ 
  rooms, 
  onAddRoom, 
  onRemoveRoom, 
  onUpdateRoom, 
  onUpdateRoomAmenity, 
  roomImages, 
  onRoomImagesChange,
  onInventoryUpdate 
}) => {
  const [expandedRooms, setExpandedRooms] = useState(rooms.reduce((acc, _, idx) => ({...acc, [idx]: true}), {}));
  const [expandedSections, setExpandedSections] = useState(
    rooms.reduce((acc, _, idx) => ({
      ...acc,
      [idx]: { basic: true, images: false, amenities: false, inventory: false }
    }), {})
  );
  const [roomInventory, setRoomInventory] = useState({});
  
  // Initialize room inventory state when rooms change
  React.useEffect(() => {
    setRoomInventory(prev => {
      const updated = { ...prev };
      rooms.forEach((room, idx) => {
        if (!updated[idx]) {
          updated[idx] = {
            mode: 'automatic', // 'manual' or 'automatic'
            inventoryMode: 'default', // 'default' or 'custom_start'
            startingNumber: '',
            manualRooms: []
          };
        }
      });
      return updated;
    });
  }, [rooms]);

  // Notify parent of inventory updates
  React.useEffect(() => {
    if (onInventoryUpdate) {
      onInventoryUpdate(roomInventory);
    }
  }, [roomInventory, onInventoryUpdate]);

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

  const toggleRoomExpanded = (index) => {
    setExpandedRooms(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSection = (roomIdx, sectionName) => {
    setExpandedSections(prev => {
      const roomSections = prev[roomIdx] || { basic: false, images: false, amenities: false, inventory: false };
      return {
        ...prev,
        [roomIdx]: {
          basic: sectionName === 'basic' ? !roomSections.basic : false,
          images: sectionName === 'images' ? !roomSections.images : false,
          amenities: sectionName === 'amenities' ? !roomSections.amenities : false,
          inventory: sectionName === 'inventory' ? !roomSections.inventory : false
        }
      };
    });
  };

  const updateInventoryMode = (roomIdx, mode) => {
    setRoomInventory(prev => ({
      ...prev,
      [roomIdx]: { ...prev[roomIdx], mode }
    }));
  };

  const updateInventorySubMode = (roomIdx, inventoryMode) => {
    setRoomInventory(prev => ({
      ...prev,
      [roomIdx]: { ...prev[roomIdx], inventoryMode }
    }));
  };

  const updateStartingNumber = (roomIdx, startingNumber) => {
    setRoomInventory(prev => ({
      ...prev,
      [roomIdx]: { ...prev[roomIdx], startingNumber }
    }));
  };

  const addManualRoom = (roomIdx) => {
    setRoomInventory(prev => ({
      ...prev,
      [roomIdx]: {
        ...prev[roomIdx],
        manualRooms: [
          ...prev[roomIdx].manualRooms,
          { id: Date.now(), roomNumber: '', notes: '' }
        ]
      }
    }));
  };

  const updateManualRoom = (roomIdx, roomId, field, value) => {
    setRoomInventory(prev => ({
      ...prev,
      [roomIdx]: {
        ...prev[roomIdx],
        manualRooms: prev[roomIdx].manualRooms.map(r =>
          r.id === roomId ? { ...r, [field]: value } : r
        )
      }
    }));
  };

  const removeManualRoom = (roomIdx, roomId) => {
    setRoomInventory(prev => ({
      ...prev,
      [roomIdx]: {
        ...prev[roomIdx],
        manualRooms: prev[roomIdx].manualRooms.filter(r => r.id !== roomId)
      }
    }));
  };

  const getGeneratedRoomNumbers = (roomIdx) => {
    const inventory = roomInventory[roomIdx];
    const count = rooms[roomIdx]?.room_count || 0;
    
    if (inventory?.inventoryMode === 'custom_start' && inventory?.startingNumber) {
      const start = parseInt(inventory.startingNumber) || 1;
      return Array.from({ length: count }, (_, i) => start + i);
    }
    
    return Array.from({ length: count }, (_, i) => i + 1);
  };

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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Room Types</h3>
        <p className="text-gray-600 mt-1">Define different room categories and their amenities</p>
      </div>

      <div className="space-y-4">
        {rooms.map((room, index) => (
          <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* Expandable Header */}
            <div
              onClick={() => toggleRoomExpanded(index)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left flex-1">
                <Bed className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {room.name || `Room Type ${index + 1}`}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {room.name && `${room.room_count || 1} unit${(room.room_count || 1) > 1 ? 's' : ''} • €${room.price || '0'}/night`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {rooms.length > 1 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRoom(index);
                    }}
                    className="flex items-center gap-2 px-3 py-1 text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </div>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform flex-shrink-0 ${expandedRooms[index] ? 'transform rotate-180' : ''}`}
                />
              </div>
            </div>

            {/* Expandable Content */}
            {expandedRooms[index] && (
              <div className="border-t border-gray-200">
                {/* Section 1: Basic Information */}
                <div className="border-b border-gray-200 border-l-4 border-l-blue-200">
                  <button
                    onClick={() => toggleSection(index, 'basic')}
                    className="w-full flex items-center justify-between px-4 py-4 pl-8 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Basic Information</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-600 transition-transform ${
                        expandedSections[index]?.basic ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedSections[index]?.basic && (
                    <div className="p-6 bg-blue-50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Bed className="inline h-4 w-4 mr-1" />
                            Room Type *
                          </label>
                          <select
                            value={room.name}
                            onChange={(e) => onUpdateRoom(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          >
                            <option value="">-- Select Room Type --</option>
                            {ROOM_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Hash className="inline h-4 w-4 mr-1" />
                            Number of Rooms *
                          </label>
                          <input
                            type="number"
                            value={room.room_count || 1}
                            onChange={(e) => onUpdateRoom(index, 'room_count', parseInt(e.target.value) || 1)}
                            placeholder="1"
                            min="1"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Number of inventory units for this room type</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DollarSign className="inline h-4 w-4 mr-1" />
                            Price per Night *
                          </label>
                          <input
                            type="number"
                            value={room.price}
                            onChange={(e) => onUpdateRoom(index, 'price', e.target.value)}
                            placeholder="100"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Users className="inline h-4 w-4 mr-1" />
                            Max People *
                          </label>
                          <select
                            value={room.max_people}
                            onChange={(e) => onUpdateRoom(index, 'max_people', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                              <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Square className="inline h-4 w-4 mr-1" />
                            Room Size (sqm)
                          </label>
                          <input
                            type="number"
                            value={room.size_sqm}
                            onChange={(e) => onUpdateRoom(index, 'size_sqm', e.target.value)}
                            placeholder="25"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            What's Included
                          </label>
                          <input
                            type="text"
                            value={room.included}
                            onChange={(e) => onUpdateRoom(index, 'included', e.target.value)}
                            placeholder="e.g., Breakfast, WiFi, Parking"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Room Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Room Description
                        </label>
                        <textarea
                          value={room.description}
                          onChange={(e) => onUpdateRoom(index, 'description', e.target.value)}
                          placeholder="Describe this room type, its features, and what makes it special..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Room Images */}
                <div className="border-b border-gray-200 border-l-4 border-l-green-200">
                  <button
                    onClick={() => toggleSection(index, 'images')}
                    className="w-full flex items-center justify-between px-4 py-4 pl-8 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Images</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-600 transition-transform ${
                        expandedSections[index]?.images ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedSections[index]?.images && (
                    <div className="p-6 bg-green-50 space-y-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Images
                      </label>
                      <p className="text-sm text-gray-600 mb-3">Add photos to showcase this room type</p>
                      <ImageUpload
                        images={roomImages?.[index] || []}
                        onImagesChange={(newImages) => onRoomImagesChange(index, newImages)}
                        maxImages={10}
                        acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                      />
                    </div>
                  )}
                </div>

                {/* Section 3: Room Amenities */}
                <div className="border-b border-gray-200 border-l-4 border-l-amber-200">
                  <button
                    onClick={() => toggleSection(index, 'amenities')}
                    className="w-full flex items-center justify-between px-4 py-4 pl-8 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-gray-900">Amenities</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-600 transition-transform ${
                        expandedSections[index]?.amenities ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedSections[index]?.amenities && (
                    <div className="p-6 bg-amber-50">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {roomAmenities.map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={room.amenities[key] || false}
                            onChange={(e) => {
                              const currentValue = room.amenities[key] || false;
                              onUpdateRoomAmenity(index, key, !currentValue);
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Room Inventory Creation */}
                <div className="border-l-4 border-l-purple-200">
                  <button
                    onClick={() => toggleSection(index, 'inventory')}
                    className="w-full flex items-center justify-between px-4 py-4 pl-8 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Room Inventory Creation</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-600 transition-transform ${
                        expandedSections[index]?.inventory ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedSections[index]?.inventory && (
                    <div className="p-6 bg-purple-50 space-y-4">
                      {/* Mode Selection */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">How would you like to create room inventory?</p>
                        <div className="flex gap-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              checked={roomInventory[index]?.mode === 'automatic'}
                              onChange={() => updateInventoryMode(index, 'automatic')}
                              className="w-4 h-4 text-primary-600 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Auto-generate</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              checked={roomInventory[index]?.mode === 'manual'}
                              onChange={() => updateInventoryMode(index, 'manual')}
                              className="w-4 h-4 text-primary-600 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Manual entry</span>
                          </label>
                        </div>
                      </div>

                      {/* Automatic Mode */}
                      {roomInventory[index]?.mode === 'automatic' && (
                        <div className="bg-blue-100 rounded-lg p-4 space-y-4 border border-blue-200">
                          <p className="text-sm font-medium text-gray-700">Auto-generation Options:</p>
                          <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                checked={roomInventory[index]?.inventoryMode === 'default'}
                                onChange={() => updateInventorySubMode(index, 'default')}
                                className="w-4 h-4 text-primary-600 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Default (1 to {room.room_count})</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                checked={roomInventory[index]?.inventoryMode === 'custom_start'}
                                onChange={() => updateInventorySubMode(index, 'custom_start')}
                                className="w-4 h-4 text-primary-600 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Custom start number</span>
                            </label>
                          </div>

                          {roomInventory[index]?.inventoryMode === 'custom_start' && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Starting Room Number
                              </label>
                              <input
                                type="number"
                                value={roomInventory[index]?.startingNumber || ''}
                                onChange={(e) => updateStartingNumber(index, e.target.value)}
                                placeholder="e.g., 101"
                                min="1"
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                              {roomInventory[index]?.startingNumber && (
                                <p className="text-xs text-gray-600 mt-2">
                                  Will generate: {getGeneratedRoomNumbers(index).join(', ')}
                                </p>
                              )}
                            </div>
                          )}

                          {roomInventory[index]?.inventoryMode === 'default' && (
                            <p className="text-xs text-gray-600 mt-2">
                              Will generate rooms: {getGeneratedRoomNumbers(index).join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Manual Mode */}
                      {roomInventory[index]?.mode === 'manual' && (
                        <div className="bg-purple-100 rounded-lg p-4 space-y-4 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">Enter Room Details</p>
                            <span className="text-xs text-gray-500">
                              {roomInventory[index]?.manualRooms?.length || 0} / {room.room_count} rooms
                            </span>
                          </div>

                          {roomInventory[index]?.manualRooms?.map((manualRoom) => (
                            <div key={manualRoom.id} className="flex gap-2">
                              <input
                                type="text"
                                value={manualRoom.roomNumber}
                                onChange={(e) => updateManualRoom(index, manualRoom.id, 'roomNumber', e.target.value)}
                                placeholder="Room ID (e.g., 101)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              />
                              <input
                                type="text"
                                value={manualRoom.notes}
                                onChange={(e) => updateManualRoom(index, manualRoom.id, 'notes', e.target.value)}
                                placeholder="Optional notes"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeManualRoom(index, manualRoom.id)}
                                className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            </div>
                          ))}

                          {roomInventory[index]?.manualRooms?.length < room.room_count && (
                            <button
                              type="button"
                              onClick={() => addManualRoom(index)}
                              className="flex items-center gap-2 px-3 py-2 text-primary-600 hover:text-primary-800 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                            >
                              <Plus className="h-4 w-4" />
                              Add Room
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Room Type Button */}
      <button
        onClick={onAddRoom}
        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        <Plus className="h-5 w-5" />
        Add Room Type
      </button>
    </div>
  );
};