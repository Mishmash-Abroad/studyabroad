import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box, Typography, Button, Paper, Alert, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, 
  DialogContentText, Tooltip, LinearProgress, Badge
} from "@mui/material";
import axiosInstance from "../utils/axios";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { EDITABLE_APPLICATION_STATUSES, STATUS } from "../utils/constants";

// Styled components
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

const LetterStats = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  "& .progress": {
    flexGrow: 1,
    marginLeft: theme.spacing(2),
  },
  "& .count": {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  }
}));

const StudentLetterRequests = ({ 
  application_id, 
  isReadOnly = false, 
  applicationStatus,
  programDeadline 
}) => {
  // State management
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewLetterDialog, setShowNewLetterDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState(null);
  const [writerName, setWriterName] = useState("");
  const [writerEmail, setWriterEmail] = useState("");

  // Derived state
  const isBeforeDeadline = programDeadline ? new Date() < new Date(programDeadline) : true;
  const canEditLetters = EDITABLE_APPLICATION_STATUSES.includes(applicationStatus) && 
                         isBeforeDeadline && !isReadOnly;
  const fulfilledCount = letters.filter(letter => letter.is_fulfilled).length;
  const fulfillmentPercentage = letters.length > 0 ? (fulfilledCount / letters.length) * 100 : 0;

  // Fetch letters when application ID changes
  useEffect(() => {
    if (!application_id) {
      setLoading(false);
      return;
    }
    fetchLetters();
  }, [application_id]);

  // API handlers
  const fetchLetters = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/letters/?application=${application_id}`);
      setLetters(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching letters of rec:", err);
      setError("Failed to load letters of recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLetterRequest = async () => {
    if (!writerName.trim() || !writerEmail.trim()) {
      setError("Please enter both writer name and email.");
      return;
    }
    try {
      setError("");
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

  const handleRetractLetter = async () => {
    if (!letterToDelete) return;
    
    try {
      await axiosInstance.delete(`/api/letters/${letterToDelete.id}/retract_request/`);
      setLetters(letters.filter((l) => l.id !== letterToDelete.id));
      setShowDeleteDialog(false);
      setLetterToDelete(null);
    } catch (err) {
      console.error("Error retracting letter:", err);
      setError("Failed to retract letter request.");
      setShowDeleteDialog(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {month: 'numeric', day: 'numeric', year: '2-digit'});
    } catch (e) {
      return "Invalid date";
    }
  };

  // Dialog handlers
  const handleOpenNewLetterDialog = () => {
    setWriterName("");
    setWriterEmail("");
    setShowNewLetterDialog(true);
  };

  const handleCloseNewLetterDialog = () => setShowNewLetterDialog(false);
  
  const handleConfirmRetractLetter = (letter) => {
    setLetterToDelete(letter);
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setLetterToDelete(null);
  };

  // UI rendering
  function renderLetterTable() {
    if (letters.length === 0) return <Typography>No letter requests found.</Typography>;

    return (
      <>
        {letters.length > 0 && (
          <LetterStats>
            <Typography variant="subtitle1" className="count">
              <Badge badgeContent={fulfilledCount} color="success" overlap="circular" sx={{ mr: 1 }}>
                <MailOutlineIcon />
              </Badge>
              {fulfilledCount} of {letters.length} letters received
            </Typography>
            <Box className="progress">
              <LinearProgress 
                variant="determinate" 
                value={fulfillmentPercentage} 
                color="success" 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </LetterStats>
        )}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Writer Name</TableCell>
                <TableCell>Writer Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {letters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell>{letter.writer_name}</TableCell>
                  <TableCell>{letter.writer_email}</TableCell>
                  <TableCell>
                    {letter.is_fulfilled ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={`Submitted on ${formatDate(letter.letter_timestamp)}`}
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Chip label="Pending" color="default" variant="outlined" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {canEditLetters && (
                      <Tooltip title={letter.is_fulfilled 
                        ? "Deleting will permanently remove the uploaded letter" 
                        : "Cancel the request and notify the writer"}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleConfirmRetractLetter(letter)}
                        >
                          {letter.is_fulfilled ? "Delete" : "Retract"}
                        </Button>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }

  // Application state-based conditional rendering
  if (!application_id) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Please submit your application first before managing letter requests.
      </Alert>
    );
  }

  if (!canEditLetters && applicationStatus !== STATUS.APPLIED) {
    return (
      <Container>
        <HeaderRow>
          <Typography variant="h6">Letters of Recommendation</Typography>
        </HeaderRow>
        <Alert severity="info" sx={{ mb: 3 }}>
          Letter requests can only be managed while your application is in the "Applied" status. 
          Your current status is "{applicationStatus}".
        </Alert>
        {renderLetterTable()}
      </Container>
    );
  }

  if (!isBeforeDeadline) {
    return (
      <Container>
        <HeaderRow>
          <Typography variant="h6">Letters of Recommendation</Typography>
        </HeaderRow>
        <Alert severity="info" sx={{ mb: 3 }}>
          The application deadline has passed. You can no longer create or modify letter requests.
          However, letter writers can still submit their letters after the deadline.
        </Alert>
        {renderLetterTable()}
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Typography>Loading letters of recommendation...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Container>
    );
  }

  // Main component render
  return (
    <Container>
      <HeaderRow>
        <Typography variant="h6">Letters of Recommendation</Typography>
        {canEditLetters && (
          <Button variant="contained" onClick={handleOpenNewLetterDialog}>
            Request a New Letter
          </Button>
        )}
      </HeaderRow>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {renderLetterTable()}

      {/* Dialog for new letter request */}
      <Dialog open={showNewLetterDialog} onClose={handleCloseNewLetterDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request a New Recommendation Letter</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="normal" label="Writer Name" 
            value={writerName} onChange={(e) => setWriterName(e.target.value)}
          />
          <TextField
            fullWidth margin="normal" label="Writer Email" type="email"
            value={writerEmail} onChange={(e) => setWriterEmail(e.target.value)}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            An email will be sent to the writer containing a unique link
            allowing them to upload their PDF letter. They do not need an account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewLetterDialog} color="inherit">Cancel</Button>
          <Button onClick={handleCreateLetterRequest} variant="contained">Submit Request</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for retraction/deletion */}
      <Dialog open={showDeleteDialog && letterToDelete !== null} onClose={handleCloseDeleteDialog}>
        <DialogTitle>
          {letterToDelete?.is_fulfilled ? "Delete Recommendation Letter?" : "Retract Letter Request?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {letterToDelete?.is_fulfilled ? (
              <>
                <strong>Warning:</strong> This will permanently delete the recommendation letter from {letterToDelete?.writer_name}.
                This action cannot be undone.
              </>
            ) : (
              <>
                The writer ({letterToDelete?.writer_name}) will be notified that the request has been canceled 
                and the upload link will no longer work.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">Cancel</Button>
          <Button onClick={handleRetractLetter} color="error" variant="contained">
            {letterToDelete?.is_fulfilled ? "Delete Letter" : "Retract Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentLetterRequests;
