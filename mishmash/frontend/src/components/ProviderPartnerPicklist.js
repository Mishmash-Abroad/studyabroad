/**
 * Study Abroad Program - Provider Partner Picklist Component
 * =============================================
 *
 * A reusable component for selecting Provider Partner members from a searchable picklist.
 * Features:
 * - Autocomplete with search functionality
 * - Multiple Provider Partner selection
 * - Selected Provider Partner displayed as chips
 * - Asynchronous Provider Partner data loading
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

const ProviderPartnerPicklist = ({
  onProviderPartnerChange,
  initialSelected = [],
  className,
  disable_picklist = false,
}) => {
  const [providerPartnerList, setProviderPartnerList] = useState([]);
  const [selectedProviderPartner, setSelectedProviderPartner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviderPartner = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/users/", {
          params: { is_provider_partner: true },
        });
        setProviderPartnerList(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching provider partners:", err);
        setError(
          "Failed to load provider partner list. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProviderPartner();
  }, []);

  useEffect(() => {
    if (providerPartnerList.length > 0 && initialSelected.length > 0) {
      const initialProviderPartner = providerPartnerList.filter(
        (providerPartner) => initialSelected.includes(providerPartner.id)
      );
      setSelectedProviderPartner(initialProviderPartner);
    }
  }, [providerPartnerList, initialSelected]);

  const handleProviderPartnerChange = (event, newValue) => {
    setSelectedProviderPartner(newValue);
    onProviderPartnerChange(newValue); // Notify parent component with full providerPartner objects
  };

  if (error) {
    return <div style={{ color: "red", padding: "10px" }}>{error}</div>;
  }

  return (
    <StyledAutocomplete
      multiple
      options={providerPartnerList}
      value={selectedProviderPartner}
      onChange={handleProviderPartnerChange}
      getOptionLabel={(option) => option.display_name}
      loading={loading}
      disabled={disable_picklist}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Provider Partners"
          placeholder={
            selectedProviderPartner.length === 0
              ? "Search provider partners..."
              : ""
          }
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
      sx={{
        width: "100%",
        alignSelf: "flex-start",
        margin: 0,
        justifyContent: "flex-start",
      }}
    />
  );
};

export default ProviderPartnerPicklist;
