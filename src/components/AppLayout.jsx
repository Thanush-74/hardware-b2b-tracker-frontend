import React, { useState, useEffect } from 'react';
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
  Popover,
  CircularProgress,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { notificationService, searchService } from '../services/businessService';
import {
  DashboardIcon,
  OrdersIcon,
  CartIcon,
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
  CloseIcon,
} from './Icons';


const DRAWER_WIDTH = 260;

const getNotificationRoute = (type) => {
  switch (type) {
    case 'order_created':
    case 'order_status':
    case 'payment_status':
      return '/orders';
    case 'low_stock':
      return '/inventory';
    case 'delivery_status':
      return '/deliveries';
    case 'product_return':
      return '/returns';
    case 'inspection_result':
      return '/inspection';
    case 'production_completed':
      return '/production';
    default:
      return null;
  }
};

const formatNotificationTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
};

const AppLayout = () => {
  const { user, role, screens, logout, hasScreen, hasScreenRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      setIsSearching(false);
      setSearchError(null);
      setSearchDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchDropdownOpen(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const data = await searchService.search(query);
        setSearchResults(data || {
          products: [],
          staff: [],
          orders: [],
          deliveries: [],
          returns: [],
          inventory: [],
        });
      } catch (err) {
        console.error('Search API request failed:', err);
        setSearchError('Unable to search right now.');
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearching(false);
    setSearchError(null);
    setSearchDropdownOpen(false);
  };

  const handleSelectSearchResult = (route) => {
    setSearchDropdownOpen(false);
    if (route) {
      navigate(route);
    }
  };

  const totalResults = searchResults
    ? (searchResults.products?.length || 0) +
    (searchResults.orders?.length || 0) +
    (searchResults.staff?.length || 0) +
    (searchResults.deliveries?.length || 0) +
    (searchResults.returns?.length || 0) +
    (searchResults.inventory?.length || 0)
    : 0;

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(typeof data?.count === 'number' ? data.count : 0);
    } catch (err) {
      console.error('Failed to fetch unread notification count:', err);
    }
  };


  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenNotifications = async (event) => {
    setNotificationAnchor(event.currentTarget);
    setIsLoadingNotifications(true);
    try {
      const data = await notificationService.getAll({ limit: 20 });
      const list = Array.isArray(data) ? data : data?.notifications || [];
      setNotifications(list);
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAsRead = async (notification) => {
    try {
      if (!notification.is_read) {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }

    const targetRoute = getNotificationRoute(notification.type);
    handleCloseNotifications();
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

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
          name: 'Cart',
          route: '/cart',
          slug: 'cart',
          icon: <CartIcon fontSize="small" />,
        },
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
            HB
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em', color: '#0f172a' }}>
            HARDWARE
            <Box component="span" sx={{ color: '#2563eb', fontWeight: 600 }}>/ B2B TRACKER</Box>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', fontSize: '0.68rem', display: 'block' }}>
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
        <Toolbar sx={{ justifyContent: 'start', minHeight: '64px', px: { xs: 2, sm: 3 } }}>
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
            {/* <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                DEXWOX <Box component="span" sx={{ color: '#2563eb' }}>Operations</Box>
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: { xs: 'none', sm: 'block' } }}>
                Hardware Assembly & B2B Tracker
              </Typography>
            </Box> */}
          </Stack>

          {/* Center: Global Search Bar */}
          <Box
            sx={{
              flexGrow: 1,
              maxWidth: 460,
              mx: { xs: 1, sm: 3 },
              position: 'relative',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <ClickAwayListener onClickAway={() => setSearchDropdownOpen(false)}>
              <Box sx={{ width: '100%' }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search orders, products, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) {
                      setSearchDropdownOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchDropdownOpen(false);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {isSearching ? (
                          <CircularProgress size={16} sx={{ color: '#2563eb' }} />
                        ) : searchQuery.trim().length > 0 ? (
                          <IconButton
                            size="small"
                            onClick={handleClearSearch}
                            edge="end"
                            sx={{ p: 0.5, color: '#94a3b8', '&:hover': { color: '#0f172a' } }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        ) : null}
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

                {/* Search Results Dropdown */}
                {searchDropdownOpen && searchQuery.trim().length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      mt: 1,
                      maxHeight: 460,
                      overflowY: 'auto',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 2,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                      zIndex: 1300,
                    }}
                  >
                    {isSearching ? (
                      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <CircularProgress size={18} sx={{ color: '#2563eb' }} />
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                          Searching...
                        </Typography>
                      </Box>
                    ) : searchError ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                          {searchError}
                        </Typography>
                      </Box>
                    ) : totalResults === 0 ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                          No results found
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ py: 1 }}>
                        {/* Products Section */}
                        {searchResults?.products?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ px: 2, py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                                Products
                              </Typography>
                              <Chip label={searchResults.products.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }} />
                            </Box>
                            <List disablePadding>
                              {searchResults.products.map((item) => (
                                <ListItemButton
                                  key={`prod-${item.id}`}
                                  onClick={() => handleSelectSearchResult(item.route || '/products')}
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    '&:hover': { backgroundColor: '#f1f5f9' },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32, color: '#2563eb' }}>
                                    <ProductsIcon sx={{ fontSize: 18 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                                        {item.name || item.title}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.2 }}>
                                        {item.type && (
                                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                            {item.type}
                                          </Typography>
                                        )}
                                        <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.72rem' }}>
                                          ₹{Number(item.price || 0).toLocaleString()}
                                        </Typography>
                                        {item.available_quantity !== undefined && (
                                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                            Stock: {item.available_quantity}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Orders Section */}
                        {searchResults?.orders?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ px: 2, py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                                Orders
                              </Typography>
                              <Chip label={searchResults.orders.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }} />
                            </Box>
                            <List disablePadding>
                              {searchResults.orders.map((item) => (
                                <ListItemButton
                                  key={`ord-${item.id}`}
                                  onClick={() => handleSelectSearchResult(item.route || '/orders')}
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    '&:hover': { backgroundColor: '#f1f5f9' },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32, color: '#2563eb' }}>
                                    <OrdersIcon sx={{ fontSize: 18 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                                        {item.order_number || item.title}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.2 }}>
                                        {item.customer_name && (
                                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                            {item.customer_name}
                                          </Typography>
                                        )}
                                        {item.total_amount !== undefined && (
                                          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.72rem' }}>
                                            ₹{Number(item.total_amount).toLocaleString()}
                                          </Typography>
                                        )}
                                        {item.order_status && (
                                          <Chip
                                            label={item.order_status}
                                            size="small"
                                            sx={{ height: 16, fontSize: '0.62rem', fontWeight: 600 }}
                                          />
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Staff Section */}
                        {searchResults?.staff?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ px: 2, py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                                Staff
                              </Typography>
                              <Chip label={searchResults.staff.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }} />
                            </Box>
                            <List disablePadding>
                              {searchResults.staff.map((item) => (
                                <ListItemButton
                                  key={`staff-${item.id}`}
                                  onClick={() => handleSelectSearchResult(item.route || '/staff')}
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    '&:hover': { backgroundColor: '#f1f5f9' },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32, color: '#2563eb' }}>
                                    <StaffIcon sx={{ fontSize: 18 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                                        {item.name || item.title}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.2 }}>
                                        {item.email && (
                                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                            {item.email}
                                          </Typography>
                                        )}
                                        {item.role && (
                                          <Chip
                                            label={item.role}
                                            size="small"
                                            sx={{ height: 16, fontSize: '0.62rem', fontWeight: 600, backgroundColor: '#f1f5f9' }}
                                          />
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Deliveries Section */}
                        {searchResults?.deliveries?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ px: 2, py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                                Deliveries
                              </Typography>
                              <Chip label={searchResults.deliveries.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }} />
                            </Box>
                            <List disablePadding>
                              {searchResults.deliveries.map((item) => (
                                <ListItemButton
                                  key={`del-${item.id}`}
                                  onClick={() => handleSelectSearchResult(item.route || '/deliveries')}
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    '&:hover': { backgroundColor: '#f1f5f9' },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32, color: '#2563eb' }}>
                                    <DeliveriesIcon sx={{ fontSize: 18 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                                        {item.title || item.delivery_number}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.2 }}>
                                        {item.recipient_name && (
                                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                            Recipient: {item.recipient_name}
                                          </Typography>
                                        )}
                                        {item.status && (
                                          <Chip
                                            label={item.status}
                                            size="small"
                                            sx={{ height: 16, fontSize: '0.62rem', fontWeight: 600 }}
                                          />
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Returns Section */}
                        {searchResults?.returns?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ px: 2, py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                                Returns
                              </Typography>
                              <Chip label={searchResults.returns.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }} />
                            </Box>
                            <List disablePadding>
                              {searchResults.returns.map((item) => (
                                <ListItemButton
                                  key={`ret-${item.id}`}
                                  onClick={() => handleSelectSearchResult(item.route || '/returns')}
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    '&:hover': { backgroundColor: '#f1f5f9' },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32, color: '#2563eb' }}>
                                    <ReturnsIcon sx={{ fontSize: 18 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                                        {item.title || item.return_number}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.2 }}>
                                        {item.reason && (
                                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                            Reason: {item.reason}
                                          </Typography>
                                        )}
                                        {item.status && (
                                          <Chip
                                            label={item.status}
                                            size="small"
                                            sx={{ height: 16, fontSize: '0.62rem', fontWeight: 600 }}
                                          />
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Inventory Section */}
                        {searchResults?.inventory?.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ px: 2, py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                                Inventory
                              </Typography>
                              <Chip label={searchResults.inventory.length} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb' }} />
                            </Box>
                            <List disablePadding>
                              {searchResults.inventory.map((item) => (
                                <ListItemButton
                                  key={`inv-${item.id}`}
                                  onClick={() => handleSelectSearchResult(item.route || '/inventory')}
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    '&:hover': { backgroundColor: '#f1f5f9' },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32, color: '#2563eb' }}>
                                    <InventoryIcon sx={{ fontSize: 18 }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                                        {item.title || item.product_name}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.2 }}>
                                        {item.location && (
                                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                            Location: {item.location}
                                          </Typography>
                                        )}
                                        {item.quantity !== undefined && (
                                          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.72rem' }}>
                                            Qty: {item.quantity}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>
          </Box>

          {/* Right: Notifications, Profile, Dropdown */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 'auto' }}>
            {/* Notifications Button */}
            <IconButton
              size="small"
              onClick={handleOpenNotifications}
              aria-label="notifications"
              sx={{
                color: '#64748b',
                p: 0.8,
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                backgroundColor: Boolean(notificationAnchor) ? '#f1f5f9' : '#ffffff',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                invisible={unreadCount === 0}
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16, fontWeight: 700 } }}
              >
                <NotificationsIcon sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>

            {/* Notifications Popover */}
            <Popover
              open={Boolean(notificationAnchor)}
              anchorEl={notificationAnchor}
              onClose={handleCloseNotifications}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1.5,
                  width: { xs: 320, sm: 380 },
                  maxHeight: 480,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
            >
              {/* Notification Popover Header */}
              <Box sx={{ p: 2, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip
                      label={`${unreadCount} new`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                      }}
                    />
                  )}
                </Box>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={handleMarkAllAsRead}
                    sx={{
                      fontSize: '0.75rem',
                      textTransform: 'none',
                      color: '#2563eb',
                      p: 0,
                      minWidth: 0,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Mark all as read
                  </Button>
                )}
              </Box>

              {/* Notification List Body */}
              <Box sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: 380 }}>
                {isLoadingNotifications ? (
                  <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ color: '#2563eb' }} />
                  </Box>
                ) : notifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      No notifications at this time
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {notifications.map((notif, index) => {
                      const isUnread = !notif.is_read;
                      return (
                        <React.Fragment key={notif.id || index}>
                          <ListItemButton
                            onClick={() => handleMarkAsRead(notif)}
                            sx={{
                              py: 1.5,
                              px: 2,
                              backgroundColor: isUnread ? '#f8fafc' : '#ffffff',
                              borderLeft: isUnread ? '3px solid #2563eb' : '3px solid transparent',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                backgroundColor: isUnread ? '#f1f5f9' : '#f8fafc',
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: isUnread ? 700 : 500,
                                      color: '#0f172a',
                                      fontSize: '0.84rem',
                                    }}
                                  >
                                    {notif.title}
                                  </Typography>
                                  {isUnread && (
                                    <Box
                                      sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: '#2563eb',
                                        flexShrink: 0,
                                        ml: 1,
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box component="span" sx={{ display: 'block' }}>
                                  <Typography
                                    variant="caption"
                                    component="span"
                                    sx={{
                                      color: '#475569',
                                      fontSize: '0.78rem',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {notif.message}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    component="span"
                                    sx={{
                                      display: 'block',
                                      color: '#94a3b8',
                                      fontSize: '0.7rem',
                                      mt: 0.5,
                                    }}
                                  >
                                    {formatNotificationTime(notif.created_at)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItemButton>
                          {index < notifications.length - 1 && <Divider component="li" sx={{ borderColor: '#f1f5f9' }} />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Popover>

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

              <Box sx={{ justifyContent: 'space-evenly', textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: '0.84rem' }}>
                  Admin (RS)
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
