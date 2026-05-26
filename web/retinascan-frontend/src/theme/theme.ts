import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main:        '#1A6B3C',
      light:       '#2E8B57',
      dark:        '#0F3D24',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main:        '#C9A84C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAF9',
      paper:   '#FFFFFF',
    },
    text: {
      primary:   '#2D3748',
      secondary: '#718096',
    },
    // Custom severity colours accessible via theme.palette.severity
    error:   { main: '#C1121F' },
    warning: { main: '#E76F51' },
    success: { main: '#2E8B57' },
    info:    { main: '#F4A261' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: {
      textTransform: 'none',  // MUI buttons are ALL CAPS by default — disable
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    // Make all MUI buttons slightly taller and rounded
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(26, 107, 60, 0.2)',
          },
        },
      },
    },
    // Card styling
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: '0.5px solid #C8E6D4',
        },
      },
    },
    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export default theme;