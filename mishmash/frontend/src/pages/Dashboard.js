import React, { useState, useRef, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { styled } from "@mui/material/styles";
import TopNavBar from "../components/TopNavBar";
import AdminProgramsTable from "../components/AdminProgramsTable";
import ProgramBrowser from "../components/ProgramBrowser";
import PartnerProgramsTable from "../components/PartnerProgramsTable";
import MyProgramsTable from "../components/MyProgramsTable";
import AnnouncementsManager from "../components/AnnouncementsManager";
import AnnouncementsBrowser from "../components/AnnouncementsBrowser";
import UserManagement from "../components/UserManagement";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import PartnerProgramForm from "../components/PartnerProgramForm";
import AdminSiteBranding from "../components/AdminSiteBranding";

// -------------------- ROUTE CONFIGURATIONS --------------------
const ADMIN_ROUTES = [
  { path: "admin-overview", label: "Overview" },
  { path: "admin-programs", label: "Program Management" },
  { path: "browse", label: "Browse Programs" },
  { path: "user-management", label: "User Management" },
  { path: "site-branding", label: "Site Branding" },
];

const STUDENT_ROUTES = [
  { path: "overview", label: "Overview" },
  { path: "browse", label: "Browse Programs" },
  { path: "my-programs", label: "My Programs" },
];

const PARTNER_ROUTES = [
  { path: "partner-overview", label: "Overview" },
  { path: "partner-programs", label: "Program Management" },
];

// -------------------- STYLES --------------------
const DashboardContainer = styled("div")(({ theme }) => ({
  paddingTop: "72px",
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  overflowY: "auto",
}));

const DashboardContent = styled("div")(({ theme }) => ({
  maxWidth: "1800px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.customShadows.card,
  borderRadius: theme.shape.borderRadii.large,
  minHeight: "500px",
}));

const DashboardHeader = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
});

const DashboardTitle = styled("h1")(({ theme }) => ({
  margin: 0,
  color: theme.palette.primary.main,
  fontSize: theme.typography.h3.fontSize,
  fontWeight: theme.typography.h3.fontWeight,
  fontFamily: theme.typography.fontFamily,
}));

const TabContainer = styled("div")(({ theme }) => ({
  marginBottom: "20px",
  borderBottom: `1px solid ${theme.palette.border.light}`,
}));

const TabButton = styled("button")(({ theme, active }) => ({
  padding: "10px 20px",
  cursor: "pointer",
  backgroundColor: active
    ? theme.palette.background.paper
    : theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  borderBottom: active ? "none" : `1px solid ${theme.palette.border.light}`,
  borderRadius: `${theme.shape.borderRadii.small}px ${theme.shape.borderRadii.small}px 0 0`,
  marginRight: "5px",
  position: "relative",
  top: "1px",
  fontWeight: active ? theme.typography.button.fontWeight : "normal",
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.button.fontSize,
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  transition: theme.transitions.quick,
  "&:hover": {
    backgroundColor: active
      ? theme.palette.background.paper
      : theme.palette.background.card.hover,
  },
}));

const TabContent = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  minHeight: "400px",
  overflowY: "auto",
}));

const WelcomeSection = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const AnnouncementsSection = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

// -------------------- COMPONENTS --------------------
const AdminOverview = () => {
  const { user } = useAuth();

  return (
    <>
      <WelcomeSection>
        <Typography variant="h6" gutterBottom>
          Welcome to the Admin Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage announcements, programs, and users from this central location.
        </Typography>
      </WelcomeSection>
      <AnnouncementsSection>
        {user?.is_admin ? <AnnouncementsManager /> : <AnnouncementsBrowser />}
      </AnnouncementsSection>
    </>
  );
};

const StudentOverview = () => (
  <>
    <WelcomeSection>
      <Typography variant="h6" gutterBottom>
        Welcome to Your Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Stay updated with the latest announcements and manage your program
        applications.
      </Typography>
    </WelcomeSection>
    <AnnouncementsSection>
      <AnnouncementsBrowser />
    </AnnouncementsSection>
  </>
);

const ProviderPartnerOverview = () => (
  <>
    <WelcomeSection>
      <Typography variant="h6" gutterBottom>
        Welcome to Your Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Manage student application payment statuses.
      </Typography>
    </WelcomeSection>
  </>
);

// a function to return the options based on the user roles
// if user is admin, faculty or reviewer then return admin option
// if partner return partner option
// otherwise return student option
const return_based_on_roles = (
  user,
  admin_option,
  partner_option,
  student_option
) => {
  if (user?.is_provider_partner) {
    return partner_option;
  }

  if (user?.is_admin || user?.is_faculty || user?.is_reviewer) {
    return admin_option;
  }

  return student_option;
};

