/**
 * Study Abroad Program - My Programs Table Component
 * =============================================
 *
 * This component displays a table of all programs the student has applied to,
 * with sorting capabilities and links to application details.
 *
 * Features:
 * - Sortable columns for all fields
 * - Application status display
 * - Links to application details
 * - Re-apply functionality for withdrawn/canceled applications
 */

import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Collapse,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";

// -------------------- STYLES --------------------
const TableWrapper = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.customShadows.card,
  margin: "20px 0",
  maxHeight: "calc(100vh - 300px)",
  overflow: "auto",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.subtitle2.fontWeight,
  "&.MuiTableCell-head": {
    backgroundColor: theme.palette.grey[50],
    fontWeight: theme.typography.subtitle1.fontWeight,
  },
}));

const StatusCell = styled(TableCell)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "enrolled":
        return theme.palette.status.success;
      case "applied":
        return theme.palette.status.info;
      case "withdrawn":
      case "canceled":
        return theme.palette.status.error;
      default:
        return theme.palette.status.neutral;
    }
  };

  const statusColor = getStatusColor();

  return {
    "& .status-badge": {
      backgroundColor: statusColor.background,
      color: statusColor.main,
      padding: "4px 8px",
      borderRadius: theme.shape.borderRadius.small,
      display: "inline-block",
      fontSize: "0.875rem",
      fontWeight: theme.typography.subtitle2.fontWeight,
    },
  };
});

const ApplicationButton = styled("button")(({ theme, variant }) => {
  const getColors = () => {
    switch (variant) {
      case "success":
        return {
          bg: theme.palette.status.success.main,
          color: theme.palette.status.success.contrastText,
        };
      case "disabled":
        return {
          bg: theme.palette.status.neutral.light,
          color: theme.palette.status.neutral.contrastText,
        };
      default:
        return {
          bg: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        };
    }
  };

  const colors = getColors();

  return {
    padding: "8px 16px",
    borderRadius: theme.shape.borderRadius.small,
    backgroundColor: colors.bg,
    color: colors.color,
    border: "none",
    cursor: variant === "disabled" ? "not-allowed" : "pointer",
    transition: theme.transitions.quick,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.button.letterSpacing,
    "&:hover": {
      filter: variant !== "disabled" ? "brightness(0.9)" : "none",
    },
  };
});

const DetailRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  "& > td": {
    paddingBottom: 0,
    paddingTop: 0,
  },
}));

