import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axiosInstance from "../utils/axios";

const DocumentReview = ({ application_id, isAdminOrFaculty = false }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [application_id]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/documents/?application=${application_id}`
      );
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    if (doc.pdf_url) {
      try {
        const response = await axiosInstance.get(doc.pdf_url, {
          responseType: 'blob',
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);
        // create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", `${doc.type}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error("Error downloading document:", err);
        setError(`Failed to download document: ${err.message}`);
      }
    } else {
      setError("Document URL not available.");
    }
  };

  const handleView = async (doc) => {
    if (doc.pdf_url) {
      try {
        // use axiosInstance which includes authentication token
        const response = await axiosInstance.get(doc.pdf_url, {
          responseType: 'blob',
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);
        setSelectedDoc({ ...doc, url: blobUrl });
        setPdfViewerOpen(true);
      } catch (err) {
        console.error("Error viewing document:", err);
        setError(`Failed to view document: ${err.message}`);
      }
    } else {
      setError("Document URL not available.");
    }
  };

  const handleCloseViewer = () => {
    if (selectedDoc?.url) {
      URL.revokeObjectURL(selectedDoc.url);
    }
    setSelectedDoc(null);
    setPdfViewerOpen(false);
  };

  if (loading) return <Typography>Loading documents...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ padding: 2, marginTop: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              {isAdminOrFaculty && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              "Acknowledgement of the code of conduct",
              "Housing questionnaire",
              "Medical/health history and immunization records",
              "Assumption of risk form",
            ].map((docType) => {
              const doc = documents.find((d) => d.type === docType);
              return (
                <TableRow key={docType}>
                  <TableCell>{docType}</TableCell>
                  <TableCell>
                    {doc ? (
                      <Typography color="success.main">Submitted</Typography>
                    ) : (
                      <Typography color="error.main">Not Submitted</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {doc ? new Date(doc.uploaded_at).toLocaleString() : "N/A"}
                  </TableCell>
                  {isAdminOrFaculty && (
                    <TableCell>
                      {doc && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(doc)}
                            title="View PDF"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(doc)}
                            title="Download PDF"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={pdfViewerOpen}
        onClose={handleCloseViewer}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedDoc && (
            <Box sx={{ height: "80vh" }}>
              <iframe
                src={selectedDoc.url}
                width="100%"
                height="100%"
                style={{ border: "none" }}
              >
                <Typography>
                  PDF cannot be displayed. Please download to view.
                </Typography>
              </iframe>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default DocumentReview;
