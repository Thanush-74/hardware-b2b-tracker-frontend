// ExpensesPage.jsx — Expenses & Financials management
// Covers summary stats, list, create, edit, and delete

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getExpenseSummary,
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/expenseService';

const CATEGORIES = [
  'Salaries', 'Utilities', 'Rent', 'Equipment', 'Shipping',
  'Marketing', 'Maintenance', 'Raw Materials', 'Sales Revenue',
  'Order Revenue', 'Other',
];
const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Credit Card', 'Cheque'];
const TYPES = ['Expense', 'Income'];

function ExpensesPage() {
  const { hasPermission } = useAuth();
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | create | edit
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterType, setFilterType] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterType]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterType) params.type = filterType;
      const [summaryResult, expensesResult] = await Promise.all([
        getExpenseSummary(),
        getAllExpenses(params),
      ]);
      setSummary(summaryResult.data || null);
      const list = expensesResult.data?.expenses || expensesResult.data || [];
      setExpenses(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setTitle(''); setType('Expense'); setCategory(CATEGORIES[0]);
    setAmount(''); setDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod(PAYMENT_METHODS[0]); setReferenceNo(''); setNotes('');
    setSelectedExpense(null);
    setView('create');
  }

  function openEdit(expense) {
    setSelectedExpense(expense);
    setTitle(expense.title || '');
    setType(expense.type || 'Expense');
    setCategory(expense.category || CATEGORIES[0]);
    setAmount(expense.amount || '');
    setDate(expense.date ? expense.date.slice(0, 10) : '');
    setPaymentMethod(expense.payment_method || PAYMENT_METHODS[0]);
    setReferenceNo(expense.reference_no || '');
    setNotes(expense.notes || '');
    setView('edit');
  }

  function buildFormData() {
    return {
      title: title.trim(),
      type,
      category,
      amount: parseFloat(amount),
      date,
      payment_method: paymentMethod,
      reference_no: referenceNo.trim() || null,
      notes: notes.trim() || null,
    };
  }

  async function handleCreate(event) {
    event.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await createExpense(buildFormData());
      setSuccessMessage('Record created!');
      setView('list');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create record.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEdit(event) {
    event.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await updateExpense(selectedExpense.id, buildFormData());
      setSuccessMessage('Record updated!');
      setView('list');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update record.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(expense) {
    if (!window.confirm(`Delete "${expense.title}"?`)) return;
    try {
      await deleteExpense(expense.id);
      setSuccessMessage('Record deleted.');
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record.');
    }
  }

  // The shared form JSX used for both create and edit
  function renderForm(onSubmit) {
    return (
      <form onSubmit={onSubmit}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="exp-title">Title *</label>
            <input id="exp-title" type="text" className="form-input" value={title}
              onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-type">Type *</label>
            <select id="exp-type" className="form-select" value={type}
              onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-category">Category *</label>
            <select id="exp-category" className="form-select" value={category}
              onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-amount">Amount ($) *</label>
            <input id="exp-amount" type="number" className="form-input" value={amount}
              onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-date">Date *</label>
            <input id="exp-date" type="date" className="form-input" value={date}
              onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-payment">Payment Method</label>
            <select id="exp-payment" className="form-select" value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="exp-ref">Reference No.</label>
            <input id="exp-ref" type="text" className="form-input" value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)} placeholder="INV-001 etc." />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="exp-notes">Notes</label>
          <textarea id="exp-notes" className="form-textarea" value={notes}
            onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => setView('list')} disabled={formLoading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={formLoading}>
            {formLoading ? 'Saving…' : view === 'edit' ? 'Save Changes' : 'Create Record'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>💰 Expenses & Financials</h1>
          <div className="page-header-sub">Track income and expenses across all operations</div>
        </div>
        {hasPermission('expenses.create') && view === 'list' && (
          <button className="btn btn-primary" onClick={openCreate}>+ Add Record</button>
        )}
      </div>

      {successMessage && <div className="alert alert-success">✔ {successMessage}</div>}
      {error && view === 'list' && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Summary cards */}
      {view === 'list' && summary && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total Income</div>
            <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>
              ${parseFloat(summary.total_income || 0).toLocaleString()}
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#1a237e' }}>
            <div className="stat-card-label">Total Expenses</div>
            <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>
              ${parseFloat(summary.total_expenses || 0).toLocaleString()}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Net Balance</div>
            <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>
              ${parseFloat((summary.total_income || 0) - (summary.total_expenses || 0)).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      {view === 'list' && (
        <div className="filter-bar">
          <select className="form-select" value={filterType}
            onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="Expense">Expenses Only</option>
            <option value="Income">Income Only</option>
          </select>
        </div>
      )}

      {/* Expenses table */}
      {view === 'list' && (
        loading ? (
          <div className="spinner-wrapper"><div className="spinner" /> Loading…</div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💰</div>
                <p>No financial records found.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td><strong>{exp.title}</strong></td>
                        <td>
                          <span className={`badge ${exp.type === 'Income' ? 'badge-active' : 'badge-pending'}`}>
                            {exp.type}
                          </span>
                        </td>
                        <td>{exp.category}</td>
                        <td>${parseFloat(exp.amount).toFixed(2)}</td>
                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                        <td>{exp.payment_method || '-'}</td>
                        <td>
                          <div className="table-actions">
                            {hasPermission('expenses.edit') && (
                              <button className="btn btn-outline btn-sm" onClick={() => openEdit(exp)}>Edit</button>
                            )}
                            {hasPermission('expenses.delete') && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exp)}>Delete</button>
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
          <div className="card-header"><h2 className="card-title">Add Financial Record</h2></div>
          {renderForm(handleCreate)}
        </div>
      )}

      {view === 'edit' && selectedExpense && (
        <div className="card">
          <div className="card-header"><h2 className="card-title">Edit: {selectedExpense.title}</h2></div>
          {renderForm(handleEdit)}
        </div>
      )}
    </div>
  );
}

export default ExpensesPage;
