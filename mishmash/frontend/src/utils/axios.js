/**
 * Study Abroad Program - API Client Configuration
 * ============================================
 * 
 * This module configures and exports a customized Axios instance for making HTTP requests
 * to the backend API. It handles:
 * - Base URL configuration
 * - Authentication token management
 * - Request/response interceptors
 * - Automatic error handling
 * 
 * Used by:
 * - All frontend components making API calls
 * - AuthContext for user authentication
 * - Program and application management features
 * 
 * Security Features:
 * - Automatically attaches authentication tokens to requests
 * - Handles unauthorized responses (401) by logging out
 * - Maintains consistent Content-Type headers
 */

import axios from 'axios';

// Create a custom axios instance with default configuration
const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "mishmash.colab.duke.edu/", 
    headers: {
        'Content-Type': 'application/json',  // Default content type for requests
    },
});

// Request Interceptor
// ------------------
// Automatically adds authentication token to all outgoing requests
instance.interceptors.request.use(
    (config) => {
        // Get token from local storage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to request headers
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request configuration errors
        return Promise.reject(error);
    }
);

// Response Interceptor
// -------------------
// Handles common API response scenarios and errors
instance.interceptors.response.use(
    // Pass through successful responses
    (response) => response,
    
    // Handle response errors
    (error) => {
        // Check for unauthorized access (invalid/expired token)
        if (error.response?.status === 401 && 
            error.config.url !== '/api/users/login/' && // Don't handle 401s from login attempts
            localStorage.getItem('token')) {      // Only handle if we had a token
            // Clear invalid credentials and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        // For 403 (invalid credentials) and other errors, just pass through
        return Promise.reject(error);
    }
);

export default instance;
