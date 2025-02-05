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

// Log the API base URL for debugging
console.log("API Base URL:", process.env.REACT_APP_API_URL);

// Create a custom axios instance with default configuration
const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "https://dev-mishmash.colab.duke.edu/", 
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
        if (error.response?.status === 401) {
            // Clear invalid credentials and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default instance;
