import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PublicRoute, ScreenRoute, AdminRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import muiTheme from './theme/muiTheme';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Minimal Post-Login Authentication Confirmation using MUI
 */
const AuthenticatedSessionView = () => {
  const { user, role, screens, permissions, logout } = useAuth();

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
          maxWidth: 580,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Chip
          label="✓ Authentication & RBAC Synced"
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
            p: 2.5,
            mb: 3,
            textAlign: 'left',
          }}
        >
          <Stack spacing={1.5}>
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
                label={role?.name || role?.slug || 'Staff'}
                size="small"
                sx={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'primary.light',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Backend Permissions:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {permissions?.length || 0} granted
              </Typography>
            </Box>
            <Box sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                ACCESSIBLE SCREENS FROM BACKEND ({screens?.length || 0}):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {screens && screens.length > 0 ? (
                  screens.map((screen) => (
                    <Chip
                      key={screen.id || screen.slug}
                      label={`${screen.name} (${screen.route})`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.75rem',
                        borderColor: 'rgba(245, 158, 11, 0.3)',
                        color: 'text.primary',
                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: 'warning.main' }}>
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

import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import RoleManagementPage from './pages/RoleManagementPage';
import StaffManagementPage from './pages/StaffManagementPage';
import ProductManagementPage from './pages/ProductManagementPage';
import InventoryManagementPage from './pages/InventoryManagementPage';
import CartManagementPage from './pages/CartManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import DeliveryManagementPage from './pages/DeliveryManagementPage';
import ProductionManagementPage from './pages/ProductionManagementPage';
import ManufacturingManagementPage from './pages/ManufacturingManagementPage';
import ReturnsManagementPage from './pages/ReturnsManagementPage';
import ExpenseManagementPage from './pages/ExpenseManagementPage';
import InspectionManagementPage from './pages/InspectionManagementPage';
import BusinessModulePage from './pages/BusinessModulePage';

// Handles redirecting / to user's first accessible screen or /dashboard
const RootRedirect = () => {
  const { getDefaultRoute } = useAuth();
  return <Navigate to={getDefaultRoute()} replace />;
};

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
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

              {/* Authenticated Protected Layout with Dynamic Navigation */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Root redirects to the default accessible route (e.g. /dashboard) */}
                <Route path="/" element={<RootRedirect />} />
                <Route
                  path="/dashboard"
                  element={
                    <ScreenRoute screenSlug="dashboard">
                      <DashboardPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/staff"
                  element={
                    <ScreenRoute screenSlug="staff">
                      <StaffManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ScreenRoute screenSlug="products">
                      <ProductManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ScreenRoute screenSlug="inventory">
                      <InventoryManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ScreenRoute screenSlug="orders">
                      <OrderManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/deliveries"
                  element={
                    <ScreenRoute screenSlug="deliveries">
                      <DeliveryManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ScreenRoute screenSlug="cart">
                      <CartManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/production"
                  element={
                    <ScreenRoute screenSlug="production">
                      <ProductionManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/returns"
                  element={
                    <ScreenRoute screenSlug="returns">
                      <ReturnsManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/manufacturing"
                  element={
                    <ScreenRoute screenSlug="manufacturing">
                      <ManufacturingManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ScreenRoute screenSlug="expenses">
                      <ExpenseManagementPage />
                    </ScreenRoute>
                  }
                />
                <Route
                  path="/inspection"
                  element={
                    <ScreenRoute screenSlug="inspection">
                      <InspectionManagementPage />
                    </ScreenRoute>
                  }
                />
                {/* Admin Role Management protected by AdminRoute */}
                <Route
                  path="/roles"
                  element={
                    <AdminRoute>
                      <RoleManagementPage />
                    </AdminRoute>
                  }
                />
                <Route path="/session-debug" element={<AuthenticatedSessionView />} />
              </Route>

              {/* Catch-all redirects to / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;