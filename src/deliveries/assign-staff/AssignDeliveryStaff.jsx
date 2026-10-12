// AssignDeliveryStaff.jsx — Assign a staff member to a delivery
// PATCH /api/deliveries/:id/assign

import { useState, useEffect } from 'react';
import { assignDeliveryStaff } from '../../services/deliveryService';
import { getAllStaff } from '../../services/staffService';

function AssignDeliveryStaff({ delivery, onSuccess, onCancel }) {
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState(delivery.delivery_staff_id || '');
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [error, setError] = useState('');

  // Load all active staff for the dropdown
  useEffect(() => {
    async function fetchStaff() {
      try {
        const result = await getAllStaff({ is_active: true });
        const list = result.data?.staff || result.data || [];
        setStaffList(Array.isArray(list) ? list : []);
      } catch {
        setError('Could not load staff list.');
      } finally {
        setLoadingStaff(false);
      }
    }
    fetchStaff();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await assignDeliveryStaff(delivery.id, staffId);
      onSuccess('Delivery staff assigned successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign staff.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginBottom: '16px' }}>
        Assign staff for delivery: <strong>{delivery.tracking_number}</strong>
      </p>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="assign-staff">Select Staff Member</label>
        {loadingStaff ? (
          <div className="spinner-wrapper" style={{ padding: '10px' }}><div className="spinner" /></div>
        ) : (
          <select
            id="assign-staff"
            className="form-select"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            required
          >
            <option value="">-- Select staff --</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} ({s.role?.name || 'Staff'})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || loadingStaff}>
          {loading ? 'Assigning…' : 'Assign Staff'}
        </button>
      </div>
    </form>
  );
}

export default AssignDeliveryStaff;
