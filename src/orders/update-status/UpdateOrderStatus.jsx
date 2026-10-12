// UpdateOrderStatus.jsx — Update only the status of an order
// PATCH /api/orders/:id/status

import { useState } from 'react';
import { updateOrderStatus } from '../../services/orderService';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function UpdateOrderStatus({ order, onSuccess, onCancel }) {
  const [status, setStatus] = useState(order.order_status || 'Pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateOrderStatus(order.id, status);
      onSuccess(`Order status updated to "${status}".`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginBottom: '16px' }}>
        Order: <strong>{order.order_number}</strong> — Customer: {order.customer_name}
      </p>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="order-status-select">New Status</label>
        <select
          id="order-status-select"
          className="form-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Update Status'}
        </button>
      </div>
    </form>
  );
}

export default UpdateOrderStatus;
