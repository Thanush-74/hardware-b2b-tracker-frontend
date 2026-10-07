import React, { useState } from 'react';
import { Paper, Box, Typography, Stack, Button } from '@mui/material';
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
  ChevronDownIcon,
  ChevronUpIcon,
} from '../Icons';

const SummaryMetricCard = ({ title, value, subtitle, icon, iconBg, iconColor, statusColor, route, navigate }) => {
  return (
    <Paper
      elevation={0}
      onClick={() => route && navigate(route)}
      sx={{
        p: 2,
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
            fontSize: '1.5rem',
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
            mt: 1.25,
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
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(data?.totalRevenue || 0);

  // Core high-level 4 metrics (simple, understandable)
  const primaryCards = [
    {
      title: 'Total Revenue',
      value: formattedRevenue,
      subtitle: `Paid: ₹${(data?.paidRevenue || 0).toLocaleString('en-IN')}`,
      icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      route: '/orders',
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
      title: 'Units in Production',
      value: `${data?.unitsInProduction ?? 0} Units`,
      subtitle: 'Active workstation builds',
      icon: <ProductionIcon sx={{ fontSize: 18 }} />,
      iconBg: '#fffbeb',
      iconColor: '#d97706',
      route: '/production',
    },
    {
      title: 'Inventory Stock',
      value: `${(data?.totalStock ?? 0).toLocaleString()} Units`,
      subtitle: 'Available warehouse stock',
      icon: <InventoryIcon sx={{ fontSize: 18 }} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      route: '/inventory',
    },
  ];

  // Secondary detailed metrics (shown when expanded)
  const secondaryCards = [
    {
      title: 'Catalogued Products',
      value: data?.totalProducts ?? 0,
      subtitle: 'Core hardware component lines',
      icon: <ProductsIcon sx={{ fontSize: 18 }} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      route: '/products',
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
      title: 'Active Staff',
      value: data?.activeEmployees ?? 0,
      subtitle: 'Technicians & line operators',
      icon: <StaffIcon sx={{ fontSize: 18 }} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      route: '/staff',
    },
  ];

  const displayedCards = showAllMetrics ? [...primaryCards, ...secondaryCards] : primaryCards;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Top Bar with Simple / Full View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {showAllMetrics ? 'All Key Performance Indicators (8 Metrics)' : 'Core Operations Summary (Primary 4 Metrics)'}
        </Typography>

        <Button
          size="small"
          onClick={() => setShowAllMetrics(!showAllMetrics)}
          endIcon={showAllMetrics ? <ChevronUpIcon sx={{ fontSize: 14 }} /> : <ChevronDownIcon sx={{ fontSize: 14 }} />}
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'none',
            color: '#2563eb',
            py: 0.25,
            px: 1,
            borderRadius: 1.5,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            '&:hover': {
              backgroundColor: '#eff6ff',
            },
          }}
        >
          {showAllMetrics ? 'Show Core 4 Only' : 'Show All 8 Metrics'}
        </Button>
      </Box>

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
        {displayedCards.map((card) => (
          <SummaryMetricCard key={card.title} {...card} navigate={navigate} />
        ))}
      </Box>
    </Box>
  );
};

export default KPISummary;
