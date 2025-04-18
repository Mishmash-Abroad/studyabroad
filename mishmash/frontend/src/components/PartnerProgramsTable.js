import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Tooltip,
  Paper,
  Collapse,
  Chip,
  Menu,
  Checkbox,
  FormControlLabel,
  IconButton,
  Popover,
  Badge,
} from "@mui/material";
import axiosInstance from "../utils/axios";
import FacultyPicklist from "./FacultyPicklist";
import { STATUS } from "../utils/constants";
// Import the auth hook to get the logged-in user
import { useAuth } from "../context/AuthContext";
import ProgramForm from "./ProgramForm";
import PartnerProgramForm from "./PartnerProgramForm";

// -------------------- STYLES --------------------
const TableWrapper = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadii.large,
  boxShadow: theme.shadows.card,
  margin: "20px 0",
  maxHeight: "calc(100vh - 300px)",
  overflowY: "auto",
  overflowX: "hidden",
  width: "100%",
  "& .MuiTableContainer-root": {
    overflowX: "auto",
    "&::-webkit-scrollbar": {
      height: "8px",
      width: "8px",
    },
  },
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  paddingBottom: "16px",
  paddingTop: "16px",
}));

const FilterRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
}));

const StyledFacultyPicklist = styled(FacultyPicklist)(({ theme }) => ({
  flex: "1 1 auto",
  maxWidth: "600px",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  "&::-webkit-scrollbar": {
    height: "8px",
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.background.paper,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.divider,
    borderRadius: "4px",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: "pointer",
  transition: "transform 0.15s ease, background-color 0.2s ease",
  borderBottom: `2px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    boxShadow: theme.shadows[1],
    zIndex: 1,
  },
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

// -------------------- COMPONENT --------------------
const PartnerProgramsTable = () => {
  const { user } = useAuth(); // Get the logged-in user
  const [programs, setPrograms] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("application_deadline");
  const [order, setOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("current_future");
  const [editingProgram, setEditingProgram] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  // State for selected statuses (shared between component instances)
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  // NEW STATE: Toggle for showing only programs for which the logged-in faculty is a lead
  const [showMyPrograms, setShowMyPrograms] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const navigate = useNavigate();
  const { programTitle } = useParams();
  const location = useLocation();

  useEffect(() => {
    // Fetch programs when component mounts or filters change
    fetchPrograms();
  }, []);

  // Add debounced fetching for filter changes
  useEffect(() => {
    const timeoutId = setTimeout(fetchPrograms, 300);
    return () => clearTimeout(timeoutId);
  }, [timeFilter, selectedFaculty, searchQuery]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axiosInstance.get("/api/users/");
        setAllUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch users data:", err);
      }
    };

    fetchAllUsers();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      // Prepare request parameters
      const params = {};
      // Only include current/future programs if that's the selected filter
      if (timeFilter === "current_future") {
        params.exclude_ended = "true";
      }

      params.partner_ids = [user.id].map((f) => f.id).join(",");
      params.track_payment = "true";

      // Add search query if present
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await axiosInstance.get("/api/programs/", { params });
      setPrograms(response.data);
      setError(null);

      const counts = {};
      await Promise.all(
        response.data.map(async (program) => {
          try {
            const countResponse = await axiosInstance.get(
              `/api/programs/${program.id}/applicant_counts/`
            );
            counts[program.id] = countResponse.data;
          } catch (err) {
            console.error(
              `Error fetching applicant counts for program ${program.id}:`,
              err
            );
          }
        })
      );
      setApplicantCounts(counts);
    } catch (err) {
      setError("Failed to load programs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (programTitle && programTitle !== "new-program") {
      const decodedTitle = decodeURIComponent(programTitle);
      const selectedProgram = programs.find(
        (p) => p.title.replace(/\s+/g, "-") === decodedTitle
      );
      setEditingProgram(selectedProgram || null);
    } else {
      setEditingProgram(null);
    }
  }, [programTitle, programs]);

  // UPDATED: Add filtering for "Show Only My Programs" if toggle is active and user is faculty
  const getFilteredPrograms = () => {
    const today = new Date();
    let filtered = programs.filter((program) => {
      const startDate = new Date(program.start_date);
      const endDate = new Date(program.end_date);
      const applicationOpenDate = new Date(program.application_open_date);
      const applicationDeadline = new Date(program.application_deadline);
      switch (timeFilter) {
        case "current_future":
          return endDate >= today;
        case "past":
          return endDate < today;
        case "accepting_applications":
          return applicationOpenDate <= today && today <= applicationDeadline;
        case "in_review":
          return applicationDeadline <= today && today <= startDate;
        case "running_now":
          return startDate <= today && endDate >= today;
        case "all":
        default:
          return true;
      }
    });
    // If the toggle is enabled and the user is a faculty member,
    // only include programs where the user is listed as a faculty lead.
    if (showMyPrograms && user?.is_faculty) {
      filtered = filtered.filter((program) =>
        program.faculty_leads.some((faculty) => faculty.id === user.id)
      );
    }
    return filtered;
  };

  const filteredPrograms = getFilteredPrograms().filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.faculty_leads
        .map((faculty) => faculty.display_name)
        .join(", ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleRequestSort = (property) => {
    if (property === "selected_statuses" && selectedStatuses.length > 0) {
      const isAsc = orderBy === "selected_statuses" && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy("selected_statuses");
    } else {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    }
  };

  // List all possible status-related sort properties
  const allStatusKeys = Object.values(STATUS).map((status) =>
    status.toLowerCase()
  );

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    let aValue, bValue;
    // Regular column sorting
    aValue = a[orderBy] || "";
    bValue = b[orderBy] || "";
    if (typeof aValue === "string" && typeof bValue === "string") {
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }
    return order === "asc"
      ? aValue > bValue
        ? 1
        : -1
      : aValue < bValue
      ? 1
      : -1;
  });

  const handleEditProgram = (program) => {
    navigate(
      `/dashboard/partner-programs/${encodeURIComponent(
        program.title.replace(/\s+/g, "-")
      )}`
    );
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (programTitle) {
    return (
      <PartnerProgramForm
        onClose={() => navigate("/dashboard/partner-programs")}
        refreshPrograms={fetchPrograms}
        program={editingProgram}
      />
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  };

  return (
    <TableWrapper>
      <>
        <FilterContainer>
          <FilterRow>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                maxWidth: "500px",
              }}
            >
              <StyledFacultyPicklist onFacultyChange={setSelectedFaculty} />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
          </FilterRow>
          <FilterRow>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              sx={{ flex: "1 1 auto", minWidth: "300px" }}
              value={searchQuery}
              onChange={handleSearch}
            />
            <TextField
              select
              label="Filter by Time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ width: "200px", flexShrink: 0 }}
            >
              <MenuItem value="current_future">
                Current & Future Programs
              </MenuItem>
              <MenuItem value="past">Past Programs</MenuItem>
              <MenuItem value="accepting_applications">
                Accepting Applications
              </MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="running_now">Running Now</MenuItem>
              <MenuItem value="all">All Programs</MenuItem>
            </TextField>
            {/* NEW UI CONTROL: Show Only My Programs toggle for faculty users */}
            {user?.is_faculty && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showMyPrograms}
                    onChange={(e) => setShowMyPrograms(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Only My Programs"
              />
            )}
          </FilterRow>
        </FilterContainer>

        <StyledTableContainer>
          <Table stickyHeader size="small" padding="none">
            <StyledTableHead>
              <TableRow>
                {[
                  "title",
                  "year_semester",
                  "faculty_leads",
                  "application_open_date",
                  "application_deadline",
                  "essential_document_deadline",
                  "payment_deadline",
                  "start_date",
                  "end_date",
                  "Applied & Enrolled"
                ].map((column) => (
                  <StyledTableCell key={column}>
                    <TableSortLabel
                      active={orderBy === column}
                      direction={order}
                      onClick={() => handleRequestSort(column)}
                    >
                      {column
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </TableSortLabel>
                  </StyledTableCell>
                ))}
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {sortedPrograms.map((program) => {
                return (
                  <StyledTableRow
                    key={program.id}
                    onClick={() => handleEditProgram(program)}
                  >
                    <StyledTableCell>{program.title}</StyledTableCell>
                    <StyledTableCell>{program.year_semester}</StyledTableCell>
                    <StyledTableCell>
                      {program.faculty_leads
                        .map((faculty) => faculty.display_name)
                        .join(", ")}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDate(program.application_open_date)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDate(program.application_deadline)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDate(program.essential_document_deadline)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDate(program.payment_deadline)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDate(program.start_date)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatDate(program.end_date)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {applicantCounts[program.id]?.approved +
                        applicantCounts[program.id]?.enrolled || 0}
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </>
    </TableWrapper>
  );
};

export default PartnerProgramsTable;
