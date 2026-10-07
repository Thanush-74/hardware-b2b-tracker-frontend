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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/businessService';
import { CartIcon } from '../components/Icons';

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: 'none' }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/**
 * QuantityControl component for typing and +/- buttons
 */
const QuantityControl = ({ item, isBusy, onUpdateQuantity }) => {
  const currentQty = parseInt(item.quantity, 10) || 1;
  const [inputValue, setInputValue] = useState(currentQty);

  useEffect(() => {
    setInputValue(currentQty);
  }, [currentQty]);

  const handleMinus = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentQty > 1 && !isBusy) {
      onUpdateQuantity(item.id, currentQty - 1);
    }
  };

  const handlePlus = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBusy) {
      onUpdateQuantity(item.id, currentQty + 1);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue(currentQty);
    } else if (parsed !== currentQty) {
      onUpdateQuantity(item.id, parsed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
      <IconButton
        type="button"
        size="small"
        aria-label="Decrease quantity"
        disabled={isBusy || currentQty <= 1}
        onClick={handleMinus}
        sx={{
          border: '1px solid #d1d5db',
          borderRadius: 1,
          p: 0.5,
          width: 28,
          height: 28,
          color: '#0f172a',
          backgroundColor: '#ffffff',
          '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#9ca3af' },
          '&.Mui-disabled': { opacity: 0.35, borderColor: '#e5e7eb' },
        }}
      >
        <MinusIcon />
      </IconButton>

      <input
        type="number"
        min="1"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={isBusy}
        aria-label="Item quantity"
        style={{
          width: '48px',
          height: '28px',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: '#0f172a',
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          outline: 'none',
          MozAppearance: 'textfield',
        }}
      />

      <IconButton
        type="button"
        size="small"
        aria-label="Increase quantity"
        disabled={isBusy}
        onClick={handlePlus}
        sx={{
          border: '1px solid #d1d5db',
          borderRadius: 1,
          p: 0.5,
          width: 28,
          height: 28,
          color: '#0f172a',
          backgroundColor: '#ffffff',
          '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#9ca3af' },
          '&.Mui-disabled': { opacity: 0.35, borderColor: '#e5e7eb' },
        }}
      >
        <PlusIcon />
      </IconButton>
    </Stack>
  );
};

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
    const parsedQty = parseInt(newQty, 10);
    if (isNaN(parsedQty) || parsedQty < 1) {
      return;
    }

    setActionInProgressId(itemId);
    setApiError('');
    try {
      const updatedCart = await cartService.updateItem(itemId, parsedQty);
      if (updatedCart && (updatedCart.items || updatedCart.cart_items)) {
        setCart(updatedCart);
      } else {
        await fetchCart();
      }
    } catch (err) {
      setApiError(err.message || 'Failed to update item quantity.');
      await fetchCart();
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

  // Calculate overall total dynamically from ALL cart items: sum(unit_price * quantity)
  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.unit_price ?? item.product?.price ?? item.price ?? 0);
      const qty = Number(item.quantity ?? 1);
      return acc + (price * qty);
    }, 0);
  }, [cartItems]);

  const totalUnits = useMemo(() => {
    return cartItems.reduce((acc, curr) => acc + Number(curr.quantity || 1), 0);
  }, [cartItems]);

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
                borderRadius: 1.5,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CartIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                B2B Hardware Cart
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
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
              sx={{ textTransform: 'none', borderColor: '#fecaca', color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2', borderColor: '#b91c1c' } }}
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
          borderRadius: 1.5,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
          ROLE: <Box component="span" sx={{ color: '#0f172a', fontWeight: 700 }}>{role?.name || role?.slug || 'Staff'}</Box> • ACTIVE RBAC ACTIONS:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="cart.view (View Cart)" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
          {canEdit && <Chip label="cart.edit (Manage Items & Quantity)" size="small" sx={{ height: 22, fontSize: '0.7rem', backgroundColor: '#2563eb', color: '#ffffff' }} />}
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
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
          <Typography variant="h6" sx={{ color: '#0f172a', mb: 1, fontWeight: 700 }}>
            Your Cart is Currently Empty
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Browse the product catalog to add hardware items to your B2B order cart.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')} sx={{ fontWeight: 600, backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}>
            Browse Product Catalog →
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}
          >
            <TableContainer
              sx={{
                width: '100%',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { height: '5px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '4px' },
              }}
            >
              <Table size="small" sx={{ minWidth: 560 }}>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow sx={{ '& th': { color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', py: 1.5, borderBottom: '1px solid #e2e8f0' } }}>
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
                          '&:hover': { backgroundColor: '#f8fafc' },
                          '& td': { borderColor: '#f1f5f9', py: 1.5 },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {item.product_name || item.product?.name || `Product #${item.product_id}`}
                          </Typography>
                          {item.product?.type && (
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {item.product.type}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0f172a' }}>
                            ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {canEdit ? (
                            <QuantityControl
                              item={item}
                              isBusy={isBusy}
                              onUpdateQuantity={handleUpdateQuantity}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                              {qty}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
              maxWidth: { xs: '100%', sm: 420 },
              alignSelf: { xs: 'stretch', sm: 'flex-end' },
              width: '100%',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
              Order Summary
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Total Items:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {totalUnits} units
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#e2e8f0' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Estimated Total:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => navigate('/orders')}
                sx={{ mt: 2, fontWeight: 600, py: 1.2, backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
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
