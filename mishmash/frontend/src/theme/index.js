import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // ---------- TYPOGRAPHY ----------
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

  // ---------- PALETTE ----------
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
    common: {
      black: '#000000',
      white: '#ffffff',
    },
    // Greys for backgrounds, borders, etc.
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    // For translucent overlays or borders
    overlay: {
      // You can name these however you like
      faint: 'rgba(255,255,255,0.1)',
      subtle: 'rgba(255,255,255,0.2)',
      deeper: 'rgba(255,255,255,0.3)',
      nearWhite: 'rgba(255,255,255,0.9)',
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
        light: '#f44336',
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
      },
    },

    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
      card: {
        default: '#ffffff',
        hover: '#fafafa',
      },
    },
    text: {
      primary: '#1a237e',
      secondary: '#424242',
      disabled: '#9e9e9e',
    },
    border: {
      light: '#e0e0e0',
      main: '#bdbdbd',
      dark: '#9e9e9e',
    },
  },

  // ---------- SHAPE ----------
  shape: {
    borderRadius: 8,
    borderRadii: {
      small: 4,
      medium: 8,
      large: 12,
      xl: 20,
    }
  },

  // ---------- SHADOWS ----------
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 6px rgba(0,0,0,0.07)',
    '0 6px 8px rgba(0,0,0,0.09)',
    '0 8px 10px rgba(0,0,0,0.11)',
    '0 10px 12px rgba(0,0,0,0.13)',
    '0 12px 14px rgba(0,0,0,0.15)',
    '0 14px 16px rgba(0,0,0,0.17)',
    '0 16px 18px rgba(0,0,0,0.19)',
    '0 18px 20px rgba(0,0,0,0.21)',
    '0 20px 22px rgba(0,0,0,0.23)',
    '0 22px 24px rgba(0,0,0,0.25)',
    '0 24px 26px rgba(0,0,0,0.27)',
    '0 26px 28px rgba(0,0,0,0.29)',
    '0 28px 30px rgba(0,0,0,0.31)',
    '0 30px 32px rgba(0,0,0,0.33)',
    '0 32px 34px rgba(0,0,0,0.35)',
    '0 34px 36px rgba(0,0,0,0.37)',
    '0 36px 38px rgba(0,0,0,0.39)',
    '0 38px 40px rgba(0,0,0,0.41)',
    '0 40px 42px rgba(0,0,0,0.43)',
    '0 42px 44px rgba(0,0,0,0.45)',
    '0 44px 46px rgba(0,0,0,0.47)',
    '0 46px 48px rgba(0,0,0,0.49)',
    '0 48px 50px rgba(0,0,0,0.51)',
  ],
  customShadows: {
    card: '0 4px 6px rgba(0,0,0,0.1)',
    raised: '0 6px 12px rgba(0,0,0,0.15)',
    button: '0 2px 4px rgba(0,0,0,0.1)',
  },

  // ---------- TRANSITIONS ----------
  transitions: {
    quick: 'all 0.2s ease',
    medium: 'all 0.3s ease',
    slow: 'all 0.5s ease',
    slower: 'all 0.7s ease',
  },

  // ---------- CUSTOM TEXT SHADOWS ----------
  textShadows: {
    subtle: '1px 1px 2px rgba(0,0,0,0.2)',
    medium: '2px 2px 3px rgba(0,0,0,0.3)',
    bold: '2px 2px 5px rgba(0,0,0,0.5)',
  },

  // ---------- GLOBAL COMPONENT OVERRIDES ----------
  components: {
    MuiTypography: {
      styleOverrides: {
        h1: {
          textShadow: '2px 2px 5px rgba(0,0,0,0.5)',
        },
        h2: {
          textShadow: '2px 2px 3px rgba(0,0,0,0.3)',
        },
        h3: {
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
        },
        h4: {
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
        },
      },
    },
  },
});

export default theme;