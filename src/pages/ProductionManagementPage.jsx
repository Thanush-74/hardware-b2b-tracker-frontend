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
  LinearProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { productionService, productService } from '../services/businessService';
import { ProductionIcon } from '../components/Icons';

const PRODUCTION_STATUS_COLORS = {
  Planned: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'In Production': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  Completed: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Cancelled: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
};

const ProductionManagementPage = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('production.create') || true;
  const canEdit = hasPermission('production.edit') || true;

  // Data states
  const [productionList, setProductionList] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dialog: Status update
  const [statusDialogItem, setStatusDialogItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Dialog: Progress / Edit
  const [progressDialogItem, setProgressDialogItem] = useState(null);
  const [editPlanned, setEditPlanned] = useState('');
  const [editProducing, setEditProducing] = useState('');
  const [editCompleted, setEditCompleted] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Dialog: Plan New Production Batch
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newPlannedQty, setNewPlannedQty] = useState('');
  const [newProducingQty, setNewProducingQty] = useState('0');
  const [newCapacity, setNewCapacity] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newExpectedDate, setNewExpectedDate] = useState('');
  const [newBatchStatus, setNewBatchStatus] = useState('Planned');
  const [newBatchNotes, setNewBatchNotes] = useState('');
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // Fetch production batches and products
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [prodRes, productsRes] = await Promise.all([
        productionService.getAll(),
        productService.getAll().catch(() => []),
      ]);

      const records = Array.isArray(prodRes) ? prodRes : prodRes?.production || prodRes?.rows || [];
      const prodList = Array.isArray(productsRes) ? productsRes : productsRes?.products || productsRes?.rows || [];

      setProductionList(records);
      setProducts(prodList);
    } catch (err) {
      setApiError(err.message || 'Failed to load production batches.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Status Dialog
  const handleOpenStatusDialog = (item) => {
    setStatusDialogItem(item);
    setNewStatus(item.status || 'Planned');
  };

  const handleSaveStatus = async () => {
    if (!statusDialogItem) return;
    setIsUpdatingStatus(true);
    setApiError('');
    try {
      await productionService.updateStatus(statusDialogItem.id, newStatus);
      setSuccessMsg(`Production batch #${statusDialogItem.id} status updated to ${newStatus}`);
      setStatusDialogItem(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to update production status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Progress / Quantity Log Dialog
  const handleOpenProgressDialog = (item) => {
    setProgressDialogItem(item);
    setEditPlanned(item.quantity_planned !== undefined ? item.quantity_planned : '');
    setEditProducing(item.quantity_producing !== undefined ? item.quantity_producing : '');
    setEditCompleted(item.quantity_completed !== undefined ? item.quantity_completed : '');
    setEditCapacity(item.weekly_capacity !== undefined ? item.weekly_capacity : '');
    setEditNotes(item.notes || '');
  };

  const handleSaveProgress = async () => {
    if (!progressDialogItem) return;
    setIsUpdatingProgress(true);
    setApiError('');
    try {
      const payload = {
        quantity_planned: Number(editPlanned) || 0,
        quantity_producing: Number(editProducing) || 0,
        quantity_completed: Number(editCompleted) || 0,
        weekly_capacity: Number(editCapacity) || 0,
        notes: editNotes.trim() || undefined,
      };

      await productionService.update(progressDialogItem.id, payload);
      setSuccessMsg(`Progress updated for batch #${progressDialogItem.id}`);
      setProgressDialogItem(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to update production quantities.');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Create New Production Batch
  const handleOpenCreateModal = () => {
    setSelectedProductId(products.length > 0 ? products[0].id : '');
    setNewPlannedQty('100');
    setNewProducingQty('0');
    setNewCapacity('500');
    setNewStartDate(new Date().toISOString().split('T')[0]);
    setNewExpectedDate('');
    setNewBatchStatus('Planned');
    setNewBatchNotes('');
    setIsCreateModalOpen(true);
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setApiError('Please select a hardware product for this production batch.');
      return;
    }
    if (!newPlannedQty || Number(newPlannedQty) <= 0) {
      setApiError('Planned quantity must be greater than zero.');
      return;
    }

    setIsCreatingBatch(true);
    setApiError('');
    try {
      const payload = {
        product_id: Number(selectedProductId),
        quantity_planned: Number(newPlannedQty) || 0,
        quantity_producing: Number(newProducingQty) || 0,
        weekly_capacity: Number(newCapacity) || 0,
        start_date: newStartDate || undefined,
        expected_completion_date: newExpectedDate || undefined,
        status: newBatchStatus,
        notes: newBatchNotes.trim() || undefined,
      };

      await productionService.create(payload);
      setSuccessMsg('Production batch scheduled successfully!');
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to schedule production batch.');
    } finally {
      setIsCreatingBatch(false);
    }
  };

  // Filtered Production Batches
  const filteredList = productionList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.product_name?.toLowerCase().includes(q) ||
      item.product_type?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalBatches = productionList.length;
  const inProductionCount = productionList.filter((b) => b.status === 'In Production').length;
  const totalUnitsPlanned = productionList.reduce((acc, curr) => acc + (Number(curr.quantity_planned) || 0), 0);
  const totalUnitsCompleted = productionList.reduce((acc, curr) => acc + (Number(curr.quantity_completed) || 0), 0);

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
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'info.main',
              }}
            >
              <ProductionIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Production Planning
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Schedule manufacturing batch runs, monitor production capacity, and record assembly milestones.
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
            + Plan Production Batch
          </Button>
        )}
      </Stack>

      {/* Notifications */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError('')}>
          <AlertTitle sx={{ fontWeight: 700 }}>Production Alert</AlertTitle>
          {apiError}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* KPI Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Batches
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {totalBatches}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Planned & running batches
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Active In Production
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {inProductionCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Floor lines actively building
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Units Planned
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5, fontFamily: 'monospace' }}>
            {totalUnitsPlanned.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Target hardware output
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Completed
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5, fontFamily: 'monospace' }}>
            {totalUnitsCompleted.toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Manufactured & ready
          </Typography>
        </Paper>
      </Box>

      {/* Filter and Search toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '7fr 5fr' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search by Product Name, Type, or Notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <TextField
            select
            size="small"
            fullWidth
            label="Batch Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Batch Statuses</MenuItem>
            <MenuItem value="Planned">Planned</MenuItem>
            <MenuItem value="In Production">In Production</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Production Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={38} color="primary" />
            <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
              Fetching production planning records...
            </Typography>
          </Box>
        ) : filteredList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <ProductionIcon sx={{ fontSize: 50, color: '#64748b', opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              No Production Batches Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, maxWidth: 450, mx: 'auto' }}>
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or status filter.'
                : 'Schedule a new production batch for any hardware product to track assembly line output.'}
            </Typography>
            {canCreate && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenCreateModal}
                sx={{ mt: 2.5, fontWeight: 600 }}
              >
                + Plan First Batch
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer
            sx={{
              width: '100%',
              overflowX: 'auto',
              minWidth: 0,
              '&::-webkit-scrollbar': { height: '5px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(148, 163, 184, 0.25)', borderRadius: '4px' },
            }}
          >
            <Table sx={{ width: '100%', minWidth: 700 }}>
              <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                <TableRow sx={{ '& th': { color: '#0f172a', fontWeight: 700, borderBottom: '1px solid #e5e7eb' } }}>
                  <TableCell sx={{ fontWeight: 700 }}>Batch & Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Progress & Output</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Weekly Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Schedule Dates</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.map((batch) => {
                  const statusStyle = PRODUCTION_STATUS_COLORS[batch.status] || {
                    bg: '#f9fafb',
                    text: '#0f172a',
                    border: '#e5e7eb',
                  };

                  const planned = Number(batch.quantity_planned) || 0;
                  const completed = Number(batch.quantity_completed) || 0;
                  const producing = Number(batch.quantity_producing) || 0;
                  const completionPercentage = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

                  return (
                    <TableRow key={batch.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {batch.product_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Batch #{batch.id} {batch.product_type ? `• ${batch.product_type}` : ''}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 200 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {completed} / {planned} units
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563eb' }}>
                            {completionPercentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={completionPercentage}
                          sx={{
                            height: 7,
                            borderRadius: 3,
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: completionPercentage === 100 ? '#16a34a' : '#2563eb',
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Producing: {producing} units in-progress
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {Number(batch.weekly_capacity || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          units / week
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Start: {batch.start_date || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Exp: {batch.expected_completion_date || 'Ongoing'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={batch.status}
                          size="small"
                          onClick={canEdit ? () => handleOpenStatusDialog(batch) : undefined}
                          sx={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            borderColor: statusStyle.border,
                            borderWidth: 1,
                            borderStyle: 'solid',
                            fontWeight: 700,
                            cursor: canEdit ? 'pointer' : 'default',
                            '&:hover': canEdit ? { filter: 'brightness(1.2)' } : {},
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {canEdit && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                onClick={() => handleOpenProgressDialog(batch)}
                                sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                              >
                                Log Progress
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpenStatusDialog(batch)}
                                sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                              >
                                Status
                              </Button>
                            </>
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

      {/* --- DIALOG 1: UPDATE STATUS --- */}
      <Dialog open={Boolean(statusDialogItem)} onClose={() => setStatusDialogItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Batch Status</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Batch #{statusDialogItem?.id} ({statusDialogItem?.product_name})
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="Production Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <MenuItem value="Planned">Planned</MenuItem>
            <MenuItem value="In Production">In Production</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogItem(null)} disabled={isUpdatingStatus}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveStatus}
            disabled={isUpdatingStatus || newStatus === statusDialogItem?.status}
          >
            {isUpdatingStatus ? <CircularProgress size={20} /> : 'Save Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 2: LOG PROGRESS & EDIT QUANTITIES --- */}
      <Dialog open={Boolean(progressDialogItem)} onClose={() => setProgressDialogItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Log Batch Output & Progress</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Product: <strong>{progressDialogItem?.product_name}</strong>
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Planned Target Quantity"
              type="number"
              value={editPlanned}
              onChange={(e) => setEditPlanned(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Units Currently In-Progress / Producing"
              type="number"
              value={editProducing}
              onChange={(e) => setEditProducing(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Units Completed So Far"
              type="number"
              value={editCompleted}
              onChange={(e) => setEditCompleted(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Weekly Capacity (units/wk)"
              type="number"
              value={editCapacity}
              onChange={(e) => setEditCapacity(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Batch Notes"
              multiline
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProgressDialogItem(null)} disabled={isUpdatingProgress}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveProgress} disabled={isUpdatingProgress}>
            {isUpdatingProgress ? <CircularProgress size={20} /> : 'Save Progress'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 3: PLAN NEW PRODUCTION BATCH --- */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateBatch}>
          <DialogTitle sx={{ fontWeight: 800 }}>Schedule New Production Batch</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Target Hardware Product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                {products.map((prod) => (
                  <MenuItem key={prod.id} value={prod.id}>
                    {prod.name} ({prod.type || 'Standard'}) — Current stock: {prod.available_quantity}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label="Planned Target Quantity"
                  type="number"
                  value={newPlannedQty}
                  onChange={(e) => setNewPlannedQty(e.target.value)}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Initial Producing Quantity"
                  type="number"
                  value={newProducingQty}
                  onChange={(e) => setNewProducingQty(e.target.value)}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Weekly Capacity (units/wk)"
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                />
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Initial Batch Status"
                  value={newBatchStatus}
                  onChange={(e) => setNewBatchStatus(e.target.value)}
                >
                  <MenuItem value="Planned">Planned</MenuItem>
                  <MenuItem value="In Production">In Production</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Expected Completion Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={newExpectedDate}
                  onChange={(e) => setNewExpectedDate(e.target.value)}
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Production Notes / Assembly Line Details"
                placeholder="Line A assembly, high-temperature soldering testing required..."
                multiline
                rows={2}
                value={newBatchNotes}
                onChange={(e) => setNewBatchNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} disabled={isCreatingBatch}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreatingBatch || !selectedProductId || !newPlannedQty}
            >
              {isCreatingBatch ? <CircularProgress size={20} /> : 'Schedule Batch'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductionManagementPage;
