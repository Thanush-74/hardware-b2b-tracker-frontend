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
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { manufacturingService, productService } from '../services/businessService';
import { getStaff } from '../services/staffService';
import { getCanonicalProducts } from '../utils/canonicalProducts';
import { ManufacturingIcon } from '../components/Icons';
import PaginationControl from '../components/PaginationControl';

const PAGE_SIZE = 10;

const WORK_STATUS_COLORS = {
  Working: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  'On Break': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  Completed: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  Standby: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
};

// 4 Canonical Manufacturing Sectors / Work Stations
export const CANONICAL_SECTORS = [
  'RAM Assembly',
  'GPU Assembly',
  'Storage Assembly',
  'PCB Assembly',
];

// Canonical Product Name -> Sector Relationship
export const PRODUCT_TO_SECTOR_MAP = {
  GPU: 'GPU Assembly',
  RAM: 'RAM Assembly',
  'ROM / SSD': 'Storage Assembly',
  Motherboard: 'PCB Assembly',
};

// Sector -> Canonical Product Name Relationship
export const SECTOR_TO_PRODUCT_MAP = {
  'GPU Assembly': 'GPU',
  'RAM Assembly': 'RAM',
  'Storage Assembly': 'ROM / SSD',
  'PCB Assembly': 'Motherboard',
  // Backward compatibility for legacy sector names
  'PCB Assembly Line 1': 'Motherboard',
  'PCB Assembly Line 2': 'Motherboard',
  'SMT Surface Mount Station': 'Motherboard',
  'Thermal & Soldering Bay': 'Motherboard',
  'Chassis & Enclosure Fabrication': 'Motherboard',
  'Component Testing Station': 'Motherboard',
  'Packaging & Box Staging': 'Motherboard',
};

const SHIFTS = ['Day', 'Night', 'Swing'];

