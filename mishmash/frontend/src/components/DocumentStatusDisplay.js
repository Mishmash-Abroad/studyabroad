import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PropTypes from "prop-types";

const DocumentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "16px",
}));

const DocumentRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
}));

const DocumentName = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontSize: theme.typography.body2.fontSize,
}));

const StatusIcon = styled(Box)(({ theme, status }) => ({
  display: "flex",
  alignItems: "center",
  "& .MuiSvgIcon-root": {
    color:
      status === "submitted"
        ? theme.palette.success.main
        : theme.palette.error.main,
  },
}));

const REQUIRED_DOCUMENTS = [
  {
    type: "Acknowledgement of the code of conduct",
    description:
      "Attestation to understanding and commitment to the code of conduct",
  },
  {
    type: "Housing questionnaire",
    description: "Housing preferences questionnaire",
  },
  {
    type: "Medical/health history and immunization records",
    description: "Health status and immunization records (HIPAA protected)",
  },
  {
    type: "Assumption of risk form",
    description: "A document waiving liability for student participation",
  },
];

const DocumentStatusDisplay = ({
  documents = [],
  application_id,
  isLoading = false,
  error = null,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);
  const [viewError, setViewError] = useState(null);

  // Handle loading state
  if (isLoading) {
    return (
      <DocumentContainer>
        <Typography variant="subtitle2" gutterBottom>
          Loading Document Status...
        </Typography>
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      </DocumentContainer>
    );
  }

  // Handle error state
  if (error) {
    return (
      <DocumentContainer>
        <Typography variant="subtitle2" color="error" gutterBottom>
          Error Loading Documents
        </Typography>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </DocumentContainer>
    );
  }

  const getDocumentStatus = (type) => {
    // Handle case where documents is undefined/null
    if (!documents) {
      return "missing";
    }

    return documents.some(
      (doc) => doc.type === type && doc.application === application_id
    )
      ? "submitted"
      : "missing";
  };

  const getStatusTooltip = (status) => {
    return status === "submitted"
      ? "Document has been successfully uploaded"
      : "Document needs to be uploaded";
  };

  const handleViewDocument = async (document) => {
    try {
      setSelectedDocument(document);
      setViewError(null);

      // If the document has a pdf_url property, fetch and display it
      if (document.pdf_url) {
        // Use the browser's fetch API which respects the protocol of the page
        // This avoids mixed content issues as it will use the same protocol (HTTP/HTTPS)
        const response = await fetch(document.pdf_url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch document: ${response.status} ${response.statusText}`
          );
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setSelectedDocUrl(blobUrl);
      } else {
        setViewError("Document URL not available");
      }

      setOpen(true);
    } catch (error) {
      console.error("Error viewing document:", error);
      setViewError(`Unable to load document preview: ${error.message}`);
    }
  };

  const handleClose = () => {
    if (selectedDocUrl) {
      URL.revokeObjectURL(selectedDocUrl);
      setSelectedDocUrl(null);
    }
    setOpen(false);
    setSelectedDocument(null);
    setViewError(null);
  };

  return (
    <DocumentContainer>
      <Typography variant="subtitle2" gutterBottom>
        Required Documents Status
      </Typography>
      {REQUIRED_DOCUMENTS.map(({ type, description }) => {
        const status = getDocumentStatus(type);
        const document = documents.find(
          (doc) => doc.type === type && doc.application === application_id
        );
        return (
          <Tooltip
            key={type}
            title={
              <div>
                <div>{description}</div>
                <div>{getStatusTooltip(status)}</div>
              </div>
            }
            placement="left"
          >
            <DocumentRow>
              <DocumentName>{type}</DocumentName>
              {status === "submitted" && document && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDocument(document);
                  }}
                  size="small"
                  title="View Document"
                  sx={{
                    padding: "4px",
                    width: "28px",
                    height: "28px",
                    marginRight: "2px",
                  }}
                >
                  <VisibilityIcon
                    fontSize="small"
                    color="primary"
                    sx={{ fontSize: "0.9rem" }}
                  />
                </IconButton>
              )}
              <StatusIcon status={status}>
                {status === "submitted" ? (
                  <CheckCircleIcon fontSize="small" />
                ) : (
                  <ErrorIcon fontSize="small" />
                )}
              </StatusIcon>
            </DocumentRow>
          </Tooltip>
        );
      })}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          {viewError && (
            <Typography color="error" gutterBottom>
              {viewError}
            </Typography>
          )}
          {selectedDocument && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedDocument.type}
              </Typography>

              {selectedDocUrl ? (
                <Box sx={{ height: "70vh", overflow: "auto" }}>
                  <iframe
                    src={selectedDocUrl}
                    width="100%"
                    height="100%"
                    title={selectedDocument.type}
                    style={{ border: "none" }}
                  />
                </Box>
              ) : (
                <Typography>Document preview not available</Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </DocumentContainer>
  );
};

DocumentStatusDisplay.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      application: PropTypes.number.isRequired,
      pdf_url: PropTypes.string,
    })
  ),
  application_id: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default DocumentStatusDisplay;
