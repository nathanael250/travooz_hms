import React, { useEffect, useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  Package,
  Settings,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

export const MaintenanceDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    urgentRequests: 0,
    inProgress: 0,
    completedToday: 0,
    totalRequests: 0,
    myTasks: [],
    requestsByType: {
      plumbing: 0,
      electrical: 0,
      hvac: 0,
      structural: 0,
      other: 0
    },
    equipmentStatus: [],
    spareParts: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchMaintenanceData();
    return () => clearInterval(timer);
  }, []);

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch maintenance requests from dedicated maintenance API
      const response = await apiClient.get('/maintenance/requests');
      
      let maintenanceRequests = [];
      if (response.data && response.data.success) {
        maintenanceRequests = response.data.data?.requests || response.data.requests || [];
      } else {
        // Fallback: try to fetch from guest-requests and filter
        const fallbackResponse = await apiClient.get('/guest-requests');
        if (fallbackResponse.data && fallbackResponse.data.data) {
          const allRequests = fallbackResponse.data.data.requests || [];
          
          // Filter for maintenance-related requests
          maintenanceRequests = allRequests.filter(request => 
            ['ac_repair', 'plumbing', 'electrical', 'tv_issue', 'wifi_issue', 'heating', 'cooling', 'maintenance', 'repair'].includes(request.request_type) ||
            request.description?.toLowerCase().includes('repair') ||
            request.description?.toLowerCase().includes('fix') ||
            request.description?.toLowerCase().includes('broken') ||
            request.description?.toLowerCase().includes('not working')
          );
        }
      }

      // Process the data
      const today = new Date().toDateString();
      const urgentRequests = maintenanceRequests.filter(r => r.priority === 'urgent' || r.priority === 'high').length;
      const inProgress = maintenanceRequests.filter(r => r.status === 'in_progress').length;
      const completedToday = maintenanceRequests.filter(r => 
        r.status === 'completed' && 
        new Date(r.completed_date || r.completed_time).toDateString() === today
      ).length;

      // Process my tasks (assigned to current user)
      const myTasks = maintenanceRequests
        .filter(r => r.assigned_to === user?.hms_user_id || r.assigned_to === user?.user_id)
        .slice(0, 4)
        .map(request => ({
          id: request.request_id,
          room: request.room?.unit_number || request.room_number || 'N/A',
          issue: request.title || request.description || 'Maintenance Request',
          priority: request.priority || 'medium',
          status: request.status || 'pending',
          reportedBy: request.reportedByUser?.name || request.guest_name || 'Staff',
          reportedTime: getTimeAgo(request.reported_date || request.requested_time || request.created_at)
        }));

      // Process requests by type
      const requestsByType = {
        plumbing: maintenanceRequests.filter(r => r.category === 'plumbing' || r.request_type === 'plumbing').length,
        electrical: maintenanceRequests.filter(r => r.category === 'electrical' || r.request_type === 'electrical').length,
        hvac: maintenanceRequests.filter(r => r.category === 'hvac' || r.request_type === 'ac_repair' || r.request_type === 'heating' || r.request_type === 'cooling').length,
        structural: maintenanceRequests.filter(r => r.category === 'structural' || r.request_type === 'structural').length,
        other: maintenanceRequests.filter(r => !['plumbing', 'electrical', 'hvac', 'structural'].includes(r.category) && !['plumbing', 'electrical', 'ac_repair', 'heating', 'cooling', 'structural'].includes(r.request_type)).length
      };

      setDashboardData({
        urgentRequests,
        inProgress,
        completedToday,
        totalRequests: maintenanceRequests.length,
        myTasks,
        requestsByType,
        equipmentStatus: [], // This would need a separate API call
        spareParts: [] // This would need a separate API call
      });

    } catch (err) {
      console.error('Error fetching maintenance data:', err);
      
      // If maintenance API fails, try guest-requests as fallback
      try {
        console.log('Trying fallback to guest-requests API...');
        const fallbackResponse = await apiClient.get('/guest-requests');
        if (fallbackResponse.data && fallbackResponse.data.data) {
          const allRequests = fallbackResponse.data.data.requests || [];
          
          // Filter for maintenance-related requests
          const maintenanceRequests = allRequests.filter(request => 
            ['ac_repair', 'plumbing', 'electrical', 'tv_issue', 'wifi_issue', 'heating', 'cooling', 'maintenance', 'repair'].includes(request.request_type) ||
            request.description?.toLowerCase().includes('repair') ||
            request.description?.toLowerCase().includes('fix') ||
            request.description?.toLowerCase().includes('broken') ||
            request.description?.toLowerCase().includes('not working')
          );

          // Process the fallback data
          const today = new Date().toDateString();
          const urgentRequests = maintenanceRequests.filter(r => r.priority === 'urgent' || r.priority === 'high').length;
          const inProgress = maintenanceRequests.filter(r => r.status === 'in_progress').length;
          const completedToday = maintenanceRequests.filter(r => 
            r.status === 'completed' && 
            new Date(r.completed_date || r.completed_time).toDateString() === today
          ).length;

          const myTasks = maintenanceRequests
            .filter(r => r.assigned_to === user?.hms_user_id || r.assigned_to === user?.user_id)
            .slice(0, 4)
            .map(request => ({
              id: request.request_id,
              room: request.room?.unit_number || request.room_number || 'N/A',
              issue: request.title || request.description || 'Maintenance Request',
              priority: request.priority || 'medium',
              status: request.status || 'pending',
              reportedBy: request.reportedByUser?.name || request.guest_name || 'Staff',
              reportedTime: getTimeAgo(request.reported_date || request.requested_time || request.created_at)
            }));

          const requestsByType = {
            plumbing: maintenanceRequests.filter(r => r.category === 'plumbing' || r.request_type === 'plumbing').length,
            electrical: maintenanceRequests.filter(r => r.category === 'electrical' || r.request_type === 'electrical').length,
            hvac: maintenanceRequests.filter(r => r.category === 'hvac' || r.request_type === 'ac_repair' || r.request_type === 'heating' || r.request_type === 'cooling').length,
            structural: maintenanceRequests.filter(r => r.category === 'structural' || r.request_type === 'structural').length,
            other: maintenanceRequests.filter(r => !['plumbing', 'electrical', 'hvac', 'structural'].includes(r.category) && !['plumbing', 'electrical', 'ac_repair', 'heating', 'cooling', 'structural'].includes(r.request_type)).length
          };

          setDashboardData({
            urgentRequests,
            inProgress,
            completedToday,
            totalRequests: maintenanceRequests.length,
            myTasks,
            requestsByType,
            equipmentStatus: [],
            spareParts: []
          });
          
          console.log('Successfully loaded data from guest-requests fallback');
          return; // Success with fallback data
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      setError('Failed to load maintenance data');
      
      // Set default empty data to prevent crashes
      setDashboardData({
        urgentRequests: 0,
        inProgress: 0,
        completedToday: 0,
        totalRequests: 0,
        myTasks: [],
        requestsByType: { plumbing: 0, electrical: 0, hvac: 0, structural: 0, other: 0 },
        equipmentStatus: [],
        spareParts: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchMaintenanceData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Maintenance Dashboard</h1>
            <p className="text-orange-100 mt-1 text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100">Welcome</p>
            <p className="font-semibold">{user?.name || 'Maintenance Staff'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 bg-gray-50">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Urgent Requests"
            value={dashboardData.urgentRequests}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="In Progress"
            value={dashboardData.inProgress}
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Completed Today"
            value={dashboardData.completedToday}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Total Requests"
            value={dashboardData.totalRequests}
            icon={ClipboardList}
            color="orange"
          />
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            My Maintenance Tasks
          </h3>
          <div className="space-y-3">
            {dashboardData.myTasks.map((task) => (
              <div key={task.id} className={`p-3 rounded-lg border-l-4 ${
                task.priority === 'urgent'
                  ? 'bg-red-50 border-red-500'
                  : task.priority === 'high'
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-900">{task.room}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'high'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="font-medium text-gray-900">{task.issue}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Reported by: <span className="font-medium">{task.reportedBy}</span></div>
                  <div>Time: <span className="font-medium">{task.reportedTime}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests by Type */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-600" />
            Requests by Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.requestsByType.plumbing}</div>
              <div className="text-sm text-blue-700">Plumbing</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{dashboardData.requestsByType.electrical}</div>
              <div className="text-sm text-yellow-700">Electrical</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{dashboardData.requestsByType.hvac}</div>
              <div className="text-sm text-purple-700">HVAC</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{dashboardData.requestsByType.structural}</div>
              <div className="text-sm text-red-700">Structural</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{dashboardData.requestsByType.other}</div>
              <div className="text-sm text-gray-700">Other</div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipment Status */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Equipment Status
            </h3>
            <div className="space-y-3">
              {dashboardData.equipmentStatus.map((equipment, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{equipment.equipment}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      equipment.status === 'operational'
                        ? 'bg-green-100 text-green-700'
                        : equipment.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {equipment.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Last maintenance: <span className="font-medium">{equipment.lastMaintenance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spare Parts Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-orange-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Spare Parts Inventory
            </h3>
            <div className="space-y-3">
              {dashboardData.spareParts.map((part, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  part.status === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : part.status === 'low'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{part.part}</div>
                      <div className="text-sm text-gray-600">Quantity: {part.quantity} units</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      part.status === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : part.status === 'low'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {part.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-sm p-4 border border-orange-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Today's Performance
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-900">{dashboardData.completedToday}</div>
              <div className="text-sm text-orange-700">Tasks Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-900">85%</div>
              <div className="text-sm text-orange-700">Resolution Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-900">2.5 hrs</div>
              <div className="text-sm text-orange-700">Avg. Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-200' },
    green: { bg: 'bg-green-500', border: 'border-green-200' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-200' },
    red: { bg: 'bg-red-500', border: 'border-red-200' }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 ${colorClasses[color].border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color].bg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
};
