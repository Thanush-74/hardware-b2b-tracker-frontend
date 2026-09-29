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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { returnService, orderService, productService } from '../services/businessService';
import { ReturnsIcon } from '../components/Icons';

const RETURN_STATUS_COLORS = {
  Requested: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
  Approved: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
  Rejected: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
  Received: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
  Replaced: { bg: 'rgba(14, 165, 233, 0.15)', text: '#0EA5E9', border: 'rgba(14, 165, 233, 0.3)' },
  Refunded: { bg: 'rgba(234, 88, 12, 0.15)', text: '#EA580C', border: 'rgba(234, 88, 12, 0.3)' },
  Completed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
};

const ReturnsManagementPage = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('returns.create') || true;
  const canEdit = hasPermission('returns.edit') || true;

  // Data states
  const [returnsList, setReturnsList] = useState([]);
  const [orders, setOrders] = useState([]);
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

  // Dialog: Record Replacement
  const [replacementDialogItem, setReplacementDialogItem] = useState(null);
  const [replacementProdId, setReplacementProdId] = useState('');
  const [replacementQty, setReplacementQty] = useState('1');
  const [replacementNotes, setReplacementNotes] = useState('');
  const [isRecordingReplacement, setIsRecordingReplacement] = useState(false);

  // Dialog: Create Return Request
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');
  const [newReason, setNewReason] = useState('');
  const [newReplacementReq, setNewReplacementReq] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [isCreatingReturn, setIsCreatingReturn] = useState(false);

  // Fetch returns, orders, and products
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [returnsRes, ordersRes, prodRes] = await Promise.all([
        returnService.getAll(),
        orderService.getAll().catch(() => []),
        productService.getAll().catch(() => []),
      ]);

      const list = Array.isArray(returnsRes) ? returnsRes : returnsRes?.returns || returnsRes?.rows || [];
      const ords = Array.isArray(ordersRes) ? ordersRes : ordersRes?.orders || ordersRes?.rows || [];
      const prods = Array.isArray(prodRes) ? prodRes : prodRes?.products || prodRes?.rows || [];

      setReturnsList(list);
      setOrders(ords);
      setProducts(prods);
    } catch (err) {
      setApiError(err.message || 'Failed to load returns records.');
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
    setNewStatus(item.status || 'Requested');
  };

  const handleSaveStatus = async () => {
    if (!statusDialogItem) return;
    setIsUpdatingStatus(true);
    setApiError('');
    try {
      await returnService.updateStatus(statusDialogItem.id, newStatus);
      setSuccessMsg(`Return ${statusDialogItem.return_number} status changed to ${newStatus}`);
      setStatusDialogItem(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to update return status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Replacement Dialog
  const handleOpenReplacementDialog = (item) => {
    setReplacementDialogItem(item);
    setReplacementProdId(item.replacement_product_id || item.product_id || '');
    setReplacementQty(item.replacement_quantity || item.quantity || '1');
    setReplacementNotes(item.notes || '');
  };

  const handleSaveReplacement = async () => {
    if (!replacementDialogItem) return;
    setIsRecordingReplacement(true);
    setApiError('');
    try {
      const payload = {
        replacement_product_id: replacementProdId ? Number(replacementProdId) : null,
        replacement_quantity: Number(replacementQty) || 0,
        notes: replacementNotes.trim() || undefined,
      };

      await returnService.recordReplacement(replacementDialogItem.id, payload);
      setSuccessMsg(`Replacement information recorded for ${replacementDialogItem.return_number}`);
      setReplacementDialogItem(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to record replacement info.');
    } finally {
      setIsRecordingReplacement(false);
    }
  };

  // Create Return Dialog handlers
  const handleOpenCreateModal = () => {
    setNewOrderId(orders.length > 0 ? orders[0].id : '');
    setNewProductId(products.length > 0 ? products[0].id : '');
    setNewCustomerName(orders.length > 0 ? orders[0].customer_name || '' : '');
    setNewQuantity('1');
    setNewReason('');
    setNewReplacementReq(false);
    setNewNotes('');
    setIsCreateModalOpen(true);
  };

  const handleSelectOrder = (orderId) => {
    setNewOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setNewCustomerName(ord.customer_name || '');
      if (ord.items && ord.items.length > 0) {
        setNewProductId(ord.items[0].product_id);
      }
    }
  };

  const handleCreateReturn = async (e) => {
    e.preventDefault();
    if (!newOrderId) {
      setApiError('Please select a customer order.');
      return;
    }
    if (!newProductId) {
      setApiError('Please select the returned hardware product.');
      return;
    }
    if (!newReason.trim()) {
      setApiError('Return reason is required.');
      return;
    }

    setIsCreatingReturn(true);
    setApiError('');
    try {
      const payload = {
        order_id: Number(newOrderId),
        product_id: Number(newProductId),
        customer_name: newCustomerName.trim() || undefined,
        quantity: Number(newQuantity) || 1,
        return_reason: newReason.trim(),
        replacement_required: Boolean(newReplacementReq),
        notes: newNotes.trim() || undefined,
      };

      const res = await returnService.create(payload);
      setSuccessMsg(`Return record ${res.return_number || ''} submitted successfully!`);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to create return record.');
    } finally {
      setIsCreatingReturn(false);
    }
  };

  // Filter list
  const filteredList = returnsList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.return_number?.toLowerCase().includes(q) ||
      item.customer_name?.toLowerCase().includes(q) ||
      item.product_name?.toLowerCase().includes(q) ||
      item.return_reason?.toLowerCase().includes(q) ||
      item.order_number?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalReturns = returnsList.length;
  const requestedCount = returnsList.filter((r) => r.status === 'Requested').length;
  const replacedCount = returnsList.filter((r) => r.status === 'Replaced').length;
  const completedCount = returnsList.filter((r) => r.status === 'Completed' || r.status === 'Refunded').length;

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
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'error.main',
              }}
            >
              <ReturnsIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Returns & Replacement (RMA)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Process customer warranty claims, hardware defects, replacements, and refund authorizations.
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
            + Log Return (RMA)
          </Button>
        )}
      </Stack>

      {/* Notifications */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError('')}>
          <AlertTitle sx={{ fontWeight: 700 }}>RMA Notice</AlertTitle>
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
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Return Requests
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {totalReturns}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Warranty & defect cases
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
            <Typography variant="caption" sx={{ color: 'warning.light', fontWeight: 700, textTransform: 'uppercase' }}>
              Pending Authorization
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mt: 0.5 }}>
              {requestedCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Awaiting RMA approval
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
            <Typography variant="caption" sx={{ color: 'info.light', fontWeight: 700, textTransform: 'uppercase' }}>
              Hardware Replaced
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', mt: 0.5 }}>
              {replacedCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Replacement units shipped
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
            <Typography variant="caption" sx={{ color: 'success.light', fontWeight: 700, textTransform: 'uppercase' }}>
              Resolved & Refunded
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
              {completedCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Closed customer cases
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
          <Grid item xs={12} md={7}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by RMA #, Customer, Product, Order #, or Reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              select
              size="small"
              fullWidth
              label="RMA Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All RMA Statuses</MenuItem>
              <MenuItem value="Requested">Requested</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Received">Received</MenuItem>
              <MenuItem value="Replaced">Replaced</MenuItem>
              <MenuItem value="Refunded">Refunded</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Returns Table */}
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
              Loading RMA records...
            </Typography>
          </Box>
        ) : filteredList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <ReturnsIcon sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              No Return Records Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 450, mx: 'auto' }}>
              Log a return request for any delivered customer order to manage warranty replacements.
            </Typography>
            {canCreate && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenCreateModal}
                sx={{ mt: 2.5, fontWeight: 600 }}
              >
                + Log First Return (RMA)
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>RMA Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order & Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Returned Hardware</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason / Defect</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Replacement</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.map((item) => {
                  const statusStyle = RETURN_STATUS_COLORS[item.status] || {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    text: '#FFF',
                    border: 'rgba(255, 255, 255, 0.1)',
                  };

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'error.light' }}>
                          {item.return_number}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.return_date || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {item.customer_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.order_number || `Order #${item.order_id}`}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.product_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Qty: {item.quantity} unit(s)
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                          {item.return_reason}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {item.replacement_required ? (
                          <Chip
                            label={item.replacement_product_name ? `${item.replacement_product_name} (${item.replacement_quantity})` : 'Replacement Required'}
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Refund / Repair
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          onClick={canEdit ? () => handleOpenStatusDialog(item) : undefined}
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
                                onClick={() => handleOpenReplacementDialog(item)}
                                sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                              >
                                Replacement
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpenStatusDialog(item)}
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
        <DialogTitle sx={{ fontWeight: 700 }}>Update RMA Status</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            RMA: <strong>{statusDialogItem?.return_number}</strong>
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="RMA Lifecycle Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <MenuItem value="Requested">Requested</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Received">Received (In Inspection)</MenuItem>
            <MenuItem value="Replaced">Replaced (Hardware Shipped)</MenuItem>
            <MenuItem value="Refunded">Refunded</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
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

      {/* --- DIALOG 2: RECORD REPLACEMENT --- */}
      <Dialog open={Boolean(replacementDialogItem)} onClose={() => setReplacementDialogItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Replacement Unit</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Replacement Hardware Product"
              value={replacementProdId}
              onChange={(e) => setReplacementProdId(e.target.value)}
            >
              {products.map((prod) => (
                <MenuItem key={prod.id} value={prod.id}>
                  {prod.name} ({prod.type || 'Standard'}) — Stock: {prod.available_quantity}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Replacement Quantity"
              type="number"
              value={replacementQty}
              onChange={(e) => setReplacementQty(e.target.value)}
            />

            <TextField
              fullWidth
              size="small"
              label="Replacement / Tracking Notes"
              multiline
              rows={2}
              value={replacementNotes}
              onChange={(e) => setReplacementNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReplacementDialogItem(null)} disabled={isRecordingReplacement}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveReplacement} disabled={isRecordingReplacement}>
            {isRecordingReplacement ? <CircularProgress size={20} /> : 'Save Replacement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 3: CREATE RETURN MODAL --- */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateReturn}>
          <DialogTitle sx={{ fontWeight: 800 }}>Log Customer Return (RMA)</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Customer Order"
                value={newOrderId}
                onChange={(e) => handleSelectOrder(e.target.value)}
              >
                {orders.map((ord) => (
                  <MenuItem key={ord.id} value={ord.id}>
                    {ord.order_number} — {ord.customer_name} ({ord.order_status})
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    select
                    required
                    fullWidth
                    size="small"
                    label="Hardware Product Returned"
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                  >
                    {products.map((prod) => (
                      <MenuItem key={prod.id} value={prod.id}>
                        {prod.name} ({prod.type || 'Standard'})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Quantity"
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                size="small"
                label="Customer / Contact Name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />

              <TextField
                required
                fullWidth
                size="small"
                label="Return Reason / Hardware Defect Description"
                placeholder="e.g. Memory controller overheating, PCIe lane degradation, dead on arrival..."
                multiline
                rows={2}
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={newReplacementReq}
                    onChange={(e) => setNewReplacementReq(e.target.checked)}
                    color="primary"
                  />
                }
                label="Customer requested direct unit replacement (instead of refund/credit)"
              />

              <TextField
                fullWidth
                size="small"
                label="Internal RMA Notes"
                placeholder="Serial number, return shipment label ID..."
                multiline
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} disabled={isCreatingReturn}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreatingReturn || !newOrderId || !newProductId || !newReason.trim()}
            >
              {isCreatingReturn ? <CircularProgress size={20} /> : 'Submit RMA'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ReturnsManagementPage;
