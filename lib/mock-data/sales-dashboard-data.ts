/**
 * Hard-coded sales dashboard KPIs for Medzah CRM (demo / Phase 1).
 *
 * Future data sources (replace these mocks):
 * - CRM: opportunities (pipeline stages, counts, values), accounts, quotes
 * - Fishbowl: revenue, margin, product sales by account, sales rep performance
 *
 * Monthly fields on reps (accelerators, new accounts): update values each month when still mocked.
 */

export const DASHBOARD_CHART_COLORS = [
  "#002f93",
  "#1d4ed8",
  "#3b82f6",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#0f172a",
  "#475569",
] as const;

export function formatDashboardCurrency(value: number, precise = false): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: precise ? 2 : 0,
    maximumFractionDigits: precise ? 2 : 0,
  }).format(value);
}

export function formatDashboardPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}

/** Dashboard filter bounds for mock analytics (year dropdowns). */
export const DASHBOARD_ANALYTICS_YEARS = [2024, 2025, 2026] as const;
export type DashboardAnalyticsYear = (typeof DASHBOARD_ANALYTICS_YEARS)[number];

export const DASHBOARD_MONTH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function momSeriesForCalendarYear(year: number, revenues12: readonly number[]): { monthLabel: string; revenue: number }[] {
  return revenues12.map((revenue, i) => ({
    monthLabel: `${MONTH_SHORT[i]} ${year}`,
    revenue,
  }));
}

/** Month-over-month by calendar year (12 months each; mock). */
export const MOM_SALES_BY_YEAR: Record<
  DashboardAnalyticsYear,
  { monthLabel: string; revenue: number }[]
> = {
  2024: momSeriesForCalendarYear(2024, [
    1_280_000, 1_265_000, 1_310_000, 1_298_000, 1_352_000, 1_315_000, 1_380_000, 1_342_000,
    1_405_000, 1_428_000, 1_492_000, 1_720_000,
  ]),
  2025: momSeriesForCalendarYear(2025, [
    1_420_000, 1_385_000, 1_510_000, 1_465_000, 1_598_000, 1_540_000, 1_620_000, 1_575_000,
    1_680_000, 1_710_000, 1_795_000, 2_050_000,
  ]),
  2026: momSeriesForCalendarYear(2026, [
    1_880_000, 1_920_000, 1_965_000, 1_910_000, 1_990_000, 2_020_000, 2_050_000, 2_030_000,
    2_080_000, 2_110_000, 2_140_000, 2_180_000,
  ]),
};

/** Default MoM slice (legacy single series spanning two years). */
export const MOM_SALES: { monthLabel: string; revenue: number }[] = [
  ...MOM_SALES_BY_YEAR[2025],
  ...MOM_SALES_BY_YEAR[2026].slice(0, 3),
];

export function getMomSalesForYear(year: DashboardAnalyticsYear): { monthLabel: string; revenue: number }[] {
  return MOM_SALES_BY_YEAR[year];
}

/** Quarterly revenue by fiscal calendar year (mock). */
export const QOQ_SALES_BY_YEAR: Record<
  DashboardAnalyticsYear,
  { quarter: string; revenue: number }[]
> = {
  2024: [
    { quarter: "Q1 2024", revenue: 3_920_000 },
    { quarter: "Q2 2024", revenue: 4_080_000 },
    { quarter: "Q3 2024", revenue: 4_240_000 },
    { quarter: "Q4 2024", revenue: 3_960_000 },
  ],
  2025: [
    { quarter: "Q1 2025", revenue: 4_315_000 },
    { quarter: "Q2 2025", revenue: 4_658_000 },
    { quarter: "Q3 2025", revenue: 5_065_000 },
    { quarter: "Q4 2025", revenue: 5_362_000 },
  ],
  2026: [
    { quarter: "Q1 2026", revenue: 5_765_000 },
    { quarter: "Q2 2026", revenue: 4_920_000 },
    { quarter: "Q3 2026", revenue: 5_180_000 },
    { quarter: "Q4 2026", revenue: 5_410_000 },
  ],
};

