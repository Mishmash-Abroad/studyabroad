import "./App.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import axiosInstance from './utils/axios';
import { useAuth } from "./context/AuthContext";
import TopNavBar from "./components/TopNavBar";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/api/login/", {
        username,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        axiosInstance.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
        login(response.data);
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

const HomePage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>HCC Study Abroad Program</h1>
      <p>Welcome to the Hypothetical City College Study Abroad Program portal.</p>
      <LoginForm />
      <div>
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
        Hypothetical City College Study Abroad Program Discover the world and
        expand your horizons with the Hypothetical City College (HCC) Study
        Abroad Program! Designed to provide students with transformative global
        experiences, our program offers immersive opportunities to study, live,
        and grow in diverse cultural settings around the globe. **Program
        Highlights:** 1. **Global Destinations:** Choose from a wide range of
        locations including Europe, Asia, South America, and beyond. Each
        destination is carefully selected to provide rich educational and
        cultural experiences. 2. **Academic Excellence:** Earn credits towards
        your degree while studying at prestigious partner institutions. Our
        programs include a variety of disciplines, ensuring students from all
        majors can participate. 3. **Cultural Immersion:** Engage with local
        communities through language courses, cultural activities, and
        service-learning opportunities. Gain a deeper understanding of different
        perspectives and traditions. 4. **Affordable Opportunities:** We believe
        in making study abroad accessible. Scholarships, grants, and financial
        aid are available to eligible students, helping to reduce program costs.
        5. **Personal Growth:** Develop valuable life skills such as
        adaptability, independence, and intercultural communication. Return home
        with a broader worldview and experiences that will enrich your personal
        and professional life. **Who Can Apply?** The HCC Study Abroad Program
        is open to all currently enrolled students who meet academic and conduct
        requirements. Whether you’re a first-time traveler or an experienced
        globetrotter, our program has something to offer. **How to Get
        Started:** 1. Attend an informational session to learn about program
        options, costs, and application deadlines. 2. Meet with a study abroad
        advisor to explore destinations and tailor the program to your academic
        goals. 3. Submit your application and prepare for the journey of a
        lifetime! **Why Choose HCC Study Abroad?** At Hypothetical City College,
        we are committed to empowering students with global experiences that
        inspire learning, foster personal growth, and prepare them for success
        in an interconnected world. Join us and embark on a journey that will
        shape your future. For more information, visit our Study Abroad Office
        or contact us at studyabroad@hcc.edu. Your adventure awaits!
      </p>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <TopNavBar></TopNavBar>
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
