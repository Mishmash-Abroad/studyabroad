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
import axiosInstance from './utils/axios';
import { useAuth } from "./context/AuthContext";
import TopNavBar from "./components/TopNavBar";

/**
 * Login Form Component
 * 
 * Handles user authentication through a form interface.
 * Manages its own state for username, password, and error messages.
 * On successful login, redirects to the dashboard.
 */
const LoginForm = () => {
  // Form state management
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle form submission
   * Attempts to authenticate user with provided credentials
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Attempt login through API
      const response = await axiosInstance.post("/api/login/", {
        username,
        password,
      });
      
      // Handle successful login
      if (response.data.token) {
        const { token, ...userData } = response.data;
        login(userData, token);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || "Invalid username or password");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "20px auto", padding: "20px" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px", backgroundColor: "#007bff", color: "white", border: "none" }}>
          Login
        </button>
      </form>
    </div>
  );
};

/**
 * Home Page Component
 * 
 * Landing page component that displays:
 * - Welcome message
 * - Login form for unauthenticated users
 * - Program information and images
 */
const HomePage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>HCC Study Abroad Program</h1>
      <p>Welcome to the Hypothetical City College Study Abroad Program portal.</p>
      <LoginForm />
      <div>
        {/* Program showcase images */}
        <img
          src="https://student-cms.prd.timeshighereducation.com/sites/default/files/styles/default/public/2023-05/iStock-1371940128.jpg?itok=t4ZO_mEd"
          alt="Happy students smiling and enjoying their time together"
          style={{ width: "30%", borderRadius: "8px" }}
        />
        <img
          src="https://student-cms.prd.timeshighereducation.com/sites/default/files/styles/default/public/2023-05/iStock-1371940128.jpg?itok=t4ZO_mEd"
          alt="Happy students smiling and enjoying their time together"
          style={{ width: "30%", borderRadius: "8px" }}
        />
        <img
          src="https://student-cms.prd.timeshighereducation.com/sites/default/files/styles/default/public/2023-05/iStock-1371940128.jpg?itok=t4ZO_mEd"
          alt="Happy students smiling and enjoying their time together"
          style={{ width: "30%", borderRadius: "8px" }}
        />
      </div>

      <p>
        {/* Program description and highlights */}
        Hypothetical City College Study Abroad Program Discover the world and
        expand your horizons with the Hypothetical City College (HCC) Study
        Abroad Program! Designed to provide students with transformative global
        experiences, our program offers immersive opportunities to study, live,
        and grow in diverse cultural settings around the globe.
        
        **Program Highlights:**
        1. **Global Destinations:** Choose from a wide range of locations including
           Europe, Asia, South America, and beyond. Each destination is carefully
           selected to provide rich educational and cultural experiences.
        2. **Academic Excellence:** Earn credits towards your degree while studying
           at prestigious partner institutions. Our programs include a variety of
           disciplines, ensuring students from all majors can participate.
        3. **Cultural Immersion:** Engage with local communities through language
           courses, cultural activities, and hands-on experiences that will
           shape your future.
        
        For more information, visit our Study Abroad Office or contact us at
        studyabroad@hcc.edu. Your adventure awaits!
      </p>
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
  return (
    <Router>
      <AuthProvider>
        <TopNavBar />
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
      </AuthProvider>
    </Router>
  );
}

export default App;
