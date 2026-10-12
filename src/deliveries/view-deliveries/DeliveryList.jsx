// DeliveryList.jsx — View all deliveries
// GET /api/deliveries

import { useState, useEffect } from 'react';
import { getAllDeliveries } from '../../services/deliveryService';
import { useAuth } from '../../context/AuthContext';

const DELIVERY_STATUSES = ['Pending', 'Preparing', 'In Transit', 'Delivered', 'Failed', 'Cancelled'];

function DeliveryList({ onView, onCreate, onUpdateStatus, onAssign, refreshKey }) {
  const { hasPermission } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDeliveries();
  }, [refreshKey, filterStatus]);

  async function loadDeliveries() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const result = await getAllDeliveries(params);
      const list = result.data?.deliveries || result.data || [];
      setDeliveries(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load deliveries.');
    } finally {
      setLoading(false);
    }
  }

  const displayed = deliveries.filter((d) =>
    d.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
    d.recipient_name?.toLowerCase().includes(search.toLowerCase())
  );

  function statusBadge(status) {
    const map = {
      'Pending': 'badge-pending',
      'Preparing': 'badge-processing',
      'In Transit': 'badge-shipped',
      'Delivered': 'badge-delivered',
      'Failed': 'badge-cancelled',
      'Cancelled': 'badge-inactive',
    };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
  }

  return (
    <div>
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Search by tracking # or recipient…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {DELIVERY_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {hasPermission('deliveries.create') && (
          <button className="btn btn-primary" onClick={onCreate}>+ New Delivery</button>
        )}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /> Loading deliveries…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚚</div>
              <p>No deliveries found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Order</th>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Expected Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((delivery) => (
                    <tr key={delivery.id}>
                      <td><strong>{delivery.tracking_number}</strong></td>
                      <td>#{delivery.order_id}</td>
                      <td>
                        {delivery.recipient_name || '-'}
                        {delivery.recipient_phone && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {delivery.recipient_phone}
                          </div>
                        )}
                      </td>
                      <td>{statusBadge(delivery.status)}</td>
                      <td>
                        {delivery.expected_delivery_date
                          ? new Date(delivery.expected_delivery_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => onView(delivery)}>
                            View
                          </button>
                          {hasPermission('deliveries.edit') && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => onUpdateStatus(delivery)}>
                                Status
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => onAssign(delivery)}>
                                Assign
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

export default DeliveryList;
