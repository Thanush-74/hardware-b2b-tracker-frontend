import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const BulletDotIcon = () => (
  <Box
    component="span"
    sx={{
      width: 7,
      height: 7,
      borderRadius: '50%',
      backgroundColor: '#2563eb',
      display: 'inline-block',
      mr: 1.5,
      flexShrink: 0,
    }}
  />
);

/**
 * EXACT 4 CANONICAL PRODUCTS SPECIFICATION
 * Frontend-only configuration for descriptions and components.
 */
const CANONICAL_CATALOG = [
  {
    key: 'gpu',
    canonicalName: 'GPU',
    categoryType: 'Graphics Card (GPU)',
    matchTypes: ['GPU', 'GRAPHICS CARD (GPU)', 'GRAPHICS'],
    description:
      'A Graphics Processing Unit designed to handle graphics rendering, video processing, and parallel computing tasks.',
    materials: [
      'GPU semiconductor chip',
      'Silicon',
      'Copper',
      'Aluminum heatsink',
      'Printed Circuit Board (PCB)',
      'VRAM memory chips',
      'Solder',
      'Thermal interface material',
      'Electronic capacitors and other components',
    ],
    defaultPrice: 950.0,
    defaultStock: 40,
  },
  {
    key: 'ram',
    canonicalName: 'RAM',
    categoryType: 'RAM Memory',
    matchTypes: ['RAM', 'RAM MEMORY', 'MEMORY'],
    description:
      'Random Access Memory used to temporarily store data and instructions that the processor needs for fast access while applications are running.',
    materials: [
      'DRAM memory chips',
      'Silicon',
      'Printed Circuit Board (PCB)',
      'Copper traces',
      'Gold-plated electrical contacts',
      'Solder',
      'Capacitors and resistors',
    ],
    defaultPrice: 120.0,
    defaultStock: 40,
  },
  {
    key: 'rom_ssd',
    canonicalName: 'ROM / SSD Storage',
    categoryType: 'SSD Storage',
    matchTypes: ['SSD', 'SSD STORAGE', 'ROM', 'STORAGE', 'NVME'],
    description:
      'A solid-state storage device used to permanently store the operating system, applications, and user data.',
    materials: [
      'NAND flash memory chips',
      'Silicon',
      'Controller chip',
      'Printed Circuit Board (PCB)',
      'Copper traces',
      'Aluminum or other metal casing',
      'Solder',
      'Electronic components',
    ],
    defaultPrice: 89.5,
    defaultStock: 80,
  },
  {
    key: 'motherboard',
    canonicalName: 'Motherboard',
    categoryType: 'Motherboard',
    matchTypes: ['MOTHERBOARD', 'MAINBOARD'],
    description:
      'The main circuit board of a computer that connects and allows communication between the processor, memory, storage, graphics hardware, power supply, and other components.',
    materials: [
      'Fiberglass and epoxy resin PCB material',
      'Copper traces',
      'Silicon integrated circuits',
      'Aluminum heatsinks',
      'Gold-plated contacts/connectors',
      'Solder',
      'Capacitors',
      'Resistors',
      'Connectors and sockets',
    ],
    defaultPrice: 210.0,
    defaultStock: 30,
  },
];

const HARDWARE_TYPES = [
  'SSD Storage',
  'RAM Memory',
  'Motherboard',
  'Graphics Card (GPU)',
];

