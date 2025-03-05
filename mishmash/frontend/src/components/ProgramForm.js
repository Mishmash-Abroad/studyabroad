import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
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
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { SEMESTERS } from "../utils/constants";
import ApplicantTable from "./ApplicantTable";
import FacultyPicklist from "./FacultyPicklist";

const ProgramForm = ({ onClose, refreshPrograms, editingProgram }) => {
  const navigate = useNavigate();

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
    }
  }, [editingProgram]);

  const handleInputChange = (e) => {
    setProgramData({ ...programData, [e.target.name]: e.target.value });
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
          programData
        );
      } else {
        await axiosInstance.post("/api/programs/", programData);
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
    // Leave systemAdminWarning true so user still sees the alert
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
          value={programData.title}
          onChange={handleInputChange}
        />
        <TextField
          label="Year"
          name="year"
          fullWidth
          value={programData.year}
          onChange={handleInputChange}
        />
        <FormControl fullWidth>
          <InputLabel id="semester-label">Semester</InputLabel>
          <Select
            labelId="semester-label"
            label="Semester"
            name="semester"
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
        />
        <TextField
          label="Description"
          name="description"
          multiline
          rows={3}
          fullWidth
          value={programData.description}
          onChange={handleInputChange}
        />
        <TextField
          label="Application Open Date"
          type="date"
          name="application_open_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.application_open_date}
          onChange={handleInputChange}
        />
        <TextField
          label="Application Deadline"
          type="date"
          name="application_deadline"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.application_deadline}
          onChange={handleInputChange}
        />
        <TextField
          label="Essential Document Deadline"
          type="date"
          name="essential_document_deadline"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.essential_document_deadline}
          onChange={handleInputChange}
        />
        <TextField
          label="Start Date"
          type="date"
          name="start_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.start_date}
          onChange={handleInputChange}
        />
        <TextField
          label="End Date"
          type="date"
          name="end_date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={programData.end_date}
          onChange={handleInputChange}
        />

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
      </Box>

      {editingProgram && <ApplicantTable programId={editingProgram.id} />}

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
