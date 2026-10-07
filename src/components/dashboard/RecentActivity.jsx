import React from 'react';
import { Paper, Box, Typography, Stack, Avatar } from '@mui/material';
import {
  OrdersIcon,
  ProductionIcon,
  ReturnsIcon,
  InspectionIcon,
  DeliveriesIcon,
  InventoryIcon,
  ClockIcon,
} from '../Icons';

const getActivityIcon = (type) => {
  switch (type) {
    case 'order':
      return { icon: <OrdersIcon sx={{ fontSize: 16 }} />, bg: '#eff6ff', color: '#2563eb' };
    case 'production':
      return { icon: <ProductionIcon sx={{ fontSize: 16 }} />, bg: '#fffbeb', color: '#d97706' };
    case 'return':
      return { icon: <ReturnsIcon sx={{ fontSize: 16 }} />, bg: '#fef2f2', color: '#dc2626' };
    case 'inspection':
      return { icon: <InspectionIcon sx={{ fontSize: 16 }} />, bg: '#f0fdf4', color: '#16a34a' };
    case 'inventory':
      return { icon: <InventoryIcon sx={{ fontSize: 16 }} />, bg: '#fffbeb', color: '#b45309' };
    case 'delivery':
    default:
      return { icon: <DeliveriesIcon sx={{ fontSize: 16 }} />, bg: '#eff6ff', color: '#1d4ed8' };
  }
};

const RecentActivity = ({ items = [] }) => {
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
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
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
          <ClockIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
            Recent Activity
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Chronological audit of real orders, production, deliveries, inspections & RMA events
          </Typography>
        </Box>
      </Stack>

      {items && items.length > 0 ? (
        <Stack spacing={2} sx={{ flexGrow: 1, position: 'relative', pt: 0.5 }}>
          {items.map((item, idx) => {
            const { icon, bg, color } = getActivityIcon(item.type);
            const isLast = idx === items.length - 1;

            return (
              <Box key={item.id || idx} sx={{ position: 'relative', display: 'flex', gap: 1.5 }}>
                {/* Timeline connector */}
                {!isLast && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 28,
                      left: 14,
                      width: 2,
                      height: 'calc(100% + 4px)',
                      backgroundColor: '#f1f5f9',
                      zIndex: 0,
                    }}
                  />
                )}

                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: bg,
                    color: color,
                    border: '1px solid #e2e8f0',
                    zIndex: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {icon}
                </Avatar>

                <Box sx={{ flexGrow: 1, pt: 0.25 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', whiteSpace: 'nowrap', ml: 1 }}>
                      {item.time}
                    </Typography>
                  </Stack>

                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.25, fontSize: '0.75rem' }}>
                    {item.description}
                  </Typography>

                  {item.actor && (
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, display: 'block', mt: 0.25 }}>
                      Source / Staff: {item.actor}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5, color: '#64748b' }}>
          <ClockIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
            No Recent Activity
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Activity will automatically appear as orders, production runs, and deliveries are processed.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RecentActivity;

