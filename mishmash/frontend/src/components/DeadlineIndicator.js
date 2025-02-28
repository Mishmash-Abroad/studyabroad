import React, { useState } from 'react';
import { styled } from "@mui/material/styles";
import { Box, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const DeadlineContainer = styled(Box)(({ theme, severity, clickable }) => {
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
    gap: 0,
    padding: '6px 12px',
    borderRadius: theme.shape.borderRadii.xl,
    backgroundColor: colors.bg,
    color: colors.color,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: theme.typography.caption.letterSpacing,
    boxShadow: theme.customShadows.button,
    cursor: clickable ? 'pointer' : 'default',
    transition: theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': clickable ? {
      transform: 'translateY(-1px)',
      boxShadow: theme.customShadows.buttonHover,
    } : {},
  };
});

const ToggleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
}));

const ModeIcon = styled(Box)(({ theme, active, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: active ? color : color,
  opacity: active ? 1 : 0.4,
  transition: theme.transitions.create(['opacity'], {
    duration: theme.transitions.duration.standard,
  }),
  '& svg': {
    transform: active ? 'scale(1.0)' : 'scale(0.6)',
    transformOrigin: 'center',
    transition: theme.transitions.create(['transform'], {
      duration: theme.transitions.duration.standard,
    }),
  }
}));

const SwitchIcon = styled(SwapHorizIcon)(({ theme }) => ({
  fontSize: '0.8rem',
  margin: 0,
  padding: 0,
  opacity: 0.7,
}));

const DeadlineIndicator = ({ deadline, type = 'application', expanded: defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(false);
  
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
  const deadlineType = type === 'application' ? 'Application' : 'Documents';

  const toggleExpanded = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setExpanded(!expanded);
  };

  const getIconColor = () => {
    switch (deadlineInfo.severity) {
      case 'error':
        return 'var(--mui-palette-status-error-main)';
      case 'warning':
        return 'var(--mui-palette-status-warning-main)';
      case 'success':
        return 'var(--mui-palette-status-success-main)';
      default:
        return 'var(--mui-palette-status-info-main)';
    }
  };

  const renderToggleIcons = () => {
    const iconColor = getIconColor();
    
    const timeIcon = (
      <ModeIcon active={!expanded} color={iconColor}>
        <AccessTimeIcon fontSize={!expanded ? "medium" : "small"} />
      </ModeIcon>
    );
    
    const calendarIcon = (
      <ModeIcon active={expanded} color={iconColor}>
        <CalendarTodayIcon fontSize={expanded ? "medium" : "small"} />
      </ModeIcon>
    );

    return expanded ? 
      <>
        {calendarIcon}
        <SwitchIcon />
        {timeIcon}
      </> : 
      <>
        {timeIcon}
        <SwitchIcon />
        {calendarIcon}
      </>;
  };

  return (
    <DeadlineContainer 
      severity={deadlineInfo.severity} 
      clickable={true}
      onClick={toggleExpanded}
    >
      <ToggleContainer
        onClick={toggleExpanded}
        aria-label={expanded ? "Switch to days remaining view" : "Switch to calendar date view"}
      >
        {renderToggleIcons()}
      </ToggleContainer>
      <Typography component="span" sx={{ whiteSpace: 'nowrap', flex: 1, paddingLeft: 0, marginLeft: 0 }}>
        {expanded ? (
          `${deadlineType} due: ${deadlineInfo.fullDate}`
        ) : (
          `${deadlineType}: ${deadlineInfo.message}`
        )}
      </Typography>
    </DeadlineContainer>
  );
};

export default DeadlineIndicator;
