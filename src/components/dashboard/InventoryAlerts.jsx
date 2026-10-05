import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { InventoryIcon, ArrowRightIcon } from '../Icons';

const getStockStatusStyle = (status) => {
  switch (status) {
    case 'Out of Stock':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Low Stock':
    case 'Low':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    case 'Adequate':
    case 'Healthy':
    default:
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
  }
};

const InventoryAlerts = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <InventoryIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Low Stock & Inventory Alerts
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Components below threshold requiring purchase orders & vendor procurement
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/inventory')}
          endIcon={<ArrowRightIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#2563eb' }}
        >
          View All Stock
        </Button>
      </Box>

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
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Component Part & SKU
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Category
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Available
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Min Threshold
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Warehouse Location
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((item) => {
                const statusStyle = getStockStatusStyle(item.status);

                return (
                  <TableRow
                    key={item.id}
                    hover
                    onClick={() => navigate('/inventory')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.part_name}
                      </Typography>
                      {item.sku && (
                        <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          {item.sku}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
                        {item.category}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          color: item.available === 0 ? '#dc2626' : item.available <= item.min_threshold ? '#b45309' : '#0f172a',
                        }}
                      >
                        {item.available}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                        {item.min_threshold}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {item.location || 'Warehouse'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                  All component stock levels are healthy.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InventoryAlerts;
