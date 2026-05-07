import type { ReactNode } from "react";

/** Shared Tailwind classes for dashboard filter `<select>`s */
export const dashboardFilterSelectClass =
  "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#002f93]/25 focus:border-[#002f93] min-w-[120px]";

interface DashboardChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardChartCard({
  title,
  description,
  children,
  className = "",
}: DashboardChartCardProps) {
  return (
    <section
      className={`bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col ${className}`}
    >
      <div className="mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {description ? (
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
        ) : null}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}
