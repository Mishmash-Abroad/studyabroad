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
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import {
  get_all_available_statuses_to_edit,
  STATUS,
  getStatusLabel,
  getPaymentStatusLabel,
  ALL_PAYMENT_APPLICATION_STATUSES,
} from "../utils/constants";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import NoteIcon from "@mui/icons-material/Note";
import DescriptionIcon from "@mui/icons-material/Description";
import { useAuth } from "../context/AuthContext";

const PartnerApplicantTable = ({ programId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("applied_on");
  const [order, setOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [userDetails, setUserDetails] = useState({});
  const ALL_AVAILABLE_STATUSES = Object.values(
    get_all_available_statuses_to_edit(user.roles_object)
  );

  // State for the confirmation dialog and pending status update
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingApplicationStatus, setPendingApplicationStatus] = useState({
    applicantId: null,
    newStatus: "",
    currentStatus: "",
  });

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
      const documentRequests = response.data.map((app) =>
        axiosInstance
          .get(`/api/documents/?application=${app.id}`)
          .then((res) => ({ id: app.id, docs: res.data }))
      );
      const noteRequests = response.data.map((app) =>
        axiosInstance
          .get(`/api/notes/?application=${app.id}`)
          .then((res) => ({ id: app.id, notes: res.data }))
      );

      const userResponses = await Promise.all(userRequests);
      const documentResponses = await Promise.all(documentRequests);
      const noteResponses = await Promise.all(noteRequests);

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

  // Handle status dropdown change
  const handleApplicationStatusSelect = (e, applicantId, currentStatus) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setPendingApplicationStatus({ applicantId, newStatus, currentStatus });
    setDialogOpen(true);
  };

  // Handle payment status dropdown change
  const handlePaymentStatusSelect = (e, applicantId, currentStatus) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setPendingPaymentStatus({ applicantId, newStatus, currentStatus });
    setDialogOpen(true);
  };

  // Confirm status change
  const confirmApplicationStatusChange = async () => {
    try {
      await axiosInstance.patch(
        `/api/applications/${pendingApplicationStatus.applicantId}/`,
        {
          status: pendingApplicationStatus.newStatus,
        }
      );
      fetchApplicants();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status.");
    } finally {
      setDialogOpen(false);
      setPendingApplicationStatus({
        applicantId: null,
        newStatus: "",
        currentStatus: "",
      });
    }
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
  const cancelApplicationStatusChange = () => {
    setDialogOpen(false);
    setPendingApplicationStatus({
      applicantId: null,
      newStatus: "",
      currentStatus: "",
    });
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

  // Helper function to check document status
  const getDocumentStatus = (docs, type) => {
    if (!docs || !Array.isArray(docs)) return false;
    return docs.some((doc) => doc.type === type);
  };

  // Render document summary
  const renderDocumentsSummary = (docs) => {
    if (!docs || !Array.isArray(docs)) return "No documents";

    const requiredDocs = [
      "Acknowledgement of the code of conduct",
      "Housing questionnaire",
      "Medical/health history and immunization records",
      "Assumption of risk form",
    ];

    const submittedCount = requiredDocs.filter((type) =>
      getDocumentStatus(docs, type)
    ).length;
    const totalCount = requiredDocs.length;

    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="subtitle2">Document Status:</Typography>
            {requiredDocs.map((type) => (
              <Box
                key={type}
                display="flex"
                alignItems="center"
                gap={1}
                my={0.5}
              >
                {getDocumentStatus(docs, type) ? (
                  <CheckCircleIcon fontSize="small" color="success" />
                ) : (
                  <ErrorIcon fontSize="small" color="error" />
                )}
                <Typography variant="body2">{type}</Typography>
              </Box>
            ))}
          </Box>
        }
        PopperProps={{
          disablePortal: true,
          modifiers: [
            {
              name: "preventOverflow",
              enabled: true,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: true,
                rootBoundary: "document",
                padding: 8,
              },
            },
          ],
        }}
        disableFocusListener
        disableTouchListener
        followCursor
        leaveDelay={0}
      >
        <Box display="flex" alignItems="center">
          <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">
            {submittedCount}/{totalCount}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  // Render notes summary
  // Render notes summary with subscript for last update
  const renderNotesSummary = (notes) => {
    if (!notes || notes.count === 0) {
      return (
        <Box display="flex" alignItems="left">
          <NoteIcon fontSize="small" sx={{ mb: 0.5 }} />
          <Typography variant="body2">0</Typography>
        </Box>
      );
    }
    const lastUpdatedDate = notes.lastUpdated.split(",")[0];
    return (
      <Box display="flex" alignItems="left" flexDirection="column">
        <Box display="flex" alignItems="left">
          <NoteIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">{notes.count}</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {notes.lastAuthor} - {lastUpdatedDate}
        </Typography>
      </Box>
    );
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
                  onClick={() => navigate(`/applications/${applicant.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{user.display_name || "N/A"}</TableCell>
                  <TableCell>{user.username || "N/A"}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>{applicant.date_of_birth}</TableCell>
                  <TableCell>{applicant.gpa}</TableCell>
                  <TableCell>{applicant.major}</TableCell>
                  {applicant.track_payment &&
                    ALL_PAYMENT_APPLICATION_STATUSES.includes(
                      applicant.status
                    ) && (
                      <TableCell style={{ padding: "6px 4px" }}>
                        <TextField
                          select
                          size="small"
                          value={applicant.payment_status}
                          onChange={(e) =>
                            handlePaymentStatusSelect(
                              e,
                              applicant.id,
                              applicant.status
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            minWidth: "100px",
                            "& .MuiSelect-select": {
                              padding: "4px 6px",
                              fontSize: "0.8125rem",
                            },
                            "& .MuiSelect-icon": {
                              right: "2px",
                            },
                          }}
                        >
                          {["unpaid"].map((status, index) => (
                            <MenuItem key={index} value={status}>
                              {getPaymentStatusLabel(status)}
                            </MenuItem>
                          ))}
                          {!["unpaid"].includes(applicant.status) && (
                            <MenuItem
                              key="current"
                              value={applicant.status}
                              disabled
                            >
                              {getPaymentStatusLabel(applicant.status)}
                            </MenuItem>
                          )}
                        </TextField>
                      </TableCell>
                    )}
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
      <Dialog open={dialogOpen} onClose={cancelApplicationStatusChange}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the status from{" "}
            <strong>
              {getStatusLabel(pendingApplicationStatus.currentStatus)}
            </strong>{" "}
            to{" "}
            <strong>
              {getStatusLabel(pendingApplicationStatus.newStatus)}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelApplicationStatusChange} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmApplicationStatusChange}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PartnerApplicantTable;
