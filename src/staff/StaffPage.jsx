// StaffPage.jsx — Parent page for Staff Management module

import { useState } from 'react';
import { updateStaffStatus } from '../services/staffService';
import StaffList from './view-staff/StaffList';
import CreateEmployee from './create-employee/CreateEmployee';
import EditEmployee from './edit-employee/EditEmployee';
import AssignRole from './assign-role/AssignRole';

function StaffPage() {
  const [view, setView] = useState('list');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess(message) {
    setSuccessMessage(message);
    setView('list');
    setSelectedStaff(null);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function handleClose() {
    setView('list');
    setSelectedStaff(null);
  }

  // Toggle active/inactive status directly from the list
  async function handleToggleStatus(member) {
    const newStatus = !member.is_active;
    const action = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${member.first_name}?`)) return;
    try {
      await updateStaffStatus(member.id, newStatus);
      handleSuccess(`Staff member ${action}d successfully.`);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} staff member.`);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>👥 Staff Management</h1>
          <div className="page-header-sub">Manage employees, roles, and access permissions</div>
        </div>
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}

      {view === 'list' && (
        <StaffList
          refreshKey={refreshKey}
          onCreate={() => setView('create')}
          onEdit={(s) => { setSelectedStaff(s); setView('edit'); }}
          onViewPermissions={(s) => { setSelectedStaff(s); setView('permissions'); }}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {view === 'create' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Create Staff Member</h2>
          </div>
          <CreateEmployee onSuccess={handleSuccess} onCancel={handleClose} />
        </div>
      )}

      {view === 'edit' && selectedStaff && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Edit: {selectedStaff.first_name} {selectedStaff.last_name}</h2>
          </div>
          <EditEmployee
            staffMember={selectedStaff}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}

      {view === 'permissions' && selectedStaff && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              Permissions: {selectedStaff.first_name} {selectedStaff.last_name}
            </h2>
          </div>
          <AssignRole
            staffMember={selectedStaff}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}
    </div>
  );
}

export default StaffPage;
