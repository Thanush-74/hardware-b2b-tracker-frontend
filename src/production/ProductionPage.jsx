// ProductionPage.jsx — Production records management
// Covers view, create, and update-status for production records

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllProduction,
  createProduction,
  updateProductionStatus,
} from '../services/productionService';
import { getProducts } from '../services/productService';

const STATUSES = ['Planned', 'In Production', 'Completed', 'Cancelled'];

function ProductionPage() {
  const { hasPermission } = useAuth();
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | create | updateStatus
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Create form fields
  const [productId, setProductId] = useState('');
  const [quantityPlanned, setQuantityPlanned] = useState('');
  const [weeklyCapacity, setWeeklyCapacity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Status update
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prodResult, productResult] = await Promise.all([
        getAllProduction(),
        getProducts(),
      ]);
      setRecords(prodResult.data?.production_records || prodResult.data?.productions || []);
      setProducts(productResult.data?.products || productResult.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await createProduction({
        product_id: productId,
        quantity_planned: parseInt(quantityPlanned, 10),
        weekly_capacity: parseInt(weeklyCapacity, 10) || 0,
        start_date: startDate || null,
        expected_completion_date: expectedCompletion || null,
        notes: notes.trim() || null,
      });
      setSuccessMessage('Production record created!');
      setView('list');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create production record.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdateStatus(event) {
    event.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await updateProductionStatus(selectedRecord.id, newStatus);
      setSuccessMessage(`Production status updated to "${newStatus}".`);
      setView('list');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setFormLoading(false);
    }
  }

  function getProductName(id) {
    const p = products.find((pr) => String(pr.id) === String(id));
    return p ? p.name : `#${id}`;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>⚙️ Production</h1>
          <div className="page-header-sub">Track production runs, quantities, and completion status</div>
        </div>
        {hasPermission('production.create') && view === 'list' && (
          <button className="btn btn-primary" onClick={() => setView('create')}>+ New Production Run</button>
        )}
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Production records table */}
      {view === 'list' && (
        loading ? (
          <div className="spinner-wrapper"><div className="spinner" /> Loading…</div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {records.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⚙️</div>
                <p>No production records found.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Planned</th>
                      <th>Producing</th>
                      <th>Completed</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>Est. Completion</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td>#{r.id}</td>
                        <td><strong>{getProductName(r.product_id)}</strong></td>
                        <td>{r.quantity_planned}</td>
                        <td>{r.quantity_producing}</td>
                        <td>{r.quantity_completed}</td>
                        <td>
                          <span className={`badge badge-${r.status?.toLowerCase().replace(' ', '') || 'planned'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>{r.start_date ? new Date(r.start_date).toLocaleDateString() : '-'}</td>
                        <td>{r.expected_completion_date ? new Date(r.expected_completion_date).toLocaleDateString() : '-'}</td>
                        <td>
                          {hasPermission('production.edit') && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => { setSelectedRecord(r); setNewStatus(r.status); setView('updateStatus'); }}
                            >
                              Update Status
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
        )
      )}

      {/* Create form */}
      {view === 'create' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">New Production Run</h2>
          </div>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="prod-product">Product *</label>
                <select id="prod-product" className="form-select" value={productId}
                  onChange={(e) => setProductId(e.target.value)} required>
                  <option value="">Select product…</option>
                  {products.filter((p) => p.is_active).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-qty">Quantity Planned *</label>
                <input id="prod-qty" type="number" className="form-input" value={quantityPlanned}
                  onChange={(e) => setQuantityPlanned(e.target.value)} min="1" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-capacity">Weekly Capacity</label>
                <input id="prod-capacity" type="number" className="form-input" value={weeklyCapacity}
                  onChange={(e) => setWeeklyCapacity(e.target.value)} min="0" placeholder="0" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-start">Start Date</label>
                <input id="prod-start" type="date" className="form-input" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-completion">Expected Completion</label>
                <input id="prod-completion" type="date" className="form-input" value={expectedCompletion}
                  onChange={(e) => setExpectedCompletion(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-notes">Notes</label>
              <textarea id="prod-notes" className="form-textarea" value={notes}
                onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setView('list')} disabled={formLoading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Creating…' : 'Create Production Run'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Update status */}
      {view === 'updateStatus' && selectedRecord && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Update Production Status</h2>
          </div>
          <form onSubmit={handleUpdateStatus}>
            <p style={{ marginBottom: '16px' }}>
              Production #{selectedRecord.id} — {getProductName(selectedRecord.product_id)}
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-new-status">New Status</label>
              <select id="prod-new-status" className="form-select" value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setView('list')} disabled={formLoading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Saving…' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ProductionPage;
