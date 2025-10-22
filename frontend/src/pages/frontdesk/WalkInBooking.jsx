import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Calendar,
  Home,
  Users,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const WalkInBooking = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    // Guest Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    idType: 'passport',
    idNumber: '',
    address: '',
    
    // Booking Details
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: '',
    adults: 1,
    children: 0,
    roomType: '',
    roomNumber: '',
    
    // Payment
    paymentMethod: 'cash',
    advancePayment: 0,
    
    // Additional
    specialRequests: '',
    purpose: 'leisure'
  });

  useEffect(() => {
    if (bookingData.checkInDate && bookingData.checkOutDate && bookingData.roomType) {
      fetchAvailableRooms();
    }
  }, [bookingData.checkInDate, bookingData.checkOutDate, bookingData.roomType]);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/rooms/available?checkIn=${bookingData.checkInDate}&checkOut=${bookingData.checkOutDate}&roomType=${bookingData.roomType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch available rooms');
      
      const data = await response.json();
      setAvailableRooms(data.data || getMockAvailableRooms());
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setAvailableRooms(getMockAvailableRooms());
    } finally {
      setLoading(false);
    }
  };

  const getMockAvailableRooms = () => [
    { id: 1, roomNumber: '101', roomType: 'Standard', floor: 1, pricePerNight: 50000, amenities: ['WiFi', 'TV', 'AC'] },
    { id: 2, roomNumber: '102', roomType: 'Standard', floor: 1, pricePerNight: 50000, amenities: ['WiFi', 'TV', 'AC'] },
    { id: 3, roomNumber: '201', roomType: 'Deluxe', floor: 2, pricePerNight: 80000, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
    { id: 4, roomNumber: '301', roomType: 'Suite', floor: 3, pricePerNight: 120000, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'] }
  ];

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalAmount = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.roomNumber) return 0;
    
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const selectedRoom = availableRooms.find(r => r.roomNumber === bookingData.roomNumber);
    if (!selectedRoom) return 0;
    
    return nights * selectedRoom.pricePerNight;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const totalAmount = calculateTotalAmount();
      const bookingPayload = {
        ...bookingData,
        totalAmount,
        bookingType: 'walk-in',
        status: 'confirmed'
      };

      const response = await fetch(`${API_BASE_URL}/api/bookings/walk-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) throw new Error('Failed to create booking');

      const result = await response.json();
      toast.success('Walk-in booking created successfully!');
      
      // Reset form
      setBookingData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        idType: 'passport',
        idNumber: '',
        address: '',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: '',
        adults: 1,
        children: 0,
        roomType: '',
        roomNumber: '',
        paymentMethod: 'cash',
        advancePayment: 0,
        specialRequests: '',
        purpose: 'leisure'
      });
      setStep(1);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return bookingData.firstName && bookingData.lastName && bookingData.phone && bookingData.email;
      case 2:
        return bookingData.checkInDate && bookingData.checkOutDate && bookingData.roomType;
      case 3:
        return bookingData.roomNumber;
      case 4:
        return bookingData.paymentMethod;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => setStep(step - 1);

  const totalAmount = calculateTotalAmount();
  const nights = bookingData.checkInDate && bookingData.checkOutDate
    ? Math.ceil((new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-blue-600" />
          Walk-In Booking
        </h1>
        <p className="text-gray-600 mt-1">Quick booking for walk-in guests</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Guest Info' },
            { num: 2, label: 'Stay Details' },
            { num: 3, label: 'Room Selection' },
            { num: 4, label: 'Payment' },
            { num: 5, label: 'Confirm' }
          ].map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s.num}
                </div>
                <span className={`text-xs mt-2 ${step >= s.num ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {index < 4 && (
                <div className={`flex-1 h-1 mx-2 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Step 1: Guest Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={bookingData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={bookingData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="john.doe@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+250788123456"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={bookingData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Rwanda"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select
                  value={bookingData.idType}
                  onChange={(e) => handleInputChange('idType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="passport">Passport</option>
                  <option value="national-id">National ID</option>
                  <option value="driving-license">Driving License</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  value={bookingData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ID Number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={bookingData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Street Address"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Stay Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stay Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-In Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={bookingData.checkInDate}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={bookingData.checkOutDate}
                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                    min={bookingData.checkInDate}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adults *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={bookingData.adults}
                    onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                    min="1"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={bookingData.children}
                    onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={bookingData.roomType}
                    onChange={(e) => handleInputChange('roomType', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Room Type</option>
                    <option value="Standard">Standard Room</option>
                    <option value="Deluxe">Deluxe Room</option>
                    <option value="Suite">Suite</option>
                    <option value="Executive">Executive Suite</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
                <select
                  value={bookingData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="leisure">Leisure</option>
                  <option value="business">Business</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            {nights > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>{nights}</strong> night{nights > 1 ? 's' : ''} stay
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Room Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Room</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No rooms available for selected dates and type</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => handleInputChange('roomNumber', room.roomNumber)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      bookingData.roomNumber === room.roomNumber
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900">Room {room.roomNumber}</span>
                      {bookingData.roomNumber === room.roomNumber && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{room.roomType} - Floor {room.floor}</p>
                    <p className="text-lg font-semibold text-blue-600">RWF {room.pricePerNight.toLocaleString()}/night</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {room.amenities.map((amenity, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">RWF {totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{nights} nights</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Balance Due</p>
                  <p className="text-2xl font-bold text-red-600">
                    RWF {(totalAmount - bookingData.advancePayment).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={bookingData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile-money">Mobile Money</option>
                    <option value="bank-transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment (RWF)</label>
                <input
                  type="number"
                  value={bookingData.advancePayment}
                  onChange={(e) => handleInputChange('advancePayment', parseFloat(e.target.value) || 0)}
                  max={totalAmount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
              <textarea
                value={bookingData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requests or notes..."
              />
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Booking</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Guest Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">Name:</p>
                  <p className="font-medium">{bookingData.firstName} {bookingData.lastName}</p>
                  <p className="text-gray-600">Email:</p>
                  <p className="font-medium">{bookingData.email}</p>
                  <p className="text-gray-600">Phone:</p>
                  <p className="font-medium">{bookingData.phone}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">Check-In:</p>
                  <p className="font-medium">{bookingData.checkInDate}</p>
                  <p className="text-gray-600">Check-Out:</p>
                  <p className="font-medium">{bookingData.checkOutDate}</p>
                  <p className="text-gray-600">Room:</p>
                  <p className="font-medium">{bookingData.roomNumber} - {bookingData.roomType}</p>
                  <p className="text-gray-600">Guests:</p>
                  <p className="font-medium">{bookingData.adults} Adults, {bookingData.children} Children</p>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">RWF {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance Payment:</span>
                    <span className="font-medium">RWF {bookingData.advancePayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-semibold text-gray-900">Balance Due:</span>
                    <span className="font-bold text-blue-600">
                      RWF {(totalAmount - bookingData.advancePayment).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>
          )}
          
          {step < 5 ? (
            <button
              onClick={nextStep}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm & Create Booking
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalkInBooking;