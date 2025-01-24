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

/**
 * Top Navigation Bar Component
 * 
 * @returns {React.ReactElement} The navigation bar component
 */
function TopNavBar() {
    // Get authentication state and navigation function
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * Handle user logout
     * Clears auth state and redirects to home
     */
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Styles for the navigation bar
    const navStyle = {
        backgroundColor: '#007bff',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
    };

    // Styles for navigation buttons
    const buttonStyle = {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        cursor: 'pointer',
        marginLeft: '10px'
    };

    return (
        <div style={navStyle}>
            {/* Application Title */}
            <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    HCC Study Abroad
                </span>
            </div>

            {/* Navigation Controls */}
            <div>
                {user ? (
                    // Authenticated User Controls
                    <>
                        <span>Welcome, {user.display_name}!</span>
                        <button 
                            style={buttonStyle} 
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </button>
                        <button 
                            style={buttonStyle} 
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    // Unauthenticated User Controls
                    <button 
                        style={buttonStyle} 
                        onClick={() => navigate('/')}
                    >
                        Login
                    </button>
                )}
            </div>
        </div>
    );
}

export default TopNavBar;
