/**
 * Study Abroad Program - Faculty Picklist Component
 * =============================================
 *
 * A reusable component for selecting faculty members from a searchable picklist.
 * Features:
 * - Autocomplete with search functionality
 * - Multiple faculty selection
 * - Selected faculty displayed as chips
 * - Asynchronous faculty data loading
 * - Support for initial selection when editing
 */

import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Autocomplete, TextField, Chip } from "@mui/material";
import axiosInstance from "../utils/axios";

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  "& .MuiInputBase-root": {
    padding: "2px 8px",
    borderRadius: theme.shape.borderRadii,
    border: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}1a`,
    },
  },
  "& .MuiAutocomplete-tag": {
    margin: "2px",
  },
  "& .MuiFormLabel-root": {
    transform: "translate(0, -1.5px) scale(0.75)",
    transformOrigin: "top left",
    color: theme.palette.text.secondary,
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(0, -1.5px) scale(0.75)",
  },
}));

const FacultyPicklist = ({ onFacultyChange, initialSelected = [], className }) => {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/users/", {
          params: { is_faculty: true },
        });
        setFacultyList(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching faculty:", err);
        setError("Failed to load faculty list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  useEffect(() => {
    if (facultyList.length > 0 && initialSelected.length > 0) {
      const initialFaculty = facultyList.filter((faculty) =>
        initialSelected.includes(faculty.id)
      );
      setSelectedFaculty(initialFaculty);
    }
  }, [facultyList, initialSelected]);

  const handleFacultyChange = (event, newValue) => {
    setSelectedFaculty(newValue);
    onFacultyChange(newValue); // Notify parent component with full faculty objects
  };

  if (error) {
    return <div style={{ color: "red", padding: "10px" }}>{error}</div>;
  }

  return (
    <StyledAutocomplete
      multiple
      options={facultyList}
      value={selectedFaculty}
      onChange={handleFacultyChange}
      getOptionLabel={(option) => option.display_name}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Faculty Leads"
          placeholder={selectedFaculty.length === 0 ? "Search faculty..." : ""}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            ...params.InputProps,
            disableUnderline: true,
          }}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index }); // Extract `key`
          return (
            <Chip
              key={option.id} // Ensure `key` is explicitly passed
              label={option.display_name}
              {...tagProps} // Spread remaining props
              color="primary"
              variant="outlined"
            />
          );
        })
      }
      isOptionEqualToValue={(option, value) => option.id === value.id}
      className={className}
    />
  );
};

export default FacultyPicklist;
