import React from 'react';
import { Box, Paper, Typography, Button, Stack, Chip, SvgIcon } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShieldLockIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.5 1.1 2.5 2.5V11c.6 0 1 .4 1 1v4c0 .6-.4 1-1 1h-5c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1V9.5C9.5 8.1 10.6 7 12 7zm0 1.5c-.6 0-1 .4-1 1V11h2V9.5c0-.6-.4-1-1-1z" />
  </SvgIcon>
);

const AccessDeniedPage = ({ requestedPath, message }) => {
  const navigate = useNavigate();
  const { user, role, getDefaultRoute } = useAuth();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          backgroundColor: 'background.paper',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          boxShadow: '0 8px 32px rgba(244, 63, 94, 0.08)',
        }}
      >
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            color: '#fb7185',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <ShieldLockIcon sx={{ fontSize: 32 }} />
        </Box>

        <Chip
          label="403 FORBIDDEN"
          size="small"
          sx={{
            display: 'block',
            width: 'fit-content',
            mx: 'auto',
            mb: 1.5,
            fontWeight: 800,
            fontSize: '0.72rem',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            color: '#fb7185',
            border: '1px solid rgba(244, 63, 94, 0.3)',
          }}
        />

        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
          Access Restricted
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
          {message || (
            <>
              Your assigned role (<strong>{role?.name || role?.slug || 'Staff'}</strong>) does not have access permissions for{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', color: 'primary.light', px: 0.5 }}>
                {requestedPath || 'this screen'}
              </Box>
              . Screen access is determined strictly by your backend role permissions.
            </>
          )}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(getDefaultRoute())}
            sx={{ fontWeight: 700, px: 3 }}
          >
            Return to Allowed Area
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ fontWeight: 600, borderColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            Go Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AccessDeniedPage;
