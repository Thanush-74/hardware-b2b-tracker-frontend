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
  const [filterType, setFilterType] = useState('');

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

  // Canonical types plus any distinct types found in DB inventory
  const BASE_TYPES = ['GPU', 'RAM', 'ROM', 'Motherboard'];
  const availableTypes = Array.from(
    new Set([...BASE_TYPES, ...inventory.map((i) => i.product_type).filter(Boolean)])
  );

  // Client-side filter by product name, product type, and type selector
  const displayed = inventory.filter((item) => {
    const name = item.product_name || '';
    const type = item.product_type || '';
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || name.toLowerCase().includes(searchLower) || type.toLowerCase().includes(searchLower);

    let matchesType = true;
    if (filterType) {
      const compactFilter = filterType.replace(/\s+/g, '').toUpperCase();
      const compactType = type.replace(/\s+/g, '').toUpperCase();
      if (compactFilter === 'ROM' || compactFilter === 'ROM/SSD') {
        matchesType = compactType === 'ROM' || compactType === 'ROM/SSD' || type.toUpperCase().includes('SSD') || type.toUpperCase().includes('ROM');
      } else {
        matchesType = type.toLowerCase() === filterType.toLowerCase();
      }
    }

    return matchesSearch && matchesType;
  });

  // Use the stock_status string that the backend already computed.
  function getStockBadge(status) {
    if (status === 'Out of Stock') return <span className="badge badge-cancelled">Out of Stock</span>;
    if (status === 'Low Stock') return <span className="badge badge-pending">Low Stock</span>;
    return <span className="badge badge-active">In Stock</span>;
  }

  return (
    <div>
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Search by product name or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {availableTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
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
                  {displayed.map((item) => (
                    // The API returns flat fields: product_name, product_type,
                    // total_quantity, reserved_quantity, available_quantity, stock_status.
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>
                        <strong>{item.product_name}</strong>
                        {item.is_active === false && (
                          <span className="badge badge-inactive" style={{ marginLeft: '8px' }}>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td>{item.product_type || '-'}</td>
                      <td>{item.total_quantity}</td>
                      <td>{item.reserved_quantity}</td>
                      <td>{item.available_quantity}</td>
                      <td>{item.location || 'Main Warehouse'}</td>
                      <td>{getStockBadge(item.stock_status)}</td>
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

export default InventoryList;
