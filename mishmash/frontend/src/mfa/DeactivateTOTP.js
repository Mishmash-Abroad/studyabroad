import React, { useState } from "react";
import axiosInstance from "../utils/axios";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// -------------------- STYLES --------------------
const DeactivateTOTPContainer = styled("div")(({ theme }) => ({
  paddingTop: "72px",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  overflowY: "auto",
}));

const DeactivateTOTPContent = styled("div")(({ theme }) => ({
  maxWidth: "1500px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.customShadows.card,
  borderRadius: theme.shape.borderRadii.large,
  minHeight: "500px",
}));

const FormContainer = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  maxWidth: "600px",
  margin: "0 auto",
}));

const Button = styled("button")(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.error.main, // Use error color for deactivation
  color: theme.palette.error.contrastText,
  border: "none",
  borderRadius: theme.shape.borderRadii.small,
  fontSize: theme.typography.button.fontSize,
  fontFamily: theme.typography.fontFamily,
  cursor: "pointer",
  transition: theme.transitions.quick,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
}));

const SuccessMessage = styled("div")(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.success.main,
  fontSize: theme.typography.h6.fontSize,
  marginTop: theme.spacing(3),
}));

const ErrorMessage = styled("div")(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.error.main,
  fontSize: theme.typography.body1.fontSize,
  marginTop: theme.spacing(2),
}));

// -------------------- MAIN COMPONENT --------------------
function DeactivateTOTP() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance
      .post("/api/mfa/deactivate_totp_device/")
      .then(() => {
        setSuccess(true);
        setError(null);
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Failed to deactivate TOTP.");
      });
  };

  return (
    <DeactivateTOTPContainer>
      <DeactivateTOTPContent>
        <Typography variant="h3" gutterBottom>
          Deactivate Authenticator App
        </Typography>

        {success ? (
          <SuccessMessage>
            <Typography variant="h6">TOTP deactivated successfully!</Typography>
            <Typography variant="body1">
              You can no longer use your authenticator app for two-factor
              authentication.
            </Typography>
          </SuccessMessage>
        ) : (
          <FormContainer onSubmit={handleSubmit}>
            <Typography variant="body1" fontWeight="bold">
              Are you sure you want to deactivate the authenticator app?
            </Typography>
            <Button type="submit">Deactivate</Button>
          </FormContainer>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </DeactivateTOTPContent>
    </DeactivateTOTPContainer>
  );
}

export default DeactivateTOTP;