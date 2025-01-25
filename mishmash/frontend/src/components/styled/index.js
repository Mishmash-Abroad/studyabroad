import { styled } from '@mui/material/styles';
import { Card, Box, InputBase } from '@mui/material';

export const PageContainer = styled('div')(({ theme }) => ({
  padding: '20px',
  backgroundColor: theme.palette.background.paper,
}));

export const ContentContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: '24px',
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.shadows.card,
  marginBottom: '24px',
}));

export const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  maxWidth: '600px',
  margin: '0 auto 20px',
}));

export const SearchInput = styled(InputBase)(({ theme }) => ({
  width: '100%',
  fontFamily: theme.typography.fontFamily,
  '& .MuiInputBase-input': {
    padding: '12px 48px 12px 48px',
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    border: `2px solid ${theme.palette.border.light}`,
    borderRadius: theme.shape.borderRadius.xl,
    transition: theme.transitions.quick,
    '&:focus': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}1a`,
    },
  },
}));

export const FilterButton = styled('button')(({ theme, active }) => ({
  padding: '8px 16px',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
  color: active ? theme.palette.primary.contrastText : theme.palette.primary.main,
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.border.main}`,
  borderRadius: theme.shape.borderRadius.xl,
  cursor: 'pointer',
  margin: '0 8px',
  transition: theme.transitions.quick,
  fontSize: theme.typography.button.fontSize,
  fontWeight: active ? theme.typography.button.fontWeight : theme.typography.body1.fontWeight,
  fontFamily: theme.typography.fontFamily,
  letterSpacing: theme.typography.button.letterSpacing,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.background.card.hover,
  },
}));

export const ProgramGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '24px',
  padding: '20px 0',
  maxWidth: '1200px',
  margin: '0 auto',
}));

export const ProgramCard = styled(Card)(({ theme, expanded }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius.large,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.card.default,
  boxShadow: expanded ? theme.shadows.raised : theme.shadows.card,
  cursor: 'pointer',
  transition: theme.transitions.medium,
  transform: expanded ? 'scale(1.02)' : 'scale(1)',
  height: expanded ? 'auto' : '200px',
  '&:hover': {
    backgroundColor: theme.palette.background.card.hover,
  },
}));

export const StatusBadge = styled('div')(({ theme, status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'enrolled':
      case 'applied':
        return {
          bg: theme.palette.status.info.background,
          color: theme.palette.status.info.main,
        };
      case 'withdrawn':
      case 'canceled':
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.error.main,
        };
      case 'opening soon':
        return {
          bg: theme.palette.status.warning.background,
          color: theme.palette.status.warning.main,
        };
      case 'closed':
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.error.main,
        };
      case 'open':
        return {
          bg: theme.palette.status.success.background,
          color: theme.palette.status.success.main,
        };
      default:
        return {
          bg: theme.palette.status.neutral.background,
          color: theme.palette.status.neutral.main,
        };
    }
  };

  const colors = getColors();

  return {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '6px 12px',
    borderRadius: theme.shape.borderRadius.xl,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.shadows.button,
    zIndex: 1,
    backgroundColor: colors.bg,
    color: colors.color,
  };
});

export const ApplicationButton = styled('button')(({ theme, variant }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.palette.status.success.main,
          color: theme.palette.status.success.contrastText,
        };
      case 'disabled':
        return {
          bg: theme.palette.status.neutral.light,
          color: theme.palette.status.neutral.contrastText,
        };
      default:
        return {
          bg: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        };
    }
  };

  const colors = getColors();

  return {
    padding: '8px 16px',
    borderRadius: theme.shape.borderRadius.small,
    backgroundColor: colors.bg,
    color: colors.color,
    border: 'none',
    cursor: variant === 'disabled' ? 'not-allowed' : 'pointer',
    transition: theme.transitions.quick,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.button.letterSpacing,
    '&:hover': {
      filter: variant !== 'disabled' ? 'brightness(0.9)' : 'none',
    },
  };
});

export const NavBar = styled('div')(({ theme }) => ({
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

export const NavLogo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
}));

export const NavLogoImage = styled('img')({
  height: '40px',
  width: 'auto',
});

export const NavTitle = styled('span')(({ theme }) => ({
  fontSize: theme.typography.h4.fontSize,
  fontWeight: theme.typography.h4.fontWeight,
  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
}));

export const NavControls = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
});

