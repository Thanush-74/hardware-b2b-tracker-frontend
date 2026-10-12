// DeliveriesPage.jsx — Parent page for Deliveries module

import { useState } from 'react';
import DeliveryList from './view-deliveries/DeliveryList';
import CreateDelivery from './create-delivery/CreateDelivery';
import UpdateDeliveryStatus from './update-status/UpdateDeliveryStatus';
import AssignDeliveryStaff from './assign-staff/AssignDeliveryStaff';

function DeliveriesPage() {
  const [view, setView] = useState('list');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess(message) {
    setSuccessMessage(message);
    setView('list');
    setSelectedDelivery(null);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function handleClose() {
    setView('list');
    setSelectedDelivery(null);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🚚 Deliveries</h1>
          <div className="page-header-sub">Track and manage all customer deliveries</div>
        </div>
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}

      {view === 'list' && (
        <DeliveryList
          refreshKey={refreshKey}
          onCreate={() => setView('create')}
          onView={(d) => { setSelectedDelivery(d); setView('detail'); }}
          onUpdateStatus={(d) => { setSelectedDelivery(d); setView('updateStatus'); }}
          onAssign={(d) => { setSelectedDelivery(d); setView('assign'); }}
        />
      )}

      {view === 'create' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Create New Delivery</h2>
          </div>
          <CreateDelivery onSuccess={handleSuccess} onCancel={handleClose} />
        </div>
      )}

      {view === 'updateStatus' && selectedDelivery && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Update Delivery Status</h2>
          </div>
          <UpdateDeliveryStatus
            delivery={selectedDelivery}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}

      {view === 'assign' && selectedDelivery && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assign Delivery Staff</h2>
          </div>
          <AssignDeliveryStaff
            delivery={selectedDelivery}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}
    </div>
  );
}

export default DeliveriesPage;
