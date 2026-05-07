/**
 * Hard-coded Operations / Amanda control board data (demo).
 * Replace with CRM + ERP feeds when available.
 */

import { formatDashboardCurrency } from "@/lib/mock-data/sales-dashboard-data";

export type CustomerStatus = "active" | "new" | "inactive";

export type ContractLifecycleStatus = "active" | "expiring" | "expired";

export interface TierPricingRow {
  id: string;
  tierLabel: string;
  volumeMin: number;
  volumeMax: number | null;
  unitPrice: number;
  marginPercent: number;
}

/** Chart-friendly rows derived from tiers */
export interface TierChartPoint {
  tier: string;
  avgVolumeBand: number;
  unitPrice: number;
  marginPercent: number;
}

export const TIER_BUYING_PATTERN_NOTES: string[] = [
  "Tier A accounts reorder every 4–6 weeks on average; strongest attachment to finished-goods bundles.",
  "Tier B shows seasonal spikes in Q2 and Q4; consider volume commitments before price moves.",
  "Tier C is price-sensitive; margin holds when paired with prepaid freight terms.",
];

export const TIER_PRICING_ROWS: TierPricingRow[] = [
  {
    id: "t1",
    tierLabel: "Tier A",
    volumeMin: 50000,
    volumeMax: null,
    unitPrice: 42.5,
    marginPercent: 28.4,
  },
  {
    id: "t2",
    tierLabel: "Tier B",
    volumeMin: 20000,
    volumeMax: 49999,
    unitPrice: 46.75,
    marginPercent: 24.1,
  },
  {
    id: "t3",
    tierLabel: "Tier C",
    volumeMin: 5000,
    volumeMax: 19999,
    unitPrice: 51.0,
    marginPercent: 18.6,
  },
  {
    id: "t4",
    tierLabel: "Tier D",
    volumeMin: 0,
    volumeMax: 4999,
    unitPrice: 58.25,
    marginPercent: 12.3,
  },
];

export function getTierChartData(): TierChartPoint[] {
  return TIER_PRICING_ROWS.map((r) => ({
    tier: r.tierLabel,
    avgVolumeBand:
      r.volumeMax === null
        ? r.volumeMin + 25000
        : (r.volumeMin + r.volumeMax) / 2,
    unitPrice: r.unitPrice,
    marginPercent: r.marginPercent,
  }));
}

export interface RevenueHistoryPoint {
  period: string;
  amount: number;
}

export interface DeadCustomerRow {
  id: string;
  customerName: string;
  lastOrderDate: string;
  revenueHistory: RevenueHistoryPoint[];
}

export const DEAD_CUSTOMERS: DeadCustomerRow[] = [
  {
    id: "dc1",
    customerName: "Sunrise Distributors LLC",
    lastOrderDate: "2024-07-12",
    revenueHistory: [
      { period: "2024 Q1", amount: 184_200 },
      { period: "2024 Q2", amount: 96_400 },
    ],
  },
  {
    id: "dc2",
    customerName: "Harbor Point Foods",
    lastOrderDate: "2024-05-28",
    revenueHistory: [
      { period: "2023 Q4", amount: 72_300 },
      { period: "2024 Q1", amount: 51_900 },
      { period: "2024 Q2", amount: 22_100 },
    ],
  },
  {
    id: "dc3",
    customerName: "Midwest Provisions Co.",
    lastOrderDate: "2024-04-03",
    revenueHistory: [
      { period: "2023 Q3", amount: 44_000 },
      { period: "2023 Q4", amount: 38_500 },
      { period: "2024 Q1", amount: 29_750 },
    ],
  },
];

export interface SpotlightCustomer {
  id: string;
  name: string;
  status: CustomerStatus;
  products: string[];
  pricingAgreement: string;
  contractStatus: ContractLifecycleStatus;
  lastOrderDate: string;
  revenueYtd: number;
}

