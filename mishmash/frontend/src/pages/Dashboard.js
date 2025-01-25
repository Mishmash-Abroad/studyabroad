import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import ProgramBrowser from '../components/ProgramBrowser';

// -------------------- STYLES (moved from index.js) --------------------
const DashboardContainer = styled('div')(({ theme }) => ({
  paddingTop: '72px',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const DashboardContent = styled('div')(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows.card,
  borderRadius: theme.shape.borderRadius.large,
}));

const DashboardHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

const DashboardTitle = styled('h1')(({ theme }) => ({
  margin: 0,
  color: theme.palette.primary.main,
  fontSize: theme.typography.h3.fontSize,
  fontWeight: theme.typography.h3.fontWeight,
  fontFamily: theme.typography.fontFamily,
}));

const TabContainer = styled('div')(({ theme }) => ({
  marginBottom: '20px',
  borderBottom: `1px solid ${theme.palette.border.light}`,
}));

const TabButton = styled('button')(({ theme, active }) => ({
  padding: '10px 20px',
  cursor: 'pointer',
  backgroundColor: active ? theme.palette.background.paper : theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  borderBottom: active ? 'none' : `1px solid ${theme.palette.border.light}`,
  borderRadius: `${theme.shape.borderRadius.small}px ${theme.shape.borderRadius.small}px 0 0`,
  marginRight: '5px',
  position: 'relative',
  top: '1px',
  fontWeight: active ? theme.typography.button.fontWeight : 'normal',
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.button.fontSize,
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  transition: theme.transitions.quick,
  '&:hover': {
    backgroundColor: active ? theme.palette.background.paper : theme.palette.background.card.hover,
  },
}));

const TabContent = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  minHeight: '400px',
}));

// -------------------- COMPONENT LOGIC --------------------
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
          <DashboardTitle>Student Dashboard</DashboardTitle>
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

        <TabContent>{renderTabContent()}</TabContent>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;