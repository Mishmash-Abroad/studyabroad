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
} from "@mui/material";
import axiosInstance from "../utils/axios";
import ProgramForm from "./ProgramForm";
import FacultyPicklist from "./FacultyPicklist";

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
  transition: "transform 0.2s ease, background-color 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover
  },
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
  const [selectedFaculty, setSelectedFaculty] = useState([]); // Add this line
  const navigate = useNavigate();
  const { programTitle } = useParams();
  const location = useLocation();

  useEffect(() => {
    // Fetch programs when component mounts or filters change
    fetchPrograms();
  }, []);  // Empty dependency array to only fetch on mount
  
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

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    let aValue, bValue;
  
    if (["applied", "enrolled", "withdrawn", "canceled", "total_active"].includes(orderBy)) {
      aValue = applicantCounts[a.id]?.[orderBy] || 0;
      bValue = applicantCounts[b.id]?.[orderBy] || 0;
    } else {
      aValue = a[orderBy] || "";
      bValue = b[orderBy] || "";
    }
  
    return order === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });
    

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

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
    if (!dateString) return ""; // Handle empty values
    const [year, month, day] = dateString.split("-"); // Split "YYYY-MM-DD"
    return `${month}/${day}/${year}`; // Convert to MM/DD/YYYY
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
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {["title", "year_semester", "faculty_leads", "application_open_date", "application_deadline", "start_date", "end_date",
                  "applied", "enrolled", "withdrawn", "canceled", "total_active"].map((column) => (
                  <TableCell key={column}>
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
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPrograms.map((program) => (
                <StyledTableRow 
                  key={program.id} 
                  onClick={() => handleEditProgram(program)}
                  hover
                >
                  <TableCell>
                    {program.title}
                  </TableCell>
                  <TableCell>{program.year_semester}</TableCell>
                  <TableCell>{program.faculty_leads.map(faculty => faculty.display_name).join(", ")}</TableCell>
                  <TableCell>{formatDate(program.application_open_date)}</TableCell>
                  <TableCell>{formatDate(program.application_deadline)}</TableCell>
                  <TableCell>{formatDate(program.start_date)}</TableCell>
                  <TableCell>{formatDate(program.end_date)}</TableCell>
                  {["applied", "enrolled", "withdrawn", "canceled", "total_active"].map((key) => (
                    <TableCell key={key}>{applicantCounts[program.id]?.[key] || 0}</TableCell>
                  ))}
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
