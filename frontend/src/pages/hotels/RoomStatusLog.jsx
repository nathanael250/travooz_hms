import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  History,
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Settings,
  Wrench,
  Users,
  Calendar,
  Filter,
  RefreshCw,
  Plus,
  Search,
  Eye
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const RoomStatusLog = () => {
  const [statusLogs, setStatusLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    inventory_id: '',
    status: '',
    date_range: 'today'
  });
  const [newStatusChange, setNewStatusChange] = useState({
    inventory_id: '',
    new_status: '',
    reason: '',
    notes: ''
  });
  const [statistics, setStatistics] = useState(null);

  const statusTypes = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'occupied', label: 'Occupied', color: 'bg-blue-100 text-blue-800', icon: Users },
    { value: 'reserved', label: 'Reserved', color: 'bg-yellow-100 text-yellow-800', icon: Calendar },
    { value: 'cleaning', label: 'Cleaning', color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-800', icon: Wrench },
    { value: 'out_of_order', label: 'Out of Order', color: 'bg-red-100 text-red-800', icon: XCircle }
  ];

  const getStatusConfig = (status) => {
    return statusTypes.find(type => type.value === status) || statusTypes[0];
  };

  // Fetch data
  const fetchStatusLogs = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const params = new URLSearchParams();
      
      if (filters.inventory_id) params.append('inventory_id', filters.inventory_id);
      if (filters.status) params.append('status', filters.status);
      
      const response = await axios.get(`${API_BASE_URL}/api/room-status-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStatusLogs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching status logs:', error);
      toast.error('Failed to fetch status logs');
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await axios.get(`${API_BASE_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Ensure rooms is always an array
        const roomsData = Array.isArray(response.data.data) ? response.data.data : [];
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
      // Set empty array on error to prevent reduce() errors
      setRooms([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await axios.get(`${API_BASE_URL}/api/room-status-logs/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatusLogs(), fetchRooms(), fetchStatistics()]);
      setLoading(false);
    };
    loadData();
  }, [filters]);

  // Handle status change
  const handleStatusChange = async (e) => {
    e.preventDefault();
    
    if (!newStatusChange.inventory_id || !newStatusChange.new_status) {
      toast.error('Please select room and new status');
      return;
    }

    try {
      const token = localStorage.getItem('hms_token');
      const response = await axios.post(
        `${API_BASE_URL}/api/room-status-logs`,
        newStatusChange,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Room status updated successfully');
        setShowChangeModal(false);
        setNewStatusChange({
          inventory_id: '',
          new_status: '',
          reason: '',
          notes: ''
        });
        fetchStatusLogs();
        fetchRooms(); // Refresh rooms to get updated current status
      }
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error(error.response?.data?.message || 'Failed to update room status');
    }
  };

  // View room status history
  const viewRoomHistory = async (inventoryId) => {
    try {
      const token = localStorage.getItem('hms_token');
      const response = await axios.get(`${API_BASE_URL}/api/room-status-logs/room/${inventoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedLog(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching room history:', error);
      toast.error('Failed to fetch room history');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <History className="mr-3 h-8 w-8 text-blue-600" />
              Room Status Log
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track room status changes, cleaning, and maintenance
            </p>
          </div>
          <button
            onClick={() => setShowChangeModal(true)}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Change Status
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
            <div className="space-y-2">
              {statistics.status_distribution.map((stat) => {
                const config = getStatusConfig(stat.new_status);
                return (
                  <div key={stat.new_status} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="font-medium">{stat.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Rooms</h3>
            <div className="space-y-2">
              {statistics.most_active_rooms.slice(0, 5).map((room) => (
                <div key={room.inventory_id} className="flex items-center justify-between">
                  <span className="text-sm">
                    Room {room.room?.unit_number} 
                    {room.room?.floor && ` (Floor ${room.room.floor})`}
                  </span>
                  <span className="font-medium text-blue-600">{room.changes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Room Status</h3>
            <div className="space-y-2">
              {Object.entries(
                (Array.isArray(rooms) ? rooms : []).reduce((acc, room) => {
                  acc[room.status] = (acc[room.status] || 0) + 1;
                  return acc;
                }, {})
              ).map(([status, count]) => {
                const config = getStatusConfig(status);
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select
              value={filters.inventory_id}
              onChange={(e) => setFilters(prev => ({ ...prev, inventory_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Rooms</option>
              {Array.isArray(rooms) && rooms.map(room => (
                <option key={room.inventory_id} value={room.inventory_id}>
                  Room {room.unit_number} {room.floor && `(Floor ${room.floor})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {statusTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.date_range}
              onChange={(e) => setFilters(prev => ({ ...prev, date_range: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Status Changes</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changed At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statusLogs.map((log) => {
                const room = Array.isArray(rooms) ? rooms.find(r => r.inventory_id === log.inventory_id) : null;
                const previousConfig = getStatusConfig(log.previous_status);
                const newConfig = getStatusConfig(log.new_status);
                
                return (
                  <tr key={log.log_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Room {room?.unit_number || log.inventory_id}
                      </div>
                      {room?.floor && (
                        <div className="text-sm text-gray-500">Floor {room.floor}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${previousConfig.color}`}>
                          {previousConfig.label}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${newConfig.color}`}>
                          {newConfig.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.reason || 'No reason provided'}</div>
                      {log.notes && (
                        <div className="text-sm text-gray-500 mt-1">{log.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewRoomHistory(log.inventory_id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {statusLogs.length === 0 && (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No status changes found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No status changes match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Change Status Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Room Status</h3>
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleStatusChange}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room *
                    </label>
                    <select
                      value={newStatusChange.inventory_id}
                      onChange={(e) => setNewStatusChange(prev => ({ ...prev, inventory_id: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Room</option>
                      {Array.isArray(rooms) && rooms.map(room => (
                        <option key={room.inventory_id} value={room.inventory_id}>
                          Room {room.unit_number} {room.floor && `(Floor ${room.floor})`} - Current: {getStatusConfig(room.status).label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Status *
                    </label>
                    <select
                      value={newStatusChange.new_status}
                      onChange={(e) => setNewStatusChange(prev => ({ ...prev, new_status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Status</option>
                      {statusTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={newStatusChange.reason}
                      onChange={(e) => setNewStatusChange(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for status change"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={newStatusChange.notes}
                      onChange={(e) => setNewStatusChange(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={1000}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowChangeModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Room History Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Room {selectedLog.room.unit_number} - Status History
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Current Status:</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(selectedLog.room.current_status).color}`}>
                        {getStatusConfig(selectedLog.room.current_status).label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Total Changes:</span>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {selectedLog.logs.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedLog.logs.map((log, index) => {
                  const previousConfig = getStatusConfig(log.previous_status);
                  const newConfig = getStatusConfig(log.new_status);
                  
                  return (
                    <div key={log.log_id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${previousConfig.color}`}>
                          {previousConfig.label}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${newConfig.color}`}>
                          {newConfig.label}
                        </span>
                        <span className="text-sm text-gray-500 ml-auto">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      
                      {log.reason && (
                        <div className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Reason:</span> {log.reason}
                        </div>
                      )}
                      
                      {log.notes && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {log.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedLog.logs.length === 0 && (
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No status history</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This room has no recorded status changes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { RoomStatusLog };
export default RoomStatusLog;