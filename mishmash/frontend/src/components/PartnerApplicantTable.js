import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  MenuItem,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import axiosInstance from "../utils/axios";
import { STATUS, getStatusLabel } from "../utils/constants";
import PaymentStatusDropDown from "./PaymentStatusDropDown";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Helper function to copy text to clipboard
const copyToClipboard = async (text) => {
  if (!text || text.trim() === '') {
    console.error('No text provided to copy');
    return { success: false, error: 'No emails found to copy' };
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return { 
      success: false, 
      error: 'Failed to copy to clipboard. Make sure you have clipboard permissions.' 
    };
  }
};

const PartnerApplicantTable = ({ programId }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("applied_on");
  const [order, setOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [userDetails, setUserDetails] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // State for the confirmation dialog and pending status update
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState({
    applicantId: null,
    newStatus: "",
    currentStatus: "",
  });

  useEffect(() => {
    fetchApplicants();
  }, [programId, statusFilter]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      let url = `/api/applications/?program=${programId}`;
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;

      const response = await axiosInstance.get(url);
      setApplicants(response.data);

      // Fetch user details, documents, and notes for each applicant
      const userRequests = response.data.map((app) =>
        axiosInstance
          .get(`/api/users/${app.student}`)
          .then((res) => ({ id: app.student, ...res.data }))
      );

      const userResponses = await Promise.all(userRequests);

      // Map users
      const userMap = {};
      userResponses.forEach((user) => {
        userMap[user.id] = user;
      });
      setUserDetails(userMap);

      setError(null);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError("Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isSameColumn = orderBy === property;

    const isAsc = isSameColumn && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedApplicants = applicants
    .filter((applicant) =>
      statusFilter !== "ALL" ? applicant.status === statusFilter : true
    )
    .sort((a, b) => {
      const userA = userDetails[a.student] || {};
      const userB = userDetails[b.student] || {};

      const valueA = userA[orderBy] ?? a[orderBy];
      const valueB = userB[orderBy] ?? b[orderBy];

      // Handle missing values gracefully
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1;
      if (valueB == null) return -1;

      // Use string comparison if either is a string
      if (typeof valueA === "string" || typeof valueB === "string") {
        return order === "asc"
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      }

      // Otherwise use normal comparison for numbers/dates
      return order === "asc" ? valueA - valueB : valueB - valueA;
    });

  // Handle payment status dropdown change
  const handlePaymentStatusSelect = (e, applicantId, currentStatus) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setPendingPaymentStatus({ applicantId, newStatus, currentStatus });
    setDialogOpen(true);
  };

  // Confirm status change
  const confirmPaymentStatusChange = async () => {
    try {
      await axiosInstance.patch(
        `/api/applications/${pendingPaymentStatus.applicantId}/`,
        {
          payment_status: pendingPaymentStatus.newStatus,
        }
      );
      fetchApplicants();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status.");
    } finally {
      setDialogOpen(false);
      setPendingPaymentStatus({
        applicantId: null,
        newStatus: "",
        currentStatus: "",
      });
    }
  };

  // Cancel status change
  const cancelPaymentStatusChange = () => {
    setDialogOpen(false);
    setPendingPaymentStatus({
      applicantId: null,
      newStatus: "",
      currentStatus: "",
    });
  };

  // Copy emails function
  const handleCopyEmails = async () => {
    if (sortedApplicants.length === 0) {
      setSnackbarMessage('No applicants to copy emails from');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const emails = sortedApplicants
      .map(applicant => userDetails[applicant.student]?.email)
      .filter(Boolean);

    if (emails.length === 0) {
      setSnackbarMessage('No valid emails found');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const emailString = emails.join(';');
    const result = await copyToClipboard(emailString);

    if (result.success) {
      setSnackbarMessage(`${emails.length} emails copied to clipboard`);
      setSnackbarSeverity('success');
    } else {
      setSnackbarMessage(result.error || 'Failed to copy emails');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper sx={{ padding: "20px", marginTop: "20px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <TextField
          select
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: "200px" }}
        >
          <MenuItem value="ALL">All</MenuItem>
          {Object.values(STATUS).map((status) => (
            <MenuItem key={status} value={status}>
              {getStatusLabel(status)}
            </MenuItem>
          ))}
        </TextField>
        
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyEmails}
          sx={{ height: "40px" }}
        >
          Copy Emails ({sortedApplicants.length})
        </Button>
      </Box>

      <TableContainer>
        <Table
          stickyHeader
          size="small"
          sx={{
            "& .MuiTableCell-root": {
              padding: "6px 4px",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {[
                { id: "display_name", label: "Display Name" },
                { id: "username", label: "Username" },
                { id: "email", label: "Email" },
                { id: "payment_status", label: "Payment Status" },
              ].map((column) => (
                <TableCell
                  key={column.id}
                  style={column.id === "status" ? { width: "80px" } : {}}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedApplicants.map((applicant) => {
              const user = userDetails[applicant.student] || {};
              return (
                <TableRow
                  key={applicant.id}
                  hover
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{user.display_name || "N/A"}</TableCell>
                  <TableCell>{user.username || "N/A"}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <PaymentStatusDropDown
                      applicant={applicant}
                      handlePaymentStatus={handlePaymentStatusSelect}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && <Typography sx={{ mt: 2 }}>Loading applicants...</Typography>}
      {error && (
        <Typography sx={{ mt: 2, color: "error.main" }}>{error}</Typography>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={cancelPaymentStatusChange}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the status from{" "}
            <strong>
              {getStatusLabel(pendingPaymentStatus.currentStatus)}
            </strong>{" "}
            to <strong>{getStatusLabel(pendingPaymentStatus.newStatus)}</strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelPaymentStatusChange} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmPaymentStatusChange}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for copy feedback */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PartnerApplicantTable;