/** @deprecated Use `getQoqSalesForYear(year)` */
export const QOQ_SALES = QOQ_SALES_BY_YEAR[2026];

export function getQoqSalesForYear(year: DashboardAnalyticsYear): { quarter: string; revenue: number }[] {
  return QOQ_SALES_BY_YEAR[year];
}

export interface YtdTargetRow {
  periodLabel: string;
  ytdRevenue: number;
  annualTarget: number;
}

export const YTD_TARGET = {
  periodLabel: "January 1 – March 1, 2026",
  ytdRevenue: 2_638_509.99,
  annualTarget: 18_000_000,
} as const satisfies YtdTargetRow;

/** YTD vs annual mock rows by reporting year (2024–2025 = full-year actual vs target). */
export const YTD_TARGET_BY_YEAR: Record<DashboardAnalyticsYear, YtdTargetRow> = {
  2024: {
    periodLabel: "Full year 2024",
    ytdRevenue: 16_200_000,
    annualTarget: 15_800_000,
  },
  2025: {
    periodLabel: "Full year 2025",
    ytdRevenue: 18_400_000,
    annualTarget: 17_900_000,
  },
  2026: {
    periodLabel: YTD_TARGET.periodLabel,
    ytdRevenue: YTD_TARGET.ytdRevenue,
    annualTarget: YTD_TARGET.annualTarget,
  },
};

export function ytdTargetDerivedForYear(year: DashboardAnalyticsYear) {
  const row = YTD_TARGET_BY_YEAR[year];
  const pct = (row.ytdRevenue / row.annualTarget) * 100;
  const remaining = Math.max(0, row.annualTarget - row.ytdRevenue);
  return { row, pctToTarget: pct, remaining };
}

/** @deprecated Prefer `ytdTargetDerivedForYear` */
export function ytdTargetDerived() {
  return ytdTargetDerivedForYear(2026);
}

/** YoY chart: choose a contiguous 3-year window (three bars together). */
export const YOY_THREE_YEAR_WINDOWS: {
  key: string;
  label: string;
  data: { year: string; revenue: number }[];
}[] = [
  {
    key: "2022-2024",
    label: "2022, 2023 & 2024",
    data: [
      { year: "2022", revenue: 14_850_000 },
      { year: "2023", revenue: 15_520_000 },
      { year: "2024", revenue: 16_200_000 },
    ],
  },
  {
    key: "2023-2025",
    label: "2023, 2024 & 2025",
    data: [
      { year: "2023", revenue: 15_520_000 },
      { year: "2024", revenue: 16_200_000 },
      { year: "2025", revenue: 18_400_000 },
    ],
  },
  {
    key: "2024-2026",
    label: "2024, 2025 & 2026 (2026 YTD)",
    data: [
      { year: "2024", revenue: 16_200_000 },
      { year: "2025", revenue: 18_400_000 },
      { year: "2026 (YTD)", revenue: YTD_TARGET.ytdRevenue },
    ],
  },
];

/** @deprecated Use `YOY_THREE_YEAR_WINDOWS` selection */
export const YOY_SALES: { year: string; revenue: number }[] =
  YOY_THREE_YEAR_WINDOWS[YOY_THREE_YEAR_WINDOWS.length - 1].data;

/** Company-wide revenue by Medzah product line (six lines). */
export const REVENUE_BY_PRODUCT_LINE: { name: string; value: number }[] = [
  { name: "Hot/Cold Packs", value: 3_200_000 },
  { name: "Gloves", value: 4_850_000 },
  { name: "Orthopedic Softgoods", value: 3_920_000 },
  { name: "Incontinence", value: 2_640_000 },
  { name: "Bent Metals", value: 2_180_000 },
  { name: "Wound Care", value: 2_410_000 },
];

export function dashboardPeriodLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/** Company product-line pie: mock variation by month (replace with API slice). */
export function getRevenueByProductLineForPeriod(
  year: number,
  month: number
): { name: string; value: number }[] {
  const seed = year * 100 + month;
  const f = 0.86 + (seed % 27) / 100;
  return REVENUE_BY_PRODUCT_LINE.map((row, i) => ({
    name: row.name,
    value: Math.round(row.value * f * (1 + (((seed + i * 3) % 11) * 0.008))),
  }));
}

