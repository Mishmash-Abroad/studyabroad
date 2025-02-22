/**
 * Study Abroad Program - Authentication Context
 * =========================================
 * 
 * This module provides global authentication state management using React Context.
 * It handles user authentication state, token management, and persistence across
 * page refreshes.
 * 
 * Features:
 * - Persistent authentication state using localStorage
 * - Automatic token verification on app startup
 * - Login/logout functionality
 * - User data management
 * 
 * Used by:
 * - App.js for global auth state
 * - Login components
 * - Protected routes
 * - Components needing user data
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';

// Create context for authentication state
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * 
 * Wraps the application and provides authentication state and methods
 * to all child components.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 */
export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).user ?? JSON.parse(savedUser) : null;
  });

  /**
   * Effect hook to verify token and fetch user data on mount
   * This ensures the stored token is still valid when the app loads
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // Verify token by fetching user data
      axiosInstance.get('/api/users/current_user/')
        .then(response => {
          const userData = response.data.user ?? response.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          // Clear invalid authentication data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
    }
  }, []);

  /**
   * Handle user login
   * Stores user data and token in state and localStorage
   * 
   * @param {Object} userData - User information from API
   * @param {string} token - Authentication token
   */
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  /**
   * Handle user logout
   * Clears authentication state and storage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Provide authentication context to child components
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * 
 * @returns {Object} Authentication context value
 * @property {Object} user - Current user data or null if not authenticated
 * @property {Function} login - Function to handle user login
 * @property {Function} logout - Function to handle user logout
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
