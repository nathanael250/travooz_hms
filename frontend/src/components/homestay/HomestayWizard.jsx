import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Save
} from 'lucide-react';
import { HomestayInfoStep } from './steps/HomestayInfoStep';
import { RoomsStep } from './steps/RoomsStep';
import { RestaurantStep } from './steps/RestaurantStep';
import { MenusStep } from './steps/MenusStep';

const STEPS = {
  HOMESTAY_INFO: 'homestay_info',
  ROOMS: 'rooms',
  RESTAURANT: 'restaurant',
  MENUS: 'menus',
  REVIEW: 'review'
};

export const HomestayWizard = ({ onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.HOMESTAY_INFO);
  const [roomInventory, setRoomInventory] = useState({});
  const [images, setImages] = useState({
    homestay: [],
    rooms: {},
    restaurant: [],
    menus: {}
  });
  const [formData, setFormData] = useState({
    // Homestay basic info
    homestay: {
      name: '',
      description: '',
      location_id: null,
      location_name: '',
      latitude: null,
      longitude: null,
      address: '',
      star_rating: 3,
      check_in_time: '14:00',
      check_out_time: '11:00',
      phone: '',
      email: '',
      cancellation_policy: '',
      child_policy: '',
      pet_policy: '',
      // Amenities
      amenities: {
        free_wifi: false,
        parking_available: false,
        pet_friendly: false,
        swimming_pool: false,
        spa: false,
        fitness_center: false,
        restaurant: false,
        bar_lounge: false,
        air_conditioning: false,
        room_service: false,
        laundry_service: false,
        airport_shuttle: false,
        family_rooms: false,
        non_smoking_rooms: false,
        breakfast_included: false,
        kitchen_facilities: false,
        balcony: false,
        ocean_view: false,
        garden_view: false,
        wheelchair_accessible: false,
        meeting_rooms: false,
        conference_facilities: false,
        security_24h: false
      }
    },
    // Rooms data
    rooms: [
      {
        name: '',
        description: '',
        price: '',
        max_people: 1,
        size_sqm: '',
        included: '',
        room_count: 1,
        amenities: {
          minibar: false,
          tea_coffee_facilities: false,
          wardrobe_hangers: false,
          luggage_rack: false,
          safe: false,
          air_conditioner: false,
          heater: false,
          fan: false,
          wifi: false,
          tv: false,
          speaker: false,
          phone: false,
          usb_charging_points: false,
          power_adapters: false,
          desk_workspace: false,
          iron_ironing_board: false,
          hairdryer: false,
          towels: false,
          bathrobes: false,
          slippers: false,
          toiletries: false,
          teeth_shaving_kits: false,
          table_lamps: false,
          bedside_lamps: false,
          alarm_clock: false,
          laundry_bag: false
        }
      }
    ],
    // Restaurant data
    restaurant: {
      has_restaurant: false,
      name: '',
      description: '',
      cuisine_type: '',
      opening_time: '07:00',
      closing_time: '23:00',
      contact_number: '',
      email: ''
    },
    // Menu items
    menus: []
  });

  const stepNames = {
    [STEPS.HOMESTAY_INFO]: 'Homestay Information',
    [STEPS.ROOMS]: 'Room Types',
    [STEPS.RESTAURANT]: 'Restaurant Setup',
    [STEPS.MENUS]: 'Menu Items',
    [STEPS.REVIEW]: 'Review & Submit'
  };

  const updateHomestayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      homestay: {
        ...prev.homestay,
        [field]: value
      }
    }));
  };

  const updateHomestayAmenity = (amenity, value) => {
    try {
      setFormData(prev => ({
        ...prev,
        homestay: {
          ...prev.homestay,
          amenities: {
            ...prev.homestay.amenities,
            [amenity]: value
          }
        }
      }));
    } catch (error) {
      console.error('Error updating homestay amenity:', error);
    }
  };

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        {
          name: '',
          description: '',
          price: '',
          max_people: 1,
          size_sqm: '',
          included: '',
          room_count: 1,
          amenities: {
            minibar: false,
            tea_coffee_facilities: false,
            wardrobe_hangers: false,
            luggage_rack: false,
            safe: false,
            air_conditioner: false,
            heater: false,
            fan: false,
            wifi: false,
            tv: false,
            speaker: false,
            phone: false,
            usb_charging_points: false,
            power_adapters: false,
            desk_workspace: false,
            iron_ironing_board: false,
            hairdryer: false,
            towels: false,
            bathrobes: false,
            slippers: false,
            toiletries: false,
            teeth_shaving_kits: false,
            table_lamps: false,
            bedside_lamps: false,
            alarm_clock: false,
            laundry_bag: false
          }
        }
      ]
    }));
  };

  const removeRoom = (index) => {
    if (formData.rooms.length > 1) {
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRoom = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, i) => 
        i === index ? { ...room, [field]: value } : room
      )
    }));
  };

  const updateRoomAmenity = (roomIndex, amenity, value) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, i) => 
        i === roomIndex ? {
          ...room,
          amenities: { ...room.amenities, [amenity]: value }
        } : room
      )
    }));
  };

  const handleRoomInventoryUpdate = (inventory) => {
    setRoomInventory(inventory);
  };

  const updateRestaurant = (field, value) => {
    setFormData(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurant,
        [field]: value
      }
    }));
  };

  const addMenuItem = () => {
    setFormData(prev => ({
      ...prev,
      menus: [
        ...prev.menus,
        {
          name: '',
          description: '',
          price: '',
          available: true
        }
      ]
    }));
  };

  const removeMenuItem = (index) => {
    setFormData(prev => ({
      ...prev,
      menus: prev.menus.filter((_, i) => i !== index)
    }));
  };

  const updateMenuItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      menus: prev.menus.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const nextStep = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      // Skip menus step if no restaurant
      if (steps[currentIndex + 1] === STEPS.MENUS && !formData.restaurant.has_restaurant) {
        setCurrentStep(STEPS.REVIEW);
      } else {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const prevStep = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      // Skip menus step if no restaurant
      if (steps[currentIndex - 1] === STEPS.MENUS && !formData.restaurant.has_restaurant) {
        setCurrentStep(STEPS.RESTAURANT);
      } else {
        setCurrentStep(steps[currentIndex - 1]);
      }
    }
  };

  const handleHomestayImagesChange = (newImages) => {
    setImages(prev => ({
      ...prev,
      homestay: newImages
    }));
  };

  const handleRoomImagesChange = (roomIndex, newImages) => {
    setImages(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [roomIndex]: newImages
      }
    }));
  };

  const handleRestaurantImagesChange = (newImages) => {
    setImages(prev => ({
      ...prev,
      restaurant: newImages
    }));
  };

  const handleMenuImagesChange = (menuIndex, newImages) => {
    setImages(prev => ({
      ...prev,
      menus: {
        ...prev.menus,
        [menuIndex]: newImages
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate that location has been selected on the map
      // if (formData.homestay.latitude === null || formData.homestay.latitude === 0 ||
      //     formData.homestay.longitude === null || formData.homestay.longitude === 0) {
      //   alert('Please select a location on the map before submitting');
      //   return;
      // }

      // Validate that address has been set
      // if (!formData.homestay.address || formData.homestay.address.trim() === '') {
      //   alert('Please select a location on the map to set the address');
      //   return;
      // }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append homestay data as JSON
      formDataToSend.append('homestay', JSON.stringify(formData.homestay));
      formDataToSend.append('rooms', JSON.stringify(formData.rooms));
      formDataToSend.append('roomInventory', JSON.stringify(roomInventory));
      formDataToSend.append('restaurant', JSON.stringify(formData.restaurant));
      formDataToSend.append('menus', JSON.stringify(formData.menus));
      
      // Append homestay images
      images.homestay.forEach((image, index) => {
        formDataToSend.append('homestay_images', image.file);
      });
      
      // Append room images
      Object.keys(images.rooms).forEach(roomIndex => {
        const roomImages = images.rooms[roomIndex];
        roomImages.forEach((image, imageIndex) => {
          formDataToSend.append(`room_${roomIndex}_images`, image.file);
        });
      });
      
      // Append restaurant images
      images.restaurant.forEach((image, index) => {
        formDataToSend.append('restaurant_images', image.file);
      });
      
      // Append menu images
      Object.keys(images.menus).forEach(menuIndex => {
        const menuImages = images.menus[menuIndex];
        menuImages.forEach((image, imageIndex) => {
          formDataToSend.append(`menu_${menuIndex}_images`, image.file);
        });
      });
      
      await onSave(formDataToSend);
    } catch (error) {
      console.error('Error saving homestay:', error);
    }
  };

  const renderProgressBar = () => {
    const steps = Object.values(STEPS);
    // Filter out menus step if no restaurant
    const activeSteps = formData.restaurant.has_restaurant 
      ? steps 
      : steps.filter(step => step !== STEPS.MENUS);
    
    const currentIndex = activeSteps.indexOf(currentStep);
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {activeSteps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentIndex 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index < currentIndex ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-900">
                {stepNames[step]}
              </div>
              {index < activeSteps.length - 1 && (
                <div className={`
                  mx-4 h-0.5 w-12 
                  ${index < currentIndex ? 'bg-primary-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ReviewStep = ({ data }) => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Review Your Homestay</h3>
      
      {/* Homestay Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Homestay Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{data.homestay.name || 'Not specified'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Location:</span>
            <span className="ml-2 text-gray-900">{data.homestay.location || 'Not specified'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Star Rating:</span>
            <span className="ml-2 text-gray-900">{data.homestay.star_rating} Star{data.homestay.star_rating !== 1 ? 's' : ''}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Check-in/out:</span>
            <span className="ml-2 text-gray-900">{data.homestay.check_in_time} - {data.homestay.check_out_time}</span>
          </div>
          {data.homestay.phone && (
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-900">{data.homestay.phone}</span>
            </div>
          )}
          {data.homestay.email && (
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{data.homestay.email}</span>
            </div>
          )}
        </div>
        {data.homestay.description && (
          <div className="mt-4">
            <span className="font-medium text-gray-700">Description:</span>
            <p className="text-gray-900 mt-1">{data.homestay.description}</p>
          </div>
        )}
      </div>

      {/* Room Types */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Types ({data.rooms.length})</h4>
        <div className="space-y-4">
          {data.rooms.map((room, index) => (
            <div key={index} className="border-l-4 border-primary-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-900">{room.name || `Room Type ${index + 1}`}</h5>
                  {room.description && (
                    <p className="text-gray-600 text-sm mt-1">{room.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{room.price ? `${room.price} RWF` : 'Price not set'}</p>
                  <p className="text-sm text-gray-600">Max {room.max_people} people</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurant */}
      {data.restaurant.has_restaurant && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Restaurant</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{data.restaurant.name || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cuisine:</span>
              <span className="ml-2 text-gray-900">{data.restaurant.cuisine_type || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Hours:</span>
              <span className="ml-2 text-gray-900">{data.restaurant.opening_time} - {data.restaurant.closing_time}</span>
            </div>
            {data.restaurant.contact_number && (
              <div>
                <span className="font-medium text-gray-700">Contact:</span>
                <span className="ml-2 text-gray-900">{data.restaurant.contact_number}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu Items */}
      {data.menus.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Menu Items ({data.menus.length})</h4>
          <div className="space-y-3">
            {data.menus.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <h6 className="font-medium text-gray-900">{item.name}</h6>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  )}
                  {!item.available && (
                    <span className="text-red-500 text-xs">Currently unavailable</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{item.price ? `${item.price} RWF` : 'Price not set'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8 text-primary-600" />
              Create New Homestay
            </h1>
            <p className="text-gray-600 mt-2">Set up your homestay with rooms and restaurant in one go</p>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homestays
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Progress Bar */}
            {renderProgressBar()}

            {/* Form Content */}
            <div className="space-y-6">
              {/* Homestay Information Step */}
              {currentStep === STEPS.HOMESTAY_INFO && (
                <HomestayInfoStep 
                  data={formData.homestay}
                  onUpdateField={updateHomestayField}
                  onUpdateAmenity={updateHomestayAmenity}
                  images={images.homestay}
                  onImagesChange={handleHomestayImagesChange}
                />
              )}

              {/* Rooms Step */}
              {currentStep === STEPS.ROOMS && (
                <RoomsStep 
                  rooms={formData.rooms}
                  onAddRoom={addRoom}
                  onRemoveRoom={removeRoom}
                  onUpdateRoom={updateRoom}
                  onUpdateRoomAmenity={updateRoomAmenity}
                  roomImages={images.rooms}
                  onRoomImagesChange={handleRoomImagesChange}
                  onInventoryUpdate={handleRoomInventoryUpdate}
                />
              )}

              {/* Restaurant Step */}
              {currentStep === STEPS.RESTAURANT && (
                <RestaurantStep 
                  data={formData.restaurant}
                  onUpdate={updateRestaurant}
                  restaurantImages={images.restaurant}
                  onRestaurantImagesChange={handleRestaurantImagesChange}
                />
              )}

              {/* Menus Step */}
              {currentStep === STEPS.MENUS && formData.restaurant.has_restaurant && (
                <MenusStep 
                  menus={formData.menus}
                  onAddItem={addMenuItem}
                  onRemoveItem={removeMenuItem}
                  onUpdateItem={updateMenuItem}
                  menuImages={images.menus}
                  onMenuImagesChange={handleMenuImagesChange}
                />
              )}

              {/* Review Step */}
              {currentStep === STEPS.REVIEW && (
                <ReviewStep data={formData} />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === STEPS.HOMESTAY_INFO}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex gap-3">
                {currentStep === STEPS.ROOMS && (
                  <button
                    onClick={() => setCurrentStep(STEPS.REVIEW)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Save className="h-4 w-4" />
                    Save & Skip Restaurant
                  </button>
                )}

                {currentStep === STEPS.REVIEW ? (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Save className="h-4 w-4" />
                    Create Homestay
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
