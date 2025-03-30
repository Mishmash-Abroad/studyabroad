import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tooltip,
  TableSortLabel,
  Menu,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Badge,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { STATUS, ALL_STATUSES } from "../utils/constants";
import axiosInstance from "../utils/axios";

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

// Helper function to copy emails by status
const copyEmailsByStatus = async (status, users, programId) => {
  console.log('Copy emails function called with:', { 
    status, 
    programId, 
    userCount: users?.length || 0 
  });
  
  try {
    if (!programId) {
      console.error('No program ID provided');
      return { success: false, error: 'No program ID provided' };
    }
    
    // Instead of using allUsers (which is empty), fetch the applications directly
    // This makes our code match the same logic used in the backend for counting
    const response = await axiosInstance.get(`/api/applications/?program=${programId}`);
    const applications = response.data;
    
    console.log(`Fetched ${applications.length} applications for program ${programId}`);
    
    // Filter applications based on status
    const filteredApplications = applications.filter(app => {
      if (status === 'total') {
        return ['applied', 'approved', 'enrolled', 'eligible'].includes(app.status.toLowerCase());
      } else {
        return app.status.toLowerCase() === status.toLowerCase();
      }
    });
    
    console.log(`Filtered ${applications.length} applications down to ${filteredApplications.length} for status "${status}"`);
    
    if (filteredApplications.length === 0) {
      return { 
        success: false, 
        error: `No emails found for ${status === 'total' ? 'active users' : status} status` 
      };
    }
    
    // For each application, we need to get the student's email
    const userRequests = filteredApplications.map(app => 
      axiosInstance.get(`/api/users/${app.student}`)
    );
    
    const userResponses = await Promise.all(userRequests);
    const emails = userResponses.map(response => response.data.email).filter(Boolean);
    
    console.log(`Found ${emails.length} emails:`, emails.substring(0, 100) + (emails.length > 100 ? '...' : ''));
    
    if (emails.length === 0) {
      return { success: false, error: 'No emails found' };
    }
    
    // Join emails with semicolon for Outlook
    const emailString = emails.join(';');
    return copyToClipboard(emailString);
  } catch (error) {
    console.error('Error fetching application data:', error);
    return { success: false, error: 'Error fetching application data' };
  }
};

// Component for the header cell in the AdminProgramsTable
export const ApplicantCountsHeaderCell = ({
  orderBy,
  order,
  onRequestSort,
  selectedStatuses,
  setSelectedStatuses,
  allUsers,
}) => {
  // State for menu
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null);
  const isStatusMenuOpen = Boolean(statusMenuAnchorEl);

  // Menu handling functions
  const handleStatusMenuOpen = (event) => {
    setStatusMenuAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
  };

  const handleStatusToggle = (statusKey) => {
    setSelectedStatuses((prev) => {
      // Special handling for TOTAL
      if (statusKey === "TOTAL") {
        const statusValue = "total_active";
        if (prev.includes(statusValue)) {
          return prev.filter((s) => s !== statusValue);
        } else {
          return [...prev, statusValue];
        }
      } else {
        // Regular status handling
        const statusLower = statusKey.toLowerCase();
        if (prev.includes(statusLower)) {
          return prev.filter((s) => s !== statusLower);
        } else {
          return [...prev, statusLower];
        }
      }
    });
  };

  const handleClearStatusSelection = () => {
    setSelectedStatuses([]);
  };

  // Handle sorting by selected statuses or by total if no statuses selected
  const handleSortByStatuses = () => {
    if (selectedStatuses.length > 0) {
      onRequestSort("selected_statuses");
    } else {
      onRequestSort("total_active");
    }
    handleStatusMenuClose(); // Close the menu after clicking the sort button
  };

  // Determine if we're currently sorting by any status-related field
  const isSortingByStatus =
    orderBy === "selected_statuses" ||
    orderBy === "total_active" ||
    Object.values(STATUS).some((status) => orderBy === status.toLowerCase());

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TableSortLabel
          active={isSortingByStatus}
          direction={order}
          onClick={handleSortByStatuses}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Applicant Counts
          </Typography>
          <Typography variant="caption" color="textSecondary">click each count to copy applicant emails to clipboard</Typography>

        </TableSortLabel>
      </Box>
      <Box>
        <Badge
          badgeContent={selectedStatuses.length}
          color="primary"
          invisible={selectedStatuses.length === 0}
          overlap="circular"
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <IconButton
            size="small"
            onClick={handleStatusMenuOpen}
            aria-controls={isStatusMenuOpen ? "status-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isStatusMenuOpen ? "true" : undefined}
            sx={{ p: 0.5 }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Badge>

        <Menu
          id="status-menu"
          anchorEl={statusMenuAnchorEl}
          open={isStatusMenuOpen}
          onClose={handleStatusMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            style: {
              maxHeight: "none",
              width: "350px",
              overflow: "auto",
            },
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Filter by Status Counts</Typography>
            <IconButton
              size="small"
              onClick={handleClearStatusSelection}
              disabled={selectedStatuses.length === 0}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "2px",
              px: 1,
              width: "100%",
            }}
          >
            {Object.values(STATUS).map((statusKey) => {
              const statusLower = statusKey.toLowerCase();
              const statusAbbr =
                ALL_STATUSES[statusKey]?.abbr || statusKey.substring(0, 3);
              return (
                <MenuItem
                  key={statusLower}
                  dense
                  sx={{
                    minHeight: "36px",
                    mx: 0.5,
                    px: 1,
                    borderRadius: "4px",
                    bgcolor: selectedStatuses.includes(statusLower)
                      ? "rgba(25, 118, 210, 0.08)"
                      : "transparent",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedStatuses.includes(statusLower)}
                        onChange={() => handleStatusToggle(statusKey)}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" fontWeight="medium">
                          {statusAbbr.charAt(0).toUpperCase() +
                            statusAbbr.slice(1).toLowerCase()}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({statusKey})
                        </Typography>
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      width: "100%",
                    }}
                  />
                </MenuItem>
              );
            })}

            {/* Add Total as an option */}
            <MenuItem
              key="total_active"
              dense
              sx={{
                minHeight: "36px",
                mx: 0.5,
                px: 1,
                borderRadius: "4px",
                bgcolor: selectedStatuses.includes("total_active")
                  ? "rgba(25, 118, 210, 0.08)"
                  : "transparent",
                gridColumn: "span 2",
                borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                mt: 1,
                pt: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedStatuses.includes("total_active")}
                    onChange={() => handleStatusToggle("TOTAL")}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="secondary"
                    >
                      Totl
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      (TOTAL)
                    </Typography>
                  </Box>
                }
                sx={{
                  margin: 0,
                  width: "100%",
                }}
              />
            </MenuItem>
          </Box>

          <Box sx={{ px: 2, py: 1, mt: 1 }}>
            <Button
              variant={
                orderBy === "selected_statuses" ? "contained" : "outlined"
              }
              color={orderBy === "selected_statuses" ? "primary" : "inherit"}
              size="small"
              fullWidth
              onClick={handleSortByStatuses}
              disabled={selectedStatuses.length === 0}
            >
              {orderBy === "selected_statuses"
                ? `Sorting by ${selectedStatuses.length} selected ${
                    selectedStatuses.length === 1 ? "status" : "statuses"
                  }`
                : `Sort by ${selectedStatuses.length} selected ${
                    selectedStatuses.length === 1 ? "status" : "statuses"
                  }`}
            </Button>
          </Box>
        </Menu>
      </Box>
    </Box>
  );
};

