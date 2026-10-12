// UpdateDeliveryStatus.jsx — Update status of a delivery
// PATCH /api/deliveries/:id/status

import { useState } from 'react';
import { updateDeliveryStatus } from '../../services/deliveryService';

const STATUSES = ['Pending', 'Preparing', 'In Transit', 'Delivered', 'Failed', 'Cancelled'];

function UpdateDeliveryStatus({ delivery, onSuccess, onCancel }) {
  const [status, setStatus] = useState(delivery.status || 'Pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateDeliveryStatus(delivery.id, status);
      onSuccess(`Delivery status updated to "${status}".`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update delivery status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginBottom: '16px' }}>
        Tracking: <strong>{delivery.tracking_number}</strong>
      </p>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="delivery-status">New Status</label>
        <select
          id="delivery-status"
          className="form-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Update Status'}
        </button>
      </div>
    </form>
  );
}

export default UpdateDeliveryStatus;
