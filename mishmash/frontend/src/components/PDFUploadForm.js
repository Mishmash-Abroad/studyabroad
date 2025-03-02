import React, { useState, useCallback, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axiosInstance from "../utils/axios";

// -------------------- STYLED COMPONENTS --------------------
// Container for the entire form with consistent spacing
const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

// DropZone handles visual feedback for drag & drop and file states
// Changes border color and background based on:
// - isDragActive: When file is being dragged over
// - hasFile: When file is selected or already uploaded
// - isReadOnly: When form is in read-only mode
const DropZone = styled(Box, {
  shouldComponentUpdate: true,
  // Filter out custom props so they don't get passed to the DOM
  shouldForwardProp: (prop) => 
    !['isDragActive', 'hasFile', 'isReadOnly'].includes(prop)
})(({ theme, isDragActive, hasFile, isReadOnly }) => ({
  border: '2px dashed',
  borderColor: isDragActive ? theme.palette.primary.main 
    : hasFile ? theme.palette.success.main 
    : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadii.medium,
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: isReadOnly ? theme.palette.action.disabledBackground
    : isDragActive ? theme.palette.primary.light
    : hasFile ? theme.palette.success.light
    : theme.palette.grey[50],
  cursor: isReadOnly ? "not-allowed" : "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: isReadOnly ? theme.palette.action.disabledBackground : theme.palette.grey[100],
    borderColor: isReadOnly ? theme.palette.grey[300] : theme.palette.primary.main,
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
  borderRadius: theme.shape.borderRadii.small,
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

// -------------------- COMPONENT DEFINITION --------------------
// Props:
// - doc_type: Type of document being uploaded (e.g., "Assumption of risk form")
// - program_id: ID of the study abroad program
// - user_id: ID of the student uploading the document
// - isReadOnly: If true, prevents document upload/modification
const PDFUploadForm = ({ doc_type, application_id, isReadOnly = false }) => {
  // -------------------- STATE MANAGEMENT --------------------
  // Consolidated state object to manage:
  // - file: Currently selected file (not yet uploaded)
  // - existingDoc: Previously uploaded document from the server
  // - isDragActive: Visual feedback for drag and drop
  const [state, setState] = useState({
    file: null,
    error: "",
    success: "",
    loading: false,
    isDragActive: false,
    existingDoc: null,
    pdfViewerOpen: false,
    selectedDocUrl: null,
  });

  const { 
    file, 
    error, 
    success, 
    loading, 
    isDragActive, 
    existingDoc, 
    pdfViewerOpen, 
    selectedDocUrl 
  } = state;
  
  const updateState = (newState) => setState(prev => ({ ...prev, ...newState }));

  // -------------------- DATA FETCHING --------------------
  // Fetch any existing document for this user/program/type combination
  useEffect(() => {
    const fetchExistingDocument = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/documents/?application=${application_id}`
        );
        const doc = response.data.find((d) => d.type === doc_type);
        if (doc) {
          updateState({ 
            existingDoc: doc, 
            success: "Document already uploaded" 
          });
        }
      } catch (err) {
        console.error("Error fetching document:", err);
      }
    };
  
    fetchExistingDocument();
  }, [application_id, doc_type]);

  // -------------------- FILE HANDLING --------------------
  // Validates and processes file selection, ensuring:
  // 1. Form is not in read-only mode
  // 2. No existing document (or file is being replaced)
  // 3. File is PDF format
  const handleFile = useCallback((newFile) => {
    if (isReadOnly) return;
    
    if (existingDoc && !file) {
      updateState({ error: "Please remove the existing document first" });
      return;
    }

    if (newFile?.type === "application/pdf") {
      updateState({ 
        file: newFile, 
        error: "", 
        success: "" 
      });
    } else {
      updateState({ error: "Please select a PDF file." });
    }
  }, [existingDoc, file, isReadOnly]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    updateState({ isDragActive: false });
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  // -------------------- DOCUMENT OPERATIONS --------------------
  // Handles removal of an existing document after user confirmation
  const handleRemoveExisting = async () => {
    if (!existingDoc || !window.confirm("Remove this document?")) return;

    try {
      updateState({ loading: true });
      await axiosInstance.delete(`/api/documents/${existingDoc.id}/`);
      updateState({ 
        existingDoc: null, 
        success: "", 
        error: "", 
        loading: false 
      });
    } catch (err) {
      updateState({ 
        error: "Failed to remove document.", 
        loading: false 
      });
    }
  };

  // Handles document upload/update using multipart/form-data
  // Uses PATCH if updating existing doc, POST if creating new
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly || !file) return;

    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("pdf", file);
    formData.append("application", application_id);
    formData.append("type", doc_type);

    try {
      updateState({ loading: true });
      const endpoint = existingDoc 
        ? `/api/documents/${existingDoc.id}/`
        : "/api/documents/";
      const method = existingDoc ? "patch" : "post";
      
      const response = await axiosInstance[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        updateState({
          success: "PDF uploaded successfully!",
          file: null,
          existingDoc: response.data,
          error: "",
          loading: false
        });
      }
    } catch (err) {
      updateState({
        error: "Failed to upload document.",
        loading: false
      });
    }
  };

  const handleView = async () => {
    if (!existingDoc?.pdf_url) {
      updateState({ error: "Document URL not available." });
      return;
    }

    try {
      // Use the browser's native fetch API instead of axios
      // This respects the same protocol (HTTP/HTTPS) as the current page
      const response = await fetch(existingDoc.pdf_url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      updateState({ 
        selectedDocUrl: blobUrl,
        pdfViewerOpen: true,
        error: "" 
      });
    } catch (err) {
      console.error("Error viewing document:", err);
      updateState({ error: `Failed to view document: ${err.message}` });
    }
  };

  const handleCloseViewer = () => {
    if (selectedDocUrl) {
      URL.revokeObjectURL(selectedDocUrl);
    }
    updateState({ 
      selectedDocUrl: null,
      pdfViewerOpen: false 
    });
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        {doc_type}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {existingDoc ? (
        <FileInfo>
          <FileDetails>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {existingDoc.title || "Uploaded Document"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uploaded on {new Date(existingDoc.uploaded_at).toLocaleString()}
            </Typography>
          </FileDetails>
          <ActionButtons>
            <Button
              startIcon={<VisibilityIcon />}
              onClick={handleView}
              variant="outlined"
              size="small"
            >
              View
            </Button>
            {!isReadOnly && (
              <Button
                startIcon={<DeleteIcon />}
                onClick={handleRemoveExisting}
                variant="outlined"
                size="small"
                color="error"
              >
                Remove
              </Button>
            )}
          </ActionButtons>
        </FileInfo>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id={`pdf-upload-${doc_type}`}
            disabled={isReadOnly}
          />
          <label htmlFor={`pdf-upload-${doc_type}`}>
            <DropZone
              onDragEnter={(e) => {
                e.preventDefault();
                updateState({ isDragActive: true });
              }}
              onDragLeave={() => updateState({ isDragActive: false })}
              onDragOver={(e) => {
                e.preventDefault();
                updateState({ isDragActive: true });
              }}
              onDrop={handleDrop}
              isDragActive={isDragActive}
              hasFile={!!file}
              isReadOnly={isReadOnly}
            >
              <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography>
                {isReadOnly
                  ? "Document upload is currently disabled"
                  : "Drag and drop a PDF file here, or click to select"}
              </Typography>
            </DropZone>
          </label>

          {file && (
            <FileInfo>
              <FileDetails>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {file.name}
                </Typography>
              </FileDetails>
              <ActionButtons>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || isReadOnly}
                >
                  Upload
                </Button>
              </ActionButtons>
            </FileInfo>
          )}
        </form>
      )}

      <Dialog
        open={pdfViewerOpen}
        onClose={handleCloseViewer}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedDocUrl && (
            <Box sx={{ height: "80vh" }}>
              <iframe
                src={selectedDocUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
              >
                <Typography>
                  PDF cannot be displayed. Please try downloading it instead.
                </Typography>
              </iframe>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PDFUploadForm;
