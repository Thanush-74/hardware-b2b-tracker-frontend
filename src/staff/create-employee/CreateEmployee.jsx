// CreateEmployee.jsx — Form to create a new staff member (admin only)
// POST /api/staff

import { useState, useEffect } from 'react';
import { createStaff } from '../../services/staffService';
import { getAllRoles } from '../../services/roleService';

function CreateEmployee({ onSuccess, onCancel }) {
  const [roles, setRoles] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRoles() {
      try {
        const result = await getAllRoles();
        const list = result.data?.roles || result.data || [];
        setRoles(Array.isArray(list) ? list : []);
        if (list.length > 0) setRoleId(list[0].id);
      } catch {
        setError('Could not load roles.');
      } finally {
        setLoadingRoles(false);
      }
    }
    fetchRoles();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createStaff({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role_id: roleId,
      });
      onSuccess('Staff member created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff member.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="staff-firstname">First Name *</label>
          <input
            id="staff-firstname"
            type="text"
            className="form-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="staff-lastname">Last Name *</label>
          <input
            id="staff-lastname"
            type="text"
            className="form-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="staff-email">Email *</label>
          <input
            id="staff-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="staff-password">Password *</label>
          <input
            id="staff-password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="staff-role">Role *</label>
          {loadingRoles ? (
            <div className="spinner-wrapper" style={{ padding: '10px' }}><div className="spinner" /></div>
          ) : (
            <select
              id="staff-role"
              className="form-select"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || loadingRoles}>
          {loading ? 'Creating…' : 'Create Staff Member'}
        </button>
      </div>
    </form>
  );
}

export default CreateEmployee;
