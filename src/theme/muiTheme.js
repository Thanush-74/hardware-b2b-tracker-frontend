import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#0b0f19',
    },
    secondary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    background: {
      default: '#0B0F19',
      paper: '#121826',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
    error: {
      main: '#f43f5e',
      light: '#fb7185',
      dark: '#e11d48',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 12,
          paddingBottom: 12,
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
          '&:hover': {
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#0b0f19',
          '&:hover': {
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#0e1424',
            borderRadius: 10,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(245, 158, 11, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f59e0b',
              boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(18, 24, 38, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});

export default muiTheme;
