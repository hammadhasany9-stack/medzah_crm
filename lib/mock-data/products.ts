export interface UOMConversion {
  unit: string;
  factor: number; // how many base UOM units equal 1 of this unit
}

export interface ProductCatalogItem {
  sku: string;
  productName: string;
  uom: string; // base unit of measure
  uomConversions: UOMConversion[];
  price: number;   // selling price per base UOM
  cost: number;    // cost per base UOM
  category: string;
  qtyAvailable: number; // current stock quantity
}

export const mockProducts: ProductCatalogItem[] = [
  {
    sku: "IND-PMP-001",
    productName: "Industrial Centrifugal Pump",
    uom: "Each",
    uomConversions: [{ unit: "Each", factor: 1 }],
    price: 1250.00,
    cost: 780.00,
    category: "Pumps & Compressors",
    qtyAvailable: 14,
  },
  {
    sku: "SFT-GLV-SM",
    productName: "Safety Gloves - Small",
    uom: "Pair",
    uomConversions: [
      { unit: "Pair", factor: 1 },
      { unit: "Box (12 pairs)", factor: 12 },
      { unit: "Case (60 pairs)", factor: 60 },
    ],
    price: 14.50,
    cost: 6.20,
    category: "Safety Equipment",
    qtyAvailable: 240,
  },
  {
    sku: "SFT-GLV-MD",
    productName: "Safety Gloves - Medium",
    uom: "Pair",
    uomConversions: [
      { unit: "Pair", factor: 1 },
      { unit: "Box (12 pairs)", factor: 12 },
      { unit: "Case (60 pairs)", factor: 60 },
    ],
    price: 14.50,
    cost: 6.20,
    category: "Safety Equipment",
    qtyAvailable: 180,
  },
  {
    sku: "SFT-GLV-LG",
    productName: "Safety Gloves - Large",
    uom: "Pair",
    uomConversions: [
      { unit: "Pair", factor: 1 },
      { unit: "Box (12 pairs)", factor: 12 },
      { unit: "Case (60 pairs)", factor: 60 },
    ],
    price: 15.00,
    cost: 6.50,
    category: "Safety Equipment",
    qtyAvailable: 96,
  },
  {
    sku: "STL-TBG-316",
    productName: "Stainless Steel Tubing 316L - 1in",
    uom: "FT",
    uomConversions: [
      { unit: "FT", factor: 1 },
      { unit: "20ft Length", factor: 20 },
      { unit: "100ft Coil", factor: 100 },
    ],
    price: 18.75,
    cost: 10.40,
    category: "Pipe & Fittings",
    qtyAvailable: 850,
  },
  {
    sku: "STL-TBG-304",
    productName: "Stainless Steel Tubing 304 - 2in",
    uom: "FT",
    uomConversions: [
      { unit: "FT", factor: 1 },
      { unit: "20ft Length", factor: 20 },
    ],
    price: 32.00,
    cost: 17.80,
    category: "Pipe & Fittings",
    qtyAvailable: 420,
  },
  {
    sku: "ELC-MTR-3HP",
    productName: "Electric Motor 3HP 3-Phase",
    uom: "Each",
    uomConversions: [{ unit: "Each", factor: 1 }],
    price: 540.00,
    cost: 310.00,
    category: "Motors & Drives",
    qtyAvailable: 8,
  },
  {
    sku: "ELC-MTR-5HP",
    productName: "Electric Motor 5HP 3-Phase",
    uom: "Each",
    uomConversions: [{ unit: "Each", factor: 1 }],
    price: 820.00,
    cost: 475.00,
    category: "Motors & Drives",
    qtyAvailable: 5,
  },
  {
    sku: "HYD-HOS-025",
    productName: "Hydraulic Hose Assembly 1/4in",
    uom: "FT",
    uomConversions: [
      { unit: "FT", factor: 1 },
      { unit: "50ft Reel", factor: 50 },
    ],
    price: 8.90,
    cost: 4.30,
    category: "Hydraulics",
    qtyAvailable: 600,
  },
  {
    sku: "BRG-SKF-6205",
    productName: "Ball Bearing SKF 6205-2RS",
    uom: "Each",
    uomConversions: [
      { unit: "Each", factor: 1 },
      { unit: "Box (10)", factor: 10 },
    ],
    price: 12.80,
    cost: 5.90,
    category: "Bearings",
    qtyAvailable: 320,
  },
  {
    sku: "VLV-GTB-2IN",
    productName: "Gate Valve 2in 150lb",
    uom: "Each",
    uomConversions: [{ unit: "Each", factor: 1 }],
    price: 89.50,
    cost: 44.00,
    category: "Valves",
    qtyAvailable: 38,
  },
  {
    sku: "VLV-BLB-1IN",
    productName: "Ball Valve 1in Full Port",
    uom: "Each",
    uomConversions: [
      { unit: "Each", factor: 1 },
      { unit: "Box (5)", factor: 5 },
    ],
    price: 34.00,
    cost: 16.50,
    category: "Valves",
    qtyAvailable: 75,
  },
  {
    sku: "CSM-BOLT-M12",
    productName: "Hex Bolt M12 x 50mm Grade 8.8",
    uom: "Each",
    uomConversions: [
      { unit: "Each", factor: 1 },
      { unit: "Box (50)", factor: 50 },
      { unit: "Box (100)", factor: 100 },
    ],
    price: 0.85,
    cost: 0.32,
    category: "Fasteners",
    qtyAvailable: 2500,
  },
  {
    sku: "FLT-AIR-HVY",
    productName: "Heavy Duty Air Filter Element",
    uom: "Each",
    uomConversions: [
      { unit: "Each", factor: 1 },
      { unit: "Case (6)", factor: 6 },
    ],
    price: 67.00,
    cost: 34.00,
    category: "Filtration",
    qtyAvailable: 42,
  },
  {
    sku: "LUB-GRS-EP2",
    productName: "EP2 Multi-Purpose Grease",
    uom: "KG",
    uomConversions: [
      { unit: "KG", factor: 1 },
      { unit: "18kg Drum", factor: 18 },
      { unit: "180kg Barrel", factor: 180 },
    ],
    price: 9.20,
    cost: 4.10,
    category: "Lubricants",
    qtyAvailable: 360,
  },
];

const PRODUCTS_KEY = "medzah_crm_products_v1";

export function loadProducts(): ProductCatalogItem[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProductCatalogItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return mockProducts;
}

export function saveProducts(products: ProductCatalogItem[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}
