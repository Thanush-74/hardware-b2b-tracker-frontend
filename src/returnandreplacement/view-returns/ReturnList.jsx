// ReturnList.jsx — View all return/replacement records
// GET /api/returns

import { useState, useEffect } from 'react';
import { getAllReturns } from '../../services/returnService';
import { useAuth } from '../../context/AuthContext';

const RETURN_STATUSES = ['Requested', 'Approved', 'Rejected', 'Received', 'Replaced', 'Refunded', 'Completed'];

function ReturnList({ onView, onCreate, onUpdateStatus, onReplacement, refreshKey }) {
  const { hasPermission } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReturns();
  }, [refreshKey, filterStatus]);

  async function loadReturns() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const result = await getAllReturns(params);
      const list = result.data?.returns || result.data || [];
      setReturns(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load returns.');
    } finally {
      setLoading(false);
    }
  }

  const displayed = returns.filter((r) =>
    r.return_number?.toLowerCase().includes(search.toLowerCase()) ||
    r.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  function statusBadge(status) {
    const cls = status?.toLowerCase() || 'requested';
    return <span className={`badge badge-${cls}`}>{status}</span>;
  }

  return (
    <div>
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Search by return # or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {RETURN_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {hasPermission('returns.create') && (
          <button className="btn btn-primary" onClick={onCreate}>+ New Return</button>
        )}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /> Loading returns…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">↩️</div>
              <p>No return records found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Return #</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Replacement?</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((ret) => (
                    <tr key={ret.id}>
                      <td><strong>{ret.return_number}</strong></td>
                      <td>{ret.customer_name}</td>
                      <td>{ret.product?.name || `#${ret.product_id}`}</td>
                      <td>{ret.quantity}</td>
                      <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ret.return_reason}
                      </td>
                      <td>{statusBadge(ret.status)}</td>
                      <td>{ret.replacement_required ? '✔ Yes' : '—'}</td>
                      <td>
                        <div className="table-actions">
                          {hasPermission('returns.edit') && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => onUpdateStatus(ret)}>
                                Status
                              </button>
                              {ret.replacement_required && (
                                <button className="btn btn-outline btn-sm" onClick={() => onReplacement(ret)}>
                                  Replace
                                </button>
                              )}
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

export default ReturnList;
