import React, { useState } from 'react';
import { styled } from "@mui/material/styles";
import { Box, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const DeadlineContainer = styled(Box)(({ theme, severity, clickable, size = 'medium' }) => {
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
  
  // Calculate size-based values
  let fontSize, padding, iconSize;
  switch(size) {
    case 'small':
      fontSize = '0.75rem';
      padding = '3px 6px';
      iconSize = 'small';
      break;
    case 'large':
      fontSize = '0.95rem';
      padding = '6px 12px';
      iconSize = 'medium';
      break;
    case 'medium':
    default:
      fontSize = '0.85rem';
      padding = '5px 10px';
      iconSize = 'small';
  }
  
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    padding: padding,
    borderRadius: theme.shape.borderRadii.xl,
    backgroundColor: colors.bg,
    color: colors.color,
    fontSize: fontSize,
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

const ModeIcon = styled(Box)(({ theme, active, color, size = 'medium' }) => {
  // Scale factor based on size
  const getScaleFactor = () => {
    switch(size) {
      case 'small': return active ? 0.7 : 0.45;
      case 'large': return active ? 0.95 : 0.6;
      case 'medium':
      default: return active ? 0.85 : 0.55;
    }
  };
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? color : color,
    opacity: active ? 1 : 0.4,
    transition: theme.transitions.create(['opacity'], {
      duration: theme.transitions.duration.standard,
    }),
    '& svg': {
      transform: `scale(${getScaleFactor()})`,
      transformOrigin: 'center',
      transition: theme.transitions.create(['transform'], {
        duration: theme.transitions.duration.standard,
      }),
    }
  };
});

const SwitchIcon = styled(SwapHorizIcon)(({ theme, size = 'medium' }) => {
  const fontSize = size === 'small' ? '0.7rem' : 
                  size === 'large' ? '0.9rem' : '0.8rem';
  
  return {
    fontSize: fontSize,
    margin: 0,
    padding: 0,
    opacity: 0.7,
  };
});

const DeadlineIndicator = ({ deadline, type = 'application', expanded: defaultExpanded = false, size = 'medium' }) => {
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
      <ModeIcon active={!expanded} color={iconColor} size={size}>
        <AccessTimeIcon fontSize={size === 'small' ? "small" : "medium"} />
      </ModeIcon>
    );
    
    const calendarIcon = (
      <ModeIcon active={expanded} color={iconColor} size={size}>
        <CalendarTodayIcon fontSize={size === 'small' ? "small" : "medium"} />
      </ModeIcon>
    );

    return expanded ? 
      <>
        {calendarIcon}
        <SwitchIcon size={size} />
        {timeIcon}
      </> : 
      <>
        {timeIcon}
        <SwitchIcon size={size} />
        {calendarIcon}
      </>;
  };

  return (
    <DeadlineContainer 
      severity={deadlineInfo.severity} 
      clickable={true}
      size={size}
      onClick={toggleExpanded}
    >
      <ToggleContainer
        onClick={toggleExpanded}
        aria-label={expanded ? "Switch to days remaining view" : "Switch to calendar date view"}
      >
        {renderToggleIcons()}
      </ToggleContainer>
      <Typography 
        component="span" 
        sx={{ 
          whiteSpace: 'nowrap', 
          flex: 1, 
          paddingLeft: 0, 
          marginLeft: 0,
          fontSize: 'inherit' 
        }}
      >
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
