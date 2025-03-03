import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import { Paper } from "@mui/material";

// -------------------- STYLES --------------------
const ModalOverlay = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1100,
}));

const ModalContainer = styled(Paper)(({ theme }) => ({
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
const ChangePasswordModal = ({ onClose, userId }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.patch("/api/users/change_password/", {
        user_id: userId,
        password,
        confirm_password: confirmPassword,
      })

      if (response.data.token) {
        const { token, ...userData } = response.data;
        onClose();
      }
      
      if (response.status === 200) {
        onClose();
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
        <ModalContainer onClick={(e) => e.stopPropagation()} elevation={3}>
          <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
          <ModalTitle>Change Password?</ModalTitle>

          <ModalForm onSubmit={handleSubmit}>
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

            {error && <FormError>{error}</FormError>}

            <FormButton type="submit" disabled={loading}>
              {loading ? "Changing Password..." : "Change Password"}
            </FormButton>
          </ModalForm>
        </ModalContainer>
      </ModalOverlay>
    </>
  );
};

export default ChangePasswordModal;
