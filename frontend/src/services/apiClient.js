import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001') + '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Check for token in localStorage
    const token = localStorage.getItem('hms_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ API Request:', config.method.toUpperCase(), config.url, 'with token');
    } else {
      console.warn('⚠️ API Request:', config.method.toUpperCase(), config.url, 'NO TOKEN FOUND IN LOCALSTORAGE');
      console.warn('Current localStorage keys:', Object.keys(localStorage));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method.toUpperCase(), response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const message = error.response?.data?.message || error.message;
    
    console.error('❌ API Error:', method, url, 'Status:', status, 'Message:', message);
    
    // Special handling for 401 errors
    if (status === 401) {
      console.warn('⚠️ 401 Unauthorized - User may not be logged in or token is invalid');
      const token = localStorage.getItem('hms_token');
      if (!token) {
        console.error('🔴 No token found in localStorage - user needs to login');
      } else {
        console.warn('⚠️ Token exists but API rejected it - token may be expired or invalid');
      }
    }
    
    // Let AuthContext handle 401 errors instead of forcing redirect here
    // This prevents infinite redirect loops
    return Promise.reject(error);
  }
);

export default apiClient;