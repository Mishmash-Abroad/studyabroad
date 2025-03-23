import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axiosInstance from "../utils/axios";

// ----- STYLED COMPONENTS -----
const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
}));

const StudentLetterRequests = ({ application_id, isReadOnly = false }) => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewLetterDialog, setShowNewLetterDialog] = useState(false);
  const [writerName, setWriterName] = useState("");
  const [writerEmail, setWriterEmail] = useState("");

  useEffect(() => {
    if (!application_id) {
      setLoading(false);
      return;
    }
    fetchLetters();
  }, [application_id]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/letters/?application=${application_id}`
      );
      setLetters(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching letters of rec:", err);
      setError("Failed to load letters of recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewLetterDialog = () => {
    setWriterName("");
    setWriterEmail("");
    setShowNewLetterDialog(true);
  };

  const handleCloseNewLetterDialog = () => {
    setShowNewLetterDialog(false);
  };

  const handleCreateLetterRequest = async () => {
    if (!writerName.trim() || !writerEmail.trim()) {
      setError("Please enter both writer name and email.");
      return;
    }
    try {
      setError("");
      // POST /api/letters/create_request/
      const response = await axiosInstance.post("/api/letters/create_request/", {
        application_id: application_id,
        writer_name: writerName,
        writer_email: writerEmail,
      });
      setLetters([...letters, response.data]);
      setShowNewLetterDialog(false);
    } catch (err) {
      console.error("Error creating letter request:", err);
      setError("Failed to create letter request. Please try again.");
    }
  };

  const handleRetractLetter = async (letterId) => {
    if (!window.confirm("Are you sure you want to retract this request?")) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/letters/${letterId}/retract_request/`);
      setLetters(letters.filter((l) => l.id !== letterId));
    } catch (err) {
      console.error("Error retracting letter:", err);
      setError("Failed to retract letter request.");
    }
  };

  if (!application_id) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Please submit your application first before managing letter requests.
      </Alert>
    );
  }

  if (loading) {
    return <Typography>Loading letters of recommendation...</Typography>;
  }

  return (
    <Container>
      <HeaderRow>
        <Typography variant="h6">Letters of Recommendation</Typography>
        {!isReadOnly && (
          <Button variant="contained" onClick={handleOpenNewLetterDialog}>
            Request a New Letter
          </Button>
        )}
      </HeaderRow>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {letters.length === 0 ? (
        <Typography>No letter requests found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Writer Name</TableCell>
                <TableCell>Writer Email</TableCell>
                <TableCell>Fulfilled?</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {letters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell>{letter.writer_name}</TableCell>
                  <TableCell>{letter.writer_email}</TableCell>
                  <TableCell>
                    {letter.is_fulfilled
                      ? `Submitted on ${new Date(letter.letter_timestamp).toLocaleDateString('en-US', {month: 'numeric', day: 'numeric', year: '2-digit'})}`
                      : "Not yet"}
                  </TableCell>
                  <TableCell>
                    {!isReadOnly && !letter.is_fulfilled && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRetractLetter(letter.id)}
                      >
                        Retract
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for creating new letter request */}
      <Dialog
        open={showNewLetterDialog}
        onClose={handleCloseNewLetterDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request a New Recommendation Letter</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Writer Name"
            value={writerName}
            onChange={(e) => setWriterName(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Writer Email"
            value={writerEmail}
            onChange={(e) => setWriterEmail(e.target.value)}
            type="email"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            An email will be sent to the writer containing a unique link
            allowing them to upload their PDF letter. They do not need an
            account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewLetterDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCreateLetterRequest} variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentLetterRequests;
