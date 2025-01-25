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
import {
    NavBar,
    NavLogo,
    NavLogoImage,
    NavTitle,
    NavControls,
    NavButton,
    WelcomeText,
} from './styled';

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
        <NavBar>
            <NavLogo onClick={() => navigate('/')}>
                <NavLogoImage src="/logo.png" alt="HCC Logo" />
                <NavTitle>HCC Study Abroad</NavTitle>
            </NavLogo>

            <NavControls>
                {user ? (
                    <>
                        <WelcomeText>Welcome, {user.display_name}!</WelcomeText>
                        <NavButton variant="light" onClick={() => navigate('/dashboard')}>
                            Dashboard
                        </NavButton>
                        <NavButton variant="transparent" onClick={handleLogout}>
                            Logout
                        </NavButton>
                    </>
                ) : (
                    <NavButton onClick={onLoginClick}>
                        Login
                    </NavButton>
                )}
            </NavControls>
        </NavBar>
    );
}

export default TopNavBar;
