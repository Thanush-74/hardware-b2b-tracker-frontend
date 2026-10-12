// App.jsx — Root application file
// Defines all routes and wraps authenticated routes with the Layout shell

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Pages
import Login from './login/Login';
import Dashboard from './dashboard/Dashboard';
import ProductsPage from './products/ProductsPage';
import CartPage from './cart/CartPage';
import InventoryPage from './inventory/InventoryPage';
import ManufacturingPage from './manufacturing/ManufacturingPage';
import OrdersPage from './orders/OrdersPage';
import ProductionPage from './production/ProductionPage';
import DeliveriesPage from './deliveries/DeliveriesPage';
import ReturnsPage from './returnandreplacement/ReturnsPage';
import StaffPage from './staff/StaffPage';
import RolesPage from './roles/RolesPage';
import ExpensesPage from './expenses/ExpensesPage';
import InspectionsPage from './inspections/InspectionsPage';
import NotificationsPage from './notifications/NotificationsPage';
import SearchPage from './search/SearchPage';

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider wraps everything so all pages have access to auth state */}
      <AuthProvider>
        <Routes>
          {/* Public route — no auth required */}
          <Route path="/login" element={<Login />} />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* All authenticated routes share the Layout (sidebar + topbar) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute requiredPermission="products.view">
                <Layout>
                  <ProductsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredPermission="cart.view">
                <Layout>
                  <CartPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute requiredPermission="inventory.view">
                <Layout>
                  <InventoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manufacturing"
            element={
              <ProtectedRoute requiredPermission="manufacturing.view">
                <Layout>
                  <ManufacturingPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute requiredPermission="orders.view">
                <Layout>
                  <OrdersPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/production"
            element={
              <ProtectedRoute requiredPermission="production.view">
                <Layout>
                  <ProductionPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/deliveries"
            element={
              <ProtectedRoute requiredPermission="deliveries.view">
                <Layout>
                  <DeliveriesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/returns"
            element={
              <ProtectedRoute requiredPermission="returns.view">
                <Layout>
                  <ReturnsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute requiredPermission="staff.view">
                <Layout>
                  <StaffPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredPermission="roles.view">
                <Layout>
                  <RolesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <ProtectedRoute requiredPermission="expenses.view">
                <Layout>
                  <ExpensesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspections"
            element={
              <ProtectedRoute requiredPermission="inspection.view">
                <Layout>
                  <InspectionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotificationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Layout>
                  <SearchPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect unknown URLs to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