/**
 * Per-account view: catalog is a superset of company lines (cross-sell demo includes
 * Eye Protection, Lab Supplies, etc.).
 */
export interface AccountProductMix {
  id: string;
  name: string;
  /** Lines the account buys (for chip list + chart). */
  linesPurchased: string[];
  /** Lines not purchased — cross-sell targets. */
  linesNotPurchased: string[];
  /** Revenue mix among purchased lines only. */
  mix: { line: string; revenue: number }[];
}

export const ACCOUNT_PRODUCT_MIXES: AccountProductMix[] = [
  {
    id: "hartford",
    name: "Hartford Healthcare",
    linesPurchased: ["Eye Protection", "Gloves"],
    linesNotPurchased: ["Incontinence", "Lab Supplies"],
    mix: [
      { line: "Eye Protection", revenue: 890_000 },
      { line: "Gloves", revenue: 612_000 },
    ],
  },
  {
    id: "baystate",
    name: "Baystate Health",
    linesPurchased: ["Gloves", "Wound Care", "Orthopedic Softgoods", "Hot/Cold Packs"],
    linesNotPurchased: ["Incontinence", "Bent Metals", "Lab Supplies"],
    mix: [
      { line: "Gloves", revenue: 1_120_000 },
      { line: "Wound Care", revenue: 540_000 },
      { line: "Orthopedic Softgoods", revenue: 680_000 },
      { line: "Hot/Cold Packs", revenue: 290_000 },
    ],
  },
  {
    id: "yale",
    name: "Yale New Haven Health",
    linesPurchased: ["Incontinence", "Bent Metals", "Wound Care"],
    linesNotPurchased: ["Gloves", "Eye Protection", "Lab Supplies"],
    mix: [
      { line: "Incontinence", revenue: 720_000 },
      { line: "Bent Metals", revenue: 430_000 },
      { line: "Wound Care", revenue: 515_000 },
    ],
  },
];

/** Per-account rows for a month: same structure, mix revenue scaled (mock). */
export function getAccountProductMixesForPeriod(year: number, month: number): AccountProductMix[] {
  const seed = year * 100 + month;
  const f = 0.88 + (seed % 23) / 100;
  return ACCOUNT_PRODUCT_MIXES.map((acct) => ({
    ...acct,
    mix: acct.mix.map((m, j) => ({
      ...m,
      revenue: Math.round(m.revenue * f * (1 + (((seed + j) % 9) * 0.01))),
    })),
  }));
}

export interface SalesRepRow {
  id: string;
  name: string;
  revenue: number;
  /** Gross margin as % of revenue. */
  marginPercent: number;
  /** Annual quota for the selected tracking year (mock Fishbowl / plan). */
  annualQuota: number;
  /** Swap monthly while mocked. */
  acceleratorsEarned: number;
  /** Swap monthly while mocked. */
  newAccountsOpened: number;
}

/** Reporting years available for rep leaderboard / quota tracking filter. */
export const SALES_REP_TRACKING_YEARS = [2024, 2025, 2026] as const;

export type SalesRepTrackingYear = (typeof SALES_REP_TRACKING_YEARS)[number];

