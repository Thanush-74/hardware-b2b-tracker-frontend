import {
  orderService,
  inventoryService,
  productionService,
  deliveryService,
  returnService,
  inspectionService,
  productService,
  manufacturingService,
  expenseService,
} from './businessService';
import { getStaff } from './staffService';
import { getCanonicalInventory, getCanonicalProducts, CANONICAL_PRODUCT_SPECS } from '../utils/canonicalProducts';

const extractList = (resVal, keys = []) => {
  if (!resVal) return [];
  if (Array.isArray(resVal)) return resVal;
  for (const k of keys) {
    if (Array.isArray(resVal[k])) return resVal[k];
  }
  return Array.isArray(resVal.rows) ? resVal.rows : Array.isArray(resVal.data) ? resVal.data : [];
};

/**
 * Aggregates REAL backend data from existing APIs.
 * Does NOT generate fake business data.
 */
export const getDashboardData = async () => {
  const result = {
    isLive: false,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    
    // 1. Summary Cards
    summaryCards: {
      totalProducts: 0,
      totalStock: 0,
      unitsInProduction: 0,
      totalOrders: 0,
      pendingDeliveries: 0,
      pendingReturns: 0,
      activeEmployees: 0,
      totalRevenue: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
      totalExpenses: 0,
    },

    // 2. Production Overview
    productionOverview: {
      totalBatches: 0,
      unitsPlanned: 0,
      unitsProducing: 0,
      unitsCompleted: 0,
      weeklyCapacity: 0,
      batches: [],
    },

    // 3. Inventory Overview (Exact 4 canonical products)
    inventoryOverview: {
      products: [],
      lowStockCount: 0,
      outOfStockCount: 0,
    },

    // 4. Orders & Payment Summary
    ordersSummary: {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      recentOrders: [],
    },

    // 5. Delivery Status
    deliverySummary: {
      totalDeliveries: 0,
      pending: 0,
      inTransit: 0,
      delivered: 0,
      delayed: 0,
      recentDeliveries: [],
    },

    // 6. Returns & Quality
    returnsAndQuality: {
      pendingReturns: 0,
      approvedReturns: 0,
      replacements: 0,
      defectiveProducts: 0,
      pendingInspections: 0,
      passRate: 100,
      totalInspected: 0,
      totalPassed: 0,
      totalFailed: 0,
      recentReturns: [],
      recentInspections: [],
    },

    // 7. Manufacturing Overview (4 Canonical lines / sectors)
    manufacturingOverview: {
      totalAssignments: 0,
      workingCount: 0,
      onBreakCount: 0,
      standbyCount: 0,
      sectors: [],
      assignments: [],
    },

    // 8. Recent Activity (Aggregated from real data)
    recentActivity: [],
  };

  try {
    const [
      ordersRes,
      inventoryRes,
      productionRes,
      deliveriesRes,
      returnsRes,
      inspectionsRes,
      inspectionSummaryRes,
      productsRes,
      manufacturingAssignmentsRes,
      manufacturingSummaryRes,
      staffRes,
      expensesSummaryRes,
    ] = await Promise.allSettled([
      orderService.getAll({ limit: 100 }).catch(() => null),
      inventoryService.getAll({ limit: 100 }).catch(() => null),
      productionService.getAll({ limit: 100 }).catch(() => null),
      deliveryService.getAll({ limit: 100 }).catch(() => null),
      returnService.getAll({ limit: 100 }).catch(() => null),
      inspectionService.getAll({ limit: 100 }).catch(() => null),
      inspectionService.getSummary().catch(() => null),
      productService.getAll({ limit: 100 }).catch(() => null),
      manufacturingService.getAssignments({ limit: 100 }).catch(() => null),
      manufacturingService.getSummary().catch(() => null),
      getStaff({ limit: 100 }).catch(() => null),
      expenseService.getSummary().catch(() => null),
    ]);

    let hadRealData = false;
    const allActivities = [];

    // --- A. PRODUCTS & INVENTORY ---
    const rawProducts = extractList(productsRes.status === 'fulfilled' ? productsRes.value : null, ['products', 'rows']);
    const rawInventory = extractList(inventoryRes.status === 'fulfilled' ? inventoryRes.value : null, ['inventory', 'rows']);

    if (rawProducts.length > 0 || rawInventory.length > 0) {
      hadRealData = true;
      result.summaryCards.totalProducts = rawProducts.length || rawInventory.length;
      
      const totalStock = rawInventory.reduce(
        (sum, item) => sum + (Number(item.available_quantity ?? item.quantity ?? 0) || 0),
        0
      );
      result.summaryCards.totalStock = totalStock;

      // Map the 4 Canonical Products: GPU, RAM, ROM / SSD, Motherboard
      const canonicalProds = getCanonicalProducts(rawProducts);
      const { displayInventory } = getCanonicalInventory(rawInventory);

      let lowCount = 0;
      let outCount = 0;

      const mappedCanonical = CANONICAL_PRODUCT_SPECS.map((spec) => {
        const invMatch = displayInventory.find((item) => item.canonical_key === spec.key);
        const prodMatch = canonicalProds.find((p) => p.key === spec.key);

        const availableQty = invMatch
          ? Number(invMatch.available_quantity ?? invMatch.quantity ?? 0)
          : prodMatch
          ? Number(prodMatch.available_quantity ?? 0)
          : 0;

        const totalQty = invMatch
          ? Number(invMatch.total_quantity ?? invMatch.quantity ?? availableQty)
          : availableQty;

        const reservedQty = invMatch ? Number(invMatch.reserved_quantity ?? 0) : 0;
        const price = invMatch ? Number(invMatch.product_price ?? prodMatch?.price ?? spec.defaultPrice) : Number(prodMatch?.price ?? spec.defaultPrice);
        const location = invMatch?.location || 'Main Warehouse';

        let status = 'In Stock';
        if (availableQty <= 0) {
          status = 'Out of Stock';
          outCount++;
        } else if (availableQty <= 10) {
          status = 'Low Stock';
          lowCount++;
        }

        if (availableQty <= 10 && availableQty > 0) {
          allActivities.push({
            id: `inv-${spec.key}`,
            type: 'inventory',
            title: `Low Stock Alert: ${spec.canonicalName}`,
            description: `${spec.canonicalName} has only ${availableQty} units left in ${location}.`,
            timestamp: new Date().toISOString(),
            time: 'Alert',
            actor: 'System Inventory',
          });
        }

        return {
          key: spec.key,
          name: spec.canonicalName,
          category: spec.categoryType,
          description: spec.description,
          available_quantity: availableQty,
          total_quantity: totalQty,
          reserved_quantity: reservedQty,
          price,
          location,
          status,
          id: invMatch?.product_id || prodMatch?.id || null,
        };
      });

      result.inventoryOverview.products = mappedCanonical;
      result.inventoryOverview.lowStockCount = lowCount;
      result.inventoryOverview.outOfStockCount = outCount;
    }

    // --- B. ORDERS & PAYMENTS ---
    const rawOrders = extractList(ordersRes.status === 'fulfilled' ? ordersRes.value : null, ['orders', 'rows']);
    if (rawOrders.length > 0) {
      hadRealData = true;
      result.summaryCards.totalOrders = rawOrders.length;
      result.ordersSummary.totalOrders = rawOrders.length;

      let totalRevenue = 0;
      let paidRevenue = 0;
      let pendingRevenue = 0;

      let pendingOrders = 0;
      let processingOrders = 0;
      let completedOrders = 0;
      let cancelledOrders = 0;

      let successfulPayments = 0;
      let pendingPayments = 0;
      let failedPayments = 0;

      rawOrders.forEach((o) => {
        const amount = Number(o.total_amount) || 0;
        totalRevenue += amount;

        // Order Status
        if (o.order_status === 'Pending') pendingOrders++;
        else if (o.order_status === 'Processing' || o.order_status === 'Confirmed' || o.order_status === 'Shipped') processingOrders++;
        else if (o.order_status === 'Delivered') completedOrders++;
        else if (o.order_status === 'Cancelled') cancelledOrders++;

        // Payment Status
        if (o.payment_status === 'Paid') {
          successfulPayments++;
          paidRevenue += amount;
        } else if (o.payment_status === 'Pending') {
          pendingPayments++;
          pendingRevenue += amount;
        } else {
          failedPayments++;
        }

        // Add to activities
        allActivities.push({
          id: `order-${o.id}`,
          type: 'order',
          title: `Order #${o.order_number || o.id} (${o.order_status})`,
          description: `${o.customer_name || 'Customer'} • ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} • Payment: ${o.payment_status}`,
          timestamp: o.created_at || o.order_date || new Date().toISOString(),
          time: o.order_date ? new Date(o.order_date).toLocaleDateString() : 'Recent',
          actor: o.created_by || 'Sales Portal',
        });
      });

      result.summaryCards.totalRevenue = totalRevenue;
      result.summaryCards.paidRevenue = paidRevenue;
      result.summaryCards.pendingRevenue = pendingRevenue;

      result.ordersSummary.pendingOrders = pendingOrders;
      result.ordersSummary.processingOrders = processingOrders;
      result.ordersSummary.completedOrders = completedOrders;
      result.ordersSummary.cancelledOrders = cancelledOrders;

      result.ordersSummary.successfulPayments = successfulPayments;
      result.ordersSummary.pendingPayments = pendingPayments;
      result.ordersSummary.failedPayments = failedPayments;

      result.ordersSummary.recentOrders = rawOrders.slice(0, 6).map((o) => ({
        id: o.id,
        order_number: o.order_number || `ORD-${o.id}`,
        customer_name: o.customer_name || 'B2B Client',
        items_summary: o.items && o.items.length > 0 ? o.items.map((it) => `${it.product_name} (${it.quantity})`).join(', ') : o.notes || 'Hardware Order',
        total_amount: Number(o.total_amount || 0),
        order_status: o.order_status || 'Pending',
        payment_status: o.payment_status || 'Pending',
        order_date: o.order_date ? new Date(o.order_date).toLocaleDateString() : 'Recent',
      }));
    }

    // --- C. PRODUCTION OVERVIEW ---
    const rawProduction = extractList(productionRes.status === 'fulfilled' ? productionRes.value : null, ['production_records', 'production', 'rows']);
    if (rawProduction.length > 0) {
      hadRealData = true;
      result.productionOverview.totalBatches = rawProduction.length;

      let plannedUnits = 0;
      let producingUnits = 0;
      let completedUnits = 0;
      let capacitySum = 0;

      rawProduction.forEach((p) => {
        plannedUnits += Number(p.quantity_planned) || 0;
        producingUnits += Number(p.quantity_producing) || 0;
        completedUnits += Number(p.quantity_completed) || 0;
        capacitySum += Number(p.weekly_capacity) || 0;

        allActivities.push({
          id: `prod-${p.id}`,
          type: 'production',
          title: `Production Batch #${p.id} (${p.status})`,
          description: `${p.product_name || 'Component'} • Planned: ${p.quantity_planned} | Producing: ${p.quantity_producing} | Completed: ${p.quantity_completed}`,
          timestamp: p.updated_at || p.created_at || new Date().toISOString(),
          time: p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Recent',
          actor: 'Production Floor',
        });
      });

      result.productionOverview.unitsPlanned = plannedUnits;
      result.productionOverview.unitsProducing = producingUnits;
      result.productionOverview.unitsCompleted = completedUnits;
      result.productionOverview.weeklyCapacity = capacitySum;
      result.summaryCards.unitsInProduction = producingUnits;

      result.productionOverview.batches = rawProduction.slice(0, 6).map((p) => {
        const planned = Number(p.quantity_planned) || 1;
        const comp = Number(p.quantity_completed) || 0;
        const pct = Math.min(100, Math.round((comp / planned) * 100));

        return {
          id: p.id,
          product_name: p.product_name || `Batch #${p.id}`,
          product_type: p.product_type || 'Hardware Assembly',
          quantity_planned: planned,
          quantity_producing: Number(p.quantity_producing) || 0,
          quantity_completed: comp,
          weekly_capacity: Number(p.weekly_capacity) || 0,
          progress_pct: pct,
          status: p.status || 'Planned',
          expected_completion: p.expected_completion_date ? new Date(p.expected_completion_date).toLocaleDateString() : 'Scheduled',
        };
      });
    }

    // --- D. DELIVERIES ---
    const rawDeliveries = extractList(deliveriesRes.status === 'fulfilled' ? deliveriesRes.value : null, ['deliveries', 'rows']);
    if (rawDeliveries.length > 0) {
      hadRealData = true;
      result.deliverySummary.totalDeliveries = rawDeliveries.length;

      let pendingDel = 0;
      let inTransitDel = 0;
      let deliveredDel = 0;
      let delayedDel = 0;

      rawDeliveries.forEach((d) => {
        if (d.status === 'Pending' || d.status === 'Preparing') pendingDel++;
        else if (d.status === 'In Transit') inTransitDel++;
        else if (d.status === 'Delivered') deliveredDel++;
        else if (d.status === 'Failed' || d.status === 'Cancelled') delayedDel++;

        allActivities.push({
          id: `del-${d.id}`,
          type: 'delivery',
          title: `Delivery #${d.tracking_number || d.id} (${d.status})`,
          description: `Recipient: ${d.recipient_name || d.customer_name || 'Customer'} • ${d.delivery_address || 'Destination'}`,
          timestamp: d.updated_at || d.created_at || new Date().toISOString(),
          time: d.expected_delivery_date ? new Date(d.expected_delivery_date).toLocaleDateString() : 'Recent',
          actor: d.delivery_person || 'Logistics Team',
        });
      });

      result.deliverySummary.pending = pendingDel;
      result.deliverySummary.inTransit = inTransitDel;
      result.deliverySummary.delivered = deliveredDel;
      result.deliverySummary.delayed = delayedDel;
      result.summaryCards.pendingDeliveries = pendingDel + inTransitDel;

      result.deliverySummary.recentDeliveries = rawDeliveries.slice(0, 6).map((d) => ({
        id: d.id,
        tracking_number: d.tracking_number || `TRK-${d.id}`,
        order_number: d.order_number || `ORD-${d.order_id}`,
        recipient_name: d.recipient_name || d.customer_name || 'Client',
        destination: d.delivery_address || 'Facility Delivery',
        driver: d.delivery_person || 'Unassigned',
        status: d.status || 'Pending',
        expected_date: d.expected_delivery_date ? new Date(d.expected_delivery_date).toLocaleDateString() : 'Scheduled',
      }));
    }

    // --- E. RETURNS & REPLACEMENTS ---
    const rawReturns = extractList(returnsRes.status === 'fulfilled' ? returnsRes.value : null, ['returns', 'rows']);
    if (rawReturns.length > 0) {
      hadRealData = true;
      let pendingRet = 0;
      let approvedRet = 0;
      let replCount = 0;

      rawReturns.forEach((r) => {
        if (r.status === 'Requested' || r.status === 'Received') pendingRet++;
        else if (r.status === 'Approved' || r.status === 'Completed' || r.status === 'Replaced') approvedRet++;

        if (r.replacement_required || r.status === 'Replaced') replCount++;

        allActivities.push({
          id: `ret-${r.id}`,
          type: 'return',
          title: `Return #${r.return_number || r.id} (${r.status})`,
          description: `${r.product_name || 'Hardware'} • Reason: ${r.return_reason || 'RMA request'}`,
          timestamp: r.created_at || r.return_date || new Date().toISOString(),
          time: r.return_date ? new Date(r.return_date).toLocaleDateString() : 'Recent',
          actor: r.customer_name || 'RMA Desk',
        });
      });

      result.returnsAndQuality.pendingReturns = pendingRet;
      result.returnsAndQuality.approvedReturns = approvedRet;
      result.returnsAndQuality.replacements = replCount;
      result.summaryCards.pendingReturns = pendingRet;

      result.returnsAndQuality.recentReturns = rawReturns.slice(0, 5).map((r) => ({
        id: r.id,
        return_number: r.return_number || `RET-${r.id}`,
        customer_name: r.customer_name || 'Customer',
        product_name: r.product_name || `Product #${r.product_id}`,
        return_reason: r.return_reason || 'Defect reported',
        status: r.status || 'Requested',
        replacement_required: Boolean(r.replacement_required),
        return_date: r.return_date ? new Date(r.return_date).toLocaleDateString() : 'Recent',
      }));
    }

    // --- F. QUALITY INSPECTIONS ---
    const rawInspections = extractList(inspectionsRes.status === 'fulfilled' ? inspectionsRes.value : null, ['inspections', 'rows']);
    const inspSummary = inspectionSummaryRes.status === 'fulfilled' ? inspectionSummaryRes.value : null;

    if (rawInspections.length > 0 || inspSummary) {
      hadRealData = true;
      const totalInspected = inspSummary?.totalInspected || rawInspections.reduce((sum, i) => sum + (Number(i.quantity_inspected) || 0), 0);
      const totalPassed = inspSummary?.totalPassed || rawInspections.reduce((sum, i) => sum + (Number(i.passed_quantity) || 0), 0);
      const totalFailed = inspSummary?.totalFailed || rawInspections.reduce((sum, i) => sum + (Number(i.failed_quantity) || 0), 0);
      const pendingInspections = rawInspections.filter((i) => i.result === 'Pending').length;

      const passRate = totalInspected > 0 ? Number(((totalPassed / totalInspected) * 100).toFixed(1)) : 100;

      result.returnsAndQuality.totalInspected = totalInspected;
      result.returnsAndQuality.totalPassed = totalPassed;
      result.returnsAndQuality.totalFailed = totalFailed;
      result.returnsAndQuality.defectiveProducts = totalFailed;
      result.returnsAndQuality.pendingInspections = pendingInspections;
      result.returnsAndQuality.passRate = passRate;

      rawInspections.forEach((i) => {
        allActivities.push({
          id: `insp-${i.id}`,
          type: 'inspection',
          title: `Quality Inspection: ${i.item_type || i.product?.name || 'Batch'} (${i.result})`,
          description: `Passed: ${i.passed_quantity || 0} | Failed: ${i.failed_quantity || 0} • Defect: ${i.defect_type || 'None'}`,
          timestamp: i.created_at || i.inspection_date || new Date().toISOString(),
          time: i.inspection_date ? new Date(i.inspection_date).toLocaleDateString() : 'Recent',
          actor: i.inspector ? `${i.inspector.first_name} ${i.inspector.last_name}` : 'QA Lead',
        });
      });

      result.returnsAndQuality.recentInspections = rawInspections.slice(0, 5).map((i) => ({
        id: i.id,
        item_type: i.item_type || 'Hardware Component',
        product_name: i.product?.name || `Product #${i.product_id}`,
        batch_number: i.batch_number || `BATCH-${i.id}`,
        quantity_inspected: Number(i.quantity_inspected) || 1,
        passed_quantity: Number(i.passed_quantity) || 0,
        failed_quantity: Number(i.failed_quantity) || 0,
        result: i.result || 'Pending',
        defect_type: i.defect_type,
        severity: i.severity || 'Low',
        inspection_date: i.inspection_date ? new Date(i.inspection_date).toLocaleDateString() : 'Recent',
      }));
    }

    // --- G. STAFF / EMPLOYEES ---
    const rawStaff = extractList(staffRes.status === 'fulfilled' ? staffRes.value : null, ['staff', 'rows']);
    if (rawStaff.length > 0) {
      hadRealData = true;
      const activeStaff = rawStaff.filter((s) => s.is_active !== false);
      result.summaryCards.activeEmployees = activeStaff.length;
    }

    // --- H. MANUFACTURING OVERVIEW ---
    const rawAssignments = extractList(manufacturingAssignmentsRes.status === 'fulfilled' ? manufacturingAssignmentsRes.value : null, ['assignments', 'rows']);
    const mfgSummary = manufacturingSummaryRes.status === 'fulfilled' ? manufacturingSummaryRes.value : null;

    if (rawAssignments.length > 0 || mfgSummary) {
      hadRealData = true;
      result.manufacturingOverview.totalAssignments = mfgSummary?.totalAssignments || rawAssignments.length;
      result.manufacturingOverview.workingCount = rawAssignments.filter((a) => a.status === 'Working').length;
      result.manufacturingOverview.onBreakCount = rawAssignments.filter((a) => a.status === 'On Break').length;
      result.manufacturingOverview.standbyCount = rawAssignments.filter((a) => a.status === 'Standby').length;

      // Group assignments by Canonical Product Lines: GPU, RAM, ROM / SSD, Motherboard
      const lines = [
        { name: 'GPU Assembly Line', key: 'gpu', match: ['GPU', 'GRAPHICS'] },
        { name: 'RAM Memory Line', key: 'ram', match: ['RAM', 'MEMORY'] },
        { name: 'ROM / SSD Storage Line', key: 'rom_ssd', match: ['SSD', 'ROM', 'STORAGE'] },
        { name: 'Motherboard Line', key: 'motherboard', match: ['MOTHERBOARD', 'MAINBOARD', 'PCB'] },
      ];

      result.manufacturingOverview.sectors = lines.map((line) => {
        const matchingAssignments = rawAssignments.filter((a) => {
          const sec = (a.sector || '').toUpperCase();
          const pName = (a.product?.name || '').toUpperCase();
          const pType = (a.product?.type || '').toUpperCase();
          return line.match.some((m) => sec.includes(m) || pName.includes(m) || pType.includes(m));
        });

        const activeWorkers = matchingAssignments.filter((a) => a.status === 'Working').length;

        return {
          name: line.name,
          key: line.key,
          totalAssigned: matchingAssignments.length,
          activeWorking: activeWorkers,
          shiftSummary: matchingAssignments.map((a) => a.shift).filter(Boolean).join(', ') || 'Day Shift',
          technicians: matchingAssignments.slice(0, 3).map((a) => `${a.staff?.first_name || 'Staff'} ${a.staff?.last_name || ''}`.trim()),
        };
      });

      result.manufacturingOverview.assignments = rawAssignments.slice(0, 6);
    }

    // --- I. RECENT ACTIVITY (Sorted Real Events) ---
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    result.recentActivity = allActivities.slice(0, 8);

    // --- J. EXPENSES SUMMARY ---
    if (expensesSummaryRes.status === 'fulfilled' && expensesSummaryRes.value) {
      result.summaryCards.totalExpenses = Number(expensesSummaryRes.value.totalExpenses) || 0;
    }

    result.isLive = hadRealData;
  } catch (err) {
    console.error('Dashboard data fetch error:', err);
  }

  return result;
};

