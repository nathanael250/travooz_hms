import apiClient from './apiClient';

// Stock Items
export const getStockItems = (params) => apiClient.get('/stock/items', { params });
export const getStockItem = (id) => apiClient.get(`/stock/items/${id}`);
export const createStockItem = (data) => apiClient.post('/stock/items', data);
export const updateStockItem = (id, data) => apiClient.put(`/stock/items/${id}`, data);
export const deleteStockItem = (id) => apiClient.delete(`/stock/items/${id}`);

// Stock Movements
export const getStockMovements = (params) => apiClient.get('/stock/movements', { params });
export const createStockMovement = (data) => apiClient.post('/stock/movements', data);

// Suppliers
export const getSuppliers = (params) => apiClient.get('/stock/suppliers', { params });
export const createSupplier = (data) => apiClient.post('/stock/suppliers', data);
export const updateSupplier = (id, data) => apiClient.put(`/stock/suppliers/${id}`, data);
export const deleteSupplier = (id) => apiClient.delete(`/stock/suppliers/${id}`);

// Stock Orders
export const getStockOrders = (params) => apiClient.get('/stock/orders', { params });
export const createStockOrder = (data) => apiClient.post('/stock/orders', data);
export const receiveStockOrder = (id, data) => apiClient.patch(`/stock/orders/${id}/receive`, data);

// Usage Logs
export const getUsageLogs = (params) => apiClient.get('/stock/usage-logs', { params });
export const createUsageLog = (data) => apiClient.post('/stock/usage-logs', data);

// Inventory Alerts
export const getInventoryAlerts = (params) => apiClient.get('/stock/alerts', { params });
