import {
  orderService,
  inventoryService,
  productionService,
  deliveryService,
  returnService,
  inspectionService,
  productService,
} from './businessService';
import { mockDashboardData } from '../data/dashboardMockData';

/**
 * Aggregates real backend data when online, seamlessly falling back
 * to realistic manufacturing mock data if endpoints return empty or are unavailable.
 */
export const getDashboardData = async () => {
  const result = {
    isLive: false,
    kpiSummary: { ...mockDashboardData.kpiSummary },
    attentionRequired: [...mockDashboardData.attentionRequired],
    recentOrders: [...mockDashboardData.recentOrders],
    productionOverview: { ...mockDashboardData.productionOverview },
    inventoryAlerts: [...mockDashboardData.inventoryAlerts],
    returnsOverview: [...mockDashboardData.returnsOverview],
    qualityOverview: { ...mockDashboardData.qualityOverview },
    deliveryOverview: { ...mockDashboardData.deliveryOverview },
    recentActivity: [...mockDashboardData.recentActivity],
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  try {
    // Attempt parallel API queries to backend services with safety catch
    const [
      ordersRes,
      inventoryRes,
      productionRes,
      deliveriesRes,
      returnsRes,
      inspectionsRes,
      productsRes,
    ] = await Promise.allSettled([
      orderService.getAll({ limit: 15 }).catch(() => null),
      inventoryService.getAll({ limit: 20 }).catch(() => null),
      productionService.getAll({ limit: 15 }).catch(() => null),
      deliveryService.getAll({ limit: 15 }).catch(() => null),
      returnService.getAll({ limit: 15 }).catch(() => null),
      inspectionService.getAll({ limit: 15 }).catch(() => null),
      productService.getAll({ limit: 20 }).catch(() => null),
    ]);

    let hadRealData = false;

    // 1. Process Orders
    if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) && ordersRes.value.length > 0) {
      hadRealData = true;
      const orders = ordersRes.value;
      const pendingCount = orders.filter(
        (o) => o.order_status === 'Pending' || o.order_status === 'Processing' || o.order_status === 'Confirmed'
      ).length;

      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      if (totalRevenue > 0) {
        result.kpiSummary.monthlyRevenue = totalRevenue;
      }
      result.kpiSummary.pendingOrders = pendingCount || orders.length;

      result.recentOrders = orders.slice(0, 6).map((o) => {
        let progressPercent = 30;
        let progressStage = 'Ordered';
        if (o.order_status === 'Confirmed') {
          progressPercent = 40;
          progressStage = 'Confirmed';
        } else if (o.order_status === 'Processing') {
          progressPercent = 65;
          progressStage = 'In Assembly';
        } else if (o.order_status === 'Shipped') {
          progressPercent = 90;
          progressStage = 'Dispatched';
        } else if (o.order_status === 'Delivered') {
          progressPercent = 100;
          progressStage = 'Delivered';
        }

        return {
          id: o.id,
          order_number: o.order_number || `ORD-${o.id}`,
          customer_name: o.customer_name || 'B2B Client',
          items_summary: o.notes || 'Hardware Assembly Order',
          total_amount: Number(o.total_amount || 0),
          order_status: o.order_status || 'Pending',
          priority: o.total_amount > 25000 ? 'High' : 'Normal',
          expected_delivery: o.order_date ? new Date(o.order_date).toLocaleDateString() : 'Pending ETA',
          progress_stage: progressStage,
          progress_percent: progressPercent,
        };
      });
    }

    // 2. Process Inventory & Low Stock
    if (inventoryRes.status === 'fulfilled' && Array.isArray(inventoryRes.value) && inventoryRes.value.length > 0) {
      hadRealData = true;
      const invList = inventoryRes.value;
      const lowStock = invList.filter((item) => Number(item.quantity || 0) <= 10);
      result.kpiSummary.lowStockItems = lowStock.length;

      result.inventoryAlerts = invList.slice(0, 6).map((item) => {
        const qty = Number(item.quantity || 0);
        let status = 'Healthy';
        if (qty === 0) status = 'Out of Stock';
        else if (qty <= 10) status = 'Low Stock';

        return {
          id: item.id,
          part_name: item.product?.name || `Part #${item.product_id || item.id}`,
          sku: item.product?.sku || `SKU-${item.id}`,
          category: item.product?.type || item.product?.category || 'Component',
          available: qty,
          reserved: Number(item.reserved_quantity || 0),
          min_threshold: 15,
          status,
          location: item.location || 'Main Warehouse',
        };
      });
    }

    // 3. Process Production
    if (productionRes.status === 'fulfilled' && Array.isArray(productionRes.value) && productionRes.value.length > 0) {
      hadRealData = true;
      const prods = productionRes.value;
      const inProd = prods.filter((p) => p.status === 'In Production' || p.status === 'Planned');
      result.kpiSummary.activeProduction = inProd.reduce(
        (sum, p) => sum + (Number(p.quantity_producing) || Number(p.quantity_planned) || 1),
        0
      );

      result.productionOverview.planned = prods.filter((p) => p.status === 'Planned').length;
      result.productionOverview.inProgress = prods.filter((p) => p.status === 'In Production').length;
      result.productionOverview.completed = prods.filter((p) => p.status === 'Completed').length;
      result.productionOverview.delayed = prods.filter((p) => p.status === 'Delayed' || p.status === 'Cancelled').length;

      result.productionOverview.activeBuilds = prods.slice(0, 5).map((p) => {
        const target = Number(p.quantity_planned) || 10;
        const completed = Number(p.quantity_completed) || 0;
        const pct = Math.min(100, Math.round((completed / target) * 100));

        return {
          id: p.id,
          product_name: p.product?.name || `Product Assembly #${p.product_id || p.id}`,
          batch_number: `BATCH-${p.id}`,
          target_qty: target,
          completed_qty: completed,
          progress_pct: pct,
          status: p.status || 'In Production',
          assembly_line: 'Line #1 - Primary Assembly',
          lead_technician: 'Production Lead',
        };
      });
    }

    // 4. Process Deliveries
    if (deliveriesRes.status === 'fulfilled' && Array.isArray(deliveriesRes.value) && deliveriesRes.value.length > 0) {
      hadRealData = true;
      const deliveries = deliveriesRes.value;
      const inTransit = deliveries.filter((d) => d.status === 'In Transit').length;
      const preparing = deliveries.filter((d) => d.status === 'Pending' || d.status === 'Preparing').length;
      const delivered = deliveries.filter((d) => d.status === 'Delivered').length;
      const delayed = deliveries.filter((d) => d.status === 'Failed').length;

      result.kpiSummary.deliveriesDueToday = preparing + inTransit;
      result.deliveryOverview.dueToday = preparing + inTransit;
      result.deliveryOverview.inTransit = inTransit;
      result.deliveryOverview.deliveredToday = delivered;
      result.deliveryOverview.delayed = delayed;

      result.deliveryOverview.urgentDeliveries = deliveries.slice(0, 4).map((d) => ({
        id: d.id,
        tracking_number: d.tracking_number || `TRK-${d.id}`,
        order_number: d.order_number || `ORD-${d.order_id}`,
        recipient: d.recipient_name || 'B2B Customer',
        destination: d.delivery_address || 'Facility Delivery',
        driver: d.delivery_person || (d.delivery_staff_id ? `Driver #${d.delivery_staff_id}` : 'Unassigned'),
        status: d.status || 'In Transit',
        eta: d.expected_delivery_date || 'Today',
      }));
    }

    // 5. Process Returns
    if (returnsRes.status === 'fulfilled' && Array.isArray(returnsRes.value) && returnsRes.value.length > 0) {
      hadRealData = true;
      const returns = returnsRes.value;
      const pendingReturns = returns.filter((r) => r.status === 'Requested' || r.status === 'Received');
      result.kpiSummary.pendingReturns = pendingReturns.length;

      result.returnsOverview = returns.slice(0, 5).map((r) => ({
        id: r.id,
        return_number: r.return_number || `RMA-${r.id}`,
        order_number: `ORD-${r.order_id}`,
        customer_name: r.customer_name || 'Customer RMA',
        product_name: r.product?.name || `Product #${r.product_id}`,
        return_reason: r.return_reason || 'Hardware audit requested',
        status: r.status === 'Received' ? 'Under Inspection' : r.status,
        replacement_required: Boolean(r.replacement_required),
        received_date: r.return_date ? new Date(r.return_date).toLocaleDateString() : 'Recent',
      }));
    }

    // 6. Process Inspections
    if (inspectionsRes.status === 'fulfilled' && Array.isArray(inspectionsRes.value) && inspectionsRes.value.length > 0) {
      hadRealData = true;
      const audits = inspectionsRes.value;
      const totalInspected = audits.reduce((sum, a) => sum + (Number(a.quantity_inspected) || 1), 0);
      const totalPassed = audits.reduce((sum, a) => sum + (Number(a.passed_quantity) || 0), 0);
      const totalFailed = audits.reduce((sum, a) => sum + (Number(a.failed_quantity) || 0), 0);

      const passRate = totalInspected > 0 ? ((totalPassed / totalInspected) * 100).toFixed(1) : 96.5;

      result.kpiSummary.qualityHolds = totalFailed;
      result.qualityOverview.passRate = Number(passRate);
      result.qualityOverview.inspectedToday = totalInspected;
      result.qualityOverview.passedToday = totalPassed;
      result.qualityOverview.failedToday = totalFailed;
    }

    result.isLive = hadRealData;
  } catch (err) {
    console.warn('Dashboard live API aggregation fallback to mock dataset:', err.message);
  }

  return result;
};
