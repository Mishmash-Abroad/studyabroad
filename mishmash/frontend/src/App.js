import "./App.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/apply/:id" element={<ApplicationPage />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/apply/:user_id/:program_id" element={<ApplicationPage />} />

          {/* Redirect any other path to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>

        {/* Login Modal */}
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </AuthProvider>
    </Router>
  );
}

export default App;
