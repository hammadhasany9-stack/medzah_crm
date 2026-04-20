"use client";

import { useState } from "react";
import {
  Calendar, DollarSign, Clock, XCircle,
  CheckCircle2, Eye, PackageSearch, FilePenLine,
} from "lucide-react";
import { Opportunity } from "@/lib/types";
import { useCRMShell } from "@/components/shell/CRMShellContext";
import { canDownloadAllocationExport } from "@/lib/export-allocation-xlsx";
import { DownloadAllocationButton } from "@/components/allocations/DownloadAllocationButton";
import { ViewQuoteModal } from "./ViewQuoteModal";
import { ViewAllocationModal } from "@/components/leads/ViewAllocationModal";

function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap bg-white text-slate-700 border border-blue-200">
      URGENCY: {urgency.toUpperCase()}
    </span>
  );
}

function AllocationBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap bg-emerald-100 text-emerald-700">
      <CheckCircle2 size={11} className="flex-shrink-0" />
      Allocation Approved
    </span>
  );
}

function QuoteRevisedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap bg-sky-100 text-sky-800 border border-sky-200/80">
      <FilePenLine size={11} className="flex-shrink-0" />
      Quote revised
    </span>
  );
}

function formatDueLabel(isoDate: string): { label: string; urgent: boolean; soon: boolean } {
  const due = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return { label: "Overdue",              urgent: true,  soon: false };
  if (diffDays === 0) return { label: "Due Today",            urgent: true,  soon: false };
  if (diffDays === 1) return { label: "Due Tomorrow",         urgent: false, soon: true  };
  if (diffDays <= 3)  return { label: `Due in ${diffDays}d`,  urgent: false, soon: true  };
  const m = due.toLocaleString("default", { month: "short" });
  return { label: `Due ${m} ${due.getDate()}`, urgent: false, soon: false };
}

function NextActionIndicator({ followUpDate }: { followUpDate?: string }) {
  if (!followUpDate) {
    return <span className="text-[11px] text-slate-300 whitespace-nowrap flex-shrink-0">No action set</span>;
  }
  const { label, urgent, soon } = formatDueLabel(followUpDate);
  const dotCls  = urgent ? "bg-red-500"   : soon ? "bg-amber-500"  : "bg-[#002f93]";
  const textCls = urgent ? "text-red-500" : soon ? "text-amber-600" : "text-[#002f93]";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap flex-shrink-0 ${textCls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotCls}`} />
      {label}
    </span>
  );
}

function ValidDateDisplay({ validDate }: { validDate: string }) {
  if (!validDate) return null;
  const [y, m, d] = validDate.split("T")[0].split("-");
  const display = `${m}/${d}/${y} ; 21:00`;
  const date = new Date(validDate);
  const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays <= 7;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${isUrgent ? "text-red-500" : "text-slate-500"}`}>
      <Calendar size={12} className="flex-shrink-0" />
      {display}
    </span>
  );
}

interface QuoteCardProps {
  opportunity: Opportunity;
  onClick: (opp: Opportunity) => void;
}

