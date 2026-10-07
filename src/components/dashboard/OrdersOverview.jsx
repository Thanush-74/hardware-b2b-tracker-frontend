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
import { OrdersIcon, ArrowRightIcon } from '../Icons';

const getOrderStatusStyle = (status) => {
  switch (status) {
    case 'Delivered':
    case 'Completed':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'Shipped':
    case 'In Transit':
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    case 'Processing':
    case 'Confirmed':
      return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
    case 'Cancelled':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Pending':
    default:
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
  }
};

const getPaymentStatusStyle = (status) => {
  switch (status) {
    case 'Paid':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'Failed':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Partially Paid':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    case 'Pending':
    default:
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
  }
};

const OrdersOverview = ({ data }) => {
  const navigate = useNavigate();

  const totalOrders = data?.totalOrders ?? 0;
  const pendingOrders = data?.pendingOrders ?? 0;
  const processingOrders = data?.processingOrders ?? 0;
  const completedOrders = data?.completedOrders ?? 0;
  const cancelledOrders = data?.cancelledOrders ?? 0;

  const successfulPayments = data?.successfulPayments ?? 0;
  const pendingPayments = data?.pendingPayments ?? 0;
  const failedPayments = data?.failedPayments ?? 0;

  const recentOrders = data?.recentOrders || [];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        p: { xs: 2, sm: 2.5 },
        width: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
              Orders & Payment Summary
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              B2B order fulfillment tracking and settlement breakdown
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/orders')}
          endIcon={<ArrowRightIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#2563eb' }}
        >
          View All Orders
        </Button>
      </Box>

      {/* Status & Payment Metrics Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
            md: 'repeat(7, minmax(0, 1fr))',
          },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            New / Pending
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
            {pendingOrders}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Processing
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
            {processingOrders}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Completed
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
            {completedOrders}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: cancelledOrders > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${cancelledOrders > 0 ? '#fecaca' : '#e2e8f0'}`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: cancelledOrders > 0 ? '#b91c1c' : '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Cancelled
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: cancelledOrders > 0 ? '#b91c1c' : '#0f172a' }}>
            {cancelledOrders}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Paid
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
            {successfulPayments}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Payment Pending
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
            {pendingPayments}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: failedPayments > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${failedPayments > 0 ? '#fecaca' : '#e2e8f0'}`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: failedPayments > 0 ? '#b91c1c' : '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Failed / Partial
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: failedPayments > 0 ? '#b91c1c' : '#0f172a' }}>
            {failedPayments}
          </Typography>
        </Box>
      </Box>

      {/* Orders Table */}
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
        Recent Order Records
      </Typography>

      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          minWidth: 0,
          border: '1px solid #f1f5f9',
          borderRadius: 1.5,
        }}
      >
        <Table size="small" sx={{ width: '100%', minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Order #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Customer & Items
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Order Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Payment Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Order Date
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Total Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusStyle = getOrderStatusStyle(order.order_status);
                const payStyle = getPaymentStatusStyle(order.payment_status);

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
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.72rem', maxWidth: 260 }}>
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
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={order.payment_status || 'Pending'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: payStyle.bg,
                          color: payStyle.text,
                          border: `1px solid ${payStyle.border}`,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {order.order_date}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: '#64748b' }}>
                  No customer orders found.
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

