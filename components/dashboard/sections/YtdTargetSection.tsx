"use client";

import { useState } from "react";
import { DashboardChartCard, dashboardFilterSelectClass } from "@/components/dashboard/DashboardChartCard";
import {
  formatDashboardCurrency,
  formatDashboardPercent,
  ytdTargetDerivedForYear,
  type DashboardAnalyticsYear,
  DASHBOARD_ANALYTICS_YEARS,
} from "@/lib/mock-data/sales-dashboard-data";

export function YtdTargetSection() {
  const [ytdYear, setYtdYear] = useState<DashboardAnalyticsYear>(2026);
  const { row, pctToTarget, remaining } = ytdTargetDerivedForYear(ytdYear);
  const barPct = Math.min(100, pctToTarget);

  return (
    <DashboardChartCard
      title="YTD vs Annual Target"
      description="Progress toward the company sales goal for the selected reporting year (mock)."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs text-slate-500">{row.periodLabel}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <label htmlFor="ytd-year" className="text-xs font-medium text-slate-600">
            Year
          </label>
          <select
            id="ytd-year"
            value={ytdYear}
            onChange={(e) => setYtdYear(Number(e.target.value) as DashboardAnalyticsYear)}
            className={dashboardFilterSelectClass}
          >
            {DASHBOARD_ANALYTICS_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            {ytdYear === 2026 ? "YTD revenue" : "Revenue"}
          </p>
          <p className="text-sm font-bold text-slate-900 tabular-nums">
            {formatDashboardCurrency(row.ytdRevenue, ytdYear === 2026)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Annual target
          </p>
          <p className="text-sm font-bold text-slate-900 tabular-nums">
            {formatDashboardCurrency(row.annualTarget)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            % to target
          </p>
          <p className="text-sm font-bold text-[#002f93] tabular-nums">
            {formatDashboardPercent(pctToTarget)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Remaining to goal
          </p>
          <p className="text-sm font-bold text-slate-900 tabular-nums">
            {formatDashboardCurrency(remaining)}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Progress</span>
          <span className="tabular-nums">{formatDashboardPercent(barPct)}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#002f93] transition-all"
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>
    </DashboardChartCard>
  );
}
