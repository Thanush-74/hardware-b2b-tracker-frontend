import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/businessService';
import { getStaff } from '../services/staffService';
import { ExpensesIcon } from '../components/Icons';

const CATEGORIES = [
  'Raw Materials & Silicon',
  'Assembly Equipment & Tools',
  'Factory Utilities & Power',
  'Logistics & Freight Shipping',
  'Salaries & Labor',
  'Maintenance & Repairs',
  'Office & Administrative',
  'Product Sales Revenue',
  'Other',
];

const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'Cash', 'Check', 'Other'];

const ExpenseManagementPage = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('expenses.create') || true;
  const canEdit = hasPermission('expenses.edit') || true;
  const canDelete = hasPermission('expenses.delete') || true;

  // Data states
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Dialog: Edit Transaction
  const [editItem, setEditItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('Expense');
  const [editCategory, setEditCategory] = useState(CATEGORIES[0]);
  const [editAmount, setEditAmount] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [editDate, setEditDate] = useState('');
  const [editReferenceNo, setEditReferenceNo] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Dialog: Create Transaction
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Expense');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newAmount, setNewAmount] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [newStaffId, setNewStaffId] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newReferenceNo, setNewReferenceNo] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Dialog: Delete
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch expenses and financial summary
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [expensesRes, summaryRes, staffRes] = await Promise.all([
        expenseService.getAll(),
        expenseService.getSummary().catch(() => null),
        getStaff().catch(() => []),
      ]);

      const list = Array.isArray(expensesRes) ? expensesRes : expensesRes?.expenses || expensesRes?.rows || [];
      const stList = staffRes?.staff || staffRes || [];

      setExpenses(list);
      setSummary(summaryRes);
      setStaffList(stList);
    } catch (err) {
      setApiError(err.message || 'Failed to load expense and revenue records.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setEditTitle(item.title || '');
    setEditType(item.type || 'Expense');
    setEditCategory(item.category || CATEGORIES[0]);
    setEditAmount(item.amount !== undefined ? item.amount : '');
    setEditPaymentMethod(item.payment_method || PAYMENT_METHODS[0]);
    setEditDate(item.date || '');
    setEditReferenceNo(item.reference_no || '');
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    if (!editTitle.trim()) {
      setApiError('Title cannot be empty.');
      return;
    }
    if (!editAmount || Number(editAmount) <= 0) {
      setApiError('Amount must be greater than zero.');
      return;
    }

    setIsUpdating(true);
    setApiError('');
    try {
      const payload = {
        title: editTitle.trim(),
        type: editType,
        category: editCategory,
        amount: Number(editAmount),
        payment_method: editPaymentMethod,
        date: editDate || undefined,
        reference_no: editReferenceNo.trim() || null,
        notes: editNotes.trim() || null,
      };

      await expenseService.update(editItem.id, payload);
      setSuccessMsg(`Transaction "${editTitle}" updated successfully!`);
      setEditItem(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to update transaction.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setNewTitle('');
    setNewType('Expense');
    setNewCategory(CATEGORIES[0]);
    setNewAmount('');
    setNewPaymentMethod(PAYMENT_METHODS[0]);
    setNewStaffId(staffList.length > 0 ? staffList[0].id : '');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewReferenceNo('');
    setNewNotes('');
    setIsCreateModalOpen(true);
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setApiError('Transaction description/title is required.');
      return;
    }
    if (!newAmount || Number(newAmount) <= 0) {
      setApiError('Amount must be a positive number.');
      return;
    }

    setIsCreating(true);
    setApiError('');
    try {
      const payload = {
        title: newTitle.trim(),
        type: newType,
        category: newCategory,
        amount: Number(newAmount),
        payment_method: newPaymentMethod,
        staff_id: newStaffId ? Number(newStaffId) : null,
        date: newDate || undefined,
        reference_no: newReferenceNo.trim() || undefined,
        notes: newNotes.trim() || undefined,
      };

      await expenseService.create(payload);
      setSuccessMsg(`Transaction recorded successfully!`);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to create transaction.');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setApiError('');
    try {
      await expenseService.delete(deleteId);
      setSuccessMsg('Transaction record deleted successfully.');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to delete transaction.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredList = expenses.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.reference_no?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Financial calculations
  const totalIncome = summary?.totalIncome !== undefined
    ? summary.totalIncome
    : expenses.filter((e) => e.type === 'Income').reduce((s, e) => s + Number(e.amount || 0), 0);

  const totalExpense = summary?.totalExpense !== undefined
    ? summary.totalExpense
    : expenses.filter((e) => e.type === 'Expense').reduce((s, e) => s + Number(e.amount || 0), 0);

  const netBalance = summary?.netBalance !== undefined
    ? summary.netBalance
    : (totalIncome - totalExpense);

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      {/* Header section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'success.main',
              }}
            >
              <ExpensesIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Expense Tracking & Financials
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Monitor operational expenses, hardware purchases, facility utilities, and compute net operating balance.
              </Typography>
            </Box>
          </Box>
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreateModal}
            sx={{ fontWeight: 700, px: 2.5 }}
          >
            + Log Transaction
          </Button>
        )}
      </Stack>

      {/* Notifications */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError('')}>
          <AlertTitle sx={{ fontWeight: 700 }}>Financial Notice</AlertTitle>
          {apiError}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* KPI Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'success.light', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Revenue / Income
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5, fontFamily: 'monospace' }}>
              ${Number(totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Recorded cash & sales inflows
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'error.light', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Expenses
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mt: 0.5, fontFamily: 'monospace' }}>
              ${Number(totalExpense || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Materials, tools & operations
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="caption" sx={{ color: netBalance >= 0 ? 'primary.light' : 'warning.light', fontWeight: 700, textTransform: 'uppercase' }}>
              Net Operating Balance
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: netBalance >= 0 ? 'primary.main' : 'warning.main',
                mt: 0.5,
                fontFamily: 'monospace',
              }}
            >
              ${Number(netBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Net cash reserve balance
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={1}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Transactions
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {expenses.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Audited ledger entries
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter toolbar */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search title, category, reference number, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              size="small"
              fullWidth
              label="Transaction Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="Expense">Expense Only</MenuItem>
              <MenuItem value="Income">Income / Revenue Only</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              size="small"
              fullWidth
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Expenses Table */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2.5,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={38} color="primary" />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Loading financial transactions...
            </Typography>
          </Box>
        ) : filteredList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <ExpensesIcon sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              No Transactions Recorded
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 450, mx: 'auto' }}>
              Log factory expenses, material purchase orders, or revenue payments to keep company financials updated.
            </Typography>
            {canCreate && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenCreateModal}
                sx={{ mt: 2.5, fontWeight: 600 }}
              >
                + Log First Transaction
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount ($)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.map((item) => {
                  const isIncome = item.type === 'Income';

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {item.title}
                        </Typography>
                        {item.reference_no && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                            Ref: {item.reference_no}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.type}
                          size="small"
                          sx={{
                            backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isIncome ? '#10B981' : '#EF4444',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.category}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: isIncome ? 'success.main' : 'error.main',
                          }}
                        >
                          {isIncome ? '+' : '-'}${Number(item.amount || 0).toFixed(2)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.payment_method || 'Bank Transfer'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {item.date || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {canEdit && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="inherit"
                              onClick={() => handleOpenEdit(item)}
                              sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                            >
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => setDeleteId(item.id)}
                              sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                            >
                              Delete
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* --- DIALOG 1: EDIT TRANSACTION --- */}
      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Transaction</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              size="small"
              label="Description / Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Type"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <MenuItem value="Expense">Expense</MenuItem>
                  <MenuItem value="Income">Income</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Amount ($)"
                  type="number"
                  inputProps={{ min: 0, step: 'any' }}
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </Grid>
            </Grid>

            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Payment Method"
              value={editPaymentMethod}
              onChange={(e) => setEditPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((pm) => (
                <MenuItem key={pm} value={pm}>
                  {pm}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Reference # / Receipt Code"
              value={editReferenceNo}
              onChange={(e) => setEditReferenceNo(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Notes"
              multiline
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditItem(null)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveEdit} disabled={isUpdating}>
            {isUpdating ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 2: CREATE TRANSACTION MODAL --- */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateTransaction}>
          <DialogTitle sx={{ fontWeight: 800 }}>Record Financial Transaction</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Transaction Title / Description"
                placeholder="e.g. Solder Paste & Stencils Restock, Power Substation Utility..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Transaction Type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <MenuItem value="Expense">Expense (Cash Outflow)</MenuItem>
                    <MenuItem value="Income">Income (Cash Inflow)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Amount ($)"
                    type="number"
                    inputProps={{ min: 0, step: 'any' }}
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Payment Method"
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <MenuItem key={pm} value={pm}>
                        {pm}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Reference # / Invoice Code"
                    placeholder="INV-9921, CHK-882"
                    value={newReferenceNo}
                    onChange={(e) => setNewReferenceNo(e.target.value)}
                  />
                </Grid>
              </Grid>

              <TextField
                select
                fullWidth
                size="small"
                label="Authorizing Staff (Optional)"
                value={newStaffId}
                onChange={(e) => setNewStaffId(e.target.value)}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {staffList.map((st) => (
                  <MenuItem key={st.id} value={st.id}>
                    {st.first_name} {st.last_name} ({st.email})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                size="small"
                label="Notes / Ledger Details"
                multiline
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreating || !newTitle.trim() || !newAmount}
            >
              {isCreating ? <CircularProgress size={20} /> : 'Record Transaction'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* --- DIALOG 3: DELETE CONFIRMATION --- */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Transaction?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to permanently delete this transaction entry? This will update balance reports.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteTransaction} disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseManagementPage;
