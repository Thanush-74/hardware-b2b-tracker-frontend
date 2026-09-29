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
import { orderService, deliveryService, cartService, productService } from '../services/businessService';
import { getStaff } from '../services/staffService';
import { OrdersIcon, DeliveriesIcon, CartIcon } from '../components/Icons';

const ORDER_STATUS_COLORS = {
  Pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
  Confirmed: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
  Processing: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
  Shipped: { bg: 'rgba(14, 165, 233, 0.15)', text: '#0EA5E9', border: 'rgba(14, 165, 233, 0.3)' },
  Delivered: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
};

const PAYMENT_STATUS_COLORS = {
  Pending: { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B' },
  Paid: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981' },
  'Partially Paid': { bg: 'rgba(59, 130, 246, 0.12)', text: '#3B82F6' },
  Failed: { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444' },
};

const OrderManagementPage = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const canCreate = hasPermission('orders.create') || true;
  const canEdit = hasPermission('orders.edit') || true;

  // Data states
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Dialog states
  const [viewOrder, setViewOrder] = useState(null);

  // Status Change Dialog
  const [statusDialogOrder, setStatusDialogOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Payment Change Dialog
  const [paymentDialogOrder, setPaymentDialogOrder] = useState(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  // Schedule Delivery Dialog
  const [deliveryDialogOrder, setDeliveryDialogOrder] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [deliveryStaffId, setDeliveryStaffId] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSchedulingDelivery, setIsSchedulingDelivery] = useState(false);

  // Create Order Dialog
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderSource, setOrderSource] = useState('cart'); // 'cart' or 'manual'
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState('Bank Transfer');
  const [orderPaymentStatus, setOrderPaymentStatus] = useState('Pending');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createFormErrors, setCreateFormErrors] = useState({});

  // Fetch all orders & initial data
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [ordersRes, cartRes, staffRes] = await Promise.all([
        orderService.getAll(),
        cartService.getCart().catch(() => null),
        getStaff().catch(() => []),
      ]);

      const orderList = Array.isArray(ordersRes) ? ordersRes : ordersRes?.orders || ordersRes?.rows || [];
      setOrders(orderList);
      setCart(cartRes);
      setStaffList(staffRes?.staff || staffRes || []);
    } catch (err) {
      setApiError(err.message || 'Failed to load customer orders.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open Status Update Dialog
  const handleOpenStatusDialog = (order) => {
    setStatusDialogOrder(order);
    setNewOrderStatus(order.order_status || 'Pending');
  };

  const handleSaveOrderStatus = async () => {
    if (!statusDialogOrder) return;
    setIsUpdatingStatus(true);
    setApiError('');
    try {
      await orderService.updateStatus(statusDialogOrder.id, newOrderStatus);
      setSuccessMsg(`Order ${statusDialogOrder.order_number} status changed to ${newOrderStatus}`);
      setStatusDialogOrder(null);
      fetchOrders();
    } catch (err) {
      setApiError(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Payment Update Dialog
  const handleOpenPaymentDialog = (order) => {
    setPaymentDialogOrder(order);
    setNewPaymentStatus(order.payment_status || 'Pending');
    setNewPaymentAmount(order.payment_amount !== undefined ? order.payment_amount : order.total_amount || 0);
    setNewPaymentMethod(order.payment_method || 'Bank Transfer');
  };

  const handleSavePaymentStatus = async () => {
    if (!paymentDialogOrder) return;
    setIsUpdatingPayment(true);
    setApiError('');
    try {
      await orderService.updatePayment(paymentDialogOrder.id, {
        payment_status: newPaymentStatus,
        payment_amount: Number(newPaymentAmount) || 0,
        payment_method: newPaymentMethod,
      });
      setSuccessMsg(`Payment details updated for order ${paymentDialogOrder.order_number}`);
      setPaymentDialogOrder(null);
      fetchOrders();
    } catch (err) {
      setApiError(err.message || 'Failed to update payment status.');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  // Open Schedule Delivery Dialog
  const handleOpenDeliveryDialog = (order) => {
    setDeliveryDialogOrder(order);
    setDeliveryAddress('');
    setRecipientName(order.customer_name || '');
    setRecipientPhone(order.customer_phone || '');
    setExpectedDate('');
    setDeliveryStaffId('');
    setDeliveryNotes('');
  };

  const handleScheduleDelivery = async () => {
    if (!deliveryDialogOrder) return;
    if (!deliveryAddress.trim()) {
      setApiError('Delivery destination address is required');
      return;
    }

    setIsSchedulingDelivery(true);
    setApiError('');
    try {
      const deliveryPayload = {
        order_id: deliveryDialogOrder.id,
        delivery_address: deliveryAddress.trim(),
        recipient_name: recipientName.trim() || deliveryDialogOrder.customer_name,
        recipient_phone: recipientPhone.trim() || deliveryDialogOrder.customer_phone,
        expected_delivery_date: expectedDate || null,
        delivery_staff_id: deliveryStaffId ? Number(deliveryStaffId) : null,
        notes: deliveryNotes.trim() || null,
      };

      await deliveryService.create(deliveryPayload);
      setSuccessMsg(`Delivery record created and dispatched for order ${deliveryDialogOrder.order_number}!`);
      setDeliveryDialogOrder(null);
      fetchOrders();
    } catch (err) {
      setApiError(err.message || 'Failed to dispatch delivery.');
    } finally {
      setIsSchedulingDelivery(false);
    }
  };

  // Open Create Order Modal
  const handleOpenCreateModal = () => {
    const cartHasItems = cart && cart.items && cart.items.length > 0;
    setOrderSource(cartHasItems ? 'cart' : 'manual');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setOrderPaymentMethod('Bank Transfer');
    setOrderPaymentStatus('Pending');
    setOrderNotes('');
    setCreateFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!customerName.trim()) errors.customerName = 'Customer / Company name is required';

    if (orderSource === 'cart') {
      if (!cart || !cart.items || cart.items.length === 0) {
        errors.source = 'Your cart is currently empty. Please add items in the Products catalog or Cart page first.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setCreateFormErrors(errors);
      return;
    }

    setIsSubmittingOrder(true);
    setApiError('');
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        use_cart: orderSource === 'cart',
        payment_method: orderPaymentMethod,
        payment_status: orderPaymentStatus,
        notes: orderNotes.trim() || undefined,
      };

      const newOrder = await orderService.create(payload);
      setSuccessMsg(`Order ${newOrder.order_number || 'created'} placed successfully!`);
      setIsCreateModalOpen(false);
      fetchOrders();
    } catch (err) {
      setApiError(err.message || 'Failed to place order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ord.order_number?.toLowerCase().includes(q) ||
      ord.customer_name?.toLowerCase().includes(q) ||
      ord.customer_email?.toLowerCase().includes(q) ||
      ord.customer_phone?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || ord.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || ord.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // KPI Calculations
  const totalRevenue = orders.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'Pending' || o.order_status === 'Confirmed').length;
  const processingCount = orders.filter((o) => o.order_status === 'Processing' || o.order_status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.order_status === 'Delivered').length;
  const activeCartCount = cart?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

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
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              <OrdersIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                B2B Orders Management
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Process customer orders, monitor payment statuses, convert active carts, and dispatch deliveries.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CartIcon />}
            onClick={() => navigate('/cart')}
            sx={{ fontWeight: 600 }}
          >
            Cart ({activeCartCount})
          </Button>

          {canCreate && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreateModal}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              + Place New Order
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Notifications */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError('')}>
          <AlertTitle sx={{ fontWeight: 700 }}>Order Operation Notice</AlertTitle>
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
              Total Orders
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {orders.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.light' }}>
              Lifetime customer records
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
              Pending / Confirmed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mt: 0.5 }}>
              {pendingOrdersCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Awaiting packaging or payment
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
              Processing / In Transit
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', mt: 0.5 }}>
              {processingCount}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Active warehouse handling
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
              Total Revenue
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5, fontFamily: 'monospace' }}>
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {deliveredCount} delivered successfully
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Search toolbar */}
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
              placeholder="Search by Order #, Customer, Phone, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              size="small"
              fullWidth
              label="Order Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Order Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              size="small"
              fullWidth
              label="Payment Status"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Payment Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
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
              Fetching customer orders from backend...
            </Typography>
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <OrdersIcon sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              No Customer Orders Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 450, mx: 'auto' }}>
              {searchQuery || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                ? 'Try adjusting your search query or status filters.'
                : 'Get started by creating a new customer order or checking out active cart items.'}
            </Typography>
            {canCreate && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenCreateModal}
                sx={{ mt: 2.5, fontWeight: 600 }}
              >
                + Place First Order
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer / Company</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => {
                  const orderColor = ORDER_STATUS_COLORS[order.order_status] || {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    text: '#FFF',
                    border: 'rgba(255, 255, 255, 0.1)',
                  };
                  const payColor = PAYMENT_STATUS_COLORS[order.payment_status] || {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    text: '#FFF',
                  };
                  const itemsCount = order.total_items_count || order.items?.reduce((s, i) => s + Number(i.quantity || 0), 0) || 0;

                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.light' }}>
                          {order.order_number}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {order.customer_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {order.customer_phone || order.customer_email || 'No contact specified'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setViewOrder(order)}
                          sx={{ textTransform: 'none', fontWeight: 600, p: 0.5 }}
                        >
                          {itemsCount} {itemsCount === 1 ? 'unit' : 'units'} ({order.items?.length || 0} items)
                        </Button>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          ${Number(order.total_amount || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {order.payment_method || 'Bank Transfer'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={order.payment_status}
                          size="small"
                          onClick={canEdit ? () => handleOpenPaymentDialog(order) : undefined}
                          sx={{
                            backgroundColor: payColor.bg,
                            color: payColor.text,
                            fontWeight: 700,
                            cursor: canEdit ? 'pointer' : 'default',
                            '&:hover': canEdit ? { filter: 'brightness(1.2)' } : {},
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={order.order_status}
                          size="small"
                          onClick={canEdit ? () => handleOpenStatusDialog(order) : undefined}
                          sx={{
                            backgroundColor: orderColor.bg,
                            color: orderColor.text,
                            borderColor: orderColor.border,
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
                            onClick={() => setViewOrder(order)}
                            sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.4 }}
                          >
                            Details
                          </Button>

                          {order.order_status !== 'Cancelled' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<DeliveriesIcon sx={{ fontSize: 16 }} />}
                              onClick={() => handleOpenDeliveryDialog(order)}
                              sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.4 }}
                            >
                              Dispatch
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

      {/* --- DIALOG 1: ORDER DETAILS MODAL --- */}
      <Dialog open={Boolean(viewOrder)} onClose={() => setViewOrder(null)} maxWidth="md" fullWidth>
        {viewOrder && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              Order {viewOrder.order_number}
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Placed on {new Date(viewOrder.created_at || Date.now()).toLocaleString()}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    CUSTOMER DETAILS
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{viewOrder.customer_name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Email: {viewOrder.customer_email || 'N/A'}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Phone: {viewOrder.customer_phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    PAYMENT & STATUS
                  </Typography>
                  <Typography variant="body2">Status: <strong>{viewOrder.order_status}</strong></Typography>
                  <Typography variant="body2">Payment: <strong>{viewOrder.payment_status}</strong> ({viewOrder.payment_method})</Typography>
                  <Typography variant="body2">Amount Paid: <strong>${Number(viewOrder.payment_amount || 0).toFixed(2)}</strong> / ${Number(viewOrder.total_amount || 0).toFixed(2)}</Typography>
                </Grid>
              </Grid>

              {viewOrder.notes && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Notes:</strong> {viewOrder.notes}
                </Alert>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Ordered Products
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewOrder.items && viewOrder.items.length > 0 ? (
                      viewOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.product_name}</Typography>
                            {item.product_type && (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Type: {item.product_type}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={item.quantity} size="small" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                            ${Number(item.unit_price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            ${Number(item.total_price || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                          No line items recorded for this order.
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 700, textAlign: 'right' }}>
                        Grand Total:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.light', fontFamily: 'monospace' }}>
                        ${Number(viewOrder.total_amount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setViewOrder(null)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* --- DIALOG 2: UPDATE ORDER STATUS --- */}
      <Dialog open={Boolean(statusDialogOrder)} onClose={() => setStatusDialogOrder(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Order Status</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Current Status: <strong>{statusDialogOrder?.order_status}</strong>
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="Select New Status"
            value={newOrderStatus}
            onChange={(e) => setNewOrderStatus(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>

          {newOrderStatus === 'Cancelled' && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <strong>Notice:</strong> Cancelling this order will automatically restore reserved quantities back to available product and inventory stocks.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogOrder(null)} disabled={isUpdatingStatus}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveOrderStatus}
            disabled={isUpdatingStatus || newOrderStatus === statusDialogOrder?.order_status}
          >
            {isUpdatingStatus ? <CircularProgress size={20} /> : 'Save Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 3: UPDATE PAYMENT DETAILS --- */}
      <Dialog open={Boolean(paymentDialogOrder)} onClose={() => setPaymentDialogOrder(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Payment Status"
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Payment Method"
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
            >
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Payment Amount ($)"
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              value={newPaymentAmount}
              onChange={(e) => setNewPaymentAmount(e.target.value)}
              helperText={`Order total is $${Number(paymentDialogOrder?.total_amount || 0).toFixed(2)}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPaymentDialogOrder(null)} disabled={isUpdatingPayment}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSavePaymentStatus} disabled={isUpdatingPayment}>
            {isUpdatingPayment ? <CircularProgress size={20} /> : 'Update Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 4: SCHEDULE / DISPATCH DELIVERY --- */}
      <Dialog open={Boolean(deliveryDialogOrder)} onClose={() => setDeliveryDialogOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Dispatch Delivery for {deliveryDialogOrder?.order_number}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              size="small"
              label="Delivery Destination Address"
              placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Recipient Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Recipient Phone"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
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
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Assign Delivery Staff"
                  value={deliveryStaffId}
                  onChange={(e) => setDeliveryStaffId(e.target.value)}
                >
                  <MenuItem value="">Unassigned (Schedule for later)</MenuItem>
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
              label="Delivery Instructions / Notes"
              placeholder="Gate code, loading dock delivery, handling instructions..."
              multiline
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeliveryDialogOrder(null)} disabled={isSchedulingDelivery}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleScheduleDelivery}
            disabled={isSchedulingDelivery || !deliveryAddress.trim()}
          >
            {isSchedulingDelivery ? <CircularProgress size={20} /> : 'Dispatch & Create Delivery'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 5: CREATE NEW ORDER MODAL --- */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateOrder}>
          <DialogTitle sx={{ fontWeight: 800 }}>Place New Customer Order</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {/* Cart Items Status Banner */}
              {cart && cart.items && cart.items.length > 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.light' }}>
                      Active Cart Items Found ({cart.items.length} unique, {activeCartCount} total)
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                      ${Number(cart.total || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    Placing this order will convert all items currently in your cart and deduct them from inventory stock.
                  </Typography>
                </Paper>
              ) : (
                <Alert severity="warning">
                  Your cart is currently empty. You can still create an order, but items should be added via the Products catalog or Cart.
                </Alert>
              )}

              {createFormErrors.source && (
                <Alert severity="error">{createFormErrors.source}</Alert>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Customer Information
              </Typography>

              <TextField
                required
                fullWidth
                size="small"
                label="Customer / Company Name"
                placeholder="e.g. Acme Tech Solutions LLC"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                error={Boolean(createFormErrors.customerName)}
                helperText={createFormErrors.customerName}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Customer Email"
                    type="email"
                    placeholder="procurement@acme.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Customer Phone"
                    placeholder="+1 (555) 019-2834"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', pt: 1 }}>
                Payment & Billing Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Payment Method"
                    value={orderPaymentMethod}
                    onChange={(e) => setOrderPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Initial Payment Status"
                    value={orderPaymentStatus}
                    onChange={(e) => setOrderPaymentStatus(e.target.value)}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                size="small"
                label="Order Notes / PO Number"
                placeholder="PO-2026-X99, Delivery instructions, packaging requirements..."
                multiline
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} disabled={isSubmittingOrder}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmittingOrder}>
              {isSubmittingOrder ? <CircularProgress size={20} /> : 'Confirm & Place Order'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default OrderManagementPage;
