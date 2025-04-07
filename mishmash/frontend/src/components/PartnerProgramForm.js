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
  Snackbar,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { Delete, Add, Check } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { SEMESTERS } from "../utils/constants";
import { DEFAULT_QUESTIONS } from "../utils/constants";
import ApplicantTable from "./ApplicantTable";
import FacultyPicklist from "./FacultyPicklist";
import ProviderPartnerPicklist from "./ProviderPartnerPicklist";
import { useAuth } from "../context/AuthContext";
import PartnerApplicantTable from "./PartnerApplicantTable";

const PartnerProgramForm = ({ program }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [programData, setProgramData] = useState({
    title: "",
    year: "",
    semester: "",
    faculty_lead_ids: [],
    provider_partner_ids: [],
    application_open_date: "",
    application_deadline: "",
    essential_document_deadline: "",
    payment_deadline: "",
    start_date: "",
    end_date: "",
    description: "",
    track_payment: false,
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [systemAdminWarning, setSystemAdminWarning] = useState(false);

  // Success notification states
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (program) {
      setProgramData({
        title: program.title,
        year: program.year,
        semester: program.semester,
        faculty_lead_ids: program.faculty_leads.map((faculty) => faculty.id),
        provider_partner_ids: program.provider_partners.map(
          (partner) => partner.id
        ),
        application_open_date: program.application_open_date,
        application_deadline: program.application_deadline,
        essential_document_deadline: program.essential_document_deadline,
        payment_deadline: program.payment_deadline,
        start_date: program.start_date,
        end_date: program.end_date,
        description: program.description,
        track_payment: program.track_payment,
      });
      axiosInstance
        .get(`/api/questions/?program=${program.id}`)
        .then((response) => {
          setQuestions(response.data);
        })
        .catch((error) => console.error("Failed to load questions:", error));
    }
  }, [program]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarOpen(false);
  };

  return (
    <Paper sx={{ padding: "20px" }}>
      <Typography variant="h5" gutterBottom>
        {program ? "Program Detail" : "Create New Program"}
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
        />
        <TextField
          label="Year"
          name="year"
          fullWidth
          disabled={!user.is_admin}
          value={programData.year}
        />
        <FormControl fullWidth>
          <InputLabel id="semester-label">Semester</InputLabel>
          <Select
            labelId="semester-label"
            label="Semester"
            name="semester"
            disabled={!user.is_admin}
            value={programData.semester}
          >
            {SEMESTERS.map((semester) => (
              <MenuItem key={semester} value={semester}>
                {semester}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ alignSelf: "flex-start", width: "100%" }}>
          <FacultyPicklist
            initialSelected={programData.faculty_lead_ids}
            disable_picklist={!user.is_admin}
          />
        </Box>
        <Box sx={{ alignSelf: "flex-start", width: "100%" }}>
          <FormControlLabel
            control={
              <Switch
                checked={programData.track_payment}
                name="track_payment"
                color="success"
              />
            }
            label={
              programData.track_payment
                ? "Payment Tracking Enabled"
                : "Payment Tracking Disabled"
            }
          />
        </Box>
        {programData.track_payment && (
          <Box sx={{ alignSelf: "flex-start", width: "100%" }}>
            <ProviderPartnerPicklist
              initialSelected={programData.provider_partner_ids}
              disable_picklist={!user.is_admin}
            />
          </Box>
        )}
        <TextField
          label="Description"
          name="description"
          multiline
          rows={25}
          fullWidth
          disabled={!user.is_admin}
          value={programData.description}
        />
        <TextField
          label="Application Open Date"
          type="date"
          name="application_open_date"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.application_open_date}
        />
        <TextField
          label="Application Deadline"
          type="date"
          name="application_deadline"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.application_deadline}
        />
        <TextField
          label="Essential Document Deadline"
          type="date"
          name="essential_document_deadline"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.essential_document_deadline}
        />

        {programData.track_payment && (
          <TextField
            label="Payment Deadline"
            type="date"
            name="payment_deadline"
            fullWidth
            disabled={!user.is_admin}
            InputLabelProps={{ shrink: true }}
            value={programData.payment_deadline}
          />
        )}
        <TextField
          label="Start Date"
          type="date"
          name="start_date"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.start_date}
        />
        <TextField
          label="End Date"
          type="date"
          name="end_date"
          fullWidth
          disabled={!user.is_admin}
          InputLabelProps={{ shrink: true }}
          value={programData.end_date}
        />
        {/* Questions Section */}
        <Box>
          <Typography variant="h6">Questions</Typography>
          {questions.map((q, index) => (
            <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField disabled={!user.is_admin} fullWidth value={q.text} />
            </Box>
          ))}
        </Box>
      </Box>

      {program && <PartnerApplicantTable programId={program.id} />}

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        message={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Check color="success" />
            <span>{successMessage}</span>
          </Box>
        }
        sx={{
          marginTop: "64px",
          "& .MuiSnackbarContent-root": {
            bgcolor: "success.main",
            color: "success.contrastText",
          },
        }}
      />
    </Paper>
  );
};

export default PartnerProgramForm;
