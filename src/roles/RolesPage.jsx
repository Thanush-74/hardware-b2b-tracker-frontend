// RolesPage.jsx — Manage roles and their assigned permissions
// GET /api/roles, GET /api/roles/:id/permissions, PUT /api/roles/:roleId/permissions, POST /api/roles

import { useState, useEffect } from 'react';
import { getAllRoles, createRole, getRolePermissions, updateRolePermissions, getAllPermissions, getAllScreens } from '../services/roleService';
import { useAuth } from '../context/AuthContext';
import RoleScreenSelection from './screen-selection/RoleScreenSelection';

function RolesPage() {
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [allScreens, setAllScreens] = useState([]); // screens from backend
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | create | managePermissions | screens
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissionIds, setRolePermissionIds] = useState(new Set());
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // For create role form
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleSlug, setNewRoleSlug] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    setLoading(true);
    setError('');
    try {
      const [rolesResult, permsResult, screensResult] = await Promise.all([
        getAllRoles(),
        getAllPermissions(),
        getAllScreens(),
      ]);
      const roleList = rolesResult.data?.roles || rolesResult.data || [];
      const permList = permsResult.data?.permissions || permsResult.data || [];
      const screenList = screensResult.data?.screens || screensResult.data || [];
      setRoles(Array.isArray(roleList) ? roleList : []);
      setAllPermissions(Array.isArray(permList) ? permList : []);
      setAllScreens(Array.isArray(screenList) ? screenList : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }

  function openConfigureScreens(role) {
    setSelectedRole(role);
    setView('screens');
  }

  async function openManagePermissions(role) {
    setSelectedRole(role);
    setLoadingPerms(true);
    setView('managePermissions');
    try {
      const result = await getRolePermissions(role.id);
      const perms = result.data?.permissions || result.data || [];
      const ids = new Set((Array.isArray(perms) ? perms : []).map((p) => p.id));
      setRolePermissionIds(ids);
    } catch {
      setError('Failed to load role permissions.');
    } finally {
      setLoadingPerms(false);
    }
  }

  function togglePermission(permId) {
    const newSet = new Set(rolePermissionIds);
    if (newSet.has(permId)) newSet.delete(permId);
    else newSet.add(permId);
    setRolePermissionIds(newSet);
  }

  async function handleSavePermissions() {
    setError('');
    try {
      await updateRolePermissions(selectedRole.id, Array.from(rolePermissionIds));
      setSuccessMessage(`Permissions for "${selectedRole.name}" saved!`);
      setView('list');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save permissions.');
    }
  }

  async function handleCreateRole(event) {
    event.preventDefault();
    setCreateLoading(true);
    setError('');
    try {
      await createRole({
        name: newRoleName.trim(),
        slug: newRoleSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: newRoleDesc.trim() || null,
      });
      setSuccessMessage('Role created!');
      setView('list');
      setNewRoleName(''); setNewRoleSlug(''); setNewRoleDesc('');
      loadRoles();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create role.');
    } finally {
      setCreateLoading(false);
    }
  }

  // Group permissions by screen slug (from the screen association or slug prefix)
  // permGroups: { screenSlug: { screenName, perms: [...] } }
  const permGroups = {};
  allPermissions.forEach((perm) => {
    // The backend includes screen association on permissions
    const screenSlug = perm.screen?.slug || perm.slug?.split('.')[0] || 'other';
    const screenName = perm.screen?.name || (screenSlug.charAt(0).toUpperCase() + screenSlug.slice(1));
    if (!permGroups[screenSlug]) permGroups[screenSlug] = { screenName, perms: [] };
    permGroups[screenSlug].perms.push(perm);
  });

  // Toggle all permissions for a screen
  function toggleScreen(screenSlug) {
    const screenPerms = permGroups[screenSlug]?.perms || [];
    const allSelected = screenPerms.every((p) => rolePermissionIds.has(p.id));
    const newSet = new Set(rolePermissionIds);
    if (allSelected) {
      screenPerms.forEach((p) => newSet.delete(p.id));
    } else {
      screenPerms.forEach((p) => newSet.add(p.id));
    }
    setRolePermissionIds(newSet);
  }

  // If viewing the Screen Selection page
  if (view === 'screens') {
    return (
      <RoleScreenSelection
        embeddedRoleId={selectedRole?.id}
        onBack={() => {
          setView('list');
          setSelectedRole(null);
          loadRoles();
        }}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🔐 Roles & Permissions</h1>
          <div className="page-header-sub">Define roles and control what each role can access</div>
        </div>
        {isAdmin() && view === 'list' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => { setSelectedRole(null); setView('screens'); }}>
              📺 Role Screen Selection
            </button>
            <button className="btn btn-primary" onClick={() => setView('create')}>
              + Create Role
            </button>
          </div>
        )}
      </div>

      {/* Navigation tabs */}
      {view === 'list' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <button className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>
            🔐 Roles Overview
          </button>
          <button
            className="btn btn-outline btn-sm"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            onClick={() => { setSelectedRole(null); setView('screens'); }}
          >
            📺 Screen Selection
          </button>
        </div>
      )}

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Roles list */}
      {view === 'list' && (
        loading ? (
          <div className="spinner-wrapper"><div className="spinner" /> Loading…</div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>#{role.id}</td>
                      <td><strong>{role.name}</strong></td>
                      <td><code style={{ fontSize: '0.8rem', background: '#f4f6f9', padding: '2px 6px', borderRadius: '4px' }}>{role.slug}</code></td>
                      <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>{role.description || '—'}</td>
                      <td>
                        {isAdmin() && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => openConfigureScreens(role)}>
                              📺 Configure Screens
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => openManagePermissions(role)}>
                              Manage Permissions
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Create role form */}
      {view === 'create' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Create New Role</h2>
          </div>
          <form onSubmit={handleCreateRole}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="role-name">Role Name *</label>
                <input id="role-name" type="text" className="form-input" value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="role-slug">Slug *</label>
                <input id="role-slug" type="text" className="form-input" value={newRoleSlug}
                  onChange={(e) => setNewRoleSlug(e.target.value)} placeholder="e.g. warehouse-manager" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="role-desc">Description</label>
              <textarea id="role-desc" className="form-textarea" value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={createLoading}>
                {createLoading ? 'Creating…' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage permissions for a role */}
      {view === 'managePermissions' && selectedRole && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Screen & Permission Access for: {selectedRole.name}</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')}>← Back</button>
          </div>
          {loadingPerms ? (
            <div className="spinner-wrapper"><div className="spinner" /></div>
          ) : (
            <>
              <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '0.9rem' }}>
                Toggle entire screens on/off, or pick individual permissions. Changes are saved when you click Save.
              </p>
              <div className="permission-grid">
                {Object.entries(permGroups).map(([screenSlug, { screenName, perms }]) => {
                  const allSelected = perms.every((p) => rolePermissionIds.has(p.id));
                  const someSelected = !allSelected && perms.some((p) => rolePermissionIds.has(p.id));
                  return (
                    <div key={screenSlug} className="permission-group">
                      {/* Screen-level toggle header */}
                      <label
                        className="permission-group-title"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => { if (el) el.indeterminate = someSelected; }}
                          onChange={() => toggleScreen(screenSlug)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        {screenName}
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>
                          ({perms.filter((p) => rolePermissionIds.has(p.id)).length}/{perms.length})
                        </span>
                      </label>
                      {/* Individual permission checkboxes */}
                      {perms.map((perm) => (
                        <label key={perm.id} className="permission-item" style={{ paddingLeft: '28px' }}>
                          <input
                            type="checkbox"
                            checked={rolePermissionIds.has(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          />
                          {perm.name}
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setView('list')}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSavePermissions}>
                  Save Permissions
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default RolesPage;
