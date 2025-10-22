import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth on mount - check for existing token
  useEffect(() => {
    const initAuth = async () => {
      console.log('=== Auth Initialization Started ===');
      
      try {
        const token = localStorage.getItem('hms_token');
        console.log('InitAuth - Token exists:', !!token);
        
        if (token) {
          try {
            console.log('InitAuth - Fetching user profile...');
            const userData = await authService.getProfile();
            console.log('InitAuth - Profile fetched successfully:', userData);
            setUser(userData);
          } catch (error) {
            console.error('InitAuth - Profile fetch failed:', error);
            // Token is invalid - clear it
            localStorage.removeItem('hms_token');
            setUser(null);
          }
        } else {
          console.log('InitAuth - No token found');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
        console.log('=== Auth Initialization Complete ===');
      }
    };

    initAuth();
  }, []); // Only run once on mount

  const login = async (credentials) => {
    try {
      console.log('=== Login Started ===');
      console.log('Login attempt with:', credentials.email);
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      // API returns: { success: true, message: '...', data: { user, token } }
      // Handle both nested data structure and direct response
      const data = response.data || response;
      const { user: userData, token } = data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      console.log('User data:', userData);
      console.log('✅ Token received and storing:', token.substring(0, 20) + '...');
      console.log('User type:', userData.userType);
      console.log('User role:', userData.role);
      
      // Store token BEFORE setting user to ensure it's available
      localStorage.setItem('hms_token', token);
      console.log('✅ Token stored in localStorage');
      console.log('Verify token in storage:', localStorage.getItem('hms_token') ? '✅ YES' : '❌ NO');
      
      setUser(userData);
      setLoading(false);
      
      // All users go to dashboard (role-based menu filtering handles the rest)
      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard', { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('=== Registration Started ===');
      const response = await authService.register(userData);
      // API returns: { success: true, message: '...', data: { user, token } }
      const { user: newUser, token } = response.data;
      
      localStorage.setItem('hms_token', token);
      setUser(newUser);
      setLoading(false);
      
      // All users go to dashboard (role-based menu filtering handles the rest)
      console.log('Registration successful, navigating to dashboard');
      navigate('/dashboard', { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      console.log('=== Logout Started ===');
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('hms_token');
      setUser(null);
      setLoading(false);
      console.log('Logout complete, navigating to login...');
      navigate('/login', { replace: true });
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};