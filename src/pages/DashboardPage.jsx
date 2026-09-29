import React from 'react';
import { Box, Typography, Grid, Paper, Stack, Chip, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getScreenIcon } from '../components/Icons';

const DashboardPage = () => {
  const { user, role, screens } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Welcome, {user?.first_name || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Hardware B2B Tracker • Role: <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>{role?.name || role?.slug || 'Staff'}</Box>
            </Typography>
          </Box>
          <Chip
            label={`${screens?.length || 0} Modules Accessible`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, borderColor: 'primary.main' }}
          />
        </Stack>
      </Box>

      {/* Accessible Quick Access Modules */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Permitted Operational Modules
      </Typography>

      <Grid container spacing={2.5}>
        {screens && screens.length > 0 ? (
          screens.map((screen) => (
            <Grid item xs={12} sm={6} md={4} key={screen.id || screen.slug}>
              <Paper
                elevation={2}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  backgroundColor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getScreenIcon(screen.slug, { fontSize: 'medium' })}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {screen.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                      {screen.route}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(screen.route)}
                  sx={{
                    alignSelf: 'flex-start',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    },
                  }}
                >
                  Open {screen.name} →
                </Button>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No accessible screens found for your account. Please contact an administrator.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
