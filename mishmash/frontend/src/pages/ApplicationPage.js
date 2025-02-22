import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
} from "@mui/material";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import EssentialDocumentFormSubmission from "../components/EssentialDocumentFormSubmission";

// -------------------- STYLED COMPONENTS --------------------
const StyledComponents = {
  PageContainer: styled("div")(({ theme }) => ({
    padding: `${theme.spacing(9)} 0`,
    minHeight: "100vh",
    backgroundColor: theme.palette.background.default,
  })),
  
  ContentContainer: styled(Paper)(({ theme }) => ({
    maxWidth: "1000px",
    margin: "0 auto",
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius.large,
  })),
  
  Header: styled("div")(({ theme }) => ({
    marginBottom: theme.spacing(4),
    textAlign: "center",
  })),
  
  TabContainer: styled(Box)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(4),
  })),
  
  ProgramCard: styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius.medium,
  })),
  
  InfoGrid: styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
  })),
  
  FormSection: styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    position: 'relative',
  })),
  
  ButtonContainer: styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
    '& .MuiButton-root': {
      minWidth: '160px',
    }
  })),
  
  ReadOnlyOverlay: styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: theme.shape.borderRadius.medium,
    pointerEvents: 'none',
  }))
};

// -------------------- CONSTANTS --------------------
// List of documents that must be submitted for every application
// These are matched against uploaded document types to track completion
const REQUIRED_DOCUMENTS = [
  "Assumption of risk form",
  "Acknowledgement of the code of conduct",
  "Housing questionnaire",
  "Medical/health history and immunization records",
];

