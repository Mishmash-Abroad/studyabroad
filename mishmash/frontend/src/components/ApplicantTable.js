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
  ALL_STATUSES,
  ALL_ADMIN_EDITABLE_STATUSES,
  STATUS,
  getStatusLabel,
} from "../utils/constants";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import NoteIcon from "@mui/icons-material/Note";
import DescriptionIcon from "@mui/icons-material/Description";

const ApplicantTable = ({ programId }) => {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("applied_on");
  const [order, setOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [noteSortType, setNoteSortType] = useState("count"); // 'count' or 'date'
  const [userDetails, setUserDetails] = useState({});
  const [documents, setDocuments] = useState({});
  const [confidentialNotes, setConfidentialNotes] = useState({});

  // State for the confirmation dialog and pending status update
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState({
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

      // Map documents
      const documentMap = {};
      documentResponses.forEach(({ id, docs }) => {
        documentMap[id] = docs || [];
      });
      setDocuments(documentMap);

      // Map confidential notes
      const noteMap = {};
      noteResponses.forEach(({ id, notes }) => {
        if (notes.length > 0) {
          const latestNote = notes.reduce((prev, current) =>
            new Date(prev.timestamp) > new Date(current.timestamp)
              ? prev
              : current
          );
          noteMap[id] = {
            count: notes.length,
            lastUpdated: new Date(latestNote.timestamp).toLocaleString(),
            lastAuthor: latestNote.author_display || "Deleted User",
          };
        } else {
          noteMap[id] = { count: 0, lastUpdated: "N/A", lastAuthor: "N/A" };
        }
      });
      setConfidentialNotes(noteMap);

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
  
    if (property === "notes") {
      // Toggle note sort type if same column, otherwise default to 'count'
      if (isSameColumn) {
        setNoteSortType(noteSortType === "count" ? "date" : "count");
        setOrder(order === "asc" ? "desc" : "asc"); // Toggle order
      } else {
        setOrderBy("notes");
        setNoteSortType("count");
        setOrder("asc"); // or "desc" as a default, your choice
      }
    } else {
      const isAsc = isSameColumn && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    }
  };

  const sortedApplicants = applicants
    .filter((applicant) =>
      statusFilter !== "ALL" ? applicant.status === statusFilter : true
    )
    .sort((a, b) => {
      // Special handling for documents and notes columns
      if (orderBy === "documents") {
        const docsA = documents[a.id] || [];
        const docsB = documents[b.id] || [];
        const requiredDocs = [
          "Acknowledgement of the code of conduct",
          "Housing questionnaire",
          "Medical/health history and immunization records",
          "Assumption of risk form",
        ];

        const countA = requiredDocs.filter((type) =>
          docsA.some((doc) => doc.type === type)
        ).length;

        const countB = requiredDocs.filter((type) =>
          docsB.some((doc) => doc.type === type)
        ).length;

        return order === "asc" ? countA - countB : countB - countA;
      }

      if (orderBy === "notes") {
        const notesA = confidentialNotes[a.id] || {
          count: 0,
          lastUpdated: "N/A",
        };
        const notesB = confidentialNotes[b.id] || {
          count: 0,
          lastUpdated: "N/A",
        };

        if (noteSortType === "count") {
          // Sort by count
          return order === "asc"
            ? notesA.count - notesB.count
            : notesB.count - notesA.count;
        } else {
          // Sort by date
          // Handle N/A cases
          if (notesA.lastUpdated === "N/A" && notesB.lastUpdated === "N/A")
            return 0;
          if (notesA.lastUpdated === "N/A") return order === "asc" ? -1 : 1;
          if (notesB.lastUpdated === "N/A") return order === "asc" ? 1 : -1;

          // Sort by date
          const dateA = new Date(notesA.lastUpdated);
          const dateB = new Date(notesB.lastUpdated);
          return order === "asc" ? dateA - dateB : dateB - dateA;
        }
      }

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
  const handleStatusSelect = (e, applicantId, currentStatus) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setPendingStatus({ applicantId, newStatus, currentStatus });
    setDialogOpen(true);
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    try {
      await axiosInstance.patch(
        `/api/applications/${pendingStatus.applicantId}/`,
        {
          status: pendingStatus.newStatus,
        }
      );
      fetchApplicants();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status.");
    } finally {
      setDialogOpen(false);
      setPendingStatus({ applicantId: null, newStatus: "", currentStatus: "" });
    }
  };

  // Cancel status change
  const cancelStatusChange = () => {
    setDialogOpen(false);
    setPendingStatus({ applicantId: null, newStatus: "", currentStatus: "" });
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
                { id: "date_of_birth", label: "Date of Birth" },
                { id: "gpa", label: "GPA" },
                { id: "major", label: "Major" },
                { id: "applied_on", label: "Applied On" },
                { id: "documents", label: "Documents" },
                {
                  id: "notes",
                  label: `Notes ${
                    orderBy === "notes"
                      ? noteSortType === "count"
                        ? "(by Count)"
                        : "(by Date)"
                      : ""
                  }`,
                },
                { id: "status", label: "Status" },
              ].map((column) => (
                <TableCell
                  key={column.id}
                  style={column.id === "status" ? { width: "80px" } : {}}
                >
                  {column.id !== "status" ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedApplicants.map((applicant) => {
              const user = userDetails[applicant.student] || {};
              const docs = documents[applicant.id] || [];
              const notes = confidentialNotes[applicant.id] || {
                count: 0,
                lastUpdated: "N/A",
              };

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
                  <TableCell>
                    {new Date(applicant.applied_on).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{renderDocumentsSummary(docs)}</TableCell>
                  <TableCell>{renderNotesSummary(notes)}</TableCell>
                  <TableCell style={{ padding: "6px 4px" }}>
                    <TextField
                      select
                      size="small"
                      value={applicant.status}
                      onChange={(e) =>
                        handleStatusSelect(e, applicant.id, applicant.status)
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
                      {ALL_ADMIN_EDITABLE_STATUSES.map((status, index) => (
                        <MenuItem key={index} value={status}>
                          {getStatusLabel(status)}
                        </MenuItem>
                      ))}
                      {!ALL_ADMIN_EDITABLE_STATUSES.includes(
                        applicant.status
                      ) && (
                        <MenuItem
                          key="current"
                          value={applicant.status}
                          disabled
                        >
                          {getStatusLabel(applicant.status)}
                        </MenuItem>
                      )}
                    </TextField>
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
      <Dialog open={dialogOpen} onClose={cancelStatusChange}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the status from{" "}
            <strong>{getStatusLabel(pendingStatus.currentStatus)}</strong> to{" "}
            <strong>{getStatusLabel(pendingStatus.newStatus)}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelStatusChange} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmStatusChange}
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

export default ApplicantTable;