export const SALES_REPS_BY_YEAR: Record<SalesRepTrackingYear, SalesRepRow[]> = {
  2024: [
    {
      id: "pat",
      name: "Pat",
      revenue: 378_200,
      marginPercent: 22.1,
      annualQuota: 380_000,
      acceleratorsEarned: 9_500,
      newAccountsOpened: 4,
    },
    {
      id: "katie",
      name: "Katie",
      revenue: 401_000,
      marginPercent: 23.0,
      annualQuota: 380_000,
      acceleratorsEarned: 18_000,
      newAccountsOpened: 5,
    },
    {
      id: "alex",
      name: "Alex Chen",
      revenue: 302_400,
      marginPercent: 20.5,
      annualQuota: 320_000,
      acceleratorsEarned: 6_000,
      newAccountsOpened: 3,
    },
    {
      id: "jordan",
      name: "Jordan Lee",
      revenue: 265_100,
      marginPercent: 21.2,
      annualQuota: 320_000,
      acceleratorsEarned: 5_500,
      newAccountsOpened: 2,
    },
  ],
  2025: [
    {
      id: "pat",
      name: "Pat",
      revenue: 356_000,
      marginPercent: 22.8,
      annualQuota: 390_000,
      acceleratorsEarned: 11_000,
      newAccountsOpened: 3,
    },
    {
      id: "katie",
      name: "Katie",
      revenue: 392_800,
      marginPercent: 23.6,
      annualQuota: 390_000,
      acceleratorsEarned: 16_800,
      newAccountsOpened: 4,
    },
    {
      id: "alex",
      name: "Alex Chen",
      revenue: 318_900,
      marginPercent: 21.4,
      annualQuota: 340_000,
      acceleratorsEarned: 7_400,
      newAccountsOpened: 2,
    },
    {
      id: "jordan",
      name: "Jordan Lee",
      revenue: 241_300,
      marginPercent: 21.6,
      annualQuota: 340_000,
      acceleratorsEarned: 3_200,
      newAccountsOpened: 2,
    },
  ],
  2026: [
    {
      id: "pat",
      name: "Pat",
      revenue: 284_500,
      marginPercent: 23.4,
      annualQuota: 400_000,
      acceleratorsEarned: 12_000,
      newAccountsOpened: 3,
    },
    {
      id: "katie",
      name: "Katie",
      revenue: 311_200,
      marginPercent: 24.1,
      annualQuota: 400_000,
      acceleratorsEarned: 15_500,
      newAccountsOpened: 4,
    },
    {
      id: "alex",
      name: "Alex Chen",
      revenue: 256_800,
      marginPercent: 21.8,
      annualQuota: 350_000,
      acceleratorsEarned: 8_200,
      newAccountsOpened: 2,
    },
    {
      id: "jordan",
      name: "Jordan Lee",
      revenue: 198_400,
      marginPercent: 22.0,
      annualQuota: 350_000,
      acceleratorsEarned: 4_000,
      newAccountsOpened: 1,
    },
  ],
};

/** Default rep slice (2026); prefer `SALES_REPS_BY_YEAR` when filtering by year. */
export const SALES_REPS: SalesRepRow[] = SALES_REPS_BY_YEAR[2026];

/**
 * Leaderboard snapshot by month: derived from annual rep row with mock month factor
 * (replace with Fishbowl period API).
 */
export function getLeaderboardRepsForPeriod(
  year: SalesRepTrackingYear,
  month: number
): SalesRepRow[] {
  const base = SALES_REPS_BY_YEAR[year];
  const m = Math.min(12, Math.max(1, month));
  const seed = year * 100 + m;
  const season = m / 12;
  const factor = 0.82 + ((seed % 19) / 100) * 0.35 + season * 0.12;
  return base.map((r, i) => {
    const jitter = 1 + (((seed + i * 5) % 7) * 0.012);
    return {
      ...r,
      revenue: Math.round(r.revenue * factor * jitter),
      marginPercent: Number(
        Math.min(32, Math.max(18, r.marginPercent + ((seed + i) % 5) - 2)).toFixed(1)
      ),
    };
  });
}

export function repQuotaDerived(revenue: number, quota: number) {
  const pct = quota > 0 ? (revenue / quota) * 100 : 0;
  const gap = Math.max(0, quota - revenue);
  return { pctToQuota: pct, gapToTarget: gap };
}

export type PipelineStage =
  | "Qualification"
  | "Proposal"
  | "Quote Sent"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export interface PipelineStageRow {
  stage: PipelineStage;
  dealCount: number;
  pipelineValue: number;
}

