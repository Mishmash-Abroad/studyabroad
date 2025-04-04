import React, { useState, useEffect, use } from "react";
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
  Chip,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Menu,
  CircularProgress,
} from "@mui/material";
import {
  AdminPanelSettings,
  Person,
  Storage,
  Delete,
  Key,
  AccountCircle,
  School,
  AssignmentTurnedIn,
  Search,
  Add,
  Link,
} from "@mui/icons-material";
import axiosInstance from "../utils/axios";
import ChangePasswordModal from "./ChangePasswordModal";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: "16px",
  marginTop: "20px",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "4px 8px",
  fontSize: "0.875rem",
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableRow-root": {
    backgroundColor: theme.palette.background.default,
    borderBottom: `3px solid ${theme.palette.divider}`,
  },
  "& .MuiTableCell-root": {
    fontWeight: "bold",
  },
}));

const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  "&.MuiTableSortLabel-root": {
    color: theme.palette.text.primary,
  },
  "&.MuiTableSortLabel-active": {
    color: theme.palette.primary.main,
  },
}));

// UserRoleChips Component - Handles the display and management of user roles
const UserRoleChips = ({ user, currentUser, onRoleChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const chipStyle = { height: 24, minWidth: 90 };

  // Check which roles are available to add (ones user doesn't already have)
  const availableRoles = [];
  if (!user.is_admin) availableRoles.push("admin");
  if (!user.is_faculty) availableRoles.push("faculty");
  if (!user.is_reviewer) availableRoles.push("reviewer");
  if (!user.is_provider_partner) availableRoles.push("provider_partner");

  // Whether user has any roles
  const hasAnyRole = user.is_admin || user.is_faculty || user.is_reviewer || user.is_provider_partner;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
      }}
    >
      {/* Admin role chip */}
      {user.is_admin && (
        <Chip
          size="small"
          color="primary"
          icon={<AdminPanelSettings fontSize="small" />}
          label="Admin"
          onDelete={
            user.username === "admin" || currentUser?.id === user.id
              ? undefined
              : () => onRoleChange(user, "admin", false)
          }
          sx={chipStyle}
        />
      )}

      {/* Faculty role chip */}
      {user.is_faculty && (
        <Chip
          size="small"
          color="info"
          icon={<School fontSize="small" />}
          label="Faculty"
          onDelete={
            currentUser?.id === user.id
              ? undefined
              : () => onRoleChange(user, "faculty", false)
          }
          sx={chipStyle}
        />
      )}

      {/* Reviewer role chip */}
      {user.is_reviewer && (
        <Chip
          size="small"
          color="success"
          icon={<AssignmentTurnedIn fontSize="small" />}
          label="Reviewer"
          onDelete={
            currentUser?.id === user.id
              ? undefined
              : () => onRoleChange(user, "reviewer", false)
          }
          sx={chipStyle}
        />
      )}

      {user.is_provider_partner && (
        <Chip
          size="small"
          color="success"
          icon={<AssignmentTurnedIn fontSize="small" />}
          label="Provider Partner"
          onDelete={
            currentUser?.id === user.id
              ? undefined
              : () => onRoleChange(user, "provider_partner", false)
          }
          sx={chipStyle}
        />
      )}

      {/* Regular user chip (no roles) */}
      {!hasAnyRole && (
        <Chip
          size="small"
          variant="outlined"
          icon={<Person fontSize="small" />}
          label="Regular User"
          sx={chipStyle}
        />
      )}

      {/* Add role button */}
      {availableRoles.length > 0 && (
        <Tooltip title="Add role">
          <IconButton
            size="small"
            sx={{
              border: "1px dashed rgba(0, 0, 0, 0.23)",
              borderRadius: "50%",
              padding: "2px",
              height: 24,
              width: 24,
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Role selection menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 3, sx: { minWidth: 180, mt: 0.5 } }}
      >
        {!user.is_admin && (
          <MenuItem
            onClick={() => {
              onRoleChange(user, "admin", true);
              setAnchorEl(null);
            }}
            disabled={user.username === "admin" || currentUser?.id === user.id}
          >
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Promote to Admin</ListItemText>
          </MenuItem>
        )}

        {!user.is_faculty && (
          <MenuItem
            onClick={() => {
              onRoleChange(user, "faculty", true);
              setAnchorEl(null);
            }}
            disabled={currentUser?.id === user.id}
          >
            <ListItemIcon>
              <School fontSize="small" />
            </ListItemIcon>
            <ListItemText>Promote to Faculty</ListItemText>
          </MenuItem>
        )}

        {!user.is_reviewer && (
          <MenuItem
            onClick={() => {
              onRoleChange(user, "reviewer", true);
              setAnchorEl(null);
            }}
            disabled={currentUser?.id === user.id}
          >
            <ListItemIcon>
              <AssignmentTurnedIn fontSize="small" />
            </ListItemIcon>
            <ListItemText>Promote to Reviewer</ListItemText>
          </MenuItem>
        )}

        {!user.is_provider_partner && (
          <MenuItem
            onClick={() => {
              onRoleChange(user, "provider_partner", true);
              setAnchorEl(null);
            }}
            disabled={currentUser?.id === user.id}
          >
            <ListItemIcon>
              <AssignmentTurnedIn fontSize="small" />
            </ListItemIcon>
            <ListItemText>Promote to Provider Partner</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

// UserActionButtons Component - Handles user-related actions
const UserActionButtons = ({
  user,
  currentUser,
  onChangePassword,
  onDeleteUser,
}) => {
  const isCurrentUser = currentUser?.id === user.id;
  const isSystemAdmin = user.username === "admin";

  return (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
      {/* Change Password Button */}
      <Tooltip
        title={
          user.is_sso
            ? "SSO users use external authentication"
            : "Change Password"
        }
        disableInteractive
      >
        <span>
          <IconButton
            color="primary"
            onClick={() => !user.is_sso && onChangePassword(user)}
            disabled={user.is_sso}
            size="small"
          >
            <Key />
          </IconButton>
        </span>
      </Tooltip>

      {/* Delete User Button */}
      <Tooltip
        title={
          isSystemAdmin
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
            onClick={() => onDeleteUser(user)}
            disabled={isCurrentUser || isSystemAdmin || user.is_sso}
            size="small"
          >
            <Delete />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

// ConfirmationDialog Component - For role changes and user deletion
const ConfirmationDialog = ({ confirmDialog, onClose }) => {
  if (!confirmDialog) return null;

  return (
    <Dialog open={Boolean(confirmDialog)} onClose={onClose}>
      <DialogTitle>{confirmDialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{confirmDialog.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={confirmDialog.onConfirm} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main UserManagement Component
const UserManagement = () => {
  // State declarations
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("username");
  const [order, setOrder] = useState("asc");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Column definitions
  const columns = [
    { id: "username", label: "Username", sortable: true, align: "left" },
    {
      id: "display_name",
      label: "Display Name",
      sortable: true,
      align: "left",
    },
    { id: "email", label: "Email", sortable: true, align: "left" },
    { id: "is_sso", label: "Type", sortable: true, align: "center" },
    { id: "roles", label: "Roles", sortable: false, align: "center" },
    {
      id: "actions",
      label: "Account Actions",
      sortable: false,
      align: "center",
    },
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users/");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      handleApiError(err, "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user from localStorage
  const fetchCurrentUser = async () => {
    try {
      const userData = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;
      setCurrentUser(userData);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  // Handle API errors consistently
  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    if (error.response) {
      if (error.response.status === 400) {
        setError(error.response.data.detail || defaultMessage);
      } else if (error.response.status === 403) {
        setError(
          error.response.data.detail ||
            "You don't have permission to perform this action."
        );
      } else if (error.response.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError(error.response.data?.detail || defaultMessage);
      }
    } else {
      setError(defaultMessage);
    }
  };

  // Handle table sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle role changes (promotion/demotion)
  const handleRoleChange = async (user, roleType, addRole) => {
    // Don't do anything if trying to modify system admin or current user
    if (user.username === "admin" || currentUser?.id === user.id) {
      return;
    }

    try {
      const warningResponse = await axiosInstance.get(
        `/api/users/${user.id}/user_warnings/`
      );
      const { applications_count, faculty_programs } = warningResponse.data;

      // Prepare appropriate dialog message based on role and action
      let title, message, action;

      if (addRole) {
        // Different messages based on current roles
        const hasNoApplications =
          user.is_faculty || user.is_reviewer || user.is_admin || user.is_provider_partner;

        title = `Warning: Promote to ${
          roleType.charAt(0).toUpperCase() + roleType.slice(1)
        }`;

        if (hasNoApplications) {
          message = `Are you sure you want to promote ${user.display_name} to ${roleType}?`;
        } else {
          message = `Promoting ${user.display_name} to ${roleType} will delete their ${applications_count} submitted applications. Do you wish to proceed?`;
        }

        action = { [`is_${roleType}`]: true };
      } else {
        title = `Warning: Demote from ${
          roleType.charAt(0).toUpperCase() + roleType.slice(1)
        }`;

        // Different messages based on whether they have faculty programs
        if (roleType === "reviewer") {
          message = `Are you sure you want to demote ${user.display_name} from reviewer? This may affect their ability to review applications.`;
        } else if (roleType === "faculty") {
          // For faculty and admin roles, check if they're a faculty lead for any programs
          if (faculty_programs && faculty_programs.length > 0) {
            message = `Demoting ${
              user.display_name
            } from ${roleType} will remove them as faculty lead for the following programs: ${faculty_programs.join(
              ", "
            )}.`;
          } else {
            message = `Are you sure you want to demote ${user.display_name} from ${roleType}?`;
          }
        } else if (roleType === "admin") {
          // Admin role isn't directly associated with programs
          message = `Are you sure you want to demote ${user.display_name} from admin?`;
        }

        action = { [`is_${roleType}`]: false };
      }

      // Show confirmation dialog
      setConfirmDialog({
        title,
        message,
        onConfirm: async () => {
          try {
            await axiosInstance.patch(`/api/users/${user.id}/`, action);
            fetchUsers();
            setConfirmDialog(null);
          } catch (error) {
            handleApiError(error, `Failed to update user role.`);
          }
        },
      });
    } catch (err) {
      handleApiError(err, "Error fetching user information");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (user) => {
    try {
      const warningResponse = await axiosInstance.get(
        `/api/users/${user.id}/user_warnings/`
      );
      const { applications_count, faculty_programs } = warningResponse.data;

      // Build a context-appropriate message based on user roles and data
      let message = `Are you sure you want to delete ${user.display_name}?`;

      // Only mention faculty lead programs if the user is actually a faculty member AND has programs
      const hasFacultyPrograms =
        user.is_faculty && faculty_programs && faculty_programs.length > 0;

      // Only mention applications if they have any
      const hasApplications = applications_count > 0;
      const programs_affected =
        faculty_programs.join(", ") == "None"
          ? "no programs"
          : faculty_programs.join(", ");
      if (hasFacultyPrograms && hasApplications) {
        message = `Deleting ${user.display_name} will remove them as faculty lead for ${programs_affected} and delete their ${applications_count} submitted applications. Proceed?`;
      } else if (hasFacultyPrograms) {
        message = `Deleting ${user.display_name} will remove them as faculty lead for ${programs_affected}. Proceed?`;
      } else if (hasApplications) {
        message = `Deleting ${user.display_name} will delete their ${applications_count} submitted applications. Proceed?`;
      }

      setConfirmDialog({
        title: "Confirm User Deletion",
        message,
        onConfirm: async () => {
          try {
            await axiosInstance.delete(`/api/users/${user.id}/`);
            fetchUsers();
            setConfirmDialog(null);
          } catch (error) {
            handleApiError(error, "Failed to delete user. Please try again.");
          }
        },
      });
    } catch (err) {
      handleApiError(err, "Error fetching user information.");
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user) => {
      // Role filtering
      if (roleFilter === "ALL") return true;
      if (roleFilter === "ADMIN" && user.is_admin) return true;
      if (roleFilter === "FACULTY" && user.is_faculty) return true;
      if (roleFilter === "REVIEWER" && user.is_reviewer) return true;
      if (roleFilter === "PROVIDER_PARTNER" && user.is_provider_partner) return true;
      if (
        roleFilter === "REGULAR" &&
        !user.is_admin &&
        !user.is_faculty &&
        !user.is_reviewer && 
        !user.is_provider_partner
      )
        return true;
      return false;
    })
    .filter((user) => {
      // Search filtering
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        user.display_name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Sorting
      const valueA = a[orderBy]?.toString().toLowerCase() || "";
      const valueB = b[orderBy]?.toString().toLowerCase() || "";
      return order === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

  return (
    <StyledPaper>
      {/* Header with search and filter */}
      <Grid container spacing={2} sx={{ p: 2, mb: 2, alignItems: "center" }}>
        <Grid item xs={12} sm={4} md={3}>
          <Typography variant="h6">User Management</Typography>
          {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </Grid>

        <Grid item xs={12} sm={8} md={5}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel id="role-filter-label">Filter by Role</InputLabel>
            <Select
              labelId="role-filter-label"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="Filter by Role"
            >
              <MenuItem value="ALL">All Users</MenuItem>
              <MenuItem value="ADMIN">Admins</MenuItem>
              <MenuItem value="FACULTY">Faculty</MenuItem>
              <MenuItem value="REVIEWER">Reviewers</MenuItem>
              <MenuItem value="REGULAR">Regular Users</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Error message */}
      {error && (
        <Box sx={{ mt: 2, mb: 2, pl: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      {/* Users table */}
      <TableContainer>
        <Table sx={{ minWidth: 700 }} aria-label="users table">
          <StyledTableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell key={column.id} align={column.align}>
                  {column.sortable !== false ? (
                    <StyledTableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </StyledTableSortLabel>
                  ) : (
                    column.label
                  )}
                </StyledTableCell>
              ))}
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {filteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={columns.length} align="center">
                  {loading ? "Loading users..." : "No users found"}
                </StyledTableCell>
              </TableRow>
            ) : (
              filteredAndSortedUsers.map((user) => {
                const isCurrentUser =
                  currentUser &&
                  (user.id === currentUser.id ||
                    user.username === currentUser.username);

                return (
                  <TableRow
                    key={user.id}
                    hover
                    sx={
                      isCurrentUser
                        ? {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.08)",
                            },
                          }
                        : {}
                    }
                  >
                    <StyledTableCell>{user.username}</StyledTableCell>
                    <StyledTableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {isCurrentUser && (
                          <Tooltip title="Current user" disableInteractive>
                            <AccountCircle color="primary" sx={{ mr: 1 }} />
                          </Tooltip>
                        )}
                        {user.display_name}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>{user.email}</StyledTableCell>
                    <StyledTableCell align="center">
                      <Chip
                        icon={
                          user.is_sso ? (
                            <Link color="secondary" />
                          ) : (
                            <Storage color="secondary" />
                          )
                        }
                        label={user.is_sso ? "SSO" : "Local"}
                        color="secondary"
                        size="small"
                        variant="outlined"
                        sx={{ height: 24, minWidth: 90 }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <UserRoleChips
                        user={user}
                        currentUser={currentUser}
                        onRoleChange={handleRoleChange}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <UserActionButtons
                        user={user}
                        currentUser={currentUser}
                        onChangePassword={(user) => setSelectedUser(user)}
                        onDeleteUser={handleDeleteUser}
                      />
                    </StyledTableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs and modals */}
      <ConfirmationDialog
        confirmDialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />

      {selectedUser && (
        <ChangePasswordModal
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.id}
        />
      )}
    </StyledPaper>
  );
};

export default UserManagement;
