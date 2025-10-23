import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

const HotelAccessGuard = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasHotel, setHasHotel] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkHotelAccess();
  }, []);

  const checkHotelAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to access a hotel-specific endpoint to check if user has hotel access
      const response = await apiClient.get('/guests/search?q=');
      
      if (response.status === 200) {
        setHasHotel(true);
      }
    } catch (error) {
      console.log('Hotel access check error:', error);
      
      if (error.response?.status === 403 && 
          error.response?.data?.message?.includes('not associated with any hotel')) {
        setHasHotel(false);
      } else {
        setError('Failed to check hotel access');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking hotel access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={checkHotelAccess}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If user doesn't have hotel access, redirect to existing hotel creation page
  if (!hasHotel) {
    return <Navigate to="/admin/hotels/homestays/create" replace />;
  }

  // If user has hotel access, render the protected content
  return children;
};

export default HotelAccessGuard;