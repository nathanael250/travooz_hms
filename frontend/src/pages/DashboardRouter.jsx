import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard } from './Dashboard'; // Hotel Manager Dashboard
import {
  ReceptionistDashboard,
  HousekeepingDashboard,
  MaintenanceDashboard,
  RestaurantDashboard,
  InventoryDashboard,
  AccountantDashboard
} from './dashboards';

/**
 * DashboardRouter - Routes to the appropriate dashboard based on user role
 *
 * Role mapping:
 * - manager, vendor, admin -> Hotel Manager Dashboard (full dashboard)
 * - receptionist -> Receptionist Dashboard (front desk focus)
 * - housekeeping -> Housekeeping Dashboard (cleaning tasks focus)
 * - maintenance -> Maintenance Dashboard (repair requests focus)
 * - restaurant -> Restaurant Dashboard (orders & kitchen focus)
 * - inventory -> Inventory Dashboard (stock management focus)
 * - accountant -> Accountant Dashboard (financial focus)
 */
export const DashboardRouter = () => {
  const { user } = useAuth();

  // Check both role and userType fields (HMS users have role, regular users have userType)
  const role = (user?.role || user?.userType)?.toLowerCase();

  // Debug logging
  console.log('DashboardRouter - User:', user);
  console.log('DashboardRouter - User Role:', user?.role);
  console.log('DashboardRouter - User Type:', user?.userType);
  console.log('DashboardRouter - Resolved Role:', role);

  // Route to appropriate dashboard based on role
  switch (role) {
    case 'receptionist':
      return <ReceptionistDashboard />;

    case 'housekeeping':
      return <HousekeepingDashboard />;

    case 'maintenance':
      return <MaintenanceDashboard />;

    case 'restaurant':
      return <RestaurantDashboard />;

    case 'inventory':
      return <InventoryDashboard />;

    case 'accountant':
      return <AccountantDashboard />;

    // Hotel Manager, Vendor, Admin, and other roles get the full dashboard
    case 'manager':
    case 'vendor':
    case 'admin':
    default:
      return <Dashboard />;
  }
};
