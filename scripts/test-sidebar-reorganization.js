import assert from 'assert';
import {
  NAV_STRUCTURE,
  isItemAuthorized,
  isPathActive,
  getInitialExpandedState
} from '../src/components/Sidebar/sidebarConfig.js';

console.log('====================================================');
console.log('RUNNING TITANCORE SIDEBAR REORGANIZATION TESTS');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

const test = (title, fn) => {
  try {
    fn();
    console.log(`✅ [PASS] ${title}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${title} - ${err.message}`);
    failed++;
  }
};

// 1. Structure Verification: Main Level Items
test('Main level items are Dashboard, Products, Cart, Orders in order', () => {
  const mainItems = NAV_STRUCTURE.filter((i) => i.type === 'item');
  assert.strictEqual(mainItems.length, 4, 'Should have exactly 4 main level items');

  assert.strictEqual(mainItems[0].label, 'Dashboard');
  assert.strictEqual(mainItems[0].path, '/dashboard');

  assert.strictEqual(mainItems[1].label, 'Products');
  assert.strictEqual(mainItems[1].path, '/products');

  assert.strictEqual(mainItems[2].label, 'Cart');
  assert.strictEqual(mainItems[2].path, '/cart');

  assert.strictEqual(mainItems[3].label, 'Orders');
  assert.strictEqual(mainItems[3].path, '/orders');
});

// 2. Production Management Parent & Submenu Order
test('Production Management parent has submenus in exact order: Production, Manufacturing, Quality Inspection, Inventory', () => {
  const prodParent = NAV_STRUCTURE.find((i) => i.id === 'production-management');
  assert(prodParent, 'Production Management parent menu must exist');
  assert.strictEqual(prodParent.label, 'Production Management');
  assert.strictEqual(prodParent.children.length, 4, 'Should have 4 submenus');

  assert.strictEqual(prodParent.children[0].label, 'Production');
  assert.strictEqual(prodParent.children[0].path, '/production');

  assert.strictEqual(prodParent.children[1].label, 'Manufacturing');
  assert.strictEqual(prodParent.children[1].path, '/manufacturing');

  assert.strictEqual(prodParent.children[2].label, 'Quality Inspection');
  assert.strictEqual(prodParent.children[2].path, '/inspections');

  assert.strictEqual(prodParent.children[3].label, 'Inventory');
  assert.strictEqual(prodParent.children[3].path, '/inventory');
});

// 3. Deliveries Parent & Submenu Order
test('Deliveries parent has submenus in exact order: Delivery, Return Delivery (reusing /returns)', () => {
  const delParent = NAV_STRUCTURE.find((i) => i.id === 'deliveries');
  assert(delParent, 'Deliveries parent menu must exist');
  assert.strictEqual(delParent.label, 'Deliveries');
  assert.strictEqual(delParent.children.length, 2, 'Should have 2 submenus');

  assert.strictEqual(delParent.children[0].label, 'Delivery');
  assert.strictEqual(delParent.children[0].path, '/deliveries');

  assert.strictEqual(delParent.children[1].label, 'Return Delivery');
  assert.strictEqual(delParent.children[1].path, '/returns');
});

// 4. Revenue Parent & Submenus
test('Revenue parent has submenus: Revenue Management (/revenue) and Expenses (/expenses)', () => {
  const revParent = NAV_STRUCTURE.find((i) => i.id === 'revenue');
  assert(revParent, 'Revenue parent menu must exist');
  assert.strictEqual(revParent.label, 'Revenue');
  assert.strictEqual(revParent.children.length, 2, 'Should have 2 submenus');

  assert.strictEqual(revParent.children[0].label, 'Revenue Management');
  assert.strictEqual(revParent.children[0].path, '/revenue');

  assert.strictEqual(revParent.children[1].label, 'Expenses');
  assert.strictEqual(revParent.children[1].path, '/expenses');
});

// 5. Staff Management Parent & Submenus
test('Staff Management parent has submenus: Employee Details (/staff) and Role & Permissions (/roles)', () => {
  const staffParent = NAV_STRUCTURE.find((i) => i.id === 'staff-management');
  assert(staffParent, 'Staff Management parent menu must exist');
  assert.strictEqual(staffParent.label, 'Staff Management');
  assert.strictEqual(staffParent.children.length, 2, 'Should have 2 submenus');

  assert.strictEqual(staffParent.children[0].label, 'Employee Details');
  assert.strictEqual(staffParent.children[0].path, '/staff');

  assert.strictEqual(staffParent.children[1].label, 'Role & Permissions');
  assert.strictEqual(staffParent.children[1].path, '/roles');
  assert.strictEqual(staffParent.children[1].adminOnly, true);
});

// 6. Active path matching logic
test('isPathActive correctly matches exact paths and subroutes', () => {
  assert.strictEqual(isPathActive('/inventory', '/inventory'), true);
  assert.strictEqual(isPathActive('/roles', '/roles'), true);
  assert.strictEqual(isPathActive('/roles', '/roles/screens'), true);
  assert.strictEqual(isPathActive('/roles', '/roles/1/screens'), true);
  assert.strictEqual(isPathActive('/dashboard', '/dashboard'), true);
  assert.strictEqual(isPathActive('/orders', '/products'), false);
  assert.strictEqual(isPathActive('/inventory', '/deliveries'), false);
});

// 7. Auto-expansion of parents matching current URL
test('getInitialExpandedState automatically expands parent containing active child', () => {
  const stateProd = getInitialExpandedState('/inventory');
  assert.strictEqual(stateProd['production-management'], true);

  const stateDel = getInitialExpandedState('/returns');
  assert.strictEqual(stateDel['deliveries'], true);

  const stateRev = getInitialExpandedState('/revenue');
  assert.strictEqual(stateRev['revenue'], true);

  const stateStaff = getInitialExpandedState('/roles/screens');
  assert.strictEqual(stateStaff['staff-management'], true);
});

