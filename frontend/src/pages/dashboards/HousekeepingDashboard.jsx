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

export const HousekeepingDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - replace with API call
  const dashboardData = {
    pendingTasks: 12,
    inProgressTasks: 5,
    completedToday: 28,
    totalRooms: 60,
    myTasks: [
      { id: 1, room: '205', type: 'Full Cleaning', priority: 'high', status: 'pending', estimatedTime: '45 min' },
      { id: 2, room: '301', type: 'Checkout Cleaning', priority: 'high', status: 'in-progress', estimatedTime: '60 min' },
      { id: 3, room: '412', type: 'Touch-up', priority: 'medium', status: 'pending', estimatedTime: '20 min' },
      { id: 4, room: '108', type: 'Deep Cleaning', priority: 'low', status: 'pending', estimatedTime: '90 min' },
    ],
    roomsByStatus: {
      dirty: 12,
      cleaning: 5,
      clean: 38,
      inspectionNeeded: 5
    },
    supplyAlerts: [
      { item: 'Toilet Paper', level: 'critical', remaining: 15 },
      { item: 'Towels', level: 'low', remaining: 25 },
      { item: 'Bed Sheets', level: 'low', remaining: 30 },
    ],
    teamActivity: [
      { name: 'Maria Santos', tasksCompleted: 8, tasksInProgress: 2, status: 'active' },
      { name: 'John Doe', tasksCompleted: 6, tasksInProgress: 1, status: 'active' },
      { name: 'Emma Wilson', tasksCompleted: 7, tasksInProgress: 2, status: 'active' },
    ]
  };

  if (loading) {
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

        {/* My Tasks */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-purple-600" />
            My Tasks
          </h3>
          <div className="space-y-3">
            {dashboardData.myTasks.map((task) => (
              <div key={task.id} className={`p-3 rounded-lg border-l-4 ${
                task.priority === 'high'
                  ? 'bg-red-50 border-red-500'
                  : task.priority === 'medium'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-900">Room {task.room}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Type: <span className="font-medium">{task.type}</span></div>
                  <div>Est. Time: <span className="font-medium">{task.estimatedTime}</span></div>
                </div>
              </div>
            ))}
          </div>
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
