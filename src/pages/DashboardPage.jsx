import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/dashboardService';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import KPISummary from '../components/dashboard/KPISummary';
import AttentionRequired from '../components/dashboard/AttentionRequired';
import OrdersOverview from '../components/dashboard/OrdersOverview';
import ProductionOverview from '../components/dashboard/ProductionOverview';
import InventoryAlerts from '../components/dashboard/InventoryAlerts';
import ReturnsOverview from '../components/dashboard/ReturnsOverview';
import QualityInspectionOverview from '../components/dashboard/QualityInspectionOverview';
import DeliveryOverview from '../components/dashboard/DeliveryOverview';
import RecentActivity from '../components/dashboard/RecentActivity';

const DashboardPage = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, pb: 4 }}>
      {/* 1. Dashboard Header (Full Width) */}
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

      {isLoading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={36} color="primary" />
        </Box>
      ) : (
        <>
          {/* 2. KPI Summary (Full Width) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', mb: 3 }}>
            <Box sx={{ minWidth: 0 }}>
              <KPISummary data={data?.kpiSummary} />
            </Box>
          </Box>

          {/* 3. Attention Required (Full Width) */}
          {data?.attentionRequired && data.attentionRequired.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', mb: 3 }}>
              <Box sx={{ minWidth: 0 }}>
                <AttentionRequired items={data?.attentionRequired} />
              </Box>
            </Box>
          )}

          {/* 4. Recent & Active Orders (FULL WIDTH) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', mb: 3 }}>
            <Box sx={{ minWidth: 0 }}>
              <OrdersOverview orders={data?.recentOrders} />
            </Box>
          </Box>

          {/* 5. Production & PC Assembly (FULL WIDTH) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', mb: 3 }}>
            <Box sx={{ minWidth: 0 }}>
              <ProductionOverview data={data?.productionOverview} />
            </Box>
          </Box>

          {/* 6. Low Stock & Inventory Alerts (FULL WIDTH) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', mb: 3 }}>
            <Box sx={{ minWidth: 0 }}>
              <InventoryAlerts items={data?.inventoryAlerts} />
            </Box>
          </Box>

          {/* 7. Returns & Replacement Traceability (FULL WIDTH) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', mb: 3 }}>
            <Box sx={{ minWidth: 0 }}>
              <ReturnsOverview items={data?.returnsOverview} />
            </Box>
          </Box>

          {/* 8. Quality / Delivery (BALANCED TWO-COLUMN SECTION) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(0, 1fr) minmax(0, 1fr)',
              },
              gap: 3,
              mb: 3,
            }}
          >
            <Box sx={{ minWidth: 0, height: '100%' }}>
              <QualityInspectionOverview data={data?.qualityOverview} />
            </Box>
            <Box sx={{ minWidth: 0, height: '100%' }}>
              <DeliveryOverview data={data?.deliveryOverview} />
            </Box>
          </Box>

          {/* 9. Recent Factory Activity (FULL WIDTH) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <Box sx={{ minWidth: 0 }}>
              <RecentActivity items={data?.recentActivity} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
