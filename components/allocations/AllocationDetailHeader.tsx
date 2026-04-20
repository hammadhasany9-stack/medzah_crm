"use client";

import Link from "next/link";
import { ChevronLeft, CheckCircle2, GitMerge, Clock, Package } from "lucide-react";
import { AllocationRecord, AllocationRecordStatus, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { canDownloadAllocationExport } from "@/lib/export-allocation-xlsx";
import { DownloadAllocationButton } from "@/components/allocations/DownloadAllocationButton";

const priorityStyles: Record<Priority, { bg: string; text: string; emoji: string }> = {
  Hot:  { bg: "bg-orange-100", text: "text-orange-600", emoji: "🔥" },
  Warm: { bg: "bg-amber-100",  text: "text-amber-600",  emoji: "☀️" },
  Cold: { bg: "bg-sky-100",    text: "text-sky-600",    emoji: "❄️" },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const s = priorityStyles[priority];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap", s.bg, s.text)}>
      <span className="text-[13px] leading-none">{s.emoji}</span>
      {priority.toUpperCase()}
    </span>
  );
}

function StatusBanner({ status, onHoldTime, unavailableCount }: {
  status: AllocationRecordStatus;
  onHoldTime?: string;
  unavailableCount: number;
}) {
  if (status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} />
        Approved
      </span>
    );
  }
  if (status === "Partially Approved") {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
          <GitMerge size={12} />
          Partially Approved
        </span>
        {unavailableCount > 0 && (
          <span className="text-[11px] font-semibold text-amber-600">
            {unavailableCount} unavailable
          </span>
        )}
      </div>
    );
  }
  if (status === "On Hold") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600 border border-red-200">
          <Clock size={12} />
          On Hold
        </span>
        {onHoldTime && (
          <span className="text-[11px] font-semibold text-slate-500">ETA: {onHoldTime}</span>
        )}
        {unavailableCount > 0 && (
          <span className="text-[11px] font-semibold text-red-500">
            {unavailableCount} unavailable
          </span>
        )}
      </div>
    );
  }
  return null;
}

interface AllocationDetailHeaderProps {
  record: AllocationRecord;
  /** Optional snapshot for spreadsheet export (e.g. local product edits on the detail page) */
  exportRecord?: AllocationRecord;
  unavailableCount: number;
  onApprove: () => void;
  onPartiallyApprove: () => void;
  onHold: () => void;
}

export function AllocationDetailHeader({
  record,
  exportRecord,
  unavailableCount,
  onApprove,
  onPartiallyApprove,
  onHold,
}: AllocationDetailHeaderProps) {
  const isActionable = record.status === "Pending";
  const downloadSource = exportRecord ?? record;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5">
      {/* Back nav */}
      <Link
        href="/allocation"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-[#002f93] mb-4 transition-colors"
      >
        <ChevronLeft size={14} />
        Back to Allocations
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

        {/* Left: meta */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#002f93]/10 flex items-center justify-center flex-shrink-0">
            <Package size={20} className="text-[#002f93]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-slate-900">{record.contactName}</h1>
              <PriorityBadge priority={record.leadPriority} />
              <span className="text-xs font-semibold text-slate-400">{record.allocationRef}</span>
            </div>
            <p className="text-sm font-semibold text-slate-600">{record.companyName}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-slate-400">Source: <span className="font-semibold text-slate-600">{record.leadSource}</span></span>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400">Created: <span className="font-semibold text-slate-600">{record.createdDate}</span></span>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400">Owner: <span className="font-semibold text-slate-600">{record.ownerName}</span></span>
            </div>
          </div>
        </div>

        {/* Right: actions or status banner */}
        <div className="flex items-center gap-2 flex-wrap">
          {canDownloadAllocationExport(record.status) && (
            <DownloadAllocationButton record={downloadSource} size="md" />
          )}
          {!isActionable ? (
            <StatusBanner
              status={record.status}
              onHoldTime={record.onHoldFulfillmentTime}
              unavailableCount={unavailableCount}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 size={15} />
                Approve
              </button>
              <button
                type="button"
                onClick={onPartiallyApprove}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <GitMerge size={15} />
                Partially Approve
              </button>
              <button
                type="button"
                onClick={onHold}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Clock size={15} />
                On Hold
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
