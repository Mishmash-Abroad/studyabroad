/**
 * Study Abroad Program - Main Application Component
 * =============================================
 * 
 * This is the root component of the Study Abroad Program application.
 * It handles the application's routing structure, authentication state,
 * and main layout components.
 * 
 * Features:
 * - Authentication state management via AuthProvider
 * - Protected route handling
 * - Main navigation structure
 * - Login form and homepage content
 * 
 * Routes:
 * - /: Public homepage with login
 * - /dashboard: Protected dashboard for authenticated users
 */

import "./App.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import TopNavBar from "./components/TopNavBar";
import LoginModal from "./components/LoginModal";
import axiosInstance from './utils/axios';
import { useAuth } from "./context/AuthContext";

/**
 * Home Page Component
 * 
 * Landing page component that displays:
 * - Welcome message
 * - Login form for unauthenticated users
 * - Program information and images
 */
const HomePage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();

  const Hero = () => (
    <div style={{
      position: 'relative',
      height: '500px',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      marginBottom: '50px',
      backgroundColor: '#1a237e' // Added background color in case image fails to load
    }}>
      {/* Hero background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay
        zIndex: 1
      }} />
      
      {/* Logo overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/logo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.2,
        zIndex: 0
      }} />
      
      {/* Hero content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '800px',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          marginBottom: '20px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
        }}>
          Discover Your World
        </h1>
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '30px',
          color: 'white',
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
        }}>
          {user ? 
            `Welcome back, ${user.first_name}! Continue your journey with us.` :
            'Transform your education through global experiences with HCC Study Abroad'}
        </p>
        {!user && (
          <button 
            onClick={() => setShowLoginModal(true)}
            style={{
              padding: '15px 30px',
              fontSize: '1.2rem',
              backgroundColor: 'white',
              color: '#1a237e',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  );

  const Features = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      padding: '50px 20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {[
        {
          title: 'Global Destinations',
          description: 'Choose from a wide range of locations across Europe, Asia, South America, and beyond.',
          icon: '🌎'
        },
        {
          title: 'Academic Excellence',
          description: 'Earn credits while studying at prestigious partner institutions worldwide.',
          icon: '📚'
        },
        {
          title: 'Cultural Immersion',
          description: 'Engage with local communities through language courses and cultural activities.',
          icon: '🤝'
        }
      ].map((feature, index) => (
        <div key={index} style={{
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{feature.icon}</div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '10px', 
            color: '#1a237e',
            fontWeight: '600' // Enhanced contrast
          }}>
            {feature.title}
          </h3>
          <p style={{ 
            color: '#333' // Darker text for better contrast
          }}>
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );

  const PhotoGallery = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      padding: '50px 20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {[1, 2, 3].map((index) => (
        <div key={index} style={{
          position: 'relative',
          paddingBottom: '66.67%', // 3:2 aspect ratio
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <img
            src={`/study-abroad-${index}.jpg`}
            alt={`Study abroad experience ${index}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      paddingTop: '72px' // Added padding to account for fixed navbar
    }}>
      <Hero />
      <Features />
      <PhotoGallery />
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

/**
 * Root Application Component
 * 
 * Sets up the application structure with:
 * - Router for navigation
 * - Authentication provider for state management
 * - Protected and public routes
 */
function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <TopNavBar onLoginClick={() => setShowLoginModal(true)} />
        <Routes>
          {/* Public homepage route */}
          <Route path="/" element={<HomePage />} />
          
          {/* Protected dashboard route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </AuthProvider>
    </Router>
  );
}

export default App;
