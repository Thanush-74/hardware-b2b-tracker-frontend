// UpdatePaymentStatus.jsx — Update payment status and payment amount for an order
// PATCH /api/orders/:id/payment

import { useState } from 'react';
import { updatePaymentStatus } from '../../services/orderService';

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Partially Paid'];

function UpdatePaymentStatus({ order, onSuccess, onCancel }) {
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status || 'Pending');
  const [paymentAmount, setPaymentAmount] = useState(order.payment_amount || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updatePaymentStatus(order.id, {
        payment_status: paymentStatus,
        payment_amount: parseFloat(paymentAmount) || 0,
      });
      onSuccess(`Payment status updated to "${paymentStatus}".`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginBottom: '16px' }}>
        Order: <strong>{order.order_number}</strong> — Total: ₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="payment-status-select">Payment Status</label>
          <select
            id="payment-status-select"
            className="form-select"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="payment-amount">Amount Paid (₹)</label>
          <input
            id="payment-amount"
            type="number"
            className="form-input"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Update Payment'}
        </button>
      </div>
    </form>
  );
}

export default UpdatePaymentStatus;
