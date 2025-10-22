import React, { useState, useEffect } from 'react';
import {
  Home,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Wrench,
  Ban,
  RefreshCw,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiClient';

export const RoomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      fetchRoomStatus();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchRoomStatus, 30000);
      return () => clearInterval(interval);
    } else {
      console.warn('⚠️ No token available - using mock data. User may need to login.');
      setRooms(getMockRooms());
      setLoading(false);
    }
  }, []);

  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching room status using apiClient...');
      const response = await apiClient.get('/front-desk/room-status');
      
      // Transform API response to match expected format
      let roomsData = response.data.data?.rooms || [];
      if (roomsData.length > 0) {
        roomsData = roomsData.map(room => ({
          id: room.inventory_id || room.id,
          roomNumber: room.room_number || room.unit_number || room.roomNumber || '',
          floor: room.floor || 0,
          roomType: room.room_type || room.roomType || 'Standard',
          status: room.status || 'vacant-clean',
          guestName: room.guest_name || room.guestName || null,
          checkOut: room.check_out_date || room.checkOut || null,
          lastCleaned: room.last_cleaned || room.lastCleaned || null,
          housekeepingStatus: room.housekeeping_status || room.housekeepingStatus || 'completed',
          notes: room.notes || ''
        }));
      }
      console.log('✅ Transformed room data:', roomsData);
      setRooms(roomsData.length > 0 ? roomsData : getMockRooms());
    } catch (error) {
      console.error('❌ Error fetching room status:', error);
      setRooms(getMockRooms());
    } finally {
      setLoading(false);
    }
  };

  const getMockRooms = () => {
    const rooms = [];
    const statuses = ['vacant-clean', 'vacant-dirty', 'occupied-clean', 'occupied-dirty', 'maintenance', 'blocked'];
    const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive'];
    
    for (let floor = 1; floor <= 4; floor++) {
      for (let room = 1; room <= 10; room++) {
        const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        
        rooms.push({
          id: parseInt(roomNumber),
          roomNumber,
          floor,
          roomType,
          status,
          guestName: status.includes('occupied') ? `Guest ${roomNumber}` : null,
          checkOut: status.includes('occupied') ? '2024-01-20' : null,
          lastCleaned: status.includes('clean') ? '2 hours ago' : null,
          housekeepingStatus: status.includes('dirty') ? 'pending' : 'completed',
          notes: status === 'maintenance' ? 'AC repair in progress' : status === 'blocked' ? 'Reserved for VIP' : ''
        });
      }
    }
    return rooms;
  };

  const handleStatusChange = (room) => {
    setSelectedRoom(room);
    setNewStatus(room.status);
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const updateRoomStatus = async () => {
    try {
      if (!selectedRoom) {
        toast.error('No room selected');
        return;
      }

      console.log('📡 Updating room status via apiClient...');
      const response = await apiClient.put(`/front-desk/room-status/${selectedRoom.id}`, {
        status: newStatus,
        notes: statusNotes
      });

      if (response.data.success) {
        toast.success('Room status updated successfully!');
        setShowStatusModal(false);
        fetchRoomStatus();
      } else {
        throw new Error(response.data.message || 'Failed to update room status');
      }
    } catch (error) {
      console.error('❌ Error updating room status:', error);
      toast.error(error.message || 'Failed to update room status');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'vacant-clean': {
        label: 'Vacant Clean',
        color: 'bg-green-100 border-green-300 text-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      'vacant-dirty': {
        label: 'Vacant Dirty',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        icon: AlertCircle,
        iconColor: 'text-yellow-600'
      },
      'occupied-clean': {
        label: 'Occupied Clean',
        color: 'bg-blue-100 border-blue-300 text-blue-800',
        icon: Users,
        iconColor: 'text-blue-600'
      },
      'occupied-dirty': {
        label: 'Occupied Dirty',
        color: 'bg-orange-100 border-orange-300 text-orange-800',
        icon: Users,
        iconColor: 'text-orange-600'
      },
      'maintenance': {
        label: 'Maintenance',
        color: 'bg-purple-100 border-purple-300 text-purple-800',
        icon: Wrench,
        iconColor: 'text-purple-600'
      },
      'blocked': {
        label: 'Blocked',
        color: 'bg-red-100 border-red-300 text-red-800',
        icon: Ban,
        iconColor: 'text-red-600'
      }
    };
    return configs[status] || configs['vacant-clean'];
  };

  const filteredRooms = rooms.filter(room => {
    // Safety checks for undefined properties
    if (!room || !room.id) {
      console.warn('⚠️ Room object missing ID:', room);
      return false;
    }

    // Log warnings but don't filter out rooms with missing roomNumber or roomType
    if (!room.roomNumber) {
      console.warn('⚠️ Room missing roomNumber:', room.id);
    }
    if (!room.roomType) {
      console.warn('⚠️ Room missing roomType:', room.id);
    }

    const matchesSearch = (room.roomNumber || '').toString().includes(searchTerm) ||
                         (room.roomType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.guestName && room.guestName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || (room.status === filterStatus);
    const matchesFloor = filterFloor === 'all' || ((room.floor || 0).toString() === filterFloor);
    return matchesSearch && matchesStatus && matchesFloor;
  });

  // Group rooms by floor
  const roomsByFloor = filteredRooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {});

  // Calculate statistics
  const stats = {
    total: rooms.length,
    vacantClean: rooms.filter(r => r.status === 'vacant-clean').length,
    vacantDirty: rooms.filter(r => r.status === 'vacant-dirty').length,
    occupiedClean: rooms.filter(r => r.status === 'occupied-clean').length,
    occupiedDirty: rooms.filter(r => r.status === 'occupied-dirty').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    blocked: rooms.filter(r => r.status === 'blocked').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-7 h-7 text-blue-600" />
              Room Status Board
            </h1>
            <p className="text-gray-600 mt-1">Real-time room status overview</p>
          </div>
          <button
            onClick={fetchRoomStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Rooms</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.vacantClean}</div>
          <div className="text-sm text-gray-600">Vacant Clean</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{stats.vacantDirty}</div>
          <div className="text-sm text-gray-600">Vacant Dirty</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{stats.occupiedClean}</div>
          <div className="text-sm text-gray-600">Occupied Clean</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-orange-600">{stats.occupiedDirty}</div>
          <div className="text-sm text-gray-600">Occupied Dirty</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">{stats.maintenance}</div>
          <div className="text-sm text-gray-600">Maintenance</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          <div className="text-sm text-gray-600">Blocked</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="vacant-clean">Vacant Clean</option>
              <option value="vacant-dirty">Vacant Dirty</option>
              <option value="occupied-clean">Occupied Clean</option>
              <option value="occupied-dirty">Occupied Dirty</option>
              <option value="maintenance">Maintenance</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="relative">
            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 flex items-center justify-center">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </div>
        </div>
      </div>

      {/* Room Grid by Floor */}
      <div className="space-y-6">
        {Object.keys(roomsByFloor).sort((a, b) => b - a).map(floor => (
          <div key={floor} className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Floor {floor}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {roomsByFloor[floor].map(room => {
                const config = getStatusConfig(room.status);
                const Icon = config.icon;
                
                return (
                  <div
                    key={room.id}
                    onClick={() => handleStatusChange(room)}
                    className={`${config.color} border-2 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{room.roomNumber}</span>
                      <Icon className={`w-5 h-5 ${config.iconColor}`} />
                    </div>
                    <div className="text-xs font-medium mb-1">{room.roomType}</div>
                    {room.guestName && (
                      <div className="text-xs truncate">{room.guestName}</div>
                    )}
                    {room.notes && (
                      <div className="text-xs mt-1 truncate" title={room.notes}>
                        {room.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Update Room Status</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Room: <span className="font-medium">{selectedRoom.roomNumber}</span></p>
                <p className="text-sm text-gray-600">Type: <span className="font-medium">{selectedRoom.roomType}</span></p>
                {selectedRoom.guestName && (
                  <p className="text-sm text-gray-600">Guest: <span className="font-medium">{selectedRoom.guestName}</span></p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vacant-clean">Vacant Clean</option>
                    <option value="vacant-dirty">Vacant Dirty</option>
                    <option value="occupied-clean">Occupied Clean</option>
                    <option value="occupied-dirty">Occupied Dirty</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about this status change..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={updateRoomStatus}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomStatus;