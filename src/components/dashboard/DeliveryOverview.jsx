import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DeliveriesIcon, ArrowRightIcon } from '../Icons';

const getDeliveryStatusStyle = (status) => {
  switch (status) {
    case 'Delivered':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'In Transit':
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    case 'Preparing':
    case 'Pending':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    case 'Failed':
    case 'Delayed':
    case 'Cancelled':
    default:
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
  }
};

const DeliveryOverview = ({ data }) => {
  const navigate = useNavigate();

  const pending = data?.pending ?? 0;
  const inTransit = data?.inTransit ?? 0;
  const delivered = data?.delivered ?? 0;
  const delayed = data?.delayed ?? 0;
  const recentDeliveries = data?.recentDeliveries || [];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
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
            <DeliveriesIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Delivery Status
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Real-time B2B hardware shipment & dispatch tracking
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/deliveries')}
          endIcon={<ArrowRightIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#2563eb' }}
        >
          Track All Deliveries
        </Button>
      </Box>

      {/* 4 Status Metric Pills */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Pending
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
            {pending}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            In Transit
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
            {inTransit}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Delivered
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
            {delivered}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: delayed > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${delayed > 0 ? '#fecaca' : '#e2e8f0'}`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: delayed > 0 ? '#b91c1c' : '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Delayed / Failed
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: delayed > 0 ? '#b91c1c' : '#0f172a' }}>
            {delayed}
          </Typography>
        </Box>
      </Box>

      {/* Deliveries List / Table */}
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
        Active & Recent Shipments
      </Typography>

      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          minWidth: 0,
          border: '1px solid #f1f5f9',
          borderRadius: 1.5,
          flexGrow: 1,
        }}
      >
        <Table size="small" sx={{ width: '100%', minWidth: 550 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Tracking #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Recipient & Destination
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Driver
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentDeliveries && recentDeliveries.length > 0 ? (
              recentDeliveries.map((delivery) => {
                const statusStyle = getDeliveryStatusStyle(delivery.status);

                return (
                  <TableRow
                    key={delivery.id}
                    hover
                    onClick={() => navigate('/deliveries')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563eb' }}>
                        {delivery.tracking_number}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {delivery.order_number}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {delivery.recipient_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', maxWidth: 220, noWrap: true }}>
                        {delivery.destination}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
                        {delivery.driver}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Chip
                        label={delivery.status}
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
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: '#64748b' }}>
                  No active deliveries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DeliveryOverview;

