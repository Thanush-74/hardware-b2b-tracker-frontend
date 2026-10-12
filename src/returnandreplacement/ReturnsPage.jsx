// ReturnsPage.jsx — Parent page for Returns & Replacement module

import { useState } from 'react';
import ReturnList from './view-returns/ReturnList';
import CreateReturn from './create-return/CreateReturn';
import UpdateReturnStatus from './update-status/UpdateReturnStatus';
import RecordReplacement from './record-replacement/RecordReplacement';

function ReturnsPage() {
  const [view, setView] = useState('list');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess(message) {
    setSuccessMessage(message);
    setView('list');
    setSelectedReturn(null);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function handleClose() {
    setView('list');
    setSelectedReturn(null);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>↩️ Returns & Replacement</h1>
          <div className="page-header-sub">Manage return requests and replacement shipments</div>
        </div>
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}

      {view === 'list' && (
        <ReturnList
          refreshKey={refreshKey}
          onCreate={() => setView('create')}
          onView={(r) => { setSelectedReturn(r); setView('detail'); }}
          onUpdateStatus={(r) => { setSelectedReturn(r); setView('updateStatus'); }}
          onReplacement={(r) => { setSelectedReturn(r); setView('replacement'); }}
        />
      )}

      {view === 'create' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Create Return Request</h2>
          </div>
          <CreateReturn onSuccess={handleSuccess} onCancel={handleClose} />
        </div>
      )}

      {view === 'updateStatus' && selectedReturn && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Update Return Status</h2>
          </div>
          <UpdateReturnStatus
            returnRecord={selectedReturn}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}

      {view === 'replacement' && selectedReturn && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Record Replacement</h2>
          </div>
          <RecordReplacement
            returnRecord={selectedReturn}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}
    </div>
  );
}

export default ReturnsPage;
