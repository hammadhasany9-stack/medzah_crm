"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  X, Eye, Pencil, Trash2,
  Mail, Phone,
  PhoneCall, Globe, UserPlus, Building2, Link2, Megaphone, Users,
  Star, Zap, HelpCircle,
  Calendar, DollarSign, Clock, XCircle, FilePlus, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Opportunity, OpportunityStage, Priority, QuoteRecord, QuoteStatus } from "@/lib/types";
import { isAdvanceBlockedWithoutApprovedQuote } from "@/lib/opportunity-stage-guards";
import { QuoteApprovalRequiredDialog } from "@/components/opportunities/QuoteApprovalRequiredDialog";

// ─── Source badge ─────────────────────────────────────────────────────────────

const sourceIconMap: Record<string, LucideIcon> = {
  "Cold Call":             PhoneCall,
  "Cold Outreach":         PhoneCall,
  "Internal Referral":     UserPlus,
  "External Referral":     UserPlus,
  Referral:                UserPlus,
  "Chamber of Commerce":   Building2,
  Premier:                 Star,
  "Premier Activation":    Zap,
  Facebook:                Globe,
  LinkedIn:                Link2,
  "Trade Show":            Building2,
  Unaccounted:             HelpCircle,
  "Social Media":          Megaphone,
  Website:                 Globe,
};

function SourceBadge({ source }: { source: string }) {
  const Icon = sourceIconMap[source] ?? Users;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-600 bg-white border border-slate-300 whitespace-nowrap">
      <Icon size={10} className="text-slate-500 flex-shrink-0" />
      {source}
    </span>
  );
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; emoji: string; cls: string }> = {
  Hot:  { label: "HOT",  emoji: "🔥", cls: "bg-orange-100 text-orange-700 border border-orange-200" },
  Warm: { label: "WARM", emoji: "☀️", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  Cold: { label: "COLD", emoji: "❄️", cls: "bg-sky-50 text-sky-600 border border-sky-200" },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const c = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${c.cls}`}>
      <span>{c.emoji}</span>{c.label}
    </span>
  );
}

// ─── Stage status dot badge ───────────────────────────────────────────────────

const stageStatusConfig: Record<OpportunityStage, { color: string; dot: string }> = {
  "Qualified":            { color: "#8B5CF6", dot: "#A78BFA" },
  "Proposal/Price Quote": { color: "#3B82F6", dot: "#60A5FA" },
  "Negotiation/Review":   { color: "#F59E0B", dot: "#FCD34D" },
  "Closed Won":           { color: "#10B981", dot: "#34D399" },
  "Closed Lost":          { color: "#EF4444", dot: "#F87171" },
};

function StageDotBadge({ stage }: { stage: OpportunityStage }) {
  const { color, dot } = stageStatusConfig[stage];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold whitespace-nowrap"
      style={{ color, backgroundColor: color + "15" }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      {stage}
    </span>
  );
}

// ─── Opportunity Stage select ────────────────────────────────────────────────

const STAGE_OPTIONS: OpportunityStage[] = [
  "Qualified",
  "Proposal/Price Quote",
  "Negotiation/Review",
  "Closed Won",
  "Closed Lost",
];

function StageSelect({ value, onChange }: { value: OpportunityStage; onChange: (v: OpportunityStage) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Opportunity Stage
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as OpportunityStage)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium pr-8 focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-1 cursor-pointer"
        >
          {STAGE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
      </div>
    </div>
  );
}

// ─── Activity timeline ────────────────────────────────────────────────────────

const activityDotColor: Record<string, string> = {
  email: "bg-[#002f93]", call: "bg-emerald-500", note: "bg-amber-400", created: "bg-violet-500",
};

function ActivityTimeline({ events }: { events: Opportunity["activities"] }) {
  return (
    <div>
      {events.map((event, idx) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center pt-0.5">
            {idx === 0
              ? <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${activityDotColor[event.type]}`} />
              : <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-slate-300 bg-white" />
            }
            {idx < events.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
          </div>
          <div className="pb-5 flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-snug">{event.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mt-1">{event.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Quote status badge ───────────────────────────────────────────────────────

function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Approved</span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">Rejected</span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Pending</span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">Draft</span>
  );
}

// ─── Quotes section ───────────────────────────────────────────────────────────

