// ManufacturingPage.jsx — Manufacturing assignments with full CRUD
// Covers view, create, update, and delete manufacturing assignments

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getManufacturingSummary,
} from '../services/manufacturingService';
import { getAllStaff } from '../services/staffService';
import { getProducts } from '../services/productService';

const SECTORS = ['Assembly', 'Testing', 'Packaging', 'Logistics', 'Quality Control', 'Other'];
const STATUSES = ['Working', 'On Break', 'Completed', 'Reassigned', 'Inactive'];
const SHIFTS = ['Day', 'Evening', 'Night'];

function ManufacturingPage() {
  const { hasPermission } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [staff, setStaff] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | create | edit
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state (shared between create and edit)
  const [staffId, setStaffId] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [productId, setProductId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState(STATUSES[0]);
  const [shift, setShift] = useState(SHIFTS[0]);
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [assignResult, staffResult, productResult, summaryResult] = await Promise.all([
        getAllAssignments(),
        getAllStaff(),
        getProducts(),
        getManufacturingSummary(),
      ]);
      setAssignments(assignResult.data?.assignments || assignResult.data || []);
      setStaff(staffResult.data?.staff || staffResult.data || []);
      setProducts(productResult.data?.products || productResult.data || []);
      setSummary(summaryResult.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    // Reset form
    setStaffId(staff[0]?.id || '');
    setSector(SECTORS[0]);
    setProductId(products[0]?.id || '');
    setStartDate('');
    setEndDate('');
    setStatus(STATUSES[0]);
    setShift(SHIFTS[0]);
    setNotes('');
    setSelectedAssignment(null);
    setView('create');
  }

  function openEdit(assignment) {
    setSelectedAssignment(assignment);
    setStaffId(assignment.staff_id || '');
    setSector(assignment.sector || SECTORS[0]);
    setProductId(assignment.product_id || '');
    setStartDate(assignment.start_date ? assignment.start_date.slice(0, 10) : '');
    setEndDate(assignment.end_date ? assignment.end_date.slice(0, 10) : '');
    setStatus(assignment.status || STATUSES[0]);
    setShift(assignment.shift || SHIFTS[0]);
    setNotes(assignment.notes || '');
    setView('edit');
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    setFormLoading(true);
    setError('');
    const data = {
      staff_id: staffId,
      sector,
      product_id: productId || null,
      start_date: startDate || null,
      end_date: endDate || null,
      status,
      shift,
      notes: notes.trim() || null,
    };
    try {
      if (view === 'edit' && selectedAssignment) {
        await updateAssignment(selectedAssignment.id, data);
        setSuccessMessage('Assignment updated!');
      } else {
        await createAssignment(data);
        setSuccessMessage('Assignment created!');
      }
      setView('list');
      loadAll();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(assignment) {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await deleteAssignment(assignment.id);
      setSuccessMessage('Assignment deleted.');
      loadAll();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete assignment.');
    }
  }

  function handleClose() {
    setView('list');
    setSelectedAssignment(null);
  }

  // Helper to get staff name by id
  function getStaffName(id) {
    const s = staff.find((m) => String(m.id) === String(id));
    return s ? `${s.first_name} ${s.last_name}` : `#${id}`;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🔧 Manufacturing</h1>
          <div className="page-header-sub">Manage sector assignments and shift schedules</div>
        </div>
        {hasPermission('manufacturing.create') && view === 'list' && (
          <button className="btn btn-primary" onClick={openCreate}>+ New Assignment</button>
        )}
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Summary cards */}
      {view === 'list' && summary && (
        <div className="stat-grid" style={{ marginBottom: '20px' }}>
          {Array.isArray(summary) ? summary.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-label">{s.sector || s.label}</div>
              <div className="stat-card-value">{s.count || s.total || 0}</div>
              <div className="stat-card-sub">assignments</div>
            </div>
          )) : (
            <div className="stat-card">
              <div className="stat-card-label">Total Assignments</div>
              <div className="stat-card-value">{summary.total || assignments.length}</div>
            </div>
          )}
        </div>
      )}

      {/* Assignments table */}
      {view === 'list' && (
        loading ? (
          <div className="spinner-wrapper"><div className="spinner" /> Loading…</div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {assignments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔧</div>
                <p>No manufacturing assignments found.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Sector</th>
                      <th>Shift</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id}>
                        <td>{getStaffName(a.staff_id)}</td>
                        <td>{a.sector}</td>
                        <td>{a.shift}</td>
                        <td>
                          <span className={`badge badge-${a.status?.toLowerCase().replace(' ', '') || 'working'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td>{a.start_date ? new Date(a.start_date).toLocaleDateString() : '-'}</td>
                        <td>{a.end_date ? new Date(a.end_date).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="table-actions">
                            {hasPermission('manufacturing.edit') && (
                              <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>Edit</button>
                            )}
                            {hasPermission('manufacturing.delete') && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a)}>Delete</button>
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

      {/* Create / Edit Form */}
      {(view === 'create' || view === 'edit') && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{view === 'edit' ? 'Edit Assignment' : 'New Assignment'}</h2>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="mfg-staff">Staff Member *</label>
                <select id="mfg-staff" className="form-select" value={staffId}
                  onChange={(e) => setStaffId(e.target.value)} required>
                  <option value="">-- Select staff --</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mfg-sector">Sector *</label>
                <select id="mfg-sector" className="form-select" value={sector}
                  onChange={(e) => setSector(e.target.value)}>
                  {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mfg-product">Product (optional)</label>
                <select id="mfg-product" className="form-select" value={productId}
                  onChange={(e) => setProductId(e.target.value)}>
                  <option value="">-- None --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mfg-shift">Shift</label>
                <select id="mfg-shift" className="form-select" value={shift}
                  onChange={(e) => setShift(e.target.value)}>
                  {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mfg-status">Status</label>
                <select id="mfg-status" className="form-select" value={status}
                  onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mfg-start">Start Date</label>
                <input id="mfg-start" type="date" className="form-input" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mfg-end">End Date</label>
                <input id="mfg-end" type="date" className="form-input" value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mfg-notes">Notes</label>
              <textarea id="mfg-notes" className="form-textarea" value={notes}
                onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handleClose} disabled={formLoading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Saving…' : view === 'edit' ? 'Save Changes' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ManufacturingPage;
