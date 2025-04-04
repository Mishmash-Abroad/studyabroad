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
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import DocumentStatusDisplay from "./DocumentStatusDisplay";
import DeadlineIndicator from "./DeadlineIndicator";
import {
  STATUS,
  ALL_STATUSES,
  READ_ONLY_APPLICATION_STATUSES,
  EDITABLE_APPLICATION_STATUSES,
} from "../utils/constants";

// Helper: get colors from theme based on status severity
const getStatusColors = (theme, severity) => {
  const statusObj = theme.palette.status[severity];
  if (statusObj) {
    return {
      bg: statusObj.background,
      color: statusObj.main,
    };
  }
  const neutral = theme.palette.status.neutral;
  return { bg: neutral.background, color: neutral.main };
};

// Styled Components
const TableWrapper = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadii.large,
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

// Now using the centralized getStatusColors helper rather than a switch.
const StatusCell = styled(TableCell)(({ theme, status }) => {
  const severity = (status && ALL_STATUSES[status]?.severity) || "neutral";
  const colors = getStatusColors(theme, severity);
  return {
    "& .status-badge": {
      backgroundColor: colors.bg,
      color: colors.color,
      padding: "4px 8px",
      borderRadius: theme.shape.borderRadii.small,
      display: "inline-block",
      fontSize: theme.typography.caption.fontSize,
      fontWeight: theme.typography.subtitle2.fontWeight,
    },
  };
});

// Use similar ApplicationButton styling as in ProgramCard
const ApplicationButton = styled("button")(({ theme, variant }) => {
  const getColors = () => {
    if (variant === "success") {
      return {
        bg: theme.palette.status.success.main,
        color: theme.palette.status.success.contrastText,
      };
    } else if (variant === "disabled") {
      return {
        bg: theme.palette.status.neutral.light,
        color: theme.palette.status.neutral.contrastText,
      };
    } else {
      return {
        bg: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      };
    }
  };
  const colors = getColors();
  return {
    padding: "8px 16px",
    borderRadius: theme.shape.borderRadii.small,
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

const DetailBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadii.medium,
  boxShadow: theme.customShadows.z1,
}));

const DeadlineBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
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

// Helper: Format a date string into a readable format.
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// Helper: Check if a program is still open based on its application window.
const isProgramOpen = (program) => {
  const today = new Date();
  const openDate = new Date(program.application_open_date);
  const deadline = new Date(program.application_deadline);
  return today >= openDate && today <= deadline;
};

// Helper: Sort applications by a given property.
const getComparator = (order, orderBy, theme) => {
  return order === "desc"
    ? (a, b) => compareValues(b, a, orderBy, theme)
    : (a, b) => compareValues(a, b, orderBy, theme);
};

// Compare helper: supports nested properties (e.g., inside program) and dates.
const compareValues = (a, b, orderBy) => {
  let valueA, valueB;
  if (
    [
      "title",
      "year_semester",
      "application_deadline",
      "start_date",
      "end_date",
    ].includes(orderBy)
  ) {
    valueA = a.program[orderBy];
    valueB = b.program[orderBy];
  } else if (orderBy === "faculty_leads") {
    valueA = a.program.faculty_leads.map((f) => f.display_name).join(", ");
    valueB = b.program.faculty_leads.map((f) => f.display_name).join(", ");
  } else if (orderBy === "documents") {
    valueA = a.documents?.length || 0;
    valueB = b.documents?.length || 0;
  } else if (orderBy === "status") {
    // Use a custom order defined by your constants if needed.
    const orderMapping = {
      [STATUS.ENROLLED]: 4,
      [STATUS.APPLIED]: 3,
      [STATUS.WITHDRAWN]: 2,
      [STATUS.CANCELED]: 1,
    };
    valueA = orderMapping[a.status] || 0;
    valueB = orderMapping[b.status] || 0;
  } else {
    valueA = a[orderBy];
    valueB = b[orderBy];
  }
  if (valueA === null || valueA === undefined) return 1;
  if (valueB === null || valueB === undefined) return -1;
  if (valueA === valueB) return 0;
  // Date fields
  if (["application_deadline", "start_date", "end_date"].includes(orderBy)) {
    return new Date(valueA) - new Date(valueB);
  }
  // String comparison
  if (typeof valueA === "string" && typeof valueB === "string") {
    return valueA.localeCompare(valueB);
  }
  return valueA - valueB;
};

