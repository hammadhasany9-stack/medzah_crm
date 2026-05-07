import { Inbox } from "lucide-react";
import type { SalesInboxItem } from "@/lib/mock-data/sales-inbox";
import { InboxItemCard } from "./InboxItemCard";
import { SALES_INBOX_BOARD_VERTICAL_SLACK_PX, SALES_INBOX_HEADER_STACK_PX } from "./sales-inbox-layout";

interface InboxColumnProps {
  label: string;
  items: SalesInboxItem[];
}

/** Scrollable column height: sticky shell header stack + outer padding slack */
function columnScrollMaxHeight() {
  return `calc(100vh - ${SALES_INBOX_HEADER_STACK_PX + SALES_INBOX_BOARD_VERTICAL_SLACK_PX}px)`;
}

export function InboxColumn({ label, items }: InboxColumnProps) {
  return (
    <div
      className="flex-shrink-0 w-[min(100%,320px)] sm:w-[300px] flex flex-col rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <div className="px-3.5 py-3 border-b border-slate-200 bg-white/90 flex-shrink-0">
        <h3 className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">{label}</h3>
      </div>
      <div
        className="flex-1 p-2.5 space-y-2 overflow-y-auto min-h-[200px]"
        style={{ maxHeight: columnScrollMaxHeight() }}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <Inbox size={22} className="text-slate-200" />
            <p className="text-[11px] text-slate-400 px-2">Nothing here with the current filters.</p>
          </div>
        ) : (
          items.map((item) => <InboxItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
