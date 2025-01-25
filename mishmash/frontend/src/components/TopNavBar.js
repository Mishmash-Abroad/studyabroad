import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

// -------------------- STYLES --------------------
const NavBar = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows.card,
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
}));

const NavLogo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
});

const NavLogoImage = styled('img')({
  height: '40px',
  width: 'auto',
});

const NavTitle = styled('span')(({ theme }) => ({
  fontSize: theme.typography.h4.fontSize,
  fontWeight: theme.typography.h4.fontWeight,
  textShadow: theme.textShadows.subtle,
}));

const NavControls = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
});

const NavButton = styled('button')(({ theme, variant = 'default' }) => {
  const getStyles = () => {
    switch (variant) {
      // case 'transparent':
      //   return {
      //     backgroundColor: 'transparent',
      //     border: `1px solid ${theme.palette.overlay.subtle}`,
      //     '&:hover': {
      //       backgroundColor: theme.palette.overlay.faint,
      //     },
      //   };
      case 'light':
        return {
          backgroundColor: theme.palette.overlay.faint,
          border: `1px solid ${theme.palette.overlay.subtle}`,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.overlay.subtle,
          },
        };
      default:
        return {
          backgroundColor: theme.palette.background.paper,
          border: 'none',
          color: theme.palette.primary.main,
          fontWeight: theme.typography.button.fontWeight,
          '&:hover': {
            backgroundColor: theme.palette.background.default,
          },
        };
    }
  };

  return {
    padding: '8px 16px',
    borderRadius: theme.shape.borderRadius.small,
    cursor: 'pointer',
    transition: theme.transitions.quick,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.button.fontSize,
    ...getStyles(),
  };
});

const WelcomeText = styled('span')(({ theme }) => ({
  color: theme.palette.overlay.nearWhite,
  fontSize: theme.typography.body1.fontSize,
  fontFamily: theme.typography.fontFamily,
}));

// -------------------- COMPONENT LOGIC --------------------
function TopNavBar({ onLoginClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/logout/');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
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
            <NavButton variant="light" onClick={handleLogout}>
              Logout
            </NavButton>
          </>
        ) : (
          <NavButton onClick={onLoginClick}>Login</NavButton>
        )}
      </NavControls>
    </NavBar>
  );
}

export default TopNavBar;
