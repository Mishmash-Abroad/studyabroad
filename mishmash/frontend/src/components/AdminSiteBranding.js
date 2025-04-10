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
  IconButton,
  Divider,
  Tooltip,
  Stack,
} from "@mui/material";
import { HexColorPicker } from "react-colorful";
import { Save as SaveIcon, Image as ImageIcon, ColorLens, CloudUpload, Delete as DeleteIcon, Check as CheckIcon } from "@mui/icons-material";
import axiosInstance from "../utils/axios";

const BrandingContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  boxShadow: theme.customShadows.card,
  display: "flex",
  flexDirection: "column",
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ColorField = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
}));

const ColorSwatch = styled(Box)(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  height: 40,
  borderRadius: theme.shape.borderRadius,
  cursor: "pointer",
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.2s ease",
  overflow: "hidden",
  "&:hover": {
    boxShadow: theme.shadows[1],
    opacity: 0.95,
  },
}));

const ColorBox = styled(Box)(({ color }) => ({
  backgroundColor: color || "#ffffff",
  height: "100%",
  width: "100%",
  flexGrow: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: getContrastText(color),
  padding: "0 12px",
}));

// Helper function to determine whether to use white or black text on a color background
function getContrastText(hexColor) {
  if (!hexColor || hexColor.length < 7) return '#000000';
  
  // Extract RGB
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  
  // Calculate luminance - standard formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

const LogoPreview = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "140px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  backgroundColor: theme.palette.grey[50],
  transition: "all 0.2s ease",
  position: "relative",
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
    boxShadow: theme.shadows[1],
  },
  "& img": {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
}));

const UploadOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
  opacity: 0,
  transition: "opacity 0.2s ease",
  color: "white",
  "&:hover": {
    opacity: 1,
  },
}));

const ColorPickerContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  zIndex: 1000,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  width: 240,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(2),
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = React.useRef(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/branding/current/");
        setBranding({
          id: response.data.id,
          site_name: response.data.site_name,
          primary_color: response.data.primary_color || "#1976d2",
          welcome_message: response.data.welcome_message || "",
        });
        if (response.data.logo_url) {
          setLogoPreview(response.data.logo_url);
        }
        
        // Set the page title when first loading the branding
        if (response.data.site_name) {
          document.title = response.data.site_name;
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching branding:", err);
        setError("Failed to load branding settings.");
        setLoading(false);
      }
    };

    fetchBranding();

    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
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
        response = await axiosInstance.put(`/api/branding/${branding.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
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
      
      // Update the page title to match the site name
      const newTitle = response.data.site_name || "Study Abroad";
      document.title = newTitle;
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error saving branding:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to save branding settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
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
      <HeaderSection>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%', 
              bgcolor: branding.primary_color || '#1976d2',
              mr: 1.5,
              display: 'inline-block' 
            }} 
          />
          Site Branding Settings
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 4.5 }}>
          Customize how your site appears to users across the platform
        </Typography>
      </HeaderSection>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormSection>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                General Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <ColorField>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Site Name
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      value={branding.site_name}
                      onChange={(e) => setBranding({ ...branding, site_name: e.target.value })}
                      disabled={saving}
                      size="small"
                      placeholder="Enter site name"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Displayed in the navigation bar and browser tab
                    </Typography>
                  </ColorField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <ColorField>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Primary Color
                    </Typography>
                    
                    <Box sx={{ position: "relative" }}>
                      <ColorSwatch onClick={toggleColorPicker}>
                        <ColorBox color={branding.primary_color}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {branding.primary_color}
                          </Typography>
                        </ColorBox>
                        <IconButton size="small" sx={{ mr: 0.5 }}>
                            <ColorLens fontSize="small" />
                          </IconButton>
                      </ColorSwatch>
                      
                      {showColorPicker && (
                        <ColorPickerContainer ref={colorPickerRef}>
                          <HexColorPicker
                            color={branding.primary_color}
                            onChange={(color) => setBranding({ ...branding, primary_color: color })}
                          />
                          <TextField
                            size="small"
                            label="Hex Code"
                            value={branding.primary_color}
                            onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                            InputProps={{
                              startAdornment: <Box 
                                sx={{ 
                                  width: 16, 
                                  height: 16, 
                                  borderRadius: '2px', 
                                  backgroundColor: branding.primary_color || '#1976d2',
                                  mr: 1,
                                  border: '1px solid rgba(0,0,0,0.1)'
                                }} 
                              />
                            }}
                          />
                        </ColorPickerContainer>
                      )}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Used for buttons, links, and highlights throughout the site
                    </Typography>
                  </ColorField>
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
                    size="small"
                  />
                </Grid>
              </Grid>
            </FormSection>

            <Divider />
            
            <FormSection>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ImageIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> Site Logo
              </Typography>
              
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  id="logo-upload"
                  style={{ display: "none" }}
                  onChange={handleLogoChange}
                  disabled={saving}
                />
                
                {logoPreview ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                      <label htmlFor="logo-upload" style={{ cursor: 'pointer', display: 'block', width: '100%' }}>
                          <LogoPreview>
                            <img 
                              src={logoPreview} 
                              alt="Logo Preview" 
                              onError={(e) => {
                                console.log('Logo preview failed to load');
                                e.target.onerror = null;
                              }}
                            />
                            <UploadOverlay>
                              <CloudUpload fontSize="large" />
                              <Typography variant="body2" sx={{ mt: 1, color: 'white' }}>
                                Click to change
                              </Typography>
                            </UploadOverlay>
                          </LogoPreview>
                        </label>
                      
                      <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {setLogo(null); setLogoPreview("");}}
                          disabled={saving}
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            boxShadow: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.95)',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="success.main">
                        Logo uploaded successfully
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <LogoPreview>
                        <label htmlFor="logo-upload" style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="textSecondary" align="center">
                            Click to upload a logo
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            Or drag and drop an image file here
                          </Typography>
                        </label>
                      </LogoPreview>
                  </Box>
                )}
                
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                  Recommended: PNG with transparent background (max 2MB)
                </Typography>
              </Box>
            </FormSection>
            
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Branding Settings"}
              </Button>
            </Box>
          </Stack>
        </form>
      )}

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