export const SPOTLIGHT_CUSTOMERS: SpotlightCustomer[] = [
  {
    id: "sc1",
    name: "Pacific Wholesale Group",
    status: "active",
    products: ["SKU-1042 Case Pack", "SKU-881 Liquid 4L", "Private label blend"],
    pricingAgreement: "National account — Tier A + 2% volume rebate > $75k/qtr",
    contractStatus: "active",
    lastOrderDate: "2026-04-28",
    revenueYtd: 412_600,
  },
  {
    id: "sc2",
    name: "Lakeside Retail Co-op",
    status: "new",
    products: ["Starter assortment", "SKU-1042 Case Pack"],
    pricingAgreement: "Promotional net-30 — first 90 days Tier B minus 3%",
    contractStatus: "expiring",
    lastOrderDate: "2026-05-01",
    revenueYtd: 58_200,
  },
  {
    id: "sc3",
    name: "Atlas Ingredients Ltd.",
    status: "inactive",
    products: ["Bulk dry goods", "SKU-445 Pallet"],
    pricingAgreement: "Legacy matrix (2019) — renew pending",
    contractStatus: "expired",
    lastOrderDate: "2025-09-14",
    revenueYtd: 0,
  },
  {
    id: "sc4",
    name: "Urban Markets Inc.",
    status: "active",
    products: ["SKU-881 Liquid 4L", "Seasonal display kit"],
    pricingAgreement: "Regional — Tier B with freight cap",
    contractStatus: "expiring",
    lastOrderDate: "2026-04-22",
    revenueYtd: 198_400,
  },
];

export interface ContractTrackingRow {
  id: string;
  customerName: string;
  startDate: string;
  endDate: string;
  agreedPricing: string;
  renewalDate: string;
}

export const CONTRACT_TRACKING: ContractTrackingRow[] = [
  {
    id: "ct1",
    customerName: "Pacific Wholesale Group",
    startDate: "2024-06-01",
    endDate: "2027-05-31",
    agreedPricing: "Tier A column + freight prepaid > $40k",
    renewalDate: "2027-04-01",
  },
  {
    id: "ct2",
    customerName: "Lakeside Retail Co-op",
    startDate: "2025-06-15",
    endDate: "2026-05-28",
    agreedPricing: "Promo Tier B −3% (90-day review)",
    renewalDate: "2026-04-28",
  },
  {
    id: "ct3",
    customerName: "Urban Markets Inc.",
    startDate: "2024-02-01",
    endDate: "2026-06-04",
    agreedPricing: "Tier B + regional rebate",
    renewalDate: "2026-05-05",
  },
  {
    id: "ct4",
    customerName: "Summit Foods Network",
    startDate: "2023-01-10",
    endDate: "2025-12-31",
    agreedPricing: "Legacy Tier C matrix",
    renewalDate: "2025-11-30",
  },
];

/** Contracts in the 30-day pre-expiry window (for automation demo). */
export interface RenewalAlertRow {
  contractId: string;
  customerName: string;
  endDate: string;
  daysUntilEnd: number;
}

export const RENEWAL_ALERTS: RenewalAlertRow[] = [
  {
    contractId: "ct2",
    customerName: "Lakeside Retail Co-op",
    endDate: "2026-05-28",
    daysUntilEnd: 22,
  },
  {
    contractId: "ct3",
    customerName: "Urban Markets Inc.",
    endDate: "2026-06-04",
    daysUntilEnd: 29,
  },
];

export const AUTOMATION_RULES: string[] = [
  "Alert operations and account owner 30 days before contract end.",
  "Trigger renewal workflow (tasks + draft agreement) from the control board.",
];

export function formatVolumeBand(row: TierPricingRow): string {
  if (row.volumeMax === null) {
    return `${row.volumeMin.toLocaleString()}+ units / yr`;
  }
  return `${row.volumeMin.toLocaleString()}–${row.volumeMax.toLocaleString()} units / yr`;
}

export function formatRevenueHistoryLine(pt: RevenueHistoryPoint): string {
  return `${pt.period}: ${formatDashboardCurrency(pt.amount)}`;
}

/** Reference “today” for demo expiry math (aligned with sample contract dates). */
export const AMANDA_DEMO_AS_OF = "2026-05-06";

export function daysUntilEndFromDemoAnchor(endIso: string): number {
  const end = new Date(`${endIso}T12:00:00`);
  const anchor = new Date(`${AMANDA_DEMO_AS_OF}T12:00:00`);
  return Math.ceil((end.getTime() - anchor.getTime()) / 86_400_000);
}
