import "./App.css";
import React, { useState } from "react";
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
import UlinkConnection from "./components/UlinkConnection";

function App() {
  // const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <Router>
      <AuthProvider>
      <TopNavBar/>
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
          <Route
            path="/connect-transcript-provider"
            element={
              <ProtectedRoute>
                <UlinkConnection />
              </ProtectedRoute>
            }
          />
          {/* Redirect any other path to Dashboard */}
          {/* Alexis - I changed this logic TODO might have to change back /dashboard*/}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
