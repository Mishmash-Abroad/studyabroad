import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import {
  Grid,
  Button,
  IconButton,
  Box,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementDetailModal from "./AnnouncementDetailModal";

const AnnouncementsBrowser = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get("/api/announcements/");
      const active = res.data.filter((a) => a.is_active);
      setAnnouncements(active);
    } catch (err) {
      console.error("Error fetching announcements", err);
    }
  };

  // Sort announcements based on pinned status first, then by chosen sort criteria
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    // First prioritize pinned announcements
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.pinned && b.pinned) return 0;

    // Then apply the selected sort criteria
    if (sortBy === "importance") {
      const importanceOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    }
    // Default sort: by recency
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const displayedAnnouncements = showAll
    ? sortedAnnouncements
    : sortedAnnouncements.slice(0, 4);

  const handleSortMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (newSortValue) => {
    setSortBy(newSortValue);
    handleSortMenuClose();
  };

  const handleNavigate = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          Announcements
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Sort announcements">
            <IconButton
              size="small"
              onClick={handleSortMenuOpen}
              color={open ? "primary" : "default"}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorEl} open={open} onClose={handleSortMenuClose}>
            <MenuItem
              onClick={() => handleSortChange("recent")}
              selected={sortBy === "recent"}
            >
              Most Recent
            </MenuItem>
            <MenuItem
              onClick={() => handleSortChange("importance")}
              selected={sortBy === "importance"}
            >
              By Importance
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {displayedAnnouncements.map((ann) => (
          <Grid item xs={12} sm={6} md={3} key={ann.id}>
            <AnnouncementCard
              announcement={ann}
              onClick={() => setSelectedAnnouncement(ann)}
            />
          </Grid>
        ))}
      </Grid>

      {announcements.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="textSecondary">
            No active announcements available.
          </Typography>
        </Box>
      )}

      {announcements.length > 4 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            onClick={() => setShowAll(!showAll)}
            size="small"
            variant="outlined"
          >
            {showAll ? "Show Less" : "View All"}
          </Button>
        </Box>
      )}

      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          allAnnouncements={sortedAnnouncements}
          onNavigate={handleNavigate}
        />
      )}
    </Box>
  );
};

export default AnnouncementsBrowser;
