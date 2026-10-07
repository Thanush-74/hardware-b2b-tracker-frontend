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
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    case 'In Stock':
    case 'Healthy':
    default:
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
  }
};

const InventoryAlerts = ({ data, hideHeader = false }) => {
  const navigate = useNavigate();
  const products = data?.products || [];

  const innerContent = (
    <Box sx={{ width: '100%' }}>
      {!hideHeader && (
        <Box sx={{ pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                Inventory Overview (Core Hardware)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Real-time available stock levels for GPU, RAM, ROM/SSD & Motherboard
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
            View Full Inventory
          </Button>
        </Box>
      )}

      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          minWidth: 0,
          border: '1px solid #f1f5f9',
          borderRadius: 1.5,
        }}
      >
        <Table size="small" sx={{ width: '100%', minWidth: 680 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Hardware Product
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Category
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Total
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Available
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Reserved
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Unit Price
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Stock Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Location
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((item) => {
                const statusStyle = getStockStatusStyle(item.status);

                return (
                  <TableRow
                    key={item.id}
                    hover
                    onClick={() => navigate('/inventory')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.product_name}
                      </Typography>
                      {item.specifications && (
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {item.specifications}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.category || item.type}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.total_quantity}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: item.available_quantity <= 10 ? '#dc2626' : '#15803d',
                        }}
                      >
                        {item.available_quantity}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {item.reserved_quantity}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        ₹{Number(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                        {item.location || 'Main Warehouse'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                  No inventory data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (hideHeader) {
    return innerContent;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        p: { xs: 2, sm: 2.5 },
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {innerContent}
    </Paper>
  );
};

export default InventoryAlerts;
