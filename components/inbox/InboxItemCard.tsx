import { TenantLink } from "@/components/providers/TenantLink";
import { cn } from "@/lib/utils";
import type { SalesInboxItem } from "@/lib/mock-data/sales-inbox";

interface InboxItemCardProps {
  item: SalesInboxItem;
}

export function InboxItemCard({ item }: InboxItemCardProps) {
  const inner = (
    <div className="flex gap-3 items-start">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-slate-900 leading-snug truncate">{item.title}</p>
          <span className="flex-shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">{item.timeLabel}</span>
        </div>
        <p className="text-[12px] text-slate-500 leading-snug line-clamp-2">{item.subtitle}</p>
      </div>
      {item.initials ? (
        <span
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full bg-[#002f93]/12 text-[#002f93]",
            "text-[10px] font-bold flex items-center justify-center uppercase border border-[#002f93]/25"
          )}
          aria-hidden
        >
          {item.initials}
        </span>
      ) : (
        <span
          className="flex-shrink-0 w-2.5 h-2.5 mt-2 rounded-full bg-emerald-500/90"
          title="Unread"
          aria-hidden
        />
      )}
    </div>
  );

  const className =
    "block rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-slate-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] transition-shadow";

  if (item.leadId) {
    return (
      <TenantLink href={`/leads/${item.leadId}`} className={cn(className, "text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002f93] focus-visible:ring-offset-2")}>
        {inner}
      </TenantLink>
    );
  }

  return <div className={className}>{inner}</div>;
}
