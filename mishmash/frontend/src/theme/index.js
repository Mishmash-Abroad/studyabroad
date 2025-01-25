import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.00735em',
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.03333em',
    },
  },
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0277bd',
      light: '#58a5f0',
      dark: '#004c8c',
      contrastText: '#ffffff',
    },
    status: {
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
        background: '#e8f5e9',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#f57c00',
        light: '#ffb74d',
        dark: '#e65100',
        background: '#fff3e0',
        contrastText: '#ffffff',
      },
      error: {
        main: '#c62828',
        light: '#ef5350',
        dark: '#b71c1c',
        background: '#ffebee',
        contrastText: '#ffffff',
      },
      info: {
        main: '#1976d2',
        light: '#64b5f6',
        dark: '#1565c0',
        background: '#e3f2fd',
        contrastText: '#ffffff',
      },
      neutral: {
        main: '#757575',
        light: '#bdbdbd',
        dark: '#424242',
        background: '#f5f5f5',
        contrastText: '#ffffff',
      }
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
      card: {
        default: '#ffffff',
        hover: '#fafafa'
      }
    },
    text: {
      primary: '#1a237e',
      secondary: '#424242',
      disabled: '#9e9e9e'
    },
    border: {
      light: '#e0e0e0',
      main: '#bdbdbd',
      dark: '#9e9e9e'
    }
  },
  shape: {
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
      xl: 20
    }
  },
  shadows: {
    card: '0 4px 6px rgba(0,0,0,0.1)',
    raised: '0 6px 12px rgba(0,0,0,0.15)',
    button: '0 2px 4px rgba(0,0,0,0.1)'
  },
  transitions: {
    quick: 'all 0.2s ease',
    medium: 'all 0.3s ease',
    slow: 'all 0.5s ease'
  }
});

export default theme;
