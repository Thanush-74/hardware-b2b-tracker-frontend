// InventoryList.jsx — View all inventory records
// GET /api/inventory

import { useState, useEffect } from 'react';
import { getAllInventory } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';

function InventoryList({ onAdjust, refreshKey }) {
  const { hasPermission } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadInventory();
  }, [refreshKey]);

  async function loadInventory() {
    setLoading(true);
    setError('');
    try {
      const result = await getAllInventory();
      const list = result.data?.inventory || result.data || [];
      setInventory(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }

  // Client-side filter by product name
  const displayed = inventory.filter((item) => {
    const name = item.product?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  function getStockBadge(qty) {
    if (qty === 0) return <span className="badge badge-cancelled">Out of Stock</span>;
    if (qty < 10) return <span className="badge badge-pending">Low Stock</span>;
    return <span className="badge badge-active">In Stock</span>;
  }

  return (
    <div>
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Search by product name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /> Loading inventory…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🗃️</div>
              <p>No inventory records found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reserved</th>
                    <th>Available</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((item) => {
                    const available = (item.quantity || 0) - (item.reserved_quantity || 0);
                    return (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td><strong>{item.product?.name || `Product #${item.product_id}`}</strong></td>
                        <td>{item.product?.type || '-'}</td>
                        <td>{item.quantity}</td>
                        <td>{item.reserved_quantity}</td>
                        <td>{available}</td>
                        <td>{item.location || 'Main Warehouse'}</td>
                        <td>{getStockBadge(item.quantity)}</td>
                        <td>
                          {hasPermission('inventory.edit') && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => onAdjust(item)}
                            >
                              Adjust Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InventoryList;
