"use client";

import {
  X, Trash2,
  Calendar, DollarSign, Clock, CheckCircle2,
  XCircle, FilePlus, FilePenLine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Opportunity, QuoteStatus } from "@/lib/types";

// ─── Shared badge components ──────────────────────────────────────────────────

function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-600 bg-white border border-slate-300 whitespace-nowrap">
      URGENCY: {urgency.toUpperCase()}
    </span>
  );
}

function AllocationBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircle2 size={10} className="flex-shrink-0" />
      Allocation Approved
    </span>
  );
}

function QuoteRevisedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-sky-100 text-sky-800 border border-sky-200">
      <FilePenLine size={10} className="flex-shrink-0" />
      Quote revised
    </span>
  );
}

// ─── Activity timeline — same pattern as OpportunityDetailPanel ───────────────

const activityDotColor: Record<string, string> = {
  email: "bg-[#002f93]", call: "bg-emerald-500", note: "bg-amber-400", created: "bg-violet-500",
};

// ─── Detail cell — same as OpportunityDetailPanel's DetailCell ────────────────

function DetailCell({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value || "—"}</p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuoteSidePanelProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onApprove: (opp: Opportunity) => void;
  onAdjust: (opp: Opportunity) => void;
  onReject: (opp: Opportunity) => void;
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function QuoteSidePanel({
  opportunity,
  onClose,
  onApprove,
  onAdjust,
  onReject,
}: QuoteSidePanelProps) {
  const router = useRouter();
  const isOpen = !!opportunity;
  const quoteData = opportunity?.quoteData;

  const isPending  = opportunity?.quoteStatus === "pending";
  const isApproved = opportunity?.quoteStatus === "approved";
  const isRejected = opportunity?.quoteStatus === "rejected";
  const showQuoteRevised = !!(isPending && opportunity?.quoteRevised);

  // Format valid date
  const validDisplay = (() => {
    if (!quoteData?.validDate) return "—";
    const [y, m, d] = quoteData.validDate.split("T")[0].split("-");
    return `${m}/${d}/${y} ; 21:00`;
  })();

  return (
    <>
      {/* Backdrop — same as OpportunityDetailPanel */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 h-full w-[340px] bg-white z-50 flex flex-col
          shadow-[-20px_0_60px_rgba(0,0,0,0.15)]
          transition-transform duration-300 ease-out
          ${showQuoteRevised ? "border-l-[3.5px] border-l-sky-400" : ""}
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {!opportunity || !quoteData ? null : (
          <>
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-5 pt-5 pb-4 space-y-4">

              {/* Icon row */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <UrgencyBadge urgency={quoteData.urgency} />
                {showQuoteRevised && <QuoteRevisedBadge />}
                <AllocationBadge />
              </div>

              {/* Title */}
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {opportunity.opportunityName}
              </h2>

              {/* Avatar + contact */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.6" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-900 truncate">{quoteData.contactName}</p>
                  <p className="text-sm text-slate-500 truncate">{quoteData.accountName}</p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/quotes/${opportunity.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
                >
                  View Quote
                </button>
                {opportunity.procurementAllocation && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg border border-[#002f93]/20 text-[#002f93] hover:bg-[#002f93]/5 transition-colors">
                    View Allocation
                  </button>
                )}
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto">

              {/* Valid date + Grand total */}
              <section className="px-5 py-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Valid till Date</p>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-500">
                      <Calendar size={13} className="flex-shrink-0" />
                      {validDisplay}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Grand Total</p>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                      <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
                      {quoteData.grandTotal}
                    </span>
                  </div>
                </div>
              </section>

              {/* Quote status */}
              <section className="px-5 py-4 border-t border-slate-100 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Quote Status</p>
                {isPending && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                    <Clock size={14} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] font-bold text-amber-700">Pending Approval</p>
                      <p className="text-[11px] text-amber-600 mt-0.5">Quote is awaiting review.</p>
                    </div>
                  </div>
                )}
                {isApproved && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] font-bold text-emerald-700">Approved</p>
                      <p className="text-[11px] text-emerald-600 mt-0.5">Quote has been approved.</p>
                    </div>
                  </div>
                )}
                {isRejected && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                      <XCircle size={14} className="text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-[12px] font-bold text-red-700">Rejected</p>
                        {opportunity.quoteRejectionReason && (
                          <p className="text-[11px] text-red-600 mt-0.5 leading-snug">{opportunity.quoteRejectionReason}</p>
                        )}
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors">
                      <FilePlus size={12} />
                      Create New Quote
                    </button>
                  </div>
                )}
              </section>

              {/* Quote details grid */}
              <section className="px-5 py-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Quote Details</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <DetailCell label="Quote Owner"           value={quoteData.opportunityOwner} />
                  <DetailCell label="Quote ID"              value={quoteData.quoteId} />
                  <DetailCell label="Subject"               value={quoteData.subject} />
                  <DetailCell label="Opportunity Name"      value={quoteData.opportunityName} />
                  <DetailCell label="Quote Stage"           value={quoteData.quoteStage} />
                  <DetailCell label="Contact Name"          value={quoteData.contactName} />
                  <DetailCell label="Account Name"          value={quoteData.accountName} />
                  <DetailCell label="Order Submittal Method" value={quoteData.orderSubmittalMethod} />
                  <DetailCell label="Business Type"         value={quoteData.businessType} />
                  <DetailCell label="Spread Sheet"          value={quoteData.spreadSheet || "—"} />
                  <DetailCell label="Shipping Method"       value={quoteData.shippingMethod} />
                  <DetailCell label="Customer PO"           value={quoteData.customerPO || "—"} />
                </div>
                {(quoteData.modifiedBy || quoteData.modifiedAt) && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Modified By</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {quoteData.modifiedBy}
                      {quoteData.modifiedAt && (
                        <span className="font-normal text-slate-500 ml-1">{quoteData.modifiedAt}</span>
                      )}
                    </p>
                  </div>
                )}
              </section>

              {/* Note */}
              {opportunity.note && (
                <section className="px-5 py-4 border-t border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Note</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{opportunity.note}</p>
                </section>
              )}

              {/* Activity History */}
              {opportunity.activities && opportunity.activities.length > 0 && (
                <section className="px-5 py-4 border-t border-slate-100 pb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Activity History</p>
                  <div>
                    {opportunity.activities.map((event, idx) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center pt-0.5">
                          {idx === 0
                            ? <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${activityDotColor[event.type] ?? "bg-slate-400"}`} />
                            : <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-slate-300 bg-white" />
                          }
                          {idx < opportunity.activities.length - 1 && (
                            <div className="w-px flex-1 bg-slate-200 my-1" />
                          )}
                        </div>
                        <div className="pb-5 flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 leading-snug">{event.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mt-1">{event.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── Bottom action bar ── */}
            <div className="flex-shrink-0 border-t border-slate-100 px-5 py-3 flex gap-2 bg-white">
              <button
                onClick={() => onApprove(opportunity)}
                disabled={isApproved}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={12} />
                Approve
              </button>
              <button
                onClick={() => onAdjust(opportunity)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Adjust
              </button>
              <button
                onClick={() => onReject(opportunity)}
                disabled={isRejected}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XCircle size={12} />
                Reject
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
