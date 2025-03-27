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
  CircularProgress,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import axiosInstance from "../utils/axios";

const LetterReview = ({ application_id }) => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  useEffect(() => {
    if (application_id) {
      fetchLetters();
    } else {
      setLoading(false);
    }
  }, [application_id]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/letters/?application=${application_id}`
      );
      setLetters(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching letters of rec:", err);
      setError("Failed to load letters of recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (letter) => {
    if (!letter.pdf_url) {
      setError("No PDF URL available for this letter.");
      return;
    }
    try {
      const res = await axiosInstance.get(letter.pdf_url, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      setSelectedLetter({ ...letter, blobUrl });
      setPdfViewerOpen(true);
    } catch (err) {
      console.error("Error viewing letter PDF:", err);
      setError("Failed to retrieve letter PDF.");
    }
  };

  const handleDownload = async (letter) => {
    if (!letter.pdf_url) {
      setError("No PDF URL available for this letter.");
      return;
    }
    try {
      const res = await axiosInstance.get(letter.pdf_url, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      // Trigger a download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `Recommendation_${letter.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading letter PDF:", err);
      setError("Failed to download letter PDF.");
    }
  };

  const handleCloseViewer = () => {
    if (selectedLetter && selectedLetter.blobUrl) {
      URL.revokeObjectURL(selectedLetter.blobUrl);
    }
    setSelectedLetter(null);
    setPdfViewerOpen(false);
  };

  if (loading) {
    return (
      <Box>
        <CircularProgress size={24} />
        <Typography>Loading letters...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ padding: 2, marginTop: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recommendation Letters
      </Typography>
      {letters.length === 0 ? (
        <Typography>No letters have been requested or submitted.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Writer Name</TableCell>
                <TableCell>Writer Email</TableCell>
                <TableCell>Submission Status</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {letters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell>{letter.writer_name}</TableCell>
                  <TableCell>{letter.writer_email}</TableCell>
                  <TableCell>
                    {letter.is_fulfilled ? (
                      <Typography color="success.main">Submitted</Typography>
                    ) : (
                      <Typography color="error.main">Not Submitted</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {letter.is_fulfilled
                      ? new Date(letter.letter_timestamp).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {letter.is_fulfilled && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleView(letter)}
                          title="View Letter PDF"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(letter)}
                          title="Download Letter PDF"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={pdfViewerOpen}
        onClose={handleCloseViewer}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedLetter && selectedLetter.blobUrl ? (
            <Box sx={{ height: "80vh" }}>
              <iframe
                src={selectedLetter.blobUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title={`Letter_${selectedLetter.id}`}
              >
                <p>PDF cannot be displayed. Please download instead.</p>
              </iframe>
            </Box>
          ) : (
            <Typography>No PDF available.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default LetterReview;
