import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProgramBrowser from '../components/ProgramBrowser';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Student Dashboard</h1>
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

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
          <div
            style={tabStyle(activeTab === 'overview')}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </div>
          <div
            style={tabStyle(activeTab === 'programs')}
            onClick={() => setActiveTab('programs')}
          >
            Browse Programs
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '0 4px 4px 4px',
        minHeight: '400px'
      }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;