interface QuotesSectionProps {
  currentQuote?: { quoteData: NonNullable<Opportunity["quoteData"]>; status: QuoteStatus; rejectionReason?: string } | null;
  history: QuoteRecord[];
  onNewQuote?: () => void;
  /** When true, disables the New / revise control (e.g. revised quote awaiting approval). */
  reviseQuoteDisabled?: boolean;
  /** Shown next to the Quotes heading on negotiation opportunities. */
  negotiationQuoteBadge?: "pending" | "approved" | null;
}

function QuotesSection({
  currentQuote,
  history,
  onNewQuote,
  reviseQuoteDisabled = false,
  negotiationQuoteBadge = null,
}: QuotesSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Build a unified list: current quote first, then history newest-first
  const allRows: Array<{
    id: string;
    subject: string;
    quoteStage: string;
    validDate: string;
    carrier: string;
    status: QuoteStatus;
    rejectionReason?: string;
    isCurrent: boolean;
  }> = [];

  if (currentQuote) {
    allRows.push({
      id: "current",
      subject: currentQuote.quoteData.subject || "—",
      quoteStage: currentQuote.quoteData.quoteStage || "—",
      validDate: currentQuote.quoteData.validDate || "—",
      carrier: currentQuote.quoteData.shippingMethod || "—",
      status: currentQuote.status,
      rejectionReason: currentQuote.rejectionReason,
      isCurrent: true,
    });
  }

  [...history].reverse().forEach((rec) => {
    allRows.push({
      id: rec.id,
      subject: rec.quoteData.subject || "—",
      quoteStage: rec.quoteData.quoteStage || "—",
      validDate: rec.quoteData.validDate || "—",
      carrier: rec.quoteData.shippingMethod || "—",
      status: rec.status,
      rejectionReason: rec.rejectionReason,
      isCurrent: false,
    });
  });

  if (allRows.length === 0 && !onNewQuote) return null;

  return (
    <section className="border-t border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 shrink-0">Quotes</p>
          {negotiationQuoteBadge === "pending" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-amber-100 text-amber-800 border border-amber-200">
              <Clock size={10} className="flex-shrink-0" />
              Quote pending
            </span>
          )}
          {negotiationQuoteBadge === "approved" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={10} className="flex-shrink-0" />
              Quote approved
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onNewQuote && (
            <>
              <button
                type="button"
                disabled={reviseQuoteDisabled}
                onClick={onNewQuote}
                className="px-2.5 py-1 text-[11px] font-semibold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                New
              </button>
              <button
                type="button"
                className="px-2.5 py-1 text-[11px] font-semibold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Edit
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors ml-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-150 ${collapsed ? "" : "rotate-180"}`}>
              <path d="M2 4.5l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {allRows.length === 0 ? (
            <div className="px-5 pb-4 text-[12px] text-slate-400 italic">No quotes yet.</div>
          ) : (
            <div className="overflow-x-auto">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_80px_70px_70px] border-t border-slate-100 bg-slate-50/60">
                <div className="px-5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subject</div>
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Stage</div>
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Valid Until</div>
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</div>
              </div>

              {/* Rows */}
              {allRows.map((row) => (
                <div
                  key={row.id}
                  className={`grid grid-cols-[1fr_80px_70px_70px] border-t border-slate-100 items-start
                    ${row.isCurrent ? "bg-white" : "bg-slate-50/40"}`}
                >
                  <div className="px-5 py-2">
                    <span className="text-[12px] text-[#002f93] hover:underline cursor-pointer font-medium leading-snug block truncate">
                      {row.subject}
                    </span>
                    {row.isCurrent && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Current</span>
                    )}
                    {row.rejectionReason && (
                      <p className="text-[10px] text-red-600 mt-0.5 leading-snug line-clamp-1" title={row.rejectionReason}>
                        {row.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="px-2 py-2 text-[11px] text-slate-600 leading-snug">{row.quoteStage}</div>
                  <div className="px-2 py-2 text-[11px] text-slate-500 leading-snug">{row.validDate}</div>
                  <div className="px-2 py-2">
                    <QuoteStatusBadge status={row.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── Detail cell ──────────────────────────────────────────────────────────────

function DetailCell({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

// ─── Closing date display ─────────────────────────────────────────────────────

function ClosingDateDisplay({ closingDate }: { closingDate: string }) {
  const date = new Date(closingDate);
  const now = new Date();
  const isPast = date < now;
  const isNear = !isPast && (date.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000;

  const displayDate = closingDate.includes("T")
    ? (() => {
        const [datePart, timePart] = closingDate.split("T");
        const [y, m, d] = datePart.split("-");
        return `${m}/${d}/${y} ; ${timePart.slice(0, 5)}`;
      })()
    : closingDate;

  const colorClass = isPast || isNear ? "text-red-500" : "text-slate-700";

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Closing Date</p>
      <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${colorClass}`}>
        <Calendar size={13} className="flex-shrink-0" />
        {displayDate}
      </span>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface OpportunityDetailPanelProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onCreateQuote?: (opp: Opportunity) => void;
}

export function OpportunityDetailPanel({ opportunity, onClose, onCreateQuote }: OpportunityDetailPanelProps) {
  const isOpen = !!opportunity;
  const router = useRouter();
  const [stage, setStage] = useState<OpportunityStage>(
    opportunity?.opportunityStage ?? "Qualified"
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quoteApprovalRequiredOpen, setQuoteApprovalRequiredOpen] = useState(false);

  useEffect(() => {
    if (opportunity) setStage(opportunity.opportunityStage);
  }, [opportunity?.id, opportunity?.opportunityStage]);

  return (
    <>
      {/* Backdrop */}
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
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {!opportunity ? null : (
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
                  <button
                    onClick={() => router.push(`/opportunity/${opportunity.id}`)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Open full view"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => router.push(`/opportunity/${opportunity.id}/edit`)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Edit opportunity"
                  >
                    <Pencil size={16} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowDeleteConfirm((v) => !v)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Delete opportunity"
                    >
                      <Trash2 size={16} />
                    </button>

                    {showDeleteConfirm && (
                      <>
                        <div
                          className="fixed inset-0 z-[60]"
                          onClick={() => setShowDeleteConfirm(false)}
                        />
                        <div className="absolute right-0 top-9 z-[61] w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-4 space-y-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">Delete this opportunity?</p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              This action cannot be undone. All data associated with{" "}
                              <span className="font-medium text-slate-700">{opportunity.opportunityName}</span> will be permanently removed.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                onClose();
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Source + priority badges */}
              <div className="flex items-center gap-1 flex-wrap">
                <SourceBadge source={opportunity.leadSource} />
                <PriorityBadge priority={opportunity.leadPriority} />
              </div>

              {/* Opportunity name */}
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                🏆 {opportunity.opportunityName}
              </h2>

              {/* Avatar + contact + stage dot */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.6" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => router.push(`/contact?search=${encodeURIComponent(opportunity.contactName)}`)}
                    className="text-base font-bold text-slate-900 truncate block hover:text-[#002f93] hover:underline transition-colors text-left w-full"
                  >
                    {opportunity.contactName}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/account?search=${encodeURIComponent(opportunity.accountName)}`)}
                    className="text-sm text-slate-500 truncate block hover:text-[#002f93] hover:underline transition-colors text-left w-full"
                  >
                    {opportunity.accountName}
                  </button>
                  <div className="mt-1">
                    <StageDotBadge stage={opportunity.opportunityStage} />
                  </div>
                </div>
              </div>

              {/* Stage dropdown */}
              <StageSelect
                value={stage}
                onChange={(next) => {
                  if (opportunity && isAdvanceBlockedWithoutApprovedQuote(opportunity, next)) {
                    setQuoteApprovalRequiredOpen(true);
                    return;
                  }
                  setStage(next);
                }}
              />
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Quote status section (Proposal stage only) ── */}
              {opportunity.opportunityStage === "Proposal/Price Quote" &&
                opportunity.quoteStatus &&
                opportunity.quoteStatus !== "none" && (
                <section className="px-5 py-4 border-t border-slate-100 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Quote Status
                  </p>

                  {/* Status badge */}
                  {opportunity.quoteStatus === "pending" && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                      <Clock size={14} className="text-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-amber-700">Pending Approval</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">
                          Quote has been created and is awaiting review.
                        </p>
                      </div>
                    </div>
                  )}
                  {opportunity.quoteStatus === "approved" && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-emerald-700">Approved</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Quote has been approved.</p>
                      </div>
                    </div>
                  )}
                  {opportunity.quoteStatus === "rejected" && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                        <XCircle size={14} className="text-red-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-red-700">Quote Rejected</p>
                          <p className="text-[11px] text-red-500 mt-0.5">
                            This quote was rejected and requires revision.
                          </p>
                        </div>
                      </div>
                      {opportunity.quoteRejectionReason && (
                        <div className="bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-red-400 mb-1">
                            Rejection Reason
                          </p>
                          <p className="text-[12px] text-red-700 leading-relaxed">
                            {opportunity.quoteRejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    {opportunity.quoteStatus === "rejected" && onCreateQuote && (
                      <button
                        type="button"
                        onClick={() => onCreateQuote(opportunity)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-xl bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
                      >
                        <FilePlus size={14} />
                        Create New Quote
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Closing Date + Expected Revenue + Amount */}
              <section className="px-5 py-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <ClosingDateDisplay closingDate={opportunity.closingDate} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Expected Revenue</p>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                      <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
                      {opportunity.expectedRevenue}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Amount</p>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                      <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
                      {opportunity.amount}
                    </span>
                  </div>
                </div>
              </section>

              {/* CONTACT INFORMATION */}
              <section className="px-5 py-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Contact Information
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${opportunity.contactEmail}`} className="text-sm text-[#002f93] hover:underline truncate">
                      {opportunity.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-800">{opportunity.contactPhone}</span>
                  </div>
                </div>
              </section>

              {/* MORE DETAILS */}
              <section className="px-5 py-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  More Details
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <DetailCell label="Opportunity Name"  value={opportunity.opportunityName} />
                  <DetailCell label="Opportunity Owner" value={opportunity.assignedTo} />
                  <DetailCell
                    label="Account Name"
                    value={
                      <button
                        type="button"
                        onClick={() => router.push(`/account?search=${encodeURIComponent(opportunity.accountName)}`)}
                        className="text-[#002f93] hover:underline font-medium text-left leading-snug"
                      >
                        {opportunity.accountName}
                      </button>
                    }
                  />
                  <DetailCell
                    label="Contact Name"
                    value={
                      <button
                        type="button"
                        onClick={() => router.push(`/contact?search=${encodeURIComponent(opportunity.contactName)}`)}
                        className="text-[#002f93] hover:underline font-medium text-left leading-snug"
                      >
                        {opportunity.contactName}
                      </button>
                    }
                  />
                  <DetailCell label="Pipeline"          value={opportunity.pipeline} />
                  <DetailCell label="Business Type"     value={opportunity.businessType} />
                  <DetailCell label="Lead Source"       value={opportunity.leadSource} />
                  <DetailCell label="Created Date"      value={opportunity.createdDate} />
                </div>
              </section>

              {/* NOTE */}
              {opportunity.note && (
                <section className="px-5 py-4 border-t border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Note</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{opportunity.note}</p>
                </section>
              )}

              {/* QUOTES */}
              <QuotesSection
                currentQuote={
                  opportunity.quoteData
                    ? {
                        quoteData: opportunity.quoteData,
                        status: opportunity.quoteStatus ?? "none",
                        rejectionReason: opportunity.quoteRejectionReason,
                      }
                    : null
                }
                history={opportunity.quoteHistory ?? []}
                onNewQuote={onCreateQuote ? () => onCreateQuote(opportunity) : undefined}
                reviseQuoteDisabled={
                  opportunity.opportunityStage === "Negotiation/Review" &&
                  opportunity.quoteRevised === true &&
                  opportunity.quoteStatus === "pending"
                }
                negotiationQuoteBadge={
                  opportunity.opportunityStage === "Negotiation/Review"
                    ? opportunity.quoteRevised === true && opportunity.quoteStatus === "pending"
                      ? "pending"
                      : opportunity.quoteStatus === "approved"
                        ? "approved"
                        : null
                    : null
                }
              />

              {/* ACTIVITY HISTORY */}
              <section className="px-5 py-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                  Activity History
                </p>
                <ActivityTimeline events={opportunity.activities} />
              </section>
            </div>

            {/* ── Sticky footer ── */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
              {opportunity.opportunityStage === "Closed Won" ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] text-slate-500 leading-tight">new customer</p>
                    <button
                      type="button"
                      onClick={() => router.push("/customer-intake/create")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <ArrowRight size={14} className="text-slate-500 flex-shrink-0" />
                      Create customer intake form
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] text-slate-500 leading-tight">Already a customer</p>
                    <button
                      type="button"
                      onClick={() => router.push("/contracts")}
                      className="w-full px-4 py-2.5 text-[13px] font-semibold text-white bg-slate-900 rounded-xl hover:bg-black transition-colors"
                    >
                      Create contract
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full bg-slate-900 hover:bg-black text-white text-sm font-semibold py-3 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <Mail size={15} />
                  Send Email
                </button>
              )}
            </div>
          </>
        )}
      </aside>

      <QuoteApprovalRequiredDialog
        open={quoteApprovalRequiredOpen}
        onClose={() => setQuoteApprovalRequiredOpen(false)}
      />
    </>
  );
}
