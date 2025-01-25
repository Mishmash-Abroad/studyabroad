import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

const StyledProgramCard = styled(Card)(({ theme, expanded }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius.large,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.card.default,
  boxShadow: expanded ? theme.shadows.raised : theme.shadows.card,
  cursor: 'pointer',
  transition: theme.transitions.medium,
  transform: expanded ? 'scale(1.02)' : 'scale(1)',
  height: expanded ? 'auto' : '200px',
  '&:hover': {
    backgroundColor: theme.palette.background.card.hover,
  },
}));

const StatusBadge = styled('div')(({ theme, status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'enrolled':
      case 'applied':
        return {
          bg: theme.palette.status.info.background,
          color: theme.palette.status.info.main,
        };
      case 'withdrawn':
      case 'canceled':
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.error.main,
        };
      case 'opening soon':
        return {
          bg: theme.palette.status.warning.background,
          color: theme.palette.status.warning.main,
        };
      case 'closed':
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.error.main,
        };
      case 'open':
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
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '6px 12px',
    borderRadius: theme.shape.borderRadius.xl,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.shadows.button,
    zIndex: 1,
    backgroundColor: colors.bg,
    color: colors.color,
  };
});

const ApplicationStatusBadge = styled('div')(({ theme, status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'enrolled':
      case 'applied':
        return {
          bg: theme.palette.status.info.background,
          color: theme.palette.status.info.main,
        };
      case 'withdrawn':
      case 'canceled':
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.error.main,
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
    position: 'absolute',
    top: '45px', 
    right: '10px',
    padding: '6px 12px',
    borderRadius: theme.shape.borderRadius.xl,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.shadows.button,
    zIndex: 1,
    backgroundColor: colors.bg,
    color: colors.color,
  };
});

const ApplicationButton = styled('button')(({ theme, variant }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.palette.status.success.main,
          color: theme.palette.status.success.contrastText,
        };
      case 'disabled':
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
    padding: '8px 16px',
    borderRadius: theme.shape.borderRadius.small,
    backgroundColor: colors.bg,
    color: colors.color,
    border: 'none',
    cursor: variant === 'disabled' ? 'not-allowed' : 'pointer',
    transition: theme.transitions.quick,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.button.letterSpacing,
    '&:hover': {
      filter: variant !== 'disabled' ? 'brightness(0.9)' : 'none',
    },
  };
});

/**
 * Program Card Component
 */
