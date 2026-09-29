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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/businessService';
import { CartIcon } from '../components/Icons';

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CartManagementPage = () => {
  const { hasPermission, role } = useAuth();
  const navigate = useNavigate();
  const canEdit = hasPermission('cart.edit');

  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionInProgressId, setActionInProgressId] = useState(null);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await cartService.getCart();
      setCart(res || { items: [], total: 0 });
    } catch (err) {
      setApiError(err.message || 'Failed to fetch cart from backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setActionInProgressId(itemId);
    setApiError('');
    try {
      await cartService.updateItem(itemId, newQty);
      fetchCart();
    } catch (err) {
      setApiError(err.message || 'Failed to update item quantity.');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setActionInProgressId(itemId);
    setApiError('');
    try {
      await cartService.removeItem(itemId);
      setActionSuccess('Item removed from cart.');
      fetchCart();
    } catch (err) {
      setApiError(err.message || 'Failed to remove item.');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleClearCart = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      await cartService.clear();
      setActionSuccess('Cart cleared successfully.');
      fetchCart();
    } catch (err) {
      setApiError(err.message || 'Failed to clear cart.');
      setIsLoading(false);
    }
  };

  const cartItems = cart?.items || cart?.cart_items || [];
  const totalAmount = Number(cart?.total || cart?.total_amount || 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CartIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                B2B Hardware Cart
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Order Preparation & Quotation Builder (GET /api/cart, PUT /api/cart/:id, DELETE /api/cart/:id)
              </Typography>
            </Box>
          </Stack>

          {cartItems.length > 0 && canEdit && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              disabled={isLoading}
              sx={{ textTransform: 'none' }}
            >
              Clear Cart
            </Button>
          )}
        </Stack>
      </Box>

      {/* Permissions Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          ROLE: <Box component="span" sx={{ color: 'primary.light' }}>{role?.name || role?.slug || 'Staff'}</Box> • ACTIVE RBAC ACTIONS:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="cart.view (View Cart)" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
          {canEdit && <Chip label="cart.edit (Manage Items & Quantity)" size="small" color="primary" sx={{ height: 22, fontSize: '0.7rem' }} />}
        </Stack>
      </Paper>

      {/* Alerts */}
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}

      {apiError && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setApiError('')}>
          <AlertTitle>Cart Error</AlertTitle>
          {apiError}
        </Alert>
      )}

      {/* Cart Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : cartItems.length === 0 ? (
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 2.5 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontWeight: 700 }}>
            Your Cart is Currently Empty
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Browse the product catalog to add hardware items to your B2B order cart.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/products')} sx={{ fontWeight: 700 }}>
            Browse Product Catalog →
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2.5,
              backgroundColor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', py: 1.5 } }}>
                    <TableCell>Product Item</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Line Total</TableCell>
                    {canEdit && <TableCell align="right">Remove</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => {
                    const price = Number(item.unit_price || item.product?.price || item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const lineTotal = price * qty;
                    const isBusy = actionInProgressId === item.id;

                    return (
                      <TableRow
                        key={item.id}
                        sx={{
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                          '& td': { borderColor: 'rgba(255, 255, 255, 0.06)', py: 1.5 },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {item.product_name || item.product?.name || `Product #${item.product_id}`}
                          </Typography>
                          {item.product?.type && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.product.type}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            ${price.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {canEdit ? (
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                              <IconButton
                                size="small"
                                disabled={isBusy || qty <= 1}
                                onClick={() => handleUpdateQuantity(item.id, qty - 1)}
                                sx={{ border: '1px solid rgba(255, 255, 255, 0.15)', p: 0.5 }}
                              >
                                <MinusIcon />
                              </IconButton>
                              <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                                {isBusy ? <CircularProgress size={14} /> : qty}
                              </Typography>
                              <IconButton
                                size="small"
                                disabled={isBusy}
                                onClick={() => handleUpdateQuantity(item.id, qty + 1)}
                                sx={{ border: '1px solid rgba(255, 255, 255, 0.15)', p: 0.5 }}
                              >
                                <PlusIcon />
                              </IconButton>
                            </Stack>
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {qty}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.light' }}>
                            ${lineTotal.toFixed(2)}
                          </Typography>
                        </TableCell>
                        {canEdit && (
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={isBusy}
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <TrashIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Cart Summary Card */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2.5,
              backgroundColor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxWidth: 420,
              alignSelf: 'flex-end',
              width: '100%',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
              Order Summary
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Items:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {cartItems.reduce((acc, curr) => acc + Number(curr.quantity || 1), 0)} units
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Estimated Total:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}>
                  ${totalAmount.toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => navigate('/orders')}
                sx={{ mt: 2, fontWeight: 700, py: 1.2 }}
              >
                Proceed to Orders →
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Box>
  );
};

export default CartManagementPage;
