import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getScreenIcon } from '../components/Icons';
import {
  productService,
  inventoryService,
  orderService,
  deliveryService,
  cartService,
  productionService,
  returnService,
  manufacturingService,
  expenseService,
  inspectionService,
} from '../services/businessService';

const BusinessModulePage = ({ slug, title, endpointName }) => {
  const { screens, permissions, role } = useAuth();
  const currentScreen = screens.find((s) => s.slug === slug);
  const relevantPermissions = permissions.filter((p) => p.slug && p.slug.startsWith(slug));

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // Fetch real data from the appropriate backend service
  const fetchModuleData = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      let result;
      switch (slug) {
        case 'products':
          result = await productService.getAll();
          break;
        case 'inventory':
          result = await inventoryService.getAll();
          break;
        case 'orders':
          result = await orderService.getAll();
          break;
        case 'deliveries':
          result = await deliveryService.getAll();
          break;
        case 'cart':
          result = await cartService.getCart();
          break;
        case 'production':
          result = await productionService.getAll();
          break;
        case 'returns':
          result = await returnService.getAll();
          break;
        case 'manufacturing': {
          const [mSummary, mList] = await Promise.allSettled([
            manufacturingService.getSummary(),
            manufacturingService.getAssignments(),
          ]);
          if (mSummary.status === 'fulfilled') setSummary(mSummary.value);
          result = mList.status === 'fulfilled' ? mList.value : [];
          break;
        }
        case 'expenses': {
          const [eSummary, eList] = await Promise.allSettled([
            expenseService.getSummary(),
            expenseService.getAll(),
          ]);
          if (eSummary.status === 'fulfilled') setSummary(eSummary.value);
          result = eList.status === 'fulfilled' ? eList.value : [];
          break;
        }
        case 'inspection': {
          const [iSummary, iList] = await Promise.allSettled([
            inspectionService.getSummary(),
            inspectionService.getAll(),
          ]);
          if (iSummary.status === 'fulfilled') setSummary(iSummary.value);
          result = iList.status === 'fulfilled' ? iList.value : [];
          break;
        }
        default:
          result = [];
      }

      // Handle paginated or wrapped records { rows, count, total, items, staff, products }
      if (Array.isArray(result)) {
        setData(result);
        setTotalCount(result.length);
      } else if (result && typeof result === 'object') {
        const list = result.rows || result.items || result.products || result.orders || result.deliveries || result.expenses || result.inspections || result.data || result.cart_items || [];
        setData(Array.isArray(list) ? list : []);
        setTotalCount(result.total || result.count || (Array.isArray(list) ? list.length : 0));
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (err) {
      setApiError(err.message || `Failed to fetch data from /api/${endpointName || slug}`);
    } finally {
      setIsLoading(false);
    }
  }, [slug, endpointName]);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);

  // Extract column keys dynamically from the first item
  const getDisplayColumns = () => {
    if (!data || data.length === 0) return [];
    const first = data[0];
    const excludedKeys = ['created_at', 'updated_at', 'deleted_at', 'password_hash'];
    return Object.keys(first)
      .filter((k) => !excludedKeys.includes(k) && typeof first[k] !== 'object')
      .slice(0, 6);
  };

  const columns = getDisplayColumns();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
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
              {getScreenIcon(slug, { sx: { fontSize: 26 } })}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {currentScreen?.name || title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                Endpoint: GET /api/{endpointName || slug} • Route: {currentScreen?.route || `/${slug}`}
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            variant="outlined"
            onClick={fetchModuleData}
            disabled={isLoading}
            sx={{ textTransform: 'none' }}
          >
            Refresh Data
          </Button>
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
          ROLE: <Box component="span" sx={{ color: 'primary.light' }}>{role?.name || role?.slug || 'Staff'}</Box> • BACKEND ACTIONS:
        </Typography>
        <Stack direction="row" spacing={0.8} flexWrap="wrap">
          {relevantPermissions.length > 0 ? (
            relevantPermissions.map((p) => (
              <Chip
                key={p.id || p.slug}
                label={`${p.name} (${p.action})`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: 'primary.light',
                }}
              />
            ))
          ) : (
            <Chip label="Read Access" size="small" sx={{ height: 20, fontSize: '0.68rem' }} />
          )}
        </Stack>
      </Paper>

      {/* Summary KPI Cards if available */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(summary).slice(0, 4).map(([key, val]) => (
            <Grid item xs={6} sm={3} key={key}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                  {key.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
                  {typeof val === 'number' ? val.toLocaleString() : String(val)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Error Alert */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}

      {/* Data Table */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2.5,
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Live Records ({totalCount})
          </Typography>
          <Chip label="Real Backend Data" size="small" color="success" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} color="primary" />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              No records currently exist in this database table.
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Connected to live backend endpoint: <code>/api/{endpointName || slug}</code>
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem' } }}>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ textTransform: 'capitalize' }}>
                      {col.replace(/_/g, ' ')}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow
                    key={row.id || idx}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                      '& td': { borderColor: 'rgba(255, 255, 255, 0.06)' },
                    }}
                  >
                    {columns.map((col) => {
                      const val = row[col];
                      const isStatus = col.includes('status');
                      return (
                        <TableCell key={col} sx={{ py: 1.2 }}>
                          {isStatus ? (
                            <Chip
                              label={String(val)}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                textTransform: 'capitalize',
                              }}
                            />
                          ) : typeof val === 'boolean' ? (
                            <Chip
                              label={val ? 'Yes' : 'No'}
                              size="small"
                              color={val ? 'success' : 'default'}
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.primary' }}>
                              {String(val ?? '-')}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default BusinessModulePage;
