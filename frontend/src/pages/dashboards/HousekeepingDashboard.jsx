import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ClipboardList,
  Bed,
  Users,
  TrendingUp,
  ListChecks
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import StaffTaskDashboard from '../../components/StaffTaskDashboard';
import apiClient from '../../services/apiClient';

export const HousekeepingDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    pendingTasks: 0,
    inProgressTasks: 0,
    completedToday: 0,
    totalRooms: 0,
    roomsByStatus: {
      dirty: 0,
      cleaning: 0,
      clean: 0,
      inspectionNeeded: 0
    },
    supplyAlerts: [],
    teamActivity: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all guest requests for this hotel
      const response = await apiClient.get('/guest-requests');
      
      if (response.data && response.data.data) {
        const requests = response.data.data.requests || [];
        
        // Calculate statistics
        const today = new Date().toDateString();
        
        const pendingCount = requests.filter(r => r.status === 'pending').length;
        const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
        const completedCount = requests.filter(r => 
          r.status === 'completed' && 
          new Date(r.completed_time).toDateString() === today
        ).length;

        // Group by request type for activity summary
        const teamActivityMap = {};
        requests.forEach(request => {
          if (request.assigned_staff_name) {
            if (!teamActivityMap[request.assigned_staff_name]) {
              teamActivityMap[request.assigned_staff_name] = {
                name: request.assigned_staff_name,
                tasksCompleted: 0,
                tasksInProgress: 0,
                status: 'active'
              };
            }
            if (request.status === 'completed') {
              teamActivityMap[request.assigned_staff_name].tasksCompleted++;
            } else if (request.status === 'in_progress') {
              teamActivityMap[request.assigned_staff_name].tasksInProgress++;
            }
          }
        });

        const teamActivity = Object.values(teamActivityMap);

        setDashboardData({
          pendingTasks: pendingCount,
          inProgressTasks: inProgressCount,
          completedToday: completedCount,
          totalRooms: 60, // This could be fetched from a rooms endpoint if needed
          roomsByStatus: {
            dirty: 12,        // These could be fetched from room status endpoint
            cleaning: 5,
            clean: 38,
            inspectionNeeded: 5
          },
          supplyAlerts: [
            // Supply alerts can be fetched from a stock management endpoint
            { item: 'Toilet Paper', level: 'critical', remaining: 15 },
            { item: 'Towels', level: 'low', remaining: 25 },
            { item: 'Bed Sheets', level: 'low', remaining: 30 },
          ],
          teamActivity: teamActivity.length > 0 ? teamActivity : [
            { name: 'No team members', tasksCompleted: 0, tasksInProgress: 0, status: 'inactive' }
          ]
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && Object.values(dashboardData.roomsByStatus).every(v => v === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Housekeeping Dashboard</h1>
            <p className="text-purple-100 mt-1 text-sm">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Welcome</p>
            <p className="font-semibold">{user?.name || 'Housekeeping Staff'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 bg-gray-50">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error loading dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending Tasks"
            value={dashboardData.pendingTasks}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="In Progress"
            value={dashboardData.inProgressTasks}
            icon={ClipboardList}
            color="blue"
          />
          <StatCard
            title="Completed Today"
            value={dashboardData.completedToday}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Total Rooms"
            value={dashboardData.totalRooms}
            icon={Bed}
            color="purple"
          />
        </div>

        {/* Guest Request Tasks - Integrated Task Management */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-purple-600" />
            My Assigned Tasks
          </h3>
          <StaffTaskDashboard staffRole="housekeeping" />
        </div>

        {/* Room Status Overview */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="h-5 w-5 text-purple-600" />
            Room Status Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{dashboardData.roomsByStatus.dirty}</div>
              <div className="text-sm text-red-700">Needs Cleaning</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.roomsByStatus.cleaning}</div>
              <div className="text-sm text-blue-700">Being Cleaned</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{dashboardData.roomsByStatus.clean}</div>
              <div className="text-sm text-green-700">Clean & Ready</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{dashboardData.roomsByStatus.inspectionNeeded}</div>
              <div className="text-sm text-yellow-700">Inspection Needed</div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supply Alerts */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-orange-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Supply Alerts
            </h3>
            <div className="space-y-3">
              {dashboardData.supplyAlerts.map((supply, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  supply.level === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{supply.item}</div>
                      <div className="text-sm text-gray-600">Remaining: {supply.remaining} units</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      supply.level === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {supply.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Activity */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Team Activity
            </h3>
            <div className="space-y-3">
              {dashboardData.teamActivity.map((member, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      {member.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Completed: <span className="font-medium text-green-600">{member.tasksCompleted}</span></div>
                    <div>In Progress: <span className="font-medium text-blue-600">{member.tasksInProgress}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm p-4 border border-purple-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Today's Performance
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-900">{dashboardData.completedToday}</div>
              <div className="text-sm text-purple-700">Rooms Cleaned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">95%</div>
              <div className="text-sm text-purple-700">Completion Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">42 min</div>
              <div className="text-sm text-purple-700">Avg. Time/Room</div>
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
    purple: { bg: 'bg-purple-500', border: 'border-purple-200' }
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