const ProgramCard = ({ program, isInAppliedSection }) => {
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme(); 

  // Date calculations
  const today = new Date();
  const applicationOpenDate = new Date(program.application_open_date);
  const applicationDeadline = new Date(program.application_deadline);

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

  // Logic that returns the program status
  const getProgramStatus = () => {
    if (today < applicationOpenDate) {
      return 'Opening Soon';
    }
    if (today > applicationDeadline) {
      return 'Closed';
    }
    return 'Open';
  };

  // Get the display status, prioritizing application status over program status
  const getStatusBadge = () => {
    // Application-specific statuses take precedence
    if (applicationStatus) {
      switch (applicationStatus) {
        case 'Enrolled':
        case 'Applied':
          return applicationStatus;
        case 'Withdrawn':
        case 'Canceled':
          // Only show Withdrawn/Canceled in the detailed view, not in the badge
          return getProgramStatus();
        default:
          return getProgramStatus();
      }
    }
    return getProgramStatus();
  };

  // Get the detailed status message for the application button section
  const getDetailedStatus = () => {
    if (!applicationStatus) {
      return null;
    }

    switch (applicationStatus) {
      case 'Enrolled':
        return 'Currently enrolled';
      case 'Applied':
        return 'Application submitted';
      case 'Withdrawn':
        return 'Previously withdrawn - eligible to reapply';
      case 'Canceled':
        return 'Previously canceled - eligible to reapply';
      default:
        return null;
    }
  };

  // Get the application status badge text
  const getApplicationStatusText = () => {
    if (!applicationStatus) return null;
    
    switch (applicationStatus.toLowerCase()) {
      case 'applied':
        return 'Application Submitted';
      case 'withdrawn':
        return 'Application Withdrawn';
      case 'canceled':
        return 'Application Canceled';
      default:
        return null;
    }
  };

  // Different inline display for the "Apply Now" or "Status" label
  const getApplicationButton = () => {
    const detailedStatus = getDetailedStatus();
    const programStatus = getProgramStatus();

    // Show status for enrolled/applied users
    if (['Enrolled', 'Applied'].includes(applicationStatus)) {
      return (
        <div
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: theme.palette.status.info.background,
            color: theme.palette.status.info.main,
            display: 'inline-block',
          }}
        >
          {detailedStatus}
        </div>
      );
    }

    // Show reapply option for withdrawn/canceled applications
    if (['Withdrawn', 'Canceled'].includes(applicationStatus)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          {programStatus === 'Open' && (
            <ApplicationButton
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/apply/${program.id}`);
              }}
              variant="success"
            >
              Apply Again
            </ApplicationButton>
          )}
          <div
            style={{
              fontSize: '0.8em',
              color: theme.palette.grey[700],
              fontStyle: 'italic',
            }}
          >
            {detailedStatus}
          </div>
        </div>
      );
    }

    // Handle different program statuses
    switch (programStatus) {
      case 'Opening Soon':
        return (
          <div
            className="not-open-badge"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: theme.palette.status.warning.background,
              color: theme.palette.status.warning.main,
            }}
          >
            Applications open on {program.application_open_date}
          </div>
        );

      case 'Closed':
        return (
          <div
            className="deadline-passed-badge"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: theme.palette.status.error.background,
              color: theme.palette.status.error.main,
            }}
          >
            Application Deadline Passed
          </div>
        );

      case 'Open':
        return (
          <ApplicationButton
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/apply/${program.id}`);
            }}
            disabled={user?.is_admin}
            variant={user?.is_admin ? 'disabled' : 'success'}
          >
            Apply Now
          </ApplicationButton>
        );

      default:
        return null;
    }
  };

  return (
    <StyledProgramCard expanded={expanded} onClick={() => setExpanded(!expanded)}>
      {/* Background image placeholder */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.grey[100],
          opacity: 0.8,
          zIndex: 0,
        }}
      />
      {/* Program Status badge */}
      <StatusBadge status={getStatusBadge()}>
        {getStatusBadge()}
      </StatusBadge>

      {/* Application Status badge - only shown in applied section */}
      {program.applicationStatus && isInAppliedSection && (
        <ApplicationStatusBadge status={applicationStatus}>
          {getApplicationStatusText()}
        </ApplicationStatusBadge>
      )}
      {/* Program title and location */}
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
        <p
          style={{
            margin: 0,
            fontSize: '16px',
            color: theme.palette.text.secondary,
            opacity: 0.9,
          }}
        >
          {program.location}
        </p>
      </div>
      {expanded && (
        <div
          style={{
            padding: '20px',
            marginTop: '100px',
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid rgba(0,0,0,0.2)`, 
            zIndex: 1,
            position: 'relative',
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: theme.palette.grey[600], margin: '0 0 5px 0' }}>
              {program.year_semester} • Led by {program.faculty_leads}
            </p>
            <p style={{ margin: '15px 0' }}>{program.description}</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              backgroundColor: theme.palette.grey[50],
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            <div>
              <strong>Application Window:</strong>
              <div>
                {program.application_open_date} - {program.application_deadline}
              </div>
            </div>
            <div>
              <strong>Program Dates:</strong>
              <div>
                {program.start_date} - {program.end_date}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            {getApplicationButton()}
          </div>
        </div>
      )}
    </StyledProgramCard>
  );
};

export default ProgramCard;