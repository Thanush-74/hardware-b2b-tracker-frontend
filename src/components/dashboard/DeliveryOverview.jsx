import React from 'react';
import { Paper, Box, Typography, Stack, Button, Grid, Chip } from '@mui/material';
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
    default:
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
  }
};

const DeliveryOverview = ({ data }) => {
  const navigate = useNavigate();

  const dueToday = data?.dueToday ?? 0;
  const inTransit = data?.inTransit ?? 0;
  const deliveredToday = data?.deliveredToday ?? 0;
  const delayed = data?.delayed ?? 0;
  const urgentDeliveries = data?.urgentDeliveries || [];

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
              Delivery & Logistics
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Client shipments and hardware dispatch schedule
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
          Track All
        </Button>
      </Box>

      {/* Metric 4-Box Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            Due Today
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {dueToday}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            In Transit
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
            {inTransit}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            Delivered
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
            {deliveredToday}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: delayed > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${delayed > 0 ? '#fecaca' : '#e2e8f0'}`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: delayed > 0 ? '#b91c1c' : '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            Delayed
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: delayed > 0 ? '#b91c1c' : '#0f172a' }}>
            {delayed}
          </Typography>
        </Box>
      </Box>

      {/* Urgent Dispatches List */}
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
        Today's Active Dispatches
      </Typography>

      <Stack spacing={1.25} sx={{ flexGrow: 1 }}>
        {urgentDeliveries.map((delivery) => {
          const statusStyle = getDeliveryStatusStyle(delivery.status);

          return (
            <Box
              key={delivery.id}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'border-color 0.15s ease',
                '&:hover': {
                  borderColor: '#cbd5e1',
                },
              }}
            >
              <Box sx={{ mr: 1, overflow: 'hidden' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563eb' }}>
                    {delivery.tracking_number}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    ({delivery.order_number})
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem', noWrap: true }}>
                  {delivery.recipient}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block', noWrap: true }}>
                  {delivery.destination} • Driver: {delivery.driver}
                </Typography>
              </Box>

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
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default DeliveryOverview;
