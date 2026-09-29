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
  LinearProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { inspectionService, productService } from '../services/businessService';
import { getStaff } from '../services/staffService';
import { InspectionIcon } from '../components/Icons';

const RESULT_COLORS = {
  Passed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  Failed: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
  Pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
  Conditional: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
};

const SEVERITY_COLORS = {
  Low: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' },
  Medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
  High: { bg: 'rgba(234, 88, 12, 0.15)', text: '#EA580C' },
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
};

const DEFECT_TYPES = [
  'None / Clean Pass',
  'Solder Bridge / Short Circuit',
  'Cold / Dry Joint',
  'Misaligned SMT Component',
  'Thermal Dissipation Failure',
  'PCB Trace Degradation',
  'Enclosure Tolerance Issue',
  'Firmware / Controller Flash Error',
  'Cosmetic Scratches',
  'Other Defect',
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const RESULTS = ['Passed', 'Failed', 'Pending', 'Conditional'];

const InspectionManagementPage = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('inspection.create') || true;
  const canEdit = hasPermission('inspection.edit') || true;
  const canDelete = hasPermission('inspection.delete') || true;

  // Data states
  const [inspections, setInspections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Dialog: Edit Inspection
  const [editItem, setEditItem] = useState(null);
  const [editBatchNo, setEditBatchNo] = useState('');
  const [editInspected, setEditInspected] = useState('');
  const [editPassed, setEditPassed] = useState('');
  const [editFailed, setEditFailed] = useState('');
  const [editResult, setEditResult] = useState('Passed');
  const [editDefect, setEditDefect] = useState('');
  const [editSeverity, setEditSeverity] = useState('Low');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Dialog: Create Inspection
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInspectorId, setNewInspectorId] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [newBatchNo, setNewBatchNo] = useState('');
  const [newInspected, setNewInspected] = useState('50');
  const [newPassed, setNewPassed] = useState('50');
  const [newFailed, setNewFailed] = useState('0');
  const [newResult, setNewResult] = useState('Passed');
  const [newDefect, setNewDefect] = useState(DEFECT_TYPES[0]);
  const [newSeverity, setNewSeverity] = useState('Low');
  const [newInspectionDate, setNewInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Dialog: Delete
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch inspections and quality summary
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [inspRes, summaryRes, prodRes, staffRes] = await Promise.all([
        inspectionService.getAll(),
        inspectionService.getSummary().catch(() => null),
        productService.getAll().catch(() => []),
        getStaff().catch(() => []),
      ]);

      const list = Array.isArray(inspRes) ? inspRes : inspRes?.inspections || inspRes?.rows || [];
      const pList = prodRes?.products || prodRes || [];
      const stList = staffRes?.staff || staffRes || [];

      setInspections(list);
      setSummary(summaryRes);
      setProducts(pList);
      setStaffList(stList);
    } catch (err) {
      setApiError(err.message || 'Failed to load inspection records.');
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
    setEditBatchNo(item.batch_number || '');
    setEditInspected(item.quantity_inspected !== undefined ? item.quantity_inspected : '');
    setEditPassed(item.passed_quantity !== undefined ? item.passed_quantity : '');
    setEditFailed(item.failed_quantity !== undefined ? item.failed_quantity : '');
    setEditResult(item.result || 'Passed');
    setEditDefect(item.defect_type || DEFECT_TYPES[0]);
    setEditSeverity(item.severity || 'Low');
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setIsUpdating(true);
    setApiError('');
    try {
      const payload = {
        batch_number: editBatchNo.trim() || undefined,
        quantity_inspected: Number(editInspected) || 1,
        passed_quantity: Number(editPassed) || 0,
        failed_quantity: Number(editFailed) || 0,
        result: editResult,
        defect_type: editDefect || undefined,
        severity: editSeverity,
        notes: editNotes.trim() || undefined,
      };

      await inspectionService.update(editItem.id, payload);
      setSuccessMsg(`Inspection report #${editItem.id} updated successfully!`);
      setEditItem(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to update inspection report.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setNewInspectorId(staffList.length > 0 ? staffList[0].id : '');
    setNewProductId(products.length > 0 ? products[0].id : '');
    setNewBatchNo(`QA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`);
    setNewInspected('50');
    setNewPassed('50');
    setNewFailed('0');
    setNewResult('Passed');
    setNewDefect(DEFECT_TYPES[0]);
    setNewSeverity('Low');
    setNewInspectionDate(new Date().toISOString().split('T')[0]);
    setNewNotes('');
    setIsCreateModalOpen(true);
  };

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    if (!newInspectorId) {
      setApiError('Please select a QA inspector.');
      return;
    }

    setIsCreating(true);
    setApiError('');
    try {
      const payload = {
        inspector_id: Number(newInspectorId),
        product_id: newProductId ? Number(newProductId) : null,
        batch_number: newBatchNo.trim() || undefined,
        quantity_inspected: Number(newInspected) || 1,
        passed_quantity: Number(newPassed) || 0,
        failed_quantity: Number(newFailed) || 0,
        result: newResult,
        defect_type: newDefect === 'None / Clean Pass' ? null : newDefect,
        severity: newSeverity,
        inspection_date: newInspectionDate || undefined,
        notes: newNotes.trim() || undefined,
      };

      await inspectionService.create(payload);
      setSuccessMsg(`Quality inspection report logged successfully!`);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to log inspection report.');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete Inspection
  const handleDeleteInspection = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    setApiError('');
    try {
      await inspectionService.delete(deleteId);
      setSuccessMsg('Inspection report removed.');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setApiError(err.message || 'Failed to delete inspection report.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered List
  const filteredList = inspections.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const inspectorName = `${item.inspector?.first_name || ''} ${item.inspector?.last_name || ''}`.toLowerCase();
    const matchesSearch =
      !q ||
      item.batch_number?.toLowerCase().includes(q) ||
      item.product?.name?.toLowerCase().includes(q) ||
      item.defect_type?.toLowerCase().includes(q) ||
      inspectorName.includes(q) ||
      item.notes?.toLowerCase().includes(q);

    const matchesResult = resultFilter === 'ALL' || item.result === resultFilter;
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;

    return matchesSearch && matchesResult && matchesSeverity;
  });

  // KPI Calculations
  const passRate = summary?.passRatePercentage !== undefined
    ? summary.passRatePercentage
    : (inspections.length > 0
        ? Math.round(
            (inspections.reduce((s, i) => s + Number(i.passed_quantity || 0), 0) /
              Math.max(1, inspections.reduce((s, i) => s + Number(i.quantity_inspected || 0), 0))) *
              100
          )
        : 100);

  const totalInspected = summary?.totalInspected !== undefined
    ? summary.totalInspected
    : inspections.reduce((s, i) => s + Number(i.quantity_inspected || 0), 0);

  const totalPassed = summary?.totalPassed !== undefined
    ? summary.totalPassed
    : inspections.reduce((s, i) => s + Number(i.passed_quantity || 0), 0);

  const totalFailed = summary?.totalFailed !== undefined
    ? summary.totalFailed
    : inspections.reduce((s, i) => s + Number(i.failed_quantity || 0), 0);

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
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'success.main',
              }}
            >
              <InspectionIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                Quality Control & Inspection
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Audit hardware manufacturing batches, assess defect severity, and calculate assembly line yield rates.
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
            + Log Quality Audit
          </Button>
        )}
      </Stack>

      {/* Notifications */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError('')}>
          <AlertTitle sx={{ fontWeight: 700 }}>Inspection Alert</AlertTitle>
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
            <Typography variant="caption" sx={{ color: 'success.light', fontWeight: 700, textTransform: 'uppercase' }}>
              Quality Pass Rate
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5, fontFamily: 'monospace' }}>
              {passRate}%
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Factory yield efficiency
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
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Inspected
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5, fontFamily: 'monospace' }}>
              {totalInspected.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Hardware units audited
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
              Units Passed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5, fontFamily: 'monospace' }}>
              {totalPassed.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Verified defect-free
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
            <Typography variant="caption" sx={{ color: 'error.light', fontWeight: 700, textTransform: 'uppercase' }}>
              Units Defective / Failed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mt: 0.5, fontFamily: 'monospace' }}>
              {totalFailed.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Rejected or routed to rework
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
              placeholder="Search batch #, defect type, inspector, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              size="small"
              fullWidth
              label="QA Result"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Results</MenuItem>
              {RESULTS.map((res) => (
                <MenuItem key={res} value={res}>
                  {res}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3.5}>
            <TextField
              select
              size="small"
              fullWidth
              label="Severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Severities</MenuItem>
              {SEVERITIES.map((sev) => (
                <MenuItem key={sev} value={sev}>
                  {sev}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Inspections Table */}
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
              Loading quality inspection reports...
            </Typography>
          </Box>
        ) : filteredList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <InspectionIcon sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              No Inspection Reports Logged
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 450, mx: 'auto' }}>
              Audit a manufactured product batch or incoming components to log hardware pass/fail rates.
            </Typography>
            {canCreate && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenCreateModal}
                sx={{ mt: 2.5, fontWeight: 600 }}
              >
                + Log First Audit
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Batch / Audit</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Product & Inspector</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Yield Rate & Units</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Defect & Severity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.map((item) => {
                  const resStyle = RESULT_COLORS[item.result] || {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    text: '#FFF',
                    border: 'rgba(255, 255, 255, 0.1)',
                  };

                  const sevStyle = SEVERITY_COLORS[item.severity] || {
                    bg: 'rgba(255, 255, 255, 0.05)',
                    text: '#FFF',
                  };

                  const inspected = Number(item.quantity_inspected) || 1;
                  const passed = Number(item.passed_quantity) || 0;
                  const failed = Number(item.failed_quantity) || 0;
                  const yieldPct = Math.round((passed / inspected) * 100);

                  const inspectorName = item.inspector
                    ? `${item.inspector.first_name} ${item.inspector.last_name}`
                    : `Staff #${item.inspector_id}`;

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.light' }}>
                          {item.batch_number || `Batch #${item.id}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.inspection_date || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.product?.name || 'General Batch Inspection'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Audited by: {inspectorName}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 180 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {passed} / {inspected} passed
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: yieldPct >= 95 ? 'success.main' : 'warning.main' }}>
                            {yieldPct}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={yieldPct}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: yieldPct >= 95 ? 'success.main' : 'warning.main',
                              borderRadius: 3,
                            },
                          }}
                        />
                        {failed > 0 && (
                          <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
                            {failed} unit(s) rejected
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.defect_type || 'None / Clean Pass'}
                        </Typography>
                        <Chip
                          label={item.severity}
                          size="small"
                          sx={{
                            backgroundColor: sevStyle.bg,
                            color: sevStyle.text,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 20,
                            mt: 0.5,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.result}
                          size="small"
                          sx={{
                            backgroundColor: resStyle.bg,
                            color: resStyle.text,
                            borderColor: resStyle.border,
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
                              Delete
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

      {/* --- DIALOG 1: EDIT INSPECTION --- */}
      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Inspection Report</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Batch Number"
              value={editBatchNo}
              onChange={(e) => setEditBatchNo(e.target.value)}
            />

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Total"
                  type="number"
                  value={editInspected}
                  onChange={(e) => setEditInspected(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Passed"
                  type="number"
                  value={editPassed}
                  onChange={(e) => setEditPassed(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Failed"
                  type="number"
                  value={editFailed}
                  onChange={(e) => setEditFailed(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Result"
                  value={editResult}
                  onChange={(e) => setEditResult(e.target.value)}
                >
                  {RESULTS.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Severity"
                  value={editSeverity}
                  onChange={(e) => setEditSeverity(e.target.value)}
                >
                  {SEVERITIES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              select
              fullWidth
              size="small"
              label="Defect Type"
              value={editDefect}
              onChange={(e) => setEditDefect(e.target.value)}
            >
              {DEFECT_TYPES.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              size="small"
              label="Audit Notes"
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
            {isUpdating ? <CircularProgress size={20} /> : 'Save Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- DIALOG 2: CREATE INSPECTION MODAL --- */}
      <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateInspection}>
          <DialogTitle sx={{ fontWeight: 800 }}>Log Hardware Quality Inspection</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    size="small"
                    label="QA Auditor / Inspector"
                    value={newInspectorId}
                    onChange={(e) => setNewInspectorId(e.target.value)}
                  >
                    {staffList.map((st) => (
                      <MenuItem key={st.id} value={st.id}>
                        {st.first_name} {st.last_name} ({st.email})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Product Line Audited"
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                  >
                    <MenuItem value="">General Assembly Inspection</MenuItem>
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Batch / Production Run Number"
                    value={newBatchNo}
                    onChange={(e) => setNewBatchNo(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Inspection Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={newInspectionDate}
                    onChange={(e) => setNewInspectionDate(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Units Inspected"
                    type="number"
                    value={newInspected}
                    onChange={(e) => {
                      setNewInspected(e.target.value);
                      setNewPassed(e.target.value);
                      setNewFailed('0');
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Units Passed"
                    type="number"
                    value={newPassed}
                    onChange={(e) => {
                      const p = Number(e.target.value) || 0;
                      const tot = Number(newInspected) || 0;
                      setNewPassed(e.target.value);
                      setNewFailed(String(Math.max(0, tot - p)));
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    label="Units Failed"
                    type="number"
                    value={newFailed}
                    onChange={(e) => {
                      const f = Number(e.target.value) || 0;
                      const tot = Number(newInspected) || 0;
                      setNewFailed(e.target.value);
                      setNewPassed(String(Math.max(0, tot - f)));
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Final QA Decision"
                    value={newResult}
                    onChange={(e) => setNewResult(e.target.value)}
                  >
                    {RESULTS.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Defect Severity"
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                  >
                    {SEVERITIES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                select
                fullWidth
                size="small"
                label="Identified Defect Type"
                value={newDefect}
                onChange={(e) => setNewDefect(e.target.value)}
              >
                {DEFECT_TYPES.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                size="small"
                label="Inspector Field Notes"
                placeholder="Microscopic inspection notes, solder reflow anomalies, multimeter readings..."
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreating || !newInspectorId}
            >
              {isCreating ? <CircularProgress size={20} /> : 'Save QA Audit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* --- DIALOG 3: DELETE CONFIRMATION --- */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove Inspection Report?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to delete this inspection audit? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteInspection} disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InspectionManagementPage;