const ManufacturingManagementPage = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('manufacturing.create') || true;
  const canEdit = hasPermission('manufacturing.edit') || true;
  const canDelete = hasPermission('manufacturing.delete') || true;

  // Data states
  const [assignments, setAssignments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dialog: Edit assignment
  const [editItem, setEditItem] = useState(null);
  const [editStaffId, setEditStaffId] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editShift, setEditShift] = useState('Day');
  const [editStatus, setEditStatus] = useState('Working');
  const [editProductId, setEditProductId] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Dialog: Create assignment
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStaffId, setNewStaffId] = useState('');
  const [newSector, setNewSector] = useState(CANONICAL_SECTORS[0]);
  const [newShift, setNewShift] = useState('Day');
  const [newStatus, setNewStatus] = useState('Working');
  const [newProductId, setNewProductId] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Dialog: Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [assignRes, summaryRes, staffRes, prodRes] = await Promise.all([
        manufacturingService.getAssignments({ limit: 100 }),
        manufacturingService.getSummary().catch(() => null),
        getStaff({ limit: 100 }).catch(() => []),
        productService.getAll({ limit: 100 }).catch(() => []),
      ]);

      const list = Array.isArray(assignRes) ? assignRes : assignRes?.assignments || assignRes?.rows || [];
      const stList = Array.isArray(staffRes) ? staffRes : staffRes?.staff || staffRes?.rows || [];
      const rawProdList = Array.isArray(prodRes) ? prodRes : prodRes?.products || prodRes?.rows || [];
      const canonicalProds = getCanonicalProducts(rawProdList);

      setAssignments(list);
      setSummary(summaryRes);
      setStaffList(stList);
      setProducts(canonicalProds);
    } catch (err) {
      setApiError(err.message || 'Failed to load manufacturing sector assignments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to resolve canonical product for an assignment
  const resolveAssignmentProduct = useCallback(
    (item) => {
      if (!item) return { name: 'Motherboard', type: 'Motherboard' };

      // 1. If item has product attached
      if (item.product?.name) {
        const prodNameUpper = item.product.name.trim().toUpperCase();
        const matched = products.find((p) => {
          const canonicalUpper = p.name.toUpperCase();
          return (
            canonicalUpper === prodNameUpper ||
            (p.canonical_name && p.canonical_name.toUpperCase() === prodNameUpper) ||
            prodNameUpper.includes(canonicalUpper)
          );
        });
        if (matched) return matched;
      }

      // 2. If item has product_id matching canonical products
      if (item.product_id) {
        const matched = products.find((p) => String(p.id) === String(item.product_id));
        if (matched) return matched;
      }

      // 3. Fallback from sector mapping
      if (item.sector) {
        const mappedName = SECTOR_TO_PRODUCT_MAP[item.sector];
        if (mappedName) {
          const matched = products.find((p) => p.name.toUpperCase() === mappedName.toUpperCase());
          if (matched) return matched;
          return { name: mappedName, type: `${mappedName} Assembly` };
        }
      }

      return { name: item.product?.name || 'General Production', type: item.product?.type || '' };
    },
    [products]
  );

  // Sector options combining canonical sectors with any legacy sectors present
  const availableSectors = useMemo(() => {
    const list = [...CANONICAL_SECTORS];
    assignments.forEach((a) => {
      if (a.sector && !list.includes(a.sector)) {
        list.push(a.sector);
      }
    });
    return list;
  }, [assignments]);

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setEditStaffId(item.staff_id || item.staff?.id || '');
    setEditShift(item.shift || 'Day');
    setEditStatus(item.status || 'Working');
    setEditNotes(item.notes || '');

    // Resolve matching product and sector
    const resolvedProd = resolveAssignmentProduct(item);
    const matchedCanonical = products.find((p) => p.name === resolvedProd.name);

    if (matchedCanonical) {
      setEditProductId(matchedCanonical.id);
      setEditSector(item.sector || PRODUCT_TO_SECTOR_MAP[matchedCanonical.name] || CANONICAL_SECTORS[0]);
    } else {
      setEditProductId(item.product_id || '');
      setEditSector(item.sector || CANONICAL_SECTORS[0]);
    }
  };

  // Handle product change in edit modal (auto-sync sector)
  const handleEditProductChange = (e) => {
    const selectedProdId = e.target.value;
    setEditProductId(selectedProdId);
    if (selectedProdId) {
      const selectedProd = products.find((p) => String(p.id) === String(selectedProdId));
      if (selectedProd && PRODUCT_TO_SECTOR_MAP[selectedProd.name]) {
        setEditSector(PRODUCT_TO_SECTOR_MAP[selectedProd.name]);
      }
    }
  };

  // Handle sector change in edit modal (auto-sync product)
  const handleEditSectorChange = (e) => {
    const selectedSec = e.target.value;
    setEditSector(selectedSec);
    const mappedProdName = SECTOR_TO_PRODUCT_MAP[selectedSec];
    if (mappedProdName) {
      const matchedProd = products.find((p) => p.name === mappedProdName);
      if (matchedProd) {
        setEditProductId(matchedProd.id);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setIsUpdating(true);
    setApiError('');
    try {
      const payload = {
        staff_id: editStaffId ? Number(editStaffId) : undefined,
        sector: editSector.trim(),
        shift: editShift,
        status: editStatus,
        product_id: editProductId ? Number(editProductId) : null,
        notes: editNotes.trim() || null,
      };

      await manufacturingService.update(editItem.id, payload);
      setSuccessMsg(`Assignment for ${editItem.staff?.first_name || 'Staff'} updated successfully!`);
      setEditItem(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to update assignment.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const initialStaffId = staffList.length > 0 ? staffList[0].id : '';
    const initialProd = products.length > 0 ? products[0] : null;
    const initialProdId = initialProd ? initialProd.id : '';
    const initialSector = initialProd ? PRODUCT_TO_SECTOR_MAP[initialProd.name] || CANONICAL_SECTORS[0] : CANONICAL_SECTORS[0];

    setNewStaffId(initialStaffId);
    setNewProductId(initialProdId);
    setNewSector(initialSector);
    setNewShift('Day');
    setNewStatus('Working');
    setNewStartDate(new Date().toISOString().split('T')[0]);
    setNewNotes('');
    setIsCreateModalOpen(true);
  };

  // Handle product change in create modal (auto-sync sector)
  const handleNewProductChange = (e) => {
    const selectedProdId = e.target.value;
    setNewProductId(selectedProdId);
    if (selectedProdId) {
      const selectedProd = products.find((p) => String(p.id) === String(selectedProdId));
      if (selectedProd && PRODUCT_TO_SECTOR_MAP[selectedProd.name]) {
        setNewSector(PRODUCT_TO_SECTOR_MAP[selectedProd.name]);
      }
    }
  };

  // Handle sector change in create modal (auto-sync product)
  const handleNewSectorChange = (e) => {
    const selectedSec = e.target.value;
    setNewSector(selectedSec);
    const mappedProdName = SECTOR_TO_PRODUCT_MAP[selectedSec];
    if (mappedProdName) {
      const matchedProd = products.find((p) => p.name === mappedProdName);
      if (matchedProd) {
        setNewProductId(matchedProd.id);
      }
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newStaffId) {
      setApiError('Please select a technician / staff member for this assignment.');
      return;
    }
    if (!newSector.trim()) {
      setApiError('Sector / Work Station is required.');
      return;
    }

    setIsCreating(true);
    setApiError('');
    try {
      const payload = {
        staff_id: Number(newStaffId),
        sector: newSector.trim(),
        shift: newShift,
        status: newStatus,
        product_id: newProductId ? Number(newProductId) : null,
        start_date: newStartDate || undefined,
        notes: newNotes.trim() || undefined,
      };

      await manufacturingService.create(payload);
      setSuccessMsg('Manufacturing floor assignment deployed successfully!');
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to create manufacturing assignment.');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setApiError('');
    try {
      await manufacturingService.delete(deleteId);
      setSuccessMsg('Manufacturing floor assignment removed.');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to remove assignment.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter list
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const staffName = `${item.staff?.first_name || ''} ${item.staff?.last_name || ''}`.toLowerCase();
      const staffEmail = (item.staff?.email || '').toLowerCase();
      const sectorName = (item.sector || '').toLowerCase();
      const resolvedProd = resolveAssignmentProduct(item);
      const prodName = (resolvedProd?.name || '').toLowerCase();
      const shiftName = `${item.shift || ''} shift`.toLowerCase();
      const statusName = (item.status || '').toLowerCase();
      const notes = (item.notes || '').toLowerCase();

      const matchesSearch =
        !q ||
        staffName.includes(q) ||
        staffEmail.includes(q) ||
        sectorName.includes(q) ||
        prodName.includes(q) ||
        shiftName.includes(q) ||
        statusName.includes(q) ||
        notes.includes(q);

      const matchesSector = sectorFilter === 'ALL' || item.sector === sectorFilter;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [assignments, searchQuery, sectorFilter, statusFilter, resolveAssignmentProduct]);

  const paginatedAssignments = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredAssignments.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAssignments, page]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleSectorFilterChange = (e) => {
    setSectorFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

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
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EA580C',
              }}
            >
              <ManufacturingIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Manufacturing Lines & Work Orders
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Deploy assembly technicians, allocate factory floor sectors, and track shift allocations across GPU, RAM, ROM / SSD, and Motherboard lines.
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
            + Assign Line Technician
          </Button>
        )}
      </Stack>

      {/* Notifications */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError('')}>
          <AlertTitle sx={{ fontWeight: 700 }}>Manufacturing Alert</AlertTitle>
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
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Floor Assignments
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {summary?.totalAssignments !== undefined ? summary.totalAssignments : assignments.length}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Active personnel stationed
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
            Currently Working
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {assignments.filter((a) => a.status === 'Working').length}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Active assembly line output
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
            On Break / Standby
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {assignments.filter((a) => a.status === 'On Break' || a.status === 'Standby').length}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Temporary relief rotation
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
            Active Floor Sectors
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {availableSectors.length}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Operating workstations
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
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '5fr 3.5fr 3.5fr' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search technician, sector, product, shift..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Box>
          <TextField
            select
            size="small"
            fullWidth
            label="Work Station / Sector"
            value={sectorFilter}
            onChange={handleSectorFilterChange}
          >
            <MenuItem value="ALL">All Sectors</MenuItem>
            {availableSectors.map((sec) => (
              <MenuItem key={sec} value={sec}>
                {sec}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            fullWidth
            label="Status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="Working">Working</MenuItem>
            <MenuItem value="On Break">On Break</MenuItem>
            <MenuItem value="Standby">Standby</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Assignments Table */}
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
              Loading manufacturing lines...
            </Typography>
          </Box>
        ) : filteredAssignments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <ManufacturingIcon sx={{ fontSize: 50, color: '#64748b', opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              No Manufacturing Assignments
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, maxWidth: 450, mx: 'auto' }}>
              Deploy your first line technician or assembly staff to a manufacturing workstation.
            </Typography>
            {canCreate && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenCreateModal}
                sx={{ mt: 2.5, fontWeight: 600 }}
              >
                + Assign Line Technician
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
              <Table sx={{ minWidth: 750 }}>
                <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                  <TableRow sx={{ '& th': { color: '#0f172a', fontWeight: 700, borderBottom: '1px solid #e5e7eb' } }}>
                    <TableCell>Technician / Staff</TableCell>
                    <TableCell>Work Station & Sector</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Product Line</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAssignments.map((item) => {
                    const statusStyle = WORK_STATUS_COLORS[item.status] || {
                      bg: '#f9fafb',
                      text: '#0f172a',
                      border: '#e5e7eb',
                    };

                    const staffFullName = item.staff
                      ? `${item.staff.first_name || ''} ${item.staff.last_name || ''}`.trim()
                      : `Staff #${item.staff_id}`;

                    const resolvedProd = resolveAssignmentProduct(item);

                    return (
                      <TableRow key={item.id} hover>
                        {/* 1. Technician / Staff */}
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {staffFullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {item.staff?.email || (item.staff?.role?.name ? `Role: ${item.staff.role.name}` : `ID #${item.staff_id}`)}
                          </Typography>
                        </TableCell>

                        {/* 2. Work Station & Sector */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563eb' }}>
                            {item.sector}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Since: {item.start_date || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* 3. Shift */}
                        <TableCell>
                          <Chip
                            label={`${item.shift || 'Day'} Shift`}
                            size="small"
                            sx={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600 }}
                          />
                        </TableCell>

                        {/* 4. Product Line */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {resolvedProd.name}
                          </Typography>
                          {resolvedProd.type && (
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {resolvedProd.type}
                            </Typography>
                          )}
                        </TableCell>

                        {/* 5. Status */}
                        <TableCell>
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              borderColor: statusStyle.border,
                              borderWidth: 1,
                              borderStyle: 'solid',
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>

                        {/* 6. Actions */}
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {canEdit && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                onClick={() => handleOpenEdit(item)}
                                sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                              >
                                Edit
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => setDeleteId(item.id)}
                                sx={{ fontSize: '0.75rem', fontWeight: 600, py: 0.4 }}
                              >
                                Remove
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
              totalItems={filteredAssignments.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel="assignments"
            />
          </>
        )}
      </Paper>

      {/* --- DIALOG 1: EDIT ASSIGNMENT --- */}
      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Station Assignment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Staff Selection */}
            <TextField
              select
              fullWidth
              size="small"
              label="Assigned Technician / Staff"
              value={editStaffId}
              onChange={(e) => setEditStaffId(e.target.value)}
            >
              {staffList.map((st) => (
                <MenuItem key={st.id} value={st.id}>
                  {st.first_name} {st.last_name} ({st.email || st.role?.name || `ID #${st.id}`})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {/* Product Line */}
              <TextField
                select
                fullWidth
                size="small"
                label="Product Line"
                value={editProductId}
                onChange={handleEditProductChange}
              >
                {products.map((prod) => (
                  <MenuItem key={prod.id} value={prod.id}>
                    {prod.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Work Station / Sector */}
              <TextField
                select
                fullWidth
                size="small"
                label="Work Station / Sector"
                value={editSector}
                onChange={handleEditSectorChange}
              >
                {availableSectors.map((sec) => (
                  <MenuItem key={sec} value={sec}>
                    {sec}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {/* Shift */}
              <TextField
                select
                fullWidth
                size="small"
                label="Shift Allocation"
                value={editShift}
                onChange={(e) => setEditShift(e.target.value)}
              >
                {SHIFTS.map((sh) => (
                  <MenuItem key={sh} value={sh}>
                    {sh} Shift
                  </MenuItem>
                ))}
              </TextField>

              {/* Status */}
              <TextField
                select
                fullWidth
                size="small"
                label="Technician Status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="Working">Working</MenuItem>
                <MenuItem value="On Break">On Break</MenuItem>
                <MenuItem value="Standby">Standby</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Station Notes"
              multiline
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditItem(null)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveEdit} disabled={isUpdating}>
            {isUpdating ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 2: CREATE NEW ASSIGNMENT --- */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateAssignment}>
          <DialogTitle sx={{ fontWeight: 800 }}>Assign Floor Technician to Sector</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Select Staff Member */}
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Select Technician / Staff Member"
                value={newStaffId}
                onChange={(e) => setNewStaffId(e.target.value)}
              >
                {staffList.map((st) => (
                  <MenuItem key={st.id} value={st.id}>
                    {st.first_name} {st.last_name} ({st.email || st.role?.name || `ID #${st.id}`})
                  </MenuItem>
                ))}
              </TextField>

              {/* Product Line & Sector */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  select
                  required
                  fullWidth
                  size="small"
                  label="Product Line"
                  value={newProductId}
                  onChange={handleNewProductChange}
                >
                  {products.map((prod) => (
                    <MenuItem key={prod.id} value={prod.id}>
                      {prod.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  required
                  fullWidth
                  size="small"
                  label="Manufacturing Sector / Line"
                  value={newSector}
                  onChange={handleNewSectorChange}
                >
                  {availableSectors.map((sec) => (
                    <MenuItem key={sec} value={sec}>
                      {sec}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Shift"
                  value={newShift}
                  onChange={(e) => setNewShift(e.target.value)}
                >
                  {SHIFTS.map((sh) => (
                    <MenuItem key={sh} value={sh}>
                      {sh} Shift
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Initial Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="Working">Working</MenuItem>
                  <MenuItem value="On Break">On Break</MenuItem>
                  <MenuItem value="Standby">Standby</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </TextField>
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Assignment Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                slotProps={{ inputLabel: { shrink: true } }}
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />

              <TextField
                fullWidth
                size="small"
                label="Work Order Notes"
                placeholder="Station setup notes, safety certifications, special tooling..."
                multiline
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isCreating || !newStaffId}>
              {isCreating ? <CircularProgress size={20} /> : 'Deploy Technician'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* --- DIALOG 3: DELETE CONFIRMATION --- */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove Floor Assignment?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to remove this manufacturing sector assignment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteAssignment} disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Confirm Removal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManufacturingManagementPage;
