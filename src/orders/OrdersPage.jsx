// OrdersPage.jsx — Parent page for Orders module

import { useState } from 'react';
import OrderList from './view-orders/OrderList';
import ViewOrder from './view-order/ViewOrder';
import CreateOrder from './create-order/CreateOrder';
import UpdateOrderStatus from './update-status/UpdateOrderStatus';
import UpdatePaymentStatus from './update-payment/UpdatePaymentStatus';

function OrdersPage() {
  const [view, setView] = useState('list'); // list | detail | create | updateStatus | updatePayment
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess(message) {
    setSuccessMessage(message);
    setView('list');
    setSelectedOrder(null);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function handleClose() {
    setView('list');
    setSelectedOrder(null);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📋 Orders</h1>
          <div className="page-header-sub">Manage customer orders, statuses, and payments</div>
        </div>
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}

      {view === 'list' && (
        <OrderList
          refreshKey={refreshKey}
          onCreate={() => setView('create')}
          onView={(order) => { setSelectedOrder(order); setView('detail'); }}
          onEdit={(order) => { setSelectedOrder(order); setView('updateStatus'); }}
        />
      )}

      {view === 'detail' && selectedOrder && (
        <ViewOrder
          order={selectedOrder}
          onClose={handleClose}
          onUpdateStatus={(o) => { setSelectedOrder(o); setView('updateStatus'); }}
          onUpdatePayment={(o) => { setSelectedOrder(o); setView('updatePayment'); }}
        />
      )}

      {view === 'create' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Create New Order</h2>
          </div>
          <CreateOrder onSuccess={handleSuccess} onCancel={handleClose} />
        </div>
      )}

      {view === 'updateStatus' && selectedOrder && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Update Order Status</h2>
          </div>
          <UpdateOrderStatus
            order={selectedOrder}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}

      {view === 'updatePayment' && selectedOrder && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Update Payment Status</h2>
          </div>
          <UpdatePaymentStatus
            order={selectedOrder}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
