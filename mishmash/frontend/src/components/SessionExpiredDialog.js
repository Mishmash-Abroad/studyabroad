/**
 * Study Abroad Program - Session Expired Dialog
 * =========================================
 *
 * A dialog component that appears when the user's session has expired,
 * either due to inactivity or reaching the maximum session duration.
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { SESSION_TIMEOUTS } from "../utils/constants";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.shape.borderRadii.large,
    padding: theme.spacing(2),
    maxWidth: 400,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  "& .MuiSvgIcon-root": {
    fontSize: 48,
    color: theme.palette.warning.main,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.error.main,
  fontWeight: 600,
}));

const SessionExpiredDialog = ({ open, reason, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogin = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const getExpirationMessage = () => {
    if (reason === "inactivity") {
      return `Your session has expired due to ${SESSION_TIMEOUTS.INACTIVITY_TEXT} of inactivity.`;
    } else if (reason === "absolute") {
      return `Your session has expired as it reached the ${SESSION_TIMEOUTS.ABSOLUTE_TEXT} limit.`;
    }
    return "Your session has expired. Please log in again to continue.";
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="session-expired-dialog-title"
      aria-describedby="session-expired-dialog-description"
      disableEscapeKeyDown
    >
      <IconWrapper>
        <AccessTimeIcon />
      </IconWrapper>

      <StyledDialogTitle id="session-expired-dialog-title">
        Session Expired
      </StyledDialogTitle>

      <DialogContent>
        <DialogContentText
          id="session-expired-dialog-description"
          sx={{ textAlign: "center", mb: 2 }}
        >
          {getExpirationMessage()}
        </DialogContentText>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          For your security, you have been automatically logged out. Please log
          in again to continue your session.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pt: 2 }}>
        <Button
          onClick={handleLogin}
          variant="contained"
          color="primary"
          autoFocus
          sx={{
            minWidth: 120,
            borderRadius: "borderRadius.medium",
          }}
        >
          Log In Again
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default SessionExpiredDialog;
