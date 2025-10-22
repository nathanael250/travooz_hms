import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';

const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback || (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">Please try refreshing the page</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </Card>
    );
  }

  return children;
};

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

const EmptyState = ({ 
  title = 'No data found', 
  description = 'There are no items to display', 
  action = null 
}) => (
  <Card className="p-8 text-center">
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action}
  </Card>
);

const PermissionGuard = ({ requiredRole, children, fallback }) => {
  const { user } = useAuth();
  
  const hasPermission = () => {
    if (!requiredRole) return true;
    if (!user) return false;
    
    const roleHierarchy = {
      super_admin: 6,
      admin: 5,
      hotel_manager: 4,
      front_desk: 3,
      housekeeping: 2,
      staff: 1
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  if (!hasPermission()) {
    return fallback || (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-medium text-red-600 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to view this content</p>
      </Card>
    );
  }

  return children;
};

export { ErrorBoundary, LoadingSpinner, EmptyState, PermissionGuard };