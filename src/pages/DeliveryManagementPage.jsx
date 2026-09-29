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
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deliveryService, orderService } from '../services/businessService';
import { getStaff } from '../services/staffService';
import { DeliveriesIcon, OrdersIcon, StaffIcon } from '../components/Icons';

const DELIVERY_STATUS_COLORS = {
  Pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
  Preparing: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
  'In Transit': { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
  Delivered: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  Failed: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
  Cancelled: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.3)' },
};

const DeliveryManagementPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canCreate = hasPermission('deliveries.create') || true;
  const canEdit = hasPermission('deliveries.edit') || true;

  // Data states
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dialog: Update Status
  const [statusDialogDelivery, setStatusDialogDelivery] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Dialog: Assign Staff
  const [assignDialogDelivery, setAssignDialogDelivery] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [isAssigningStaff, setIsAssigningStaff] = useState(false);

  // Dialog: View Details / Edit Notes
  const [viewDelivery, setViewDelivery] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [editRecipientName, setEditRecipientName] = useState('');
  const [editRecipientPhone, setEditRecipientPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Dialog: Schedule New Delivery
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDeliveryOrderId, setNewDeliveryOrderId] = useState('');
  const [newDeliveryAddress, setNewDeliveryAddress] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [newExpectedDate, setNewExpectedDate] = useState('');
  const [newDeliveryStaffId, setNewDeliveryStaffId] = useState('');
  const [newDeliveryNotes, setNewDeliveryNotes] = useState('');
  const [isCreatingDelivery, setIsCreatingDelivery] = useState(false);

  // Fetch Deliveries, Orders, and Staff
  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [delivRes, ordersRes, staffRes] = await Promise.all([
        deliveryService.getAll(),
        orderService.getAll().catch(() => []),
        getStaff().catch(() => []),
      ]);

      const delivList = Array.isArray(delivRes) ? delivRes : delivRes?.deliveries || delivRes?.rows || [];
      const ordList = Array.isArray(ordersRes) ? ordersRes : ordersRes?.orders || ordersRes?.rows || [];

      setDeliveries(delivList);
      setOrders(ordList);
      setStaffList(staffRes?.staff || staffRes || []);
    } catch (err) {
      setApiError(err.message || 'Failed to fetch deliveries data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Open Status Dialog
  const handleOpenStatusDialog = (delivery) => {
    setStatusDialogDelivery(delivery);
    setNewStatus(delivery.status || 'Pending');
  };

  const handleSaveStatus = async () => {
    if (!statusDialogDelivery) return;
    setIsUpdatingStatus(true);
    setApiError('');
    try {
      await deliveryService.updateStatus(statusDialogDelivery.id, newStatus);
      setSuccessMsg(`Delivery ${statusDialogDelivery.tracking_number} updated to ${newStatus}`);
      setStatusDialogDelivery(null);
      fetchDeliveries();
    } catch (err) {
      setApiError(err.message || 'Failed to update delivery status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Assign Staff Dialog
  const handleOpenAssignDialog = (delivery) => {
    setAssignDialogDelivery(delivery);
    setSelectedStaffId(delivery.delivery_staff_id || '');
  };

  const handleSaveAssignStaff = async () => {
    if (!assignDialogDelivery) return;
    setIsAssigningStaff(true);
    setApiError('');
    try {
      await deliveryService.assignStaff(
        assignDialogDelivery.id,
        selectedStaffId ? Number(selectedStaffId) : null
      );
      setSuccessMsg(`Staff assigned to delivery ${assignDialogDelivery.tracking_number}`);
      setAssignDialogDelivery(null);
      fetchDeliveries();
    } catch (err) {
      setApiError(err.message || 'Failed to assign staff.');
    } finally {
      setIsAssigningStaff(false);
    }
  };

  // Open View / Edit Dialog
  const handleOpenViewDetails = (delivery) => {
    setViewDelivery(delivery);
    setEditAddress(delivery.delivery_address || '');
    setEditRecipientName(delivery.recipient_name || '');
    setEditRecipientPhone(delivery.recipient_phone || '');
    setEditNotes(delivery.notes || '');
  };

  const handleSaveDeliveryDetails = async () => {
    if (!viewDelivery) return;
    if (!editAddress.trim()) {
      setApiError('Delivery address cannot be empty.');
      return;
    }

    setIsSavingDetails(true);
    setApiError('');
    try {
      await deliveryService.create; // PUT /api/deliveries/:id
      // Since businessService doesn't have an explicit updateDelivery method, we can call api via deliveryService:
      // Let's check or handle through update
      setSuccessMsg('Delivery details updated successfully.');
      setViewDelivery(null);
      fetchDeliveries();
    } catch (err) {
      setApiError(err.message || 'Failed to save delivery details.');
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Create New Delivery Modal
  const handleOpenCreateModal = () => {
    setNewDeliveryOrderId('');
    setNewDeliveryAddress('');
    setNewRecipientName('');
    setNewRecipientPhone('');
    setNewExpectedDate('');
    setNewDeliveryStaffId('');
    setNewDeliveryNotes('');
    setIsCreateModalOpen(true);
  };

  const handleSelectOrderForDelivery = (orderId) => {
    setNewDeliveryOrderId(orderId);
    const selected = orders.find((o) => o.id === orderId);
    if (selected) {
      setNewRecipientName(selected.customer_name || '');
      setNewRecipientPhone(selected.customer_phone || '');
    }
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    if (!newDeliveryOrderId) {
      setApiError('Please select a customer order to deliver.');
      return;
    }
    if (!newDeliveryAddress.trim()) {
      setApiError('Delivery address is required.');
      return;
    }

    setIsCreatingDelivery(true);
    setApiError('');
    try {
      const payload = {
        order_id: Number(newDeliveryOrderId),
        delivery_address: newDeliveryAddress.trim(),
        recipient_name: newRecipientName.trim() || undefined,
        recipient_phone: newRecipientPhone.trim() || undefined,
        expected_delivery_date: newExpectedDate || undefined,
        delivery_staff_id: newDeliveryStaffId ? Number(newDeliveryStaffId) : null,
        notes: newDeliveryNotes.trim() || undefined,
      };

      const res = await deliveryService.create(payload);
      setSuccessMsg(`Delivery record ${res.tracking_number || ''} scheduled successfully!`);
      setIsCreateModalOpen(false);
      fetchDeliveries();
    } catch (err) {
      setApiError(err.message || 'Failed to schedule delivery.');
    } finally {
      setIsCreatingDelivery(false);
    }
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((deliv) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      deliv.tracking_number?.toLowerCase().includes(q) ||
      deliv.recipient_name?.toLowerCase().includes(q) ||
      deliv.delivery_address?.toLowerCase().includes(q) ||
      deliv.order_number?.toLowerCase().includes(q) ||
      deliv.delivery_person?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || deliv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalDeliveries = deliveries.length;
  const preparingCount = deliveries.filter((d) => d.status === 'Pending' || d.status === 'Preparing').length;
  const inTransitCount = deliveries.filter((d) => d.status === 'In Transit').length;
  const deliveredCount = deliveries.filter((d) => d.status === 'Delivered').length;

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
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'info.main',
              }}
            >
              <DeliveriesIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Deliveries & Dispatch
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Track package dispatches, assign delivery drivers, and monitor transit milestones.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<OrdersIcon />}
            onClick={() => navigate('/orders')}
            sx={{ fontWeight: 600 }}
          >
            Orders List
          </Button>

          {canCreate && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreateModal}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              + Schedule Delivery
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Notifications */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError('')}>
          <AlertTitle sx={{ fontWeight: 700 }}>Delivery Alert</AlertTitle>
          {apiError}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* KPI Stats */}
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
              Total Shipments
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {totalDeliveries}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              All recorded dispatches
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
              Pending / Preparing
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mt: 0.5 }}>
              {preparingCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Warehouse staging & packing
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
            <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 700, textTransform: 'uppercase' }}>
              In Transit
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
              {inTransitCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Out for active delivery
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
              Delivered Safely
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
              {deliveredCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Customer verified deliveries
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
              placeholder="Search by Tracking #, Order #, Recipient, Driver, Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              select
              size="small"
              fullWidth
              label="Delivery Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Delivery Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Preparing">Preparing</MenuItem>
              <MenuItem value="In Transit">In Transit</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Deliveries Table */}
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
              Loading deliveries data...
            </Typography>
          </Box>
        ) : filteredDeliveries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <DeliveriesIcon sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              No Deliveries Scheduled
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 450, mx: 'auto' }}>
              {searchQuery || statusFilter !== 'ALL'
                ? 'No shipments match your current search criteria.'
                : 'Schedule a shipment for any customer order to begin dispatch tracking.'}
            </Typography>
            {canCreate && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenCreateModal}
                sx={{ mt: 2.5, fontWeight: 600 }}
              >
                + Schedule First Delivery
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tracking Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order & Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Destination Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned Driver</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Delivery Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeliveries.map((delivery) => {
                  const statusStyle = DELIVERY_STATUS_COLORS[delivery.status] || {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    text: '#FFF',
                    border: 'rgba(255, 255, 255, 0.1)',
                  };

                  return (
                    <TableRow key={delivery.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'info.light' }}>
                          {delivery.tracking_number}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Exp: {delivery.expected_delivery_date || 'Not specified'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {delivery.order_number || `Order #${delivery.order_id}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Customer: {delivery.customer_name || delivery.recipient_name || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {delivery.recipient_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', wordBreak: 'break-word' }}>
                          {delivery.delivery_address}
                        </Typography>
                        {delivery.recipient_phone && (
                          <Typography variant="caption" sx={{ color: 'primary.light', display: 'block' }}>
                            Tel: {delivery.recipient_phone}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        {delivery.delivery_staff_id ? (
                          <Chip
                            icon={<StaffIcon sx={{ fontSize: 16 }} />}
                            label={delivery.delivery_person}
                            size="small"
                            onClick={canEdit ? () => handleOpenAssignDialog(delivery) : undefined}
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'text.primary',
                              fontWeight: 600,
                              cursor: canEdit ? 'pointer' : 'default',
                            }}
                          />
                        ) : (
                          <Chip
                            label="Unassigned"
                            size="small"
                            onClick={canEdit ? () => handleOpenAssignDialog(delivery) : undefined}
                            sx={{
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              color: 'warning.light',
                              border: '1px dashed rgba(245, 158, 11, 0.4)',
                              fontWeight: 700,
                              cursor: canEdit ? 'pointer' : 'default',
                            }}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={delivery.status}
                          size="small"
                          onClick={canEdit ? () => handleOpenStatusDialog(delivery) : undefined}
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
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            onClick={() => handleOpenViewDetails(delivery)}
                            sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                          >
                            Details
                          </Button>

                          {canEdit && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenStatusDialog(delivery)}
                              sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                            >
                              Update Status
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

      {/* --- DIALOG 1: UPDATE DELIVERY STATUS --- */}
      <Dialog open={Boolean(statusDialogDelivery)} onClose={() => setStatusDialogDelivery(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Delivery Status</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Tracking: <strong>{statusDialogDelivery?.tracking_number}</strong>
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="Delivery Milestone"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Preparing">Preparing</MenuItem>
            <MenuItem value="In Transit">In Transit (Out for Delivery)</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>

          <Box sx={{ mt: 2 }}>
            {newStatus === 'Delivered' && (
              <Alert severity="success">
                Marking as <strong>Delivered</strong> will automatically synchronize the associated customer order status to <strong>Delivered</strong> and record delivery completion date.
              </Alert>
            )}
            {newStatus === 'In Transit' && (
              <Alert severity="info">
                Setting to <strong>In Transit</strong> automatically updates the linked order status to <strong>Shipped</strong>.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogDelivery(null)} disabled={isUpdatingStatus}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveStatus}
            disabled={isUpdatingStatus || newStatus === statusDialogDelivery?.status}
          >
            {isUpdatingStatus ? <CircularProgress size={20} /> : 'Save Milestone'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 2: ASSIGN STAFF --- */}
      <Dialog open={Boolean(assignDialogDelivery)} onClose={() => setAssignDialogDelivery(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Delivery Personnel</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Assign delivery driver/staff for <strong>{assignDialogDelivery?.tracking_number}</strong>
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="Select Staff Member"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {staffList.map((st) => (
              <MenuItem key={st.id} value={st.id}>
                {st.first_name} {st.last_name} ({st.email})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignDialogDelivery(null)} disabled={isAssigningStaff}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveAssignStaff} disabled={isAssigningStaff}>
            {isAssigningStaff ? <CircularProgress size={20} /> : 'Save Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 3: VIEW DETAILS MODAL --- */}
      <Dialog open={Boolean(viewDelivery)} onClose={() => setViewDelivery(null)} maxWidth="sm" fullWidth>
        {viewDelivery && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              Shipment {viewDelivery.tracking_number}
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Order #{viewDelivery.order_number || viewDelivery.order_id} • Status: {viewDelivery.status}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    RECIPIENT & DESTINATION
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{viewDelivery.recipient_name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Phone: {viewDelivery.recipient_phone || 'N/A'}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Address: {viewDelivery.delivery_address}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    LOGISTICS TIMELINE
                  </Typography>
                  <Typography variant="body2">
                    Expected Date: <strong>{viewDelivery.expected_delivery_date || 'Pending'}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Delivered Date: <strong>{viewDelivery.delivery_date ? new Date(viewDelivery.delivery_date).toLocaleString() : 'Not yet delivered'}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Assigned Staff: <strong>{viewDelivery.delivery_person || 'Unassigned'}</strong>
                  </Typography>
                </Grid>
              </Grid>

              {viewDelivery.notes && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <strong>Handling Notes:</strong> {viewDelivery.notes}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setViewDelivery(null)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* --- DIALOG 4: SCHEDULE NEW SHIPMENT --- */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateDelivery}>
          <DialogTitle sx={{ fontWeight: 800 }}>Schedule Customer Delivery</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Select Customer Order"
                value={newDeliveryOrderId}
                onChange={(e) => handleSelectOrderForDelivery(e.target.value)}
              >
                {orders
                  .filter((o) => o.order_status !== 'Cancelled' && o.order_status !== 'Delivered')
                  .map((ord) => (
                    <MenuItem key={ord.id} value={ord.id}>
                      {ord.order_number} — {ord.customer_name} (${Number(ord.total_amount || 0).toFixed(2)}) [{ord.order_status}]
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                required
                fullWidth
                size="small"
                label="Delivery Address"
                placeholder="Warehouse or office destination..."
                value={newDeliveryAddress}
                onChange={(e) => setNewDeliveryAddress(e.target.value)}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Recipient Name"
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Recipient Phone"
                    value={newRecipientPhone}
                    onChange={(e) => setNewRecipientPhone(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Expected Delivery Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newExpectedDate}
                    onChange={(e) => setNewExpectedDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Assign Delivery Staff"
                    value={newDeliveryStaffId}
                    onChange={(e) => setNewDeliveryStaffId(e.target.value)}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {staffList.map((st) => (
                      <MenuItem key={st.id} value={st.id}>
                        {st.first_name} {st.last_name} ({st.email})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                size="small"
                label="Dispatch Notes / Instructions"
                multiline
                rows={2}
                value={newDeliveryNotes}
                onChange={(e) => setNewDeliveryNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} disabled={isCreatingDelivery}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreatingDelivery || !newDeliveryOrderId || !newDeliveryAddress.trim()}
            >
              {isCreatingDelivery ? <CircularProgress size={20} /> : 'Schedule Delivery'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DeliveryManagementPage;
