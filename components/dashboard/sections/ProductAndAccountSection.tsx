"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DashboardChartCard, dashboardFilterSelectClass } from "@/components/dashboard/DashboardChartCard";
import {
  ACCOUNT_PRODUCT_MIXES,
  DASHBOARD_ANALYTICS_YEARS,
  DASHBOARD_MONTH_NUMBERS,
  DASHBOARD_CHART_COLORS,
  dashboardPeriodLabel,
  formatDashboardCurrency,
  getAccountProductMixesForPeriod,
  getRevenueByProductLineForPeriod,
} from "@/lib/mock-data/sales-dashboard-data";

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-700">{row.name}</p>
      <p className="text-slate-600">{formatDashboardCurrency(row.value ?? 0)}</p>
    </div>
  );
}

function LineChip({ children, variant }: { children: ReactNode; variant: "yes" | "no" }) {
  return (
    <span
      className={
        variant === "yes"
          ? "inline-flex items-center rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-medium"
          : "inline-flex items-center rounded-md bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 text-xs font-medium"
      }
    >
      {children}
    </span>
  );
}

function PeriodFilters({
  year,
  month,
  onYearChange,
  onMonthChange,
}: {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Month</label>
        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className={dashboardFilterSelectClass}
        >
          {DASHBOARD_MONTH_NUMBERS.map((m) => (
            <option key={m} value={m}>
              {new Date(2000, m - 1, 1).toLocaleString("en-US", { month: "long" })}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Year</label>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className={dashboardFilterSelectClass}
        >
          {DASHBOARD_ANALYTICS_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <span className="text-xs text-slate-500 sm:ml-auto">{dashboardPeriodLabel(year, month)}</span>
    </div>
  );
}

export function ProductAndAccountSection() {
  const defaultYear = 2026;
  const defaultMonth = 3;
  const [productYear, setProductYear] = useState(defaultYear);
  const [productMonth, setProductMonth] = useState(defaultMonth);

  const [accountId, setAccountId] = useState(ACCOUNT_PRODUCT_MIXES[0].id);

  const companyPieData = useMemo(
    () => getRevenueByProductLineForPeriod(productYear, productMonth),
    [productYear, productMonth]
  );

  const accountsForPeriod = useMemo(
    () => getAccountProductMixesForPeriod(productYear, productMonth),
    [productYear, productMonth]
  );

  const account = useMemo(
    () => accountsForPeriod.find((a) => a.id === accountId) ?? accountsForPeriod[0],
    [accountsForPeriod, accountId]
  );

  const accountPieData = account.mix.map((m) => ({ name: m.line, value: m.revenue }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <DashboardChartCard
        title="Revenue by Product Line"
        description="Company-wide distribution for the selected month (mock scaling)."
      >
        <PeriodFilters
          year={productYear}
          month={productMonth}
          onYearChange={setProductYear}
          onMonthChange={setProductMonth}
        />
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={companyPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={100}
                paddingAngle={2}
              >
                {companyPieData.map((slice, i) => (
                  <Cell
                    key={slice.name}
                    fill={DASHBOARD_CHART_COLORS[i % DASHBOARD_CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: 11, color: "#475569" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </DashboardChartCard>

      <DashboardChartCard
        title="Revenue by Product Line per Account"
        description="Same period as the company chart; mix values are mock-scaled by month."
      >
        <PeriodFilters
          year={productYear}
          month={productMonth}
          onYearChange={setProductYear}
          onMonthChange={setProductMonth}
        />
        <label className="block text-xs font-medium text-slate-600 mb-2">Account</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full max-w-md mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#002f93]/25 focus:border-[#002f93]"
        >
          {accountsForPeriod.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-emerald-800 mb-2">Purchases</p>
            <ul className="flex flex-wrap gap-1.5">
              {account.linesPurchased.map((line) => (
                <li key={line}>
                  <LineChip variant="yes">{line}</LineChip>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Does not purchase</p>
            <ul className="flex flex-wrap gap-1.5">
              {account.linesNotPurchased.map((line) => (
                <li key={line}>
                  <LineChip variant="no">{line}</LineChip>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-2">Product mix (revenue among purchased lines)</p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={accountPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={88}
                paddingAngle={2}
              >
                {accountPieData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={DASHBOARD_CHART_COLORS[i % DASHBOARD_CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 11, color: "#475569" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </DashboardChartCard>
    </div>
  );
}
