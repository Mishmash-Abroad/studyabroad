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
import ChangePasswordModal from "./ChangePasswordModal";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderBy, setOrderBy] = useState("username");
    const [order, setOrder] = useState("asc");
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
  
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
    try {
      const warningResponse = await axiosInstance.get(`/api/users/${user.id}/user_warnings/`);
      const { applications_count, faculty_programs } = warningResponse.data;
  
      if (!user.is_admin) {
        // Promoting to Admin: Applications will be deleted
        setConfirmDialog({
          title: "Warning: Promote to Admin",
          message: `Promoting ${user.display_name} to admin will delete their ${applications_count} submitted applications. Do you wish to proceed?`,
          onConfirm: async () => {
            await axiosInstance.patch(`/api/users/${user.id}/`, { is_admin: true });
            fetchUsers();
            setConfirmDialog(null);
          },
        });
      } else {
        // Demoting from Admin: Remove faculty lead roles
        setConfirmDialog({
          title: "Warning: Demote from Admin",
          message: `Demoting ${user.display_name} from admin will remove them as faculty lead for the following programs: ${faculty_programs.join(", ")}.`,
          onConfirm: async () => {
            await axiosInstance.patch(`/api/users/${user.id}/`, { is_admin: false });
            // await Promise.all(
            //   faculty_programs.map((program) =>
            //     axiosInstance.patch(`/api/programs/${program.id}/`, { faculty_lead: "admin" })
            //   )
            // );
            fetchUsers();
            setConfirmDialog(null);
          },
        });
      }
    } catch (err) {
      console.error("Error fetching user warnings:", err);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      const warningResponse = await axiosInstance.get(`/api/users/${user.id}/user_warnings/`);
      const { applications_count, faculty_programs } = warningResponse.data;
  
      setConfirmDialog({
        title: "Confirm User Deletion",
        message: `Deleting ${user.display_name} will remove them as faculty lead for ${faculty_programs.length} program(s) and delete their ${applications_count} submitted applications. Proceed?`,
        onConfirm: async () => {
          await axiosInstance.delete(`/api/users/${user.id}/`);
          fetchUsers();
          setConfirmDialog(null);
        },
      });
    } catch (err) {
      console.error("Error fetching user warnings:", err);
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
              {["display_name", "username", "email", "is_admin", "is_sso_user", "actions"].map((column) => (
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
                <TableCell>{user.is_sso_user ? "SSO" : "Local"}</TableCell>
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
                    {!user.is_sso_user ? (
                    <Button variant="contained" color="primary" onClick={() => setSelectedUser(user)}>
                      Change Password
                    </Button>
                    ) : (
                      <Typography color="textSecondary">SSO User</Typography>
                    )}

                    {/* Delete Button (Disabled for admin & SSO) */}
                    {user.username !== "admin" && !user.is_sso_user && (
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

      {/* Change Password Modal */}
      {selectedUser && <ChangePasswordModal onClose={() => setSelectedUser(null)} userId={selectedUser.id} />}
    </Paper>
  );
};

export default UserManagement;