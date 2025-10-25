import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * RoleBasedRedirect - Redirects users to their role-specific dashboard
 * 
 * Role mapping:
 * - housekeeping -> /housekeeping/dashboard
 * - receptionist -> /front-desk/bookings (or receptionist dashboard)
 * - maintenance -> /maintenance/dashboard
 * - restaurant -> /restaurant/tables (or restaurant dashboard)
 * - inventory -> /stock/items (or inventory dashboard)
 * - accountant -> /dashboard (accountant dashboard)
 * - manager, vendor, admin -> /dashboard (full dashboard)
 */
export const RoleBasedRedirect = () => {
  const { user } = useAuth();

  // Check both role and userType fields (HMS users have role, regular users have userType)
  const role = (user?.role || user?.userType)?.toLowerCase();

  // Debug logging
  console.log('RoleBasedRedirect - User:', user);
  console.log('RoleBasedRedirect - User Role:', user?.role);
  console.log('RoleBasedRedirect - User Type:', user?.userType);
  console.log('RoleBasedRedirect - Resolved Role:', role);

  // Route to appropriate dashboard based on role
  switch (role) {
    case 'housekeeping':
      return <Navigate to="/housekeeping/dashboard" replace />;

    case 'receptionist':
      return <Navigate to="/front-desk/dashboard" replace />;

    case 'maintenance':
      return <Navigate to="/maintenance/dashboard" replace />;

    case 'restaurant':
      return <Navigate to="/restaurant/dashboard" replace />;

    case 'inventory':
    case 'storekeeper':
      return <Navigate to="/inventory/dashboard" replace />;
    
    case 'accountant':
      return <Navigate to="/dashboard" replace />;

    // Hotel Manager, Vendor, Admin, and other roles get the main dashboard
    case 'manager':
    case 'vendor':
    case 'admin':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};