// 8. Role-Based Permissions: Admin User
test('Admin user has access to all main items and all submenus across all parents', () => {
  const adminContext = {
    user: { id: 1, role: { slug: 'admin', name: 'Admin' } },
    isAdmin: () => true,
    screens: [
      { slug: 'dashboard' }, { slug: 'products' }, { slug: 'cart' }, { slug: 'orders' },
      { slug: 'production' }, { slug: 'manufacturing' }, { slug: 'inspection' },
      { slug: 'inventory' }, { slug: 'deliveries' }, { slug: 'returns' },
      { slug: 'expenses' }, { slug: 'staff' }, { slug: 'roles' }
    ],
    hasPermission: () => true,
  };

  NAV_STRUCTURE.forEach((entry) => {
    if (entry.type === 'item') {
      assert.strictEqual(isItemAuthorized(entry, adminContext), true, `${entry.label} should be authorized for Admin`);
    } else if (entry.type === 'parent') {
      const allowedChildren = entry.children.filter((c) => isItemAuthorized(c, adminContext));
      assert.strictEqual(allowedChildren.length, entry.children.length, `All children of ${entry.label} should be authorized for Admin`);
    }
  });
});

// 9. Role-Based Permissions: Sales User (only dashboard, orders, cart)
test('Sales user sees only Dashboard, Cart, Orders; all 4 parent menus are hidden', () => {
  const salesContext = {
    user: { id: 2, role: { slug: 'sales', name: 'Sales' } },
    isAdmin: () => false,
    screens: [
      { slug: 'dashboard' }, { slug: 'orders' }, { slug: 'cart' }
    ],
    hasPermission: (perm) => ['dashboard.view', 'orders.view', 'cart.view'].includes(perm),
  };

  const visibleEntries = NAV_STRUCTURE.map((entry) => {
    if (entry.type === 'item') {
      return isItemAuthorized(entry, salesContext) ? entry : null;
    }
    if (entry.type === 'parent') {
      const allowed = entry.children.filter((c) => isItemAuthorized(c, salesContext));
      return allowed.length > 0 ? { ...entry, children: allowed } : null;
    }
    return null;
  }).filter(Boolean);

  const visibleLabels = visibleEntries.map((e) => e.label);
  assert.deepStrictEqual(visibleLabels, ['Dashboard', 'Cart', 'Orders']);

  // All 4 parents should be completely hidden because they have 0 accessible children
  assert(!visibleLabels.includes('Production Management'));
  assert(!visibleLabels.includes('Deliveries'));
  assert(!visibleLabels.includes('Revenue'));
  assert(!visibleLabels.includes('Staff Management'));
});

// 10. Role-Based Permissions: Delivery User
test('Delivery user sees Dashboard, and Deliveries parent with Delivery & Return Delivery', () => {
  const deliveryContext = {
    user: { id: 3, role: { slug: 'delivery', name: 'Delivery' } },
    isAdmin: () => false,
    screens: [
      { slug: 'dashboard' }, { slug: 'deliveries' }, { slug: 'returns' }
    ],
    hasPermission: (perm) => ['dashboard.view', 'deliveries.view', 'returns.view'].includes(perm),
  };

  const visibleEntries = NAV_STRUCTURE.map((entry) => {
    if (entry.type === 'item') {
      return isItemAuthorized(entry, deliveryContext) ? entry : null;
    }
    if (entry.type === 'parent') {
      const allowed = entry.children.filter((c) => isItemAuthorized(c, deliveryContext));
      return allowed.length > 0 ? { ...entry, children: allowed } : null;
    }
    return null;
  }).filter(Boolean);

  const visibleLabels = visibleEntries.map((e) => e.label);
  assert.deepStrictEqual(visibleLabels, ['Dashboard', 'Deliveries']);

  const delEntry = visibleEntries.find((e) => e.label === 'Deliveries');
  assert.strictEqual(delEntry.children.length, 2);
  assert.strictEqual(delEntry.children[0].label, 'Delivery');
  assert.strictEqual(delEntry.children[1].label, 'Return Delivery');
});

// 11. Role-Based Permissions: Store Manager (non-admin with staff.view)
test('Store Manager sees Employee Details, but Role & Permissions is hidden (adminOnly)', () => {
  const managerContext = {
    user: { id: 4, role: { slug: 'store_manager', name: 'Store Manager' } },
    isAdmin: () => false,
    screens: [
      { slug: 'dashboard' }, { slug: 'staff' }, { slug: 'products' },
      { slug: 'inventory' }, { slug: 'orders' }, { slug: 'deliveries' }
    ],
    hasPermission: (perm) => [
      'dashboard.view', 'staff.view', 'products.view',
      'inventory.view', 'orders.view', 'deliveries.view'
    ].includes(perm),
  };

  const staffParent = NAV_STRUCTURE.find((i) => i.id === 'staff-management');
  const allowedStaffChildren = staffParent.children.filter((c) => isItemAuthorized(c, managerContext));

  assert.strictEqual(allowedStaffChildren.length, 1, 'Only Employee Details should be visible to Store Manager');
  assert.strictEqual(allowedStaffChildren[0].label, 'Employee Details');
  assert.strictEqual(allowedStaffChildren[0].path, '/staff');

  // Verify Role & Permissions is hidden for non-admin
  const rolePermChild = staffParent.children.find((c) => c.label === 'Role & Permissions');
  assert.strictEqual(isItemAuthorized(rolePermChild, managerContext), false);
});

console.log('\n====================================================');
console.log(`TITANCORE SIDEBAR TESTS SUMMARY: Passed: ${passed}, Failed: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
