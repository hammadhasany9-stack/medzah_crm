"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardChartCard, dashboardFilterSelectClass } from "@/components/dashboard/DashboardChartCard";
import {
  DEFAULT_PIPELINE_MONTH,
  DEFAULT_PIPELINE_YEAR,
  formatDashboardCurrency,
  formatDashboardPercent,
  getLeaderboardRepsForPeriod,
  getPipelineForPeriod,
  PIPELINE_PERIOD_OPTIONS,
  pipelineSnapshotKey,
  repQuotaDerived,
  SALES_REP_TRACKING_YEARS,
  SALES_REPS_BY_YEAR,
  DASHBOARD_MONTH_NUMBERS,
  type SalesRepTrackingYear,
} from "@/lib/mock-data/sales-dashboard-data";

function PipelineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: {
    dataKey?: string;
    name?: string;
    value?: number;
  }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const val = Number(row.value);
  const isCount = row.dataKey === "dealCount";
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-slate-600">
        {row.name ?? "Value"}: {isCount ? new Intl.NumberFormat("en-US").format(val) : formatDashboardCurrency(val)}
      </p>
    </div>
  );
}

export function RepsPipelineSection() {
  const [repTrackingYear, setRepTrackingYear] = useState<SalesRepTrackingYear>(2026);

  const [leaderboardYear, setLeaderboardYear] = useState<SalesRepTrackingYear>(2026);
  const [leaderboardMonth, setLeaderboardMonth] = useState(3);

  const [pipelineYear, setPipelineYear] = useState(DEFAULT_PIPELINE_YEAR);
  const [pipelineMonth, setPipelineMonth] = useState(DEFAULT_PIPELINE_MONTH);

  const pipelineYearsAvailable = useMemo(() => {
    const ys = [...new Set(PIPELINE_PERIOD_OPTIONS.map((p) => p.year))];
    ys.sort((a, b) => a - b);
    return ys;
  }, []);

  const pipelineMonthsForYear = useMemo(
    () => PIPELINE_PERIOD_OPTIONS.filter((p) => p.year === pipelineYear),
    [pipelineYear]
  );

  const pipelinePeriodValid = PIPELINE_PERIOD_OPTIONS.some(
    (p) => p.year === pipelineYear && p.month === pipelineMonth
  );

  useEffect(() => {
    if (!pipelinePeriodValid) {
      const first = PIPELINE_PERIOD_OPTIONS.find((p) => p.year === pipelineYear);
      if (first) setPipelineMonth(first.month);
    }
  }, [pipelineYear, pipelineMonth, pipelinePeriodValid]);

  const pipelineRows = useMemo(
    () => getPipelineForPeriod(pipelineYear, pipelineMonth),
    [pipelineYear, pipelineMonth]
  );

  const pipelinePeriodLabel = useMemo(() => {
    const opt = PIPELINE_PERIOD_OPTIONS.find(
      (p) => p.year === pipelineYear && p.month === pipelineMonth
    );
    return opt?.label ?? pipelineSnapshotKey(pipelineYear, pipelineMonth);
  }, [pipelineYear, pipelineMonth]);

  const sortedLeaderboard = useMemo(
    () =>
      [...getLeaderboardRepsForPeriod(leaderboardYear, leaderboardMonth)].sort(
        (a, b) => b.revenue - a.revenue
      ),
    [leaderboardYear, leaderboardMonth]
  );

  const sortedQuotaReps = useMemo(
    () => [...SALES_REPS_BY_YEAR[repTrackingYear]].sort((a, b) => b.revenue - a.revenue),
    [repTrackingYear]
  );

  const pipelineCountData = pipelineRows.map((r) => ({
    stage: r.stage,
    dealCount: r.dealCount,
  }));

  const pipelineValueData = pipelineRows.map((r) => ({
    stage: r.stage,
    pipelineValue: r.pipelineValue,
  }));

  function handlePipelineYearChange(year: number) {
    setPipelineYear(year);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <DashboardChartCard
        title="Sales Rep Leaderboard"
        description={`Period leaderboard (mock Fishbowl / CRM). Quota cards below use the calendar year filter.`}
        className="xl:col-span-3"
      >
        <div className="flex flex-wrap items-center justify-end gap-3 mb-3">
          <div className="flex items-center gap-2">
            <label htmlFor="lb-month" className="text-xs font-medium text-slate-600">
              Month
            </label>
            <select
              id="lb-month"
              value={leaderboardMonth}
              onChange={(e) => setLeaderboardMonth(Number(e.target.value))}
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
            <label htmlFor="lb-year" className="text-xs font-medium text-slate-600">
              Year
            </label>
            <select
              id="lb-year"
              value={leaderboardYear}
              onChange={(e) => setLeaderboardYear(Number(e.target.value) as SalesRepTrackingYear)}
              className={dashboardFilterSelectClass}
            >
              {SALES_REP_TRACKING_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="py-2 pr-3">Rep</th>
                <th className="py-2 pr-3 text-right">Revenue</th>
                <th className="py-2 pr-3 text-right">Margin %</th>
                <th className="py-2 pr-3 text-right">{leaderboardYear} quota</th>
                <th className="py-2 text-right">Quota attainment</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((rep) => {
                const { pctToQuota } = repQuotaDerived(rep.revenue, rep.annualQuota);
                return (
                  <tr key={rep.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-slate-800">{rep.name}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">
                      {formatDashboardCurrency(rep.revenue)}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-slate-600">
                      {formatDashboardPercent(rep.marginPercent)}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-slate-600">
                      {formatDashboardCurrency(rep.annualQuota)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#002f93] tabular-nums">
                        {formatDashboardPercent(pctToQuota)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashboardChartCard>

      <DashboardChartCard
        title="Quota tracking by rep"
        description="Annual quota view (revenue and attainment are for the full calendar year, mock)."
        className="xl:col-span-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <p className="text-xs text-slate-500">Choose reporting year for quota, accelerators, and new accounts.</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <label htmlFor="rep-tracking-year" className="text-xs font-medium text-slate-600">
              Year
            </label>
            <select
              id="rep-tracking-year"
              value={repTrackingYear}
              onChange={(e) => setRepTrackingYear(Number(e.target.value) as SalesRepTrackingYear)}
              className={dashboardFilterSelectClass}
            >
              {SALES_REP_TRACKING_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedQuotaReps.map((rep) => {
            const { pctToQuota, gapToTarget } = repQuotaDerived(rep.revenue, rep.annualQuota);
            const barW = Math.min(100, pctToQuota);

            return (
              <div
                key={rep.id}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{rep.name}</p>
                  <span className="text-xs font-medium text-slate-500">{repTrackingYear}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Revenue</span>
                    <p className="font-semibold text-slate-900 tabular-nums">
                      {formatDashboardCurrency(rep.revenue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Quota</span>
                    <p className="font-semibold text-slate-900 tabular-nums">
                      {formatDashboardCurrency(rep.annualQuota)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">% to quota</span>
                    <p className="font-semibold text-[#002f93] tabular-nums">
                      {formatDashboardPercent(pctToQuota)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Gap to target</span>
                    <p className="font-semibold text-slate-900 tabular-nums">
                      {formatDashboardCurrency(gapToTarget)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Accelerators earned</span>
                    <p className="font-semibold text-slate-900 tabular-nums">
                      {formatDashboardCurrency(rep.acceleratorsEarned)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">New accounts opened</span>
                    <p className="font-semibold text-slate-900 tabular-nums">{rep.newAccountsOpened}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Quota progress</span>
                    <span>{formatDashboardPercent(barW)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white border border-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#002f93]"
                      style={{ width: `${barW}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardChartCard>

      <DashboardChartCard
        title="Pipeline snapshot"
        description="Opportunity distribution by stage — deal count and total value."
        className="xl:col-span-3"
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="pipeline-month" className="text-xs font-medium text-slate-600">
              Month
            </label>
            <select
              id="pipeline-month"
              value={pipelineMonth}
              onChange={(e) => setPipelineMonth(Number(e.target.value))}
              className={dashboardFilterSelectClass}
            >
              {pipelineMonthsForYear.map((p) => (
                <option key={`${p.year}-${p.month}`} value={p.month}>
                  {new Date(p.year, p.month - 1, 1).toLocaleString("en-US", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="pipeline-year" className="text-xs font-medium text-slate-600">
              Year
            </label>
            <select
              id="pipeline-year"
              value={pipelineYear}
              onChange={(e) => handlePipelineYearChange(Number(e.target.value))}
              className={dashboardFilterSelectClass}
            >
              {pipelineYearsAvailable.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500 sm:ml-auto">Showing: {pipelinePeriodLabel}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Deals by stage</p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={pipelineCountData}
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={108}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <Tooltip content={<PipelineTooltip />} />
                  <Bar name="Deals" dataKey="dealCount" fill="#002f93" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Revenue value by stage</p>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={pipelineValueData}
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(v as number)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={108}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <Tooltip content={<PipelineTooltip />} />
                  <Bar
                    name="Pipeline $"
                    dataKey="pipelineValue"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </DashboardChartCard>
    </div>
  );
}
