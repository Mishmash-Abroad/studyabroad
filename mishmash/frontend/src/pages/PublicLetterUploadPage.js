import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  CheckCircleOutlineIcon,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axiosInstance from "../utils/axios";
import DeleteIcon from "@mui/icons-material/Delete";

// -------------------- STYLED COMPONENTS --------------------
const PageContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingTop: '72px', // Space for fixed navbar
}));

const ContentWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
}));

const Container = styled(Paper)(({ theme }) => ({
  maxWidth: 800,
  margin: "0 auto", 
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(4),
}));

const InfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  backgroundColor: theme.palette.grey[50],
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(1),
  "&:last-child": { marginBottom: 0 },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginRight: theme.spacing(1),
  minWidth: 150,
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  flex: 1,
}));

const SuccessBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.success.main}`,
  transition: 'all 0.25s ease-in-out',
  animation: 'flash-success 1s ease-in-out',
  '@keyframes flash-success': {
    '0%': {
      backgroundColor: 'transparent',
    },
    '20%': {
      backgroundColor: theme.palette.success.light,
    },
    '100%': {
      backgroundColor: 'transparent',
    }
  }
}));

const SuccessIcon = styled(CheckCircleIcon)(({ theme }) => ({
  marginRight: theme.spacing(2),
  fontSize: '2rem',
  color: theme.palette.success.main,
}));

// DropZone handles visual feedback for drag & drop and file states
const DropZone = styled(Box, {
  shouldForwardProp: (prop) =>
    !["isDragActive", "hasFile"].includes(prop),
})(({ theme, isDragActive, hasFile }) => ({
  border: "2px dashed",
  borderColor: isDragActive
    ? theme.palette.primary.main
    : hasFile
    ? theme.palette.success.main
    : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: isDragActive
    ? theme.palette.primary.light
    : hasFile
    ? theme.palette.success.light
    : theme.palette.grey[50],
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.primary.main,
  },
}));

const FileInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const FileDetails = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const PublicLetterUploadPage = () => {
  const { id } = useParams(); 
  const location = useLocation();
  
  const [state, setState] = useState({
    letterInfo: null,
    loading: true,
    error: "",
    file: null,
    uploading: false,
    success: false,
    isDragActive: false,
    selectedDocUrl: null,
    pdfViewerOpen: false,
    existingDoc: null,
    reuploadExpanded: false,
  });

  const {
    letterInfo,
    loading,
    error,
    file,
    uploading,
    success,
    isDragActive,
    selectedDocUrl,
    pdfViewerOpen,
    existingDoc,
    reuploadExpanded,
  } = state;

  const updateState = (newState) => 
    setState((prev) => ({ ...prev, ...newState }));

  // Extract ?token=xxx from the URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    if (!token) {
      updateState({
        error: "Token is required in the URL.",
        loading: false,
      });
      return;
    }
    fetchPublicInfo();
  }, [id, token]);

  const fetchPublicInfo = async () => {
    try {
      updateState({ loading: true });
      const response = await axiosInstance.get(
        `/api/letters/${id}/public_info/?token=${token}`
      );
      if (response.data.status === "valid") {
        updateState({
          letterInfo: response.data,
          existingDoc: response.data.is_fulfilled ? { 
            filename: "Recommendation Letter.pdf",
          } : null,
        });
      } else {
        updateState({ error: "Invalid or canceled request." });
      }
    } catch (err) {
      console.error("Error fetching public info:", err);
      updateState({ error: "Invalid or canceled request." });
    } finally {
      updateState({ loading: false });
    }
  };

  const handleFile = useCallback((newFile) => {
    if (newFile?.type === "application/pdf") {
      updateState({
        file: newFile,
        error: "",
      });
    } else {
      updateState({ error: "Please select a PDF file." });
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    updateState({ isDragActive: false });
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    updateState({ isDragActive: true });
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    updateState({ isDragActive: false });
  }, []);

  const handleUpload = async () => {
    if (!file) {
      updateState({ error: "Please select a PDF file first." });
      return;
    }
    try {
      updateState({ uploading: true, error: "" });
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await axiosInstance.post(
        `/api/letters/${id}/fulfill_letter/?token=${token}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      if (response.status === 200 || response.status === 201) {
        updateState({ 
          success: true,
          existingDoc: {
            filename: file.name,
          },
          file: null,
          reuploadExpanded: true
        });
      }
    } catch (err) {
      console.error("Error uploading letter:", err);
      updateState({ 
        error: "Failed to upload letter. The link may be invalid or expired."
      });
    } finally {
      updateState({ uploading: false });
    }
  };

  const handleDeleteFile = () => {
    updateState({ file: null });
  };

  const handleViewPdf = async () => {
    try {
      updateState({ loading: true, error: "" });
      const response = await axiosInstance.get(
        `/api/letters/${id}/view_letter/?token=${token}`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      updateState({
        selectedDocUrl: blobUrl,
        pdfViewerOpen: true,
        loading: false,
      });
    } catch (err) {
      console.error("Error viewing PDF:", err);
      updateState({ 
        error: "Failed to retrieve the PDF document.",
        loading: false,
      });
    }
  };

  const handlePreviewPdf = async () => {
    if (!file) {
      updateState({ error: "Please select a PDF file first." });
      return;
    }
    try {
      updateState({ loading: true, error: "" });
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const blobUrl = fileReader.result;
        updateState({
          selectedDocUrl: blobUrl,
          pdfViewerOpen: true,
          loading: false,
        });
      };
      fileReader.readAsDataURL(file);
    } catch (err) {
      console.error("Error previewing PDF:", err);
      updateState({ 
        error: "Failed to preview the PDF document.",
        loading: false,
      });
    }
  };

  const handleCloseViewer = () => {
    if (selectedDocUrl) {
      URL.revokeObjectURL(selectedDocUrl);
    }
    updateState({
      selectedDocUrl: null,
      pdfViewerOpen: false,
    });
  };

  const handleToggleReupload = () => {
    updateState({ reuploadExpanded: !reuploadExpanded });
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography>Loading letter request information...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Container>
    );
  }

  // If we have letterInfo and either success or existingDoc, show the main screen
  if (success || existingDoc) {
    return (
      <PageContainer>
        <ContentWrapper>
          <Container>
            <HeaderRow>
              <Typography variant="h5">
                Upload Recommendation Letter
                {(existingDoc || success) && (
                  <StatusChip 
                    label="Letter Received" 
                    color="success" 
                    icon={<CheckCircleIcon />} 
                    variant="outlined"
                  />
                )}
              </Typography>
            </HeaderRow>

            <InfoSection>
              <InfoRow>
                <InfoLabel variant="body1">For Student:</InfoLabel>
                <InfoValue variant="body1">{letterInfo?.student_name}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel variant="body1">Program:</InfoLabel>
                <InfoValue variant="body1">{letterInfo?.program_title}</InfoValue>
              </InfoRow>
            </InfoSection>

            <SuccessBox>
              <SuccessIcon />
              <Box>
                <Typography variant="h6">
                  Letter successfully uploaded
                </Typography>
                <Typography variant="body2">
                  Your recommendation letter has been received.
                </Typography>
              </Box>
            </SuccessBox>
            
            <Accordion expanded={reuploadExpanded} onChange={handleToggleReupload}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="reupload-content"
                id="reupload-header"
              >
                <Typography>Replace with updated letter (optional)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  If you need to provide an updated version of your letter, you can upload a new file below.
                  This will replace your previously submitted letter.
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {renderUploadSection()}
              </AccordionDetails>
            </Accordion>

            {/* PDF Viewer Dialog */}
            <Dialog
              open={pdfViewerOpen}
              onClose={handleCloseViewer}
              maxWidth="lg"
              fullWidth
            >
              <DialogContent sx={{ p: 0, height: "80vh" }}>
                {selectedDocUrl ? (
                  <iframe
                    src={selectedDocUrl}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title="Letter PDF Viewer"
                  />
                ) : (
                  <Box p={3}>
                    <CircularProgress />
                    <Typography>Loading document...</Typography>
                  </Box>
                )}
              </DialogContent>
            </Dialog>
          </Container>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // If we get here, letterInfo is loaded and valid but no letter has been uploaded yet
  return (
    <PageContainer>
      <ContentWrapper>
        <Container>
          <HeaderRow>
            <Typography variant="h5">
              Upload Recommendation Letter
            </Typography>
          </HeaderRow>

          <InfoSection>
            <InfoRow>
              <InfoLabel variant="body1">For Student:</InfoLabel>
              <InfoValue variant="body1">{letterInfo?.student_name}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel variant="body1">Program:</InfoLabel>
              <InfoValue variant="body1">{letterInfo?.program_title}</InfoValue>
            </InfoRow>
          </InfoSection>

          {renderUploadSection()}
        </Container>
      </ContentWrapper>
    </PageContainer>
  );
  
  function renderUploadSection() {
    return (
      <>
        <Typography variant="h6" gutterBottom>
          {file ? "Selected File" : "Select PDF File to Upload"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!file ? (
          <DropZone
            isDragActive={isDragActive}
            hasFile={false}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById("pdfInput").click()}
          >
            <input
              id="pdfInput"
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <CloudUploadIcon fontSize="large" color="primary" />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Drag and drop a PDF file here, or click to select
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Only PDF files are accepted
            </Typography>
          </DropZone>
        ) : (
          <>
            <FileInfo>
              <FileDetails>
                <Typography variant="subtitle1">{file.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Size: {(file.size / 1024).toFixed(1)} KB
                </Typography>
              </FileDetails>
              <ActionButtons>
                <IconButton
                  color="primary"
                  onClick={handlePreviewPdf}
                  title="Preview file"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={handleDeleteFile}
                  title="Remove file"
                >
                  <DeleteIcon />
                </IconButton>
              </ActionButtons>
            </FileInfo>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : null}
              >
                {uploading ? "Uploading..." : "Upload Letter"}
              </Button>
            </Box>
          </>
        )}
      </>
    );
  }
};

export default PublicLetterUploadPage;
