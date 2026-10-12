// expenseService.js — All API calls for Expenses & Financials
import api from './api';

// GET /api/expenses/summary  — get expense & revenue totals summary
export async function getExpenseSummary() {
  const response = await api.get('/expenses/summary');
  return response.data;
}

// GET /api/expenses  — list all expenses
export async function getAllExpenses(params = {}) {
  const response = await api.get('/expenses', { params });
  return response.data;
}

// GET /api/expenses/:id  — get one expense
export async function getExpenseById(id) {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
}

// POST /api/expenses  — create a new expense or income entry
// body: { title, type, category, amount, date, payment_method, reference_no, notes }
export async function createExpense(data) {
  const response = await api.post('/expenses', data);
  return response.data;
}

// PUT /api/expenses/:id  — update an expense
export async function updateExpense(id, data) {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
}

// DELETE /api/expenses/:id  — delete an expense
export async function deleteExpense(id) {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
}
