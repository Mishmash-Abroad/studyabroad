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
 * - Session timeout handling
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
 * - Handles session timeouts
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
// Handles session timeouts and unauthorized responses
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle session timeout responses
            if (error.response.status === 401 && 
                error.response.data?.detail?.includes('Session expired')) {
                // Clear authentication data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Dispatch custom event for session expiry
                const reason = error.response.data.detail.includes('inactivity') 
                    ? 'inactivity' 
                    : 'absolute';
                window.dispatchEvent(new CustomEvent('sessionExpired', { 
                    detail: { reason } 
                }));
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
