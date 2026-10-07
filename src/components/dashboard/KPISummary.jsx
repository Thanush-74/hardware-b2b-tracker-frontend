import React from 'react';
import { Paper, Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  OrdersIcon,
  ProductionIcon,
  InventoryIcon,
  ReturnsIcon,
  DeliveriesIcon,
  StaffIcon,
  TrendingUpIcon,
  ProductsIcon,
} from '../Icons';

const SummaryMetricCard = ({ title, value, subtitle, icon, iconBg, iconColor, statusColor, route, navigate }) => {
  return (
    <Paper
      elevation={0}
      onClick={() => route && navigate(route)}
      sx={{
        p: 2.25,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: route ? 'pointer' : 'default',
        transition: 'all 0.18s ease',
        '&:hover': route
          ? {
              borderColor: '#2563eb',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
              transform: 'translateY(-1px)',
            }
          : {},
      }}
    >
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.72rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              backgroundColor: iconBg || '#eff6ff',
              color: iconColor || '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: statusColor || '#0f172a',
            lineHeight: 1.1,
            mb: 0.5,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '1.65rem',
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontSize: '0.78rem',
            fontWeight: 500,
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {route && (
        <Box
          sx={{
            mt: 1.5,
            pt: 1,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600, fontSize: '0.72rem' }}>
            View Details →
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

const KPISummary = ({ data }) => {
  const navigate = useNavigate();

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(data?.totalRevenue || 0);

  const cards = [
    {
      title: 'Total Products',
      value: data?.totalProducts ?? 0,
      subtitle: 'Catalogued hardware components',
      icon: <ProductsIcon sx={{ fontSize: 18 }} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      route: '/products',
    },
    {
      title: 'Total Inventory Stock',
      value: `${(data?.totalStock ?? 0).toLocaleString()} Units`,
      subtitle: 'Available warehouse stock',
      icon: <InventoryIcon sx={{ fontSize: 18 }} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      route: '/inventory',
    },
    {
      title: 'Units in Production',
      value: `${data?.unitsInProduction ?? 0} Units`,
      subtitle: 'Active workstation builds',
      icon: <ProductionIcon sx={{ fontSize: 18 }} />,
      iconBg: '#fffbeb',
      iconColor: '#d97706',
      route: '/production',
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders ?? 0,
      subtitle: 'Customer & B2B contracts',
      icon: <OrdersIcon sx={{ fontSize: 18 }} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      route: '/orders',
    },
    {
      title: 'Pending Deliveries',
      value: data?.pendingDeliveries ?? 0,
      subtitle: 'Preparing & in transit',
      icon: <DeliveriesIcon sx={{ fontSize: 18 }} />,
      iconBg: data?.pendingDeliveries > 0 ? '#fffbeb' : '#f0fdf4',
      iconColor: data?.pendingDeliveries > 0 ? '#d97706' : '#15803d',
      route: '/deliveries',
    },
    {
      title: 'Pending Returns',
      value: data?.pendingReturns ?? 0,
      subtitle: 'Awaiting RMA triage',
      icon: <ReturnsIcon sx={{ fontSize: 18 }} />,
      iconBg: data?.pendingReturns > 0 ? '#fef2f2' : '#f8fafc',
      iconColor: data?.pendingReturns > 0 ? '#dc2626' : '#64748b',
      route: '/returns',
    },
    {
      title: 'Active Employees',
      value: data?.activeEmployees ?? 0,
      subtitle: 'Staff & floor technicians',
      icon: <StaffIcon sx={{ fontSize: 18 }} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      route: '/staff',
    },
    {
      title: 'Total Revenue',
      value: formattedRevenue,
      subtitle: `Paid: ₹${(data?.paidRevenue || 0).toLocaleString('en-IN')}`,
      icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      route: '/orders',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {cards.map((card) => (
          <SummaryMetricCard key={card.title} {...card} navigate={navigate} />
        ))}
      </Box>
    </Box>
  );
};

export default KPISummary;

