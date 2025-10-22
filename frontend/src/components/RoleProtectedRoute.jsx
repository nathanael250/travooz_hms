import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessSection, canAccessItem } from '../config/rolePermissions';

/**
 * Role-based protected route wrapper
 * Checks if user has permission to access specific routes based on their role
 */
export const RoleProtectedRoute = ({ children, requiredSection, requiredItem }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific permission required, just check authentication
  if (!requiredSection && !requiredItem) {
    return children;
  }

  const userRole = user?.role;

  // Check section-level permission
  if (requiredSection && !canAccessSection(userRole, requiredSection)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this section.
            </p>
            <p className="text-sm text-gray-500">
              Your role: <span className="font-semibold capitalize">{userRole?.replace('_', ' ')}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check item-level permission
  if (requiredItem && !canAccessItem(userRole, requiredItem, requiredSection)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Your role: <span className="font-semibold capitalize">{userRole?.replace('_', ' ')}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
