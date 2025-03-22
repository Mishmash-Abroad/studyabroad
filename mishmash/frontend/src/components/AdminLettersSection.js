import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  IconButton,
  Alert
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axiosInstance from "../utils/axios";

/**
 * Displays letter of recommendation list for admin/faculty/reviewers
 * Shows writer information and provides download/view links for fulfilled letters
 */
const AdminLettersSection = ({ applicationId }) => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!applicationId) return;
    fetchLetters();
  }, [applicationId]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/letters/", {
        params: { application: applicationId },
      });
      setLetters(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching letters of recommendation:", err);
      setError("Failed to load letters of recommendation");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async (letter) => {
    if (!letter.pdf_url) {
      setError("PDF URL not available");
      return;
    }
    try {
      const response = await axiosInstance.get(letter.pdf_url, { 
        responseType: "blob" 
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Error viewing letter PDF:", err);
      setError("Could not view PDF. Please try again.");
    }
  };

  const handleDownloadPDF = async (letter) => {
    if (!letter.pdf_url) {
      setError("PDF URL not available");
      return;
    }
    try {
      const response = await axiosInstance.get(letter.pdf_url, { 
        responseType: "blob" 
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `Recommendation_${letter.writer_name.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading letter PDF:", err);
      setError("Could not download PDF. Please try again.");
    }
  };

  if (loading) {
    return <Typography>Loading letters of recommendation...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Letters of Recommendation
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        {letters.length === 0 ? (
          <Typography>No letters requested.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Writer Name</TableCell>
                  <TableCell>Writer Email</TableCell>
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
                      {letter.is_fulfilled
                        ? new Date(letter.letter_timestamp).toLocaleString()
                        : "Not submitted"}
                    </TableCell>
                    <TableCell>
                      {letter.is_fulfilled && letter.pdf_url ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            title="View PDF"
                            onClick={() => handleViewPDF(letter)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            title="Download PDF"
                            onClick={() => handleDownloadPDF(letter)}
                          >
                            <FileDownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        "No actions available"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default AdminLettersSection;
