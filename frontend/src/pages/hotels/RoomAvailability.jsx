import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  CalendarX,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Building2,
  Bed,
  Users,
  Clock,
  X,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const RoomAvailability = () => {
  const [availability, setAvailability] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'calendar'
  const [filters, setFilters] = useState({
    homestay_id: '',
    room_type_id: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    setIsAuthenticated(!!token);
  }, []);

  // Get current month date range
  const getMonthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    fetchRooms();
    fetchHomestays();
    fetchAvailability();
  }, [currentDate, filters]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('hms_token');
      const { start_date, end_date } = getMonthRange(currentDate);
      const queryParams = new URLSearchParams({
        start_date,
        end_date,
        ...filters
      });

      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add token if available (for authenticated users)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/room-availability/calendar?${queryParams}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.data?.availability || []);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to fetch room availability');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const queryParams = new URLSearchParams();
      if (filters.homestay_id) {
        queryParams.append('homestay_id', filters.homestay_id);
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add token if available (for authenticated users)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/room-availability/rooms?${queryParams}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.data?.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchHomestays = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add token if available (for authenticated users)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/homestays`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setHomestays(data.homestays || []);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getAvailabilityForDate = (roomId, date) => {
    return availability.find(
      a => a.inventory_id === roomId && a.date === date
    );
  };

  const getAvailabilityStatus = (avail) => {
    if (!avail) return { status: 'unknown', color: 'bg-gray-100', text: 'No data' };
    if (avail.closed) return { status: 'closed', color: 'bg-red-500', text: 'Closed' };
    if (avail.available_units === 0) return { status: 'full', color: 'bg-red-300', text: 'Full' };
    if (avail.available_units < avail.total_units) return { status: 'partial', color: 'bg-yellow-300', text: `${avail.available_units}/${avail.total_units}` };
    return { status: 'available', color: 'bg-green-300', text: `${avail.available_units}` };
  };

  // Generate calendar dates for current month
  const generateCalendarDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const calendarDates = generateCalendarDates();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-primary-600" />
            Room Availability Management
          </h1>
          <p className="text-gray-600 mt-1">Manage calendar blocks and room availability</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'month' ? 'calendar' : 'month')}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {viewMode === 'month' ? 'Calendar View' : 'Month View'}
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Set Availability
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.homestay_id}
            onChange={(e) => handleFilterChange('homestay_id', e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Homestays</option>
            {homestays.map(homestay => (
              <option key={homestay.homestay_id} value={homestay.homestay_id}>
                {homestay.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading availability...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar Grid View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDates.map((date, index) => (
              <div
                key={index}
                className={`min-h-24 p-2 border rounded-md ${
                  isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentMonth(date) ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {rooms.slice(0, 3).map(room => {
                    const avail = getAvailabilityForDate(room.inventory_id, formatDate(date));
                    const status = getAvailabilityStatus(avail);
                    return (
                      <div
                        key={room.inventory_id}
                        className={`text-xs p-1 rounded ${status.color} text-gray-800`}
                        title={`${room.homestay_name} - ${room.room_type_name} ${room.room_number}: ${status.text}`}
                      >
                        {room.room_number}
                      </div>
                    );
                  })}
                  {rooms.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{rooms.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Month List View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {rooms.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
              <p className="text-gray-600">No rooms available for the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                      Room
                    </th>
                    {calendarDates.filter(isCurrentMonth).map(date => (
                      <th key={formatDate(date)} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-12">
                        {date.getDate()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room, index) => (
                    <tr key={`${room.inventory_id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <Building2 className="h-4 w-4" />
                            <span className="truncate">{room.homestay_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Bed className="h-4 w-4" />
                            <span>{room.room_type_name} {room.room_number}</span>
                          </div>
                        </div>
                      </td>
                      {calendarDates.filter(isCurrentMonth).map((date, dateIndex) => {
                        const avail = getAvailabilityForDate(room.inventory_id, formatDate(date));
                        const status = getAvailabilityStatus(avail);
                        return (
                          <td key={`${index}-${dateIndex}`} className="px-2 py-4 text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${status.color} ${isAuthenticated ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                              title={`${formatDate(date)}: ${status.text}${avail?.notes ? ` - ${avail.notes}` : ''}`}
                              onClick={() => {
                                if (isAuthenticated) {
                                  // TODO: Open edit modal for this specific date/room
                                  console.log('Edit availability for', room.inventory_id, formatDate(date));
                                }
                              }}
                            >
                              {status.status === 'closed' ? <X className="h-3 w-3" /> : 
                               status.status === 'available' ? <Check className="h-3 w-3" /> :
                               status.status === 'partial' ? avail.available_units :
                               status.status === 'full' ? '0' : '?'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Legend:</h3>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span>Partially Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-300 rounded"></div>
            <span>Fully Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Closed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>No Data</span>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateAvailabilityModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          rooms={rooms}
          onSuccess={() => {
            fetchAvailability();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

const CreateAvailabilityModal = ({ isOpen, onClose, rooms, onSuccess }) => {
  const [formData, setFormData] = useState({
    inventory_id: '',
    start_date: '',
    end_date: '',
    available_units: '1',
    total_units: '1',
    min_stay: '1',
    max_stay: '',
    closed: false,
    notes: '',
    bulk_update: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        inventory_id: '',
        start_date: today,
        end_date: today,
        available_units: '1',
        total_units: '1',
        min_stay: '1',
        max_stay: '',
        closed: false,
        notes: '',
        bulk_update: false
      });
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // When start_date changes and end_date is before start_date, update end_date
    if (field === 'start_date' && formData.end_date < value) {
      setFormData(prev => ({ ...prev, end_date: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('hms_token');
      const endpoint = formData.bulk_update ? '/bulk' : '';
      
      const submitData = {
        inventory_id: parseInt(formData.inventory_id),
        available_units: parseInt(formData.available_units),
        total_units: parseInt(formData.total_units),
        min_stay: parseInt(formData.min_stay),
        max_stay: formData.max_stay ? parseInt(formData.max_stay) : null,
        closed: formData.closed,
        notes: formData.notes || null
      };

      if (formData.bulk_update) {
        submitData.start_date = formData.start_date;
        submitData.end_date = formData.end_date;
      } else {
        submitData.date = formData.start_date;
      }

      const response = await fetch(`${API_BASE_URL}/api/room-availability${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success('Room availability updated successfully');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update room availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update room availability');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedRoom = rooms.find(r => r.inventory_id === parseInt(formData.inventory_id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          Set Room Availability
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room *
            </label>
            <select
              value={formData.inventory_id}
              onChange={(e) => handleInputChange('inventory_id', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room.inventory_id} value={room.inventory_id}>
                  {room.homestay_name} - {room.room_type_name} {room.room_number}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="bulk_update"
              checked={formData.bulk_update}
              onChange={(e) => handleInputChange('bulk_update', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="bulk_update" className="ml-2 block text-sm text-gray-900">
              Update date range (bulk update)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.bulk_update ? 'Start Date *' : 'Date *'}
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            {formData.bulk_update && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  min={formData.start_date}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Units *
              </label>
              <input
                type="number"
                min="0"
                value={formData.available_units}
                onChange={(e) => handleInputChange('available_units', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Units *
              </label>
              <input
                type="number"
                min="0"
                value={formData.total_units}
                onChange={(e) => handleInputChange('total_units', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stay (nights)
              </label>
              <input
                type="number"
                min="1"
                value={formData.min_stay}
                onChange={(e) => handleInputChange('min_stay', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Stay (nights)
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_stay}
                onChange={(e) => handleInputChange('max_stay', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="No limit"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="closed"
              checked={formData.closed}
              onChange={(e) => handleInputChange('closed', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="closed" className="ml-2 block text-sm text-gray-900">
              Close room (unavailable for booking)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
              placeholder="Optional notes about availability..."
            />
          </div>

          {selectedRoom && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Selected Room:</strong> {selectedRoom.homestay_name} - {selectedRoom.room_type_name} {selectedRoom.room_number}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {selectedRoom.status}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Set Availability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};