// Main Component
const MyProgramsTable = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("application_deadline");
  const [order, setOrder] = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch applications for the current user.
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Include both current and past programs
        const programsResponse = await axiosInstance.get("/api/programs/", {
          params: { exclude_ended: "false" },
        });
        const programsWithStatus = await Promise.all(
          programsResponse.data.map(async (program) => {
            try {
              const statusResponse = await axiosInstance.get(
                `/api/programs/${program.id}/application_status/`
              );
              let documents = [];
              if (statusResponse.data.application_id) {
                const documentsResponse = await axiosInstance.get(
                  `/api/documents/?application=${statusResponse.data.application_id}`
                );
                documents = documentsResponse.data;
              }
              return {
                id: program.id,
                program,
                application_id: statusResponse.data.application_id,
                status: statusResponse.data.status,
                documents,
              };
            } catch (error) {
              console.error("Error fetching status:", error);
              return null;
            }
          })
        );

        // Instead of hardcoding status strings, use the union of editable and read-only statuses.
        const validStatuses = [
          ...EDITABLE_APPLICATION_STATUSES,
          ...READ_ONLY_APPLICATION_STATUSES,
        ].map((s) => s.toLowerCase());
        const relevantApplications = programsWithStatus.filter(
          (app) =>
            app &&
            app.status &&
            validStatuses.includes(app.status.toLowerCase())
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
  }, [user.id]);

  // Sorting handler.
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Row expansion handler.
  const handleRowClick = (appId) => {
    setExpandedRow(expandedRow === appId ? null : appId);
  };

  // Expanded row renders additional details.
  const renderExpandedRow = (app) => (
    <DetailRow>
      <TableCell colSpan={8}>
        <Collapse in={expandedRow === app.id}>
          <DetailBox>
            <DeadlineBox>
              <DeadlineIndicator
                deadline={app.program.application_deadline}
                type="application"
                expanded
                size="small"
              />
              <DeadlineIndicator
                deadline={app.program.essential_document_deadline}
                type="document"
                expanded
                size="small"
              />
            </DeadlineBox>
            <Box sx={{ margin: 2 }}>
              <Box sx={{ marginBottom: 2 }}>
                <DocumentStatusDisplay
                  documents={app.documents || []}
                  application_id={app.application_id}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "16px",
                  borderTop: "1px solid rgba(224, 224, 224, 1)",
                  paddingTop: "16px",
                }}
              >
                <ApplicationButton
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/apply/${app.program.id}`);
                  }}
                >
                  View Application Details
                </ApplicationButton>
                {/* Only show Re-apply button for withdrawn applications, not canceled ones */}
                {app.status.toLowerCase() === "withdrawn" &&
                  isProgramOpen(app.program) && (
                    <ApplicationButton
                      variant="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/apply/${app.program.id}`);
                      }}
                    >
                      Re-apply Now
                    </ApplicationButton>
                  )}
              </Box>
            </Box>
          </DetailBox>
        </Collapse>
      </TableCell>
    </DetailRow>
  );

  // Sort applications using our comparator
  const sortedApplications = applications.sort(getComparator(order, orderBy));

  // Column definitions remain similar.
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
    { id: "documents", label: "Documents", sortable: true },
    { id: "payment_status", label: "Payment Status", sortable: true },
  ];

  if (loading)
    return <LoadingMessage>Loading your applications...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (applications.length === 0)
    return (
      <LoadingMessage>
        You haven't applied to any programs yet. Browse available programs to
        get started!
      </LoadingMessage>
    );

  return (
    <TableWrapper>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <StyledTableCell key={col.id}>
                {col.sortable ? (
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : "asc"}
                    onClick={() => handleRequestSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedApplications.map((app) => (
            <React.Fragment key={app.id}>
              <TableRow
                hover
                onClick={() => handleRowClick(app.id)}
                style={{ cursor: "pointer" }}
              >
                <StyledTableCell>{app.program.title}</StyledTableCell>
                <StyledTableCell>{app.program.year_semester}</StyledTableCell>
                <StyledTableCell>
                  {app.program.faculty_leads
                    .map((f) => f.display_name)
                    .join(", ")}
                </StyledTableCell>
                <StyledTableCell>
                  {formatDate(app.program.application_deadline)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatDate(app.program.start_date)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatDate(app.program.end_date)}
                </StyledTableCell>
                <StatusCell status={app.status}>
                  <span className="status-badge">{app.status}</span>
                </StatusCell>
                <StyledTableCell>
                  <span className="status-badge">
                    {app.documents?.length || 0}/4 Documents
                  </span>
                </StyledTableCell>
                <StyledTableCell>
                  {app.program.payment_status
                    ? app.program.payment_status
                    : "N/A"}
                </StyledTableCell>
              </TableRow>
              {renderExpandedRow(app)}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

export default MyProgramsTable;
