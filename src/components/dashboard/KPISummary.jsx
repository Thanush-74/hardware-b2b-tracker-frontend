import React from 'react';
import { Paper, Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  OrdersIcon,
  ProductionIcon,
  InventoryIcon,
  ReturnsIcon,
  InspectionIcon,
  DeliveriesIcon,
  ExpensesIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from '../Icons';

// Primary Executive Financial / Capacity Metric Card
const ExecutiveMetricCard = ({ title, value, subtitle, badge, badgeColor, icon, iconBg, iconColor, route, navigate }) => {
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
      <Box sx={{ mb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.7rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 34,
              height: 34,
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
            color: '#0f172a',
            lineHeight: 1.1,
            mb: 0.75,
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

      {badge && (
        <Box
          sx={{
            pt: 1.25,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              fontSize: '0.72rem',
              color: badgeColor || '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {badge}
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600, fontSize: '0.72rem' }}>
            View Details →
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Balanced Operational KPI Card
const OperationalKPICard = ({ title, count, subtitle, icon, route, alertCondition, alertText, navigate }) => {
  return (
    <Paper
      elevation={0}
      onClick={() => route && navigate(route)}
      sx={{
        p: 2.25,
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: alertCondition ? '1px solid #fde68a' : '1px solid #e2e8f0',
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: route ? 'pointer' : 'default',
        transition: 'all 0.18s ease',
        '&:hover': route
          ? {
              borderColor: alertCondition ? '#b45309' : '#2563eb',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
              transform: 'translateY(-1px)',
              '& .kpi-arrow': {
                color: '#2563eb',
                transform: 'translateX(3px)',
              },
            }
          : {},
      }}
    >
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.25 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: alertCondition ? '#b45309' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
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
              backgroundColor: alertCondition ? '#fffbeb' : '#eff6ff',
              color: alertCondition ? '#b45309' : '#2563eb',
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
            color: '#0f172a',
            lineHeight: 1.1,
            mb: 0.5,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          {count}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: alertCondition ? '#b45309' : '#64748b',
            fontWeight: alertCondition ? 600 : 500,
            fontSize: '0.78rem',
          }}
        >
          {alertText || subtitle}
        </Typography>
      </Box>

      {route && (
        <Box
          sx={{
            mt: 2,
            pt: 1.25,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600, fontSize: '0.74rem' }}>
            Manage {title}
          </Typography>
          <Box className="kpi-arrow" sx={{ color: '#94a3b8', display: 'flex', transition: 'transform 0.15s ease' }}>
            <ArrowRightIcon sx={{ fontSize: 16 }} />
          </Box>
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
  }).format(data?.monthlyRevenue || 165150);

  const formattedExpenses = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(data?.monthlyExpenses || 42800);

  // 1. Executive Business Metrics (4 Equal Columns)
  const executiveMetrics = [
    {
      title: 'Order Pipeline Value',
      value: formattedRevenue,
      subtitle: `${data?.pendingOrders ?? 24} active B2B orders in process`,
      badge: '● +14.2% MoM Pipeline',
      badgeColor: '#15803d',
      icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      route: '/orders',
    },
    {
      title: 'Active Assembly Load',
      value: `${data?.activeProduction ?? 38} Units`,
      subtitle: 'Across 4 active workstation lines',
      badge: `${data?.assemblyEfficiency ?? 94.6}% Line Throughput`,
      badgeColor: '#1d4ed8',
      icon: <ProductionIcon sx={{ fontSize: 18 }} />,
      iconBg: '#e0e7ff',
      iconColor: '#4338ca',
      route: '/production',
    },
    {
      title: 'Inventory & Parts Health',
      value: `${data?.totalProducts ?? 148} SKUs`,
      subtitle: `${data?.lowStockItems ?? 5} components below safety buffer`,
      badge: data?.lowStockItems > 0 ? '⚠ Restock Action Required' : '✓ Normal Buffer Levels',
      badgeColor: data?.lowStockItems > 0 ? '#b45309' : '#15803d',
      icon: <InventoryIcon sx={{ fontSize: 18 }} />,
      iconBg: data?.lowStockItems > 0 ? '#fffbeb' : '#f0fdf4',
      iconColor: data?.lowStockItems > 0 ? '#b45309' : '#15803d',
      route: '/inventory',
    },
    {
      title: 'Monthly Operating Costs',
      value: formattedExpenses,
      subtitle: 'Parts procurement & shop floor ops',
      badge: '✓ 82% Budget Utilization',
      badgeColor: '#15803d',
      icon: <ExpensesIcon sx={{ fontSize: 18 }} />,
      iconBg: '#f0fdf4',
      iconColor: '#15803d',
      route: '/expenses',
    },
  ];

  // 2. Operational Action Metrics (Balanced 6 Cards: 3x2 Grid)
  const operationalKPIs = [
    {
      title: 'Pending Orders',
      count: data?.pendingOrders ?? 0,
      subtitle: data?.pendingOrdersLabel || 'Requires processing & allocation',
      icon: <OrdersIcon sx={{ fontSize: 18 }} />,
      route: '/orders',
      alertCondition: data?.pendingOrders > 0,
      alertText: `${data?.pendingOrders ?? 0} orders awaiting allocation`,
    },
    {
      title: 'Active Production',
      count: data?.activeProduction ?? 0,
      subtitle: data?.activeProductionLabel || 'Hardware units on assembly lines',
      icon: <ProductionIcon sx={{ fontSize: 18 }} />,
      route: '/production',
      alertCondition: false,
    },
    {
      title: 'Deliveries Due Today',
      count: data?.deliveriesDueToday ?? 0,
      subtitle: data?.deliveriesDueTodayLabel || 'Scheduled for client dispatch',
      icon: <DeliveriesIcon sx={{ fontSize: 18 }} />,
      route: '/deliveries',
      alertCondition: false,
    },
    {
      title: 'Low Stock Items',
      count: data?.lowStockItems ?? 0,
      subtitle: data?.lowStockItemsLabel || 'Parts below safety reorder level',
      icon: <InventoryIcon sx={{ fontSize: 18 }} />,
      route: '/inventory',
      alertCondition: data?.lowStockItems > 0,
      alertText: `${data?.lowStockItems ?? 0} parts require urgent PO`,
    },
    {
      title: 'Quality Holds',
      count: data?.qualityHolds ?? 0,
      subtitle: data?.qualityHoldsLabel || 'Batches flagged for review',
      icon: <InspectionIcon sx={{ fontSize: 18 }} />,
      route: '/inspection',
      alertCondition: data?.qualityHolds > 0,
      alertText: `${data?.qualityHolds ?? 0} audits requiring supervisor signoff`,
    },
    {
      title: 'Pending Returns',
      count: data?.pendingReturns ?? 0,
      subtitle: data?.pendingReturnsLabel || 'RMA units awaiting inspection',
      icon: <ReturnsIcon sx={{ fontSize: 18 }} />,
      route: '/returns',
      alertCondition: data?.pendingReturns > 0,
      alertText: `${data?.pendingReturns ?? 0} returns in intake triage`,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Tier 1: 4 Executive Business & Financial Overview Cards (Even 4-Column Grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 2.5,
        }}
      >
        {executiveMetrics.map((metric) => (
          <ExecutiveMetricCard key={metric.title} {...metric} navigate={navigate} />
        ))}
      </Box>

      {/* Tier 2: 6 Balanced Operational Metrics (Even 3-Column x 2-Row Grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(6, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {operationalKPIs.map((kpi) => (
          <OperationalKPICard key={kpi.title} {...kpi} navigate={navigate} />
        ))}
      </Box>
    </Box>
  );
};

export default KPISummary;
