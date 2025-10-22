import apiClient from './apiClient';

// Restaurant Tables
export const getRestaurantTables = (params) => apiClient.get('/restaurant/tables', { params });
export const createRestaurantTable = (data) => apiClient.post('/restaurant/tables', data);
export const updateRestaurantTable = (id, data) => apiClient.put(`/restaurant/tables/${id}`, data);
export const deleteRestaurantTable = (id) => apiClient.delete(`/restaurant/tables/${id}`);

// Menu Categories
export const getMenuCategories = (params) => apiClient.get('/restaurant/menu-categories', { params });
export const createMenuCategory = (data) => apiClient.post('/restaurant/menu-categories', data);

// Menu Items
export const getMenuItems = (params) => apiClient.get('/restaurant/menu-items', { params });
export const createMenuItem = (data) => apiClient.post('/restaurant/menu-items', data);
export const updateMenuItem = (id, data) => apiClient.put(`/restaurant/menu-items/${id}`, data);
export const deleteMenuItem = (id) => apiClient.delete(`/restaurant/menu-items/${id}`);

// Restaurant Orders
export const getRestaurantOrders = (params) => apiClient.get('/restaurant/orders', { params });
export const createRestaurantOrder = (data) => apiClient.post('/restaurant/orders', data);
export const updateRestaurantOrder = (id, data) => apiClient.put(`/restaurant/orders/${id}`, data);

// Order Items
export const getOrderItems = (orderId) => apiClient.get(`/restaurant/order-items/${orderId}`);

// Kitchen Queue
export const getKitchenQueue = (params) => apiClient.get('/restaurant/kitchen-queue', { params });
export const startCooking = (id) => apiClient.patch(`/restaurant/kitchen-queue/${id}/start`);
export const completeCooking = (id) => apiClient.patch(`/restaurant/kitchen-queue/${id}/complete`);

// Order Delivery
export const getDeliveryInfo = (orderId) => apiClient.get(`/restaurant/delivery-info/${orderId}`);
export const markAsDelivered = (id, data) => apiClient.patch(`/restaurant/delivery-info/${id}/deliver`, data);
