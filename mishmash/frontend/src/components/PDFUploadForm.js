import React, { useState, useCallback, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
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
  borderRadius: theme.shape.borderRadius.medium,
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
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius.small,
}));

// -------------------- COMPONENT DEFINITION --------------------
// Props:
// - doc_type: Type of document being uploaded (e.g., "Assumption of risk form")
// - program_id: ID of the study abroad program
// - user_id: ID of the student uploading the document
// - isReadOnly: If true, prevents document upload/modification
const PDFUploadForm = ({
  doc_type,
  program_id,
  user_id,
  isReadOnly = false,
}) => {
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
    existingDoc: null
  });

  const { file, error, success, loading, isDragActive, existingDoc } = state;
  const updateState = (newState) => setState(prev => ({ ...prev, ...newState }));

  // -------------------- DATA FETCHING --------------------
  // Fetch any existing document for this user/program/type combination
  useEffect(() => {
    const fetchExistingDocument = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/documents/?student=${user_id}&program=${program_id}`
        );
        const doc = response.data.find(d => d.type === doc_type);
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
  }, [user_id, program_id, doc_type]);

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
    formData.append("student", user_id);
    formData.append("program", program_id);
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

  // -------------------- RENDER COMPONENT --------------------
  return (
    <Container>
      {/* Document Title */}
      <Typography variant="h6" gutterBottom>
        {doc_type}
      </Typography>
      
      {/* Upload Form */}
      <form onSubmit={handleSubmit}>
        {/* Hidden File Input */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id={`file-input-${doc_type}`}
          disabled={isReadOnly}
        />
        
        {/* Drag & Drop Zone */}
        <label htmlFor={`file-input-${doc_type}`}>
          <DropZone
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              updateState({ isDragActive: true });
            }}
            onDragLeave={() => updateState({ isDragActive: false })}
            isDragActive={isDragActive}
            hasFile={!!file || !!existingDoc}
            isReadOnly={isReadOnly}
          >
            {(file || existingDoc) ? (
              <FileInfo>
                <CloudUploadIcon />
                <Typography sx={{ flex: 1 }}>
                  {file ? file.name : existingDoc.title}
                </Typography>
                {!loading && !isReadOnly && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      if (file) {
                        updateState({ file: null });
                      } else {
                        handleRemoveExisting();
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </FileInfo>
            ) : (
              <>
                <CloudUploadIcon
                  sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
                />
                <Typography variant="body1" gutterBottom>
                  {isReadOnly
                    ? "Document upload is disabled"
                    : isDragActive
                    ? "Drop the PDF file here"
                    : "Drag and drop your PDF here, or click to select"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Only PDF files are accepted
                </Typography>
              </>
            )}
          </DropZone>
        </label>

        {file && !isReadOnly && !success && (
          <Box mt={2} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Document"}
            </Button>
          </Box>
        )}
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Container>
  );
};

export default PDFUploadForm;
