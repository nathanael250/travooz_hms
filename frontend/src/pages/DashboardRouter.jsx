import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard } from './Dashboard';
import {
  ReceptionistDashboard,
  HousekeepingDashboard,
  MaintenanceDashboard,
  RestaurantDashboard,
  InventoryDashboard,
  AccountantDashboard,
  StorekeeperDashboard
} from './dashboards';

export const DashboardRouter = () => {
  const { user } = useAuth();
  const role = (user?.role || user?.userType)?.toLowerCase();

  switch (role) {
    case 'vendor':
    case 'manager':
    case 'admin':
      return <Dashboard />; // Use comprehensive hotel management dashboard
    
    case 'receptionist':
      return <ReceptionistDashboard />;
    
    case 'housekeeping':
      return <HousekeepingDashboard />;
    
    case 'maintenance':
      return <MaintenanceDashboard />;
    
    case 'restaurant':
      return <RestaurantDashboard />;
    
    case 'inventory':
    case 'storekeeper':
      return <InventoryDashboard />;
    
    case 'accountant':
      return <AccountantDashboard />;
    
    default:
      return <Dashboard />; // Fallback to comprehensive dashboard
  }
};