/** Mock CRM pipeline snapshots by month (`YYYY-MM`). Swap or extend when wiring live data. */
export const PIPELINE_SNAPSHOTS: Record<string, PipelineStageRow[]> = {
  "2025-11": [
    { stage: "Qualification", dealCount: 24, pipelineValue: 1_820_000 },
    { stage: "Proposal", dealCount: 17, pipelineValue: 2_980_000 },
    { stage: "Quote Sent", dealCount: 12, pipelineValue: 2_410_000 },
    { stage: "Negotiation", dealCount: 9, pipelineValue: 3_650_000 },
    { stage: "Closed Won", dealCount: 38, pipelineValue: 7_920_000 },
    { stage: "Closed Lost", dealCount: 18, pipelineValue: 1_380_000 },
  ],
  "2025-12": [
    { stage: "Qualification", dealCount: 26, pipelineValue: 1_940_000 },
    { stage: "Proposal", dealCount: 18, pipelineValue: 3_120_000 },
    { stage: "Quote Sent", dealCount: 13, pipelineValue: 2_620_000 },
    { stage: "Negotiation", dealCount: 10, pipelineValue: 3_880_000 },
    { stage: "Closed Won", dealCount: 40, pipelineValue: 8_340_000 },
    { stage: "Closed Lost", dealCount: 17, pipelineValue: 1_310_000 },
  ],
  "2026-01": [
    { stage: "Qualification", dealCount: 27, pipelineValue: 2_020_000 },
    { stage: "Proposal", dealCount: 18, pipelineValue: 3_280_000 },
    { stage: "Quote Sent", dealCount: 13, pipelineValue: 2_750_000 },
    { stage: "Negotiation", dealCount: 10, pipelineValue: 3_980_000 },
    { stage: "Closed Won", dealCount: 41, pipelineValue: 8_540_000 },
    { stage: "Closed Lost", dealCount: 16, pipelineValue: 1_280_000 },
  ],
  "2026-02": [
    { stage: "Qualification", dealCount: 28, pipelineValue: 2_080_000 },
    { stage: "Proposal", dealCount: 19, pipelineValue: 3_380_000 },
    { stage: "Quote Sent", dealCount: 14, pipelineValue: 2_840_000 },
    { stage: "Negotiation", dealCount: 11, pipelineValue: 4_050_000 },
    { stage: "Closed Won", dealCount: 42, pipelineValue: 8_680_000 },
    { stage: "Closed Lost", dealCount: 16, pipelineValue: 1_260_000 },
  ],
  "2026-03": [
    { stage: "Qualification", dealCount: 28, pipelineValue: 2_100_000 },
    { stage: "Proposal", dealCount: 19, pipelineValue: 3_450_000 },
    { stage: "Quote Sent", dealCount: 14, pipelineValue: 2_890_000 },
    { stage: "Negotiation", dealCount: 11, pipelineValue: 4_120_000 },
    { stage: "Closed Won", dealCount: 42, pipelineValue: 8_750_000 },
    { stage: "Closed Lost", dealCount: 16, pipelineValue: 1_240_000 },
  ],
};

export function pipelineSnapshotKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Periods that exist in `PIPELINE_SNAPSHOTS` (for month/year filters). */
export const PIPELINE_PERIOD_OPTIONS: { year: number; month: number; label: string }[] = (
  Object.keys(PIPELINE_SNAPSHOTS) as string[]
)
  .map((key) => {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    return { year: y, month: m, label };
  })
  .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

export const DEFAULT_PIPELINE_YEAR = 2026;
export const DEFAULT_PIPELINE_MONTH = 3;

export function getPipelineForPeriod(year: number, month: number): PipelineStageRow[] {
  const key = pipelineSnapshotKey(year, month);
  return PIPELINE_SNAPSHOTS[key] ?? PIPELINE_SNAPSHOTS[pipelineSnapshotKey(DEFAULT_PIPELINE_YEAR, DEFAULT_PIPELINE_MONTH)];
}

/** @deprecated Prefer `getPipelineForPeriod` with month/year filters */
export const PIPELINE_BY_STAGE: PipelineStageRow[] = PIPELINE_SNAPSHOTS["2026-03"];
