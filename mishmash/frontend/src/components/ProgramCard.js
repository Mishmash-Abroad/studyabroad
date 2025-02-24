import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import {
  STATUS,
  PROGRAM_STATUS,
  ALL_STATUSES,
  PROGRAM_STATUSES,
  READ_ONLY_APPLICATION_STATUSES,
  EDITABLE_APPLICATION_STATUSES,
  APPLICATION_ACTION_BUTTON_TEXT,
  PROGRAM_ACTION_BUTTON_TEXT,
} from '../utils/constants';

// Helper to extract colors from the theme for badges
const getStatusColors = (theme, severity) => {
  const statusObj = theme.palette.status[severity];
  if (statusObj) {
    return {
      bg: statusObj.background,
      color: statusObj.main,
    };
  }
  const neutral = theme.palette.status.neutral;
  return {
    bg: neutral.background,
    color: neutral.main,
  };
};

// Styled badge for the program status (always displayed)
const ProgramStatusBadge = styled('div')(({ theme, severity }) => {
  const colors = getStatusColors(theme, severity);
  return {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '6px 12px',
    borderRadius: theme.shape.borderRadius.xl,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.customShadows.button,
    backgroundColor: colors.bg,
    color: colors.color,
    zIndex: 1,
  };
});

// Styled badge for the application status (shown only if in read-only states)
const ApplicationStatusBadge = styled('div')(({ theme, severity }) => {
  const colors = getStatusColors(theme, severity);
  return {
    position: 'absolute',
    top: '45px',
    right: '10px',
    padding: '6px 12px',
    borderRadius: theme.shape.borderRadius.xl,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.customShadows.button,
    backgroundColor: colors.bg,
    color: colors.color,
    zIndex: 1,
  };
});

// Revert ApplicationButton styling to the previous version (white on green)
const ApplicationButton = styled('button')(({ theme, variant }) => {
  const getColors = () => {
    if (variant === 'success') {
      return {
        bg: theme.palette.status.success.main,
        color: theme.palette.status.success.contrastText,
      };
    } else if (variant === 'disabled') {
      return {
        bg: theme.palette.status.neutral.light,
        color: theme.palette.status.neutral.contrastText,
      };
    } else {
      return {
        bg: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      };
    }
  };
  const colors = getColors();
  return {
    padding: '8px 16px',
    borderRadius: theme.shape.borderRadius.small,
    backgroundColor: colors.bg,
    color: colors.color,
    border: 'none',
    cursor: variant === 'disabled' ? 'not-allowed' : 'pointer',
    transition: theme.transitions.quick,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    fontFamily: theme.typography.button.fontFamily,
    letterSpacing: theme.typography.button.letterSpacing,
    '&:hover': {
      filter: variant !== 'disabled' ? 'brightness(0.9)' : 'none',
    },
  };
});

// Main container for the Program Card
const StyledProgramCard = styled('div')(({ theme, expanded }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius.large,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.card.default,
  cursor: 'pointer',
  transition: theme.transitions.create(['transform'], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  height: expanded ? 'auto' : '200px',
  border: `1px solid ${theme.palette.border.light}`,
  '&:hover': {
    backgroundColor: theme.palette.background.card.hover,
    transform: expanded ? 'scale(1.01)' : 'scale(1.02)',
  },
}));

// Helper: Returns deadline info (e.g. "Opens in X days" or "Closes in Y days")
const getDeadlineInfo = (today, openDate, deadline) => {
  const diffOpen = Math.ceil((openDate - today) / (1000 * 60 * 60 * 24));
  const diffClose = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  const pickStyle = (days) => (days <= 7 ? 'error' : days <= 14 ? 'warning' : 'info');

  if (diffOpen > 0) return { text: `Opens in ${diffOpen} days`, style: pickStyle(diffOpen) };
  if (diffClose > 0) return { text: `Closes in ${diffClose} days`, style: pickStyle(diffClose) };
  return null;
};

