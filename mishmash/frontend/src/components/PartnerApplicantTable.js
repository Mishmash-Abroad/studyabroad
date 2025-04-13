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
} from "@mui/material";
import axiosInstance from "../utils/axios";
import { STATUS, getStatusLabel } from "../utils/constants";
import PaymentStatusDropDown from "./PaymentStatusDropDown";

const PartnerApplicantTable = ({ programId }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("applied_on");
  const [order, setOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [userDetails, setUserDetails] = useState({});

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

  return (
    <Paper sx={{ padding: "20px", marginTop: "20px" }}>
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
    </Paper>
  );
};

export default PartnerApplicantTable;
