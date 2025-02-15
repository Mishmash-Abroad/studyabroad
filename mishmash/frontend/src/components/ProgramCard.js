import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";

const StyledProgramCard = styled("div")(({ theme, expanded }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius.large,
  overflow: "hidden",
  backgroundColor: theme.palette.background.card.default,
  cursor: "pointer",
  transition: theme.transitions.create(["transform"], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  height: expanded ? "auto" : "200px",
  border: `1px solid ${theme.palette.border.light}`,
  "&:hover": {
    backgroundColor: theme.palette.background.card.hover,
    transform: expanded ? "scale(1.01)" : "scale(1.02)",
  },
}));

const StatusBadge = styled("div")(({ theme, status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case "enrolled":
      case "applied":
        return {
          bg: theme.palette.status.info.background,
          color: theme.palette.status.info.main,
        };
      case "withdrawn":
      case "canceled":
      case "closed":
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.error.main,
        };
      case "opening soon":
        return {
          bg: theme.palette.status.warning.background,
          color: theme.palette.status.warning.main,
        };
      case "open":
        return {
          bg: theme.palette.status.success.background,
          color: theme.palette.status.success.main,
        };
      default:
        return {
          bg: theme.palette.status.neutral.background,
          color: theme.palette.status.neutral.main,
        };
    }
  };
  const colors = getColors();
  return {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "6px 12px",
    borderRadius: theme.shape.borderRadius.xl,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.customShadows.button,
    zIndex: 1,
    backgroundColor: colors.bg,
    color: colors.color,
  };
});

const ApplicationStatusBadge = styled("div")(({ theme, status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case "enrolled":
      case "applied":
        return {
          bg: theme.palette.status.info.background,
          color: theme.palette.status.info.main,
        };
      case "withdrawn":
      case "canceled":
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.warning.main,
        };
      default:
        return {
          bg: theme.palette.status.neutral.background,
          color: theme.palette.status.neutral.main,
        };
    }
  };
  const colors = getColors();
  return {
    position: "absolute",
    top: "45px",
    right: "10px",
    padding: "6px 12px",
    borderRadius: theme.shape.borderRadius.xl,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.customShadows.button,
    zIndex: 1,
    backgroundColor: colors.bg,
    color: colors.color,
  };
});

const ApplicationButton = styled("button")(({ theme, variant }) => {
  const getColors = () => {
    switch (variant) {
      case "success":
        return {
          bg: theme.palette.status.success.main,
          color: theme.palette.status.success.contrastText,
        };
      case "disabled":
        return {
          bg: theme.palette.status.neutral.light,
          color: theme.palette.status.neutral.contrastText,
        };
      default:
        return {
          bg: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        };
    }
  };
  const colors = getColors();
  return {
    padding: "8px 16px",
    borderRadius: theme.shape.borderRadius.small,
    backgroundColor: colors.bg,
    color: colors.color,
    border: "none",
    cursor: variant === "disabled" ? "not-allowed" : "pointer",
    transition: theme.transitions.quick,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.button.letterSpacing,
    "&:hover": {
      filter: variant !== "disabled" ? "brightness(0.9)" : "none",
    },
  };
});

/**
 * Consolidated helper: returns info for "Opens in X days" or "Closes in Y days"
 * If none applies, returns null.
 */
function getDeadlineInfo(today, openDate, deadline) {
  const diffOpen = Math.ceil((openDate - today) / (1000 * 60 * 60 * 24));
  const diffClose = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  const pickStyle = (days) => {
    if (days <= 7) return "error";
    if (days <= 14) return "warning";
    return "info";
  };

  if (diffOpen > 0) {
    return { text: `Opens in ${diffOpen} days`, style: pickStyle(diffOpen) };
  } else if (diffClose > 0) {
    return { text: `Closes in ${diffClose} days`, style: pickStyle(diffClose) };
  }
  return null;
}

/**
 * Program Card Component
 */
