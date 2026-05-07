"use client";

import { ProductAndAccountSection } from "@/components/dashboard/sections/ProductAndAccountSection";
import { RepsPipelineSection } from "@/components/dashboard/sections/RepsPipelineSection";
import { TrendChartsSection } from "@/components/dashboard/sections/TrendChartsSection";
import { YtdTargetSection } from "@/components/dashboard/sections/YtdTargetSection";

export function SalesPerformanceDashboard() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      <header className="space-y-1">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Sales performance</h1>
        <p className="text-sm text-slate-500">
          KPIs below use hard-coded Medzah sample data until CRM and Fishbowl feeds are wired in.
        </p>
      </header>

      <YtdTargetSection />

      <TrendChartsSection />

      <ProductAndAccountSection />

      <RepsPipelineSection />
    </div>
  );
}
