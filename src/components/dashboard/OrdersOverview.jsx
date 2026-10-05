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
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { OrdersIcon, ArrowRightIcon } from '../Icons';

const getOrderStatusStyle = (status) => {
  switch (status) {
    case 'Delivered':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'Shipped':
    case 'In Transit':
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    case 'Processing':
    case 'In Production':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    case 'Confirmed':
      return { bg: '#f8fafc', text: '#334155', border: '#e2e8f0' };
    case 'Delayed':
    case 'Cancelled':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Pending':
    default:
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
  }
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'Urgent':
      return { bg: '#fee2e2', text: '#b91c1c' };
    case 'High':
      return { bg: '#fef3c7', text: '#b45309' };
    default:
      return { bg: '#f1f5f9', text: '#475569' };
  }
};

const OrdersOverview = ({ orders = [] }) => {
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
            <OrdersIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Recent & Active Orders
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              B2B hardware builds scheduled for fulfillment & tracking
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/orders')}
          endIcon={<ArrowRightIcon sx={{ fontSize: 16 }} />}
          sx={{
            fontWeight: 600,
            fontSize: '0.8rem',
            color: '#2563eb',
            '&:hover': {
              backgroundColor: '#eff6ff',
            },
          }}
        >
          View All Orders
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
        <Table size="small" sx={{ width: '100%', minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Order #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Customer & Items
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Priority
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Expected Delivery
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, minWidth: 160 }}>
                Assembly Progress
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                const statusStyle = getOrderStatusStyle(order.order_status);
                const priorityStyle = getPriorityStyle(order.priority);

                return (
                  <TableRow
                    key={order.id}
                    hover
                    onClick={() => navigate('/orders')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563eb' }}>
                        {order.order_number}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {order.customer_name}
                      </Typography>
                      {order.items_summary && (
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>
                          {order.items_summary}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={order.order_status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={order.priority || 'Normal'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          backgroundColor: priorityStyle.bg,
                          color: priorityStyle.text,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                        {order.expected_delivery || 'TBD'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                            {order.progress_stage}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.7rem' }}>
                            {order.progress_percent}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={order.progress_percent}
                          sx={{
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: order.progress_percent >= 100 ? '#16a34a' : '#2563eb',
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        ₹{order.total_amount ? Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                  No active orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OrdersOverview;
