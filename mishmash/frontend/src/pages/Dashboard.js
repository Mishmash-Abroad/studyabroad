/**
 * Study Abroad Program - Dashboard Page Component
 * =========================================
 * 
 * This component serves as the main interface for authenticated users,
 * providing access to program browsing and user-specific information.
 * It implements a tabbed interface to organize different sections of
 * functionality.
 * 
 * Features:
 * - Tabbed navigation system
 * - User welcome message
 * - Program browsing integration
 * - Logout functionality
 * - Responsive layout
 * 
 * Tabs:
 * - Overview: Welcome message and quick actions
 * - Programs: Full program browser interface
 * 
 * Used by:
 * - Main application router
 * - Protected route wrapper
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProgramBrowser from '../components/ProgramBrowser';

const Dashboard = () => {
  // State and context management
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  /**
   * Handles user logout action
   * Clears auth state and redirects to home
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Generates styles for tab buttons based on active state
   * 
   * @param {boolean} isActive - Whether the tab is currently active
   * @returns {Object} Style object for the tab
   */
  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: isActive ? '#fff' : '#f0f0f0',
    border: '1px solid #ddd',
    borderBottom: isActive ? 'none' : '1px solid #ddd',
    borderRadius: '4px 4px 0 0',
    marginRight: '5px',
    position: 'relative',
    top: '1px',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  /**
   * Renders content based on active tab
   * 
   * @returns {JSX.Element} Content for the active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'programs':
        return <ProgramBrowser />;
      case 'overview':
      default:
        return (
          <div style={{ padding: '20px' }}>
            <h2>Welcome, {user?.display_name}!</h2>
            <p>View available study abroad programs or check your existing applications.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      paddingTop: '72px', // Account for fixed navbar
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        {/* Dashboard header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ 
            margin: 0,
            color: '#1a237e',
            fontSize: '2rem'
          }}>
            Student Dashboard
          </h1>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        {/* Tab navigation */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={tabStyle(activeTab === 'overview')}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            style={tabStyle(activeTab === 'programs')}
          >
            Browse Programs
          </button>
        </div>

        {/* Tab content */}
        <div style={{ 
          backgroundColor: 'white',
          minHeight: '400px'
        }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