const ApplicationPage = () => {
  const { program_id } = useParams();
  const { user } = useAuth();
  
  // Consolidated state object managing:
  // - program: Study abroad program details
  // - application: Student's application data and status
  // - questions: Program-specific questions
  // - responses: Student's answers to questions
  // - documents: Required and submitted document tracking
  const [state, setState] = useState({
    isReadOnly: false,
    program: {},
    application: {
      id: null,
      program: program_id,
      status: "",
      date_of_birth: "",
      gpa: "",
      major: "",
    },
    questions: [],
    responses: [],
    documents: {
      submitted: [],
      missing: REQUIRED_DOCUMENTS,
    },
    error: "",
    loading: false,
    activeTab: 0,
  });

  const updateState = (newState) => setState(prev => ({ ...prev, ...newState }));
  
  // Destructure state for easier access
  const { 
    isReadOnly, program, application, questions, 
    responses, documents, error, loading, activeTab 
  } = state;

  // -------------------- DATA FETCHING --------------------
  useEffect(() => {
    const fetchApplicationData = async () => {
      updateState({ loading: true, error: "" });
      
      try {
        // Step 1: Get program details and determine if application can be edited
        const programRes = await axiosInstance.get(`/api/programs/${program_id}`);
        const programData = programRes.data;
        
        // Application becomes read-only if:
        // - Past the program's deadline
        // - Student is already enrolled
        const isReadOnly = new Date() > new Date(programData.application_deadline) ||
                         application.status?.toLowerCase() === "enrolled";

        // Step 2: Find student's existing application for this program
        const applicationsRes = await axiosInstance.get(`/api/applications/?student=${user.user.id}`);
        const existingApp = applicationsRes.data.find(app => app.program == program_id);

        // Step 3: Load program questions and student's responses
        const questionsRes = await axiosInstance.get(`/api/programs/${program_id}/questions/`);
        const questions = questionsRes.data;
        
        // Map questions to responses, handling both existing and new applications
        let responses = [];
        if (existingApp) {
          // For existing applications, fetch and match responses to questions
          const responsesRes = await axiosInstance.get(`/api/responses/?application=${existingApp.id}`);
          const responsesMap = new Map(responsesRes.data.map(r => [r.question, r]));
          
          responses = questions.map(q => ({
            application: existingApp.id,
            question_id: q.id,
            question_text: q.text,
            response_id: responsesMap.get(q.id)?.id || null,
            response_text: responsesMap.get(q.id)?.response || "",
          }));
        } else {
          // For new applications, create empty response objects
          responses = questions.map(q => ({
            application: null,
            question_id: q.id,
            question_text: q.text,
            response_id: null,
            response_text: "",
          }));
        }

        // Step 4: Track document submission status
        const documentsRes = await axiosInstance.get("/api/documents/", {
          params: { program: program_id, student: user.user.id }
        });
        
        // Compare submitted documents against required documents
        const submittedDocs = documentsRes.data;
        const submittedTypes = submittedDocs.map(d => d.type);
        const missingDocs = REQUIRED_DOCUMENTS.filter(doc => !submittedTypes.includes(doc));

        updateState({
          isReadOnly,
          program: programData,
          application: existingApp || application,
          questions,
          responses,
          documents: {
            submitted: submittedDocs,
            missing: missingDocs
          },
          loading: false
        });
      } catch (err) {
        updateState({
          error: err.response?.data?.detail || err.message || "Failed to load application data",
          loading: false
        });
      }
    };

    fetchApplicationData();
  }, [program_id, user.user.id]);

  // -------------------- EVENT HANDLERS --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly || !application.date_of_birth || !application.gpa || !application.major) {
      return;
    }

    updateState({ loading: true, error: "" });

    try {
      // Submit or update application
      const appPayload = {
        date_of_birth: application.date_of_birth,
        gpa: application.gpa,
        major: application.major,
        ...(application.id ? { status: "Applied" } : { program: program_id })
      };

      const appResponse = application.id
        ? await axiosInstance.patch(`/api/applications/${application.id}/`, appPayload)
        : await axiosInstance.post('/api/applications/', appPayload);

      const applicationId = application.id || appResponse.data.id;

      // Submit responses
      await Promise.all(responses.map(async (response) => {
        const payload = {
          application: applicationId,
          question: response.question_id,
          response: response.response_text,
        };

        return response.response_id
          ? axiosInstance.patch(`/api/responses/${response.response_id}/`, payload)
          : axiosInstance.post('/api/responses/', payload);
      }));

      window.location.reload();
    } catch (err) {
      updateState({
        error: err.response?.data?.detail || err.message || "Failed to submit application",
        loading: false
      });
    }
  };

  const handleWithdraw = async () => {
    if (!application.id || isReadOnly || !window.confirm("Withdraw application?")) {
      return;
    }

    updateState({ loading: true });
    try {
      await axiosInstance.patch(`/api/applications/${application.id}/`, { status: "Withdrawn" });
      updateState({
        application: { ...application, status: "Withdrawn" },
        loading: false
      });
    } catch (err) {
      updateState({
        error: "Failed to withdraw application",
        loading: false
      });
    }
  };

  // -------------------- HELPER FUNCTIONS --------------------
  const getStatusColor = (theme) => {
    switch(application.status?.toLowerCase()) {
      case 'applied': return theme.palette.info.main;
      case 'enrolled': return theme.palette.success.main;
      case 'withdrawn': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const {
    PageContainer, ContentContainer, Header, TabContainer,
    ProgramCard, InfoGrid, FormSection, ButtonContainer, ReadOnlyOverlay
  } = StyledComponents;

  // -------------------- RENDER COMPONENT --------------------
  return (
    <PageContainer>
      <ContentContainer>
        {/* Header Section */}
        <Header>
          <Typography variant="h4" color="primary" gutterBottom>
            {program.title}
          </Typography>
          <Typography variant="h5" gutterBottom>
            {program.year_semester}
          </Typography>
          <Typography variant="h6" sx={{ color: getStatusColor }}>
            Status: {application.status || "Not Applied"}
          </Typography>
        </Header>

        {/* Navigation Tabs */}
        <TabContainer>
          <Tabs value={activeTab} onChange={(_, v) => updateState({ activeTab: v })}>
            <Tab label="Program Details" />
            <Tab label="Application Form" />
            <Tab label="Required Documents" />
          </Tabs>
        </TabContainer>

        {/* Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Program Details Tab */}
        {activeTab === 0 && (
          <ProgramCard>
            <InfoGrid>
              <Box>
                <Typography variant="subtitle2">Faculty Leads</Typography>
                <Typography>
                  {Array.isArray(program.faculty_leads) && program.faculty_leads.length > 0
                    ? program.faculty_leads.map(lead => lead.display_name).join(', ')
                    : 'No faculty leads assigned'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Application Deadline</Typography>
                <Typography>
                  {program.application_deadline ? new Date(program.application_deadline).toLocaleDateString() : 'No deadline set'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Program Dates</Typography>
                <Typography>
                  {program.start_date && program.end_date ? 
                    `${new Date(program.start_date).toLocaleDateString()} - ${new Date(program.end_date).toLocaleDateString()}` :
                    'Dates not set'}
                </Typography>
              </Box>
            </InfoGrid>
            <Typography variant="body1">{program.description}</Typography>
          </ProgramCard>
        )}

        {/* Application Form Tab */}
        {activeTab === 1 && (
          <form onSubmit={handleSubmit}>
            {isReadOnly && (
              <Alert severity="info" sx={{ mb: 3 }}>
                This application is currently in read-only mode.
              </Alert>
            )}
            
            {/* Personal Information Section */}
            <FormSection>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Box mb={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  name="date_of_birth"
                  value={application.date_of_birth}
                  onChange={e => updateState({ application: { ...application, date_of_birth: e.target.value } })}
                  InputLabelProps={{ shrink: true }}
                  disabled={isReadOnly}
                  required
                />
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="GPA"
                  name="gpa"
                  value={application.gpa}
                  onChange={e => updateState({ application: { ...application, gpa: e.target.value } })}
                  inputProps={{ min: "0", max: "4", step: "0.01" }}
                  disabled={isReadOnly}
                  required
                />
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Major"
                  name="major"
                  value={application.major}
                  onChange={e => updateState({ application: { ...application, major: e.target.value } })}
                  disabled={isReadOnly}
                  required
                />
              </Box>
              {isReadOnly && <ReadOnlyOverlay />}
            </FormSection>

            {/* Program Questions Section */}
            <FormSection>
              <Typography variant="h6" gutterBottom>
                Program Questions
              </Typography>
              {responses.map((response) => (
                <Box key={response.question_id} mb={3}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={response.question_text}
                    value={response.response_text}
                    onChange={e => updateState({
                      responses: responses.map(r =>
                        r.question_id === response.question_id
                          ? { ...r, response_text: e.target.value }
                          : r
                      )
                    })}
                    disabled={isReadOnly}
                  />
                </Box>
              ))}
              {isReadOnly && <ReadOnlyOverlay />}
            </FormSection>

            {/* Form Actions */}
            <ButtonContainer>
              <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                {application.status === "Applied" && !isReadOnly && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleWithdraw}
                    disabled={loading}
                    size="large"
                  >
                    Withdraw Application
                  </Button>
                )}
                {!isReadOnly && (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    size="large"
                  >
                    {loading ? "Processing..." : application.status === "Withdrawn"
                      ? "Resubmit Application"
                      : application.status === "Applied"
                      ? "Update Application"
                      : "Submit Application"}
                  </Button>
                )}
              </Box>
            </ButtonContainer>
          </form>
        )}

        {/* Required Documents Tab */}
        {activeTab === 2 && (
          <Box>
            {isReadOnly ? (
              <Alert severity="info" sx={{ mb: 4 }}>
                Your application is in read-only mode. You cannot modify documents at this time.
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 4 }}>
                Please upload all required documents in PDF format.
              </Alert>
            )}
            <EssentialDocumentFormSubmission
              user_id={user.user.id}
              program_id={program_id}
              isReadOnly={isReadOnly}
            />
          </Box>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default ApplicationPage;
