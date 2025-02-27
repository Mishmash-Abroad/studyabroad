import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import MFALogin from "../mfa/MFAModal";

// -------------------- STYLES --------------------
const ModalOverlay = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)", // slight darkening mask
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1100,
}));

const ModalContainer = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadii.large,
  padding: "32px",
  width: "100%",
  maxWidth: "400px",
  position: "relative",
  boxShadow: theme.customShadows.raised,
}));

const ModalCloseButton = styled("button")(({ theme }) => ({
  position: "absolute",
  top: "16px",
  right: "16px",
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  color: theme.palette.text.secondary,
  transition: theme.transitions.quick,
  "&:hover": {
    color: theme.palette.text.primary,
  },
}));

const ModalTitle = styled("h2")(({ theme }) => ({
  margin: "0 0 24px",
  color: theme.palette.text.primary,
  fontSize: theme.typography.h3.fontSize,
  fontWeight: theme.typography.h3.fontWeight,
  textAlign: "center",
}));

const ModalForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

const FormInput = styled("input")(({ theme }) => ({
  padding: "12px 16px",
  borderRadius: theme.shape.borderRadii.medium,
  border: `1px solid ${theme.palette.border.main}`,
  fontSize: theme.typography.body1.fontSize,
  fontFamily: theme.typography.fontFamily,
  width: "100%",
  transition: theme.transitions.quick,
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
  },
}));

const FormButton = styled("button")(({ theme }) => ({
  padding: "12px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: "none",
  borderRadius: theme.shape.borderRadii.medium,
  fontSize: theme.typography.button.fontSize,
  fontWeight: theme.typography.button.fontWeight,
  cursor: "pointer",
  transition: theme.transitions.quick,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&:disabled": {
    backgroundColor: theme.palette.status.neutral.light,
    cursor: "not-allowed",
  },
}));

const FormError = styled("div")(({ theme }) => ({
  color: theme.palette.status.error.main,
  fontSize: theme.typography.caption.fontSize,
  marginTop: "4px",
}));

// -------------------- COMPONENT LOGIC --------------------
const LoginModal = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, logout, verifyMFA } = useAuth();
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const navigate = useNavigate();
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaUserData, setMfaUserData] = useState(null);

  // ------------- SSO HANDLING: Check session on mount -------------
  useEffect(() => {
    async function checkSSO() {
      try {
        // Try to get the DRF token using the current session.
        const tokenResponse = await axiosInstance.get("/api/auth/token/");
        if (tokenResponse.data.token) {
          // Get user details.
          const userResponse = await axiosInstance.get("/api/users/current_user/");
          const userData = userResponse.data;
          // Call the login function in your auth context.
          login(userData, tokenResponse.data.token, userData.is_mfa_enabled ? false : true);
          // If MFA is enabled, show the MFA modal.
          if (userData.is_mfa_enabled) {
            setIsMFAEnabled(true);
            setMfaToken(tokenResponse.data.token);
            setMfaUserData(userData);
          } else {
            onClose();
            navigate("/dashboard");
          }
        }
      } catch (err) {
        // If no session token is returned, do nothing.
        console.log("No SSO session detected.", err);
      }
    }
    checkSSO();
  }, [login, navigate, onClose]);

  // ------------- EVENT HANDLERS -------------
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/users/login/", {
        username,
        password,
      });

      if (response.data.token) {
        const { token, ...userData } = response.data;
        login(userData, token, userData.is_mfa_enabled ? false : true);
        if (userData.is_mfa_enabled) {
          setIsMFAEnabled(true);
          setMfaToken(token);
          setMfaUserData(userData);
        } else {
          onClose();
          navigate("/dashboard");
        }
      } else {
        throw new Error("Invalid Credentials");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleDukeSSOLogin = () => {
    // Redirect to Django Allauth's Duke SSO login endpoint.
    window.location.href = "/api/accounts/oidc/duke-oidc/login/";
  };

  const handleSubmitSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const testEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/i;
    if (!testEmail.test(email)) {
      setError("Invalid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/api/users/signup/", {
        username,
        password,
        email,
        display_name: displayName,
      });
      if (response.data.token) {
        const { token, ...userData } = response.data;
        login(userData, token);
        onClose();
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
          <ModalTitle>Welcome Back</ModalTitle>
          <ModalForm onSubmit={handleSubmitLogin}>
            <FormInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FormInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <FormError>{error}</FormError>}
            <FormButton type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </FormButton>
            <FormButton type="button" onClick={handleDukeSSOLogin}>
              Login with Duke SSO
            </FormButton>
            <FormButton
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowSignUpModal(true);
              }}
            >
              Don't have an account? Sign Up!
            </FormButton>
          </ModalForm>
        </ModalContainer>
      </ModalOverlay>

      {showSignUpModal && (
        <ModalOverlay onClick={onClose}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
            <ModalTitle>Welcome!</ModalTitle>
            <ModalForm onSubmit={handleSubmitSignUp}>
              <FormInput
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <FormInput
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FormInput
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <FormInput
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormInput
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              {error && <FormError>{error}</FormError>}
              <FormButton type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign up"}
              </FormButton>
              <FormButton
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSignUpModal(false);
                }}
              >
                Already have an account? Login!
              </FormButton>
            </ModalForm>
          </ModalContainer>
        </ModalOverlay>
      )}

      {isMFAEnabled && (
        <MFALogin
          onClose={() => {
            onClose();
            logout();
          }}
          onSuccess={() => {
            onClose();
            verifyMFA();
            navigate("/dashboard");
          }}
        />
      )}
    </>
  );
};

export default LoginModal;
