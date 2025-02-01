import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box } from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Paper from "@mui/material/Paper";
import axios from "axios";

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
  const { id } = useParams();
  const navigate = useNavigate();

  // Tab management
  const [activeTab, setActiveTab] = useState(0);

  // Form fields
  const [studentName, setStudentName] = useState("");
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
      const response = await axios.post(`http://localhost:8000/apply/${id}/submit/`, {
        studentName,
        details,
      });

      if (response.status === 201) {
        navigate(`/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred while submitting.");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Application Form
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
      case 1: // Application History
        return (
          <Typography>
            No application history is available at the moment. Check back later.
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Typography variant="h4" color="primary" gutterBottom>
            Application #{id}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Fill out the form or check your application history.
          </Typography>
        </Header>

        {/* Tabs for switching views */}
        <StyledTabContainer>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Application Form" />
            <Tab label="History" />
          </Tabs>
        </StyledTabContainer>

        {/* Render content based on the active tab */}
        {renderTabContent()}
      </ContentContainer>
    </PageContainer>
  );
};

export default ApplicationPage;
