// InventoryPage.jsx — Parent page for Inventory module

import { useState } from 'react';
import InventoryList from './view-inventory/InventoryList';
import AdjustStock from './adjust-stock/AdjustStock';

function InventoryPage() {
  const [modal, setModal] = useState(null); // null | 'adjust'
  const [selectedItem, setSelectedItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess(message) {
    setSuccessMessage(message);
    setModal(null);
    setSelectedItem(null);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function handleAdjust(item) {
    setSelectedItem(item);
    setModal('adjust');
  }

  function handleClose() {
    setModal(null);
    setSelectedItem(null);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🗃️ Inventory</h1>
          <div className="page-header-sub">Track stock levels for all hardware products</div>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">✔ {successMessage}</div>
      )}

      {modal === null && (
        <InventoryList refreshKey={refreshKey} onAdjust={handleAdjust} />
      )}

      {modal === 'adjust' && selectedItem && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Adjust Stock</h2>
          </div>
          <AdjustStock
            inventoryItem={selectedItem}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
