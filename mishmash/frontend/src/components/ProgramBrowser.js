/**
 * Study Abroad Program - Program Browser Component
 * ============================================
 *
 * This component provides a searchable list of available study abroad programs.
 * It handles program data fetching, search functionality, and displays individual
 * program cards.
 *
 * Features:
 * - Real-time search with debouncing
 * - Loading and error states
 * - Empty state handling
 * - Responsive grid layout
 *
 * Used by:
 * - Dashboard component for program browsing
 * - Admin interface for program management
 */

import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axiosInstance from "../utils/axios";
import ProgramCard from "./ProgramCard";
import FacultyPicklist from "./FacultyPicklist";

// -------------------- STYLES --------------------
const PageContainer = styled("div")(({ theme }) => ({
  padding: "20px",
  backgroundColor: theme.palette.background.paper,
}));

const ContentContainer = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: "24px",
  borderRadius: theme.shape.borderRadii.large,
  boxShadow: theme.customShadows.card,
  marginBottom: "24px",
  elevation: 0,
}));

const SearchSection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "600px",
  margin: "0 auto 20px",
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  width: "100%",
  fontFamily: theme.typography.fontFamily,
  "& .MuiInputBase-input": {
    padding: "12px 48px 12px 48px",
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    border: `2px solid ${theme.palette.border.light}`,
    borderRadius: theme.shape.borderRadii.xl,
    transition: theme.transitions.quick,
    "&:focus": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}1a`,
    },
  },
}));

const FilterButton = styled("button")(({ theme, active }) => ({
  padding: "8px 16px",
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  color: active
    ? theme.palette.primary.contrastText
    : theme.palette.primary.main,
  border: `1px solid ${
    active ? theme.palette.primary.main : theme.palette.border.main
  }`,
  borderRadius: theme.shape.borderRadii.xl,
  cursor: "pointer",
  margin: "0 8px",
  transition: theme.transitions.quick,
  fontSize: theme.typography.button.fontSize,
  fontWeight: active
    ? theme.typography.button.fontWeight
    : theme.typography.body1.fontWeight,
  fontFamily: theme.typography.fontFamily,
  letterSpacing: theme.typography.button.letterSpacing,
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : theme.palette.background.card.hover,
  },
}));

const ProgramGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "24px",
  padding: "20px 0",
  maxWidth: "1200px",
  margin: "0 auto",
  "& .expanded-card": {
    gridColumn: "1 / -1", // Span all columns
  },
  "& .program-card": {},
}));

const NoResults = styled("div")(({ theme }) => ({
  textAlign: "center",
  padding: "40px",
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadii.large,
  margin: "20px 0",
  "& h3": {
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  "& p": {
    fontSize: theme.typography.body1.fontSize,
  },
}));

// -------------------- COMPONENT --------------------
const ProgramBrowser = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showPastPrograms, setShowPastPrograms] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState([]);

  const theme = useTheme(); // allows referencing theme in inline styles

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const params = {
          search: searchTerm,
          exclude_ended: "true", // Only show programs that haven't ended yet
        };

        // Only add faculty_ids if there are selected faculty
        if (selectedFaculty.length > 0) {
          params.faculty_ids = selectedFaculty.map((f) => f.id).join(",");
        }

        const response = await axiosInstance.get("/api/programs/", { params });

        // Also fetch application status for each program
        const programsWithStatus = await Promise.all(
          response.data.map(async (program) => {
            try {
              const statusResponse = await axiosInstance.get(
                `/api/programs/${program.id}/application_status/`
              );
              return {
                ...program,
                applicationStatus: statusResponse.data.status || null,
              };
            } catch (error) {
              // Handle the specific MultipleObjectsReturned error
              // If error is 401 (unauthorized) or 500 (server error), just return program without status
              if (
                error.response?.status === 401 ||
                error.response?.status === 500
              ) {
                // For error 500, we could have a special handling for MultipleObjectsReturned
                // but we'll just treat all 500s the same for simplicity
                return { ...program, applicationStatus: null };
              }
              // Only log errors that aren't the common ones we're handling
              console.error("Error fetching status:", error);
              return { ...program, applicationStatus: null };
            }
          })
        );

        setPrograms(programsWithStatus);
        setError(null);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setError("Failed to load programs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(fetchPrograms, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedFaculty]);

  const getFilteredPrograms = () => {
    const today = new Date();

    return programs.filter((program) => {
      const openDate = new Date(program.application_open_date);
      const deadline = new Date(program.application_deadline);

      // Hide past programs if showPastPrograms is false
      if (!showPastPrograms && today > deadline) {
        return false;
      }

      switch (filter) {
        case "open":
          return today >= openDate && today <= deadline;
        case "applied":
          return (
            program.applicationStatus &&
            ["applied", "withdrawn", "canceled"].includes(
              program.applicationStatus.toLowerCase()
            )
          );
        case "enrolled":
          return (
            program.applicationStatus &&
            program.applicationStatus.toLowerCase() === "enrolled"
          );
        case "all":
        default:
          return true;
      }
    });
  };

  return (
    <PageContainer>
      <ContentContainer>
        {/* Search and Filter Section */}
        <SearchSection>
          {/* Search Bar */}
          <SearchInput
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={
              <SearchIcon
                sx={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.palette.text.secondary,
                }}
              />
            }
          />
          <FacultyPicklist onFacultyChange={setSelectedFaculty} />
        </SearchSection>

        {/* Filter Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All Programs
          </FilterButton>
          <FilterButton
            active={filter === "open"}
            onClick={() => setFilter("open")}
          >
            Currently Open
          </FilterButton>
          <FilterButton
            active={filter === "applied"}
            onClick={() => setFilter("applied")}
          >
            Applied
          </FilterButton>
          <FilterButton
            active={filter === "enrolled"}
            onClick={() => setFilter("enrolled")}
          >
            Enrolled
          </FilterButton>
        </div>

        {/* Show Past Deadline Programs toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "12px",
          }}
        >
          <button
            onClick={() => setShowPastPrograms(!showPastPrograms)}
            style={{
              padding: "8px 16px",
              backgroundColor: showPastPrograms
                ? theme.palette.grey[100]
                : theme.palette.common.white,
              color: theme.palette.grey[700],
              border: `1px solid ${theme.palette.grey[300]}`,
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: `1px solid ${theme.palette.grey[700]}`,
                borderRadius: "3px",
                backgroundColor: showPastPrograms
                  ? theme.palette.grey[700]
                  : "transparent",
              }}
            />
            Show Closed Programs
          </button>
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading programs...
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: theme.palette.status.error.light,
            }}
          >
            {error}
          </div>
        ) : (
          <ProgramGrid>
            {getFilteredPrograms().length > 0 ? (
              getFilteredPrograms().map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  isInAppliedSection={filter === "applied"}
                  onExpand={(expanded) => {
                    // Force a re-render to handle grid layout changes
                    setPrograms((prev) => [...prev]);
                  }}
                />
              ))
            ) : (
              <NoResults style={{ gridColumn: "1 / -1" }}>
                <h3>No Programs Found</h3>
                <p>
                  {searchTerm
                    ? `No programs match your search "${searchTerm}". Try adjusting your search terms.`
                    : filter !== "all"
                    ? `No programs found with the current filter "${filter}". Try changing the filter.`
                    : "No programs available at this time."}
                </p>
              </NoResults>
            )}
          </ProgramGrid>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default ProgramBrowser;
