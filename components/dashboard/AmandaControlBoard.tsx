"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { TooltipProps } from "recharts";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Package,
  Search,
  User,
  X,
} from "lucide-react";
import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { formatDashboardCurrency } from "@/lib/mock-data/sales-dashboard-data";
import {
  AMANDA_DEMO_AS_OF,
  AUTOMATION_RULES,
  CONTRACT_TRACKING,
  DEAD_CUSTOMERS,
  type ContractLifecycleStatus,
  type CustomerStatus,
  type TierChartPoint,
  daysUntilEndFromDemoAnchor,
  getTierChartData,
  RENEWAL_ALERTS,
  SPOTLIGHT_CUSTOMERS,
  TIER_BUYING_PATTERN_NOTES,
  TIER_PRICING_ROWS,
  formatRevenueHistoryLine,
  formatVolumeBand,
} from "@/lib/mock-data/amanda-dashboard-data";
import { cn } from "@/lib/utils";

function customerStatusBadgeClass(s: CustomerStatus): string {
  switch (s) {
    case "active":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    case "new":
      return "bg-blue-50 border-blue-200 text-blue-800";
    default:
      return "bg-slate-100 border-slate-200 text-slate-600";
  }
}

function contractLifecycleBadgeClass(s: ContractLifecycleStatus): string {
  switch (s) {
    case "active":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    case "expiring":
      return "bg-amber-50 border-amber-200 text-amber-800";
    default:
      return "bg-rose-50 border-rose-200 text-rose-800";
  }
}

function customerStatusLabel(s: CustomerStatus): string {
  switch (s) {
    case "active":
      return "Active";
    case "new":
      return "New";
    default:
      return "Inactive";
  }
}

function contractLifecycleLabel(s: ContractLifecycleStatus): string {
  switch (s) {
    case "active":
      return "Active";
    case "expiring":
      return "Expiring";
    default:
      return "Expired";
  }
}

function monthsIdle(lastOrderIso: string): number {
  const last = new Date(`${lastOrderIso}T12:00:00`);
  const anchor = new Date(`${AMANDA_DEMO_AS_OF}T12:00:00`);
  const diffDays = Math.floor((anchor.getTime() - last.getTime()) / 86_400_000);
  return Math.max(0, Math.floor(diffDays / 30));
}

function TierTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as TierChartPoint | undefined;
  if (!row?.tier) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-800">{row.tier}</p>
      <p className="text-slate-600 tabular-nums">
        Volume band (midpoint): {Math.round(row.avgVolumeBand).toLocaleString()}
      </p>
      <p className="text-slate-600 tabular-nums">Unit price: ${row.unitPrice.toFixed(2)}</p>
      <p className="text-slate-600 tabular-nums">Margin: {row.marginPercent.toFixed(1)}%</p>
    </div>
  );
}

