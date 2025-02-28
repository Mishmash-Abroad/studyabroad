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
} from "@mui/material";
import axiosInstance from "../utils/axios";
import ProgramForm from "./ProgramForm";

// -------------------- STYLES --------------------
const TableWrapper = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadii.large,
  boxShadow: theme.shadows.card,
  margin: "20px 0",
  maxHeight: "calc(100vh - 300px)",
  overflow: "auto",
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "10px",
  paddingBottom: "10px",
  paddingTop: "10px",
  "& button": { minWidth: "150px" },
  "& .MuiTextField-root": { minWidth: "200px" },
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
  const navigate = useNavigate();
  const { programTitle } = useParams();
  const location = useLocation();

  useEffect(() => {
    fetchPrograms();
  }, [timeFilter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/programs/");
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

  const today = new Date();
  const filteredPrograms = programs
    .filter((p) => {
      if (!p || !p.start_date || !p.end_date || !p.application_deadline || !p.application_open_date) {
        return false;
      }

      const endDate = new Date(p.end_date);
      const startDate = new Date(p.start_date);
      const applicationDeadline = new Date(p.application_deadline);
      const applicationOpenDate = new Date(p.application_open_date);

      switch (timeFilter) {
        case "current_future":
          return today <= endDate;
        case "open_for_applications":
          return applicationOpenDate <= today && today <= applicationDeadline;
        case "in_review":
          return applicationDeadline <= today && today <= startDate;
        case "running_now":
          return startDate <= today && today <= endDate;
        case "all":
        default:
          return true;
      }
    })
    .filter((p) =>
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
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <TextField
            select
            label="Filter by Time"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            variant="outlined"
            size="small"
          >
            <MenuItem value="current_future">Current & Future</MenuItem>
            <MenuItem value="open_for_applications">Open for Applications</MenuItem>
            <MenuItem value="in_review">In Review</MenuItem>
            <MenuItem value="running_now">Running Now</MenuItem>
            <MenuItem value="all">All Programs</MenuItem>
          </TextField>
          <Button variant="contained" color="primary" onClick={handleNewProgram}>
            New Program
          </Button>
        </FilterContainer>

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
      </>
    </TableWrapper>
  );
};

export default AdminProgramsTable;
