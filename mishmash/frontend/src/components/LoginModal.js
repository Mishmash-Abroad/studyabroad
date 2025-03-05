import React, { useState, useRef, useEffect } from "react";
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
  padding: "8px 0",
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

const FormButton = styled("button")(
  ({ theme, secondary, small, marginTop }) => ({
    padding: small ? "8px" : "12px",
    backgroundColor: secondary
      ? theme.palette.secondary.main
      : theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    border: "none",
    borderRadius: theme.shape.borderRadii.medium,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    cursor: "pointer",
    transition: theme.transitions.quick,
    marginTop: marginTop || "0",
    "&:hover": {
      backgroundColor: secondary
        ? theme.palette.secondary.dark
        : theme.palette.primary.dark,
    },
    "&:disabled": {
      backgroundColor: theme.palette.status.neutral.light,
      cursor: "not-allowed",
    },
  })
);

const FormError = styled("div")(({ theme }) => ({
  color: theme.palette.status.error.main,
  fontSize: theme.typography.caption.fontSize,
  marginTop: "4px",
}));

const OrText = styled("div")(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.text.secondary,
  margin: "4px 0", // Decreased margin
  fontSize: theme.typography.body2.fontSize,
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
  const navigate = useNavigate();
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaUserData, setMfaUserData] = useState(null);
  const mouseDownInsideModalRef = useRef(false);

  // Add ESC key handler to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
      // Add Enter key handling for the login form when it's visible and signup isn't
      if (e.key === "Enter" && !showSignUpModal) {
        // Only if username and password have values
        if (username && password) {
          e.preventDefault();
          handleSubmitLogin(e);
        }
      }
      // Add Enter key handling for the signup form when it's visible
      else if (e.key === "Enter" && showSignUpModal) {
        // Only if all required fields have values
        if (username && password && confirmPassword && email && displayName) {
          e.preventDefault();
          handleSubmitSignUp(e);
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    onClose,
    username,
    password,
    confirmPassword,
    email,
    displayName,
    showSignUpModal,
  ]);

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
      if (err.response?.status === 403) {
        setError("Invalid username or password");
      } else {
        setError(
          err.response?.data?.detail || "An error occurred during login"
        );
      }
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
      // Handle 400 Bad Request for validation errors
      if (err.response?.status === 400) {
        setError(
          err.response.data.detail || "Please check your input information"
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Error creating account. Username may already exist."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    // Only close if the click both started and ended outside the modal
    if (!mouseDownInsideModalRef.current) {
      onClose();
    }
    // Reset the ref for next click
    mouseDownInsideModalRef.current = false;
  };

  const handleModalMouseDown = (e) => {
    // Mark that mouse down happened inside the modal
    mouseDownInsideModalRef.current = true;
    e.stopPropagation();
  };

  const handleOverlayMouseDown = (e) => {
    // Mark that mouse down happened outside the modal
    mouseDownInsideModalRef.current = false;
  };

  return (
    <>
      <ModalOverlay
        onClick={handleOverlayClick}
        onMouseDown={handleOverlayMouseDown}
      >
        <ModalContainer
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleModalMouseDown}
        >
          <ModalForm onSubmit={handleSubmitLogin}>
            <FormButton type="button" onClick={handleDukeSSOLogin}>
              Login with Duke SSO
            </FormButton>
            <OrText>or</OrText>
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
            <FormButton type="submit" disabled={loading} small secondary>
              {loading ? "Logging in..." : "Login"}
            </FormButton>
            <FormButton
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowSignUpModal(true);
              }}
              small
              secondary
            >
              Don't have an account? Sign Up!
            </FormButton>
          </ModalForm>
        </ModalContainer>
      </ModalOverlay>

      {showSignUpModal && (
        <ModalOverlay
          onClick={handleOverlayClick}
          onMouseDown={handleOverlayMouseDown}
        >
          <ModalContainer
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleModalMouseDown}
          >
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
