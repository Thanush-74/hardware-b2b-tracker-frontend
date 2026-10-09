import React from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/**
 * Authentication & RBAC Session Diagnostics Inspector
 */
const SessionDebugPage = () => {
  const { user, role, screens, permissions, logout } = useAuth();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          maxWidth: 620,
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Chip
            label="✓ Authentication & RBAC Synced"
            size="small"
            sx={{
              fontWeight: 600,
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          />
          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
            SESSION STATUS: ACTIVE
          </Typography>
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
          TITAN<Box component="span" sx={{ color: '#2563eb' }}>CORE</Box>
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.08em', display: 'block', mb: 3 }}>
          B2B HARDWARE TRACKER • SESSION DIAGNOSTICS
        </Typography>

        <Box
          sx={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 1.5,
            p: 2.5,
            mb: 3,
          }}
        >
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>User:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Email:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0f172a' }}>
                {user?.email}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Role:</Typography>
              <Chip
                label={role?.name || role?.slug || 'Staff'}
                size="small"
                sx={{
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Backend Permissions:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {permissions?.length || 0} granted
              </Typography>
            </Box>
            <Box sx={{ pt: 1, borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
                ACCESSIBLE SCREENS FROM BACKEND ({screens?.length || 0}):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {screens && screens.length > 0 ? (
                  screens.map((screen) => (
                    <Chip
                      key={screen.id || screen.slug}
                      label={`${screen.name} (${screen.route})`}
                      size="small"
                      sx={{
                        fontSize: '0.75rem',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: '#d97706' }}>
                    No accessible screens granted by backend.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={() => logout(true)}
          sx={{
            py: 1.2,
            fontWeight: 600,
            backgroundColor: '#2563eb',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          }}
        >
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
};

export default SessionDebugPage;
