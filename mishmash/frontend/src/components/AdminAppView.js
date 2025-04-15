import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
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
import {
  ALL_ADMIN_EDITABLE_STATUSES,
  ALL_PAYMENT_APPLICATION_STATUSES,
  ALL_PAYMENT_STATUSES,
  get_all_available_statuses_to_edit,
  getStatusLabel,
} from "../utils/constants";
import DocumentReview from "./DocumentReview";
import LetterReview from "./LetterReview";
import ProgramForm from "./ProgramForm";
import { useAuth } from "../context/AuthContext";

const AdminAppView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [student, setStudent] = useState(null);
  const [program, setProgram] = useState(null);
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [confidentialNotes, setConfidentialNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPaymentOpen, setDialogPaymentOpen] = useState(false);
  const { user } = useAuth();
  const ALL_AVAILABLE_STATUSES = Object.values(
    get_all_available_statuses_to_edit(user.roles_object)
  );
  const [prereqCheck, setPrereqCheck] = useState(null);

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
      setPaymentStatus(appResponse.data.payment_status);

      // Fetch user details
      const userResponse = await axiosInstance.get(
        `/api/users/${appResponse.data.student}`
      );
      setStudent(userResponse.data);

      // Fetch program details
      const programResponse = await axiosInstance.get(
        `/api/programs/${appResponse.data.program}`
      );
      setProgram(programResponse.data);

      // Fetch questions for the questions
      const questionsResponse = await axiosInstance.get(
        `/api/questions/?program=${appResponse.data.program}`
      );
      setQuestions(questionsResponse.data);

      // Fetch responses, filtering by application ID and only relevant questions
      const responsesResponse = await axiosInstance.get(
        `/api/responses/?application=${id}`
      );
      setResponses(responsesResponse.data);

      // Fetch confidential notes
      try {
        const notesResponse = await axiosInstance.get(
          `/api/notes/?application=${id}`
        );
        setConfidentialNotes(notesResponse.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setConfidentialNotes([]);
        } else {
          throw err;
        }
      }

      // Fetch pre-requisite data
      if (appResponse.data && programResponse.data && userResponse.data) {
        try {
          const prereqResponse = await axiosInstance.get(
            `/api/programs/${appResponse.data.program}/check_prerequisites/?student_id=${appResponse.data.student}`
          );
          setPrereqCheck(prereqResponse.data);
        } catch (err) {
          console.error("Error fetching prerequisite check:", err);
          setPrereqCheck({ error: err.response.data.detail });
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

  const handlePaymentStatusChange = async (newStatus) => {
    setPaymentStatus(newStatus);
    setDialogPaymentOpen(true);
  };

  const confirmStatusChange = async () => {
    try {
      await axiosInstance.patch(`/api/applications/${id}/`, { status });
      setApplication({ ...application, status: status });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update application status.");
      setDialogOpen(false);
    }
  };

  const confirmPaymentStatusChange = async () => {
    try {
      await axiosInstance.patch(`/api/applications/${id}/`, {
        payment_status: paymentStatus,
      });
      setApplication({ ...application, payment_status: paymentStatus });
      setDialogPaymentOpen(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
      setError("Failed to update application status.");
      setDialogPaymentOpen(false);
    }
  };

  const cancelStatusChange = () => {
    setStatus(application.status); // Reset to original status
    setDialogOpen(false);
  };

  const cancelPaymentStatusChange = () => {
    setPaymentStatus(application.payment_status); // Reset to original status
    setDialogPaymentOpen(false);
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

  const handleReturnToProgram = () => {
    if (program) {
      navigate(
        `/dashboard/admin-programs/${encodeURIComponent(
          program.title.replace(/\s+/g, "-")
        )}`
      );
      return (
        <ProgramForm
          onClose={() => navigate("/dashboard/admin-programs")}
          editingProgram={program}
        />
      );
    }
  };

  const refreshPrerequisites = async () => {
    try {
      await axiosInstance.post(`/api/users/${student.id}/refresh_transcript/`);

      const response = await axiosInstance.get(
        `/api/programs/${application.program}/check_prerequisites/?student_id=${application.student}`
      );

      setPrereqCheck(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh prerequisites:", err);
      setError("Failed to refresh prerequisites. Please try again.");
    }
  };

  if (loading) return <Typography>Loading application details...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!application || !student) return null;

  return (
    <Paper sx={{ padding: 3, mt: 3 }}>
      {/* Program Details - Read-Only */}
      {program && (
        <Paper sx={{ p: 3, mt: 6, mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Program Details
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
              value={program.title}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Description"
              value={program.description}
              fullWidth
              InputProps={{
                readOnly: true,
                style: {
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap",
                },
              }}
              multiline
            />
            <TextField
              label="Year & Semester"
              value={program.year_semester}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Faculty Leads"
              value={program.faculty_leads
                .map((f) => f.display_name)
                .join(", ")}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Provider Partners"
              value={program.provider_partners
                .map((f) => f.display_name)
                .join(", ")}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Application Open Date"
              value={program.application_open_date}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Application Deadline"
              value={program.application_deadline}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Start Date"
              value={program.start_date}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="End Date"
              value={program.end_date}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Box>
        </Paper>
      )}

      {/* Application Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Application Details
        </Typography>

        <Typography variant="h5" sx={{ mb: 2 }}>
          Current Status: <strong>{status}</strong>
        </Typography>

        {ALL_PAYMENT_APPLICATION_STATUSES.includes(status) && (
          <Typography variant="h5" sx={{ mb: 2 }}>
            Current Status: <strong>{paymentStatus}</strong>
          </Typography>
        )}

        {/* Applicant Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Applicant Information
          </Typography>
          <Typography>
            <strong>Display Name:</strong> {student.display_name}
          </Typography>
          <Typography>
            <strong>Username:</strong> {student.username}
          </Typography>
          <Typography>
            <strong>Email:</strong> {student.email}
          </Typography>
          <Typography>
            <strong>Date of Birth:</strong> {application.date_of_birth}
          </Typography>
          <Typography>
            <strong>GPA:</strong> {application.gpa}
          </Typography>
          <Typography>
            <strong>Major:</strong> {application.major}
          </Typography>
        </Box>

        {program?.prerequisites?.length > 0 && prereqCheck && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Prerequisite Check
            </Typography>
            <Button variant="outlined" onClick={refreshPrerequisites}>
              Refresh Prerequisites
            </Button>

            {prereqCheck.error ? (
              <Typography color="error">{prereqCheck.error}</Typography>
            ) : (
              <ul>
                {program.prerequisites.map((course) => {
                  const isMet = !prereqCheck.missing.includes(course);
                  return (
                    <li key={course}>
                      <Typography
                        sx={{
                          color: isMet ? "green" : "red",
                          fontWeight: isMet ? 500 : 400,
                        }}
                      >
                        {course} – {isMet ? "Complete" : "Missing"}
                      </Typography>
                    </li>
                  );
                })}
              </ul>
            )}
          </Box>
        )}

        {/* Application Responses */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          Application Responses
        </Typography>
        {questions.map((question) => {
          const response = responses.find((r) => r.question === question.id);
          return (
            <Box key={question.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {question.text}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                  whiteSpace: "pre-line",
                }}
              >
                {response ? response.response : "No response provided"}
              </Typography>
            </Box>
          );
        })}

        {/* Essential Documents Review */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          Essential Documents Review
        </Typography>
        <DocumentReview
          application_id={id}
          isAdminOrFaculty={user.is_admin || user.is_faculty}
        />

        {/* Letters of Recommendation Review */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Letters of Recommendation Review
        </Typography>
        <LetterReview application_id={id} />
      </Paper>

      {/* Confidential Notes Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Confidential Notes
        </Typography>
        {confidentialNotes.length > 0 ? (
          confidentialNotes
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((note) => (
              <Paper
                key={note.id}
                sx={{ p: 2, mb: 2, border: "1px solid #ccc", borderRadius: 1 }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-line",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  {note.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
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
        <Box sx={{ mt: 3 }}>
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
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAddNote}
            disabled={!newNoteContent.trim()}
          >
            Add Note
          </Button>
        </Box>
      </Paper>

      {/* Application Status Change - Moved to bottom as primary action */}
      <Paper
        sx={{
          padding: 3,
          marginTop: 4,
          backgroundColor: "#f8f9fa",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Change Application Status
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Update the application status to reflect the applicant's current
          standing in the program.
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl>
            <InputLabel id="status-select-label">Application Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={status}
              disabled={!ALL_AVAILABLE_STATUSES.includes(status)}
              label="Application Status"
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: "250px", maxWidth: "500px", justifySelf: "left" }}
            >
              {ALL_AVAILABLE_STATUSES.map((tmp_status, index) => (
                <MenuItem key={index} value={tmp_status}>
                  {tmp_status}
                </MenuItem>
              ))}
              {!ALL_AVAILABLE_STATUSES.includes(status) && (
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
            sx={{ height: "56px", minWidth: "170px" }}
          >
            Update Status
          </Button>
        </Box>
      </Paper>
      <Paper
        sx={{
          padding: 3,
          marginTop: 4,
          backgroundColor: "#f8f9fa",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Change Payment Status
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Update the payment status to reflect the applicant's current payment
          status in the program.
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl>
            <InputLabel id="status-select-label">Application Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={paymentStatus}
              disabled={
                !Object.keys(ALL_PAYMENT_STATUSES).includes(paymentStatus)
              }
              label="Application Status"
              onChange={(e) => setPaymentStatus(e.target.value)}
              sx={{ minWidth: "250px", maxWidth: "500px", justifySelf: "left" }}
            >
              {Object.keys(ALL_PAYMENT_STATUSES).map((tmp_status, index) => (
                <MenuItem key={index} value={tmp_status}>
                  {tmp_status}
                </MenuItem>
              ))}
              {!Object.keys(ALL_PAYMENT_STATUSES).includes(paymentStatus) && (
                <MenuItem key="current" value={paymentStatus} disabled>
                  {paymentStatus}
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handlePaymentStatusChange(paymentStatus)}
            disabled={paymentStatus === application?.payment_status}
            sx={{ height: "56px", minWidth: "170px" }}
          >
            Update Payment Status
          </Button>
        </Box>
      </Paper>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() =>
          navigate(
            `/dashboard/admin-programs/${encodeURIComponent(
              program.title.replace(/\s+/g, "-")
            )}`
          )
        }
      >
        Return to Program Detail
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={cancelStatusChange}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the application status from{" "}
            <strong>{application?.status}</strong> to <strong>{status}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {!prereqCheck?.meets_all && status === "Eligible"
              ? `The selected user is missing the following pre-requisites: ${prereqCheck?.missing}.`
              : "This will update the applicant's status in the system and may trigger notifications."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelStatusChange} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmStatusChange}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={dialogPaymentOpen} onClose={cancelPaymentStatusChange}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the payment status from{" "}
            <strong>{application?.payment_status}</strong> to{" "}
            <strong>{paymentStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelPaymentStatusChange} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmPaymentStatusChange}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminAppView;
