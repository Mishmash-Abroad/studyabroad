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
import DownloadIcon from "@mui/icons-material/Download";
import PropTypes from "prop-types";
import { DOCUMENTS } from "../utils/constants";
import axiosInstance from "../utils/axios";

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

      if (document.pdf_url) {
        // use axiosInstance which includes authentication token
        const response = await axiosInstance.get(document.pdf_url, {
          responseType: 'blob',
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
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

  const handleDownloadDocument = async (document) => {
    try {
      if (document.pdf_url) {
        // use axiosInstance which includes authentication token
        const response = await axiosInstance.get(document.pdf_url, {
          responseType: 'blob',
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        // create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", `${document.title || document.type}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      } else {
        console.error("Document URL not available");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
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

  // convert DOCUMENTS object to array for mapping
  const documentTypes = Object.values(DOCUMENTS).map((doc) => ({
    type: doc.name,
    description: doc.description,
  }));

  return (
    <DocumentContainer>
      <Typography variant="subtitle2" gutterBottom>
        Required Documents Status
      </Typography>
      {documentTypes.map(({ type, description }) => {
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
              {status === "submitted" && document && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadDocument(document);
                  }}
                  size="small"
                  title="Download Document"
                  sx={{
                    padding: "4px",
                    width: "28px",
                    height: "28px",
                    marginRight: "2px",
                  }}
                >
                  <DownloadIcon
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