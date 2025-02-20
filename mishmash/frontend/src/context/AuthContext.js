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
 * - Session timeout management (15min inactive, 24hr absolute)
 * 
 * Used by:
 * - App.js for global auth state
 * - Login components
 * - Protected routes
 * - Components needing user data
 */

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../utils/axios';

// Constants for session timeouts (testing values)
const INACTIVITY_TIMEOUT = 30 * 1000; // 30 seconds in milliseconds
const ABSOLUTE_TIMEOUT = 60 * 1000; // 1 minute in milliseconds

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
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // Session expiry state
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [sessionExpireReason, setSessionExpireReason] = useState(null);
  const inactivityTimeoutRef = useRef(null);
  const absoluteTimeoutRef = useRef(null);

  // Reset timers when component unmounts
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (absoluteTimeoutRef.current) clearTimeout(absoluteTimeoutRef.current);
    };
  }, []);

  // Handle user activity
  const resetInactivityTimeout = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (user) {
      inactivityTimeoutRef.current = setTimeout(() => {
        setSessionExpireReason('inactivity');
        setShowSessionExpired(true);
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [user]);

  // Set up activity listeners
  useEffect(() => {
    if (user) {
      // Set up activity monitoring
      const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      activities.forEach(activity => {
        document.addEventListener(activity, resetInactivityTimeout);
      });

      // Initial setup of timeouts
      resetInactivityTimeout();
      absoluteTimeoutRef.current = setTimeout(() => {
        setSessionExpireReason('absolute');
        setShowSessionExpired(true);
        logout();
      }, ABSOLUTE_TIMEOUT);

      return () => {
        // Cleanup activity listeners
        activities.forEach(activity => {
          document.removeEventListener(activity, resetInactivityTimeout);
        });
      };
    }
  }, [user, resetInactivityTimeout]);

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
          // Store valid user data
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
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
    resetInactivityTimeout();
  };

  /**
   * Handle user logout
   * Clears authentication state and storage
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (absoluteTimeoutRef.current) clearTimeout(absoluteTimeoutRef.current);
  }, []);

  // Handle session expired dialog close
  const handleSessionExpiredClose = useCallback(() => {
    setShowSessionExpired(false);
    setSessionExpireReason(null);
  }, []);

  // Provide authentication context to child components
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout,
        showSessionExpired,
        sessionExpireReason,
        handleSessionExpiredClose
      }}
    >
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
 * @property {boolean} showSessionExpired - Whether to show session expired dialog
 * @property {string} sessionExpireReason - Reason for session expiry
 * @property {Function} handleSessionExpiredClose - Handle session expired dialog close
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
