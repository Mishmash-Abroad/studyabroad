import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// -------------------- STYLES --------------------
const MFAOverviewContainer = styled("div")(({ theme }) => ({
  paddingTop: "72px",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  overflowY: "auto",
}));

const MFAOverviewContent = styled("div")(({ theme }) => ({
  maxWidth: "1500px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.customShadows.card,
  borderRadius: theme.shape.borderRadii.large,
  minHeight: "500px",
}));

const Section = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const LinkButton = styled(Link)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: "none",
  borderRadius: theme.shape.borderRadii.small,
  fontSize: theme.typography.button.fontSize,
  fontFamily: theme.typography.fontFamily,
  textDecoration: "none",
  cursor: "pointer",
  transition: theme.transitions.quick,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const LoadingMessage = styled("div")(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.text.primary,
  fontSize: theme.typography.h6.fontSize,
}));

const ErrorMessage = styled("div")(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.error.main,
  fontSize: theme.typography.body1.fontSize,
}));

// -------------------- MAIN COMPONENT --------------------
function MFAOverview() {
  const [mfaStatus, setMfaStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch MFA status
    axiosInstance
      .get("/api/mfa/status/")
      .then((response) => {
        setMfaStatus(response.data.is_mfa_enabled);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <MFAOverviewContainer>
      <MFAOverviewContent>
        <Typography variant="h3" gutterBottom>
          Two-Factor Authentication
        </Typography>

        <Section>
          <Typography variant="h4" gutterBottom>
            Authenticator App
          </Typography>
          {mfaStatus ? (
            <>
              <Typography variant="body1" paragraph>
                Authentication using an authenticator app is active.
              </Typography>
              <LinkButton to="/mfa/totp/deactivate">Deactivate</LinkButton>
            </>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                An authenticator app is not active.
              </Typography>
              <LinkButton to="/mfa/totp/activate">Activate</LinkButton>
            </>
          )}
        </Section>
      </MFAOverviewContent>
    </MFAOverviewContainer>
  );
}

export default MFAOverview;