// -------------------- MAIN COMPONENT --------------------
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // logic for choosing the right routes
  // if admin, faculty, reviewer = admin routes
  // if provider partner = partner routes
  // student routes other wise
  const [ulinkDialogOpen, setUlinkDialogOpen] = useState(false);
  const routes = return_based_on_roles(
    user,
    ADMIN_ROUTES,
    PARTNER_ROUTES,
    STUDENT_ROUTES
  );

  const refreshPrerequisites = async () => {
    try {
      await axiosInstance.post(`/api/users/${user.id}/refresh_transcript/`);
    } catch (err) {
      console.error("Failed to connect user to a Ulink account.");
    }
  };

  // Handle default route
  useEffect(() => {
    // Only adjust the route if user is available
    if (user && location.pathname === "/dashboard") {
      const defaultPath = `/dashboard/${return_based_on_roles(
        user,
        "admin-overview",
        "partner-overview",
        "overview"
      )}`;
      // Replace the current history entry instead of adding a new one
      window.history.replaceState(null, "", defaultPath);
      // Force a re-render to show the correct content
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [location.pathname, user]);
  // Get current active tab from path
  const activeTab = location.pathname.split("/").pop();

  const handleTabChange = (path) => {
    navigate(path);
  };

  useEffect(() => {
    if (user?.is_sso && !user?.ulink_username) {
      // try to connect ulink. If fails, warn user.
      refreshPrerequisites();
      setUlinkDialogOpen(true);
    }
  }, [user]);

  return (
    <DashboardContainer>
      <TopNavBar />
      <DashboardContent>
        <DashboardHeader>
          <DashboardTitle>
            {return_based_on_roles(
              user,
              "Admin Dashboard",
              "Partner Dashboard",
              "Student Dashboard"
            )}
          </DashboardTitle>
        </DashboardHeader>

        {/* Navigation Tabs */}
        {/* Prevent Non-admins from seeing user management */}
        <TabContainer>
          {routes.map(
            ({ path, label }) =>
              (label != "User Management" || user.is_admin) && (
                <TabButton
                  key={path}
                  active={activeTab === path}
                  onClick={() => handleTabChange(path)}
                >
                  {label}
                </TabButton>
              )
          )}
        </TabContainer>

        {/* Routes */}
        <TabContent>
          <Routes>
            {/* Admin Routes */}
            {(user?.is_admin || user?.is_faculty || user?.is_reviewer) && (
              <>
                <Route path="admin-overview" element={<AdminOverview />} />
                <Route path="admin-programs" element={<AdminProgramsTable />} />
                <Route
                  path="admin-programs/new-program"
                  element={<AdminProgramsTable />}
                />
                <Route
                  path="admin-programs/:programTitle"
                  element={<AdminProgramsTable />}
                />
              </>
            )}
            {user?.is_admin && (
              <>
                <Route path="user-management" element={<UserManagement />} />
                <Route path="site-branding" element={<AdminSiteBranding />} />
              </>
            )}

            {/* Student Routes */}
            {!(
              user?.is_admin ||
              user?.is_faculty ||
              user?.is_reviewer ||
              user?.is_provider_partner
            ) && (
              <>
                <Route path="overview" element={<StudentOverview />} />
                <Route path="my-programs" element={<MyProgramsTable />} />
              </>
            )}

            {/* Partner Routes */}
            {user?.is_provider_partner && (
              <>
                <Route
                  path="partner-programs"
                  element={<PartnerProgramsTable />}
                />
                <Route
                  path="partner-overview"
                  element={<ProviderPartnerOverview />}
                />
                <Route
                  path="partner-programs/:programTitle"
                  element={<PartnerProgramsTable />}
                />
              </>
            )}

            {/* Common Routes */}
            {!user?.is_provider_partner && (
              <>
                <Route path="browse" element={<ProgramBrowser />} />
                <Route
                  path="browse/:programTitle"
                  element={<ProgramBrowser />}
                />{" "}
              </>
            )}
            <>
              <Route
                path="*"
                element={
                  <Navigate
                    to={return_based_on_roles(
                      user,
                      "admin-overview",
                      "partner-overview",
                      "overview"
                    )}
                    replace
                  />
                }
              />
            </>
          </Routes>
        </TabContent>
        <Dialog open={ulinkDialogOpen} onClose={() => setUlinkDialogOpen(false)}>
          <DialogTitle>Ulink Connection Failed</DialogTitle>
          <DialogContent>
            <Typography>
              Your Ulink account could not be connected because the username is already in use.
              Please delete any other accounts using this Ulink username before applying to programs.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUlinkDialogOpen(false)}>Remind me later</Button>
          </DialogActions>
        </Dialog>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;
