import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Alert, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/dashboardService';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import KPISummary from '../components/dashboard/KPISummary';
import ProductionOverview from '../components/dashboard/ProductionOverview';
import InventoryAlerts from '../components/dashboard/InventoryAlerts';
import OrdersOverview from '../components/dashboard/OrdersOverview';
import DeliveryOverview from '../components/dashboard/DeliveryOverview';
import ReturnsOverview from '../components/dashboard/ReturnsOverview';
import QualityInspectionOverview from '../components/dashboard/QualityInspectionOverview';
import ManufacturingOverview from '../components/dashboard/ManufacturingOverview';
import RecentActivity from '../components/dashboard/RecentActivity';

const DashboardPage = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to fetch real-time dashboard metrics. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, pb: 4 }}>
      {/* 1. Dashboard Header & 9. Quick Actions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <DashboardHeader
            user={user}
            role={role}
            isLive={data?.isLive}
            lastUpdated={data?.lastUpdated}
            onRefresh={fetchMetrics}
            isLoading={isLoading}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading && !data ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
          <CircularProgress size={40} color="primary" />
          <Box sx={{ mt: 2, color: '#64748b', fontSize: '0.875rem' }}>
            Loading live dashboard metrics...
          </Box>
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Section 1: Summary Cards (8 KPI Cards) */}
          <Box sx={{ minWidth: 0 }}>
            <KPISummary data={data?.summaryCards} />
          </Box>

          {/* Section 2: Production Overview */}
          <Box sx={{ minWidth: 0 }}>
            <ProductionOverview data={data?.productionOverview} />
          </Box>

          {/* Section 3: Inventory Overview (4 Core Hardware Products Only: GPU, RAM, ROM/SSD, Motherboard) */}
          <Box sx={{ minWidth: 0 }}>
            <InventoryAlerts data={data?.inventoryOverview} />
          </Box>

          {/* Section 4: Orders & Payment Summary */}
          <Box sx={{ minWidth: 0 }}>
            <OrdersOverview data={data?.ordersSummary} />
          </Box>

          {/* Section 5 & 6: Delivery Status (5) and Returns & Quality (6) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 3,
            }}
          >
            {/* Section 5: Delivery Status */}
            <Box sx={{ minWidth: 0, height: '100%' }}>
              <DeliveryOverview data={data?.deliverySummary} />
            </Box>

            {/* Section 6: Quality Inspection */}
            <Box sx={{ minWidth: 0, height: '100%' }}>
              <QualityInspectionOverview data={data?.returnsAndQuality} />
            </Box>
          </Box>

          {/* Section 6 (continued): Returns & Replacements Overview */}
          <Box sx={{ minWidth: 0 }}>
            <ReturnsOverview data={data?.returnsAndQuality} />
          </Box>

          {/* Section 7: Manufacturing Overview (4 Canonical Lines) */}
          <Box sx={{ minWidth: 0 }}>
            <ManufacturingOverview data={data?.manufacturingOverview} />
          </Box>

          {/* Section 8: Recent Activity (Real Event Timeline) */}
          <Box sx={{ minWidth: 0 }}>
            <RecentActivity items={data?.recentActivity} />
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default DashboardPage;