export function AmandaControlBoard() {
  const [deadExpanded, setDeadExpanded] = useState<string | null>(null);
  const [spotlightSearch, setSpotlightSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(SPOTLIGHT_CUSTOMERS[0]?.id ?? "");

  const tierChartData = useMemo(() => getTierChartData(), []);

  const filteredSpotlight = useMemo(() => {
    const q = spotlightSearch.toLowerCase().trim();
    if (!q) return SPOTLIGHT_CUSTOMERS;
    return SPOTLIGHT_CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q));
  }, [spotlightSearch]);

  const selectedCustomer =
    SPOTLIGHT_CUSTOMERS.find((c) => c.id === selectedCustomerId) ?? SPOTLIGHT_CUSTOMERS[0];

  useEffect(() => {
    if (filteredSpotlight.some((c) => c.id === selectedCustomerId)) return;
    const first = filteredSpotlight[0];
    if (first) setSelectedCustomerId(first.id);
  }, [filteredSpotlight, selectedCustomerId]);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      <header className="space-y-1">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Operations control board</h1>
        <p className="text-sm text-slate-500">
          Tier pricing, at-risk accounts, customer spotlight, and contract renewals — sample Medzah data
          for demo (as of {AMANDA_DEMO_AS_OF}) until CRM and ERP feeds are connected.
        </p>
      </header>

      <DashboardChartCard
        title="Tier pricing report"
        description="Volume bands vs list pricing and margin by tier. Use for pricing reviews and negotiation prep."
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Tier</th>
                  <th className="px-3 py-2">Volume</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {TIER_PRICING_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-slate-900">{row.tierLabel}</td>
                    <td className="px-3 py-2.5 text-slate-600">{formatVolumeBand(row)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-800">
                      ${row.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium text-[#002f93]">
                      {row.marginPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="min-h-[260px]">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2">
              Volume band vs unit price
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={tierChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tier" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  yAxisId="vol"
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  label={{
                    value: "Volume (units)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: "#64748b" },
                  }}
                />
                <YAxis
                  yAxisId="price"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  domain={["dataMin - 2", "dataMax + 4"]}
                  label={{
                    value: "Price ($)",
                    angle: 90,
                    position: "insideRight",
                    style: { fontSize: 10, fill: "#64748b" },
                  }}
                />
                <Tooltip content={<TierTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="vol"
                  dataKey="avgVolumeBand"
                  name="Volume band"
                  fill="#002f93"
                  radius={[4, 4, 0, 0]}
                  opacity={0.85}
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="unitPrice"
                  name="Unit price"
                  stroke="#475569"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#475569" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Customer buying patterns
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600 leading-snug list-disc list-inside">
            {TIER_BUYING_PATTERN_NOTES.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      </DashboardChartCard>

      <DashboardChartCard
        title="Dead customer report"
        description="No purchases in 6+ months (mock criteria). For reactivation campaigns and sales follow-ups."
      >
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 w-8" aria-label="Expand" />
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Last order</th>
                <th className="px-3 py-2 text-right">Months idle</th>
              </tr>
            </thead>
            <tbody>
              {DEAD_CUSTOMERS.map((row) => {
                const open = deadExpanded === row.id;
                return (
                  <Fragment key={row.id}>
                    <tr className="border-b border-slate-100 bg-white">
                      <td className="px-1 py-2 align-middle">
                        <button
                          type="button"
                          onClick={() => setDeadExpanded(open ? null : row.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                          aria-expanded={open}
                        >
                          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900">{row.customerName}</td>
                      <td className="px-3 py-2.5 text-slate-600 tabular-nums">{row.lastOrderDate}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-800">
                        {monthsIdle(row.lastOrderDate)}
                      </td>
                    </tr>
                    {open ? (
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <td colSpan={4} className="px-3 py-3 text-xs text-slate-600">
                          <p className="font-semibold text-slate-700 mb-1.5">Revenue history</p>
                          <ul className="space-y-1">
                            {row.revenueHistory.map((pt, j) => (
                              <li key={j} className="tabular-nums">
                                {formatRevenueHistoryLine(pt)}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashboardChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <DashboardChartCard
          title="Customer spotlight"
          description="Select a customer to view status, products, pricing, and contract health."
          className="lg:col-span-2"
        >
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search customers…"
              value={spotlightSearch}
              onChange={(e) => setSpotlightSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002f93]/30"
            />
            {spotlightSearch ? (
              <button
                type="button"
                onClick={() => setSpotlightSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            ) : null}
          </div>
          <ul className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
            {filteredSpotlight.map((c) => {
              const sel = c.id === selectedCustomerId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                      sel
                        ? "border-[#002f93]/40 bg-[rgba(0,47,147,0.06)] text-slate-900"
                        : "border-transparent hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <span className="font-semibold">{c.name}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Last order {c.lastOrderDate}
                    </span>
                  </button>
                </li>
              );
            })}
            {filteredSpotlight.length === 0 ? (
              <p className="text-sm text-slate-500 px-3 py-4">No customers match your search.</p>
            ) : null}
          </ul>
        </DashboardChartCard>

        <DashboardChartCard title="Customer detail" className="lg:col-span-3">
          {selectedCustomer ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start gap-2 justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer</p>
                  <p className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <Building2 size={18} className="text-slate-400 flex-shrink-0" />
                    {selectedCustomer.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold",
                      customerStatusBadgeClass(selectedCustomer.status)
                    )}
                  >
                    {customerStatusLabel(selectedCustomer.status)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold",
                      contractLifecycleBadgeClass(selectedCustomer.contractStatus)
                    )}
                  >
                    Contract: {contractLifecycleLabel(selectedCustomer.contractStatus)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package size={13} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Products purchased
                    </p>
                    <ul className="text-sm font-semibold text-slate-800 mt-0.5 space-y-0.5 list-disc list-inside">
                      {selectedCustomer.products.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText size={13} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pricing agreement
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">
                      {selectedCustomer.pricingAgreement}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar size={13} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Last order date
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 tabular-nums">
                      {selectedCustomer.lastOrderDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={13} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Revenue (YTD)
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 tabular-nums">
                      {formatDashboardCurrency(selectedCustomer.revenueYtd, true)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a customer from the list.</p>
          )}
        </DashboardChartCard>
      </div>

      <DashboardChartCard
        title="Contract tracking"
        description="Master agreement dates and renewal targets. Rows highlighted when end date is within 30 days (from demo anchor date)."
      >
        <div className="overflow-x-auto rounded-lg border border-slate-100 mb-5">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Start</th>
                <th className="px-3 py-2">End</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2">Renewal date</th>
                <th className="px-3 py-2 text-right">Days to end</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACT_TRACKING.map((row) => {
                const daysLeft = daysUntilEndFromDemoAnchor(row.endDate);
                const expiringSoon = daysLeft <= 30 && daysLeft >= 0;
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-slate-100 last:border-0",
                      expiringSoon ? "bg-amber-50/80" : "bg-white"
                    )}
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-900">{row.customerName}</td>
                    <td className="px-3 py-2.5 text-slate-600 tabular-nums">{row.startDate}</td>
                    <td className="px-3 py-2.5 text-slate-600 tabular-nums">{row.endDate}</td>
                    <td className="px-3 py-2.5 text-slate-700 max-w-[240px]">{row.agreedPricing}</td>
                    <td className="px-3 py-2.5 text-slate-600 tabular-nums">{row.renewalDate}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      <span
                        className={cn(
                          "font-semibold",
                          expiringSoon ? "text-amber-900" : "text-slate-800"
                        )}
                      >
                        {daysLeft}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800 mb-1">Renewal automation (demo)</p>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 mb-4">
            {AUTOMATION_RULES.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Contracts in 30-day alert window
          </p>
          <ul className="space-y-2">
            {RENEWAL_ALERTS.map((r) => (
              <li
                key={r.contractId}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.customerName}</p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    Ends {r.endDate} · {r.daysUntilEnd} days remaining
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-200">
                    Alert window
                  </span>
                  <button
                    type="button"
                    disabled
                    title="Workflow integration coming soon"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed"
                  >
                    Start renewal workflow
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DashboardChartCard>
    </div>
  );
}
