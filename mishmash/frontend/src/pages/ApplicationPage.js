import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import DeadlineIndicator from "../components/DeadlineIndicator";
import StudentLetterRequests from "../components/StudentLetterRequests";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  ALL_STATUSES,
  ALL_ADMIN_EDITABLE_STATUSES,
  READ_ONLY_APPLICATION_STATUSES,
  APPLICATION_ACTION_BUTTON_TEXT,
  DOCUMENT_SUBMISSION_STATUSES,
  EDITABLE_APPLICATION_STATUSES,
  STATUS,
  PROGRAM_STATUS,
  WITHDRAWABLE_APPLICATION_STATUSES,
  ALL_PAYMENT_APPLICATION_STATUSES,
} from "../utils/constants";
import confetti from "canvas-confetti";

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
    borderRadius: theme.shape.borderRadii.large,
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
    borderRadius: theme.shape.borderRadii.medium,
  })),

  InfoGrid: styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
  })),

  FormSection: styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    position: "relative",
  })),

  ButtonContainer: styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
    "& .MuiButton-root": {
      minWidth: "160px",
    },
  })),

  ReadOnlyOverlay: styled(Box)(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: theme.shape.borderRadii.medium,
    pointerEvents: "none",
  })),

  DeadlineContainer: styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  })),
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
  const [tempGPA, setTempGPA] = useState(0);
  const navigate = useNavigate();
  // Consolidated state object managing:
  // - program: Study abroad program details
  // - application: Student's application data and status
  // - questions: Program-specific questions
  // - responses: Student's answers to questions
  // - documents: Required and submitted document tracking
  const [state, setState] = useState({
    isReadOnly: false,
    isDocumentsReadOnly: false,
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

  const updateState = (newState) =>
    setState((prev) => ({ ...prev, ...newState }));

  // Destructure state for easier access
  const {
    isReadOnly,
    isDocumentsReadOnly,
    program,
    application,
    questions,
    responses,
    documents,
    error,
    loading,
    activeTab,
  } = state;
  const [prereqStatus, setPrereqStatus] = useState(null);
  const [ulinkDialogOpen, setUlinkDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const shouldShowConfetti = localStorage.getItem("showConfetti");
    if (shouldShowConfetti) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
      localStorage.removeItem("showConfetti");
    }
  }, []);

  // -------------------- DATA FETCHING --------------------
  useEffect(() => {
    if (!user) return; // Guard: user may be null during initial render

    const fetchApplicationData = async () => {
      updateState({ loading: true, error: "" });

      try {
        // Get program details and determine if application can be edited
        const programRes = await axiosInstance.get(
          `/api/programs/${program_id}`
        );
        const programData = programRes.data;

        // Find student's existing application for this program
        const applicationsRes = await axiosInstance.get(
          `/api/applications/?student=${user.id}`
        );
        const existingApp = applicationsRes.data.find(
          (app) => app.program == program_id
        );

        if (programData?.prerequisites?.length > 0) {
          try {
            const prereqRes = await axiosInstance.get(
              `/api/programs/${program_id}/check_prerequisites/?student_id=${user.id}`
            );
            setPrereqStatus(prereqRes.data);
          } catch (err) {
            console.error("Error checking prerequisites:", err);
            setPrereqStatus({
              error: "Unable to determine prerequisite status.",
            });
          }
        }

        // Application becomes read-only if:
        // - Past the program's deadline OR
        // - Status is not in EDITABLE_APPLICATION_STATUSES (and not a new application)
        const isReadOnly =
          new Date() > new Date(programData.application_deadline) ||
          (existingApp &&
            !EDITABLE_APPLICATION_STATUSES.includes(existingApp.status) &&
            existingApp.status !== STATUS.WITHDRAWN);

        // Document submission becomes read-only if:
        // - Status is not in DOCUMENT_SUBMISSION_STATUSES
        // Note: Document deadlines are soft deadlines - documents can be submitted after the deadline
        // as long as the application status allows document submission
        const isDocumentsReadOnly =
          existingApp &&
          !DOCUMENT_SUBMISSION_STATUSES.includes(existingApp.status);

        // Load program questions and student's responses
        const questionsRes = await axiosInstance.get(
          `/api/programs/${program_id}/questions/`
        );
        const questions = questionsRes.data;

        // Map questions to responses, handling both existing and new applications
        let responses = [];
        if (existingApp) {
          setTempGPA(existingApp.gpa);
          // For existing applications, fetch and match responses to questions
          const responsesRes = await axiosInstance.get(
            `/api/responses/?application=${existingApp.id}`
          );
          const responsesMap = new Map(
            responsesRes.data.map((r) => [r.question, r])
          );

          responses = questions.map((q) => ({
            application: existingApp.id,
            question_id: q.id,
            question_text: q.text,
            response_id: responsesMap.get(q.id)?.id || null,
            response_text: responsesMap.get(q.id)?.response || "",
          }));
        } else {
          // For new applications, create empty response objects
          responses = questions.map((q) => ({
            application: null,
            question_id: q.id,
            question_text: q.text,
            response_id: null,
            response_text: "",
          }));
        }

        // Track document submission status
        const documentsRes = await axiosInstance.get("/api/documents/", {
          params: { application: existingApp?.id },
        });

        // Compare submitted documents against required documents
        const submittedDocs = documentsRes.data;
        const submittedTypes = submittedDocs.map((d) => d.type);
        const missingDocs = REQUIRED_DOCUMENTS.filter(
          (doc) => !submittedTypes.includes(doc)
        );

        updateState({
          isReadOnly,
          isDocumentsReadOnly,
          program: programData,
          application: existingApp || application,
          questions,
          responses,
          documents: {
            submitted: submittedDocs,
            missing: missingDocs,
          },
          loading: false,
        });
      } catch (err) {
        console.error("Error fetching application data:", err);
        updateState({
          error: "Failed to load application data. Please try again.",
        });
      } finally {
        updateState({ loading: false });
      }
    };

    fetchApplicationData();
  }, [program_id, user]);

  // -------------------- EVENT HANDLERS --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      isApplicationReadOnly() ||
      !application.date_of_birth ||
      !application.gpa ||
      !application.major
    ) {
      return;
    }

    // Check if all responses have been filled out
    const emptyResponses = responses.filter(
      (response) => !response.response_text.trim()
    );
    if (emptyResponses.length > 0) {
      updateState({
        error: `Please answer all program questions. ${
          emptyResponses.length
        } question${emptyResponses.length > 1 ? "s" : ""} ${
          emptyResponses.length > 1 ? "are" : "is"
        } unanswered.`,
      });
      return;
    }

    // Check for emojis in text fields
    const containsEmoji = (text) => {
      // This regex matches most common emoji characters
      const emojiRegex =
        /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      return text && emojiRegex.test(text);
    };

    // Check all text fields for emojis
    const fieldsWithEmojis = [];
    if (containsEmoji(application.major)) fieldsWithEmojis.push("Major");

    // Check response text fields
    responses.forEach((response, index) => {
      if (containsEmoji(response.response_text)) {
        fieldsWithEmojis.push(`Response ${index + 1}`);
      }
    });

    if (fieldsWithEmojis.length > 0) {
      updateState({
        error: `Please remove emojis from the following fields: ${fieldsWithEmojis.join(
          ", "
        )}. Our system cannot process emoji characters.`,
      });
      return;
    }

    // Check prerequisites and warn user if prerequisites are not met
    if (program.prerequisites?.length > 0) {
      if (!user.ulink_username) {
        setUlinkDialogOpen(true);
        return;
      } else if (prereqStatus) {
        if (!prereqStatus.meets_all) {
          if (window.confirm(`You are missing the following pre-requisites for this course: ${prereqStatus.missing}. Please contact the faculty leads for this program if you wish to request an exception. Do you want to apply anyway?`)) {
            updateState({ loading: true, error: "" });
          } else {
            updateState({ error: "User canceled submission action." });
            return;
          }
        }
      } else {
        updateState({ error: "Please wait while we check your prerequisites." });
        return;
      }
    }

    try {
      // Submit or update application
      const appPayload = {
        date_of_birth: application.date_of_birth,
        gpa: application.gpa,
        major: application.major,
        // For withdrawn applications set status back to Applied when resubmitting
        // For existing applications set/maintain status as Applied
        // For new applications, set program ID
        ...(application.id
          ? {
              status:
                application.status === STATUS.WITHDRAWN
                  ? STATUS.APPLIED
                  : STATUS.APPLIED,
            }
          : { program: program_id }),
      };

      const appResponse = application.id
        ? await axiosInstance.patch(
            `/api/applications/${application.id}/`,
            appPayload
          )
        : await axiosInstance.post("/api/applications/", appPayload);

      const applicationId = application.id || appResponse.data.id;

      // Submit responses
      await Promise.all(
        responses.map(async (response) => {
          const payload = {
            application: applicationId,
            question: response.question_id,
            response: response.response_text,
          };

          return response.response_id
            ? axiosInstance.patch(
                `/api/responses/${response.response_id}/`,
                payload
              )
            : axiosInstance.post("/api/responses/", payload);
        })
      );
      localStorage.setItem("showConfetti", "true");
      window.location.reload();
    } catch (err) {
      console.error("Application submission error:", err);

      // Check if the error might be related to emojis
      const errorMessage = err.response?.data?.detail || err.message;
      if (err.response?.status === 500) {
        updateState({
          error:
            "Server error occurred. Please ensure no special characters or emojis are used in any field and try again.",
          loading: false,
        });
      } else {
        updateState({
          error: errorMessage || "Failed to submit application",
          loading: false,
        });
      }
    }
  };

  const handleWithdraw = async () => {
    if (!application.id || !window.confirm("Withdraw application?")) {
      return;
    }

    updateState({ loading: true });
    try {
      await axiosInstance.patch(`/api/applications/${application.id}/`, {
        status: "Withdrawn",
      });
      updateState({
        application: { ...application, status: "Withdrawn" },
        loading: false,
      });
    } catch (err) {
      updateState({
        error: "Failed to withdraw application",
        loading: false,
      });
    }
  };

  const handleRefreshTranscript = async () => {
    try {
      await axiosInstance.post(`/api/users/${user.id}/refresh_transcript/`);
      const prereqRes = await axiosInstance.get(
        `/api/programs/${program_id}/check_prerequisites/?student_id=${user.id}`
      );
      setPrereqStatus(prereqRes.data);
      setSuccessMessage("Transcript refreshed!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Transcript refresh failed:", err);
      updateState({ error: "Failed to refresh transcript." });
    }
  };

  // Helper function to determine submit button text based on application status
  const getSubmitButtonText = () => {
    if (loading) return "Processing...";
    let actionText = application.id
      ? APPLICATION_ACTION_BUTTON_TEXT[application.status] || "Edit Application"
      : "Submit Application";

    if (application.status === STATUS.WITHDRAWN) {
      actionText = "Resubmit Application";
    }

    return actionText;
  };

  // Helper function to determine if the application form should be read-only
  const isApplicationReadOnly = () => {
    // If application is withdrawn, allow editing for resubmission
    if (application.status === STATUS.WITHDRAWN) {
      return false;
    }

    // Otherwise, use the normal isReadOnly state
    return isReadOnly;
  };

  // -------------------- HELPER FUNCTIONS --------------------
  const getStatusColor = (theme) => {
    switch (application.status?.toLowerCase()) {
      case "applied":
        return theme.palette.info.main;
      case "enrolled":
        return theme.palette.success.main;
      case "withdrawn":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const {
    PageContainer,
    ContentContainer,
    Header,
    TabContainer,
    ProgramCard,
    InfoGrid,
    FormSection,
    ButtonContainer,
    ReadOnlyOverlay,
    DeadlineContainer,
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
          <Tabs
            value={activeTab}
            onChange={(_, v) => updateState({ activeTab: v })}
          >
            <Tab label="Program Details" />
            <Tab label="Application Form" />
            <Tab label="Letters of Recommendation" />
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
            {program.application_deadline &&
              program.essential_document_deadline && (
                <DeadlineContainer>
                  <DeadlineIndicator
                    deadline={program.application_deadline}
                    type="application"
                    size="medium"
                  />
                  <DeadlineIndicator
                    deadline={program.essential_document_deadline}
                    type="document"
                    size="medium"
                  />
                </DeadlineContainer>
              )}
            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              color="primary"
            >
              Program Information
            </Typography>

            <InfoGrid>
              <Box>
                <Typography variant="subtitle2">Title</Typography>
                <Typography variant="body1">
                  {program.title || "Not specified"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Term</Typography>
                <Typography variant="body1">
                  {program.year_semester ||
                    `${program.semester} ${program.year}` ||
                    "Not specified"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Faculty Leads</Typography>
                <Typography variant="body1">
                  {Array.isArray(program.faculty_leads) &&
                  program.faculty_leads.length > 0
                    ? program.faculty_leads
                        .map((lead) => lead.display_name)
                        .join(", ")
                    : "No faculty leads assigned"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Program Dates</Typography>
                <Typography variant="body1">
                  {program.start_date && program.end_date
                    ? `${new Date(
                        program.start_date
                      ).toLocaleDateString()} - ${new Date(
                        program.end_date
                      ).toLocaleDateString()}`
                    : "Dates not set"}
                </Typography>
              </Box>
            </InfoGrid>

            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              color="primary"
              sx={{ mt: 4 }}
            >
              Key Deadlines
            </Typography>

            <InfoGrid>
              <Box>
                <Typography variant="subtitle2">
                  Application Open Date
                </Typography>
                <Typography variant="body1">
                  {program.application_open_date
                    ? new Date(
                        program.application_open_date
                      ).toLocaleDateString()
                    : "Not specified"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">
                  Application Deadline
                </Typography>
                <Typography variant="body1">
                  {program.application_deadline
                    ? new Date(
                        program.application_deadline
                      ).toLocaleDateString()
                    : "Not specified"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">
                  Document Submission Deadline
                </Typography>
                <Typography variant="body1">
                  {program.essential_document_deadline
                    ? new Date(
                        program.essential_document_deadline
                      ).toLocaleDateString()
                    : "Not specified"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Program Status</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: (theme) => {
                      const now = new Date();
                      if (
                        !program.application_open_date ||
                        !program.application_deadline
                      ) {
                        return theme.palette.grey[600]; // No dates set
                      } else if (
                        now < new Date(program.application_open_date)
                      ) {
                        return theme.palette.info.main; // Will open soon
                      } else if (
                        now <= new Date(program.application_deadline)
                      ) {
                        return theme.palette.success.main; // Open for applications
                      } else {
                        return theme.palette.error.main; // Closed
                      }
                    },
                    fontWeight: "medium",
                  }}
                >
                  {(() => {
                    const now = new Date();
                    if (
                      !program.application_open_date ||
                      !program.application_deadline
                    ) {
                      return "Status unknown";
                    } else if (now < new Date(program.application_open_date)) {
                      return PROGRAM_STATUS.OPENING_SOON;
                    } else if (now <= new Date(program.application_deadline)) {
                      return PROGRAM_STATUS.OPEN;
                    } else {
                      return PROGRAM_STATUS.CLOSED;
                    }
                  })()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Application Status</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: getStatusColor,
                    fontWeight: "medium",
                  }}
                >
                  {application.status || "Not Applied"}
                </Typography>
              </Box>
              {ALL_PAYMENT_APPLICATION_STATUSES.includes(application.status) &&
                program.track_payment && (
                  <Box>
                    <Typography variant="subtitle2">Payment Status</Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: getStatusColor,
                        fontWeight: "medium",
                      }}
                    >
                      {!ALL_PAYMENT_APPLICATION_STATUSES.includes(
                        application.status
                      )
                        ? "N/A"
                        : application.payment_status}
                    </Typography>
                  </Box>
                )}
            </InfoGrid>

            <Typography
              variant="h6"
              component="h2"
              gutterBottom
              color="primary"
              sx={{ mt: 4 }}
            >
              Program Description
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                hyphens: "auto",
              }}
            >
              {program.description ||
                "No description provided for this program."}
            </Typography>

            {program?.prerequisites?.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" gutterBottom color="primary">
                    Prerequisite Status
                  </Typography>
                  <Button variant="outlined" onClick={handleRefreshTranscript}>
                    Refresh Transcript
                  </Button>
                </Box>
                {successMessage && (
                  <p style={{ color: "green", justifySelf: "right" }}>
                    {successMessage}
                  </p>
                )}

                {prereqStatus ? (
                  prereqStatus.error ? (
                    <Typography color="error">{prereqStatus.error}</Typography>
                  ) : (
                    <ul>
                      {program.prerequisites.map((course) => {
                        const isMet = !prereqStatus?.missing?.includes(course);
                        return (
                          <li key={course}>
                            <Typography
                              sx={{
                                color: isMet ? "green" : "red",
                                fontWeight: isMet ? 500 : 400,
                              }}
                            >
                              {course} – {isMet ? "Complete" : "Missing"}
                            </Typography>
                          </li>
                        );
                      })}
                    </ul>
                  )
                ) : (
                  <Typography>Loading prerequisite information...</Typography>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              {!application.id && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => updateState({ activeTab: 1 })}
                >
                  Apply Now
                </Button>
              )}
              {application.id && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => updateState({ activeTab: 1 })}
                >
                  {application.status === STATUS.WITHDRAWN
                    ? "Resubmit Application"
                    : "View Your Application"}
                </Button>
              )}
            </Box>
          </ProgramCard>
        )}

        {/* Application Form Tab */}
        {activeTab === 1 && (
          <form onSubmit={handleSubmit}>
            <DeadlineContainer>
              <DeadlineIndicator
                deadline={program.application_deadline}
                type="application"
                size="medium"
              />
            </DeadlineContainer>
            {isApplicationReadOnly() && (
              <Alert severity="info" sx={{ mb: 3 }}>
                This application cannot be edited in the current application
                status.
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
                  onChange={(e) =>
                    updateState({
                      application: {
                        ...application,
                        date_of_birth: e.target.value,
                      },
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  disabled={isApplicationReadOnly()}
                  required
                />
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="GPA"
                  onWheel={(e) => e.target.blur()}
                  name="gpa"
                  value={tempGPA}
                  onChange={(e) => {
                    const inputValue = parseFloat(e.target.value);
                    if (!isNaN(inputValue)) {
                      updateState({
                        application: {
                          ...application,
                          gpa: parseFloat(inputValue.toFixed(3)), // Truncate to 3 decimals
                        },
                      });
                    }
                    setTempGPA(e.target.value);
                  }}
                  inputProps={{ min: "0", max: "4", step: "any" }}
                  disabled={isApplicationReadOnly()}
                  required
                />
              </Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Major"
                  name="major"
                  value={application.major}
                  onChange={(e) =>
                    updateState({
                      application: { ...application, major: e.target.value },
                    })
                  }
                  disabled={isApplicationReadOnly()}
                  required
                />
              </Box>
              {isApplicationReadOnly() && <ReadOnlyOverlay />}
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
                    onChange={(e) =>
                      updateState({
                        responses: responses.map((r) =>
                          r.question_id === response.question_id
                            ? { ...r, response_text: e.target.value }
                            : r
                        ),
                      })
                    }
                    disabled={isApplicationReadOnly()}
                  />
                </Box>
              ))}
              {isApplicationReadOnly() && <ReadOnlyOverlay />}
            </FormSection>

            {/* Form Actions */}
            <ButtonContainer>
              <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
                {WITHDRAWABLE_APPLICATION_STATUSES.includes(
                  application.status
                ) &&
                  new Date() <= new Date(program.application_deadline) && (
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
                {!isApplicationReadOnly() && (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    size="large"
                  >
                    {getSubmitButtonText()}
                  </Button>
                )}
              </Box>
            </ButtonContainer>
          </form>
        )}

        {/* Letters of Recommendation Tab */}
        {activeTab === 2 && (
          <StudentLetterRequests
            application_id={application.id}
            applicationStatus={application.status}
            programDeadline={program.application_deadline}
            isReadOnly={isReadOnly}
          />
        )}

        {/* Required Documents Tab */}
        {activeTab === 3 && (
          <>
            <DeadlineContainer>
              <DeadlineIndicator
                deadline={program.essential_document_deadline}
                type="document"
                size="medium"
              />
            </DeadlineContainer>
            <EssentialDocumentFormSubmission
              application_id={application.id}
              isReadOnly={isDocumentsReadOnly}
              documents={documents.submitted || []}
            />
          </>
        )}
      </ContentContainer>
      {/* Ulink Required Dialog */}
      <Dialog open={ulinkDialogOpen} onClose={() => setUlinkDialogOpen(false)}>
        <DialogTitle>Ulink Account Required</DialogTitle>
        <DialogContent>
          <Typography>
            You must connect your profile to a Ulink account in order to
            proceed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUlinkDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => navigate("/connect-ulink")}
            variant="contained"
          >
            Connect Ulink
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ApplicationPage;
