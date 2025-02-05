import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { Menu, MenuItem, IconButton } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';

// -------------------- STYLES --------------------
const NavBar = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: "1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: theme.palette.primary.contrastText,
  boxShadow: theme.customShadows.card,
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
}));

const NavLogo = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
});

const NavLogoImage = styled("img")({
  height: "50px",
  width: "auto",
});

const NavTitle = styled("span")(({ theme }) => ({
  fontSize: theme.typography.h4.fontSize,
  fontWeight: theme.typography.h4.fontWeight,
  textShadow: theme.textShadows.subtle,
}));

const NavControls = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "20px",
});

const NavButton = styled("button")(({ theme, variant = "default" }) => {
  const getStyles = () => {
    switch (variant) {
      case "light":
        return {
          backgroundColor: theme.palette.overlay.faint,
          border: `1px solid ${theme.palette.overlay.subtle}`,
          color: theme.palette.primary.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.overlay.subtle,
          },
        };
      default:
        return {
          backgroundColor: theme.palette.background.paper,
          border: "none",
          color: theme.palette.primary.main,
          fontWeight: theme.typography.button.fontWeight,
          "&:hover": {
            backgroundColor: theme.palette.background.default,
          },
        };
    }
  };

  return {
    padding: "8px 16px",
    borderRadius: theme.shape.borderRadius.small,
    cursor: "pointer",
    transition: theme.transitions.quick,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.button.fontSize,
    ...getStyles(),
  };
});

const WelcomeText = styled("span")(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  fontSize: theme.typography.subtitle2.fontSize,
  opacity: 0.9,
  transition: 'all 0.2s ease',
}));

const UserSection = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  padding: '6px 12px',
  borderRadius: '20px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    },
    '& .user-name': {
      fontWeight: 600,
      opacity: 1,
    },
  },
});

const UserIcon = styled(PersonIcon)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  transition: 'transform 0.2s ease',
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius.large,
    marginTop: '8px',
    minWidth: 180,
    boxShadow: theme.customShadows.raised,
    '& .MuiMenu-list': {
      padding: '8px',
    },
    '& .MuiMenuItem-root': {
      borderRadius: theme.shape.borderRadius.medium,
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.subtitle2.fontWeight,
      padding: '10px 16px',
      margin: '2px 0',
      transition: theme.transitions.quick,
      '&:hover': {
        backgroundColor: theme.palette.primary.main + '10',
      },
      '&:active': {
        backgroundColor: theme.palette.primary.main + '20',
      },
    },
  },
}));

// -------------------- COMPONENT LOGIC --------------------
const LOGO_PATH = "/images/logo.png";

function TopNavBar({onChangePasswordClick,  onLoginClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/logout/");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      logout();
      navigate("/");
    }
  };

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    handleUserMenuClose();
    // added a small delay to ensure menu is closed before modal opens to avoid a change focus issue
    setTimeout(() => {
      onChangePasswordClick();
    }, 100);
  };

  return (
    <NavBar>
      <NavLogo onClick={() => navigate("/")}>
        <NavLogoImage src={LOGO_PATH} alt="HCC Logo" />
        <NavTitle>HCC Study Abroad</NavTitle>
      </NavLogo>

      <NavControls>
        {user ? (
          <>
            <NavButton variant="light" onClick={() => navigate("/dashboard")}>
              Dashboard
            </NavButton>
            <UserSection onClick={handleUserMenuClick}>
              <UserIcon />
              <WelcomeText className="user-name">{user.display_name}</WelcomeText>
            </UserSection>
            <StyledMenu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              elevation={0}
            >
              <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </StyledMenu>
          </>
        ) : (
          <NavButton onClick={onLoginClick}>Login / Sign Up</NavButton>
        )}
      </NavControls>
    </NavBar>
  );
}

export default TopNavBar;
