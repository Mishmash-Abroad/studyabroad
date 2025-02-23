import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// -------------------- STYLES --------------------
const ActivateTOTPContainer = styled("div")(({ theme }) => ({
  paddingTop: "72px",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  overflowY: "auto",
}));

const ActivateTOTPContent = styled("div")(({ theme }) => ({
  maxWidth: "1500px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.customShadows.card,
  borderRadius: theme.shape.borderRadius.large,
  minHeight: "500px",
}));

const FormContainer = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  maxWidth: "600px",
  margin: "0 auto",
}));

const FormGroup = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const Input = styled("input")(({ theme }) => ({
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.border.light}`,
  borderRadius: theme.shape.borderRadius.small,
  fontSize: theme.typography.body1.fontSize,
  fontFamily: theme.typography.fontFamily,
  "&:disabled": {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.secondary,
  },
}));

const Button = styled("button")(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: "none",
  borderRadius: theme.shape.borderRadius.small,
  fontSize: theme.typography.button.fontSize,
  fontFamily: theme.typography.fontFamily,
  cursor: "pointer",
  transition: theme.transitions.quick,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
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

const HintText = styled("span")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.secondary,
}));

// -------------------- MAIN COMPONENT --------------------
function ActivateTOTP() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [totpSecret, setTotpSecret] = useState("");
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/api/mfa/generate_totp_secret/")
      .then((response) => {
        setTotpSecret(response.data.message); // Store the TOTP secret
        setQrCode(response.data.qr_code);    // Store the Base64 QR code string
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Failed to create TOTP secret.");
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axiosInstance
      .post("/api/mfa/verify_totp/", { code })
      .then(() => {
        setSuccess(true);
        setError(null);
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Failed to verify TOTP.");
      });
  };

  return (
    <ActivateTOTPContainer>
      <ActivateTOTPContent>
        <Typography variant="h3" gutterBottom>
          Activate Authenticator App
        </Typography>

        {success ? (
          <SuccessMessage>
            <Typography variant="h6">TOTP activated successfully!</Typography>
            <Typography variant="body1">
              You can now use your authenticator app for two-factor authentication.
            </Typography>
          </SuccessMessage>
        ) : (
          <FormContainer onSubmit={handleSubmit}>
            <FormGroup>
              <Typography variant="body1" fontWeight="bold">
                Authenticator Secret:
              </Typography>
              <Input
                disabled
                type="text"
                value={totpSecret}
              />
              <HintText>
                You can store this secret and use it to reinstall your authenticator
                app at a later time.
              </HintText>
            </FormGroup>

            {qrCode && (
              <FormGroup>
                <Typography variant="body1" fontWeight="bold">
                  Scan the QR code with your authenticator app:
                </Typography>
                <img
                  src={`data:image/png;base64,${qrCode}`}  // Display the QR code
                  alt="QR Code"
                  width="200"
                  height="200"
                />
              </FormGroup>
            )}

            <FormGroup>
              <Typography variant="body1" fontWeight="bold">
                Enter the code from your authenticator app:
              </Typography>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="123456"
              />
            </FormGroup>

            <Button type="submit">Activate</Button>
          </FormContainer>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ActivateTOTPContent>
    </ActivateTOTPContainer>
  );
}

export default ActivateTOTP;
