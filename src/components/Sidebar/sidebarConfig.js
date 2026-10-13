// sidebarConfig.js — Configuration and role-permission evaluation for TitanCore sidebar

export const EXPANDED_STORAGE_KEY = 'titancore_sidebar_expanded';

/**
 * Canonical navigation structure:
 * 1. Main level: Dashboard, Products, Cart, Orders
 * 2. Production Management: Production, Manufacturing, Quality Inspection, Inventory
 * 3. Deliveries: Delivery, Return Delivery (reusing /returns route)
 * 4. Revenue: Revenue Management, Expenses (reusing /revenue and /expenses)
 * 5. Staff Management: Employee Details, Role & Permissions (reusing /staff and /roles)
 */
export const NAV_STRUCTURE = [
  // --- Main level items ---
  {
    type: 'item',
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: '🏠',
    screenSlug: 'dashboard',
    requiredPermission: 'dashboard.view',
    alwaysAllowForAuth: true,
  },
  {
    type: 'item',
    id: 'products',
    label: 'Products',
    path: '/products',
    icon: '📦',
    screenSlug: 'products',
    requiredPermission: 'products.view',
  },
  {
    type: 'item',
    id: 'cart',
    label: 'Cart',
    path: '/cart',
    icon: '🛒',
    screenSlug: 'cart',
    requiredPermission: 'cart.view',
  },
  {
    type: 'item',
    id: 'orders',
    label: 'Orders',
    path: '/orders',
    icon: '📋',
    screenSlug: 'orders',
    requiredPermission: 'orders.view',
  },

  // --- Expandable Parent: Production Management ---
  {
    type: 'parent',
    id: 'production-management',
    label: 'Production Management',
    icon: '🏭',
    children: [
      {
        id: 'production',
        label: 'Production',
        path: '/production',
        icon: '⚙️',
        screenSlug: 'production',
        requiredPermission: 'production.view',
      },
      {
        id: 'manufacturing',
        label: 'Manufacturing',
        path: '/manufacturing',
        icon: '🔧',
        screenSlug: 'manufacturing',
        requiredPermission: 'manufacturing.view',
      },
      {
        id: 'quality-inspection',
        label: 'Quality Inspection',
        path: '/inspections',
        icon: '🔍',
        screenSlugs: ['inspection', 'inspections'],
        requiredPermission: 'inspection.view',
      },
      {
        id: 'inventory',
        label: 'Inventory',
        path: '/inventory',
        icon: '🗃️',
        screenSlug: 'inventory',
        requiredPermission: 'inventory.view',
      },
    ],
  },

  // --- Expandable Parent: Deliveries ---
  {
    type: 'parent',
    id: 'deliveries',
    label: 'Deliveries',
    icon: '🚚',
    children: [
      {
        id: 'delivery',
        label: 'Delivery',
        path: '/deliveries',
        icon: '🚚',
        screenSlug: 'deliveries',
        requiredPermission: 'deliveries.view',
      },
      {
        id: 'return-delivery',
        label: 'Return Delivery',
        path: '/returns',
        icon: '↩️',
        screenSlug: 'returns',
        requiredPermission: 'returns.view',
      },
    ],
  },

  // --- Expandable Parent: Revenue ---
  {
    type: 'parent',
    id: 'revenue',
    label: 'Revenue',
    icon: '📊',
    children: [
      {
        id: 'revenue-management',
        label: 'Revenue Management',
        path: '/revenue',
        icon: '📈',
        screenSlug: 'expenses',
        requiredPermission: 'expenses.view',
      },
      {
        id: 'expenses',
        label: 'Expenses',
        path: '/expenses',
        icon: '💰',
        screenSlug: 'expenses',
        requiredPermission: 'expenses.view',
      },
    ],
  },

  // --- Expandable Parent: Staff Management ---
  {
    type: 'parent',
    id: 'staff-management',
    label: 'Staff Management',
    icon: '👥',
    children: [
      {
        id: 'employee-details',
        label: 'Employee Details',
        path: '/staff',
        icon: '👥',
        screenSlug: 'staff',
        requiredPermission: 'staff.view',
      },
      {
        id: 'role-permissions',
        label: 'Role & Permissions',
        path: '/roles',
        icon: '🔐',
        adminOnly: true,
        screenSlug: 'roles',
      },
    ],
  },
];

/**
 * Determine if a target route matches or is an ancestor of the current pathname
 */
export function isPathActive(targetPath, currentPath) {
  if (!targetPath || !currentPath) return false;
  if (currentPath === targetPath) return true;
  if (targetPath !== '/' && currentPath.startsWith(targetPath + '/')) {
    return true;
  }
  return false;
}

/**
 * Check whether a menu item is authorized based on user permissions, screens, and role
 */
export function isItemAuthorized(item, { user, screens, isAdmin, hasPermission }) {
  if (item.adminOnly) {
    return typeof isAdmin === 'function' && isAdmin();
  }

  // Dashboard is accessible to any authenticated user
  if (item.alwaysAllowForAuth && user) {
    return true;
  }

  // Check if screen slug matches any item in user's permitted screens
  if (Array.isArray(screens) && screens.length > 0) {
    if (item.screenSlug && screens.some((s) => s.slug === item.screenSlug)) {
      return true;
    }
    if (item.screenSlugs && screens.some((s) => item.screenSlugs.includes(s.slug))) {
      return true;
    }
  }

  // Check if user has corresponding view permission
  if (item.requiredPermission && typeof hasPermission === 'function') {
    if (hasPermission(item.requiredPermission)) {
      return true;
    }
  }

  return false;
}

/**
 * Initialize expanded state from sessionStorage while auto-expanding parent containing current active route
 */
export function getInitialExpandedState(currentPath) {
  let saved = {};
  if (typeof sessionStorage !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(EXPANDED_STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {
      saved = {};
    }
  }

  NAV_STRUCTURE.forEach((entry) => {
    if (entry.type === 'parent' && Array.isArray(entry.children)) {
      const activeChild = entry.children.some((c) => isPathActive(c.path, currentPath));
      if (activeChild) {
        saved[entry.id] = true;
      }
    }
  });

  return saved;
}
