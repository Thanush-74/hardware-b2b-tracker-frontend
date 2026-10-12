// UpdateReturnStatus.jsx — Update the status of a return record
// PATCH /api/returns/:id/status

import { useState } from 'react';
import { updateReturnStatus } from '../../services/returnService';

const STATUSES = ['Requested', 'Approved', 'Rejected', 'Received', 'Replaced', 'Refunded', 'Completed'];

function UpdateReturnStatus({ returnRecord, onSuccess, onCancel }) {
  const [status, setStatus] = useState(returnRecord.status || 'Requested');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateReturnStatus(returnRecord.id, status);
      onSuccess(`Return status updated to "${status}".`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update return status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginBottom: '16px' }}>
        Return: <strong>{returnRecord.return_number}</strong> — {returnRecord.customer_name}
      </p>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="return-status">New Status</label>
        <select
          id="return-status"
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

export default UpdateReturnStatus;