const LoadingMessage = styled("div")(({ theme }) => ({
  padding: "40px",
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const ErrorMessage = styled("div")(({ theme }) => ({
  padding: "40px",
  textAlign: "center",
  color: theme.palette.status.error.main,
}));

// -------------------- COMPONENT --------------------
const MyProgramsTable = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("application_deadline");
  const [order, setOrder] = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // First get all programs
        const programsResponse = await axiosInstance.get("/api/programs/");

        // Then get application status for each program
        const programsWithStatus = await Promise.all(
          programsResponse.data.map(async (program) => {
            try {
              const statusResponse = await axiosInstance.get(
                `/api/programs/${program.id}/application_status/`
              );
              return {
                id: program.id,
                program: program,
                status: statusResponse.data.status,
              };
            } catch (error) {
              console.error("Error fetching status:", error);
              return null;
            }
          })
        );

        // Filter out programs with no applications and null responses
        const relevantApplications = programsWithStatus.filter(
          (app) =>
            app !== null &&
            app.status &&
            ["enrolled", "applied", "withdrawn", "canceled"].includes(
              app.status.toLowerCase()
            )
        );

        setApplications(relevantApplications);
        setError(null);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load your applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Handle sort requests
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Check if a program is still open for applications
  const isProgramOpen = (program) => {
    const today = new Date();
    const deadline = new Date(program.application_deadline);
    const openDate = new Date(program.application_open_date);
    return today >= openDate && today <= deadline;
  };

  // Sorting function that handles different data types
  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => compareValues(b, a, orderBy)
      : (a, b) => compareValues(a, b, orderBy);
  };

  // Compare values based on their type
  const compareValues = (a, b, orderBy) => {
    let valueA, valueB;

    // Handle nested program properties
    if (
      orderBy === "title" ||
      orderBy === "year_semester" ||
      orderBy === "faculty_leads" ||
      orderBy === "application_deadline" ||
      orderBy === "start_date" ||
      orderBy === "end_date"
    ) {
      valueA = a.program[orderBy];
      valueB = b.program[orderBy];
    } else {
      valueA = a[orderBy];
      valueB = b[orderBy];
    }

    // Handle null/undefined values
    if (valueA === null || valueA === undefined) return 1;
    if (valueB === null || valueB === undefined) return -1;
    if (valueA === valueB) return 0;

    // Handle different data types
    if (orderBy === "year_semester") {
      // Split year and semester for proper comparison
      const [yearA, semA] = valueA.split(" ");
      const [yearB, semB] = valueB.split(" ");
      // Compare years first
      if (yearA !== yearB) return yearA - yearB;
      // If years are equal, compare semesters (Fall > Summer > Spring)
      const semOrder = { Spring: 1, Summer: 2, Fall: 3 };
      return semOrder[semA] - semOrder[semB];
    }

    if (orderBy === "status") {
      // Custom status order: Enrolled > Applied > Withdrawn > Canceled
      const statusOrder = {
        Enrolled: 4,
        Applied: 3,
        Withdrawn: 2,
        Canceled: 1,
      };
      return statusOrder[valueA] - statusOrder[valueB];
    }

    // Handle date fields
    if (
      orderBy === "application_deadline" ||
      orderBy === "start_date" ||
      orderBy === "end_date"
    ) {
      return new Date(valueA) - new Date(valueB);
    }

    // String comparison for text fields
    if (typeof valueA === "string" && typeof valueB === "string") {
      return valueA.localeCompare(valueB);
    }

    // Numeric comparison
    return valueA - valueB;
  };

  // Sort function
  const sortApplications = (applications) => {
    return applications.sort(getComparator(order, orderBy));
  };

  // Column definitions
  const columns = [
    { id: "title", label: "Program Title", sortable: true },
    { id: "year_semester", label: "Year & Semester", sortable: true },
    { id: "faculty_leads", label: "Faculty Lead(s)", sortable: true },
    {
      id: "application_deadline",
      label: "Application Deadline",
      sortable: true,
    },
    { id: "start_date", label: "Program Start", sortable: true },
    { id: "end_date", label: "Program End", sortable: true },
    { id: "status", label: "Application Status", sortable: true },
  ];

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRowClick = (applicationId) => {
    if (expandedRow === applicationId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(applicationId);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading your applications...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (applications.length === 0) {
    return (
      <LoadingMessage>
        You haven't applied to any programs yet. Browse available programs to
        get started!
      </LoadingMessage>
    );
  }

  return (
    <TableWrapper>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <StyledTableCell key={column.id}>
                {column.sortable ? (
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
        </TableHead>
        <TableBody>
          {sortApplications(applications).map((application) => (
            <React.Fragment key={application.id}>
              <TableRow
                hover
                onClick={() => handleRowClick(application.id)}
                style={{ cursor: "pointer" }}
              >
                <StyledTableCell>{application.program.title}</StyledTableCell>
                <StyledTableCell>
                  {application.program.year_semester}
                </StyledTableCell>
                <StyledTableCell>
                  {application.program.faculty_leads}
                </StyledTableCell>
                <StyledTableCell>
                  {formatDate(application.program.application_deadline)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatDate(application.program.start_date)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatDate(application.program.end_date)}
                </StyledTableCell>
                <StatusCell status={application.status}>
                  <span className="status-badge">{application.status}</span>
                </StatusCell>
              </TableRow>
              <DetailRow>
                <TableCell colSpan={7}>
                  <Collapse in={expandedRow === application.id}>
                    <Box sx={{ margin: 2 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <ApplicationButton
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/apply/${application.program.id}`);
                          }}
                        >
                          View Application Details
                        </ApplicationButton>
                        {["withdrawn", "canceled"].includes(
                          application.status.toLowerCase()
                        ) &&
                          isProgramOpen(application.program) && (
                            <ApplicationButton
                              variant="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/apply/${application.program.id}`);
                              }}
                            >
                              Re-apply Now
                            </ApplicationButton>
                          )}
                      </div>
                    </Box>
                  </Collapse>
                </TableCell>
              </DetailRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

export default MyProgramsTable;
