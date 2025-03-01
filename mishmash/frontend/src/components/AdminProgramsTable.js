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
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from "../utils/axios";
import ProgramForm from "./ProgramForm";
import FacultyPicklist from "./FacultyPicklist";
import { STATUS, ALL_STATUSES } from "../utils/constants";
import ApplicantCountsCell from "./ApplicantCountsCell";

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
    transform: "scale(1.01)",
    boxShadow: theme.shadows[1],
    zIndex: 1,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '4px 8px', // Even more reduced padding for all cells
  fontSize: '0.875rem', // Slightly smaller font for all cells
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

// -------------------- COMPONENT --------------------
const AdminProgramsTable = () => {
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

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      
      // Prepare request parameters
      const params = {};
      
      // Only include current/future programs if that's the selected filter
      if (timeFilter === "current_future") {
        params.exclude_ended = "true";
      }
      
      // Add faculty filtering if faculty are selected
      if (selectedFaculty.length > 0) {
        params.faculty_ids = selectedFaculty.map(f => f.id).join(',');
      }
      
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
            const countResponse = await axiosInstance.get(`/api/programs/${program.id}/applicant_counts/`);
            counts[program.id] = countResponse.data;
          } catch (err) {
            console.error(`Error fetching applicant counts for program ${program.id}:`, err);
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
  
      const selectedProgram = programs.find((p) =>
        p.title.replace(/\s+/g, "-") === decodedTitle
      );
  
      setEditingProgram(selectedProgram || null);
    } else {
      setEditingProgram(null);
    }
  }, [programTitle, programs]);

  const getFilteredPrograms = () => {
    const today = new Date();
    
    return programs.filter((program) => {
      const startDate = new Date(program.start_date);
      const endDate = new Date(program.end_date);
      const applicationDeadline = new Date(program.application_deadline);
      
      switch (timeFilter) {
        case "current_future":
          return endDate >= today;
        case "past":
          return endDate < today;
        case "accepting_applications":
          return applicationDeadline >= today;
        case "running_now":
          return startDate <= today && endDate >= today;
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredPrograms = getFilteredPrograms().filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.faculty_leads.map(faculty => faculty.display_name).join(", ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestSort = (property) => {
    if (property === "selected_statuses" && 
        selectedStatuses.length > 0) {
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
  const allStatusKeys = Object.values(STATUS).map(status => status.toLowerCase());
  
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    let aValue, bValue;
  
    if (allStatusKeys.includes(orderBy)) {
      // Single status sorting
      aValue = applicantCounts[a.id]?.[orderBy] || 0;
      bValue = applicantCounts[b.id]?.[orderBy] || 0;
    } else if (orderBy === "total_active") {
      // Default total sorting
      aValue = applicantCounts[a.id]?.[orderBy] || 0;
      bValue = applicantCounts[b.id]?.[orderBy] || 0;
    } else if (orderBy === "selected_statuses" && selectedStatuses.length > 0) {
      // Combined multi-status sorting
      aValue = selectedStatuses.reduce((sum, status) => {
        // Add the count for this status to the sum
        return sum + (applicantCounts[a.id]?.[status] || 0);
      }, 0);
      
      bValue = selectedStatuses.reduce((sum, status) => {
        // Add the count for this status to the sum
        return sum + (applicantCounts[b.id]?.[status] || 0);
      }, 0);
    } else {
      // Regular column sorting
      aValue = a[orderBy] || "";
      bValue = b[orderBy] || "";
      
      // For string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
    }
    
    // For numeric comparisons
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === "asc" 
        ? aValue - bValue 
        : bValue - aValue;
    }
  
    // Fallback for mixed types
    return order === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  const handleEditProgram = (program) => {
    navigate(`/dashboard/admin-programs/${encodeURIComponent(program.title.replace(/\s+/g, "-"))}`);
  };

  const handleNewProgram = () => {
    navigate("/dashboard/admin-programs/new-program");
  };

  const isCreatingNewProgram = location.pathname.endsWith("/new-program");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (programTitle || isCreatingNewProgram) {
    return (
      <ProgramForm
        onClose={() => navigate("/dashboard/admin-programs")}
        refreshPrograms={fetchPrograms}
        editingProgram={isCreatingNewProgram ? null : editingProgram}
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
            <Box sx={{ display: "flex", flexDirection: "column", flex: "1 1 auto", maxWidth: "500px" }}>
              <StyledFacultyPicklist
                onFacultyChange={setSelectedFaculty}
              />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" color="primary" onClick={handleNewProgram}>
              New Program
            </Button>
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
              <MenuItem value="current_future">Current & Future Programs</MenuItem>
              <MenuItem value="past">Past Programs</MenuItem>
              <MenuItem value="accepting_applications">Accepting Applications</MenuItem>
              <MenuItem value="running_now">Running Now</MenuItem>
              <MenuItem value="all">All Programs</MenuItem>
            </TextField>
          </FilterRow>
        </FilterContainer>

        <StyledTableContainer>
          <Table stickyHeader size="small" padding="none">
            <StyledTableHead>
              <TableRow>
                {["title", "year_semester", "faculty_leads", "application_open_date", "application_deadline", "start_date", "end_date"].map((column) => (
                  <StyledTableCell key={column}>
                    <TableSortLabel
                      active={orderBy === column}
                      direction={order}
                      onClick={() => handleRequestSort(column)}
                    >
                      {column
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())
                      }
                    </TableSortLabel>
                  </StyledTableCell>
                ))}
                
                {/* Applicant Counts Column Header */}
                <StyledTableCell 
                  sx={{ 
                    textAlign: 'center', 
                    borderLeft: '1px solid rgba(224, 224, 224, 1)',
                    width: '240px', // Fixed width for the counts column
                  }}
                >
                  {/* Use ApplicantCountsCell for the header */}
                  <ApplicantCountsCell
                    orderBy={orderBy} 
                    order={order}
                    onRequestSort={handleRequestSort}
                    selectedStatuses={selectedStatuses}
                    setSelectedStatuses={setSelectedStatuses}
                    isHeaderCell={true}
                  />
                </StyledTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {sortedPrograms.map((program) => (
                <StyledTableRow 
                  key={program.id} 
                  onClick={() => handleEditProgram(program)}
                  hover
                >
                  <StyledTableCell>
                    {program.title}
                  </StyledTableCell>
                  <StyledTableCell>{program.year_semester}</StyledTableCell>
                  <StyledTableCell>{program.faculty_leads.map(faculty => faculty.display_name).join(", ")}</StyledTableCell>
                  <StyledTableCell>{formatDate(program.application_open_date)}</StyledTableCell>
                  <StyledTableCell>{formatDate(program.application_deadline)}</StyledTableCell>
                  <StyledTableCell>{formatDate(program.start_date)}</StyledTableCell>
                  <StyledTableCell>{formatDate(program.end_date)}</StyledTableCell>
                  
                  {/* Use ApplicantCountsCell for the data cell */}
                  <StyledTableCell sx={{ 
                    borderLeft: '1px solid rgba(224, 224, 224, 1)',
                    p: 0.5
                  }}>
                    <ApplicantCountsCell
                      program={program} 
                      counts={applicantCounts[program.id] || {}}
                      orderBy={orderBy}
                      order={order}
                      onRequestSort={handleRequestSort}
                      selectedStatuses={selectedStatuses}
                    />
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </>
    </TableWrapper>
  );
};

export default AdminProgramsTable;
