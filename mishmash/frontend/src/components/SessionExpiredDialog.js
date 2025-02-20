/**
 * Study Abroad Program - Session Expired Dialog
 * =========================================
 * 
 * A dialog component that appears when the user's session has expired,
 * either due to inactivity or reaching the maximum session duration.
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SessionExpiredDialog = ({ open, reason, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogin = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="session-expired-dialog-title"
      aria-describedby="session-expired-dialog-description"
    >
      <DialogTitle id="session-expired-dialog-title">
        Session Expired
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="session-expired-dialog-description">
          {reason === 'inactivity'
            ? 'Your session has expired due to 15 minutes of inactivity.'
            : 'Your session has expired as it reached the 24-hour limit.'}
          {' '}Please log in again to continue.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogin} color="primary" autoFocus>
          Go to Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiredDialog;
