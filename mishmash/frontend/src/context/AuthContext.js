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
 * - Session timeout functionality
 * 
 * Used by:
 * - App.js for global auth state
 * - Login components
 * - Protected routes
 * - Components needing user data
 */

import React, { createContext, useState, useEffect, useContext } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import axiosInstance from "../utils/axios";
import { useNavigate } from "react-router-dom";

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
  const [user, setUser] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();

  // Timers (in ms)
  const INACTIVITY_TIMEOUT = 5 * 1000;  // 5 seconds for testing
  const ABSOLUTE_TIMEOUT = 10 * 1000; // 10 seconds for testing

  // Initialize user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []); // Only run once on mount

  // Session timeout management
  useEffect(() => {
    if (!user) return; // Don't set up timers if no user

    // Initialize or update timestamps
    if (!localStorage.getItem("loginTime")) {
      localStorage.setItem("loginTime", Date.now().toString());
    }
    localStorage.setItem("lastActivity", Date.now().toString());
    
    // Event listener to reset lastActivity
    const resetActivityTimer = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    // Track any events that constitute "activity"
    window.addEventListener("mousemove", resetActivityTimer);
    window.addEventListener("keydown", resetActivityTimer);
    window.addEventListener("click", resetActivityTimer);
    window.addEventListener("touchstart", resetActivityTimer);

    // Check inactivity & absolute timeout periodically
    const checkTimeoutInterval = setInterval(() => {
      const now = Date.now();
      const lastActivity = parseInt(localStorage.getItem("lastActivity"), 10);
      const loginTime = parseInt(localStorage.getItem("loginTime"), 10);

      // Check both timeout conditions
      if (now - lastActivity > INACTIVITY_TIMEOUT || now - loginTime > ABSOLUTE_TIMEOUT) {
        setSessionExpired(true);
      }
    }, 1000); // Check every second for testing purposes

    return () => {
      window.removeEventListener("mousemove", resetActivityTimer);
      window.removeEventListener("keydown", resetActivityTimer);
      window.removeEventListener("click", resetActivityTimer);
      window.removeEventListener("touchstart", resetActivityTimer);
      clearInterval(checkTimeoutInterval);
    };
  }, [user]); // Only re-run when user changes

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
  const login = async (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("loginTime", Date.now().toString());
    localStorage.setItem("lastActivity", Date.now().toString());
    setUser(userData);
  };

  /**
   * Logs out the user
   * Clears authentication state and storage
   */
  const logout = () => {
    setUser(null);
    setSessionExpired(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("lastActivity");
    navigate("/login");
  };

  const handleSessionExpired = () => {
    logout();
  };

  // Provide authentication context to child components
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {/* Session Expired Dialog */}
      <Dialog 
        open={sessionExpired} 
        onClose={handleSessionExpired}
        disableEscapeKeyDown
        disableEnforceFocus
      >
        <DialogTitle>Session Expired</DialogTitle>
        <DialogContent>
          Your session has expired due to inactivity. Please log in again to continue.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSessionExpired} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
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

export default AuthContext;