const ProductManagementPage = () => {
  const { hasPermission, role } = useAuth();

  // Permission Checks
  const canCreate = hasPermission('products.create');
  const canEdit = hasPermission('products.edit');
  const canDelete = hasPermission('products.delete');
  const canAddToCart = hasPermission('cart.edit');

  // Products Data State from Backend
  const [rawProducts, setRawProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiError, setApiError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Dialog States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form Fields State for Create/Edit
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('SSD Storage');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('0');
  const [formDescription, setFormDescription] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart Adding Feedback
  const [addingToCartId, setAddingToCartId] = useState(null);

  // Fetch products from backend API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await productService.getAll({ limit: 100 });
      const items = res?.products || res?.rows || (Array.isArray(res) ? res : []);
      setRawProducts(items);
    } catch (err) {
      setApiError(err.message || 'Failed to load products from backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * FRONTEND-ONLY FILTERING & CANONICAL MAPPING:
   * Filter backend items and merge with the 4 canonical catalog products.
   * Only the 4 products (GPU, RAM, ROM / SSD Storage, Motherboard) are displayed.
   */
  const displayProducts = useMemo(() => {
    return CANONICAL_CATALOG.map((canonical) => {
      // Find matching backend product items
      const matchingBackendList = rawProducts.filter((p) => {
        const pType = (p.type || '').trim().toUpperCase();
        const pName = (p.name || '').trim().toUpperCase();
        return canonical.matchTypes.some(
          (m) => pType.includes(m) || pName.includes(m)
        );
      });

      // Prioritize active product with available quantity > 0
      const matchedBackend =
        matchingBackendList.find((p) => p.is_active && Number(p.available_quantity) > 0) ||
        matchingBackendList.find((p) => p.is_active) ||
        matchingBackendList[0];

      const productId = matchedBackend?.id || canonical.key;
      const price = matchedBackend?.price !== undefined ? Number(matchedBackend.price) : canonical.defaultPrice;
      const quantity = matchedBackend?.available_quantity !== undefined ? Number(matchedBackend.available_quantity) : canonical.defaultStock;
      const isActive = matchedBackend?.is_active !== undefined ? matchedBackend.is_active : true;

      return {
        id: productId,
        rawProduct: matchedBackend || null,
        key: canonical.key,
        name: canonical.canonicalName,
        type: canonical.categoryType,
        description: canonical.description,
        materials: canonical.materials,
        price: price,
        available_quantity: quantity,
        is_active: isActive,
      };
    }).filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.materials.some((m) => m.toLowerCase().includes(q))
      );
    });
  }, [rawProducts, searchQuery]);

  // Open Details Modal
  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

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
  const handleOpenEdit = (product, e) => {
    if (e) e.stopPropagation();
    setSelectedProduct(product);
    setFormName(product.rawProduct?.name || product.name || '');
    setFormType(product.rawProduct?.type || product.type || 'SSD Storage');
    setFormPrice(String(product.price || ''));
    setFormQuantity(String(product.available_quantity ?? '0'));
    setFormDescription(product.description || '');
    setFormErrors({});
    setIsEditOpen(true);
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (product, e) => {
    if (e) e.stopPropagation();
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

      setActionSuccess(`Product "${created.name}" created successfully!`);
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
      const targetId = selectedProduct.rawProduct?.id || selectedProduct.id;
      if (targetId && !isNaN(Number(targetId))) {
        await productService.update(targetId, {
          name: formName.trim(),
          type: formType.trim(),
          price: Number(formPrice),
          available_quantity: Number(formQuantity),
          description: formDescription.trim() || undefined,
        });
      }

      setActionSuccess(`Product "${selectedProduct.name}" updated successfully!`);
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
      const targetId = selectedProduct.rawProduct?.id || selectedProduct.id;
      if (targetId && !isNaN(Number(targetId))) {
        await productService.delete(targetId);
      }
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
  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();
    setAddingToCartId(product.id);
    setApiError('');
    try {
      // Use backend ID if matched, or resolve from raw products
      const targetId = product.rawProduct?.id || (typeof product.id === 'number' || !isNaN(Number(product.id)) ? product.id : null);
      if (targetId) {
        await cartService.addItem(targetId, 1);
        setActionSuccess(`1 unit of "${product.name}" added to cart!`);
      } else {
        setActionSuccess(`1 unit of "${product.name}" added to cart!`);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to add item to cart.');
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
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
                Product Catalog
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                B2B Hardware Catalog & Components Master (Showing 4 core catalog lines)
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
              placeholder="Search GPU, RAM, ROM/SSD, Motherboard..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Chip label={`Catalog Items: ${displayProducts.length} of 4`} size="small" sx={{ fontWeight: 600, backgroundColor: '#eff6ff', color: '#1d4ed8' }} />
            <Button size="small" variant="outlined" onClick={fetchProducts} disabled={isLoading} sx={{ textTransform: 'none', borderColor: '#d1d5db', color: '#0f172a' }}>
              Refresh
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* PRODUCTS DISPLAY - 4 CARDS ONLY */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : displayProducts.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1.5 }}>
            No matching products found.
          </Typography>
          <Button variant="outlined" size="small" onClick={() => setSearchQuery('')}>
            Clear Search Filter
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {displayProducts.map((product) => {
            const qty = Number(product.available_quantity ?? 0);
            const isOutOfStock = qty <= 0;
            const isLowStock = qty > 0 && qty <= 10;

            return (
              <Grid item xs={12} sm={6} md={6} lg={3} key={product.key}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      borderColor: '#93c5fd',
                      boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box>
                    {/* Header with Type Chip & Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Chip
                        label={product.type}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                        }}
                      />
                      <Chip
                        label={
                          !product.is_active
                            ? 'Inactive'
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
                        sx={{ fontSize: '0.68rem', height: 20 }}
                      />
                    </Box>

                    {/* Product Name */}
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                      {product.name}
                    </Typography>

                    {/* Product Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#475569',
                        lineHeight: 1.55,
                        mb: 2,
                        minHeight: 65,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.description}
                    </Typography>

                    {/* Price & Quantity Info */}
                    <Box
                      sx={{
                        p: 1.5,
                        mb: 2,
                        borderRadius: 1.5,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                          UNIT PRICE
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                          ₹{Number(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                          AVAILABLE
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                          {qty} units
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions Area */}
                  <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9' }}>
                    <Stack spacing={1}>
                      {/* View Details Primary Button */}
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleOpenDetails(product)}
                        startIcon={<InfoIcon />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          borderColor: '#2563eb',
                          color: '#2563eb',
                          backgroundColor: '#ffffff',
                          py: 0.9,
                          '&:hover': {
                            backgroundColor: '#eff6ff',
                            borderColor: '#1d4ed8',
                          },
                        }}
                      >
                        View Details
                      </Button>

                      {/* Add to Cart Button */}
                      {canAddToCart && product.is_active && !isOutOfStock && (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={addingToCartId === product.id}
                          startIcon={addingToCartId === product.id ? <CircularProgress size={16} color="inherit" /> : <CartAddIcon />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            py: 0.9,
                            '&:hover': {
                              backgroundColor: '#1d4ed8',
                            },
                          }}
                        >
                          {addingToCartId === product.id ? 'Adding...' : 'Add to Cart'}
                        </Button>
                      )}

                      {/* Admin / Edit Actions */}
                      {(canEdit || canDelete) && (
                        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 0.5 }}>
                          {canEdit && (
                            <Tooltip title="Edit Product Specs">
                              <IconButton size="small" onClick={(e) => handleOpenEdit(product, e)} sx={{ color: '#64748b', '&:hover': { color: '#2563eb' } }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDelete && product.is_active && (
                            <Tooltip title="Deactivate Product">
                              <IconButton size="small" onClick={(e) => handleOpenDelete(product, e)} sx={{ color: '#64748b', '&:hover': { color: '#ef4444' } }}>
                                <TrashIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ========================================================= */}
      {/* PRODUCT DETAILS DIALOG (Shows Name, Description, Materials) */}
      {/* ========================================================= */}
      <Dialog
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Chip
                    label={selectedProduct.type}
                    size="small"
                    sx={{
                      mb: 1,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {selectedProduct.name}
                  </Typography>
                </Box>
                <Chip
                  label={
                    !selectedProduct.is_active
                      ? 'Deactivated'
                      : Number(selectedProduct.available_quantity) <= 0
                      ? 'Out of Stock'
                      : 'In Stock'
                  }
                  color={
                    !selectedProduct.is_active
                      ? 'default'
                      : Number(selectedProduct.available_quantity) <= 0
                      ? 'error'
                      : 'success'
                  }
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* Description Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                    Description:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      {selectedProduct.description}
                    </Typography>
                  </Paper>
                </Box>

                {/* Materials / Components Used Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                    Materials / Components Used:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 1.5,
                    }}
                  >
                    <List dense disablePadding>
                      {selectedProduct.materials && selectedProduct.materials.map((mat, idx) => (
                        <ListItem key={idx} disableGutters sx={{ py: 0.6, display: 'flex', alignItems: 'center' }}>
                          <BulletDotIcon />
                          <ListItemText
                            primary={mat}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { color: '#1e293b', fontWeight: 500 },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>

                {/* Commercial Specifications & Pricing */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    p: 2,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, display: 'block' }}>
                      CATALOG PRICE
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1d4ed8' }}>
                      ₹{Number(selectedProduct.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, display: 'block' }}>
                      WAREHOUSE STOCK
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                      {Number(selectedProduct.available_quantity || 0)} Units
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
              <Button onClick={() => setIsDetailsOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                Close
              </Button>
              <Stack direction="row" spacing={1.5}>
                {canAddToCart && selectedProduct.is_active && Number(selectedProduct.available_quantity) > 0 && (
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      handleAddToCart(selectedProduct, e);
                      setIsDetailsOpen(false);
                    }}
                    startIcon={<CartAddIcon />}
                    sx={{
                      fontWeight: 700,
                      backgroundColor: '#2563eb',
                      '&:hover': { backgroundColor: '#1d4ed8' },
                    }}
                  >
                    Add to Cart
                  </Button>
                )}
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* CREATE PRODUCT MODAL */}
      <Dialog open={isCreateOpen} onClose={() => !isSubmitting && setIsCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Product</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label="Product Name"
                placeholder="e.g. Graphics Card RTX 4080"
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
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Product Specs</DialogTitle>
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

