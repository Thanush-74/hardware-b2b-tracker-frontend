import React from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getDefaultRoute } = useAuth();

  const handleReturnHome = () => {
    if (isAuthenticated) {
      navigate(getDefaultRoute(), { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          borderRadius: 2,
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Chip
          label="404 ERROR"
          size="small"
          sx={{
            display: 'block',
            width: 'fit-content',
            mx: 'auto',
            mb: 2,
            fontWeight: 700,
            fontSize: '0.72rem',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
          }}
        />

        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
          Page Not Found
        </Typography>

        <Typography variant="body2" sx={{ color: '#64748b', mb: 3.5, lineHeight: 1.6 }}>
          The screen or resource you are attempting to reach does not exist or has been relocated within the B2B tracker portal.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleReturnHome}
            sx={{
              fontWeight: 600,
              px: 3,
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' },
            }}
          >
            {isAuthenticated ? 'Return to Workspace' : 'Return to Login'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              fontWeight: 600,
              borderColor: '#d1d5db',
              color: '#0f172a',
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#9ca3af' },
            }}
          >
            Go Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
