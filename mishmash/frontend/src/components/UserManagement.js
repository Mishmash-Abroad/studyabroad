import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
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
  IconButton,
  Tooltip,
  Chip
} from "@mui/material";
import { 
  AdminPanelSettings, 
  Person, 
  Storage, 
  Delete,
  ArrowUpward,
  ArrowDownward,
  Link,
  Key,
  AccountCircle,
  SwapVert,
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import axiosInstance from "../utils/axios";
import ChangePasswordModal from "./ChangePasswordModal";

// Styled components to match AdminProgramsTable
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '4px 8px',
  fontSize: '0.875rem',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableRow-root": {
    backgroundColor: theme.palette.background.default,
    borderBottom: `3px solid ${theme.palette.divider}`,
  },
  "& .MuiTableCell-root": {
    fontWeight: 'bold',
  }
}));

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderBy, setOrderBy] = useState("username");
    const [order, setOrder] = useState("asc");
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // Get current user info from localStorage or from API
      const userData = localStorage.getItem('user') 
        ? JSON.parse(localStorage.getItem('user')) 
        : (await axiosInstance.get('/api/users/me/')).data;
      
      setCurrentUser(userData);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

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
    const valueA = a[orderBy]?.toString().toLowerCase() || "";
    const valueB = b[orderBy]?.toString().toLowerCase() || "";
    return order === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
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
          try {
            await axiosInstance.delete(`/api/users/${user.id}/`);
            fetchUsers();
            setConfirmDialog(null);
          } catch (error) {
            if (error.response && error.response.status === 403) {
              setError(error.response.data.detail || "Cannot delete this user. Operation not permitted.");
            } else {
              setError("Failed to delete user. Please try again.");
            }
            console.error("Error deleting user:", error);
            setConfirmDialog(null);
          }
        },
      });
    } catch (err) {
      console.error("Error fetching user warnings:", err);
      setError("Failed to fetch user information.");
    }
  };

  // Column configuration
  const columns = [
    { id: 'display_name', label: 'Name' },
    { id: 'username', label: 'Username' },
    { id: 'email', label: 'Email' },
    { id: 'is_sso', label: 'Type' },
    { id: 'is_admin', label: 'Role', align: 'center' },
    { id: 'actions', label: 'Actions', sortable: false, align: 'center' }
  ];

  return (
    <Paper sx={{ padding: "20px", marginTop: "20px" }}>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>

      {loading && <Typography>Loading users...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <TableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell 
                  key={column.id}
                  align={column.align}
                >
                  {column.sortable !== false ? (
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
                </StyledTableCell>
              ))}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {sortedUsers.map((user) => {
              const isCurrentUser = currentUser && (user.id === currentUser.id || user.username === currentUser.username);
              return (
              <TableRow 
                key={user.id}
                sx={isCurrentUser ? { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                } : {}}
              >
                <StyledTableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isCurrentUser && (
                      <Tooltip title="Current user" disableInteractive>
                        <AccountCircle color="primary" sx={{ mr: 1 }} />
                      </Tooltip>
                    )}
                    {user.display_name}
                  </Box>
                </StyledTableCell>
                <StyledTableCell>{user.username}</StyledTableCell>
                <StyledTableCell>{user.email}</StyledTableCell>
                <StyledTableCell>
                  <Chip
                    icon={user.is_sso ? <Link color="secondary" /> : <Storage color="secondary" />}
                    label={user.is_sso ? "SSO" : "Local"}
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      icon={user.is_admin ? <AdminPanelSettings /> : <Person />} 
                      label={user.is_admin ? "Admin" : "User"} 
                      color={user.is_admin ? "primary" : "default"}
                      size="small"
                      sx={{ minWidth: 80 }}
                    />
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    {/* Promote/Demote Button - replaced with horizontal transition UI */}
                    {user.username !== "admin" && !isCurrentUser && (
                      <Tooltip 
                        title={
                          isCurrentUser 
                            ? "You cannot change your own role" 
                            : user.is_admin 
                              ? "Demote to User" 
                              : "Promote to Admin"
                        } 
                        disableInteractive
                      >
                        <Box 
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 0.5,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                          onClick={() => !isCurrentUser && user.username !== "admin" && handlePromoteDemote(user)}
                        >
                          {/* Admin Icon - larger if user is admin */}
                          <AdminPanelSettings 
                            color={user.is_admin ? "primary" : "disabled"}
                            sx={{ 
                              fontSize: user.is_admin ? 22 : 16,
                              opacity: user.is_admin ? 1 : 0.5
                            }}
                          />
                          
                          {/* Transition Arrow */}
                          {user.is_admin ? (
                            <KeyboardArrowRight color="action" sx={{ fontSize: 16, mx: 0.5 }} />
                          ) : (
                            <KeyboardArrowLeft color="action" sx={{ fontSize: 16, mx: 0.5 }} />
                          )}
                          
                          {/* User Icon - larger if user is not admin */}
                          <Person 
                            color={!user.is_admin ? "primary" : "disabled"}
                            sx={{ 
                              fontSize: !user.is_admin ? 22 : 16,
                              opacity: !user.is_admin ? 1 : 0.5
                            }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                    
                    {user.username === "admin" && (
                      <Tooltip title="System admin role cannot be changed" disableInteractive>
                        <span>
                          <Box 
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: 0.5,
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              opacity: 0.5,
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }}
                          >
                            <AdminPanelSettings color="primary" sx={{ fontSize: 22 }} />
                            <KeyboardArrowRight color="disabled" sx={{ fontSize: 16, mx: 0.5, opacity: 0.5 }} />
                            <Person color="disabled" sx={{ fontSize: 16, opacity: 0.5 }} />
                          </Box>
                        </span>
                      </Tooltip>
                    )}
                    
                    {isCurrentUser && user.username !== "admin" && (
                      <Tooltip title="You cannot change your own role" disableInteractive>
                        <span>
                          <Box 
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: 0.5,
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              opacity: 0.5,
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }}
                          >
                            <AdminPanelSettings 
                              color={user.is_admin ? "primary" : "disabled"}
                              sx={{ 
                                fontSize: user.is_admin ? 22 : 16,
                                opacity: user.is_admin ? 1 : 0.5
                              }}
                            />
                            {user.is_admin ? (
                              <KeyboardArrowRight color="disabled" sx={{ fontSize: 16, mx: 0.5, opacity: 0.5 }} />
                            ) : (
                              <KeyboardArrowLeft color="disabled" sx={{ fontSize: 16, mx: 0.5, opacity: 0.5 }} />
                            )}
                            <Person 
                              color={!user.is_admin ? "primary" : "disabled"}
                              sx={{ 
                                fontSize: !user.is_admin ? 22 : 16,
                                opacity: !user.is_admin ? 1 : 0.5
                              }}
                            />
                          </Box>
                        </span>
                      </Tooltip>
                    )}

                    {/* Change Password Button */}
                    <Tooltip title={user.is_sso ? "SSO users use external authentication" : "Change Password"} disableInteractive>
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => !user.is_sso && setSelectedUser(user)}
                          disabled={user.is_sso}
                          size="small"
                        >
                          <Key />
                        </IconButton>
                      </span>
                    </Tooltip>

                    {/* Delete Button */}
                    <Tooltip 
                      title={
                        user.username === "admin" 
                          ? "System admin cannot be deleted" 
                          : isCurrentUser
                            ? "You cannot delete your own account"
                            : user.is_sso
                              ? "SSO users cannot be deleted" 
                              : "Delete User"
                      } 
                      disableInteractive
                    >
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => !isCurrentUser && user.username !== "admin" && !user.is_sso && handleDeleteUser(user)}
                          disabled={isCurrentUser || user.username === "admin" || user.is_sso}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </StyledTableCell>
              </TableRow>
              );
            })}
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