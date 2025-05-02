// src/theme.js
// Defines the application's theme, including colors, typography, and component styling

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Color palette definition
const lightPalette = {
  primary: {
    main: '#3f51b5', // Indigo
    light: '#757de8',
    dark: '#002984',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f50057', // Pink
    light: '#ff5983',
    dark: '#bb002f',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50',
    light: '#80e27e',
    dark: '#087f23',
  },
  error: {
    main: '#f44336',
    light: '#ff7961',
    dark: '#ba000d',
  },
  warning: {
    main: '#ff9800',
    light: '#ffc947',
    dark: '#c66900',
  },
  info: {
    main: '#2196f3',
    light: '#6ec6ff',
    dark: '#0069c0',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

// Dark mode palette
const darkPalette = {
  primary: {
    main: '#5c6bc0', // Lighter indigo for dark mode
    light: '#8e99f3',
    dark: '#26418f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff4081', // Lighter pink for dark mode
    light: '#ff79b0',
    dark: '#c60055',
    contrastText: '#ffffff',
  },
  success: {
    main: '#66bb6a',
    light: '#98ee99',
    dark: '#338a3e',
  },
  error: {
    main: '#e57373',
    light: '#ffa4a2',
    dark: '#af4448',
  },
  warning: {
    main: '#ffb74d',
    light: '#ffe97d',
    dark: '#c88719',
  },
  info: {
    main: '#64b5f6',
    light: '#9be7ff',
    dark: '#2286c3',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};

// Create theme factory function to support both light and dark modes
export const createAppTheme = (mode = 'light') => {
  // Select palette based on mode
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  
  // Create base theme
  let theme = createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
      button: {
        textTransform: 'none', // Don't uppercase button text
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            marginBottom: 16,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginBottom: 4,
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
            },
          },
        },
      },
    },
  });

  // Make fonts responsive
  theme = responsiveFontSizes(theme);

  return theme;
};

// Export default theme (light mode)
const theme = createAppTheme('light');
export default theme;
