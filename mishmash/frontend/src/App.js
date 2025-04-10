import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { updateDocumentTitle, updateFavicon } from "./utils/brandingUtils";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import TopNavBar from "./components/TopNavBar";
import LoginModal from "./components/LoginModal";
import ApplicationPage from "./pages/ApplicationPage";
import AdminAppView from "./components/AdminAppView";
import MFAOverview from "./mfa/MFAOverview";
import ActivateTOTP from "./mfa/ActivateTOTP";
import DeactivateTOTP from "./mfa/DeactivateTOTP";
import PublicLetterUploadPage from "./pages/PublicLetterUploadPage";

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch site branding and update document title and favicon
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        // API endpoint for site branding
        const response = await axios.get('/api/site-branding/');
        
        if (response.data && response.data.length > 0) {
          const branding = response.data[0];
          
          // Update document title if site name exists
          if (branding.site_name) {
            updateDocumentTitle(branding.site_name);
          }
          
          // Update favicon if logo exists
          if (branding.logo_url) {
            updateFavicon(branding.logo_url, branding.primary_color);
          }
        }
      } catch (error) {
        console.error('Error fetching site branding:', error);
        // If there's an error, we'll just keep the default title and favicon
      }
    };
    
    fetchBranding();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <TopNavBar onLoginClick={() => setShowLoginModal(true)} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/apply/:program_id" element={<ApplicationPage />} />
          <Route path="/applications/:id" element={<AdminAppView />} />
          <Route path="/letters/:id" element={<PublicLetterUploadPage />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mfa"
            element={
              <ProtectedRoute>
                <MFAOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mfa/totp/activate"
            element={
              <ProtectedRoute>
                <ActivateTOTP />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mfa/totp/deactivate"
            element={
              <ProtectedRoute>
                <DeactivateTOTP />
              </ProtectedRoute>
            }
          />
          {/* Redirect any other path to Dashboard */}
          {/* Alexis - I changed this logic TODO might have to change back /dashboard*/}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </AuthProvider>
    </Router>
  );
}

export default App;
