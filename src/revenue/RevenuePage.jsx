// RevenuePage.jsx — Company Revenue & Income Management
// Connects to existing backend APIs for Revenue records (Expense model with type='Income')

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getExpenseSummary,
  getRevenueRecords,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenseService';

const REVENUE_CATEGORIES = [
  'Product Sales Revenue',
  'Sales Revenue',
  'Advance Payment',
  'Wholesale Hardware',
  'Service Income',
  'Consulting & Engineering',
  'Other',
];

const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Credit Card', 'Cheque', 'UPI / IMPS'];

function RevenuePage() {
  const { hasPermission } = useAuth();

  // Data states
  const [summary, setSummary] = useState(null);
  const [revenueList, setRevenueList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal / View states
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [activeRecord, setActiveRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(REVENUE_CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [formReferenceNo, setFormReferenceNo] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirm state
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data on filter changes
  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedPaymentMethod, startDate, endDate]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPaymentMethod) params.payment_method = selectedPaymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [summaryRes, revenueRes] = await Promise.all([
        getExpenseSummary(startDate || endDate ? { start_date: startDate, end_date: endDate } : {}),
        getRevenueRecords(params),
      ]);

      setSummary(summaryRes.data || null);

      const items = revenueRes.data?.expenses || (Array.isArray(revenueRes.data) ? revenueRes.data : []);
      setRevenueList(items);
      setTotalCount(revenueRes.data?.total || items.length);
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      setError(err.response?.data?.message || 'Failed to load revenue data from backend.');
    } finally {
      setLoading(false);
    }
  }

  // Open Create Modal
  function handleOpenCreate() {
    setFormTitle('');
    setFormCategory(REVENUE_CATEGORIES[0]);
    setFormAmount('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormPaymentMethod(PAYMENT_METHODS[0]);
    setFormReferenceNo('');
    setFormNotes('');
    setFormError('');
    setActiveRecord(null);
    setModalMode('create');
  }

  // Open View Details Modal
  async function handleOpenView(record) {
    setActiveRecord(record);
    setModalMode('view');
    setDetailLoading(true);
    try {
      const detailed = await getExpenseById(record.id);
      if (detailed?.data) {
        setActiveRecord(detailed.data);
      }
    } catch {
      // Keep basic record if detailed fetch fails
    } finally {
      setDetailLoading(false);
    }
  }

  // Open Edit Modal
  function handleOpenEdit(record) {
    setActiveRecord(record);
    setFormTitle(record.title || '');
    setFormCategory(record.category || REVENUE_CATEGORIES[0]);
    setFormAmount(record.amount || '');
    setFormDate(record.date ? record.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setFormPaymentMethod(record.payment_method || PAYMENT_METHODS[0]);
    setFormReferenceNo(record.reference_no || '');
    setFormNotes(record.notes || '');
    setFormError('');
    setModalMode('edit');
  }

  // Close any open modal
  function handleCloseModal() {
    setModalMode(null);
    setActiveRecord(null);
    setFormError('');
  }

  // Submit Create or Edit
  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formTitle.trim()) {
      setFormError('Please enter a revenue title/source description.');
      return;
    }
    const parsedAmount = parseFloat(formAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid positive revenue amount in ₹.');
      return;
    }
    if (!formDate) {
      setFormError('Please select a valid transaction date.');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      type: 'Income', // Fixed to Income for Revenue screen
      category: formCategory,
      amount: parsedAmount,
      date: formDate,
      payment_method: formPaymentMethod,
      reference_no: formReferenceNo.trim() || null,
      notes: formNotes.trim() || null,
    };

    setFormSubmitting(true);
    try {
      if (modalMode === 'create') {
        await createExpense(payload);
        setSuccessMessage('Revenue record created successfully!');
      } else if (modalMode === 'edit') {
        await updateExpense(activeRecord.id, payload);
        setSuccessMessage('Revenue record updated successfully!');
      }
      handleCloseModal();
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Please check form inputs.');
    } finally {
      setFormSubmitting(false);
    }
  }

  // Delete Action
  async function handleConfirmDelete() {
    if (!recordToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteExpense(recordToDelete.id);
      setSuccessMessage(`Revenue record "${recordToDelete.title}" deleted.`);
      setRecordToDelete(null);
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete revenue record.');
      setRecordToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleResetFilters() {
    setSearch('');
    setSelectedCategory('');
    setSelectedPaymentMethod('');
    setStartDate('');
    setEndDate('');
  }

  const totalRevenueAmount = summary?.totalIncome ?? summary?.total_income ?? 0;
  const totalExpenseAmount = summary?.totalExpense ?? summary?.total_expenses ?? 0;
  const netBalanceAmount = summary?.netBalance ?? (totalRevenueAmount - totalExpenseAmount);

  return (
    <div>
      {/* Top Header with Tab Switcher */}
      <div className="page-header">
        <div>
          <h1>📈 Revenue & Income Tracker</h1>
          <div className="page-header-sub">
            Monitor client payments, hardware sales revenue, and business income in Indian Rupees (₹)
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasPermission('expenses.create') && (
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              + Record Revenue
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ borderRadius: '20px', padding: '6px 16px' }}
        >
          📈 Revenue ({totalCount})
        </button>
        <Link
          to="/expenses"
          className="btn btn-outline btn-sm"
          style={{ borderRadius: '20px', padding: '6px 16px', textDecoration: 'none' }}
        >
          💰 Expenses
        </Link>
      </div>

      {/* Alerts */}
      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Financial Summary Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card" style={{ borderLeftColor: '#1565c0' }}>
          <div className="stat-card-label">Total Revenue</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: '#1565c0' }}>
            ₹{parseFloat(totalRevenueAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-card-sub">Verified income across all operations</div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#3f3f5e' }}>
          <div className="stat-card-label">Operating Expenses</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: '#3f3f5e' }}>
            ₹{parseFloat(totalExpenseAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-card-sub">Current company costs & purchases</div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: netBalanceAmount >= 0 ? '#1b5e20' : '#b71c1c' }}>
          <div className="stat-card-label">Net Balance</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: netBalanceAmount >= 0 ? '#1b5e20' : '#b71c1c' }}>
            ₹{parseFloat(netBalanceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-card-sub">
            {netBalanceAmount >= 0 ? 'Surplus (Profitable)' : 'Deficit'}
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#1976d2' }}>
          <div className="stat-card-label">Revenue Records</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
            {totalCount}
          </div>
          <div className="stat-card-sub">Total revenue entries recorded</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="rev-search">Search Revenue</label>
            <input
              id="rev-search"
              type="text"
              className="form-input"
              placeholder="Search title, reference #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="rev-cat">Revenue Category</label>
            <select
              id="rev-cat"
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {REVENUE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="rev-pay">Payment Method</label>
            <select
              id="rev-pay"
              className="form-select"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              <option value="">All Payment Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="rev-start">From Date</label>
            <input
              id="rev-start"
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="rev-end">To Date</label>
            <input
              id="rev-end"
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', padding: '9px 12px' }}
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Revenue Records Table */}
      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /> Loading revenue data…</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {revenueList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📈</div>
              <p>No revenue records found matching your filters.</p>
              {hasPermission('expenses.create') && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '14px' }}
                  onClick={handleOpenCreate}
                >
                  + Record First Revenue
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title / Source</th>
                    <th>Category</th>
                    <th>Amount (₹)</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Reference / Order #</th>
                    <th>Recorded By</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title}</strong>
                        {item.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {item.notes.length > 50 ? `${item.notes.slice(0, 50)}…` : item.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-active">{item.category}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#1565c0' }}>
                        ₹{parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{item.date ? new Date(item.date).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{item.payment_method || 'Bank Transfer'}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#f0f4f8', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.reference_no || '-'}
                        </span>
                      </td>
                      <td>
                        {item.staff
                          ? `${item.staff.first_name || ''} ${item.staff.last_name || ''}`.trim()
                          : 'Staff'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            title="View Details"
                            onClick={() => handleOpenView(item)}
                          >
                            View
                          </button>
                          {hasPermission('expenses.edit') && (
                            <button
                              className="btn btn-outline btn-sm"
                              title="Edit Record"
                              onClick={() => handleOpenEdit(item)}
                            >
                              Edit
                            </button>
                          )}
                          {hasPermission('expenses.delete') && (
                            <button
                              className="btn btn-danger btn-sm"
                              title="Delete Record"
                              onClick={() => setRecordToDelete(item)}
                            >
                              Delete
                            </button>
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

      {/* Create / Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? '➕ Record New Revenue' : `✏️ Edit Revenue: ${activeRecord?.title}`}
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            {formError && <div className="alert alert-error">⚠️ {formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="m-rev-title">Revenue Title / Source Description *</label>
                <input
                  id="m-rev-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Advance Payment for CNC Batch #8812"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="m-rev-cat">Revenue Category *</label>
                  <select
                    id="m-rev-cat"
                    className="form-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                  >
                    {REVENUE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="m-rev-amount">Amount in Indian Rupees (₹) *</label>
                  <input
                    id="m-rev-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="m-rev-date">Transaction Date *</label>
                  <input
                    id="m-rev-date"
                    type="date"
                    className="form-input"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="m-rev-pay">Payment Method</label>
                  <select
                    id="m-rev-pay"
                    className="form-select"
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="m-rev-ref">Reference No. / Order / Bank UTR</label>
                <input
                  id="m-rev-ref"
                  type="text"
                  className="form-input"
                  placeholder="e.g. NEFT-HDFC-991048, PO-9810, INV-2026-001"
                  value={formReferenceNo}
                  onChange={(e) => setFormReferenceNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="m-rev-notes">Notes / Financial Remarks</label>
                <textarea
                  id="m-rev-notes"
                  className="form-textarea"
                  placeholder="Optional details regarding client, terms, or bank clearance..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCloseModal}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Saving…' : modalMode === 'create' ? 'Save Revenue' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {modalMode === 'view' && activeRecord && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">📄 Revenue Details</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            {detailLoading ? (
              <div className="spinner-wrapper"><div className="spinner" /> Loading details…</div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                    {activeRecord.title}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span className="badge badge-active">Revenue / Income</span>
                    <span className="badge badge-pending">{activeRecord.category}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div className="stat-card-label">Amount (₹)</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1565c0' }}>
                      ₹{parseFloat(activeRecord.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="stat-card-label">Transaction Date</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {activeRecord.date ? new Date(activeRecord.date).toLocaleDateString('en-IN') : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="stat-card-label">Payment Method</div>
                    <div style={{ fontSize: '0.95rem' }}>{activeRecord.payment_method || '-'}</div>
                  </div>
                  <div>
                    <div className="stat-card-label">Reference No.</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{activeRecord.reference_no || '-'}</div>
                  </div>
                </div>

                {activeRecord.staff && (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                    <div className="stat-card-label">Recorded By</div>
                    <div style={{ fontWeight: 600 }}>
                      {activeRecord.staff.first_name} {activeRecord.staff.last_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {activeRecord.staff.email} • {activeRecord.staff.role?.name || 'Staff'}
                    </div>
                  </div>
                )}

                {activeRecord.notes && (
                  <div style={{ marginBottom: '16px' }}>
                    <div className="stat-card-label">Remarks & Notes</div>
                    <p style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                      {activeRecord.notes}
                    </p>
                  </div>
                )}

                <div className="form-actions">
                  {hasPermission('expenses.edit') && (
                    <button
                      className="btn btn-outline"
                      onClick={() => handleOpenEdit(activeRecord)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={handleCloseModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="modal-overlay" onClick={() => setRecordToDelete(null)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: '#b71c1c' }}>⚠️ Confirm Delete</h2>
              <button className="modal-close-btn" onClick={() => setRecordToDelete(null)}>✕</button>
            </div>
            <p style={{ marginBottom: '16px' }}>
              Are you sure you want to permanently delete this revenue entry?
            </p>
            <div style={{ background: '#ffebee', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
              <strong>{recordToDelete.title}</strong>
              <div style={{ color: '#b71c1c', fontWeight: 600, marginTop: '4px' }}>
                ₹{parseFloat(recordToDelete.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-outline"
                onClick={() => setRecordToDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{ background: '#b71c1c', color: 'white' }}
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevenuePage;
