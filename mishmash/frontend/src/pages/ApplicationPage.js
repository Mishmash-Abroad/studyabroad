import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, MenuItem } from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Paper from "@mui/material/Paper";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";

// -------------------- STYLES --------------------
const PageContainer = styled("div")(({ theme }) => ({
  paddingTop: "72px",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
}));

const ContentContainer = styled(Paper)(({ theme }) => ({
  maxWidth: "800px",
  margin: "0 auto",
  padding: "24px",
  borderRadius: theme.shape.borderRadius.large,
}));

const Header = styled("div")({
  marginBottom: "16px",
  textAlign: "center",
});

const StyledTabContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: "16px",
}));

// -------------------- COMPONENT LOGIC --------------------
const ApplicationPage = () => {
  const { user_id, program_id } = useParams();
  const navigate = useNavigate();

  // Tab management
  const [activeTab, setActiveTab] = useState(0);

  // Form fields
  const [studentName, setStudentName] = useState("");
  const [program, setProgram] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gpa, setGpa] = useState("");
  const [major, setMajor] = useState("");
  const [details, setDetails] = useState("");

  // State for loading and error
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user's applications
  useEffect(() => {
    const getApplication = async () => {
      try {
        const response = await axiosInstance.get(`/api/applications/`);
        const application = response.data.find(
          (application) => application.program == program_id
        );

        if (application) {
          setStudentName(application.student);
          setDateOfBirth(application.date_of_birth);
          setGpa(application.gpa);
          setMajor(application.major);
        }
      } catch (err) {
        // Handle errors
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "An error occurred while getting the application.";
        setError(errorMessage);
      } finally {
        setLoading(false); // Reset loading state
      }
    };

    const getProgram = async () => {
      const response = await axiosInstance.get(`/api/programs/`);

      const current_program = response.data.find(
        (program) => program.id == program_id
      );
      setProgram(current_program);
    };

    getApplication();
    getProgram();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Ensure all required fields are provided
      if (!dateOfBirth || !gpa || !major) {
        throw new Error("Please fill out all required fields.");
      }

      const response = await axiosInstance.post(
        `/api/applications/create_or_edit/`,
        {
          student: user_id,
          program: program_id,
          dateOfBirth,
          gpa,
          major,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check for successful response
      if (response.status === 201 || response.status === 200) {
        navigate(`/dashboard`); // Redirect to dashboard after successful submission
      }
    } catch (err) {
      // Handle errors
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "An error occurred while submitting the application.";
      setError(errorMessage);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const renderTabContent = () => {
    return (
      <form onSubmit={handleSubmitApplication}>
        <Box mb={3}>
          <TextField
            fullWidth
            label="Student Name"
            variant="outlined"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
        </Box>
        <Box mb={3}>
          <TextField
            fullWidth
            type="date"
            label="Date of Birth"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </Box>
        <Box mb={3}>
          <TextField
            fullWidth
            label="GPA"
            variant="outlined"
            type="number"
            inputProps={{ step: "0.01", min: "0", max: "4.0" }}
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            required
          />
        </Box>
        <Box mb={3}>
          <TextField
            fullWidth
            label="Major"
            variant="outlined"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            required
          />
        </Box>
        <Box mb={3}>
          <TextField
            fullWidth
            label="Application Details"
            variant="outlined"
            multiline
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
        </Box>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
        >
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    );
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Typography variant="h4" color="primary" gutterBottom>
            Application for {program.title}
          </Typography>
        </Header>

        <StyledTabContainer>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Application Form" />
          </Tabs>
        </StyledTabContainer>

        {renderTabContent()}
      </ContentContainer>
    </PageContainer>
  );
};

export default ApplicationPage;
