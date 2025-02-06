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
  const [program, setProgram] = useState({
    application_deadline: "",
    application_open_date: "",
    description: "",
    end_date: "",
    faculty_leads: "",
    start_date: "",
    title: "",
    year_semester: "",
  });
  const navigate = useNavigate();

  // Tab management
  const [activeTab, setActiveTab] = useState(0);

  // Form fields
  const [applicationData, setApplicationData] = useState({
    id: 0,
    program: program_id,

    student: user_id,
    date_of_birth: "",
    gpa: "",
    major: "",
  });
  const [questions, setQuestions] = useState([]);
  const [questionResponses, setQuestionResponses] = useState([]);

  // State for loading and error
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) =>
    setApplicationData({ ...applicationData, [e.target.name]: e.target.value });

  // Fetch user's applications
  useEffect(() => {
    const getApplication = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/applications/?student=${user_id}`
        );

        const program_response = await axiosInstance.get(
          `/api/programs/${program_id}`
        );
        console.log(program_response.data);

        setProgram(program_response.data);

        const application = response.data.find(
          (application) => application.program == program_id
        );
        console.log(application);
        if (application) {
          setApplicationData({
            id: application.id,
            program: application.program,
            student: application.student,
            date_of_birth: application.date_of_birth,
            gpa: application.gpa,
            major: application.major,
          });
        }

        let newQuestions = await axiosInstance.get(
          `/api/questions/?program=${program_id}`
        );
        newQuestions = newQuestions.data.filter(
          (question) => question.program == program_id
        );

        setQuestions(newQuestions);

        const blank_questions_responses = newQuestions.map((question) => ({
          application: application?.id || 0,
          question_id: question.id,
          question_text: question.text,
          response_id: 0,
          response_text: "",
        }));

        setQuestionResponses(blank_questions_responses);

        const questions_responses_response = await axiosInstance.get(
          `/api/responses/?application=${program_id}`
        );

        // Ensure newQuestionResponses is populated
        const newQuestionResponses = questions_responses_response.data || [];

        if (newQuestionResponses.length > 0) {
          // Create a map for quick lookup

          const responseMap = new Map(
            newQuestionResponses.map((questions_response) => [
              questions_response.question,
              questions_response.response,
            ])
          );

          // Update blank_questions_responses in a single loop
          blank_questions_responses.forEach((questions_response) => {
            if (responseMap.has(questions_response.question_id)) {
              questions_response.response_text = responseMap.get(
                questions_response.question_id
              );
            }
          });

          setQuestionResponses([...blank_questions_responses]); // Spread to trigger state update
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

    getApplication();
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
      if (
        !applicationData.date_of_birth ||
        !applicationData.gpa ||
        !applicationData.major
      ) {
        throw new Error("Please fill out all required fields.");
      }

      const application_response = await axiosInstance.post(
        `/api/applications/create_or_edit/`,
        applicationData
      );

      setQuestionResponses((prevResponses) =>
        prevResponses.map((prevResponse) => ({
          ...prevResponse,
          application: application_response.data.id,
        }))
      );

      for (const questionResponse of questionResponses) {
        try {
          const questions_response = await axiosInstance.post(
            `/api/responses/create_or_edit/`,
            questionResponse
          );

          if (
            questions_response.status !== 201 &&
            questions_response.status !== 200
          ) {
            throw new Error("Issue with updating question responses");
          }
        } catch (error) {
          console.error(error);
          throw new Error("Issue with updating question responses");
        }
      }

      // Check for successful response
      if (
        application_response.status === 201 ||
        application_response.status === 200
      ) {
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
            type="date"
            label="Date of Birth"
            name="date_of_birth"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={applicationData.date_of_birth}
            onChange={handleInputChange}
            required
          />
        </Box>
        <Box mb={3}>
          <TextField
            fullWidth
            label="GPA"
            variant="outlined"
            name="gpa"
            type="number"
            inputProps={{ step: "0.01", min: "0", max: "4.0" }}
            value={applicationData.gpa}
            onChange={handleInputChange}
            required
          />
        </Box>
        <Box mb={3}>
          <TextField
            fullWidth
            label="Major"
            name="major"
            variant="outlined"
            value={applicationData.major}
            onChange={handleInputChange}
            required
          />
        </Box>
        {questions.map((question, index) => {
          const responseObj = questionResponses?.find(
            (questionResponse) => questionResponse.question_id == question.id
          );

          return (
            <Box key={index} mb={3}>
              <TextField
                fullWidth
                label={question.text} // Assuming question has a 'text' property
                variant="outlined"
                multiline
                rows={4}
                value={responseObj?.response_text || ""} // Fixed value retrieval
                onChange={(e) => {
                  setQuestionResponses((prevResponses) => {
                    // Ensure state exists
                    return prevResponses.map((qr) =>
                      qr.question_id == question.id
                        ? { ...qr, response_text: e.target.value } // Update response_text
                        : qr
                    );
                  });
                }}
                required
              />
            </Box>
          );
        })}

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
            Application for {program.title} {program.year_semester}
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            {program.description}
          </Typography>

          <Typography variant="p" color="primary" gutterBottom>
            From {program.start_date} to {program.end_date}
            <br />
            Submit application by {program.application_deadline}
            <br />
            Faculty Leads: {program.faculty_leads}
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
