import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import {ALL_ADMIN_EDITABLE_STATUSES, getStatusLabel} from '../utils/constants'
import DocumentReview from "./DocumentReview";

const AdminAppView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [user, setUser] = useState(null);
  const [program, setProgram] = useState(null);
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [confidentialNotes, setConfidentialNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch application details
      const appResponse = await axiosInstance.get(`/api/applications/${id}/`);
      setApplication(appResponse.data);
      setStatus(appResponse.data.status);

      // Fetch user details
      const userResponse = await axiosInstance.get(`/api/users/${appResponse.data.student}`);
      setUser(userResponse.data);

      // Fetch program details
      const programResponse = await axiosInstance.get(`/api/programs/${appResponse.data.program}`);
      setProgram(programResponse.data);

      // Fetch questions for the questions
      const questionsResponse = await axiosInstance.get(`/api/questions/?program=${appResponse.data.program}`);
      setQuestions(questionsResponse.data);

      // Fetch responses, filtering by application ID and only relevant questions
      const responsesResponse = await axiosInstance.get(`/api/responses/?application=${id}`);
      setResponses(responsesResponse.data);

      // Fetch confidential notes
      try {
        const notesResponse = await axiosInstance.get(`/api/notes/?application=${id}`);
        setConfidentialNotes(notesResponse.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setConfidentialNotes([]);
        } else {
          throw err;
        }
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching application details:", err);
      setError("Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };


  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    try {
      await axiosInstance.patch(`/api/applications/${id}/`, { status });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update application status.");
      setDialogOpen(false);
    }
  };

  const cancelStatusChange = () => {
    setStatus(application.status); // Reset to original status
    setDialogOpen(false);
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      setError("Note content cannot be empty.");
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/notes/`, {
        application: id,
        content: newNoteContent,
      });

      setConfidentialNotes((prevNotes) => [...prevNotes, response.data]);
      setNewNoteContent("");
      setError(null);
    } catch (err) {
      console.error("Error adding confidential note:", err);
      setError("Failed to add note. Please try again.");
    }
  };

  if (loading) return <Typography>Loading application details...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!application || !user) return null;

  return (
    <Paper sx={{ padding: "20px", marginTop: "20px" }}>
  
      {/* Program Details - Read-Only */}
      {program && (
        <Paper sx={{ marginBottom: "10px", marginTop: "50px"}}>
          <Typography variant="h6">Program Details</Typography>
          <Box sx={{ marginBottom: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" value={program.title} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Description" value={program.description} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Year & Semester" value={program.year_semester} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Faculty Leads" value={program.faculty_leads.map(faculty => faculty.display_name).join(", ")} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Application Open Date" value={program.application_open_date} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Application Deadline" value={program.application_deadline} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="Start Date" value={program.start_date} fullWidth InputProps={{ readOnly: true }} />
            <TextField label="End Date" value={program.end_date} fullWidth InputProps={{ readOnly: true }} />
          </Box>
        </Paper>
      )}

      <Typography variant="h5">
        Application Details
      </Typography>
  
      {/* Applicant Info */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6">Applicant Information</Typography>
        <Typography><strong>Display Name:</strong> {user.display_name}</Typography>
        <Typography><strong>Username:</strong> {user.username}</Typography>
        <Typography><strong>Email:</strong> {user.email}</Typography>
        <Typography><strong>Date of Birth:</strong> {application.date_of_birth}</Typography>
        <Typography><strong>GPA:</strong> {application.gpa}</Typography>
        <Typography><strong>Major:</strong> {application.major}</Typography>
      </Box>

      {/* Current Status */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6">Current Status: <strong>{status}</strong></Typography>
      </Box>
  
      {/* Application Responses */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6">Application Responses</Typography>
        <Paper sx={{ padding: 2, backgroundColor: "white", borderRadius: 2 }}>
          {questions.map((question) => {
            const response = responses.find((r) => r.question === question.id);
            return (
              <Box key={question.id} sx={{ marginBottom: 3 }}>
                {/* Question */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {question.text}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    padding: "12px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {response ? response.response : "No response provided"}
                </Typography>
              </Box>
            );
          })}
        </Paper>
      </Box>

      {/* Essential Documents Review */}
      <DocumentReview application_id={id} />

      {/* Confidential Notes Section */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6">Confidential Notes</Typography>
        {confidentialNotes.length > 0 ? (
          confidentialNotes
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((note) => (
            <Paper key={note.id} sx={{ padding: 2, marginBottom: 2, width: "100%" }}>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {note.content}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  marginTop: 1,
                  textAlign: "right",
                  fontStyle: "italic",
                  color: "gray",
                }}
              >
                By {note.author_display} on{" "}
                {new Date(note.timestamp).toLocaleString()}
              </Typography>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No confidential notes yet.
          </Typography>
        )}

        {/* Add New Note */}
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add New Note
          </Typography>
          <TextField
            multiline
            rows={4}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Enter your note here..."
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAddNote}
            disabled={!newNoteContent.trim()}
          >
            Add Note
          </Button>
        </Box>
      </Box>
      
      {/* Application Status Change - Moved to bottom as primary action */}
      <Paper sx={{ padding: 3, marginTop: 4, backgroundColor: "#f8f9fa", border: "1px solid #e0e0e0" }}>
        <Typography variant="h6" gutterBottom>
          Change Application Status
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Update the application status to reflect the applicant's current standing in the program.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Application Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={status}
              label="Application Status"
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: '250px' }}
            >
              {ALL_ADMIN_EDITABLE_STATUSES.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
              {!ALL_ADMIN_EDITABLE_STATUSES.includes(status) && (
                <MenuItem key="current" value={status} disabled>
                  {status}
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => handleStatusChange(status)}
            disabled={status === application?.status}
            sx={{ height: '56px', minWidth: '120px' }}
          >
            Update Status
          </Button>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={cancelStatusChange}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the application status from{' '}
            <strong>{application?.status}</strong> to{' '}
            <strong>{status}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            This will update the applicant's status in the system and may trigger notifications.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelStatusChange} color="inherit">Cancel</Button>
          <Button onClick={confirmStatusChange} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminAppView;
