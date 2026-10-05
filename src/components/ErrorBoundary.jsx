import React from 'react';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            backgroundColor: '#f8fafc',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 520,
              width: '100%',
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid #fecaca',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#dc2626', mb: 1.5 }}>
              Something Went Wrong
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              An unexpected error occurred while rendering this page.
            </Typography>
            {this.state.error?.message && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 1.5,
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#b91c1c',
                  textAlign: 'left',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
              </Box>
            )}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={this.handleGoHome}
                sx={{ borderColor: '#d1d5db', color: '#0f172a', fontWeight: 600, '&:hover': { backgroundColor: '#f8fafc', borderColor: '#9ca3af' } }}
              >
                Go to Home
              </Button>
              <Button
                variant="contained"
                onClick={this.handleReload}
                sx={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, '&:hover': { backgroundColor: '#1d4ed8' } }}
              >
                Refresh Page
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
