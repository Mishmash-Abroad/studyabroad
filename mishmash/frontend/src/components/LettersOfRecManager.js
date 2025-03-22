import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Paper,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../utils/axios";

/**
 * Displays and manages letter requests for a given application ID.
 * Student can:
 *  - See existing requests (writer name/email, fulfilled or not)
 *  - Create new requests
 *  - Retract existing requests
 */
const LettersOfRecManager = ({ applicationId, isReadOnly }) => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [writerName, setWriterName] = useState("");
  const [writerEmail, setWriterEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch existing letters for this application
  useEffect(() => {
    if (!applicationId) return;
    fetchLetters();
    // eslint-disable-next-line
  }, [applicationId]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/api/letters/", {
        params: { application: applicationId },
      });
      setLetters(res.data);
    } catch (err) {
      console.error("Error fetching letters of rec:", err);
      setError("Failed to load recommendation letters.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setWriterName("");
    setWriterEmail("");
    setSuccessMsg("");
    setError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateRequest = async () => {
    if (!writerName.trim() || !writerEmail.trim()) {
      setError("Please enter writer name and email.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        application_id: applicationId,
        writer_name: writerName.trim(),
        writer_email: writerEmail.trim(),
      };
      const res = await axiosInstance.post("/api/letters/create_request/", payload);
      setLetters((prev) => [...prev, res.data]);
      setSuccessMsg("Letter request created and email sent!");
      setError("");
      setWriterName("");
      setWriterEmail("");
      handleCloseDialog();
    } catch (err) {
      console.error("Error creating letter request:", err);
      setError("Could not create letter request. Check logs or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetract = async (letterId) => {
    if (!window.confirm("Are you sure you want to retract this letter request?")) {
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/letters/${letterId}/retract_request/`);
      setLetters((prev) => prev.filter((l) => l.id !== letterId));
    } catch (err) {
      console.error("Error retracting letter request:", err);
      setError("Could not retract letter request.");
    } finally {
      setLoading(false);
    }
  };

  if (!applicationId) {
    return (
      <Alert severity="info">
        Please submit your application first before managing letter requests.
      </Alert>
    );
  }

  if (loading) {
    return <Typography>Loading letters...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Letters of Recommendation
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      {!isReadOnly && (
        <Button variant="outlined" onClick={handleOpenDialog} sx={{ mb: 2 }}>
          Request a New Letter
        </Button>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Writer Name</TableCell>
              <TableCell>Writer Email</TableCell>
              <TableCell>Fulfilled?</TableCell>
              <TableCell>Submitted On</TableCell>
              {!isReadOnly && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {letters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No letters requested yet.
                </TableCell>
              </TableRow>
            ) : (
              letters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell>{letter.writer_name}</TableCell>
                  <TableCell>{letter.writer_email}</TableCell>
                  <TableCell>
                    {letter.is_fulfilled ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    {letter.is_fulfilled
                      ? new Date(letter.letter_timestamp).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <IconButton
                        aria-label="retract letter request"
                        size="small"
                        onClick={() => handleRetract(letter.id)}
                        title="Retract Letter Request"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for adding a new letter request */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request a New Letter of Recommendation</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Writer's Name"
              value={writerName}
              onChange={(e) => setWriterName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Writer's Email"
              type="email"
              value={writerEmail}
              onChange={(e) => setWriterEmail(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRequest}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LettersOfRecManager;
