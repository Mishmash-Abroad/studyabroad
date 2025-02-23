import React, { useState } from 'react';
import { styled } from "@mui/material/styles";
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const DeadlineContainer = styled(Box)(({ theme, severity }) => {
  const getColors = () => {
    switch (severity) {
      case 'error':
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.error.main,
        };
      case 'warning':
        return {
          bg: theme.palette.status.warning.background,
          color: theme.palette.status.warning.main,
        };
      case 'success':
        return {
          bg: theme.palette.status.success.background,
          color: theme.palette.status.success.main,
        };
      default:
        return {
          bg: theme.palette.status.info.background,
          color: theme.palette.status.info.main,
        };
    }
  };
  const colors = getColors();
  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: '6px 12px',
    borderRadius: theme.shape.borderRadius.xl,
    backgroundColor: colors.bg,
    color: colors.color,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.customShadows.button,
    transition: theme.transitions.create(['background-color', 'transform'], {
      duration: theme.transitions.duration.short,
    }),
  };
});

const ExpandButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  marginLeft: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const DeadlineIndicator = ({ deadline, type = 'application', expanded: defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const calculateDeadlineInfo = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    let severity, message;
    if (diffDays < 0) {
      severity = 'error';
      message = 'Deadline passed';
    } else if (diffDays <= 7) {
      severity = 'error';
      message = `${diffDays} days left`;
    } else if (diffDays <= 14) {
      severity = 'warning';
      message = `${diffDays} days left`;
    } else {
      severity = 'info';
      message = `${diffDays} days left`;
    }
    
    return {
      severity,
      message,
      fullDate: deadlineDate.toLocaleDateString(),
      daysLeft: diffDays
    };
  };

  const deadlineInfo = calculateDeadlineInfo(deadline);
  const deadlineType = type === 'application' ? 'Application' : 'Document';

  return (
    <DeadlineContainer severity={deadlineInfo.severity} onClick={() => setExpanded(!expanded)}>
      <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>
        {expanded ? (
          `${deadlineType} Deadline: ${deadlineInfo.fullDate}`
        ) : (
          `${deadlineType}: ${deadlineInfo.message}`
        )}
      </Typography>
      <ExpandButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </ExpandButton>
    </DeadlineContainer>
  );
};

export default DeadlineIndicator;
