import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, MenuItem } from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Paper from "@mui/material/Paper";
import axiosInstance from "../utils/axios";

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

  const getApplication = async () => {
    try {
      const response = await axiosInstance.get(`/api/applications/`);
      console.log(response.data);
      console.log(response.data.filter(application => application.program === program_id));
      return response;
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

  // Tab management
  const [activeTab, setActiveTab] = useState(0);

  const application = getApplication();

  // Form fields
  const [studentName, setStudentName] = useState(application.student);
  const [program, setProgram] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gpa, setGpa] = useState("");
  const [major, setMajor] = useState("");
  const [status, setStatus] = useState("Pending"); // Default status
  const [appliedOn, setAppliedOn] = useState("");
  const [details, setDetails] = useState("");

  // State for loading and error
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Ensure all required fields are provided
      if (!program || !dateOfBirth || !gpa || !major) {
        throw new Error("Please fill out all required fields.");
      }

      const response = await axiosInstance.post(
        `/api/applications/`,
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
      if (response.status === 201) {
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
            label="Program"
            variant="outlined"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
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
            Application #{user_id}
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
