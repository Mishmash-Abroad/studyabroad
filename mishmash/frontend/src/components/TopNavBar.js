/**
 * Study Abroad Program - Top Navigation Bar Component
 * =============================================
 * 
 * This component provides the main navigation header for the application.
 * It displays the application title, user information, and navigation controls
 * based on authentication state.
 * 
 * Features:
 * - Responsive navigation header
 * - Dynamic content based on auth state
 * - User welcome message
 * - Login/Logout functionality
 * - Dashboard navigation
 * 
 * States:
 * - Authenticated: Shows username, dashboard link, and logout
 * - Unauthenticated: Shows login button
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

/**
 * Top Navigation Bar Component
 * 
 * @param {function} onLoginClick - Callback function for login button click
 * @returns {React.ReactElement} The navigation bar component
 */
function TopNavBar({ onLoginClick }) {
    // Get authentication state and navigation function
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * Handle user logout
     * Clears auth state and redirects to home
     */
    const handleLogout = async () => {
        try {
            // Call logout endpoint
            await axiosInstance.post('/api/logout/');
            // Clear auth context
            logout();
            // Navigate to home
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if server call fails
            logout();
            navigate('/');
        }
    };

    return (
        <div style={{
            backgroundColor: '#1a237e',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
        }}>
            {/* Logo and Title */}
            <div 
                onClick={() => navigate('/')}
                style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                }}
            >
                <img 
                    src="/logo.png"
                    alt="HCC Logo"
                    style={{
                        height: '40px',
                        width: 'auto'
                    }}
                />
                <span style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }}>
                    HCC Study Abroad
                </span>
            </div>

            {/* Navigation Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                {user ? (
                    <>
                        <span style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '1rem'
                        }}>
                            Welcome, {user.display_name}!
                        </span>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)'
                                }
                            }}
                        >
                            Dashboard
                        </button>
                        <button 
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={onLoginClick}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#1a237e',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        Login
                    </button>
                )}
            </div>
        </div>
    );
}

export default TopNavBar;
