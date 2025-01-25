/**
 * Study Abroad Program - Home Page Component
 * =============================================
 * 
 * Landing page component that displays:
 * - Welcome message
 * - Login form for unauthenticated users
 * - Program information and images
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import {
  HomeContainer,
  Hero,
  HeroOverlay,
  LogoOverlay,
  HeroContent,
  HeroTitle,
  HeroText,
  HeroButton,
  FeaturesContainer,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureText,
  GalleryContainer,
  GalleryItem,
  GalleryImage,
} from "../components/styled";

const HomePage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();

  const features = [
    {
      title: 'Global Destinations',
      description: 'Choose from a wide range of locations across Europe, Asia, South America, and beyond.',
      icon: '🌎',
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
      <Hero>
        <HeroOverlay />
        <LogoOverlay />
        <HeroContent>
          <HeroTitle>Discover Your World</HeroTitle>
          <HeroText>
            {user ? 
              `Welcome back, ${user.first_name}! Continue your journey with us.` :
              'Transform your education through global experiences with HCC Study Abroad'}
          </HeroText>
          {!user && (
            <HeroButton onClick={() => setShowLoginModal(true)}>
              Get Started
            </HeroButton>
          )}
        </HeroContent>
      </Hero>

      <FeaturesContainer>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureText>{feature.description}</FeatureText>
          </FeatureCard>
        ))}
      </FeaturesContainer>

      <GalleryContainer>
        {[1, 2, 3].map((index) => (
          <GalleryItem key={index}>
            <GalleryImage
              src={`/study-abroad-${index}.jpg`}
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
