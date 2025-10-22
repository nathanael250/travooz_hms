import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import * as maintenanceService from '../../services/maintenanceService';

const MaintenanceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await maintenanceService.getMaintenanceDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        <Activity className="inline mr-2 mb-1" size={32} />
        Maintenance Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalRequests || 0}</p>
            </div>
            <Activity className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.pendingRequests || 0}</p>
            </div>
            <Clock className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-indigo-600">{stats?.inProgressRequests || 0}</p>
            </div>
            <AlertCircle className="text-indigo-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats?.completedRequests || 0}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Requests by Category</h2>
          {stats?.requestsByCategory?.length > 0 ? (
            <div className="space-y-2">
              {stats.requestsByCategory.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{cat.category}</span>
                  <span className="font-semibold text-gray-900">{cat.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Cost Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Cost</span>
              <span className="font-semibold text-gray-900">${parseFloat(stats?.totalCost || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Average Cost</span>
              <span className="font-semibold text-gray-900">${parseFloat(stats?.averageCost || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
