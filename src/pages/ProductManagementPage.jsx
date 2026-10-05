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
  MenuItem,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { productService, cartService } from '../services/businessService';
import { ProductsIcon } from '../components/Icons';

// SVG Icons
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CartAddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const HARDWARE_TYPES = [
  'SSD Storage',
  'RAM Memory',
  'Motherboard',
  'Graphics Card (GPU)',
  'Processor (CPU)',
  'Power Supply (PSU)',
  'Cooling Unit',
  'Chassis / Case',
  'Networking Hardware',
  'Accessories',
];

const ProductManagementPage = () => {
  const { hasPermission, role } = useAuth();

  // Permission Checks (Single Source of Truth)
  const canCreate = hasPermission('products.create');
  const canEdit = hasPermission('products.edit');
  const canDelete = hasPermission('products.delete');
  const canAddToCart = hasPermission('cart.edit');

  // Products Data State
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiError, setApiError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('SSD Storage');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('0');
  const [formDescription, setFormDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart Adding Feedback
  const [addingToCartId, setAddingToCartId] = useState(null);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await productService.getAll({ search: searchQuery.trim() || undefined });
      const items = res?.products || res?.rows || (Array.isArray(res) ? res : []);
      setProducts(items);
      setTotalCount(res?.total || items.length);
    } catch (err) {
      setApiError(err.message || 'Failed to load products from backend.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormName('');
    setFormType('SSD Storage');
    setFormPrice('');
    setFormQuantity('10');
    setFormDescription('');
    setFormErrors({});
    setIsCreateOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormName(product.name || '');
    setFormType(product.type || 'SSD Storage');
    setFormPrice(String(product.price || ''));
    setFormQuantity(String(product.available_quantity ?? '0'));
    setFormDescription(product.description || '');
    setFormErrors({});
    setIsEditOpen(true);
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  // Validate form
  const validateProductForm = () => {
    const errors = {};
    if (!formName.trim()) errors.name = 'Product name is required';
    if (!formType.trim()) errors.type = 'Product type is required';
    if (!formPrice || isNaN(Number(formPrice)) || Number(formPrice) < 0) {
      errors.price = 'Valid non-negative price is required';
    }
    if (formQuantity === '' || isNaN(Number(formQuantity)) || Number(formQuantity) < 0) {
      errors.quantity = 'Quantity must be a non-negative number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create Product
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) return;

    setIsSubmitting(true);
    setApiError('');
    try {
      const created = await productService.create({
        name: formName.trim(),
        type: formType.trim(),
        price: Number(formPrice),
        available_quantity: Number(formQuantity),
        description: formDescription.trim() || undefined,
      });

      setActionSuccess(`Product "${created.name}" created successfully in catalog and warehouse inventory!`);
      setIsCreateOpen(false);
      fetchProducts();
    } catch (err) {
      setApiError(err.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Product
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateProductForm() || !selectedProduct) return;

    setIsSubmitting(true);
    setApiError('');
    try {
      const updated = await productService.update(selectedProduct.id, {
        name: formName.trim(),
        type: formType.trim(),
        price: Number(formPrice),
        available_quantity: Number(formQuantity),
        description: formDescription.trim() || undefined,
      });

      setActionSuccess(`Product "${updated.name || formName}" updated successfully!`);
      setIsEditOpen(false);
      fetchProducts();
    } catch (err) {
      setApiError(err.message || 'Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Product
  const handleDeleteSubmit = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setApiError('');
    try {
      await productService.delete(selectedProduct.id);
      setActionSuccess(`Product "${selectedProduct.name}" deactivated successfully.`);
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      setApiError(err.message || 'Failed to deactivate product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Item to Cart
  const handleAddToCart = async (product) => {
    setAddingToCartId(product.id);
    try {
      await cartService.addItem(product.id, 1);
      setActionSuccess(`1 unit of "${product.name}" added to cart!`);
    } catch (err) {
      setApiError(err.message || 'Failed to add item to cart.');
    } finally {
      setAddingToCartId(null);
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
              <ProductsIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Product Catalog Management
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                B2B Hardware Inventory & Stock Master (POST /api/products, PUT /api/products/:id, DELETE /api/products/:id)
              </Typography>
            </Box>
          </Stack>

          {canCreate && (
            <Button
              id="open-create-product-btn"
              variant="contained"
              color="primary"
              onClick={handleOpenCreate}
              sx={{ fontWeight: 600, px: 2.5, backgroundColor: '#2563eb', '&:hover': { backgroundColor: '#1d4ed8' } }}
            >
              + Create Product
            </Button>
          )}
        </Stack>
      </Box>

      {/* Permissions & Role Info Banner */}
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
          <Chip label="products.view (Read)" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
          {canCreate && <Chip label="products.create (Create)" size="small" color="primary" sx={{ height: 22, fontSize: '0.7rem', backgroundColor: '#2563eb', color: '#ffffff' }} />}
          {canEdit && <Chip label="products.edit (Edit / Update)" size="small" color="primary" sx={{ height: 22, fontSize: '0.7rem', backgroundColor: '#2563eb', color: '#ffffff' }} />}
          {canDelete && <Chip label="products.delete (Deactivate)" size="small" color="error" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />}
          {canAddToCart && <Chip label="cart.edit (Add to Cart)" size="small" sx={{ height: 22, fontSize: '0.7rem', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }} />}
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

      {/* Search Bar & Stats */}
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
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', sm: 360 } }}>
            <TextField
              size="small"
              placeholder="Search products by name or type..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Chip label={`Total Catalog Items: ${totalCount}`} size="small" sx={{ fontWeight: 600, backgroundColor: '#f1f5f9', color: '#334155' }} />
            <Button size="small" variant="outlined" onClick={fetchProducts} disabled={isLoading} sx={{ textTransform: 'none', borderColor: '#d1d5db', color: '#0f172a' }}>
              Refresh
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Products Table */}
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
        ) : products.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1.5 }}>
              No products found in catalog.
            </Typography>
            {canCreate && (
              <Button variant="contained" color="primary" size="small" onClick={handleOpenCreate}>
                Create Your First Product
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
            <Table size="small" sx={{ width: '100%', minWidth: 680 }}>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow sx={{ '& th': { color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', py: 1.5, borderBottom: '1px solid #e2e8f0' } }}>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category / Type</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Available Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  const qty = Number(product.available_quantity ?? 0);
                  const isOutOfStock = qty <= 0;
                  const isLowStock = qty > 0 && qty <= 10;

                  return (
                    <TableRow
                      key={product.id}
                      sx={{
                        '&:hover': { backgroundColor: '#f8fafc' },
                        '& td': { borderColor: '#f1f5f9', py: 1.2 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {product.name}
                        </Typography>
                        {product.description && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {product.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.type}
                          size="small"
                          sx={{
                            fontSize: '0.72rem',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                          ₹{Number(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {qty} units
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            !product.is_active
                              ? 'Deactivated'
                              : isOutOfStock
                              ? 'Out of Stock'
                              : isLowStock
                              ? 'Low Stock'
                              : 'In Stock'
                          }
                          size="small"
                          color={
                            !product.is_active
                              ? 'default'
                              : isOutOfStock
                              ? 'error'
                              : isLowStock
                              ? 'warning'
                              : 'success'
                          }
                          variant="outlined"
                          sx={{ fontSize: '0.68rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {canAddToCart && product.is_active && !isOutOfStock && (
                            <Tooltip title="Add 1 to Cart">
                              <span>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={addingToCartId === product.id}
                                >
                                  {addingToCartId === product.id ? <CircularProgress size={16} /> : <CartAddIcon />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canEdit && (
                            <Tooltip title="Edit Product">
                              <IconButton size="small" onClick={() => handleOpenEdit(product)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDelete && product.is_active && (
                            <Tooltip title="Deactivate Product">
                              <IconButton size="small" color="error" onClick={() => handleOpenDelete(product)}>
                                <TrashIcon />
                              </IconButton>
                            </Tooltip>
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

      {/* CREATE PRODUCT MODAL */}
      <Dialog open={isCreateOpen} onClose={() => !isSubmitting && setIsCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Product</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label="Product Name"
                placeholder="e.g. Kingston NV2 1TB M.2 NVMe SSD"
                fullWidth
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
                disabled={isSubmitting}
              />

              <TextField
                select
                label="Hardware Category / Type"
                fullWidth
                required
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                error={Boolean(formErrors.type)}
                helperText={formErrors.type}
                disabled={isSubmitting}
              >
                {HARDWARE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Unit Price (₹)"
                  type="number"
                  placeholder="899.00"
                  fullWidth
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  error={Boolean(formErrors.price)}
                  helperText={formErrors.price}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
                <TextField
                  label="Initial Available Quantity"
                  type="number"
                  placeholder="25"
                  fullWidth
                  required
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  error={Boolean(formErrors.quantity)}
                  helperText={formErrors.quantity || 'Auto-creates warehouse stock'}
                  disabled={isSubmitting}
                />
              </Box>

              <TextField
                label="Product Description"
                placeholder="Key specifications, form factor, warranty info..."
                fullWidth
                multiline
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateOpen(false)} disabled={isSubmitting} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ fontWeight: 700 }}>
              {isSubmitting ? <CircularProgress size={20} /> : 'Save Product'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* EDIT PRODUCT MODAL */}
      <Dialog open={isEditOpen} onClose={() => !isSubmitting && setIsEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Product #{selectedProduct?.id}</DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label="Product Name"
                fullWidth
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
                disabled={isSubmitting}
              />

              <TextField
                select
                label="Hardware Category / Type"
                fullWidth
                required
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                error={Boolean(formErrors.type)}
                helperText={formErrors.type}
                disabled={isSubmitting}
              >
                {HARDWARE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Unit Price (₹)"
                  type="number"
                  fullWidth
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  error={Boolean(formErrors.price)}
                  helperText={formErrors.price}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
                <TextField
                  label="Available Quantity"
                  type="number"
                  fullWidth
                  required
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  error={Boolean(formErrors.quantity)}
                  helperText={formErrors.quantity}
                  disabled={isSubmitting}
                />
              </Box>

              <TextField
                label="Product Description"
                fullWidth
                multiline
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsEditOpen(false)} disabled={isSubmitting} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ fontWeight: 700 }}>
              {isSubmitting ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* DELETE / DEACTIVATE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onClose={() => !isSubmitting && setIsDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deactivation</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to deactivate product{' '}
            <strong>"{selectedProduct?.name}"</strong>? This will mark it inactive in the catalog and prevent new orders.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteSubmit} variant="contained" color="error" disabled={isSubmitting} sx={{ fontWeight: 700 }}>
            {isSubmitting ? <CircularProgress size={20} /> : 'Deactivate Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagementPage;
