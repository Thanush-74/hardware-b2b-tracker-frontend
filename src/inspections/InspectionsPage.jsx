// InspectionsPage.jsx — Quality Inspection management
// Covers summary, list, create, edit, and delete

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getInspectionSummary,
  getAllInspections,
  createInspection,
  updateInspection,
  deleteInspection,
} from '../services/inspectionService';
import { getAllStaff } from '../services/staffService';
import { getProducts } from '../services/productService';

const ITEM_TYPES = ['Finished Good', 'Raw Material', 'Return', 'Production Batch'];
const RESULTS = ['Pending', 'Passed', 'Failed', 'Repairable', 'Replacement Required', 'Approved'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

function InspectionsPage() {
  const { hasPermission } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [staff, setStaff] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | create | edit
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form fields
  const [inspectorId, setInspectorId] = useState('');
  const [productId, setProductId] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [itemType, setItemType] = useState(ITEM_TYPES[0]);
  const [batchNumber, setBatchNumber] = useState('');
  const [qtyInspected, setQtyInspected] = useState('1');
  const [qtyPassed, setQtyPassed] = useState('0');
  const [qtyFailed, setQtyFailed] = useState('0');
  const [result, setResult] = useState(RESULTS[0]);
  const [defectType, setDefectType] = useState('');
  const [severity, setSeverity] = useState(SEVERITIES[0]);
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [inspResult, staffResult, productResult, summaryResult] = await Promise.all([
        getAllInspections(),
        getAllStaff(),
        getProducts(),
        getInspectionSummary(),
      ]);
      setInspections(inspResult.data?.inspections || inspResult.data || []);
      setStaff(staffResult.data?.staff || staffResult.data || []);
      setProducts(productResult.data?.products || productResult.data || []);
      setSummary(summaryResult.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inspections.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setInspectorId(staff[0]?.id || '');
    setProductId('');
    setInspectionDate(new Date().toISOString().slice(0, 10));
    setItemType(ITEM_TYPES[0]);
    setBatchNumber('');
    setQtyInspected('1'); setQtyPassed('0'); setQtyFailed('0');
    setResult(RESULTS[0]); setDefectType(''); setSeverity(SEVERITIES[0]);
    setNotes('');
  }

  function openCreate() {
    resetForm();
    setSelectedInspection(null);
    setView('create');
  }

  function openEdit(inspection) {
    setSelectedInspection(inspection);
    setInspectorId(inspection.inspector_id || '');
    setProductId(inspection.product_id || '');
    setInspectionDate(inspection.inspection_date ? inspection.inspection_date.slice(0, 10) : '');
    setItemType(inspection.item_type || ITEM_TYPES[0]);
    setBatchNumber(inspection.batch_number || '');
    setQtyInspected(String(inspection.quantity_inspected || 1));
    setQtyPassed(String(inspection.passed_quantity || 0));
    setQtyFailed(String(inspection.failed_quantity || 0));
    setResult(inspection.result || RESULTS[0]);
    setDefectType(inspection.defect_type || '');
    setSeverity(inspection.severity || SEVERITIES[0]);
    setNotes(inspection.notes || '');
    setView('edit');
  }

  function buildFormData() {
    return {
      inspector_id: inspectorId,
      product_id: productId || null,
      inspection_date: inspectionDate,
      item_type: itemType,
      batch_number: batchNumber.trim() || null,
      quantity_inspected: parseInt(qtyInspected, 10),
      passed_quantity: parseInt(qtyPassed, 10),
      failed_quantity: parseInt(qtyFailed, 10),
      result,
      defect_type: defectType.trim() || null,
      severity,
      notes: notes.trim() || null,
    };
  }

  async function handleCreate(event) {
    event.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await createInspection(buildFormData());
      setSuccessMessage('Inspection created!');
      setView('list');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create inspection.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEdit(event) {
    event.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await updateInspection(selectedInspection.id, buildFormData());
      setSuccessMessage('Inspection updated!');
      setView('list');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update inspection.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(inspection) {
    if (!window.confirm('Delete this inspection record?')) return;
    try {
      await deleteInspection(inspection.id);
      setSuccessMessage('Inspection deleted.');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete inspection.');
    }
  }

  function getStaffName(id) {
    const s = staff.find((m) => String(m.id) === String(id));
    return s ? `${s.first_name} ${s.last_name}` : `#${id}`;
  }

  function getProductName(id) {
    const p = products.find((pr) => String(pr.id) === String(id));
    return p ? p.name : (id ? `#${id}` : '-');
  }

  function resultBadge(res) {
    const map = {
      'Passed': 'badge-delivered', 'Failed': 'badge-inactive', 'Pending': 'badge-pending',
      'Approved': 'badge-active', 'Repairable': 'badge-processing',
      'Replacement Required': 'badge-shipped',
    };
    return <span className={`badge ${map[res] || 'badge-pending'}`}>{res}</span>;
  }

  function renderForm(onSubmit) {
    return (
      <form onSubmit={onSubmit}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="insp-inspector">Inspector (Staff) *</label>
            <select id="insp-inspector" className="form-select" value={inspectorId}
              onChange={(e) => setInspectorId(e.target.value)} required>
              <option value="">-- Select inspector --</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-product">Product (optional)</label>
            <select id="insp-product" className="form-select" value={productId}
              onChange={(e) => setProductId(e.target.value)}>
              <option value="">-- None --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-date">Inspection Date *</label>
            <input id="insp-date" type="date" className="form-input" value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-type">Item Type</label>
            <select id="insp-type" className="form-select" value={itemType}
              onChange={(e) => setItemType(e.target.value)}>
              {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-batch">Batch Number</label>
            <input id="insp-batch" type="text" className="form-input" value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)} placeholder="Optional batch ID" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-qty">Qty Inspected</label>
            <input id="insp-qty" type="number" className="form-input" value={qtyInspected}
              onChange={(e) => setQtyInspected(e.target.value)} min="1" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-passed">Qty Passed</label>
            <input id="insp-passed" type="number" className="form-input" value={qtyPassed}
              onChange={(e) => setQtyPassed(e.target.value)} min="0" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-failed">Qty Failed</label>
            <input id="insp-failed" type="number" className="form-input" value={qtyFailed}
              onChange={(e) => setQtyFailed(e.target.value)} min="0" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-result">Result</label>
            <select id="insp-result" className="form-select" value={result}
              onChange={(e) => setResult(e.target.value)}>
              {RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-severity">Severity</label>
            <select id="insp-severity" className="form-select" value={severity}
              onChange={(e) => setSeverity(e.target.value)}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="insp-defect">Defect Type</label>
            <input id="insp-defect" type="text" className="form-input" value={defectType}
              onChange={(e) => setDefectType(e.target.value)} placeholder="e.g. Soldering defect" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="insp-notes">Notes</label>
          <textarea id="insp-notes" className="form-textarea" value={notes}
            onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => setView('list')} disabled={formLoading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={formLoading}>
            {formLoading ? 'Saving…' : view === 'edit' ? 'Save Changes' : 'Create Inspection'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🔍 Quality Inspection</h1>
          <div className="page-header-sub">Log and track hardware quality inspections</div>
        </div>
        {hasPermission('inspection.create') && view === 'list' && (
          <button className="btn btn-primary" onClick={openCreate}>+ New Inspection</button>
        )}
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}
      {error && view === 'list' && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Summary */}
      {view === 'list' && summary && (
      <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total Inspections</div>
            <div className="stat-card-value">{summary.total || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Passed</div>
            <div className="stat-card-value">{summary.passed || 0}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#1a237e' }}>
            <div className="stat-card-label">Failed</div>
            <div className="stat-card-value">{summary.failed || 0}</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#00897b' }}>
            <div className="stat-card-label">Approved</div>
            <div className="stat-card-value">{summary.approved || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Pending</div>
            <div className="stat-card-value">{summary.pending || 0}</div>
          </div>
        </div>

      )}

      {view === 'list' && (
        loading ? (
          <div className="spinner-wrapper"><div className="spinner" /> Loading…</div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {inspections.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>No inspection records found.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Inspector</th>
                      <th>Product</th>
                      <th>Date</th>
                      <th>Item Type</th>
                      <th>Inspected / Pass / Fail</th>
                      <th>Result</th>
                      <th>Severity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspections.map((insp) => (
                      <tr key={insp.id}>
                        <td>#{insp.id}</td>
                        <td>{getStaffName(insp.inspector_id)}</td>
                        <td>{getProductName(insp.product_id)}</td>
                        <td>{new Date(insp.inspection_date).toLocaleDateString()}</td>
                        <td>{insp.item_type}</td>
                        <td>{insp.quantity_inspected} / {insp.passed_quantity} / {insp.failed_quantity}</td>
                        <td>{resultBadge(insp.result)}</td>
                        <td>{insp.severity}</td>
                        <td>
                          <div className="table-actions">
                            {hasPermission('inspection.edit') && (
                              <button className="btn btn-outline btn-sm" onClick={() => openEdit(insp)}>Edit</button>
                            )}
                            {hasPermission('inspection.delete') && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(insp)}>Delete</button>
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
        )
      )}

      {view === 'create' && (
        <div className="card">
          <div className="card-header"><h2 className="card-title">New Inspection Record</h2></div>
          {renderForm(handleCreate)}
        </div>
      )}

      {view === 'edit' && selectedInspection && (
        <div className="card">
          <div className="card-header"><h2 className="card-title">Edit Inspection #{selectedInspection.id}</h2></div>
          {renderForm(handleEdit)}
        </div>
      )}
    </div>
  );
}

export default InspectionsPage;