const ProgramCard = ({ program, isInAppliedSection, onExpand }) => {
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applicationID, setApplicationID] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  // Date calculations
  const theme = useTheme();
  const today = new Date();
  const applicationOpenDate = new Date(program.application_open_date);
  const applicationDeadline = new Date(program.application_deadline);
  console.log(user);
  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/programs/${program.id}/application_status/`
        );
        setApplicationStatus(response.data.status);
        setApplicationID(response.data.application_id);
      } catch (error) {
        console.error("Error fetching application status:", error);
      }
    };
    fetchApplicationStatus();
  }, [program.id]);

  const getProgramStatus = () => {
    if (today < applicationOpenDate) return "Opening Soon";
    if (today > applicationDeadline) return "Closed";
    return "Open";
  };

  // Overarching logic to determine which status to show on the main badge
  const getStatusBadgeText = () => {
    const programStatus = getProgramStatus();
    if (!applicationStatus) return programStatus;

    const lower = applicationStatus.toLowerCase();
    if (["enrolled", "applied"].includes(lower)) return applicationStatus;
    if (["withdrawn", "canceled"].includes(lower)) return programStatus;
    return programStatus;
  };

  const getDetailedStatus = () => {
    if (!applicationStatus) return null;
    switch (applicationStatus.toLowerCase()) {
      case "enrolled":
        return "Currently enrolled";
      case "applied":
        return "Application submitted";
      case "withdrawn":
        return "Previously withdrawn";
      case "canceled":
        return "Previously canceled";
      default:
        return null;
    }
  };

  const getApplicationStatusText = () => {
    if (!applicationStatus) return null;
    switch (applicationStatus.toLowerCase()) {
      case "applied":
        return today < applicationDeadline
          ? "Edit Application"
          : "View Application";
      case "withdrawn":
        return "Application Withdrawn";
      case "canceled":
        return "Application Canceled";
      default:
        return null;
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    navigate(`/apply/${program.id}`);
  };

  const handleEditApplication = (e) => {
    e.stopPropagation();
    navigate(`/apply/${program.id}`);
  };

  const handleReapply = (e) => {
    e.stopPropagation();
    navigate(`/apply/${program.id}`);
  };

  const getApplicationButton = () => {
    const detailedStatus = getDetailedStatus();
    const programStatus = getProgramStatus();

    // If the user has already applied and has a status
    if (applicationStatus) {
      switch (applicationStatus.toLowerCase()) {
        case "enrolled":
          return (
            <ApplicationButton
              onClick={handleEditApplication}
              variant="success"
            >
              View Application
            </ApplicationButton>
          );
        case "applied":
          return (
            <ApplicationButton
              onClick={handleEditApplication}
              variant="success"
            >
              {today < applicationDeadline
                ? "Edit Application"
                : "View Application"}
            </ApplicationButton>
          );
        case "withdrawn":
        case "canceled":
          return (
            <ApplicationButton onClick={handleReapply} variant="success">
              Apply Again
            </ApplicationButton>
          );
        default:
          return null;
      }
    }

    // If user hasn't applied yet
    switch (programStatus) {
      case "Opening Soon":
        return (
          <ApplicationButton
            onClick={(e) => e.stopPropagation()}
            disabled
            variant="disabled"
          >
            Opening Soon
          </ApplicationButton>
        );
      case "Open":
        return (
          <ApplicationButton
            onClick={handleApply}
            disabled={user?.user.is_admin}
            variant={user?.user.is_admin ? "disabled" : "success"}
          >
            Apply Now
          </ApplicationButton>
        );
      case "Closed":
        return (
          <ApplicationButton
            onClick={(e) => e.stopPropagation()}
            disabled
            variant="disabled"
          >
            Applications Closed
          </ApplicationButton>
        );
      default:
        return null;
    }
  };

  // Renders the "Opens in X days" / "Closes in X days" badge if applicable
  function renderDeadlineIndicator() {
    if (
      applicationStatus &&
      ["enrolled", "applied"].includes(applicationStatus.toLowerCase())
    ) {
      return null; // user has applied, so we don't show the countdown
    }
    const info = getDeadlineInfo(
      today,
      applicationOpenDate,
      applicationDeadline
    );
    if (!info) return null;
    return (
      <div
        style={{
          display: "inline-block",
          padding: theme.spacing(0.5, 1.5),
          borderRadius: theme.shape.borderRadius.medium,
          backgroundColor: theme.palette.status[info.style].background,
          color: theme.palette.status[info.style].main,
          fontSize: theme.typography.caption.fontSize,
          fontWeight: theme.typography.subtitle2.fontWeight,
          letterSpacing: theme.typography.caption.letterSpacing,
        }}
      >
        {info.text}
      </div>
    );
  }

  return (
    <StyledProgramCard
      expanded={expanded}
      onClick={() => {
        setExpanded(!expanded);
        onExpand?.(!expanded);
      }}
      className={expanded ? "expanded-card" : "program-card"}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: expanded
            ? `linear-gradient(180deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[50]} 30%, ${theme.palette.common.white} 100%)`
            : theme.palette.grey[100],
          opacity: 0.8,
          zIndex: 0,
        }}
      />

      {/* Main Status Badge */}
      <StatusBadge status={getStatusBadgeText()}>
        {getStatusBadgeText()}
      </StatusBadge>

      {/* Application Status Badge - only for withdrawn/canceled */}
      {applicationStatus &&
        ["withdrawn", "canceled"].includes(applicationStatus.toLowerCase()) && (
          <ApplicationStatusBadge status={applicationStatus}>
            {getApplicationStatusText()}
          </ApplicationStatusBadge>
        )}

      {/* Program Title */}
      <div
        style={{
          position: "absolute",
          bottom: expanded ? "auto" : "20px",
          left: "20px",
          right: "20px",
          padding: "10px",
          paddingRight: expanded ? "60px" : "20px",
          zIndex: 1,
        }}
      >
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "24px",
            color: theme.palette.primary.dark,
            textShadow: theme.textShadows.light,
          }}
        >
          {program.title}
        </h3>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div
          style={{
            padding: "30px",
            marginTop: "100px",
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            zIndex: 1,
            position: "relative",
          }}
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  color: theme.palette.grey[600],
                  margin: "0 0 16px 0",
                  fontSize: "1.1em",
                }}
              >
                {program.year_semester} • Led by {program.faculty_leads}
              </p>
              <p
                style={{
                  margin: "0",
                  fontSize: "1.1em",
                  lineHeight: "1.6",
                  color: theme.palette.text.primary,
                }}
              >
                {program.description}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: "24px",
                backgroundColor: theme.palette.grey[50],
                padding: "24px",
                borderRadius: theme.shape.borderRadius.large,
                marginBottom: "24px",
                alignItems: "start",
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: theme.typography.subtitle1.fontSize,
                    fontWeight: theme.typography.subtitle1.fontWeight,
                    color: theme.palette.text.primary,
                  }}
                >
                  Application Window
                </strong>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: theme.typography.body1.fontSize,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {program.application_open_date} -{" "}
                  {program.application_deadline}
                </div>
              </div>
              <div>
                <strong
                  style={{
                    fontSize: theme.typography.subtitle1.fontSize,
                    fontWeight: theme.typography.subtitle1.fontWeight,
                    color: theme.palette.text.primary,
                  }}
                >
                  Program Dates
                </strong>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: theme.typography.body1.fontSize,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {program.start_date} - {program.end_date}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  gap: theme.spacing(1),
                  minWidth: "200px",
                  height: "100%",
                }}
              >
                {renderDeadlineIndicator()}
                {getApplicationButton()}
              </div>
            </div>
          </div>
        </div>
      )}
    </StyledProgramCard>
  );
};

export default ProgramCard;
