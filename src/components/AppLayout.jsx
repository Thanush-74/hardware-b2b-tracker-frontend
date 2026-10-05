import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import {
  DashboardIcon,
  OrdersIcon,
  ProductionIcon,
  InventoryIcon,
  ReturnsIcon,
  DeliveriesIcon,
  ProductsIcon,
  ManufacturingIcon,
  InspectionIcon,
  StaffIcon,
  ExpensesIcon,
  RolesIcon,
  MenuIcon,
  LogoutIcon,
  SearchIcon,
  NotificationsIcon,
} from './Icons';

const DRAWER_WIDTH = 260;

const AppLayout = () => {
  const { user, role, screens, logout, hasScreen, hasScreenRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    setUserMenuAnchor(null);
    logout();
    navigate('/login', { replace: true });
  };

  const isAdmin = role?.slug === 'admin' || !role; // Default to admin access if role isn't restricted

  // Check if a specific screen/route is accessible for this user
  const isItemPermitted = (item) => {
    if (item.adminOnly) {
      return isAdmin;
    }
    if (isAdmin) {
      return true;
    }
    return hasScreen(item.slug) || hasScreenRoute(item.route);
  };

  // Structured Information Architecture for Manufacturing & B2B Operations
  const navigationGroups = [
    {
      groupTitle: 'MAIN',
      items: [
        {
          name: 'Dashboard',
          route: '/dashboard',
          slug: 'dashboard',
          icon: <DashboardIcon fontSize="small" />,
        },
      ],
    },
    {
      groupTitle: 'OPERATIONS',
      items: [
        {
          name: 'Orders',
          route: '/orders',
          slug: 'orders',
          icon: <OrdersIcon fontSize="small" />,
        },
        {
          name: 'Production',
          route: '/production',
          slug: 'production',
          icon: <ProductionIcon fontSize="small" />,
        },
        {
          name: 'Inventory',
          route: '/inventory',
          slug: 'inventory',
          icon: <InventoryIcon fontSize="small" />,
        },
        {
          name: 'Returns & Replacement',
          route: '/returns',
          slug: 'returns',
          icon: <ReturnsIcon fontSize="small" />,
        },
        {
          name: 'Deliveries',
          route: '/deliveries',
          slug: 'deliveries',
          icon: <DeliveriesIcon fontSize="small" />,
        },
      ],
    },
    {
      groupTitle: 'MASTER DATA',
      items: [
        {
          name: 'Products Catalog',
          route: '/products',
          slug: 'products',
          icon: <ProductsIcon fontSize="small" />,
        },
        {
          name: 'Manufacturing Area',
          route: '/manufacturing',
          slug: 'manufacturing',
          icon: <ManufacturingIcon fontSize="small" />,
        },
        {
          name: 'Quality Inspection',
          route: '/inspection',
          slug: 'inspection',
          icon: <InspectionIcon fontSize="small" />,
        },
      ],
    },
    {
      groupTitle: 'MANAGEMENT',
      items: [
        {
          name: 'Staff Management',
          route: '/staff',
          slug: 'staff',
          icon: <StaffIcon fontSize="small" />,
        },
        {
          name: 'Expenses & Financials',
          route: '/expenses',
          slug: 'expenses',
          icon: <ExpensesIcon fontSize="small" />,
        },
      ],
    },
    {
      groupTitle: 'SYSTEM',
      items: [
        {
          name: 'Role Permissions',
          route: '/roles',
          slug: 'roles',
          icon: <RolesIcon fontSize="small" />,
          adminOnly: true,
        },
      ],
    },
  ];

  // Drawer Content
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', color: '#0f172a' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em' }}>
            DX
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#0f172a' }}>
            DEXWOX <Box component="span" sx={{ color: '#2563eb', fontWeight: 600 }}>/ TITANCORE</Box>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', fontSize: '0.68rem', display: 'block' }}>
            HARDWARE B2B TRACKER
          </Typography>
        </Box>
      </Box>

      {/* Categorized Navigation Menu with sleek transparent scrollbar */}
      <Box
        className="sidebar-scroll"
        sx={{
          flexGrow: 1,
          flexShrink: 1,
          py: 2,
          px: 1.5,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
          '&:hover': {
            scrollbarColor: 'rgba(15, 23, 42, 0.16) transparent',
          },
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            borderRadius: '9999px',
            transition: 'background-color 0.2s ease',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(15, 23, 42, 0.16)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.28)',
          },
          '&::-webkit-scrollbar-button': {
            display: 'none',
            width: 0,
            height: 0,
          },
        }}
      >
        {navigationGroups.map((group, groupIdx) => {
          // Filter items based on access permissions
          const permittedItems = group.items.filter(isItemPermitted);

          if (permittedItems.length === 0) {
            return null;
          }

          return (
            <Box key={group.groupTitle} sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  display: 'block',
                  color: '#94a3b8',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                }}
              >
                {group.groupTitle}
              </Typography>

              <List disablePadding sx={{ pt: 0.5 }}>
                {permittedItems.map((item) => {
                  const isSelected =
                    item.route === '/dashboard'
                      ? location.pathname === '/dashboard' || location.pathname === '/'
                      : location.pathname === item.route;

                  return (
                    <ListItem key={item.route} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavigation(item.route)}
                        selected={isSelected}
                        sx={{
                          borderRadius: 1.5,
                          py: 0.9,
                          px: 1.5,
                          transition: 'all 0.15s ease',
                          color: '#475569',
                          '& .MuiListItemIcon-root': {
                            color: '#64748b',
                            minWidth: 32,
                            transition: 'color 0.15s ease',
                          },
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                            color: '#0f172a',
                            '& .MuiListItemIcon-root': {
                              color: '#2563eb',
                            },
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: '#e0edff',
                            },
                            '& .MuiListItemIcon-root': {
                              color: '#2563eb',
                            },
                          },
                        }}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          primaryTypographyProps={{
                            fontSize: '0.84rem',
                            fontWeight: isSelected ? 600 : 500,
                            color: 'inherit',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>

              {groupIdx < navigationGroups.length - 1 && (
                <Divider sx={{ mt: 1.5, borderColor: '#f1f5f9' }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* User Info & Quick Sign Out Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', flexShrink: 0 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'R'}
          </Avatar>
          <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, noWrap: true, color: '#0f172a', fontSize: '0.82rem' }}>
              {user?.first_name && user.first_name.toLowerCase() !== 'admin'
                ? `${user.first_name} ${user.last_name || ''}`
                : 'Admin (rohin)'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block', noWrap: true }}>
              {user?.email || 'admin@company.com'}
            </Typography>
          </Box>
          <Chip
            label={role?.name || 'Admin'}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 700,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
            }}
          />
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={handleLogout}
          startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderColor: '#e2e8f0',
            color: '#475569',
            backgroundColor: '#ffffff',
            py: 0.7,
            fontSize: '0.78rem',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#ef4444',
              color: '#ef4444',
              backgroundColor: '#fef2f2',
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Top App Bar Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px', px: { xs: 2, sm: 3 } }}>
          {/* Left: Mobile Toggle & Context */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 0.5, color: '#0f172a' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                DEXWOX <Box component="span" sx={{ color: '#2563eb' }}>Operations</Box>
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: { xs: 'none', sm: 'block' } }}>
                Hardware Assembly & B2B Tracker
              </Typography>
            </Box>
          </Stack>

          {/* Center: Global Search Bar */}
          <Box sx={{ flexGrow: 1, maxWidth: 420, mx: { xs: 1, sm: 3 }, display: { xs: 'none', sm: 'block' } }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search orders, products, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                sx: {
                  height: 38,
                  fontSize: '0.85rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: 1.5,
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                  },
                },
              }}
            />
          </Box>

          {/* Right: Notifications, Profile, Dropdown */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Notifications Button */}
            <IconButton
              size="small"
              sx={{
                color: '#64748b',
                p: 0.8,
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                },
              }}
            >
              <Badge badgeContent={4} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                <NotificationsIcon sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>

            {/* User Profile Trigger */}
            <Box
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                p: 0.5,
                pr: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                }}
              >
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'R'}
              </Avatar>

              <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: '0.84rem' }}>
                  Admin (rohin)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  {role?.name || 'Administrator'}
                </Typography>
              </Box>
            </Box>

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1,
                  minWidth: 190,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Admin (rohin)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {user?.email || 'admin@company.com'}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/dashboard'); }} sx={{ fontSize: '0.85rem' }}>
                Operations Dashboard
              </MenuItem>
              {isAdmin && (
                <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/roles'); }} sx={{ fontSize: '0.85rem' }}>
                  Role Management
                </MenuItem>
              )}
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout} sx={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
                Sign Out
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="operations navigation"
      >
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
                backgroundColor: '#ffffff',
                borderRight: '1px solid #e5e7eb',
                overflow: 'hidden',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                backgroundColor: '#ffffff',
                borderRight: '1px solid #e5e7eb',
                overflow: 'hidden',
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
          p: { xs: 2, sm: 3, md: 3.5 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)`, xs: '100%' },
          maxWidth: { md: `calc(100% - ${DRAWER_WIDTH}px)`, xs: '100%' },
          minWidth: 0,
          overflowX: 'hidden',
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
