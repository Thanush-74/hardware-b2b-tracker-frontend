import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getScreenIcon, MenuIcon, LogoutIcon, RolesIcon } from './Icons';

const DRAWER_WIDTH = 260;

const AppLayout = () => {
  const { user, role, screens, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (route) => {
    navigate(route);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Drawer Content
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'background.paper' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 900, color: '#0b0f19' }}>
            TC
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            TITAN<Box component="span" sx={{ color: 'primary.main' }}>CORE</Box>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.06em', fontSize: '0.68rem' }}>
            HARDWARE B2B
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Dynamic Navigation Menu derived from backend accessible screens */}
      <Box sx={{ flexGrow: 1, py: 1.5, px: 1, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 0.5,
            display: 'block',
            color: 'text.secondary',
            fontWeight: 700,
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
          }}
        >
          Accessible Modules ({screens?.length || 0})
        </Typography>

        <List sx={{ pt: 0.5 }}>
          {screens && screens.length > 0 ? (
            screens.map((screen) => {
              const isSelected = location.pathname === screen.route;
              return (
                <ListItem key={screen.id || screen.slug} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(screen.route)}
                    selected={isSelected}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      px: 2,
                      transition: 'all 0.15s ease',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        borderLeft: '3px solid #f59e0b',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(245, 158, 11, 0.18)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isSelected ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {getScreenIcon(screen.slug, { fontSize: 'small' })}
                    </ListItemIcon>
                    <ListItemText
                      primary={screen.name}
                      primaryTypographyProps={{
                        fontSize: '0.88rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'primary.main' : 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                No accessible screens assigned by administrator.
              </Typography>
            </Box>
          )}

          {/* Admin Role Management Link (Shown for Administrator) */}
          {role?.slug === 'admin' && (
            <>
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 0.5,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                }}
              >
                Administration
              </Typography>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation('/roles')}
                  selected={location.pathname === '/roles'}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      borderLeft: '3px solid #f59e0b',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                    },
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: location.pathname === '/roles' ? 'primary.main' : 'text.secondary' }}>
                    <RolesIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role Management"
                    primaryTypographyProps={{
                      fontSize: '0.88rem',
                      fontWeight: location.pathname === '/roles' ? 700 : 500,
                      color: location.pathname === '/roles' ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Box>

      {/* User Info & Logout Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              color: '#0b0f19',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, noWrap: true, color: 'text.primary' }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Chip
              label={role?.name || role?.slug || 'Staff'}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'primary.light',
              }}
            />
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          size="small"
          onClick={handleLogout}
          startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.15)',
            color: 'text.secondary',
            py: 0.8,
            fontSize: '0.78rem',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Hardware B2B Tracker
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={role?.name || 'Staff'}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'primary.light',
              }}
            />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="accessible modules"
      >
        {/* Mobile Temporary Drawer */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          /* Desktop Permanent Drawer */
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
