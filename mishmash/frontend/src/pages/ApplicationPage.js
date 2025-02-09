import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
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
  const { program_id } = useParams();
  const [isApplicationReadOnly, setIsApplicationReadOnly] = useState(false);
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
  const { user } = useAuth();

  // Tab management
  const [activeTab, setActiveTab] = useState(0);
  // Form fields
  const [applicationData, setApplicationData] = useState({
    id: 0,
    program: program_id,
    status: "",
    student: user.user_id,
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

  const renderWithdrawReapply = () => {
    if (!applicationData.id) {
      return null; // No application exists, so no buttons needed
    }

    const handleWithdraw = async () => {
      const userConfirmed = window.confirm(
        "Are you sure you want to withdraw your application?"
      );
      if (!userConfirmed) return;

      try {
        setLoading(true);
        await axiosInstance.patch(`/api/applications/${applicationData.id}/`, {
          status: "Withdrawn",
        });

        setApplicationData({ ...applicationData, status: "Withdrawn" });
      } catch (err) {
        setError(`${err} Failed to withdraw application.`);
      } finally {
        setLoading(false);
      }
    };

    if (applicationData.status === "Applied") {
      return (
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="secondary"
            onClick={handleWithdraw}
            disabled={loading}
          >
            Withdraw Application
          </Button>
        </Box>
      );
    }
  };

  // Fetch user's applications
  useEffect(() => {
    const getApplication = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/applications/?student=${user.user_id}`
        );

        const program_response = await axiosInstance.get(
          `/api/programs/${program_id}`
        );

        const application = response.data.find(
          (application) => application.program == program_id
        );

        setProgram(program_response.data);
        setIsApplicationReadOnly(
          new Date() > new Date(program_response.data.application_deadline) ||
          application?.status?.toLowerCase() === "enrolled"
        );

        if (application) {
          setApplicationData({
            id: application.id,
            status: application.status,
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
          application: application?.id || null,
          application: application?.id || null,
          question_id: question.id,
          question_text: question.text,
          response_id: 0,
          response_text: "",
        }));

        setQuestionResponses(blank_questions_responses);

        if (application) {
          const questions_responses_response = await axiosInstance.get(
            `/api/responses/?application=${application.id}`
          );

          const newQuestionResponses = questions_responses_response.data || [];

          if (newQuestionResponses.length > 0) {
            // Create a map for quick lookup
            const responseMap = new Map(
              newQuestionResponses.map((questions_response) => [
                questions_response.question,
                questions_response.response,
              ])
            );
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
            setQuestionResponses([...blank_questions_responses]); // Spread to trigger state update
          }
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

    if (applicationData.status == "Withdrawn") {
      const userConfirmed = window.confirm(
        "Are you sure you want to resubmit your application?"
      );
      if (!userConfirmed) {
        setLoading(false);
        return;
      }
    }

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
            { ...questionResponse, application: application_response.data.id }
          );

          if (
            questions_response.status !== 201 &&
            questions_response.status !== 200
          ) {
            throw new Error("Issue with updating question responses");
          }
        } catch (error) {
          throw new Error("Issue with updating question responses");
        }
      }

      // Check for successful response
      if (
        application_response.status === 201 ||
        application_response.status === 200
      ) {
        window.location.reload();
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

  const renderSubmitButtons = () => {
    if (isApplicationReadOnly) {
      return null;
    }

    if (applicationData.status == "Withdrawn") {
      return (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
        >
          {loading ? "Resubmitting..." : "Resubmit Application"}
        </Button>
      );
    }

    return applicationData.status != "Applied" ? (
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        fullWidth
      >
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    ) : (
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        fullWidth
      >
        {loading ? "Updating..." : "Update Application"}
      </Button>
    );
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
            inputProps={{
              max: new Date(
                new Date().setFullYear(new Date().getFullYear() - 10)
              )
                .toISOString()
                .split("T")[0], // Restricts to 10 years ago
              readOnly: isApplicationReadOnly, // Dynamically set readOnly based on state
            }}
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
            inputProps={{
              step: "0.01",
              min: "0",
              max: "4.0",
              readOnly: isApplicationReadOnly,
            }}
            value={applicationData.gpa}
            onChange={handleInputChange}
            required
          />
        </Box>
        <Box mb={3}>
          <TextField
            fullWidth
            label="Major"
            inputProps={{
              readOnly: isApplicationReadOnly, // Dynamically set readOnly based on state
            }}
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
                inputProps={{
                  readOnly: isApplicationReadOnly, // Dynamically set readOnly based on state
                }}
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

        {renderSubmitButtons()}
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
          <Typography variant="h4" color="primary" gutterBottom>
            <b>Current Application Status: {applicationData.status || "Not Submitted"}</b>
          </Typography>
          <Typography variant="p" color="primary" gutterBottom>
            <br />
            {program.description}
            <br />
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

        {!isApplicationReadOnly && renderWithdrawReapply()}
      </ContentContainer>
    </PageContainer>
  );
};

export default ApplicationPage;
