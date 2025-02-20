import "./App.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TopNavBar from "./components/TopNavBar";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginModal from "./components/LoginModal";
import ApplicationPage from "./pages/ApplicationPage";
import AdminAppView from "./components/AdminAppView";
import SessionExpiredDialog from './components/SessionExpiredDialog';

// Main content component that uses auth context
function AppContent() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { showSessionExpired, sessionExpireReason, handleSessionExpiredClose } = useAuth();

  return (
    <div className="App">
      <TopNavBar onLoginClick={() => setShowLoginModal(true)} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/apply/:program_id" element={<ApplicationPage />} />
        <Route path="/applications/:id" element={<AdminAppView />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect any other path to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>

      {/* Modals */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <SessionExpiredDialog
        open={showSessionExpired}
        reason={sessionExpireReason}
        onClose={handleSessionExpiredClose}
      />
    </div>
  );
}

// Root App component that provides auth context
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