export function QuoteCard({ opportunity, onClick }: QuoteCardProps) {
  const { allocations } = useCRMShell();
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);

  const { quoteData, quoteStatus, procurementAllocation: allocationData } = opportunity;
  if (!quoteData) return null;

  // Find the full allocation record
  const allocationRecord = opportunity.allocationId
    ? allocations.find((a) => a.id === opportunity.allocationId) ?? null
    : null;

  const isPending  = quoteStatus === "pending";
  const isRejected = quoteStatus === "rejected";
  const isApproved = quoteStatus === "approved";
  const showQuoteRevised = isPending && !!opportunity.quoteRevised;

  const stripClass = showQuoteRevised
    ? "bg-sky-400"
    : isPending
    ? "bg-amber-400"
    : isRejected
    ? "bg-red-400"
    : isApproved
    ? "bg-emerald-400"
    : "bg-slate-200";

  const borderClass = showQuoteRevised
    ? "border-slate-200 ring-1 ring-sky-200"
    : isPending
    ? "border-slate-200 ring-1 ring-amber-200"
    : isRejected
    ? "border-slate-200 ring-1 ring-red-200"
    : isApproved
    ? "border-slate-200 ring-1 ring-emerald-200"
    : "border-slate-200";

  return (
    <>
      <div
        onClick={() => onClick(opportunity)}
        className={`bg-white rounded-2xl border cursor-pointer flex overflow-hidden
          shadow-[0_1px_4px_rgba(0,0,0,0.06)]
          hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5
          transition-all duration-200 ${borderClass}`}
      >
        {/* Left sideline strip */}
        <div className={`w-[3.5px] flex-shrink-0 rounded-l-2xl ${stripClass}`} />

        {/* Card body */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Status banner */}
          {isPending && (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 border-b border-amber-100">
              <Clock size={11} className="text-amber-500 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide">Pending Approval</span>
            </div>
          )}
          {isRejected && (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 border-b border-red-100">
              <XCircle size={11} className="text-red-500 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">Quote Rejected</span>
            </div>
          )}
          {isApproved && (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 border-b border-emerald-100">
              <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">Quote Approved</span>
            </div>
          )}

          {/* Content */}
          <div className="px-4 pt-3.5 pb-3 space-y-2.5 flex-1">

            {/* Badge row */}
            <div className="flex items-center gap-2 flex-wrap">
              <UrgencyBadge urgency={quoteData.urgency} />
              {showQuoteRevised && <QuoteRevisedBadge />}
              {(allocationData || allocationRecord) && <AllocationBadge />}
            </div>

            {/* Title + Quote ID */}
            <div className="space-y-1">
              <h3 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2">
                {opportunity.opportunityName}
              </h3>
              {quoteData.quoteId && (
                <p className="text-[11px] font-mono font-semibold text-[#002f93]">
                  Quote ID: {quoteData.quoteId}
                </p>
              )}
            </div>

            {/* Valid date */}
            <ValidDateDisplay validDate={quoteData.validDate} />

            {/* Grand total */}
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
              <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
              {quoteData.grandTotal}
            </div>

            {/* Contact + company */}
            <div>
              <p className="text-[13px] font-semibold text-slate-800 truncate">{quoteData.contactName}</p>
              <p className="text-[12px] text-slate-500 mt-0.5 truncate">{opportunity.companyName}</p>
            </div>

            {/* Quote meta */}
            <div className="text-[12px] text-slate-500 space-y-0.5">
              <p>{quoteData.businessType}</p>
              <p>SKUs/Quantity: {quoteData.items.length}</p>
              <p>Shipping method: {quoteData.shippingMethod}</p>
            </div>

            {/* Rejection reason */}
            {isRejected && opportunity.quoteRejectionReason && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-red-400 mb-0.5">Rejection Reason</p>
                <p className="text-[11px] text-red-700 leading-relaxed line-clamp-2">{opportunity.quoteRejectionReason}</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mx-4" />

          {/* Bottom row */}
          <div className="px-4 py-3 flex items-start justify-between gap-2 min-w-0">
            <div className="flex flex-col min-w-0 overflow-hidden">
              <p className="text-[12px] font-semibold text-slate-700 truncate leading-snug">{opportunity.assignedTo}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{opportunity.opportunityRef}</p>
            </div>
            <NextActionIndicator followUpDate={quoteData.followUpDate} />
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-3.5 flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowQuoteModal(true); }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
            >
              <Eye size={12} />
              View Quote
            </button>
            {(allocationData || allocationRecord) && (
              <div className="flex flex-wrap gap-2">
                {allocationRecord && canDownloadAllocationExport(allocationRecord.status) && (
                  <DownloadAllocationButton
                    record={allocationRecord}
                    stopPropagation
                    size="sm"
                    className="flex-1 min-w-[140px] justify-center"
                  />
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowAllocModal(true); }}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg border border-[#002f93]/20 text-[#002f93] hover:bg-[#002f93]/5 transition-colors"
                >
                  <PackageSearch size={12} />
                  View Allocation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Quote Modal */}
      {showQuoteModal && (
        <ViewQuoteModal
          opportunity={opportunity}
          onClose={() => setShowQuoteModal(false)}
        />
      )}

      {/* View Allocation Modal */}
      {showAllocModal && allocationRecord && (
        <ViewAllocationModal
          allocation={allocationRecord}
          onClose={() => setShowAllocModal(false)}
        />
      )}
    </>
  );
}
