import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

// Theme & Global Context
import muiTheme from './theme/muiTheme';
import { AuthProvider, useAuth } from './context/AuthContext';

// Route Guards & Layout
import { ProtectedRoute, PublicRoute, ScreenRoute, AdminRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';

// Eagerly loaded public & essential pages
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy-loaded management module screens for optimal performance & code-splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StaffManagementPage = lazy(() => import('./pages/StaffManagementPage'));
const ProductManagementPage = lazy(() => import('./pages/ProductManagementPage'));
const InventoryManagementPage = lazy(() => import('./pages/InventoryManagementPage'));
const CartManagementPage = lazy(() => import('./pages/CartManagementPage'));
const OrderManagementPage = lazy(() => import('./pages/OrderManagementPage'));
const DeliveryManagementPage = lazy(() => import('./pages/DeliveryManagementPage'));
const ProductionManagementPage = lazy(() => import('./pages/ProductionManagementPage'));
const ManufacturingManagementPage = lazy(() => import('./pages/ManufacturingManagementPage'));
const ReturnsManagementPage = lazy(() => import('./pages/ReturnsManagementPage'));
const ExpenseManagementPage = lazy(() => import('./pages/ExpenseManagementPage'));
const InspectionManagementPage = lazy(() => import('./pages/InspectionManagementPage'));
const RoleManagementPage = lazy(() => import('./pages/RoleManagementPage'));
const SessionDebugPage = lazy(() => import('./pages/SessionDebugPage'));

/**
 * Intelligent Dynamic Root Redirect
 * Routes authenticated users to their highest-priority authorized screen,
 * or safely defaults to /dashboard.
 */
const RootRedirect = () => {
  const { getDefaultRoute } = useAuth();
  const targetRoute = getDefaultRoute() || '/dashboard';
  return <Navigate to={targetRoute} replace />;
};

/**
 * Enterprise Application Root Component
 */
function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader message="Loading module..." />}>
              <Routes>
                {/* Public Authentication Route */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />

                {/* Authenticated Workspace & Navigation Shell */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Intelligent Root Landing Redirect */}
                  <Route path="/" element={<RootRedirect />} />

                  {/* Core Management Screens (RBAC Protected via ScreenRoute) */}
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
                    path="/cart"
                    element={
                      <ScreenRoute screenSlug="cart">
                        <CartManagementPage />
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
                    path="/production"
                    element={
                      <ScreenRoute screenSlug="production">
                        <ProductionManagementPage />
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
                    path="/returns"
                    element={
                      <ScreenRoute screenSlug="returns">
                        <ReturnsManagementPage />
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

                  {/* Administrative Configuration Routes */}
                  <Route
                    path="/roles"
                    element={
                      <AdminRoute>
                        <RoleManagementPage />
                      </AdminRoute>
                    }
                  />

                  {/* Diagnostics & RBAC Debugging */}
                  <Route path="/session-debug" element={<SessionDebugPage />} />

                  {/* 404 Catch-All within Authenticated Portal Shell */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Global Fallback Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;