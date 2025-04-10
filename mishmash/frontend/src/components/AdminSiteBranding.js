import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";

import { Save as SaveIcon, Image as ImageIcon } from "@mui/icons-material";
import axiosInstance from "../utils/axios";

const BrandingContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  boxShadow: theme.customShadows.card,
}));

const ColorPreviewBox = styled(Box)(({ color }) => ({
  width: "100%",
  height: "40px",
  backgroundColor: color,
  borderRadius: "4px",
  marginTop: "8px",
  border: "1px solid rgba(0, 0, 0, 0.12)",
}));

const LogoPreview = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "120px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: theme.spacing(1),
  overflow: "hidden",
  "& img": {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
}));

const AdminSiteBranding = () => {
  const [branding, setBranding] = useState({
    site_name: "",
    primary_color: "#1976d2",
    welcome_message: "",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch current branding settings
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/branding/current/");
        setBranding({
          id: response.data.id,
          site_name: response.data.site_name,
          primary_color: response.data.primary_color,
          welcome_message: response.data.welcome_message || "",
        });
        if (response.data.logo_url) {
          setLogoPreview(response.data.logo_url);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching branding:", err);
        setError("Failed to load branding settings.");
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);



  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("site_name", branding.site_name);
      formData.append("primary_color", branding.primary_color);
      formData.append("welcome_message", branding.welcome_message);
      
      if (logo) {
        formData.append("logo", logo);
      }

      let response;
      if (branding.id) {
        // Update existing branding
        response = await axiosInstance.put(`/api/branding/${branding.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create new branding
        response = await axiosInstance.post("/api/branding/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setBranding({
        id: response.data.id,
        site_name: response.data.site_name,
        primary_color: response.data.primary_color,
        welcome_message: response.data.welcome_message,
      });
      
      if (response.data.logo_url) {
        setLogoPreview(response.data.logo_url);
      }
      
      setLogo(null);
      setSuccess(true);
      
      // Refresh the page to apply the new branding
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error saving branding:", err);
      setError("Failed to save branding settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrandingContainer>
      <Typography variant="h4" gutterBottom>
        Site Branding Settings
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Customize your site branding with a custom name, color, and logo.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Site Name"
              fullWidth
              required
              value={branding.site_name}
              onChange={(e) => setBranding({ ...branding, site_name: e.target.value })}
              disabled={saving}
              helperText="This will appear in the navigation bar and browser tab."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Primary Color"
              fullWidth
              value={branding.primary_color}
              onChange={(e) => {
                const value = e.target.value;
                // Basic validation here instead of relying on pattern
                setBranding({ ...branding, primary_color: value });
              }}
              disabled={saving}
              helperText="HEX color code (e.g., #1976d2)"
              // Remove pattern validation which can be inconsistent
            />
            <ColorPreviewBox color={branding.primary_color} />
            <Typography variant="caption" color="textSecondary">
              This color will be used for buttons, links, and highlights throughout the site.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Welcome Message"
              fullWidth
              multiline
              rows={3}
              value={branding.welcome_message}
              onChange={(e) => setBranding({ ...branding, welcome_message: e.target.value })}
              disabled={saving}
              helperText="This message will be displayed on the homepage."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Logo
            </Typography>
            <input
              type="file"
              accept="image/*"
              id="logo-upload"
              style={{ display: "none" }}
              onChange={handleLogoChange}
              disabled={saving}
            />
            <label htmlFor="logo-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImageIcon />}
                disabled={saving}
                fullWidth
              >
                {logo ? "Change Logo" : "Upload Logo"}
              </Button>
            </label>

            {logoPreview && (
              <LogoPreview>
                <img 
                  src={logoPreview} 
                  alt="Site Logo Preview" 
                  onError={(e) => {
                    console.log('Logo preview failed to load:', logoPreview);
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
              </LogoPreview>
            )}

            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
              Recommended format: PNG with transparent background. Maximum size: 2MB.
            </Typography>

            {logo && (
              <Typography variant="caption" display="block">
                Selected file: {logo.name} ({Math.round(logo.size / 1024)} KB)
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={saving}
            size="large"
          >
            {saving ? "Saving..." : "Save Branding Settings"}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Branding settings saved successfully! Refreshing page to apply changes...
        </Alert>
      </Snackbar>
    </BrandingContainer>
  );
};

export default AdminSiteBranding;
