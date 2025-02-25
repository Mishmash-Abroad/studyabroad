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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import {ALL_ADMIN_EDITABLE_STATUSES} from '../utils/constants'


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
    try {
      await axiosInstance.patch(`/api/applications/${id}/`, { status: newStatus });
      setStatus(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
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
                — {note.author_display}, {new Date(note.timestamp).toLocaleString()}
              </Typography>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No confidential notes yet.
          </Typography>
        )}

        <TextField
          fullWidth
          label="Add a Confidential Note"
          variant="outlined"
          multiline
          rows={3}
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
        />
        <Button onClick={handleAddNote} variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Add Note
        </Button>
      </Box>
  
      {/* Status Dropdown - Now Appears After Responses */}
      <Box sx={{ marginBottom: 3, maxWidth: 300 }}>
        <Typography variant="h6">Application Status</Typography>
        <TextField
          select
          fullWidth
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          variant="outlined"
        >
          {application.status === "Withdrawn" && (
            <MenuItem value="Withdrawn">Withdrawn</MenuItem>
          )}
          {
            ALL_ADMIN_EDITABLE_STATUSES.map((status) => {
              return (
                <MenuItem value={status}>{status}</MenuItem>
              )
            })
          }
        </TextField>
      </Box>
  
      {/* Back Button */}
      <Box sx={{ marginTop: 2 }}>
        <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
          Back to Applicant Table
        </Button>
      </Box>
    </Paper>
  );
  
};

export default AdminAppView;
