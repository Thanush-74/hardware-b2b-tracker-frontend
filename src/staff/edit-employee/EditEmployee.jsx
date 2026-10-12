// EditEmployee.jsx — Form to edit an existing staff member (admin only)
// PUT /api/staff/:id

import { useState, useEffect } from 'react';
import { updateStaff } from '../../services/staffService';
import { getAllRoles } from '../../services/roleService';

function EditEmployee({ staffMember, onSuccess, onCancel }) {
  const [roles, setRoles] = useState([]);
  const [firstName, setFirstName] = useState(staffMember.first_name || '');
  const [lastName, setLastName] = useState(staffMember.last_name || '');
  const [email, setEmail] = useState(staffMember.email || '');
  const [password, setPassword] = useState(''); // leave blank to keep unchanged
  const [roleId, setRoleId] = useState(staffMember.role_id || staffMember.role?.id || '');
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRoles() {
      try {
        const result = await getAllRoles();
        const list = result.data?.roles || result.data || [];
        setRoles(Array.isArray(list) ? list : []);
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

    const updateData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      role_id: roleId,
    };
    // Only send password if the admin typed a new one
    if (password.trim()) {
      updateData.password = password;
    }

    try {
      await updateStaff(staffMember.id, updateData);
      onSuccess('Staff member updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update staff member.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-staff-firstname">First Name *</label>
          <input
            id="edit-staff-firstname"
            type="text"
            className="form-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-staff-lastname">Last Name *</label>
          <input
            id="edit-staff-lastname"
            type="text"
            className="form-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-staff-email">Email *</label>
          <input
            id="edit-staff-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-staff-password">
            New Password <span style={{ color: '#6b7280', fontWeight: 400 }}>(leave blank to keep current)</span>
          </label>
          <input
            id="edit-staff-password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (optional)"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-staff-role">Role *</label>
          {loadingRoles ? (
            <div className="spinner-wrapper" style={{ padding: '10px' }}><div className="spinner" /></div>
          ) : (
            <select
              id="edit-staff-role"
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
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default EditEmployee;
