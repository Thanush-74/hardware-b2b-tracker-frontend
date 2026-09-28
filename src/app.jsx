import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import muiTheme from './theme/muiTheme';

/**
 * Minimal Post-Login Authentication Confirmation using MUI
 */
const AuthenticatedSessionView = () => {
  const { user, logout } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 460,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Chip
          label="✓ Authentication Successful"
          color="success"
          size="small"
          sx={{ mb: 2, fontWeight: 700 }}
        />

        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
          TITAN<Box component="span" sx={{ color: 'primary.main' }}>CORE</Box>
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', display: 'block', mb: 3 }}>
          B2B HARDWARE TRACKER
        </Typography>

        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 2,
            p: 2,
            mb: 3,
            textAlign: 'left',
          }}
        >
          <Stack spacing={1.2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>User:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Email:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                {user?.email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Role:</Typography>
              <Chip
                label={user?.role?.name || user?.role?.slug || 'Staff'}
                size="small"
                sx={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'primary.light',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={logout}
          sx={{
            py: 1.2,
            fontWeight: 700,
          }}
        >
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Authenticated Root Route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AuthenticatedSessionView />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;