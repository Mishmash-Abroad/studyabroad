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
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import TopNavBar from "./components/TopNavBar";
import LoginModal from "./components/LoginModal";
import ApplicationPage from "./pages/ApplicationPage";
function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <TopNavBar onLoginClick={() => setShowLoginModal(true)} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/apply/:user_id/:program_id" element={<ApplicationPage />} />
        </Routes>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </AuthProvider>
    </Router>
  );
}

export default App;
