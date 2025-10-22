import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const StayView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Calculate date range (show 30 days from current date)
  const daysToShow = 30;
  const dateRange = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  useEffect(() => {
    fetchStayViewData();
  }, [id, currentDate]);

  const fetchStayViewData = async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].toISOString().split('T')[0];
      const endDate = dateRange[dateRange.length - 1].toISOString().split('T')[0];

      const response = await fetch(
        `${API_BASE_URL}/api/homestays/${id}/stay-view?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRooms(data.data.rooms);
        setBookings(data.data.bookings);
      } else {
        toast.error('Failed to fetch stay view data');
      }
    } catch (error) {
      console.error('Error fetching stay view data:', error);
      toast.error('Error loading stay view');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 30);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 30);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getBookingForRoomAndDate = (roomId, date) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const currentDate = new Date(date);
      
      // Reset time parts for accurate comparison
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      return booking.inventory_id === roomId && 
             currentDate >= checkIn && 
             currentDate < checkOut;
    });
  };

  const getUnassignedBookingForDate = (date) => {
    return bookings.filter(booking => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const currentDate = new Date(date);
      
      // Reset time parts for accurate comparison
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      return booking.inventory_id === null && 
             currentDate >= checkIn && 
             currentDate < checkOut;
    });
  };

  const getBookingColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-400',
      'confirmed': 'bg-green-500',
      'cancelled': 'bg-red-400',
      'completed': 'bg-blue-400'
    };
    return colors[status] || 'bg-gray-400';
  };

  const isBookingStart = (booking, date) => {
    const checkIn = new Date(booking.check_in_date);
    const currentDate = new Date(date);
    checkIn.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return checkIn.getTime() === currentDate.getTime();
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
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
                  <Calendar className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Stay View</h1>
                  <p className="text-sm text-gray-600">Room occupancy timeline</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous 30 days"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {dateRange[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' '}-{' '}
                  {dateRange[dateRange.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Jump to today"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next 30 days"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Date Header */}
              <div className="flex border-b border-gray-200 bg-gray-50 sticky top-[73px] z-10">
                <div className="w-40 flex-shrink-0 p-3 border-r border-gray-200 font-semibold text-sm">
                  Room
                </div>
                <div className="flex">
                  {dateRange.map((date, index) => (
                    <div
                      key={index}
                      className="w-32 flex-shrink-0 p-2 border-r border-gray-200 text-center"
                    >
                      <div className="text-xs font-medium text-gray-600">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Rows */}
              {rooms.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No rooms found for this homestay
                </div>
              ) : (
                <>
                  {/* Unassigned Bookings Row */}
                  {bookings.some(b => b.inventory_id === null) && (
                    <div className="flex border-b border-gray-200 bg-orange-50 hover:bg-orange-100">
                      <div className="w-40 flex-shrink-0 p-3 border-r border-gray-200">
                        <div className="font-medium text-sm text-orange-900">
                          Unassigned
                        </div>
                        <div className="text-xs text-orange-700 mt-1">
                          Needs room assignment
                        </div>
                      </div>
                      <div className="flex relative">
                        {dateRange.map((date, dateIndex) => {
                          const bookingsForDate = getUnassignedBookingForDate(date);
                          const booking = bookingsForDate[0];
                          
                          return (
                            <div
                              key={dateIndex}
                              className="w-32 flex-shrink-0 border-r border-gray-200 relative"
                              style={{ height: '60px' }}
                            >
                              {booking && isBookingStart(booking, date) && (
                                <div
                                  className={`absolute top-1 left-1 right-1 bottom-1 ${getBookingColor(booking.booking_status)} rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center text-white text-xs font-medium px-2 overflow-hidden border-2 border-orange-600`}
                                  style={{
                                    width: `calc(${booking.nights * 128}px - 8px)`,
                                    zIndex: 5
                                  }}
                                  onClick={() => handleBookingClick(booking)}
                                  title={`${booking.guest_name} - ${booking.booking_reference} (UNASSIGNED)`}
                                >
                                  <span className="truncate">{booking.guest_name}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Regular Room Rows */}
                  {rooms.map((room) => (
                    <div key={room.inventory_id} className="flex border-b border-gray-200 hover:bg-gray-50">
                      <div className="w-40 flex-shrink-0 p-3 border-r border-gray-200">
                        <div className="font-medium text-sm text-gray-900">
                          {room.room_number}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {room.room_type_name}
                        </div>
                      </div>
                      <div className="flex relative">
                        {dateRange.map((date, dateIndex) => {
                          const bookingsForDate = getBookingForRoomAndDate(room.inventory_id, date);
                          const booking = bookingsForDate[0];
                          
                          return (
                            <div
                              key={dateIndex}
                              className="w-32 flex-shrink-0 border-r border-gray-200 relative"
                              style={{ height: '60px' }}
                            >
                              {booking && isBookingStart(booking, date) && (
                                <div
                                  className={`absolute top-1 left-1 right-1 bottom-1 ${getBookingColor(booking.booking_status)} rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center text-white text-xs font-medium px-2 overflow-hidden`}
                                  style={{
                                    width: `calc(${booking.nights * 128}px - 8px)`,
                                    zIndex: 5
                                  }}
                                  onClick={() => handleBookingClick(booking)}
                                  title={`${booking.guest_name} - ${booking.booking_reference}`}
                                >
                                  <span className="truncate">{booking.guest_name}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-sm text-gray-600">Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Booking Reference</label>
                    <p className="text-gray-900 font-semibold">{selectedBooking.booking_reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-gray-900 font-semibold capitalize">{selectedBooking.booking_status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Guest Name</label>
                    <p className="text-gray-900">{selectedBooking.guest_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Room Number</label>
                    <p className="text-gray-900">{selectedBooking.room_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Check-in Date</label>
                    <p className="text-gray-900">{formatDate(selectedBooking.check_in_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Check-out Date</label>
                    <p className="text-gray-900">{formatDate(selectedBooking.check_out_date)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nights</label>
                    <p className="text-gray-900">{selectedBooking.nights}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Guests</label>
                    <p className="text-gray-900">
                      {selectedBooking.number_of_adults} Adults, {selectedBooking.number_of_children} Children
                    </p>
                  </div>
                </div>

                {selectedBooking.guest_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedBooking.guest_email}</p>
                  </div>
                )}

                {selectedBooking.guest_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedBooking.guest_phone}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Room Type</label>
                    <p className="text-gray-900">{selectedBooking.room_type_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Booking Source</label>
                    <p className="text-gray-900 capitalize">{selectedBooking.booking_source.replace('_', ' ')}</p>
                  </div>
                </div>

                {selectedBooking.special_requests && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Special Requests</label>
                    <p className="text-gray-900">{selectedBooking.special_requests}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};