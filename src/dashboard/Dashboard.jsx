// Dashboard.jsx — Main dashboard overview page
// Pulls key summary numbers from several API endpoints and displays them as stat cards

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllOrders } from '../services/orderService';
import { getAllInventory } from '../services/inventoryService';
import { getAllProduction } from '../services/productionService';
import { getExpenseSummary } from '../services/expenseService';
import { getNotifications } from '../services/notificationService';
import { getInspectionSummary } from '../services/inspectionService';

function Dashboard() {
  const { user, hasPermission } = useAuth();

  // Each section of the dashboard has its own loading/data/error state
  const [orders, setOrders] = useState({ count: 0, loading: true });
  const [inventory, setInventory] = useState({ lowStock: 0, loading: true });
  const [production, setProduction] = useState({ active: 0, loading: true });
  const [financials, setFinancials] = useState({ income: 0, expense: 0, loading: true });
  const [inspections, setInspections] = useState({ total: 0, approved: 0, loading: true });
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Fetch all dashboard data when the component first loads
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    // Orders summary
    if (hasPermission('orders.view')) {
      try {
        const result = await getAllOrders({ limit: 1 });
        // Try to get total count from the response
        const total = result.data?.total || result.data?.count || 0;
        setOrders({ count: total, loading: false });
      } catch {
        setOrders({ count: '-', loading: false });
      }
    } else {
      setOrders({ count: 'N/A', loading: false });
    }

    // Inventory — find items with low stock (available stock <= 10)
    if (hasPermission('inventory.view')) {
      try {
        const result = await getAllInventory();
        const items = result.data?.inventory || (Array.isArray(result.data) ? result.data : []);
        const lowStockCount =
          typeof result.data?.low_stock_count === 'number'
            ? result.data.low_stock_count
            : Array.isArray(items)
              ? items.filter((item) => {
                  if (!item || !item.product_id || item.is_active === false) return false;
                  const qty = item.available_quantity ?? item.quantity;
                  return typeof qty === 'number' && !isNaN(qty) && qty <= 10;
                }).length
              : 0;
        setInventory({ lowStock: lowStockCount, loading: false });
      } catch {
        setInventory({ lowStock: '-', loading: false });
      }
    } else {
      setInventory({ lowStock: 'N/A', loading: false });
    }

    // Production — count records with status "In Production"
    if (hasPermission('production.view')) {
      try {
        const result = await getAllProduction();
        const records =
          result.data?.production_records ||
          result.data?.productions ||
          (Array.isArray(result.data) ? result.data : []);
        const activeCount =
          typeof result.data?.active_count === 'number'
            ? result.data.active_count
            : Array.isArray(records)
              ? records.filter((r) => r.status === 'In Production').length
              : 0;
        setProduction({ active: activeCount, loading: false });
      } catch {
        setProduction({ active: '-', loading: false });
      }
    } else {
      setProduction({ active: 'N/A', loading: false });
    }

    // Financials summary
    if (hasPermission('expenses.view')) {
      try {
        const result = await getExpenseSummary();
        const summary = result.data || {};
        setFinancials({
          income: summary.totalIncome ?? summary.total_income ?? 0,
          expense: summary.totalExpense ?? summary.total_expenses ?? 0,
          loading: false,
        });
      } catch {
        setFinancials({ income: 0, expense: 0, loading: false });
      }
    } else {
      setFinancials({ income: 'N/A', expense: 'N/A', loading: false });
    }

    // Quality inspection summary
    if (hasPermission('inspection.view')) {
      try {
        const result = await getInspectionSummary();
        const data = result.data || result;
        setInspections({
          total: data.total || data.totalReports || 0,
          approved: data.approved || 0,
          passed: data.passed || 0,
          loading: false,
        });
      } catch {
        setInspections({ total: '-', approved: '-', loading: false });
      }
    } else {
      setInspections({ total: 'N/A', approved: 'N/A', loading: false });
    }

    // Recent notifications (just the latest 5)
    try {
      const result = await getNotifications({ limit: 5 });
      const list = result.data?.notifications || result.data || [];
      setRecentNotifications(Array.isArray(list) ? list.slice(0, 5) : []);
    } catch {
      setRecentNotifications([]);
    }
  }

  // Helper to format a currency number nicely in Indian Rupees (INR)
  function formatMoney(amount) {
    if (typeof amount !== 'number') return amount;
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }

  // Helper to show a relative time string
  function timeAgo(dateString) {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div>
      {/* Welcome header */}
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.first_name}! 👋</h1>
          <div className="page-header-sub">
            Here's your TitanCore operations overview.
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total Orders</div>
          <div className="stat-card-value">
            {orders.loading ? '…' : orders.count}
          </div>
          <div className="stat-card-sub">All customer orders</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Low Stock Items</div>
          <div className="stat-card-value">
            {inventory.loading ? '…' : inventory.lowStock}
          </div>
          <div className="stat-card-sub">Inventory below 10 units</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Active Productions</div>
          <div className="stat-card-value">
            {production.loading ? '…' : production.active}
          </div>
          <div className="stat-card-sub">Currently in production</div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#00897b' }}>
          <div className="stat-card-label">Quality Inspections</div>
          <div className="stat-card-value">
            {inspections.loading ? '…' : `${inspections.approved}/${inspections.total}`}
          </div>
          <div className="stat-card-sub">Approved / Total Inspections</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Total Revenue</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>
            {financials.loading ? '…' : formatMoney(financials.income)}
          </div>
          <div className="stat-card-sub">All-time income recorded</div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#1a237e' }}>
          <div className="stat-card-label">Total Expenses</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>
            {financials.loading ? '…' : formatMoney(financials.expense)}
          </div>
          <div className="stat-card-sub">All-time expenses recorded</div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔔 Recent Notifications</h3>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div>
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item${!notification.is_read ? ' unread' : ''}`}
              >
                {!notification.is_read && <div className="notification-dot" />}
                <div className="notification-content">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <div className="notification-time">
                    {timeAgo(notification.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links panel */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⚡ Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {hasPermission('orders.create') && (
            <a href="/orders" className="btn btn-primary">📋 View Orders</a>
          )}
          {hasPermission('products.view') && (
            <a href="/products" className="btn btn-outline">📦 View Products</a>
          )}
          {hasPermission('inventory.view') && (
            <a href="/inventory" className="btn btn-outline">🗃️ View Inventory</a>
          )}
          {hasPermission('deliveries.view') && (
            <a href="/deliveries" className="btn btn-outline">🚚 Deliveries</a>
          )}
          {hasPermission('production.view') && (
            <a href="/production" className="btn btn-outline">🏭 Production</a>
          )}
          {hasPermission('inspection.view') && (
            <a href="/inspections" className="btn btn-outline">🔍 Quality Inspection</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