export const NavButton = styled('button')(({ theme, variant = 'default' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'transparent':
        return {
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        };
      case 'light':
        return {
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.2)',
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

export const WelcomeText = styled('span')(({ theme }) => ({
  color: 'rgba(255,255,255,0.9)',
  fontSize: theme.typography.body1.fontSize,
  fontFamily: theme.typography.fontFamily,
}));

export const DashboardContainer = styled('div')(({ theme }) => ({
  paddingTop: '72px',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

export const DashboardContent = styled('div')(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows.card,
  borderRadius: theme.shape.borderRadius.large,
}));

export const DashboardHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
});

export const DashboardTitle = styled('h1')(({ theme }) => ({
  margin: 0,
  color: theme.palette.primary.main,
  fontSize: theme.typography.h3.fontSize,
  fontWeight: theme.typography.h3.fontWeight,
  fontFamily: theme.typography.fontFamily,
}));

export const TabContainer = styled('div')(({ theme }) => ({
  marginBottom: '20px',
  borderBottom: `1px solid ${theme.palette.border.light}`,
}));

export const TabButton = styled('button')(({ theme, active }) => ({
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

export const TabContent = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  minHeight: '400px',
}));

// HomePage Styled Components
export const HomeContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingTop: '72px',
}));

export const Hero = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '500px',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  marginBottom: '50px',
  backgroundColor: theme.palette.primary.main,
}));

export const HeroOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 1,
});

export const LogoOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'url(/logo.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.2,
  zIndex: 0,
});

export const HeroContent = styled('div')({
  position: 'relative',
  zIndex: 2,
  maxWidth: '800px',
  padding: '0 20px',
});

export const HeroTitle = styled('h1')(({ theme }) => ({
  fontSize: theme.typography.h1.fontSize,
  marginBottom: '20px',
  fontWeight: theme.typography.h1.fontWeight,
  color: theme.palette.primary.contrastText,
  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
}));

export const HeroText = styled('p')(({ theme }) => ({
  fontSize: theme.typography.h4.fontSize,
  marginBottom: '30px',
  color: theme.palette.primary.contrastText,
  textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
}));

export const HeroButton = styled('button')(({ theme }) => ({
  padding: '15px 30px',
  fontSize: theme.typography.h5.fontSize,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  border: 'none',
  borderRadius: theme.shape.borderRadius.xl,
  cursor: 'pointer',
  transition: theme.transitions.medium,
  boxShadow: theme.shadows.button,
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: theme.palette.background.default,
    boxShadow: theme.shadows.raised,
  },
}));

export const FeaturesContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '30px',
  padding: '50px 20px',
  maxWidth: '1200px',
  margin: '0 auto',
}));

export const FeatureCard = styled('div')(({ theme }) => ({
  padding: '30px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.shadows.card,
  textAlign: 'center',
  transition: theme.transitions.quick,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows.raised,
  },
}));

export const FeatureIcon = styled('div')(({ theme }) => ({
  fontSize: '3rem',
  marginBottom: '15px',
}));

export const FeatureTitle = styled('h3')(({ theme }) => ({
  fontSize: theme.typography.h4.fontSize,
  marginBottom: '10px',
  color: theme.palette.primary.main,
  fontWeight: theme.typography.h4.fontWeight,
  fontFamily: theme.typography.fontFamily,
}));

export const FeatureText = styled('p')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: theme.typography.body1.fontSize,
  lineHeight: 1.6,
}));

export const GalleryContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  padding: '50px 20px',
  maxWidth: '1200px',
  margin: '0 auto',
}));

export const GalleryItem = styled('div')(({ theme }) => ({
  position: 'relative',
  paddingBottom: '66.67%',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.shadows.card,
  transition: theme.transitions.medium,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows.raised,
  },
}));

export const GalleryImage = styled('img')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: theme.transitions.medium,
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

// Login Modal Styled Components
export const ModalOverlay = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
}));

export const ModalContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius.large,
  padding: '32px',
  width: '100%',
  maxWidth: '400px',
  position: 'relative',
  boxShadow: theme.shadows.raised,
}));

export const ModalCloseButton = styled('button')(({ theme }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  transition: theme.transitions.quick,
  '&:hover': {
    color: theme.palette.text.primary,
  },
}));

export const ModalTitle = styled('h2')(({ theme }) => ({
  margin: '0 0 24px',
  color: theme.palette.text.primary,
  fontSize: theme.typography.h3.fontSize,
  fontWeight: theme.typography.h3.fontWeight,
  textAlign: 'center',
}));

export const ModalForm = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const FormInput = styled('input')(({ theme }) => ({
  padding: '12px 16px',
  borderRadius: theme.shape.borderRadius.medium,
  border: `1px solid ${theme.palette.border.main}`,
  fontSize: theme.typography.body1.fontSize,
  fontFamily: theme.typography.fontFamily,
  width: '100%',
  transition: theme.transitions.quick,
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
  },
}));

export const FormButton = styled('button')(({ theme }) => ({
  padding: '12px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: 'none',
  borderRadius: theme.shape.borderRadius.medium,
  fontSize: theme.typography.button.fontSize,
  fontWeight: theme.typography.button.fontWeight,
  cursor: 'pointer',
  transition: theme.transitions.quick,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.status.neutral.light,
    cursor: 'not-allowed',
  },
}));

export const FormError = styled('div')(({ theme }) => ({
  color: theme.palette.status.error.main,
  fontSize: theme.typography.caption.fontSize,
  marginTop: '4px',
}));
