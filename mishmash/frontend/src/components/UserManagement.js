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
  Button,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axiosInstance from "../utils/axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("username");
  const [order, setOrder] = useState("asc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users/");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valueA = a[orderBy] || "";
    const valueB = b[orderBy] || "";
    return order === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });

  const handlePromoteDemote = async (user) => {
    if (user.is_admin) {
      // Demoting
      try {
        const programResponse = await axiosInstance.get(`/api/programs/?faculty_lead=${user.id}`);
        const affectedPrograms = programResponse.data;

        if (affectedPrograms.length > 0) {
          const programsNeedingReassignment = affectedPrograms.filter((p) => p.faculty_leads.length === 1);

          if (programsNeedingReassignment.length > 0) {
            setConfirmDialog({
              title: "Faculty Lead Reassignment Required",
              message: `Demoting ${user.display_name} will leave the following programs without a faculty lead: ${programsNeedingReassignment
                .map((p) => p.title)
                .join(", ")}. The admin account will be reassigned as faculty lead.`,
              onConfirm: async () => {
                await axiosInstance.patch(`/api/users/${user.id}/`, { is_admin: false });
                await Promise.all(
                  programsNeedingReassignment.map((p) =>
                    axiosInstance.patch(`/api/programs/${p.id}/`, { faculty_lead: "admin" })
                  )
                );
                fetchUsers();
                setConfirmDialog(null);
              },
            });
            return;
          }
        }
      } catch (err) {
        console.error("Error checking faculty leads:", err);
        return;
      }
    }

    // Directly toggle admin status
    await axiosInstance.patch(`/api/users/${user.id}/`, { is_admin: !user.is_admin });
    fetchUsers();
  };

  const handleDeleteUser = async (user) => {
    try {
      const programResponse = await axiosInstance.get(`/api/programs/?faculty_lead=${user.id}`);
      const affectedPrograms = programResponse.data;

      setConfirmDialog({
        title: "Confirm User Deletion",
        message: `Are you sure you want to delete ${user.display_name}? They are listed as faculty lead in ${affectedPrograms.length} program(s). If removed, the faculty lead will be reassigned to admin.`,
        onConfirm: async () => {
          await axiosInstance.delete(`/api/users/${user.id}/`);
          fetchUsers();
          setConfirmDialog(null);
        },
      });
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <Paper sx={{ padding: "20px", marginTop: "20px" }}>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>

      {loading && <Typography>Loading users...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {["display_name", "username", "email", "is_admin", "is_sso", "actions"].map((column) => (
                <TableCell key={column}>
                  <TableSortLabel
                    active={orderBy === column}
                    direction={orderBy === column ? order : "asc"}
                    onClick={() => handleRequestSort(column)}
                  >
                    {column.replace(/_/g, " ").toUpperCase()}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.display_name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.is_admin ? "Admin" : "User"}</TableCell>
                <TableCell>{user.is_sso ? "SSO" : "Local"}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {/* Promote/Demote Button */}
                    {user.username !== "admin" && (
                      <Button
                        variant="contained"
                        color={user.is_admin ? "secondary" : "primary"}
                        onClick={() => handlePromoteDemote(user)}
                      >
                        {user.is_admin ? "Demote" : "Promote"}
                      </Button>
                    )}

                    {/* Change Password Button (Disabled for SSO) */}
                    {!user.is_sso && (
                      <Button variant="contained" color="info">
                        Change Password
                      </Button>
                    )}

                    {/* Delete Button (Disabled for admin) */}
                    {user.username !== "admin" && !user.is_sso && (
                      <Button variant="contained" color="error" onClick={() => handleDeleteUser(user)}>
                        Delete
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog open onClose={() => setConfirmDialog(null)}>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{confirmDialog.message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button onClick={confirmDialog.onConfirm} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default UserManagement;
