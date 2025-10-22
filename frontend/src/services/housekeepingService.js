import apiClient from './apiClient';

// Housekeeping Tasks
export const getHousekeepingTasks = (params) => {
  return apiClient.get('/housekeeping/tasks', { params });
};

export const getHousekeepingTask = (id) => {
  return apiClient.get(`/housekeeping/tasks/${id}`);
};

export const createHousekeepingTask = (data) => {
  return apiClient.post('/housekeeping/tasks', data);
};

export const updateHousekeepingTask = (id, data) => {
  return apiClient.put(`/housekeeping/tasks/${id}`, data);
};

export const deleteHousekeepingTask = (id) => {
  return apiClient.delete(`/housekeeping/tasks/${id}`);
};

export const assignHousekeepingTask = (id, staffId) => {
  return apiClient.patch(`/housekeeping/tasks/${id}/assign`, { assigned_to: staffId });
};

export const startHousekeepingTask = (id) => {
  return apiClient.patch(`/housekeeping/tasks/${id}/start`);
};

export const completeHousekeepingTask = (id, data) => {
  return apiClient.patch(`/housekeeping/tasks/${id}/complete`, data);
};

export const getHousekeepingDashboard = (homestayId) => {
  return apiClient.get('/housekeeping/dashboard', { 
    params: homestayId ? { homestay_id: homestayId } : {} 
  });
};

export const getMyTasks = (status) => {
  return apiClient.get('/housekeeping/my-tasks', {
    params: status ? { status } : {}
  });
};
