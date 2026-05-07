"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardChartCard, dashboardFilterSelectClass } from "@/components/dashboard/DashboardChartCard";
import {
  formatDashboardCurrency,
  getMomSalesForYear,
  getQoqSalesForYear,
  type DashboardAnalyticsYear,
  DASHBOARD_ANALYTICS_YEARS,
  YOY_THREE_YEAR_WINDOWS,
} from "@/lib/mock-data/sales-dashboard-data";

function MomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-slate-600">{formatDashboardCurrency(payload[0].value)}</p>
    </div>
  );
}

export function TrendChartsSection() {
  const [momYear, setMomYear] = useState<DashboardAnalyticsYear>(2026);
  const [yoyWindowIndex, setYoyWindowIndex] = useState(YOY_THREE_YEAR_WINDOWS.length - 1);
  const [qoqYear, setQoqYear] = useState<DashboardAnalyticsYear>(2026);

  const momData = useMemo(() => getMomSalesForYear(momYear), [momYear]);
  const yoyData = YOY_THREE_YEAR_WINDOWS[yoyWindowIndex]?.data ?? YOY_THREE_YEAR_WINDOWS[0].data;
  const qoqData = useMemo(() => getQoqSalesForYear(qoqYear), [qoqYear]);
  const yoyOption = YOY_THREE_YEAR_WINDOWS[yoyWindowIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <DashboardChartCard
        title="Month-over-Month (MoM) Sales"
        description="Monthly revenue trend for the selected year."
        className="xl:col-span-2 lg:col-span-2"
      >
        <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
          <label htmlFor="mom-year" className="text-xs font-medium text-slate-600">
            Year
          </label>
          <select
            id="mom-year"
            value={momYear}
            onChange={(e) => setMomYear(Number(e.target.value) as DashboardAnalyticsYear)}
            className={dashboardFilterSelectClass}
          >
            {DASHBOARD_ANALYTICS_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={momData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 10, fill: "#64748b" }}
                angle={-35}
                textAnchor="end"
                height={56}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(v as number)
                }
              />
              <Tooltip content={<MomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#002f93"
                strokeWidth={2}
                dot={{ r: 2, fill: "#002f93" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardChartCard>

      <DashboardChartCard
        title="Year-over-Year (YoY) Sales"
        description="Compare three consecutive years in one view."
      >
        <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
          <label htmlFor="yoy-window" className="text-xs font-medium text-slate-600">
            Period
          </label>
          <select
            id="yoy-window"
            value={yoyWindowIndex}
            onChange={(e) => setYoyWindowIndex(Number(e.target.value))}
            className={`${dashboardFilterSelectClass} min-w-[220px]`}
          >
            {YOY_THREE_YEAR_WINDOWS.map((opt, idx) => (
              <option key={opt.key} value={idx}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-slate-400 mb-2 truncate" title={yoyOption?.label}>
          {yoyOption?.label}
        </p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yoyData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(v as number)
                }
              />
              <Tooltip content={<MomTooltip />} />
              <Bar dataKey="revenue" fill="#002f93" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardChartCard>

      <DashboardChartCard
        title="Quarter-over-Quarter (QoQ) Sales"
        description="Quarterly revenue for the selected year."
        className="xl:col-span-3 lg:col-span-2"
      >
        <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
          <label htmlFor="qoq-year" className="text-xs font-medium text-slate-600">
            Year
          </label>
          <select
            id="qoq-year"
            value={qoqYear}
            onChange={(e) => setQoqYear(Number(e.target.value) as DashboardAnalyticsYear)}
            className={dashboardFilterSelectClass}
          >
            {DASHBOARD_ANALYTICS_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="h-[260px] w-full max-w-3xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qoqData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(v as number)
                }
              />
              <Tooltip content={<MomTooltip />} />
              <Bar dataKey="revenue" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardChartCard>
    </div>
  );
}
