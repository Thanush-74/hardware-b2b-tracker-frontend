// ViewOrder.jsx — Read-only detail view of a single order
// GET /api/orders/:id

import { useState, useEffect } from 'react';
import { getOrderById } from '../../services/orderService';

function ViewOrder({ order, onClose, onUpdateStatus, onUpdatePayment }) {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [order.id]);

  async function loadOrder() {
    setLoading(true);
    try {
      const result = await getOrderById(order.id);
      setOrderDetail(result.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="spinner-wrapper"><div className="spinner" /> Loading…</div>;
  }

  if (error) {
    return <div className="alert alert-error">⚠️ {error}</div>;
  }

  const o = orderDetail || order;
  const items = o.order_items || o.items || [];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Order: {o.order_number}</h2>
        <button className="btn btn-outline btn-sm" onClick={onClose}>← Back to List</button>
      </div>

      {/* Customer info */}
      <div className="form-grid" style={{ marginBottom: '20px' }}>
        <div>
          <div className="form-label">Customer</div>
          <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
          {o.customer_email && <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{o.customer_email}</div>}
          {o.customer_phone && <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{o.customer_phone}</div>}
        </div>
        <div>
          <div className="form-label">Order Date</div>
          <div>{new Date(o.order_date).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="form-label">Order Status</div>
          <span className={`badge badge-${o.order_status?.toLowerCase()}`}>{o.order_status}</span>
        </div>
        <div>
          <div className="form-label">Payment</div>
          <span className={`badge badge-${o.payment_status?.toLowerCase()}`}>{o.payment_status}</span>
          <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#6b7280' }}>
            {o.payment_method} — Paid: ₹{parseFloat(o.payment_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Order items table */}
      {items.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '12px', fontSize: '0.9rem' }}>Order Items</h3>
          <div className="table-wrapper" style={{ marginBottom: '20px' }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price (₹)</th>
                  <th>Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>{item.product?.name || `Product #${item.product_id}`}</td>
                    <td>{item.quantity}</td>
                    <td>₹{parseFloat(item.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>₹{(parseFloat(item.unit_price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <strong style={{ fontSize: '1.1rem' }}>
          Total: ₹{parseFloat(o.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      </div>

      {o.notes && (
        <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '20px' }}>
          <strong>Notes:</strong> {o.notes}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => onUpdateStatus(o)}>
          Update Status
        </button>
        <button className="btn btn-outline" onClick={() => onUpdatePayment(o)}>
          Update Payment
        </button>
      </div>
    </div>
  );
}

export default ViewOrder;
