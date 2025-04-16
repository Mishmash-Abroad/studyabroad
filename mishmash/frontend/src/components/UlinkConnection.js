import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from "@mui/material";

const UlinkConnection = () => {
  const { user, refreshUser } = useAuth();
  const [ulinkUsername, setUlinkUsername] = useState("");
  const [ulinkPin, setUlinkPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const response = await axiosInstance.post(
        `/api/users/${user.id}/connect_transcript_provider/`,
        {
            ulink_username: ulinkUsername,
            ulink_pin: ulinkPin,
        }
      );
      refreshUser();
      setSuccess(response.data.message);
    } catch (err) {
      console.error("Ulink connection error:", err);
      setError(
        err.response?.data?.error ||
          "An unexpected error occurred while connecting Ulink."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 600, margin: "auto", mt: 10, p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Connect Ulink Account
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Please enter your Ulink credentials to connect your account. This will
        allow automatic retrieval of your PIN and transcript.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Ulink Username"
        value={ulinkUsername}
        onChange={(e) => setUlinkUsername(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Ulink PIN"
        type="password"
        value={ulinkPin}
        onChange={(e) => setUlinkPin(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleConnect}
        disabled={loading || !ulinkUsername || !ulinkPin}
      >
        {loading ? "Connecting..." : "Connect Ulink"}
      </Button>
    </Paper>
  );
};

export default UlinkConnection;
