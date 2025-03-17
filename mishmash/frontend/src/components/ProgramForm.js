import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  IconButton,
  Typography,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { SEMESTERS } from "../utils/constants";
import { DEFAULT_QUESTIONS } from "../utils/constants";
import ApplicantTable from "./ApplicantTable";
import FacultyPicklist from "./FacultyPicklist";
import { useAuth } from "../context/AuthContext";

const ProgramForm = ({ onClose, refreshPrograms, editingProgram }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [programData, setProgramData] = useState({
    title: "",
    year: "",
    semester: "",
    faculty_lead_ids: [],
    application_open_date: "",
    application_deadline: "",
    essential_document_deadline: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [systemAdminWarning, setSystemAdminWarning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState([]);
  const [editQuestions, setEditQuestions] = useState([]);
  const [newQuestions, setNewQuestions] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  useEffect(() => {
    if (editingProgram) {
      setProgramData({
        title: editingProgram.title,
        year: editingProgram.year,
        semester: editingProgram.semester,
        faculty_lead_ids: editingProgram.faculty_leads.map(
          (faculty) => faculty.id
        ),
        application_open_date: editingProgram.application_open_date,
        application_deadline: editingProgram.application_deadline,
        essential_document_deadline: editingProgram.essential_document_deadline,
        start_date: editingProgram.start_date,
        end_date: editingProgram.end_date,
        description: editingProgram.description,
      });
      axiosInstance.get(`/api/questions/?program=${editingProgram.id}`)
        .then((response) => {
          setQuestions(response.data);
        })
        .catch((error) => console.error("Failed to load questions:", error));
    } else {
      setQuestions(DEFAULT_QUESTIONS.map((q) => ({ id: null, text: q })));
    }
  }, [editingProgram]);

  const handleInputChange = (e) => {
    setProgramData({ ...programData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;

    if (updatedQuestions[index].id) {
      setEditQuestions([...editQuestions, updatedQuestions[index]]);
    }

    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestion = { id: null, text: "" };
    setQuestions([...questions, newQuestion]);
    setNewQuestions([...newQuestions, newQuestion]);
  };

  const handleDeleteQuestion = (index) => {
    const question = questions[index];
    if (question.id) {
      setDeletedQuestions([...deletedQuestions, question.id]);
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const confirmDelete = (index) => {
    setQuestionToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteQuestion(questionToDelete);
    setDeleteConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

  const handleFacultyChange = (selectedFaculty) => {
    if (selectedFaculty.length === 0) {
      // Show warning that System Admin will be added as faculty lead
      setSystemAdminWarning(true);

      // Get the System Admin user - in a real implementation,
      // you would either fetch this from the backend or use a known ID
      axiosInstance
        .get("/api/users/", {
          params: { is_system_admin: true },
        })
        .then((response) => {
          if (response.data && response.data.length > 0) {
            const systemAdmin = response.data[0];
            setProgramData({
              ...programData,
              faculty_lead_ids: [systemAdmin.id],
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching system admin:", error);
        });
    } else {
      // Regular case - user has selected faculty leads
      setSystemAdminWarning(false);
      setProgramData({
        ...programData,
        faculty_lead_ids: selectedFaculty.map((faculty) => faculty.id),
      });
    }
  };

  const handleSubmit = async () => {
    // Check if faculty leads is empty before submitting
    if (programData.faculty_lead_ids.length === 0) {
      // Show warning dialog about System Admin being added automatically
      setSystemAdminWarning(true);
      setDialogOpen(true);
      return;
    }

    // If we have faculty leads, proceed with submission
    await submitProgram();
  };

  const submitProgram = async () => {
    try {
      if (editingProgram) {
        await axiosInstance.put(
          `/api/programs/${editingProgram.id}/`,
          {
          ...programData,
          questions: questions.map((q) => q.text),
          }
        );
      } else {
        await axiosInstance.post("/api/programs/", 
          {
          ...programData,
          questions: questions.map((q) => q.text),
        });
      }

      for (const question of editQuestions) {
        await axiosInstance.patch(`/api/questions/${question.id}/`, {
          text: question.text,
        });
      }

      for (const questionId of deletedQuestions) {
        await axiosInstance.delete(`/api/questions/${questionId}/`);
      }

      refreshPrograms();
      navigate("/dashboard/admin-programs");
    } catch (error) {
      console.error("Error saving program:", error);
      setErrorMessage(
        error.response?.data?.detail ||
          "Failed to save program. Please check your input."
      );
    }
  };

  const handleConfirmSubmit = () => {
    setDialogOpen(false);
    submitProgram();
  };

  const handleCancelSubmit = () => {
    setDialogOpen(false);
  };
  
  const handleDeleteProgram = async () => {
    if (!editingProgram) return;
    const countResponse = await axiosInstance.get(
      `/api/programs/${editingProgram.id}/applicant_counts/`
    );
    if (
      !window.confirm(
        `Are you sure you want to delete this program? This action cannot be undone, and will affect ${countResponse.data.total_participants} total participants and ${countResponse.data.enrolled} enrolled students.`
      )
    )
      return;

    try {
      await axiosInstance.delete(`/api/programs/${editingProgram.id}/`);
      refreshPrograms();
      navigate("/dashboard/admin-programs");
    } catch (error) {
      console.error("Error deleting program:", error);
      setErrorMessage(
        error.response?.data?.detail || "Failed to delete program."
      );
    }
  };

  return (
    <Paper sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        {editingProgram ? "Program Detail" : "Create New Program"}
      </Typography>

      {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

      {systemAdminWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No faculty leads selected. System Administrator will be automatically
          assigned as the faculty lead. This ensures all programs have at least
          one administrator.
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <TextField
          label="Title"
          name="title"
          fullWidth
          disabled={!user.is_admin}
          value={programData.title}
          onChange={handleInputChange}
        />
        <TextField
          label="Year"
          name="year"
          fullWidth
          disabled={!user.is_admin}
          value={programData.year}
          onChange={handleInputChange}
        />
        <FormControl fullWidth>
          <InputLabel id="semester-label">Semester</InputLabel>
          <Select
            labelId="semester-label"
            label="Semester"
            name="semester"
            disabled={!user.is_admin}
            value={programData.semester}
            onChange={handleInputChange}
          >
            {SEMESTERS.map((semester) => (
              <MenuItem key={semester} value={semester}>
                {semester}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FacultyPicklist
          onFacultyChange={handleFacultyChange}
          initialSelected={programData.faculty_lead_ids}
          is_admin={user.is_admin}
        />
        <TextField
          label="Description"
          name="description"
          multiline
          rows={3}
          fullWidth
          disabled={!user.is_admin}
          value={programData.description}
          onChange={handleInputChange}
        />
        <TextField
          label="Application Open Date"
          type="date"
          name="application_open_date"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.application_open_date}
          onChange={handleInputChange}
        />
        <TextField
          label="Application Deadline"
          type="date"
          name="application_deadline"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.application_deadline}
          onChange={handleInputChange}
        />
        <TextField
          label="Essential Document Deadline"
          type="date"
          name="essential_document_deadline"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.essential_document_deadline}
          onChange={handleInputChange}
        />
        <TextField
          label="Start Date"
          type="date"
          name="start_date"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.start_date}
          onChange={handleInputChange}
        />
        <TextField
          label="End Date"
          type="date"
          name="end_date"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.end_date}
          onChange={handleInputChange}
        />

        {/* Questions Section */}
        <Box>
          <Typography variant="h6">Questions</Typography>
          {questions.map((q, index) => (
            <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                value={q.text}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
              />
              <IconButton onClick={() => confirmDelete(index)}>
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={handleAddQuestion}>
            Add Question
          </Button>
        </Box>

        {user.is_admin && (
          <Box
            sx={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              mt: 2,
            }}
          >
            {editingProgram && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteProgram}
              >
                Delete Program
              </Button>
            )}
            <Button variant="contained" onClick={handleSubmit}>
              {editingProgram ? "Update Program" : "Create Program"}
            </Button>
          </Box>
        )}
      </Box>

      {editingProgram &&
        (user.is_admin ||
          user.is_reviewer ||
          (user.is_faculty &&
            programData.faculty_lead_ids.includes(user.id))) && (
          <ApplicantTable programId={editingProgram.id} />
        )}

      {/* Confirm delete question dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Question?</DialogTitle>
        <DialogContent>
          Deleting this question will remove any existing responses. Continue?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCancelSubmit}>
        <DialogTitle>No Faculty Leads Selected</DialogTitle>
        <DialogContent>
          <Typography>
            You haven't selected any faculty leads for this program. The System
            Administrator will be automatically assigned as a faculty lead.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            This ensures that all programs have at least one administrator who
            can manage the program. You can add additional faculty leads later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSubmit} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            color="primary"
            variant="contained"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProgramForm;
