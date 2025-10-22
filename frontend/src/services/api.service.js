import apiClient from './apiClient';

// Dashboard API services
export const dashboardService = {
  // Get comprehensive dashboard data
  getDashboardData: async () => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get property overview data
  getPropertyData: async () => {
    try {
      const response = await apiClient.get('/dashboard/property');
      return response.data;
    } catch (error) {
      console.error('Error fetching property data:', error);
      throw error;
    }
  },

  // Get booking statistics
  getBookingStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  },

  // Get room status data
  getRoomStatus: async () => {
    try {
      const response = await apiClient.get('/dashboard/rooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching room status:', error);
      throw error;
    }
  },

  // Get guest activity
  getGuestActivity: async () => {
    try {
      const response = await apiClient.get('/dashboard/guests');
      return response.data;
    } catch (error) {
      console.error('Error fetching guest activity:', error);
      throw error;
    }
  },

  // Get staff data
  getStaffData: async () => {
    try {
      const response = await apiClient.get('/dashboard/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff data:', error);
      throw error;
    }
  },

  // Get financial data
  getFinancialData: async () => {
    try {
      const response = await apiClient.get('/dashboard/financial');
      return response.data;
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw error;
    }
  },

  // Get restaurant data
  getRestaurantData: async () => {
    try {
      const response = await apiClient.get('/dashboard/restaurant');
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      throw error;
    }
  },

  // Get inventory alerts
  getInventoryAlerts: async () => {
    try {
      const response = await apiClient.get('/dashboard/inventory');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      throw error;
    }
  },

  // Get guest requests
  getGuestRequests: async () => {
    try {
      const response = await apiClient.get('/dashboard/requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching guest requests:', error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/dashboard/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }
};

export default apiClient;