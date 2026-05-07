"use client";

import { Clock, XCircle, CheckCircle2 } from "lucide-react";
import { QUOTE_STATUS_LABEL_APPROVED_ADJ } from "@/lib/quotes-display";

export function QuoteStatusBadge({ label }: { label: string }) {
  if (label === "Pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={10} className="flex-shrink-0" />
        Pending
      </span>
    );
  }
  if (label === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-red-50 text-red-700 border border-red-200">
        <XCircle size={10} className="flex-shrink-0" />
        Rejected
      </span>
    );
  }
  if (label === QUOTE_STATUS_LABEL_APPROVED_ADJ) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-teal-50 text-teal-800 border border-teal-200">
        <CheckCircle2 size={10} className="flex-shrink-0" />
        Approved w/ adj.
      </span>
    );
  }
  if (label === "Approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={10} className="flex-shrink-0" />
        Approved
      </span>
    );
  }
  return <span className="text-[11px] text-slate-400">—</span>;
}
