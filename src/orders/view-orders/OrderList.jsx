// OrderList.jsx — View all customer orders
// GET /api/orders

import { useState, useEffect } from 'react';
import { getAllOrders } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function OrderList({ onView, onEdit, onCreate, refreshKey }) {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
  }, [refreshKey, filterStatus]);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStatus) params.order_status = filterStatus;
      const result = await getAllOrders(params);
      const list = result.data?.orders || result.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  const displayed = orders.filter((o) =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  function statusBadge(status) {
    const cls = status?.toLowerCase().replace(' ', '') || 'pending';
    return <span className={`badge badge-${cls}`}>{status}</span>;
  }

  function paymentBadge(status) {
    const cls = status?.toLowerCase().replace(' ', '') || 'pending';
    return <span className={`badge badge-${cls}`}>{status}</span>;
  }

  return (
    <div>
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Search by order # or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {hasPermission('orders.create') && (
          <button className="btn btn-primary" onClick={onCreate}>+ New Order</button>
        )}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /> Loading orders…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total (₹)</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((order) => (
                    <tr key={order.id}>
                      <td><strong>{order.order_number}</strong></td>
                      <td>
                        {order.customer_name}
                        {order.customer_email && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {order.customer_email}
                          </div>
                        )}
                      </td>
                      <td>₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>{statusBadge(order.order_status)}</td>
                      <td>{paymentBadge(order.payment_status)}</td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => onView(order)}>
                            View
                          </button>
                          {hasPermission('orders.edit') && (
                            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(order)}>
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderList;
