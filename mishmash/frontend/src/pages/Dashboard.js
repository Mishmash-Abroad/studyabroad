import React from "react";
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
import MyProgramsTable from "../components/MyProgramsTable";
import AnnouncementsManager from "../components/AnnouncementsManager";
import AnnouncementsBrowser from "../components/AnnouncementsBrowser";
import UserManagement from "../components/UserManagement";
import Typography from "@mui/material/Typography";

// -------------------- ROUTE CONFIGURATIONS --------------------
const ADMIN_ROUTES = [
  { path: "admin-overview", label: "Overview" },
  { path: "admin-programs", label: "Program Management" },
  { path: "browse", label: "Browse Programs" },
  { path: "user-management", label: "User Management" },
];

const STUDENT_ROUTES = [
  { path: "overview", label: "Overview" },
  { path: "browse", label: "Browse Programs" },
  { path: "my-programs", label: "My Programs" },
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
        {user?.is_admin ? (
          <AnnouncementsManager />
        ) : (
          <AnnouncementsBrowser />
        )}
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

// -------------------- MAIN COMPONENT --------------------
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const routes =
    user?.is_admin || user?.is_faculty || user?.is_reviewer
      ? ADMIN_ROUTES
      : STUDENT_ROUTES;
  // Handle default route
  React.useEffect(() => {
    // Only adjust the route if user is available
    if (user && location.pathname === "/dashboard") {
      const defaultPath = `/dashboard/${
        user?.is_admin || user?.is_faculty || user?.is_reviewer
          ? "admin-overview"
          : "overview"
      }`;
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

  return (
    <DashboardContainer>
      <TopNavBar />
      <DashboardContent>
        <DashboardHeader>
          <DashboardTitle>
            {user?.is_admin || user?.is_faculty || user?.is_reviewer
              ? "Admin Dashboard"
              : "Student Dashboard"}
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
              <Route path="user-management" element={<UserManagement />} />
            )}

            {/* Student Routes */}
            {!(user?.is_admin || user?.is_faculty || user?.is_reviewer) && (
              <>
                <Route path="overview" element={<StudentOverview />} />
                <Route path="my-programs" element={<MyProgramsTable />} />
              </>
            )}

            {/* Common Routes */}
            <Route path="browse" element={<ProgramBrowser />} />
            <Route path="browse/:programTitle" element={<ProgramBrowser />} />
            <Route
              path="*"
              element={
                <Navigate
                  to={
                    user?.is_admin || user?.is_faculty || user?.is_reviewer
                      ? "admin-overview"
                      : "overview"
                  }
                  replace
                />
              }
            />
          </Routes>
        </TabContent>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;