const ProgramCard = ({ program, onExpand }) => {
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const today = new Date();
  const applicationOpenDate = new Date(program.application_open_date);
  const applicationDeadline = new Date(program.application_deadline);

  // Fetch the current user's application status for this program.
  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        const response = await axiosInstance.get(`/api/programs/${program.id}/application_status/`);
        setApplicationStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching application status:', error);
      }
    };
    fetchApplicationStatus();
  }, [program.id]);

  // Compute program status based solely on dates.
  const getProgramStatus = () =>
    today < applicationOpenDate
      ? PROGRAM_STATUS.OPENING_SOON
      : today > applicationDeadline
      ? PROGRAM_STATUS.CLOSED
      : PROGRAM_STATUS.OPEN;

  // Render the program badge based on program status.
  const renderProgramBadge = () => {
    const progStatus = getProgramStatus();
    const severity = PROGRAM_STATUSES[progStatus]?.severity || 'neutral';
    return <ProgramStatusBadge severity={severity}>{progStatus}</ProgramStatusBadge>;
  };

  // Render the application badge only if the user's application is in a read-only state.
  const renderApplicationBadge = () =>
    applicationStatus && READ_ONLY_APPLICATION_STATUSES.includes(applicationStatus) ? (
      <ApplicationStatusBadge severity={ALL_STATUSES[applicationStatus]?.severity || 'neutral'}>
        {applicationStatus}
      </ApplicationStatusBadge>
    ) : null;

  // Get the action button text from constants.
  const getButtonText = () => {
    if (applicationStatus) {
      return APPLICATION_ACTION_BUTTON_TEXT[applicationStatus] || 'View Application';
    }
    return PROGRAM_ACTION_BUTTON_TEXT[getProgramStatus()] || '';
  };

  // Get the button click handler.
  const getButtonHandler = () => () => navigate(`/apply/${program.id}`);

  // Render a deadline indicator (only when no application exists).
  const renderDeadlineIndicator = () => {
    if (applicationStatus) return null;
    const info = getDeadlineInfo(today, applicationOpenDate, applicationDeadline);
    if (!info) return null;
    return (
      <div
        style={{
          display: 'inline-block',
          padding: theme.spacing(0.5, 1.5),
          borderRadius: theme.shape.borderRadius.medium,
          backgroundColor: theme.palette.status[info.style]?.background,
          color: theme.palette.status[info.style]?.main,
          fontSize: theme.typography.caption.fontSize,
          fontWeight: theme.typography.subtitle2.fontWeight,
          letterSpacing: theme.typography.caption.letterSpacing,
        }}
      >
        {info.text}
      </div>
    );
  };

  // Render the action button.
  const renderActionButton = () => (
    <ApplicationButton
      onClick={getButtonHandler()}
      disabled={user?.is_admin}
      variant={user?.is_admin ? 'disabled' : 'success'}
    >
      {getButtonText()}
    </ApplicationButton>
  );

  return (
    <StyledProgramCard
      expanded={expanded}
      onClick={() => {
        setExpanded(!expanded);
        if (onExpand) onExpand(!expanded);
      }}
      className={expanded ? 'expanded-card' : 'program-card'}
    >
      <div
        style={{
          position: 'absolute',
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

      {/* Render separate badges */}
      {renderProgramBadge()}
      {renderApplicationBadge()}

      {/* Program Title */}
      <div
        style={{
          position: 'absolute',
          bottom: expanded ? 'auto' : '20px',
          left: '20px',
          right: '20px',
          padding: '10px',
          paddingRight: expanded ? '60px' : '20px',
          zIndex: 1,
        }}
      >
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
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
            padding: '30px',
            marginTop: '100px',
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <p
                style={{
                  color: theme.palette.grey[600],
                  margin: '0 0 16px 0',
                  fontSize: '1.1em',
                }}
              >
                {program.year_semester} • Led by {program.faculty_leads.map(f => f.display_name).join(', ')}
              </p>
              <p
                style={{
                  margin: '0',
                  fontSize: '1.1em',
                  lineHeight: '1.6',
                  color: theme.palette.text.primary,
                }}
              >
                {program.description}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '24px',
                backgroundColor: theme.palette.grey[50],
                padding: '24px',
                borderRadius: theme.shape.borderRadius.large,
                marginBottom: '24px',
                alignItems: 'start',
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
                    marginTop: '8px',
                    fontSize: theme.typography.body1.fontSize,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {program.application_open_date} – {program.application_deadline}
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
                    marginTop: '8px',
                    fontSize: theme.typography.body1.fontSize,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {program.start_date} – {program.end_date}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  gap: theme.spacing(1),
                  minWidth: '200px',
                  height: '100%',
                }}
              >
                {renderDeadlineIndicator()}
                {renderActionButton()}
              </div>
            </div>
          </div>
        </div>
      )}
    </StyledProgramCard>
  );
};

export default ProgramCard;
