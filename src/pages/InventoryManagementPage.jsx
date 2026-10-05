import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Grid,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/businessService';
import { InventoryIcon } from '../components/Icons';

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const InventoryManagementPage = () => {
  const { hasPermission, role } = useAuth();
  const canEdit = hasPermission('inventory.edit');

  // Inventory State
  const [inventoryList, setInventoryList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiError, setApiError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Stock Adjustment Dialog State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState('increase'); // 'increase' | 'decrease'
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState('5');
  const [adjustReason, setAdjustReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch inventory records from backend
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await inventoryService.getAll({ search: searchQuery.trim() || undefined });
      const items = res?.inventory || res?.rows || (Array.isArray(res) ? res : []);
      setInventoryList(items);
      setTotalCount(res?.total || items.length);
    } catch (err) {
      setApiError(err.message || 'Failed to fetch inventory from backend.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Open Adjust Modal
  const handleOpenAdjust = (item, type) => {
    setSelectedItem(item);
    setAdjustType(type);
    setAdjustQuantity('5');
    setAdjustReason(type === 'increase' ? 'Vendor shipment restock' : 'Damaged / audit correction');
    setIsAdjustOpen(true);
  };

  // Submit Stock Adjustment
  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const parsedQty = parseInt(adjustQuantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setApiError('Please enter a valid positive quantity to adjust.');
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    try {
      if (adjustType === 'increase') {
        await inventoryService.increase(selectedItem.id, parsedQty, adjustReason.trim());
        setActionSuccess(`Successfully increased stock by +${parsedQty} for "${selectedItem.product_name}"!`);
      } else {
        await inventoryService.decrease(selectedItem.id, parsedQty, adjustReason.trim());
        setActionSuccess(`Successfully decreased stock by -${parsedQty} for "${selectedItem.product_name}"!`);
      }

      setIsAdjustOpen(false);
      fetchInventory();
    } catch (err) {
      setApiError(err.message || 'Failed to update stock quantity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Top Header */}
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
              <InventoryIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Inventory & Stock Tracking
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Warehouse Real-Time Stock Tracking (GET /api/inventory, POST /api/inventory/:id/increase, decrease)
              </Typography>
            </Box>
          </Stack>

          <Button size="small" variant="outlined" onClick={fetchInventory} disabled={isLoading} sx={{ textTransform: 'none', borderColor: '#d1d5db', color: '#0f172a' }}>
            Refresh Stock
          </Button>
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
          <Chip label="inventory.view (Read Stock)" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
          {canEdit && <Chip label="inventory.edit (Increase / Decrease Stock)" size="small" sx={{ height: 22, fontSize: '0.7rem', backgroundColor: '#2563eb', color: '#ffffff' }} />}
        </Stack>
      </Paper>

      {/* Success Alert */}
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setActionSuccess('')}>
          {actionSuccess}
        </Alert>
      )}

      {/* Error Alert */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setApiError('')}>
          <AlertTitle>Operation Error</AlertTitle>
          {apiError}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', sm: 380 } }}>
            <TextField
              size="small"
              placeholder="Filter inventory by product name or type..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Chip label={`Warehouse SKUs: ${totalCount}`} size="small" sx={{ fontWeight: 600, backgroundColor: '#f1f5f9', color: '#334155' }} />
          </Stack>
        </Box>
      </Paper>

      {/* Inventory Table */}
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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : inventoryList.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              No inventory records currently found in warehouse.
            </Typography>
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
            <Table size="small" sx={{ width: '100%', minWidth: 680 }}>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow sx={{ '& th': { color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', py: 1.5, borderBottom: '1px solid #e2e8f0' } }}>
                  <TableCell>Product Item</TableCell>
                  <TableCell>Warehouse Location</TableCell>
                  <TableCell>Total Stock</TableCell>
                  <TableCell>Reserved</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell>Status</TableCell>
                  {canEdit && <TableCell align="right">Quick Stock Adjustment</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryList.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:hover': { backgroundColor: '#f8fafc' },
                      '& td': { borderColor: '#f1f5f9', py: 1.2 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.product_name || item.product?.name || `Product #${item.product_id}`}
                      </Typography>
                      {item.product_type && (
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          Type: {item.product_type}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={item.location || 'Main Warehouse'} size="small" sx={{ fontSize: '0.7rem', height: 20, backgroundColor: '#f1f5f9', color: '#334155' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.total_quantity ?? item.quantity} units
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {item.reserved_quantity || 0} units
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.available_quantity ?? item.quantity} units
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.stock_status || 'In Stock'}
                        size="small"
                        color={
                          item.stock_status === 'Out of Stock'
                            ? 'error'
                            : item.stock_status === 'Low Stock'
                            ? 'warning'
                            : 'success'
                        }
                        variant="outlined"
                        sx={{ fontSize: '0.68rem', height: 22 }}
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Increase Stock (+)">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenAdjust(item, 'increase')}
                              sx={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}
                            >
                              <PlusIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Decrease Stock (-)">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenAdjust(item, 'decrease')}
                              sx={{ border: '1px solid rgba(244, 63, 94, 0.3)' }}
                            >
                              <MinusIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ADJUST STOCK DIALOG */}
      <Dialog open={isAdjustOpen} onClose={() => !isSubmitting && setIsAdjustOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {adjustType === 'increase' ? 'Increase Stock (+)' : 'Decrease Stock (-)'}
        </DialogTitle>
        <Box component="form" onSubmit={handleAdjustSubmit} noValidate>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Item: <strong>{selectedItem?.product_name || selectedItem?.product?.name}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Current Available Quantity: <strong>{selectedItem?.available_quantity ?? selectedItem?.quantity}</strong>
              </Typography>

              <TextField
                label="Adjustment Quantity"
                type="number"
                fullWidth
                required
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                disabled={isSubmitting}
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Reason / Notes"
                fullWidth
                multiline
                rows={2}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. Shipment arrival batch #481"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsAdjustOpen(false)} disabled={isSubmitting} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color={adjustType === 'increase' ? 'success' : 'error'}
              disabled={isSubmitting}
              sx={{ fontWeight: 700 }}
            >
              {isSubmitting ? <CircularProgress size={18} /> : adjustType === 'increase' ? 'Increase Stock' : 'Decrease Stock'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default InventoryManagementPage;