// Component for the data cell in the AdminProgramsTable
export const ApplicantCountsDataCell = ({
  program,
  counts,
  orderBy,
  order,
  onRequestSort,
  selectedStatuses,
  allUsers,
}) => {
  const programCounts = counts || {};

  const handleStatusClick = async (status, event) => {
    event.stopPropagation(); // Prevent sorting when copying
    
    if (!allUsers || !program) {
      alert('No users data available');
      return;
    }

    // Copy emails for the specific status
    const result = await copyEmailsByStatus(status, allUsers, program.id);
    
    if (result.success) {
      const count = status === 'total' 
        ? programCounts.total_active 
        : programCounts[status.toLowerCase()] || 0;
      
      alert(`Copied ${count} email${count !== 1 ? 's' : ''} to clipboard`);
    } else {
      // Show the specific error message
      alert(result.error || 'Failed to copy emails');
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "2px",
        width: "100%",
        position: "relative",
      }}
    >
      {/* If we're sorting by selected statuses, show a special total row at the top */}
      {orderBy === "selected_statuses" && selectedStatuses.length > 0 && (
        <Box
          sx={{
            gridColumn: "1 / span 4",
            bgcolor: "primary.light",
            color: "primary.contrastText",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 1,
            py: 0.5,
            borderRadius: "4px",
            mb: 0.5,
          }}
        >
          <Tooltip
            title={`Combined total of: ${selectedStatuses
              .map((status) => {
                if (status === "total_active") return "TOTAL";
                // Get the corresponding STATUS value by finding the key whose lowercase equals status
                const statusKey = Object.values(STATUS).find(
                  (key) => key.toLowerCase() === status
                );
                return statusKey || status.toUpperCase();
              })
              .join(", ")}`}
            arrow
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{
                maxWidth: "70%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedStatuses
                .map((status) => {
                  if (status === "total_active") return "Totl";

                  // Get the abbreviation
                  const statusKey = Object.values(STATUS).find(
                    (key) => key.toLowerCase() === status
                  );
                  if (!statusKey) return status;

                  const abbr =
                    ALL_STATUSES[statusKey]?.abbr || statusKey.substring(0, 3);
                  return (
                    abbr.charAt(0).toUpperCase() + abbr.slice(1).toLowerCase()
                  );
                })
                .join(", ")}
            </Typography>
          </Tooltip>
          <Typography variant="body2" fontWeight="bold">
            {selectedStatuses.reduce(
              (sum, status) => sum + (programCounts[status] || 0),
              0
            )}
          </Typography>
        </Box>
      )}

      {/* Display all status counts in grid cells */}
      {Object.entries(STATUS).map(([key, value]) => {
        const statusLower = value.toLowerCase();
        const count = programCounts[statusLower] || 0;
        const abbreviation = ALL_STATUSES[value]?.abbr || value.substring(0, 3);
        const isSelected = selectedStatuses.includes(statusLower);

        return (
          <Tooltip 
            key={key} 
            title={count > 0 
              ? `${value}: ${count} - Click to copy emails` 
              : `${value}: No applicants`}
            placement="top" 
            arrow
          >
            <Box
              sx={{
                py: 0.25,
                px: 0.5,
                fontSize: "0.7rem",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                bgcolor: isSelected
                  ? "rgba(25, 118, 210, 0.08)"
                  : "background.paper",
                borderRadius: "4px",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                cursor: count > 0 ? 'pointer' : 'default',
                opacity: count > 0 ? 1 : 0.6,
                width: "auto",
                "&:hover": {
                  bgcolor: isSelected
                    ? "rgba(25, 118, 210, 0.15)"
                    : "rgba(0, 0, 0, 0.04)",
                },
              }}
              onClick={(e) => {
                if (count > 0) {
                  handleStatusClick(value, e);
                }
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: count > 0 ? "bold" : "normal",
                  padding: 0,
                  margin: 0,
                }}
              >
                {abbreviation.charAt(0).toUpperCase() +
                  abbreviation.slice(1).toLowerCase()}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  ml: "8px",
                  bgcolor: count > 0 ? "primary.main" : "transparent",
                  color: count > 0 ? "white" : "text.secondary",
                  px: 0.3,
                  py: 0,
                  borderRadius: "8px",
                  display: "inline-flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: "16px",
                  width: count > 9 ? "20px" : "16px", // Slightly wider for double digits
                  height: "16px",
                  textAlign: "center",
                  lineHeight: 1,
                  fontWeight: count > 0 ? "bold" : "normal",
                }}
              >
                {count}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}

      {/* Add Total as the last chip */}
      <Tooltip
        title={`Total Active: ${programCounts.total_active || 0}${
          programCounts.total_active > 0 ? ' - Click to copy all emails' : ''
        }`}
        placement="top"
        arrow
      >
        <Box
          onClick={(e) => {
            if (programCounts.total_active > 0) {
              handleStatusClick('total', e);
            }
          }}
          sx={{
            py: 0.25,
            px: 0.5,
            fontSize: "0.7rem",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            bgcolor:
              orderBy === "total_active"
                ? "rgba(25, 118, 210, 0.08)"
                : "background.paper",
            borderRadius: "4px",
            border: "1px solid rgba(0, 0, 0, 0.12)",
            cursor: programCounts.total_active > 0 ? 'pointer' : 'default',
            width: "auto",
            "&:hover": {
              bgcolor:
                orderBy === "total_active"
                  ? "rgba(25, 118, 210, 0.15)"
                  : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              fontWeight: "bold",
              padding: 0,
              margin: 0,
            }}
          >
            Totl
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              ml: "8px",
              bgcolor: "secondary.main",
              color: "white",
              px: 0.3,
              py: 0,
              borderRadius: "8px",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              minWidth: "16px",
              width: (programCounts.total_active || 0) > 9 ? "20px" : "16px", // Slightly wider for double digits
              height: "16px",
              textAlign: "center",
              lineHeight: 1,
              fontWeight: "bold",
            }}
          >
            {programCounts.total_active || 0}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
};

// Main component that manages state and renders the appropriate cells
const ApplicantCountsCell = ({
  program,
  counts,
  orderBy,
  order,
  onRequestSort,
  selectedStatuses,
  setSelectedStatuses,
  allUsers,
  isHeaderCell = false,
}) => {
  // Use useEffect to track sorted status for parent component
  useEffect(() => {
    // Track selected statuses for parent component sorting
    if (orderBy === "selected_statuses" && selectedStatuses?.length === 0) {
      onRequestSort("total_active"); // Default to total if no statuses selected
    }
  }, [selectedStatuses, orderBy, onRequestSort]);

  if (isHeaderCell) {
    return (
      <ApplicantCountsHeaderCell
        orderBy={orderBy}
        order={order}
        onRequestSort={onRequestSort}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        allUsers={allUsers}
      />
    );
  } else {
    return (
      <ApplicantCountsDataCell
        program={program}
        counts={counts}
        orderBy={orderBy}
        order={order}
        onRequestSort={onRequestSort}
        selectedStatuses={selectedStatuses}
        allUsers={allUsers}
      />
    );
  }
};

export default ApplicantCountsCell;
