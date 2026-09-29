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
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { manufacturingService, productService } from '../services/businessService';
import { getStaff } from '../services/staffService';
import { ManufacturingIcon, StaffIcon } from '../components/Icons';

const WORK_STATUS_COLORS = {
  Working: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  'On Break': { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
  Completed: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
  Standby: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.3)' },
};

const COMMON_SECTORS = [
  'PCB Assembly Line 1',
  'PCB Assembly Line 2',
  'SMT Surface Mount Station',
  'Chassis & Enclosure Fabrication',
  'Thermal & Soldering Bay',
  'Component Testing Station',
  'Packaging & Box Staging',
];

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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dialog: Edit assignment
  const [editItem, setEditItem] = useState(null);
  const [editSector, setEditSector] = useState('');
  const [editShift, setEditShift] = useState('Day');
  const [editStatus, setEditStatus] = useState('Working');
  const [editProductId, setEditProductId] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Dialog: Create assignment
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStaffId, setNewStaffId] = useState('');
  const [newSector, setNewSector] = useState(COMMON_SECTORS[0]);
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
        manufacturingService.getAssignments(),
        manufacturingService.getSummary().catch(() => null),
        getStaff().catch(() => []),
        productService.getAll().catch(() => []),
      ]);

      const list = Array.isArray(assignRes) ? assignRes : assignRes?.assignments || assignRes?.rows || [];
      const stList = staffRes?.staff || staffRes || [];
      const pList = prodRes?.products || prodRes || [];

      setAssignments(list);
      setSummary(summaryRes);
      setStaffList(stList);
      setProducts(pList);
    } catch (err) {
      setApiError(err.message || 'Failed to load manufacturing sector assignments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setEditSector(item.sector || '');
    setEditShift(item.shift || 'Day');
    setEditStatus(item.status || 'Working');
    setEditProductId(item.product_id || '');
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setIsUpdating(true);
    setApiError('');
    try {
      const payload = {
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
    setNewStaffId(staffList.length > 0 ? staffList[0].id : '');
    setNewSector(COMMON_SECTORS[0]);
    setNewShift('Day');
    setNewStatus('Working');
    setNewProductId('');
    setNewStartDate(new Date().toISOString().split('T')[0]);
    setNewNotes('');
    setIsCreateModalOpen(true);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newStaffId) {
      setApiError('Please select a staff member for this assignment.');
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
  const filteredAssignments = assignments.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const staffName = `${item.staff?.first_name || ''} ${item.staff?.last_name || ''}`.toLowerCase();
    const sectorName = item.sector?.toLowerCase() || '';

    const matchesSearch = !q || staffName.includes(q) || sectorName.includes(q) || item.notes?.toLowerCase().includes(q);
    const matchesSector = sectorFilter === 'ALL' || item.sector === sectorFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesSector && matchesStatus;
  });

  // Unique sectors from list for dropdown filter
  const uniqueSectors = Array.from(new Set(assignments.map((a) => a.sector).filter(Boolean)));

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
                Deploy assembly technicians, allocate factory floor sectors, and track shift allocations.
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
              Floor Assignments
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {summary?.totalAssignments !== undefined ? summary.totalAssignments : assignments.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Active personnel stationed
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
              Currently Working
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
              {assignments.filter((a) => a.status === 'Working').length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Active assembly line output
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
              On Break / Standby
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mt: 0.5 }}>
              {assignments.filter((a) => a.status === 'On Break' || a.status === 'Standby').length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Temporary relief rotation
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
              Active Floor Sectors
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', mt: 0.5 }}>
              {uniqueSectors.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Operating workstations
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
          <Grid item xs={12} md={5}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search technician, sector, or workstation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              size="small"
              fullWidth
              label="Work Station / Sector"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Sectors</MenuItem>
              {uniqueSectors.map((sec) => (
                <MenuItem key={sec} value={sec}>
                  {sec}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              size="small"
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="Working">Working</MenuItem>
              <MenuItem value="On Break">On Break</MenuItem>
              <MenuItem value="Standby">Standby</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Assignments Table */}
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
              Loading manufacturing lines...
            </Typography>
          </Box>
        ) : filteredAssignments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <ManufacturingIcon sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              No Manufacturing Assignments
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 450, mx: 'auto' }}>
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
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Technician / Staff</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Work Station & Sector</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Shift</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Product Line</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssignments.map((item) => {
                  const statusStyle = WORK_STATUS_COLORS[item.status] || {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    text: '#FFF',
                    border: 'rgba(255, 255, 255, 0.1)',
                  };

                  const staffName = item.staff
                    ? `${item.staff.first_name} ${item.staff.last_name}`
                    : `Staff #${item.staff_id}`;

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {staffName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.staff?.email || `ID #${item.staff_id}`}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.light' }}>
                          {item.sector}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Since: {item.start_date || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${item.shift || 'Day'} Shift`}
                          size="small"
                          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {item.product?.name || 'General Component Assembly'}
                        </Typography>
                        {item.product?.type && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {item.product.type}
                          </Typography>
                        )}
                      </TableCell>

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
        )}
      </Paper>

      {/* --- DIALOG 1: EDIT ASSIGNMENT --- */}
      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Station Assignment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Work Station Sector"
              value={editSector}
              onChange={(e) => setEditSector(e.target.value)}
            >
              {COMMON_SECTORS.map((sec) => (
                <MenuItem key={sec} value={sec}>
                  {sec}
                </MenuItem>
              ))}
            </TextField>

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

            <TextField
              select
              fullWidth
              size="small"
              label="Associated Product (Optional)"
              value={editProductId}
              onChange={(e) => setEditProductId(e.target.value)}
            >
              <MenuItem value="">General Assembly</MenuItem>
              {products.map((prod) => (
                <MenuItem key={prod.id} value={prod.id}>
                  {prod.name}
                </MenuItem>
              ))}
            </TextField>

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
                    {st.first_name} {st.last_name} ({st.email})
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
                onChange={(e) => setNewSector(e.target.value)}
              >
                {COMMON_SECTORS.map((sec) => (
                  <MenuItem key={sec} value={sec}>
                    {sec}
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Initial Status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <MenuItem value="Working">Working</MenuItem>
                    <MenuItem value="Standby">Standby</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Dedicated Product (Optional)"
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                  >
                    <MenuItem value="">General Production</MenuItem>
                    {products.map((prod) => (
                      <MenuItem key={prod.id} value={prod.id}>
                        {prod.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Assignment Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </Grid>
              </Grid>

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
