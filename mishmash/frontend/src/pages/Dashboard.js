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
 * - Responsive layout
 * 
 * Tabs:
 * - Overview: Welcome message and quick actions
 * - Programs: Full program browser interface
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProgramBrowser from '../components/ProgramBrowser';
import {
  DashboardContainer,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
  TabContainer,
  TabButton,
  TabContent,
} from '../components/styled';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
    <DashboardContainer>
      <DashboardContent>
        <DashboardHeader>
          <DashboardTitle>
            Student Dashboard
          </DashboardTitle>
        </DashboardHeader>

        <TabContainer>
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'programs'}
            onClick={() => setActiveTab('programs')}
          >
            Browse Programs
          </TabButton>
        </TabContainer>

        <TabContent>
          {renderTabContent()}
        </TabContent>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;
