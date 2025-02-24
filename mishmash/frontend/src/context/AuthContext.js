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
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import SessionExpiredDialog from "../components/SessionExpiredDialog";
import { SESSION_TIMEOUTS } from "../utils/constants";

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
  const [sessionExpired, setSessionExpired] = useState(false);
  const [expirationReason, setExpirationReason] = useState(null);
  const navigate = useNavigate();
  

    const savedUser = localStorage.getItem("user");
    return savedUser
      ? JSON.parse(savedUser).user ?? JSON.parse(savedUser)
      : null;
  });

  // Initialize MFA verification state from localStorage if available
  const [isMFAVerified, setIsMFAVerified] = useState(() => {
    const savedAuthState = localStorage.getItem("authState");
    return savedAuthState ? JSON.parse(savedAuthState).isMFAVerified : false;
  });
  
  // Use timeout values from constants
  const INACTIVITY_TIMEOUT = SESSION_TIMEOUTS.INACTIVITY;
  const ABSOLUTE_TIMEOUT = SESSION_TIMEOUTS.ABSOLUTE;

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

      // Check timeouts and set appropriate reason
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        setExpirationReason('inactivity');
        setSessionExpired(true);
      } else if (now - loginTime > ABSOLUTE_TIMEOUT) {
        setExpirationReason('absolute');
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
    const token = localStorage.getItem("token");
    if (token && !user) {
      // Verify token by fetching user data
      axiosInstance
        .get("/api/users/current_user/")
        .then((response) => {
          const userData = response.data.user ?? response.data;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch(() => {
          // Clear invalid authentication data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("authState");
          setUser(null);
          setIsMFAVerified(false);
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
    localStorage.setItem("authState", JSON.stringify({ isMFAVerified }));
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
    setIsMFAVerified(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authState");
    setSessionExpired(false);
    setExpirationReason(null);
    localStorage.removeItem("loginTime");
    localStorage.removeItem("lastActivity");
    navigate("/login");
  };

  /**
   * Handle MFA verification
   * Updates the MFA verification state in context and localStorage
   */
  const verifyMFA = () => {
    setIsMFAVerified(true);
    localStorage.setItem("authState", JSON.stringify({ isMFAVerified: true }));
  }


  const handleSessionExpiredClose = () => {
    setSessionExpired(false);
    setExpirationReason(null);
  };

  // Provide authentication context to child components
  return (
    <AuthContext.Provider value={{ user, isMFAVerified, login, logout, verifyMFA }}>
      <SessionExpiredDialog
        open={sessionExpired}
        reason={expirationReason}
        onClose={handleSessionExpiredClose}
      />
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 *
 * @returns {Object} Authentication context value
 * @property {Object} user - Current user data or null if not authenticated
 * @property {boolean} isMFAVerified - Whether MFA is verified
 * @property {Function} login - Function to handle user login
 * @property {Function} logout - Function to handle user logout
 * @property {Function} verifyMFA - Function to mark MFA as verified
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
