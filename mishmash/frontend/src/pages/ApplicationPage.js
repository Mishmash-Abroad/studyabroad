import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { TextField, Button, Typography, Box, Tabs, Tab, Paper } from "@mui/material";
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
  const { user } = useAuth();

  const [isApplicationReadOnly, setIsApplicationReadOnly] = useState(false);
  const [program, setProgram] = useState({});
  const [applicationData, setApplicationData] = useState({
    program: program_id,
    status: "",
    date_of_birth: "",
    gpa: "",
    major: "",
  });
  const [questions, setQuestions] = useState([]);
  const [questionResponses, setQuestionResponses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

useEffect(() => {
  const getApplicationAndResponses = async () => {
    setLoading(true);
    setError("");

    try {
      const programResponse = await axiosInstance.get(`/api/programs/${program_id}`);
      setProgram(programResponse.data);

      setIsApplicationReadOnly(new Date() > new Date(programResponse.data.application_deadline));

      const questionsResponse = await axiosInstance.get(`/api/programs/${program_id}/questions/`);
      setQuestions(questionsResponse.data);

      const applicationsResponse = await axiosInstance.get(`/api/applications/?student=${user.user.id}`);
      const existingApplication = applicationsResponse.data.find(app => app.program == program_id);

      if (existingApplication) {
        setApplicationData({
          id: existingApplication.id,
          status: existingApplication.status,
          program: existingApplication.program,
          student: existingApplication.student,
          date_of_birth: existingApplication.date_of_birth,
          gpa: existingApplication.gpa,
          major: existingApplication.major
        });

        const responsesResponse = await axiosInstance.get(`/api/responses/?application=${existingApplication.id}`);
        const responsesMap = new Map(responsesResponse.data.map(response => [response.question, response]));

        const questionsResponse = await axiosInstance.get(`/api/questions/?program=${program_id}`);
        const updatedResponses = questionsResponse.data.map(question => {
          const existingResponse = responsesMap.get(question.id);
          return {
            application: existingApplication.id,
            question_id: question.id,
            question_text: question.text,
            response_id: existingResponse ? existingResponse.id : null,
            response_text: existingResponse ? existingResponse.response : ""
          };
        });

        setQuestionResponses(updatedResponses);
      } else {
        const questionsResponse = await axiosInstance.get(`/api/questions/?program=${program_id}`);
        const blankResponses = questionsResponse.data.map(question => ({
          application: null,
          question_id: question.id,
          question_text: question.text,
          response_id: null,
          response_text: ""
        }));

        setQuestionResponses(blankResponses);
      }

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "An error occurred while initializing the application."
      );
    } finally {
      setLoading(false);
    }
  };

  getApplicationAndResponses();
}, [program_id, user.user.id]);


  const handleInputChange = (e) => {
    setApplicationData({ ...applicationData, [e.target.name]: e.target.value });
  };

  const handleResponseChange = (questionId, value) => {
    setQuestionResponses(prev => prev.map(resp =>
      resp.question_id === questionId ? { ...resp, response_text: value } : resp
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      if (!applicationData.date_of_birth || !applicationData.gpa || !applicationData.major) {
        throw new Error("Please fill out all required fields.");
      }
  
      let applicationResponse;
      let applicationId;
  
      if (applicationData.id) {
        applicationResponse = await axiosInstance.patch(
          `/api/applications/${applicationData.id}/`,
          {
            date_of_birth: applicationData.date_of_birth,
            gpa: applicationData.gpa,
            major: applicationData.major
          }
        );
        applicationId = applicationData.id;
      } else {
        const response = await axiosInstance.post(`/api/applications/`, {
          program: applicationData.program,
          date_of_birth: applicationData.date_of_birth,
          gpa: applicationData.gpa,
          major: applicationData.major
        });
  
        applicationResponse = response.data;
        applicationId = response.data.id;
  
        setApplicationData((prev) => ({
          ...prev,
          id: applicationId
        }));
  
        setQuestionResponses((prevResponses) =>
          prevResponses.map((response) => ({
            ...response,
            application: applicationId
          }))
        );
      }
  
      for (const response of questionResponses) {
        const payload = {
          application: applicationId,
          question: response.question_id,
          response: response.response_text
        };
  
        if (response.response_id) {
          await axiosInstance.patch(`/api/responses/${response.response_id}/`, payload);
        } else {
          await axiosInstance.post(`/api/responses/`, payload);
        }
      }
  
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to submit application.");
      console.error("Error submitting application:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderSubmitButton = () => {
    if (isApplicationReadOnly) return null;

    const buttonText = applicationData.status === "Withdrawn" ? "Resubmit Application" :
      applicationData.status === "Applied" ? "Update Application" : "Submit Application";

    return (
      <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
        {loading ? "Processing..." : buttonText}
      </Button>
    );
  };

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


  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Typography variant="h4" color="primary" gutterBottom>
            Application for {program.title} {program.year_semester}
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Status: {applicationData.status || "Not Submitted"}
          </Typography>
          {error && (
            <Typography color="error" mb={2}>
              {error}
            </Typography>
          )}
        </Header>

        <StyledTabContainer>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} centered>
            <Tab label="Application Form" />
          </Tabs>
        </StyledTabContainer>

        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <TextField
              fullWidth
              type="date"
              label="Date of Birth"
              name="date_of_birth"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().split("T")[0], readOnly: isApplicationReadOnly }}
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
              inputProps={{ step: "0.01", min: "0", max: "4.0", readOnly: isApplicationReadOnly }}
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
              inputProps={{ readOnly: isApplicationReadOnly }}
              value={applicationData.major}
              onChange={handleInputChange}
              required
            />
          </Box>

          {questions.map((question) => (
            <Box key={question.id} mb={3}>
              <TextField
                fullWidth
                label={question.text}
                variant="outlined"
                multiline
                rows={4}
                value={questionResponses.find(q => q.question_id === question.id)?.response_text || ""}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                inputProps={{ readOnly: isApplicationReadOnly }}
                required
              />
            </Box>
          ))}

          {renderSubmitButton()}
          {renderWithdrawReapply()}
        </form>
      </ContentContainer>
    </PageContainer>
  );
};

export default ApplicationPage;
