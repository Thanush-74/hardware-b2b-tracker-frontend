import React from 'react';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  RefreshIcon,
  OrdersIcon,
  ProductionIcon,
  InventoryIcon,
  StaffIcon,
  DeliveriesIcon,
  InspectionIcon,
  ManufacturingIcon,
} from '../Icons';

const DashboardHeader = ({ user, role, isLive, lastUpdated, onRefresh, isLoading }) => {
  const navigate = useNavigate();
  const displayName =
    user?.first_name && user.first_name.toLowerCase() !== 'admin'
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : 'Admin';

  const quickActions = [
    { label: 'Create Order', route: '/orders', icon: <OrdersIcon sx={{ fontSize: 16 }} /> },
    { label: 'Plan Production Batch', route: '/production', icon: <ProductionIcon sx={{ fontSize: 16 }} /> },
    { label: 'View Inventory', route: '/inventory', icon: <InventoryIcon sx={{ fontSize: 16 }} /> },
    { label: 'Manage Staff', route: '/staff', icon: <StaffIcon sx={{ fontSize: 16 }} /> },
    { label: 'Track Deliveries', route: '/deliveries', icon: <DeliveriesIcon sx={{ fontSize: 16 }} /> },
    { label: 'Quality Inspection', route: '/inspection', icon: <InspectionIcon sx={{ fontSize: 16 }} /> },
    { label: 'Manufacturing Lines', route: '/manufacturing', icon: <ManufacturingIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Top Banner: Title + Status + Refresh Button */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Hardware B2B Tracker Dashboard
            </Typography>
            <Chip
              label={isLive ? '● Live Backend Synced' : '○ Standby'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: isLive ? '#f0fdf4' : '#f8fafc',
                color: isLive ? '#15803d' : '#64748b',
                border: `1px solid ${isLive ? '#bbf7d0' : '#e2e8f0'}`,
              }}
            />
            <Chip
              label="Admin Overview"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}
            />
          </Stack>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0f172a', mt: 0.5 }}>
            Welcome, {displayName}
          </Typography>

          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.84rem' }}>
            Real-time operations summary • Production, inventory, orders, logistics & quality control
          </Typography>
        </Box>

        {/* Right Controls */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
          {lastUpdated && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.6,
                borderRadius: 1.5,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#16a34a',
                  boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)',
                }}
              />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}>
                Synced {lastUpdated}
              </Typography>
            </Box>
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
            startIcon={
              <RefreshIcon
                sx={{
                  fontSize: 16,
                  animation: isLoading ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            }
            sx={{
              borderColor: '#e2e8f0',
              color: '#0f172a',
              backgroundColor: '#ffffff',
              fontWeight: 600,
              fontSize: '0.8rem',
              py: 0.6,
              px: 1.8,
              '&:hover': {
                borderColor: '#2563eb',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
              },
            }}
          >
            {isLoading ? 'Syncing...' : 'Refresh Data'}
          </Button>
        </Stack>
      </Box>

      {/* 9. Quick Actions Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          p: 1.25,
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 1,
            color: '#64748b',
            fontWeight: 700,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          Quick Actions:
        </Typography>

        {quickActions.map((action) => (
          <Button
            key={action.label}
            size="small"
            variant="text"
            startIcon={action.icon}
            onClick={() => navigate(action.route)}
            sx={{
              py: 0.5,
              px: 1.25,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155',
              borderRadius: 1.5,
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              '&:hover': {
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                borderColor: '#bfdbfe',
              },
            }}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardHeader;

