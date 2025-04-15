import React, { useState, useEffect } from "react";
import { styled, useTheme } from '@mui/material/styles';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import axiosInstance from "../utils/axios";
import TopNavBar from "../components/TopNavBar";
import AnnouncementsBrowser from '../components/AnnouncementsBrowser';

// -------------------- STYLES (moved from index.js) --------------------
const HomeContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingTop: '72px',
}));

const Hero = styled('div')(({ theme, customColor }) => ({
  position: 'relative',
  height: '500px',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  marginBottom: '50px',
  backgroundColor: customColor || theme.palette.primary.main,
}));

const HeroOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)', //slight darkening mask
  zIndex: 1,
});

const LogoOverlay = styled('div')({
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

const HeroContent = styled('div')({
  position: 'relative',
  zIndex: 2,
  maxWidth: '800px',
  padding: '0 20px',
});

const HeroTitle = styled('h1')(({ theme }) => ({
  fontSize: theme.typography.h1.fontSize,
  marginBottom: '20px',
  fontWeight: theme.typography.h1.fontWeight,
  color: theme.palette.primary.contrastText,
  textShadow: theme.textShadows.bold,
}));

const HeroText = styled('p')(({ theme }) => ({
  fontSize: theme.typography.h4.fontSize,
  marginBottom: '30px',
  color: theme.palette.primary.contrastText,
  textShadow: theme.textShadows.medium,
}));

const HeroButton = styled('button')(({ theme }) => ({
  padding: '15px 30px',
  fontSize: theme.typography.h5?.fontSize || theme.typography.h4.fontSize,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  border: 'none',
  borderRadius: theme.shape.borderRadii.xl,
  cursor: 'pointer',
  transition: theme.transitions.medium,
  boxShadow: theme.customShadows.button,
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: theme.palette.background.default,
    boxShadow: theme.customShadows.raised,
  },
}));

const FeaturesContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '30px',
  padding: '50px 20px',
  maxWidth: '1200px',
  margin: '0 auto',
}));

const AnnouncementsSection = styled('div')(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto 50px auto',
  padding: '0 20px',
}));

const SectionTitle = styled(Typography)(({ theme, customColor }) => ({
  marginBottom: theme.spacing(3),
  color: customColor || theme.palette.primary.main,
  fontWeight: theme.typography.h4.fontWeight,
}));

const FeatureCard = styled('div')(({ theme }) => ({
  padding: '30px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadii.large,
  boxShadow: theme.customShadows.card,
  textAlign: 'center',
  transition: theme.transitions.quick,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.customShadows.raised,
  },
}));

const FeatureIcon = styled('div')({
  fontSize: '3rem',
  marginBottom: '15px',
});

const FeatureTitle = styled('h3')(({ theme }) => ({
  fontSize: theme.typography.h4.fontSize,
  marginBottom: '10px',
  color: theme.palette.primary.main,
  fontWeight: theme.typography.h4.fontWeight,
  fontFamily: theme.typography.fontFamily,
}));

const FeatureText = styled('p')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: theme.typography.body1.fontSize,
  lineHeight: 1.6,
}));

const GalleryContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  padding: '50px 20px',
  maxWidth: '1200px',
  margin: '0 auto',
}));

const GalleryItem = styled('div')(({ theme }) => ({
  position: 'relative',
  paddingBottom: '66.67%',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadii.large,
  boxShadow: theme.customShadows.card,
  transition: theme.transitions.medium,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.customShadows.raised,
  },
}));

const GalleryImage = styled('img')(({ theme }) => ({
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

// -------------------- COMPONENT LOGIC --------------------
const HomePage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [branding, setBranding] = useState({
    site_name: '',
    primary_color: theme.palette.primary.main,
    welcome_message: 'Welcome to our Study Abroad portal!',
    logo_url: null
  });
  const [loading, setLoading] = useState(true);

// Fetch branding settings
useEffect(() => {
  const fetchBranding = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/branding/current/");
      setBranding({
        site_name: response.data.site_name,
        primary_color: response.data.primary_color,
        welcome_message: response.data.welcome_message || 'Welcome to our Study Abroad portal!',
        logo_url: response.data.logo_url
      });
    } catch (error) {
      console.error("Error fetching branding:", error);
      // Use defaults in case of error
    } finally {
      setLoading(false);
    }
  };

  fetchBranding();
}, []);

// ------------- SSO HANDLING: Check session on mount -------------
useEffect(() => {
  const isAlreadyLoggedIn = !!user;
  
  async function checkSSO() {
    try {
      // Skip the check if user is already logged in
      if (isAlreadyLoggedIn) {
        return;
      }
      
      // Try to get the DRF token using the current session.
      const tokenResponse = await axiosInstance.get("/api/auth/token/");
      if (tokenResponse.data.token) {
        // Get user details.
        const userResponse = await axiosInstance.get("/api/users/current_user/");
        const userData = userResponse.data;
        // Call the login function in your auth context with MFA not required.
        login(userData, tokenResponse.data.token, true);
        // Only redirect if this was an SSO login
        navigate("/dashboard");
      }
    } catch (err) {
      // If no session token is returned, do nothing.
      console.error("No SSO session detected.", err);
    }
  }
  checkSSO();
}, [login, navigate, user]);

  const features = [
    {
      title: 'Global Destinations',
      description: 'Choose from a wide range of locations across Europe, Asia, South America, and beyond.',
      icon: '🌏',
    },
    {
      title: 'Academic Excellence',
      description: 'Earn credits while studying at prestigious partner institutions worldwide.',
      icon: '📚',
    },
    {
      title: 'Cultural Immersion',
      description: 'Engage with local communities through language courses and cultural activities.',
      icon: '🤝',
    },
  ];

  return (
    <HomeContainer>
      <TopNavBar onLoginClick={() => setShowLoginModal(true)} />
      <Hero customColor={branding.primary_color}>
        <HeroOverlay />
        {branding.logo_url ? (
          <LogoOverlay style={{ backgroundImage: `url(${branding.logo_url})` }} />
        ) : (
          <LogoOverlay />
        )}
        <HeroContent>
          {loading ? (
            <CircularProgress size={60} style={{ color: '#fff' }} />
          ) : (
            <>
              <HeroTitle>Discover Your World</HeroTitle>
              <HeroText>
                {user
                  ? `Welcome back, ${user?.display_name}! Continue your journey with us.`
                  : branding.welcome_message}
              </HeroText>
            </>
          )}
          <HeroButton onClick={user ? () => navigate("/dashboard") : () => setShowLoginModal(true)}>
            {user ? "Go to Dashboard" : "Get Started"}
          </HeroButton>
        </HeroContent>
      </Hero>

      <AnnouncementsSection>
        <AnnouncementsBrowser />
      </AnnouncementsSection>

      <FeaturesContainer>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle style={{ color: branding.primary_color }}>{feature.title}</FeatureTitle>
            <FeatureText>{feature.description}</FeatureText>
          </FeatureCard>
        ))}
      </FeaturesContainer>

      <GalleryContainer>
        {[1, 2, 3].map((index) => (
          <GalleryItem key={index}>
            <GalleryImage
              src={`images//study-abroad-${index}.jpg`}
              alt={`Study abroad experience ${index}`}
            />
          </GalleryItem>
        ))}
      </GalleryContainer>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </HomeContainer>
  );
};

export default HomePage;
