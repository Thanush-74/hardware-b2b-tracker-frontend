import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Alert, Stack, Typography, Button, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/dashboardService';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import KPISummary from '../components/dashboard/KPISummary';
import CollapsibleDashboardSection from '../components/dashboard/CollapsibleDashboardSection';

import ProductionOverview from '../components/dashboard/ProductionOverview';
import InventoryAlerts from '../components/dashboard/InventoryAlerts';
import OrdersOverview from '../components/dashboard/OrdersOverview';
import DeliveryOverview from '../components/dashboard/DeliveryOverview';
import ReturnsOverview from '../components/dashboard/ReturnsOverview';
import QualityInspectionOverview from '../components/dashboard/QualityInspectionOverview';
import ManufacturingOverview from '../components/dashboard/ManufacturingOverview';
import RecentActivity from '../components/dashboard/RecentActivity';

import {
  ProductionIcon,
  InventoryIcon,
  OrdersIcon,
  DeliveriesIcon,
  InspectionIcon,
  ReturnsIcon,
  ManufacturingIcon,
  DashboardIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../components/Icons';

const DashboardPage = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active category filter tab: 'all' | 'manufacturing' | 'sales' | 'inventory_qa'
  const [activeTab, setActiveTab] = useState('all');

  // Collapse / Expand state for individual sections
  // By default, open primary sections (Production & Orders), collapse others for a clean, non-overwhelming view
  const [collapsedStates, setCollapsedStates] = useState({
    production: true,
    orders: true,
    inventory: false,
    delivery: false,
    quality: false,
    returns: false,
    manufacturing: false,
    activity: false,
  });

  const toggleSection = (sectionKey) => {
    setCollapsedStates((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedStates({
      production: true,
      orders: true,
      inventory: true,
      delivery: true,
      quality: true,
      returns: true,
      manufacturing: true,
      activity: true,
    });
  };

  const handleCollapseAll = () => {
    setCollapsedStates({
      production: false,
      orders: false,
      inventory: false,
      delivery: false,
      quality: false,
      returns: false,
      manufacturing: false,
      activity: false,
    });
  };

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

  // Are any or all sections open?
  const allExpanded = Object.values(collapsedStates).every((val) => val === true);
  const anyExpanded = Object.values(collapsedStates).some((val) => val === true);

  // Determine section visibility based on selected tab filter
  const isSectionVisible = (tabGroup) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'manufacturing' && (tabGroup === 'production' || tabGroup === 'manufacturing')) return true;
    if (activeTab === 'sales' && (tabGroup === 'orders' || tabGroup === 'delivery' || tabGroup === 'returns')) return true;
    if (activeTab === 'inventory_qa' && (tabGroup === 'inventory' || tabGroup === 'quality' || tabGroup === 'activity')) return true;
    return false;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, pb: 6 }}>
      {/* 1. Header with Quick Actions & Live Indicator */}
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
        <Stack spacing={2.5}>
          {/* Section 1: Executive KPI Summary with Clean 4-card / 8-card switch */}
          <Box sx={{ minWidth: 0 }}>
            <KPISummary data={data?.summaryCards} />
          </Box>

          {/* Section Navigation & Collapsible Controls Bar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* View Filter Pills */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
              <Chip
                label="All Sections"
                onClick={() => setActiveTab('all')}
                sx={{
                  fontWeight: activeTab === 'all' ? 700 : 500,
                  fontSize: '0.78rem',
                  backgroundColor: activeTab === 'all' ? '#2563eb' : '#ffffff',
                  color: activeTab === 'all' ? '#ffffff' : '#475569',
                  border: `1px solid ${activeTab === 'all' ? '#2563eb' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: activeTab === 'all' ? '#1d4ed8' : '#f1f5f9',
                  },
                }}
              />
              <Chip
                label="Factory & Production"
                onClick={() => setActiveTab('manufacturing')}
                sx={{
                  fontWeight: activeTab === 'manufacturing' ? 700 : 500,
                  fontSize: '0.78rem',
                  backgroundColor: activeTab === 'manufacturing' ? '#2563eb' : '#ffffff',
                  color: activeTab === 'manufacturing' ? '#ffffff' : '#475569',
                  border: `1px solid ${activeTab === 'manufacturing' ? '#2563eb' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: activeTab === 'manufacturing' ? '#1d4ed8' : '#f1f5f9',
                  },
                }}
              />
              <Chip
                label="Orders & Logistics"
                onClick={() => setActiveTab('sales')}
                sx={{
                  fontWeight: activeTab === 'sales' ? 700 : 500,
                  fontSize: '0.78rem',
                  backgroundColor: activeTab === 'sales' ? '#2563eb' : '#ffffff',
                  color: activeTab === 'sales' ? '#ffffff' : '#475569',
                  border: `1px solid ${activeTab === 'sales' ? '#2563eb' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: activeTab === 'sales' ? '#1d4ed8' : '#f1f5f9',
                  },
                }}
              />
              <Chip
                label="Inventory & QA"
                onClick={() => setActiveTab('inventory_qa')}
                sx={{
                  fontWeight: activeTab === 'inventory_qa' ? 700 : 500,
                  fontSize: '0.78rem',
                  backgroundColor: activeTab === 'inventory_qa' ? '#2563eb' : '#ffffff',
                  color: activeTab === 'inventory_qa' ? '#ffffff' : '#475569',
                  border: `1px solid ${activeTab === 'inventory_qa' ? '#2563eb' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: activeTab === 'inventory_qa' ? '#1d4ed8' : '#f1f5f9',
                  },
                }}
              />
            </Stack>

            {/* Global Expand All / Collapse All Controls */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                onClick={handleExpandAll}
                startIcon={<ChevronDownIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    borderColor: '#94a3b8',
                  },
                }}
              >
                Expand All
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCollapseAll}
                startIcon={<ChevronUpIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    borderColor: '#94a3b8',
                  },
                }}
              >
                Collapse All
              </Button>
            </Stack>
          </Box>

          {/* Operational Sections List (Collapsible with clear summarized data) */}
          <Stack spacing={2}>
            {/* Section: Production Overview */}
            {isSectionVisible('production') && (
              <CollapsibleDashboardSection
                title="Production Overview"
                subtitle="Factory line assembly throughput, active batches & planned capacity"
                icon={<ProductionIcon sx={{ fontSize: 20 }} />}
                iconBg="#fffbeb"
                iconColor="#d97706"
                summaryBadges={[
                  {
                    label: `${data?.productionOverview?.totalBatches || 0} Batches`,
                    bg: '#eff6ff',
                    color: '#1d4ed8',
                    border: '#bfdbfe',
                  },
                  {
                    label: `${data?.productionOverview?.unitsProducing || 0} In Assembly`,
                    bg: '#fffbeb',
                    color: '#b45309',
                    border: '#fde68a',
                  },
                  {
                    label: `${data?.productionOverview?.weeklyCapacity || 0}% Capacity`,
                    bg: '#f0fdf4',
                    color: '#15803d',
                    border: '#bbf7d0',
                  },
                ]}
                isOpen={collapsedStates.production}
                onToggle={() => toggleSection('production')}
                route="/production"
                actionLabel="Manage Production"
              >
                <ProductionOverview data={data?.productionOverview} hideHeader={true} />
              </CollapsibleDashboardSection>
            )}

            {/* Section: Inventory Overview */}
            {isSectionVisible('inventory') && (
              <CollapsibleDashboardSection
                title="Inventory Overview (Core Hardware)"
                subtitle="Stock levels & warehouse alerts for GPU, RAM, ROM/SSD & Motherboards"
                icon={<InventoryIcon sx={{ fontSize: 20 }} />}
                iconBg="#eff6ff"
                iconColor="#2563eb"
                summaryBadges={[
                  {
                    label: '4 Core Hardware Lines',
                    bg: '#eff6ff',
                    color: '#2563eb',
                    border: '#bfdbfe',
                  },
                  {
                    label: `${(data?.inventoryOverview?.products || []).reduce(
                      (acc, p) => acc + (p.stock || 0),
                      0
                    ).toLocaleString()} Total Units`,
                    bg: '#f0fdf4',
                    color: '#15803d',
                    border: '#bbf7d0',
                  },
                ]}
                isOpen={collapsedStates.inventory}
                onToggle={() => toggleSection('inventory')}
                route="/inventory"
                actionLabel="Manage Inventory"
              >
                <InventoryAlerts data={data?.inventoryOverview} hideHeader={true} />
              </CollapsibleDashboardSection>
            )}

            {/* Section: Orders & Payments Overview */}
            {isSectionVisible('orders') && (
              <CollapsibleDashboardSection
                title="Orders & Payment Summary"
                subtitle="B2B client procurement contracts, pending approvals & payment status"
                icon={<OrdersIcon sx={{ fontSize: 20 }} />}
                iconBg="#eff6ff"
                iconColor="#2563eb"
                summaryBadges={[
                  {
                    label: `${data?.ordersSummary?.totalOrders || 0} Total Orders`,
                    bg: '#eff6ff',
                    color: '#1d4ed8',
                    border: '#bfdbfe',
                  },
                  {
                    label: `${data?.ordersSummary?.pendingOrders || 0} Pending`,
                    bg: '#fffbeb',
                    color: '#b45309',
                    border: '#fde68a',
                  },
                  {
                    label: `${data?.ordersSummary?.completedOrders || 0} Delivered`,
                    bg: '#f0fdf4',
                    color: '#15803d',
                    border: '#bbf7d0',
                  },
                ]}
                isOpen={collapsedStates.orders}
                onToggle={() => toggleSection('orders')}
                route="/orders"
                actionLabel="Manage Orders"
              >
                <OrdersOverview data={data?.ordersSummary} hideHeader={true} />
              </CollapsibleDashboardSection>
            )}

            {/* Section: Delivery Status */}
            {isSectionVisible('delivery') && (
              <CollapsibleDashboardSection
                title="Delivery & Dispatch Pipeline"
                subtitle="Live logistics tracking, pending shipments & transit updates"
                icon={<DeliveriesIcon sx={{ fontSize: 20 }} />}
                iconBg="#f0fdf4"
                iconColor="#16a34a"
                summaryBadges={[
                  {
                    label: `${data?.deliverySummary?.inTransit || 0} In Transit`,
                    bg: '#eff6ff',
                    color: '#1d4ed8',
                    border: '#bfdbfe',
                  },
                  {
                    label: `${data?.deliverySummary?.delivered || 0} Delivered`,
                    bg: '#f0fdf4',
                    color: '#15803d',
                    border: '#bbf7d0',
                  },
                ]}
                isOpen={collapsedStates.delivery}
                onToggle={() => toggleSection('delivery')}
                route="/deliveries"
                actionLabel="Track Deliveries"
              >
                <DeliveryOverview data={data?.deliverySummary} hideHeader={true} />
              </CollapsibleDashboardSection>
            )}

            {/* Section: Quality Inspection */}
            {isSectionVisible('quality') && (
              <CollapsibleDashboardSection
                title="Quality & Inspection Control"
                subtitle="Hardware testing pass/fail metrics, burn-in diagnostics & QA yield"
                icon={<InspectionIcon sx={{ fontSize: 20 }} />}
                iconBg="#eff6ff"
                iconColor="#2563eb"
                summaryBadges={[
                  {
                    label: `Pass Rate: ${data?.returnsAndQuality?.inspectionPassRate || '98.5%'}`,
                    bg: '#f0fdf4',
                    color: '#15803d',
                    border: '#bbf7d0',
                  },
                  {
                    label: `${data?.returnsAndQuality?.totalInspected || 0} Units Inspected`,
                    bg: '#eff6ff',
                    color: '#2563eb',
                    border: '#bfdbfe',
                  },
                ]}
                isOpen={collapsedStates.quality}
                onToggle={() => toggleSection('quality')}
                route="/inspection"
                actionLabel="Quality Triage"
              >
                <QualityInspectionOverview data={data?.returnsAndQuality} hideHeader={true} />
              </CollapsibleDashboardSection>
            )}

            {/* Section: Returns & Replacements */}
            {isSectionVisible('returns') && (
              <CollapsibleDashboardSection
                title="Returns & RMA Replacements"
                subtitle="Defective component returns triage, RMA logs & replacements"
                icon={<ReturnsIcon sx={{ fontSize: 20 }} />}
                iconBg="#fef2f2"
                iconColor="#dc2626"
                summaryBadges={[
                  {
                    label: `${data?.returnsAndQuality?.totalReturns || 0} Total RMAs`,
                    bg: '#f8fafc',
                    color: '#475569',
                    border: '#e2e8f0',
                  },
                  {
                    label: `${data?.returnsAndQuality?.pendingReturns || 0} Pending`,
                    bg: '#fffbeb',
                    color: '#b45309',
                    border: '#fde68a',
                  },
                  {
                    label: `${data?.returnsAndQuality?.resolvedReturns || 0} Resolved`,
                    bg: '#f0fdf4',
                    color: '#15803d',
                    border: '#bbf7d0',
                  },
                ]}
                isOpen={collapsedStates.returns}
                onToggle={() => toggleSection('returns')}
                route="/returns"
                actionLabel="Manage Returns"
              >
                <ReturnsOverview data={data?.returnsAndQuality} hideHeader={true} />
              </CollapsibleDashboardSection>
            )}

            {/* Section: Manufacturing Overview */}
            {isSectionVisible('manufacturing') && (
              <CollapsibleDashboardSection
                title="Manufacturing Assembly Lines"
                subtitle="Live status across GPU, RAM, ROM/SSD & Motherboard stations"
                icon={<ManufacturingIcon sx={{ fontSize: 20 }} />}
                iconBg="#eff6ff"
                iconColor="#2563eb"
                summaryBadges={[
                  {
                    label: '4 Canonical Stations Active',
                    bg: '#f0fdf4',
                    color: '#15803d',
                    border: '#bbf7d0',
                  },
                  {
                    label: `${data?.manufacturingOverview?.averageEfficiency || 94}% Avg Efficiency`,
                    bg: '#eff6ff',
                    color: '#2563eb',
                    border: '#bfdbfe',
                  },
                ]}
                isOpen={collapsedStates.manufacturing}
                onToggle={() => toggleSection('manufacturing')}
                route="/manufacturing"
                actionLabel="Manage Stations"
              >
                <ManufacturingOverview data={data?.manufacturingOverview} hideHeader={true} />
              </CollapsibleDashboardSection>
            )}

            {/* Section: Recent Activity Timeline */}
            {isSectionVisible('activity') && (
              <CollapsibleDashboardSection
                title="Recent Operational Activity"
                subtitle="Chronological stream of system updates, work orders & transactions"
                icon={<DashboardIcon sx={{ fontSize: 20 }} />}
                iconBg="#f8fafc"
                iconColor="#64748b"
                summaryBadges={[
                  {
                    label: `${data?.recentActivity?.length || 0} Recent Events`,
                    bg: '#f1f5f9',
                    color: '#475569',
                    border: '#e2e8f0',
                  },
                ]}
                isOpen={collapsedStates.activity}
                onToggle={() => toggleSection('activity')}
                actionLabel="View Full Log"
              >
                <RecentActivity items={data?.recentActivity} hideHeader={true} />
              </CollapsibleDashboardSection>
            )}
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default DashboardPage;
