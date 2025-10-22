import apiClient from './apiClient';

// Maintenance Requests
export const getMaintenanceRequests = (params) => {
  return apiClient.get('/maintenance/requests', { params });
};

export const getMaintenanceRequest = (id) => {
  return apiClient.get(`/maintenance/requests/${id}`);
};

export const createMaintenanceRequest = (data) => {
  return apiClient.post('/maintenance/requests', data);
};

export const updateMaintenanceRequest = (id, data) => {
  return apiClient.put(`/maintenance/requests/${id}`, data);
};

export const deleteMaintenanceRequest = (id) => {
  return apiClient.delete(`/maintenance/requests/${id}`);
};

export const assignMaintenanceRequest = (id, staffId) => {
  return apiClient.patch(`/maintenance/requests/${id}/assign`, { assigned_to: staffId });
};

export const completeMaintenanceRequest = (id, data) => {
  return apiClient.patch(`/maintenance/requests/${id}/complete`, data);
};

export const getMaintenanceDashboard = (homestayId) => {
  return apiClient.get('/maintenance/dashboard', { 
    params: homestayId ? { homestay_id: homestayId } : {} 
  });
};

// Maintenance Assets
export const getMaintenanceAssets = (params) => {
  return apiClient.get('/maintenance/assets', { params });
};

export const createMaintenanceAsset = (data) => {
  return apiClient.post('/maintenance/assets', data);
};

export const updateMaintenanceAsset = (id, data) => {
  return apiClient.put(`/maintenance/assets/${id}`, data);
};

export const deleteMaintenanceAsset = (id) => {
  return apiClient.delete(`/maintenance/assets/${id}`);
};
