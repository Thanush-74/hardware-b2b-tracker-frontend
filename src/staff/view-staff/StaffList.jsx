// StaffList.jsx — View all staff members
// GET /api/staff

import { useState, useEffect } from 'react';
import { getAllStaff } from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';

function StaffList({ onCreate, onEdit, onViewPermissions, onToggleStatus, refreshKey }) {
  const { isAdmin } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStaff();
  }, [refreshKey]);

  async function loadStaff() {
    setLoading(true);
    setError('');
    try {
      const result = await getAllStaff();
      const list = result.data?.staff || result.data || [];
      setStaff(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  }

  const displayed = staff.filter((s) => {
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isAdmin() && (
          <button className="btn btn-primary" onClick={onCreate}>+ Create Staff</button>
        )}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /> Loading staff…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>No staff members found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <strong>{member.first_name} {member.last_name}</strong>
                      </td>
                      <td>{member.email}</td>
                      <td>{member.role?.name || '-'}</td>
                      <td>
                        {member.is_active
                          ? <span className="badge badge-active">Active</span>
                          : <span className="badge badge-inactive">Inactive</span>}
                      </td>
                      <td>
                        <div className="table-actions">
                          {isAdmin() && (
                            <>
                              <button className="btn btn-outline btn-sm" onClick={() => onEdit(member)}>
                                Edit
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => onViewPermissions(member)}>
                                Permissions
                              </button>
                              <button
                                className={member.is_active ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'}
                                onClick={() => onToggleStatus(member)}
                              >
                                {member.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </>
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

export default StaffList;
