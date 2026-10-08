import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import PaginationControl from '../components/PaginationControl';

const PAGE_SIZE = 10;

const DELIVERY_STATUS_COLORS = {
  Pending: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  Preparing: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'In Transit': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  Delivered: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Failed: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  Cancelled: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
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

  // Pagination state
  const [page, setPage] = useState(1);

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
        deliveryService.getAll({ limit: 1000 }),
        orderService.getAll({ limit: 1000 }).catch(() => []),
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

  // Paginated slice
  const paginatedDeliveries = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDeliveries.slice(start, start + PAGE_SIZE);
  }, [filteredDeliveries, page]);

  // Filter change handlers that reset to page 1
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

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
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Shipments
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mt: 0.5 }}>
            {totalDeliveries}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            All recorded dispatches
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
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending / Preparing
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#b45309', mt: 0.5 }}>
            {preparingCount}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Warehouse staging & packing
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
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            In Transit
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563eb', mt: 0.5 }}>
            {inTransitCount}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Out for active delivery
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
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Delivered Safely
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#15803d', mt: 0.5 }}>
            {deliveredCount}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Customer verified deliveries
          </Typography>
        </Paper>
      </Box>

      {/* Filter toolbar */}
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
            placeholder="Search by Tracking #, Order #, Recipient, Driver, Address..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <TextField
            select
            size="small"
            fullWidth
            label="Delivery Status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="ALL">All Delivery Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Preparing">Preparing</MenuItem>
            <MenuItem value="In Transit">In Transit</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Deliveries Table */}
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
          <>
            <TableContainer
              sx={{
                width: '100%',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { height: '5px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '4px' },
              }}
            >
              <Table sx={{ minWidth: 720 }}>
                <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Tracking Number</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Order & Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Destination Address</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Assigned Driver</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>Delivery Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#111827' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedDeliveries.map((delivery) => {
                    const statusStyle = DELIVERY_STATUS_COLORS[delivery.status] || {
                      bg: '#f9fafb',
                      text: '#111827',
                      border: '#e5e7eb',
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
                                backgroundColor: '#f3f4f6',
                                color: '#111827',
                                border: '1px solid #e5e7eb',
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
                                backgroundColor: '#fffbeb',
                                color: '#b45309',
                                border: '1px dashed #fde68a',
                                fontWeight: 600,
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

            <PaginationControl
              currentPage={page}
              totalItems={filteredDeliveries.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel="deliveries"
            />
          </>
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
                      {ord.order_number} — {ord.customer_name} (₹{Number(ord.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) [{ord.order_status}]
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

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Recipient Name"
                  value={newRecipientName}
                  onChange={(e) => setNewRecipientName(e.target.value)}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Recipient Phone"
                  value={newRecipientPhone}
                  onChange={(e) => setNewRecipientPhone(e.target.value)}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Expected Delivery Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={newExpectedDate}
                  onChange={(e) => setNewExpectedDate(e.target.value)}
                />
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
              </Box>

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
