import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import axiosInstance from "../utils/axios";

const LetterSummary = ({ application_id }) => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    fulfilled: 0,
    pending: 0
  });

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
      
      const letterData = response.data;
      setLetters(letterData);
      
      // Calculate statistics
      const fulfilled = letterData.filter(letter => letter.is_fulfilled).length;
      setStats({
        total: letterData.length,
        fulfilled: fulfilled,
        pending: letterData.length - fulfilled
      });
      
      setError("");
    } catch (err) {
      console.error("Error fetching letters of rec:", err);
      setError("Failed to load letters of recommendation.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <CircularProgress size={24} />
        <Typography>Loading letter information...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ padding: 2, marginTop: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography>
          <strong>Letters Required:</strong> {stats.total}
        </Typography>
        <Chip 
          icon={<CheckCircleIcon />}
          label={`${stats.fulfilled} Submitted`}
          color="success"
          variant="outlined"
          size="small"
        />
        {stats.pending > 0 && (
          <Chip 
            icon={<PendingIcon />}
            label={`${stats.pending} Pending`}
            color="warning"
            variant="outlined"
            size="small"
          />
        )}
      </Box>
      
      {letters.length === 0 ? (
        <Typography>No letters have been requested for this application.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Writer Name</TableCell>
                <TableCell>Writer Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {letters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell>{letter.writer_name}</TableCell>
                  <TableCell>{letter.writer_email}</TableCell>
                  <TableCell>
                    {letter.is_fulfilled ? (
                      <Chip 
                        label="Submitted" 
                        color="success" 
                        size="small"
                      />
                    ) : (
                      <Chip 
                        label="Not Submitted" 
                        color="warning" 
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {letter.is_fulfilled
                      ? new Date(letter.letter_timestamp).toLocaleString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Note: Only administrators and faculty can view letter contents.
      </Typography>
    </Paper>
  );
};

export default LetterSummary;
