import { styled } from '@mui/material/styles';
import { Card, Box, InputBase } from '@mui/material';

export const PageContainer = styled('div')(({ theme }) => ({
  padding: '20px',
  backgroundColor: theme.palette.background.paper,
}));

export const ContentContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: '24px',
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.shadows.card,
  marginBottom: '24px',
}));

export const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  maxWidth: '600px',
  margin: '0 auto 20px',
}));

export const SearchInput = styled(InputBase)(({ theme }) => ({
  width: '100%',
  fontFamily: theme.typography.fontFamily,
  '& .MuiInputBase-input': {
    padding: '12px 48px 12px 48px',
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight,
    border: `2px solid ${theme.palette.border.light}`,
    borderRadius: theme.shape.borderRadius.xl,
    transition: theme.transitions.quick,
    '&:focus': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}1a`,
    },
  },
}));

export const FilterButton = styled('button')(({ theme, active }) => ({
  padding: '8px 16px',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
  color: active ? theme.palette.primary.contrastText : theme.palette.primary.main,
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.border.main}`,
  borderRadius: theme.shape.borderRadius.xl,
  cursor: 'pointer',
  margin: '0 8px',
  transition: theme.transitions.quick,
  fontSize: theme.typography.button.fontSize,
  fontWeight: active ? theme.typography.button.fontWeight : theme.typography.body1.fontWeight,
  fontFamily: theme.typography.fontFamily,
  letterSpacing: theme.typography.button.letterSpacing,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.background.card.hover,
  },
}));

export const ProgramGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '24px',
  padding: '20px 0',
  maxWidth: '1200px',
  margin: '0 auto',
}));

export const ProgramCard = styled(Card)(({ theme, expanded }) => ({
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

export const StatusBadge = styled('div')(({ theme, status }) => {
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

export const ApplicationButton = styled('button')(({ theme, variant }) => {
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
