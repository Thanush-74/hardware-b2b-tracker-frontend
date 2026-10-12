// AssignRole.jsx — View and update permissions for a specific staff member
// GET /api/staff/:staffId/permissions  + PUT /api/staff/:staffId/permissions

import { useState, useEffect } from 'react';
import { getStaffPermissions, updateStaffPermissions } from '../../services/staffService';
import { getAllPermissions } from '../../services/roleService';

function AssignRole({ staffMember, onSuccess, onCancel }) {
  const [allPermissions, setAllPermissions] = useState([]);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [allPermsResult, staffPermsResult] = await Promise.all([
          getAllPermissions(),
          getStaffPermissions(staffMember.id),
        ]);

        const allPerms = allPermsResult.data?.permissions || allPermsResult.data || [];
        const staffPerms = staffPermsResult.data?.permissions || staffPermsResult.data || [];

        setAllPermissions(Array.isArray(allPerms) ? allPerms : []);

        // Build a Set of currently-assigned permission IDs
        const ids = new Set(
          (Array.isArray(staffPerms) ? staffPerms : []).map((p) => p.id || p.permission_id)
        );
        setAssignedIds(ids);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load permissions.');
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [staffMember.id]);

  // Toggle a permission on/off
  function togglePermission(permId) {
    const newSet = new Set(assignedIds);
    if (newSet.has(permId)) {
      newSet.delete(permId);
    } else {
      newSet.add(permId);
    }
    setAssignedIds(newSet);
  }

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      await updateStaffPermissions(staffMember.id, Array.from(assignedIds));
      onSuccess('Permissions updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permissions.');
    } finally {
      setLoading(false);
    }
  }

  // Group permissions by screen/module (e.g. "products.view" → "products")
  const groups = {};
  allPermissions.forEach((perm) => {
    const group = perm.slug?.split('.')[0] || 'other';
    if (!groups[group]) groups[group] = [];
    groups[group].push(perm);
  });

  return (
    <div>
      <p style={{ marginBottom: '16px' }}>
        Staff: <strong>{staffMember.first_name} {staffMember.last_name}</strong> — {staffMember.email}
      </p>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loadingData ? (
        <div className="spinner-wrapper"><div className="spinner" /> Loading permissions…</div>
      ) : (
        <div className="permission-grid">
          {Object.entries(groups).map(([group, perms]) => (
            <div key={group} className="permission-group">
              <div className="permission-group-title">
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </div>
              {perms.map((perm) => (
                <label key={perm.id} className="permission-item">
                  <input
                    type="checkbox"
                    checked={assignedIds.has(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                  />
                  {perm.name}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="form-actions">
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading || loadingData}>
          {loading ? 'Saving…' : 'Save Permissions'}
        </button>
      </div>
    </div>
  );
}

export default AssignRole;
