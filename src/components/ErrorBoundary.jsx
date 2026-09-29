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
            backgroundColor: 'background.default',
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              maxWidth: 520,
              width: '100%',
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main', mb: 1.5 }}>
              Something Went Wrong
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              An unexpected error occurred while rendering this page.
            </Typography>
            {this.state.error?.message && (
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'error.light',
                  textAlign: 'left',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
              </Box>
            )}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="outlined" color="primary" onClick={this.handleGoHome}>
                Go to Home
              </Button>
              <Button variant="contained" color="primary" onClick={this.handleReload}>
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
