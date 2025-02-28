import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

// -------------------- STYLES --------------------
const ModalOverlay = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)", // Slight darkening mask
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
const MFAModal = ({ onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send the TOTP code to the backend for verification
      const response = await axiosInstance.post("/api/mfa/verify_totp/", { code });

      if (response.data.success) {
        onSuccess();
      } else {
        setError("Invalid TOTP code. Please try again.");
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.error || "Failed to verify TOTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
        <ModalTitle>Two-Factor Authentication</ModalTitle>

        <ModalForm onSubmit={handleSubmit}>
          <FormInput
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter TOTP code"
            required
          />

          {error && <FormError>{error}</FormError>}

          <FormButton type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </FormButton>
        </ModalForm>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default MFAModal;
