/**
 * CANONICAL 4 PRODUCTS SPECIFICATION & UTILITIES
 * 1. GPU
 * 2. RAM
 * 3. ROM / SSD
 * 4. Motherboard
 *
 * Provides central matching and filtering of live backend records
 * to guarantee complete frontend consistency across all modules.
 */

export const CANONICAL_PRODUCT_SPECS = [
  {
    key: 'gpu',
    canonicalName: 'GPU',
    categoryType: 'Graphics Card (GPU)',
    matchTypes: ['GPU', 'GRAPHICS CARD', 'GRAPHICS', 'RTX', 'GTX', 'RADEON'],
    description:
      'A Graphics Processing Unit designed to handle graphics rendering, video processing, and parallel computing tasks.',
    materials: [
      'GPU semiconductor chip',
      'Silicon',
      'Copper',
      'Aluminum heatsink',
      'Printed Circuit Board (PCB)',
      'VRAM memory chips',
      'Solder',
      'Thermal interface material',
      'Electronic capacitors and other components',
    ],
    defaultPrice: 950.0,
    defaultStock: 40,
  },
  {
    key: 'ram',
    canonicalName: 'RAM',
    categoryType: 'RAM Memory',
    matchTypes: ['RAM', 'RAM MEMORY', 'MEMORY', 'DDR4', 'DDR5', 'DDR'],
    description:
      'Random Access Memory used to temporarily store data and instructions that the processor needs for fast access while applications are running.',
    materials: [
      'DRAM memory chips',
      'Silicon',
      'Printed Circuit Board (PCB)',
      'Copper traces',
      'Gold-plated electrical contacts',
      'Solder',
      'Capacitors and resistors',
    ],
    defaultPrice: 120.0,
    defaultStock: 40,
  },
  {
    key: 'rom_ssd',
    canonicalName: 'ROM / SSD',
    categoryType: 'SSD Storage',
    matchTypes: ['SSD', 'SSD STORAGE', 'ROM', 'STORAGE', 'NVME', 'M.2', 'HARD DRIVE', 'DISK'],
    description:
      'A solid-state storage device used to permanently store the operating system, applications, and user data.',
    materials: [
      'NAND flash memory chips',
      'Silicon',
      'Controller chip',
      'Printed Circuit Board (PCB)',
      'Copper traces',
      'Aluminum or other metal casing',
      'Solder',
      'Electronic components',
    ],
    defaultPrice: 89.5,
    defaultStock: 80,
  },
  {
    key: 'motherboard',
    canonicalName: 'Motherboard',
    categoryType: 'Motherboard',
    matchTypes: ['MOTHERBOARD', 'MAINBOARD', 'CHIPSET'],
    description:
      'The main circuit board of a computer that connects and allows communication between the processor, memory, storage, graphics hardware, power supply, and other components.',
    materials: [
      'Fiberglass and epoxy resin PCB material',
      'Copper traces',
      'Silicon integrated circuits',
      'Aluminum heatsinks',
      'Gold-plated contacts/connectors',
      'Solder',
      'Capacitors',
      'Resistors',
      'Connectors and sockets',
    ],
    defaultPrice: 210.0,
    defaultStock: 30,
  },
];

/**
 * Maps raw backend products list into the exact 4 canonical product records.
 * Uses real backend IDs and real backend properties.
 */
export const getCanonicalProducts = (rawProducts = []) => {
  const safeList = Array.isArray(rawProducts) ? rawProducts : [];

  return CANONICAL_PRODUCT_SPECS.map((spec) => {
    const matchingList = safeList.filter((p) => {
      const pType = (p.type || '').trim().toUpperCase();
      const pName = (p.name || '').trim().toUpperCase();
      return spec.matchTypes.some((m) => pType.includes(m) || pName.includes(m));
    });

    // Prioritize active product with available quantity > 0, then active, then first
    const matched =
      matchingList.find((p) => p.is_active && Number(p.available_quantity) > 0) ||
      matchingList.find((p) => p.is_active) ||
      matchingList[0];

    const realId = matched?.id;
    const realPrice = matched?.price !== undefined ? Number(matched.price) : spec.defaultPrice;
    const realQty = matched?.available_quantity !== undefined ? Number(matched.available_quantity) : spec.defaultStock;
    const realActive = matched?.is_active !== undefined ? matched.is_active : true;
    const realBackendName = matched?.name || spec.canonicalName;
    const realBackendType = matched?.type || spec.categoryType;

    return {
      id: realId,
      rawProduct: matched || null,
      key: spec.key,
      name: spec.canonicalName,
      canonical_name: spec.canonicalName,
      backend_name: realBackendName,
      type: spec.categoryType,
      backend_type: realBackendType,
      description: matched?.description || spec.description,
      materials: spec.materials,
      price: realPrice,
      available_quantity: realQty,
      is_active: realActive,
    };
  }).filter((p) => Boolean(p.id));
};

/**
 * Maps raw backend inventory items to the 4 canonical products.
 */
export const getCanonicalInventory = (rawInventory = []) => {
  const safeList = Array.isArray(rawInventory) ? rawInventory : [];
  const missing = [];
  const matchedList = [];

  CANONICAL_PRODUCT_SPECS.forEach((spec) => {
    const matchingList = safeList.filter((item) => {
      const pType = (item.product_type || item.product?.type || '').trim().toUpperCase();
      const pName = (item.product_name || item.product?.name || '').trim().toUpperCase();
      return spec.matchTypes.some((m) => pType.includes(m) || pName.includes(m));
    });

    const matched =
      matchingList.find((item) => item.is_active && Number(item.available_quantity) > 0) ||
      matchingList.find((item) => item.is_active) ||
      matchingList[0];

    if (!matched) {
      missing.push(spec.canonicalName);
    } else {
      matchedList.push({
        ...matched,
        canonical_key: spec.key,
        canonical_name: spec.canonicalName,
        canonical_type: spec.categoryType,
      });
    }
  });

  return { displayInventory: matchedList, missingProducts: missing };
};
