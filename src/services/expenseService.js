// expenseService.js — All API calls for Expenses, Revenues & Financials
import api from './api';

// GET /api/expenses/summary — get expense, revenue & net balance summary
export async function getExpenseSummary(params = {}) {
  const response = await api.get('/expenses/summary', { params });
  return response.data;
}

// GET /api/expenses — list all expenses/revenues with optional filters
export async function getAllExpenses(params = {}) {
  const response = await api.get('/expenses', { params });
  return response.data;
}

// GET /api/expenses?type=Income — helper specifically for Revenue records
export async function getRevenueRecords(params = {}) {
  const response = await api.get('/expenses', {
    params: { ...params, type: 'Income' }
  });
  return response.data;
}

// GET /api/expenses?type=Expense — helper specifically for Expense records
export async function getExpenseRecords(params = {}) {
  const response = await api.get('/expenses', {
    params: { ...params, type: 'Expense' }
  });
  return response.data;
}

// GET /api/expenses/:id — get one expense or revenue record by ID
export async function getExpenseById(id) {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
}

// POST /api/expenses — create a new expense or income entry
// body: { title, type, category, amount, date, payment_method, reference_no, notes }
export async function createExpense(data) {
  const response = await api.post('/expenses', data);
  return response.data;
}

// PUT /api/expenses/:id — update an expense or revenue entry
export async function updateExpense(id, data) {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
}

// DELETE /api/expenses/:id — delete an expense or revenue entry
export async function deleteExpense(id) {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
}
