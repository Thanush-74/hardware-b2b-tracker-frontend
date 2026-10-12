// RoleScreenSelection.jsx — Admin page to select and manage screen access for roles
// GET /api/roles, GET /api/screens, GET /api/roles/:id/permissions, PUT /api/roles/:id/permissions

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getAllRoles, getAllScreens, getRolePermissions, updateRolePermissions } from '../../services/roleService';
import { useAuth } from '../../context/AuthContext';

function RoleScreenSelection({ embeddedRoleId = null, onBack = null }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [roles, setRoles] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(embeddedRoleId || searchParams.get('roleId') || '');
  const [selectedScreenIds, setSelectedScreenIds] = useState(new Set());
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Initial fetch of all roles and all backend screens
  useEffect(() => {
    async function loadInitialData() {
      setLoadingInitial(true);
      setError('');
      try {
        const [rolesRes, screensRes] = await Promise.all([
          getAllRoles(),
          getAllScreens()
        ]);

        const roleList = Array.isArray(rolesRes.data)
          ? rolesRes.data
          : (rolesRes.data?.roles || rolesRes.roles || []);
        
        const screenList = Array.isArray(screensRes.data)
          ? screensRes.data
          : (screensRes.data?.screens || screensRes.screens || []);

        setRoles(roleList);
        setScreens(screenList);

        // If a role was specified in query or props, select it; otherwise default to first role
        const targetId = embeddedRoleId || searchParams.get('roleId');
        if (targetId && roleList.some((r) => String(r.id) === String(targetId))) {
          setSelectedRoleId(String(targetId));
        } else if (roleList.length > 0) {
          setSelectedRoleId(String(roleList[0].id));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load roles and screens.');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadInitialData();
  }, [embeddedRoleId]);

  // 2. Whenever selectedRoleId changes, fetch that role's current permissions/screens
  useEffect(() => {
    if (!selectedRoleId) return;

    async function loadRoleAccess() {
      setLoadingRolePerms(true);
      setError('');
      try {
        const res = await getRolePermissions(selectedRoleId);
        const perms = Array.isArray(res.data)
          ? res.data
          : (res.data?.permissions || res.permissions || []);

        // Determine which screens are assigned based on the role's permissions
        const assignedIds = new Set();
        perms.forEach((perm) => {
          if (perm.screen_id) {
            assignedIds.add(Number(perm.screen_id));
          } else if (perm.screen?.id) {
            assignedIds.add(Number(perm.screen.id));
          } else if (perm.screen?.slug) {
            const matched = screens.find((s) => s.slug === perm.screen.slug);
            if (matched) assignedIds.add(Number(matched.id));
          }
        });

        setSelectedScreenIds(assignedIds);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch permissions for the selected role.');
      } finally {
        setLoadingRolePerms(false);
      }
    }

    loadRoleAccess();
  }, [selectedRoleId, screens]);

  // Handle selecting a role
  function handleRoleChange(roleId) {
    setSelectedRoleId(String(roleId));
    setSuccessMessage('');
    setError('');
    if (!embeddedRoleId) {
      setSearchParams({ roleId });
    }
  }

  // Toggle single screen checkbox
  function handleToggleScreen(screenId) {
    const numId = Number(screenId);
    const updated = new Set(selectedScreenIds);
    if (updated.has(numId)) {
      updated.delete(numId);
    } else {
      updated.add(numId);
    }
    setSelectedScreenIds(updated);
  }

  // Quick Action: Select all screens
  function handleSelectAll() {
    const all = new Set(screens.map((s) => Number(s.id)));
    setSelectedScreenIds(all);
  }

  // Quick Action: Deselect all screens
  function handleDeselectAll() {
    setSelectedScreenIds(new Set());
  }

  // Save changes
  async function handleSave() {
    if (!selectedRoleId) {
      setError('Please select a role to configure.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Gather all permission IDs belonging to the selected screens
      const targetPermissionIds = new Set();
      screens.forEach((scr) => {
        if (selectedScreenIds.has(Number(scr.id))) {
          if (Array.isArray(scr.permissions)) {
            scr.permissions.forEach((p) => {
              targetPermissionIds.add(Number(p.id));
            });
          }
        }
      });

      const permIdsArray = Array.from(targetPermissionIds);
      const screenIdsArray = Array.from(selectedScreenIds);

      // Call backend API PUT /api/roles/:roleId/permissions
      await updateRolePermissions(selectedRoleId, permIdsArray, screenIdsArray);

      // 8. Re-fetch saved permissions from backend to verify and display persisted selections
      const refreshedRes = await getRolePermissions(selectedRoleId);
      const refreshedPerms = Array.isArray(refreshedRes.data)
        ? refreshedRes.data
        : (refreshedRes.data?.permissions || refreshedRes.permissions || []);

      const recomputedScreenIds = new Set();
      refreshedPerms.forEach((p) => {
        if (p.screen_id) recomputedScreenIds.add(Number(p.screen_id));
        else if (p.screen?.id) recomputedScreenIds.add(Number(p.screen.id));
      });

      setSelectedScreenIds(recomputedScreenIds);

      const currentRole = roles.find((r) => String(r.id) === String(selectedRoleId));
      const roleName = currentRole ? currentRole.name : 'Role';
      setSuccessMessage(`Screen access for "${roleName}" has been successfully saved!`);

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save screen access.');
    } finally {
      setSaving(false);
    }
  }

  const selectedRole = roles.find((r) => String(r.id) === String(selectedRoleId));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>📺 Role Screen Selection</h1>
          <div className="page-header-sub">
            Configure which screens each role can access in the application
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onBack ? (
            <button className="btn btn-outline" onClick={onBack}>
              ← Back to Roles Overview
            </button>
          ) : (
            <button className="btn btn-outline" onClick={() => navigate('/roles')}>
              ← Back to Roles Overview
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs between Roles Overview and Screen Selection */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          className="btn btn-outline btn-sm"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          onClick={() => (onBack ? onBack() : navigate('/roles'))}
        >
          🔐 Roles Overview
        </button>
        <button
          className="btn btn-primary btn-sm"
          style={{ pointerEvents: 'none' }}
        >
          📺 Screen Selection
        </button>
      </div>

      {/* Alerts */}
      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Initial Loading */}
      {loadingInitial ? (
        <div className="spinner-wrapper">
          <div className="spinner" /> Loading roles and available screens…
        </div>
      ) : (
        <>
          {/* Role Selection Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h2 className="card-title">1. Select Role to Configure</h2>
            </div>
            
            {roles.length === 0 ? (
              <div className="empty-state">
                <p>No roles found in the system.</p>
              </div>
            ) : (
              <div>
                {/* Role Pills / Quick Selector */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                  {roles.map((role) => {
                    const isSelected = String(role.id) === String(selectedRoleId);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleChange(role.id)}
                        className={isSelected ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{
                          fontWeight: isSelected ? 600 : 400,
                          boxShadow: isSelected ? '0 2px 6px rgba(21,101,192,0.3)' : 'none',
                        }}
                      >
                        {role.slug === 'admin' ? '👑 ' : role.slug === 'delivery' ? '🚚 ' : role.slug === 'sales' ? '💼 ' : '🏪 '}
                        {role.name}
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Selector */}
                <div className="form-group" style={{ maxWidth: '400px', marginBottom: 0 }}>
                  <label className="form-label" htmlFor="role-select">
                    Or choose from dropdown:
                  </label>
                  <select
                    id="role-select"
                    className="form-select"
                    value={selectedRoleId}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Role Meta */}
                {selectedRole && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      background: 'var(--color-bg)',
                      borderRadius: 'var(--border-radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{selectedRole.name}</strong>
                      <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Slug: <code>{selectedRole.slug}</code>
                      </span>
                      {selectedRole.description && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {selectedRole.description}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="badge badge-active" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
                        {selectedScreenIds.size} of {screens.length} screens assigned
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Screen Selection Checklist Card */}
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="card-title">
                  2. Available Screens for: {selectedRole ? selectedRole.name : 'Selected Role'}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Check or uncheck screens to grant or revoke access for this role.
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleSelectAll}
                  disabled={loadingRolePerms || screens.length === 0}
                >
                  ✓ Select All
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleDeselectAll}
                  disabled={loadingRolePerms || screens.length === 0}
                >
                  ✕ Deselect All
                </button>
              </div>
            </div>

            {loadingRolePerms ? (
              <div className="spinner-wrapper">
                <div className="spinner" /> Loading role screen assignments…
              </div>
            ) : screens.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📺</div>
                <p>No screens returned by the backend.</p>
              </div>
            ) : (
              <div>
                {/* Screens Checklist Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '14px',
                    marginBottom: '24px',
                  }}
                >
                  {screens.map((screen) => {
                    const isChecked = selectedScreenIds.has(Number(screen.id));
                    return (
                      <div
                        key={screen.id}
                        onClick={() => handleToggleScreen(screen.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '14px 16px',
                          borderRadius: 'var(--border-radius)',
                          border: isChecked ? '1px solid var(--color-blue)' : '1px solid var(--color-border)',
                          background: isChecked ? 'var(--color-blue-light)' : 'var(--color-white)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          userSelect: 'none',
                        }}
                      >
                        <input
                          type="checkbox"
                          id={`screen-${screen.id}`}
                          checked={isChecked}
                          onChange={() => handleToggleScreen(screen.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: '3px',
                            width: '18px',
                            height: '18px',
                            accentColor: 'var(--color-blue)',
                            cursor: 'pointer',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <label
                              htmlFor={`screen-${screen.id}`}
                              style={{
                                fontWeight: 600,
                                fontSize: '0.92rem',
                                color: isChecked ? 'var(--color-blue-hover)' : 'var(--color-dark)',
                                cursor: 'pointer',
                              }}
                            >
                              {screen.name}
                            </label>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: isChecked ? 'white' : 'var(--color-bg)',
                                color: 'var(--color-text-muted)',
                                border: '1px solid var(--color-border)',
                              }}
                            >
                              {screen.route || `/${screen.slug}`}
                            </span>
                          </div>

                          {screen.description && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', marginBottom: '6px' }}>
                              {screen.description}
                            </p>
                          )}

                          {Array.isArray(screen.permissions) && screen.permissions.length > 0 && (
                            <div style={{ fontSize: '0.74rem', color: isChecked ? 'var(--color-blue)' : '#9ca3af', marginTop: '4px' }}>
                              🔑 {screen.permissions.length} permissions: {screen.permissions.map((p) => p.name).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Form Actions */}
                <div className="form-actions" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '18px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => (onBack ? onBack() : navigate('/roles'))}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving || loadingRolePerms || !selectedRoleId}
                  >
                    {saving ? 'Saving Screen Access…' : 'Save Screen Access'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RoleScreenSelection;
